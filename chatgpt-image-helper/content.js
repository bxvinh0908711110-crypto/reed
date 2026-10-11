// Chạy trong trang chatgpt.com: nhập prompt, chờ ảnh, tải về.
// Các selector bên dưới có thể cần chỉnh nếu ChatGPT đổi giao diện.
(() => {
  if (window.__cgImageHelper) return;
  window.__cgImageHelper = true;

  let stopFlag = false;
  let running = false;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const setStatus = (status) => chrome.storage.local.set({ status });

  const getInput = () =>
    document.querySelector("#prompt-textarea") ||
    document.querySelector("div[contenteditable='true'][role='textbox']") ||
    document.querySelector("textarea");
  const getSendBtn = () =>
    document.querySelector("[data-testid='send-button']") ||
    document.querySelector("button[aria-label*='Send' i]");
  const getStopBtn = () =>
    document.querySelector("[data-testid='stop-button']") ||
    document.querySelector("button[aria-label*='Stop' i]");

  // Ảnh do AI tạo: lớn, và là ảnh từ backend của ChatGPT / oaiusercontent
  function generatedImages() {
    return [...document.querySelectorAll("main img")].filter((img) => {
      const src = img.currentSrc || img.src || "";
      const big = (img.naturalWidth || img.width) >= 256;
      const fromGpt = /backend-api\/estuary|oaiusercontent|files\.oaiusercontent|\/files\//.test(src);
      return big && fromGpt && !img.closest("[data-message-author-role='user']");
    });
  }

  async function typeAndSend(text) {
    const input = getInput();
    if (!input) throw new Error("Không tìm thấy ô nhập của ChatGPT.");
    input.focus();
    if (input.tagName === "TEXTAREA") {
      input.value = text;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      document.execCommand("selectAll", false);
      document.execCommand("insertText", false, text);
    }
    await sleep(500);
    for (let i = 0; i < 20; i++) {
      const btn = getSendBtn();
      if (btn && !btn.disabled) { btn.click(); return; }
      await sleep(250);
    }
    throw new Error("Nút Gửi không sẵn sàng.");
  }

  // Chờ ChatGPT bắt đầu rồi xong, và có thêm ảnh mới
  async function waitForNewImages(beforeCount, timeoutMs = 5 * 60 * 1000) {
    const start = Date.now();
    let started = false;
    while (Date.now() - start < timeoutMs) {
      if (stopFlag) return [];
      if (getStopBtn()) started = true;
      const imgs = generatedImages();
      if (imgs.length > beforeCount && !getStopBtn() && (started || Date.now() - start > 5000)) {
        await sleep(2500); // chờ ảnh tải xong hẳn
        if (!getStopBtn()) return generatedImages().slice(beforeCount);
      }
      await sleep(1000);
    }
    return [];
  }

  function download(url, filename) {
    return chrome.runtime.sendMessage({ type: "download", url, filename });
  }

  const pad = (n) => String(n).padStart(2, "0");

  async function run({ prompts, prefix, suffix, fname }) {
    if (running) { setStatus("Đang chạy rồi."); return; }
    running = true;
    stopFlag = false;
    let saved = 0;
    try {
      for (let i = 0; i < prompts.length; i++) {
        if (stopFlag) break;
        setStatus(`(${i + 1}/${prompts.length}) Đang gửi prompt…\n${prompts[i]}`);
        const before = generatedImages().length;
        await typeAndSend(`${prefix || ""}${prompts[i]}${suffix || ""}`);
        setStatus(`(${i + 1}/${prompts.length}) Đang chờ ChatGPT tạo ảnh…`);
        const imgs = await waitForNewImages(before);
        if (!imgs.length) {
          setStatus(`(${i + 1}/${prompts.length}) Không thấy ảnh mới (hết thời gian hoặc bị dừng).`);
          if (stopFlag) break;
          continue;
        }
        for (let k = 0; k < imgs.length; k++) {
          const suffixIdx = imgs.length > 1 ? `-${k + 1}` : "";
          await download(imgs[k].currentSrc || imgs[k].src, `${fname}-${pad(i + 1)}${suffixIdx}.png`);
          saved++;
        }
        await sleep(1500);
      }
      setStatus(stopFlag ? `Đã dừng. Đã tải ${saved} ảnh.` : `Xong! Đã tải ${saved} ảnh vào Downloads/ChatGPT-Images.`);
    } catch (e) {
      setStatus(`Lỗi: ${e.message}`);
    } finally {
      running = false;
    }
  }

  async function grab(fname) {
    const imgs = generatedImages();
    if (!imgs.length) { setStatus("Không thấy ảnh nào trên trang."); return; }
    for (let i = 0; i < imgs.length; i++) {
      await download(imgs[i].currentSrc || imgs[i].src, `${fname}-page-${pad(i + 1)}.png`);
    }
    setStatus(`Đã tải ${imgs.length} ảnh trên trang.`);
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "run") run(msg);
    else if (msg.type === "stop") { stopFlag = true; setStatus("Đang dừng…"); }
    else if (msg.type === "grab") grab(msg.fname);
  });
})();
