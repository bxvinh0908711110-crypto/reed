// Liệt kê mọi câu cần giọng đọc (giống cách app gọi speak()) và chưa có trong AUDIO.
// Ghi tools/audio_new.json: [{id, text}] (id tiếp nối a074...). Chạy: node tools/audio_texts.mjs
import fs from 'fs';
const h = fs.readFileSync('E:/Your English/index.html', 'utf8');
const ALL = new Function('return ' + h.match(/const ALL = [^\n]*: (\[[\s\S]*?\n\]);/)[1])();
const AUDIO = JSON.parse(h.match(/const AUDIO=(\{[^\n]*\});/)[1]);
const texts = new Set();
for (const p of ALL) {
  const raw = p.tpl.split(/(?<=[.!?])\s+/).map(t => ({ tpl: t, idx: [...t.matchAll(/\{(\d)\}/g)].map(m => +m[1]) }));
  const slides = []; let pending = [];
  raw.forEach(t => { if (!t.idx.length) pending.push(t); else { if (pending.length) { slides.push({ lines: pending }); pending = []; } slides.push({ lines: [t] }); } });
  if (pending.length) slides.push({ lines: pending });
  const word = (i, up) => up ? p.hl[i].u : p.hl[i].o;
  for (const sl of slides) {
    const idx = sl.lines.flatMap(l => l.idx), joined = sl.lines.map(l => l.tpl).join(' ');
    for (let m = 0; m <= idx.length; m++) {
      const up = new Set(idx.slice(0, m));
      texts.add(joined.replace(/\{(\d)\}/g, (_, i) => word(+i, up.has(+i))));
    }
  }
  texts.add(p.tpl.replace(/\{(\d)\}/g, (_, i) => word(+i, false)));
  texts.add(p.tpl.replace(/\{(\d)\}/g, (_, i) => word(+i, true)));
  p.hl.forEach(x => { texts.add(x.o); texts.add(x.u); });
}
let n = Object.keys(AUDIO).length;
const todo = [...texts].filter(t => !AUDIO[t]).map(t => ({ id: 'a' + String(n++).padStart(3, '0'), text: t }));
fs.writeFileSync('E:/Your English/tools/audio_new.json', JSON.stringify(todo, null, 1));
console.log('tổng câu:', texts.size, '| đã có:', texts.size - todo.length, '| cần tạo:', todo.length, '(x2 giọng)');
