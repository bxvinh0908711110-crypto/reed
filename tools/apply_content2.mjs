// Thêm bài Health + Tech vào index.html (nối vào cuối mảng ALL). Chạy 1 lần: node tools/apply_content2.mjs
import fs from 'fs';
const FILE = 'E:/Your English/index.html';
let s = fs.readFileSync(FILE, 'utf8');
const P = (o, u, vn, ex) => ({ o, u, lv: 'A2', vn, ex });
const ADD = [
  { topic: 'Good Morning, Good Health', level: 'A1', scene: 'morning', cat: 'health',
    tpl: 'Many people do not {0} that a good morning can give them energy for {1}. We {2} people to get up early in the morning and see {3}. They {4} after they get up. They can also drink some water and eat a healthy breakfast. They {5} their day {6} energy.',
    hl: [
      P('know', 'realize', 'to suddenly understand something', 'I realize I forgot my keys.'),
      P('the afternoon and evening', 'the rest of the day', 'everything that is left of today', 'I felt tired for the rest of the day.'),
      P('tell', 'advise', 'to give a helpful suggestion', 'Doctors advise us to sleep early.'),
      P('the sun come up', 'the sunrise', 'one word for the sun coming up', 'We watched the sunrise from the hill.'),
      P('can have some exercise', 'do some exercises', 'the natural way to say you exercise', 'I do some exercises every morning.'),
      P('start', 'begin', "a slightly more formal way to say 'start'", 'We begin class at eight.'),
      P('with a lot of', 'full of', 'describes something that has plenty', 'The room is full of people.')] },
  { topic: 'Technology In Our Life', level: 'A1', scene: 'tech', cat: 'tech',
    tpl: 'Technology is an important part of our {0}. We use our phones to {1} friends and family every day. We also use computers to study, work, and {2} information. Many people {3} or {4} on their phones. Technology helps us do many things more easily.',
    hl: [
      P('everyday life', 'daily life', 'the usual way to say life every day', 'Phones are part of daily life.'),
      P('contact', 'stay in touch with', 'to keep talking to people over time', 'I stay in touch with my old classmates.'),
      P('find', 'search for', 'to look for something on purpose', 'I search for recipes online.'),
      P('see videos', 'watch videos', "'watch' is the natural verb for videos", 'We watch videos after dinner.'),
      P('hear music', 'listen to music', "'listen to' means you pay attention to sounds", 'I listen to music on the bus.')] }
];
const m = s.match(/const ALL = [^\n]*: (\[[\s\S]*?\n\]);/);
const cur = new Function('return ' + m[1])();
if (cur.some(p => p.cat === 'health')) throw new Error('đã có bài Health, dừng để tránh trùng');
const all = [...cur, ...ADD].map((p, i) => ({ ...p, id: i + 1 }));
const ser = all.map(p => { const { id, topic, level, scene, cat, tpl, hl, ...rest } = p;
  return '{ ' + [`id:${id}`, `topic:${JSON.stringify(topic)}`, `level:${JSON.stringify(level)}`, `scene:${JSON.stringify(scene)}`, `cat:${JSON.stringify(cat)}`, `tpl:${JSON.stringify(tpl)}`].join(', ') + ',\n  hl:[\n' + hl.map(h => '   ' + JSON.stringify(h)).join(',\n') + '\n  ]}'; }).join(',\n');
s = s.replace(m[0], m[0].slice(0, m[0].indexOf(m[1])) + '[\n' + ser + '\n];');

const SC = `morning:\`<svg class="scene" viewBox="0 0 400 200" role="img" aria-label="Sunrise, water and a healthy breakfast">
<rect width="400" height="200" fill="#ffe6c4"/><circle cx="200" cy="128" r="64" fill="#ffd66b"/>
<g stroke="#ffb84d" stroke-width="5" stroke-linecap="round"><path d="M200 36v16M130 58l10 12M270 58l-10 12M92 100l14 6M308 100l-14 6"/></g>
<rect y="130" width="400" height="70" fill="#8fd14f"/><path d="M0 130q100-28 200-10t200-4v14H0z" fill="#7fc040"/>
<g transform="translate(40,118)"><path d="M0 0h38l-4 52a8 8 0 0 1-8 7H12a8 8 0 0 1-8-7z" fill="#bfe3f2" stroke="#3f8fd6" stroke-width="4"/><path d="M5 22h28" stroke="#3f8fd6" stroke-width="3"/></g>
<g transform="translate(300,132)"><ellipse cx="44" cy="30" rx="44" ry="14" fill="#fff" stroke="#c9b79c" stroke-width="3"/><circle cx="28" cy="20" r="11" fill="#e4715a"/><circle cx="52" cy="18" r="10" fill="#ffb84d"/><circle cx="68" cy="26" r="8" fill="#7bc77e"/></g>
</svg>\`,
tech:\`<svg class="scene" viewBox="0 0 400 200" role="img" aria-label="Phone and laptop">
<rect width="400" height="200" fill="#dfe8fb"/><rect y="150" width="400" height="50" fill="#b9c8ea"/>
<g transform="translate(60,48)"><rect width="170" height="106" rx="9" fill="#2b2622"/><rect x="9" y="9" width="152" height="88" rx="4" fill="#bfe3f2"/><circle cx="85" cy="53" r="20" fill="#fff"/><path d="M79 43l16 10-16 10z" fill="#e4715a"/><path d="M-14 106h198l-18 16H4z" fill="#8a8580"/></g>
<g transform="translate(262,40)"><rect width="74" height="132" rx="14" fill="#2b2622"/><rect x="7" y="14" width="60" height="100" rx="6" fill="#fff"/><circle cx="37" cy="124" r="4" fill="#8a8580"/><circle cx="24" cy="38" r="9" fill="#7bc77e"/><rect x="38" y="32" width="22" height="6" rx="3" fill="#ffb84d"/><rect x="38" y="42" width="16" height="6" rx="3" fill="#ffb84d"/><path d="M16 70q21-26 42 0" stroke="#3f8fd6" stroke-width="4" fill="none"/><path d="M24 80q13-14 26 0" stroke="#3f8fd6" stroke-width="4" fill="none"/></g>
</svg>\`,
`;
s = s.replace('const scenes = {\n', 'const scenes = {\n' + SC);
s = s.replace('"My Weekend":"lifestyle"};', '"My Weekend":"lifestyle","Good Morning, Good Health":"health","Technology In Our Life":"tech"};');
fs.writeFileSync(FILE, s);
console.log('lessons now:', all.length);
