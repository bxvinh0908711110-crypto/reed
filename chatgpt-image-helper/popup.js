const $ = (id) => document.getElementById(id);
const fields = ["prompts", "prefix", "suffix", "fname"];

chrome.storage.local.get(fields, (saved) => {
  for (const f of fields) if (saved[f] !== undefined) $(f).value = saved[f];
});
for (const f of fields) $(f).addEventListener("input", () => chrome.storage.local.set({ [f]: $(f).value }));

async function send(msg) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !/^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(tab.url)) {
    $("status").textContent = "Hãy mở tab chatgpt.com (đã đăng nhập) rồi bấm lại.";
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id, msg);
  } catch {
    $("status").textContent = "Chưa kết nối được trang. Tải lại tab ChatGPT (F5) rồi thử lại.";
  }
}

$("start").onclick = () => {
  const prompts = $("prompts").value.split("\n").map((s) => s.trim()).filter(Boolean);
  if (!prompts.length) { $("status").textContent = "Chưa có prompt nào."; return; }
  send({ type: "run", prompts, prefix: $("prefix").value, suffix: $("suffix").value, fname: $("fname").value.trim() || "image" });
};
$("stop").onclick = () => send({ type: "stop" });
$("grab").onclick = () => send({ type: "grab", fname: $("fname").value.trim() || "image" });

function showStatus() {
  chrome.storage.local.get("status", ({ status }) => { if (status) $("status").textContent = status; });
}
showStatus();
chrome.storage.onChanged.addListener((c) => { if (c.status) $("status").textContent = c.status.newValue; });
