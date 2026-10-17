/* Reed: service worker (học offline).
   - Khung app (index, ảnh, phông, icon): lưu sẵn khi cài; trang chính luôn thử mạng trước (tối đa 4s) rồi mới dùng bản đã lưu.
   - Âm thanh mp3: lưu lần nghe đầu tiên và có thể tải sẵn hàng loạt (app gửi danh sách qua postMessage). Hỗ trợ yêu cầu Range (Safari).
   - Dữ liệu bài từ Supabase (khác nguồn) không đi qua đây: app tự có cơ chế dự phòng (localStorage + dữ liệu nhúng).
   Khi đổi index.html/ảnh/phông/icon: tăng VERSION. Khi tạo lại âm thanh cho cùng một tên file: tăng AUDIO_CACHE. */
const VERSION = "reed-v1";
const SHELL = VERSION + "-shell";
const AUDIO_CACHE = "reed-audio-v1";
const SHELL_FILES = [
  "index.html", "manifest.webmanifest", "reed-icon.svg",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png",
  "fonts/inter-latin.woff2", "fonts/inter-vietnamese.woff2", "fonts/inter-latin-ext.woff2",
  "img/hero.webp", "img/hero-sm.webp", "img/family.webp", "img/friends.webp", "img/school.webp", "img/work.webp",
  "img/weekend.webp", "img/health.webp", "img/tech.webp", "img/welcome.webp"
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.add("index.html");   /* bắt buộc: không có thì cài thất bại */
    await Promise.allSettled(SHELL_FILES.filter(f => f !== "index.html").map(f => cache.add(f)));   /* các file phụ thiếu cũng không làm hỏng việc cài */
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keep = new Set([SHELL, AUDIO_CACHE]);
    for (const k of await caches.keys()) if (k.startsWith("reed-") && !keep.has(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

const same = req => new URL(req.url).origin === location.origin;
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

async function navigate(req) {
  const cache = await caches.open(SHELL);
  try {
    const net = await withTimeout(fetch(req), 4000);
    if (net && net.ok && net.status === 200) cache.put("index.html", net.clone());
    return net;
  } catch (err) {
    const hit = await cache.match("index.html");
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req) {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const net = await fetch(req);
  if (net && net.ok && net.status === 200) { const c = await caches.open(SHELL); c.put(req, net.clone()); }
  return net;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(req, { ignoreSearch: true });
  const net = fetch(req).then(r => { if (r && r.ok && r.status === 200) cache.put(req, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || Response.error();
}

/* trả về một đoạn byte của file đã lưu (Safari luôn hỏi âm thanh bằng Range) */
async function rangeFrom(resp, range) {
  const buf = await resp.arrayBuffer(), len = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range || "");
  if (!m) return new Response(buf, { status: 200, headers: { "Content-Type": resp.headers.get("Content-Type") || "audio/mpeg", "Content-Length": String(len), "Accept-Ranges": "bytes" } });
  let s = m[1] === "" ? NaN : +m[1], e = m[2] === "" ? NaN : +m[2];
  if (isNaN(s)) { s = Math.max(0, len - e); e = len - 1; } else if (isNaN(e) || e >= len) e = len - 1;
  if (s > e || s >= len) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + len } });
  return new Response(buf.slice(s, e + 1), { status: 206, headers: {
    "Content-Type": resp.headers.get("Content-Type") || "audio/mpeg", "Content-Range": `bytes ${s}-${e}/${len}`,
    "Content-Length": String(e - s + 1), "Accept-Ranges": "bytes" } });
}

async function audio(req) {
  const cache = await caches.open(AUDIO_CACHE), key = new Request(req.url), range = req.headers.get("range");
  const hit = await cache.match(key);
  if (hit) return range ? rangeFrom(hit, range) : hit;
  try {
    const full = await fetch(key);   /* chưa có: tải bản đầy đủ (file nhỏ), lưu lại, rồi trả đúng phần được hỏi */
    if (full.ok && full.status === 200) { cache.put(key, full.clone()); return range ? rangeFrom(full, range) : full; }
    return full;
  } catch (err) { return fetch(req); }
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !same(req)) return;
  if (req.mode === "navigate") { e.respondWith(navigate(req)); return; }
  const p = new URL(req.url).pathname;
  if (/\/audio\/(female|male)\/[^/]+\.mp3$/.test(p)) e.respondWith(audio(req));
  else if (/\/(img|fonts|icons)\//.test(p)) e.respondWith(cacheFirst(req));
  else if (/manifest\.webmanifest$|reed-icon\.svg$/.test(p)) e.respondWith(staleWhileRevalidate(req));
});

/* tải sẵn âm thanh: app gửi danh sách url; báo tiến độ về mọi cửa sổ đang mở */
async function precacheAudio(urls) {
  const cache = await caches.open(AUDIO_CACHE);
  const todo = [];
  for (const u of urls) if (!(await cache.match(new Request(u)))) todo.push(u);
  const total = todo.length; let done = 0, fail = 0;
  const say = async (type) => { for (const c of await self.clients.matchAll()) c.postMessage({ type, done, total, fail }); };
  if (!total) { await say("AUDIO_DONE"); return; }
  await say("AUDIO_PROGRESS");
  const worker = async () => {
    while (todo.length) {
      const u = todo.shift();
      try { const r = await fetch(u); if (r.ok && r.status === 200) await cache.put(new Request(u), r); else fail++; } catch (err) { fail++; }
      done++; if (done % 12 === 0 || done === total) await say("AUDIO_PROGRESS");
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  await say("AUDIO_DONE");
}

self.addEventListener("message", e => {
  const d = e.data || {};
  if (d.type === "SKIP_WAITING") self.skipWaiting();
  else if (d.type === "PRECACHE_AUDIO" && Array.isArray(d.urls)) e.waitUntil(precacheAudio(d.urls));
  else if (d.type === "AUDIO_STATUS" && Array.isArray(d.urls)) e.waitUntil((async () => {
    const cache = await caches.open(AUDIO_CACHE); let have = 0;
    for (const u of d.urls) if (await cache.match(new Request(u))) have++;
    if (e.source) e.source.postMessage({ type: "AUDIO_STATUS", have, total: d.urls.length });
  })());
});
