// Ghép các câu mới (tools/audio_new.json) vào bảng AUDIO trong index.html, sau khi đã tạo đủ file mp3.
// Chạy: node tools/audio_apply.mjs
import fs from 'fs';
const FILE = 'E:/Your English/index.html';
let h = fs.readFileSync(FILE, 'utf8');
const todo = JSON.parse(fs.readFileSync('E:/Your English/tools/audio_new.json', 'utf8'));
const miss = todo.filter(t => !fs.existsSync(`E:/Your English/deploy/audio/female/${t.id}.mp3`) || !fs.existsSync(`E:/Your English/deploy/audio/male/${t.id}.mp3`));
if (miss.length) { console.log('THIẾU file cho', miss.length, 'câu, dừng.'); process.exit(1); }
const m = h.match(/const AUDIO=(\{[^\n]*\});/);
const A = JSON.parse(m[1]);
todo.forEach(t => { A[t.text] = t.id; });
h = h.replace(m[0], 'const AUDIO=' + JSON.stringify(A) + ';');
fs.writeFileSync(FILE, h);
console.log('AUDIO:', Object.keys(A).length, 'câu');
