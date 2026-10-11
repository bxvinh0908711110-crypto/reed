// Nhận yêu cầu tải ảnh từ content script và lưu vào Downloads/ChatGPT-Images/
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "download") return;
  const name = msg.filename.replace(/[\\/:*?"<>|]/g, "_");
  chrome.downloads.download(
    { url: msg.url, filename: `ChatGPT-Images/${name}`, conflictAction: "uniquify" },
    (id) => sendResponse({ ok: !chrome.runtime.lastError, id, error: chrome.runtime.lastError?.message })
  );
  return true;
});
