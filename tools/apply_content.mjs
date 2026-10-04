// Nhập nội dung từ Content.md vào index.html (mảng ALL + scenes mới). Chạy: node tools/apply_content.mjs
import fs from 'fs';
const FILE = 'E:/Your English/index.html';
let s = fs.readFileSync(FILE, 'utf8');

/* ---------- 1) Bài mới (từ Content.md). Thứ tự = vị trí (position) ---------- */
const P = (o, u, vn, ex) => ({ o, u, lv: 'A2', vn, ex });
const NEW = [
  { topic: 'My Family', level: 'A1', scene: 'family', cat: 'family',
    tpl: 'My name is Anna. I live with my {0} in a nice house. My {1} also live with us. Every evening, we eat dinner together and {2} about our day. I love my family {3}.',
    hl: [
      P('father and mother', 'parents', 'a single word for mother and father together', 'My parents live in Hanoi.'),
      P('sister and brother', 'siblings', 'a single word for your brothers and sisters', 'I have two siblings.'),
      P('talk', 'chat', "a relaxed way to say 'talk'", 'We chat about our day.'),
      P('very much', 'a lot', 'a natural way to say how much you love someone', 'I miss you a lot.')] },
  { topic: 'Best Friend', level: 'A1', scene: 'friends', cat: 'friends',
    tpl: 'Do you have a best friend? I do. My best friend is John. We {0} games, food and animals. I am {1} to {2}.',
    hl: [
      P('like the same things about', 'have a lot in common, such as', 'a natural way to say you share interests', 'We have a lot in common, such as music and movies.'),
      P('so happy', 'really happy', "a more natural way to strengthen 'happy'", 'I am really happy today.'),
      P('have a friend like him', 'have such a friend', "a shorter way to say 'a friend like him'", 'I am lucky to have such a friend.')] },
  { topic: 'Where is my school?', level: 'A1', scene: 'school', cat: 'school',
    tpl: 'Hello, I am Vy and I am a student at a new school. Every morning, I {0} with my best friend. My school is near {1}, so we {2} together {3}. There are many {4} {5}. {6} where my school is?',
    hl: [
      P('go to school by foot', 'walk to school', "one verb instead of 'go ... by foot'", 'I walk to work every day.'),
      P('a place where we can have fun', 'a playground', 'one word for a place where children play', 'The kids are at the playground.'),
      P('can play', 'often play there', 'tells how often and where', 'We often play there on Sundays.'),
      P('after we study at school', 'after school', 'shorter and more natural', 'I meet my friends after school.'),
      P('trees', 'green trees', 'adds a clear picture', 'We sat under the green trees.'),
      P('along the way I go to school', 'along the road to my school', 'a clearer way to describe the road', 'There are shops along the road to my house.'),
      P('Do you know', 'Do you have an idea', 'a friendly way to ask someone to guess', 'Do you have an idea where the park is?')] },
  { topic: 'Love what you do', level: 'A1', scene: 'work', cat: 'work',
    tpl: 'Tom {0} at a small coffee shop. He {1} making drinks for customers. {2} he likes talking with them and {3} love his coffee. When customers {4} the coffee shop, they always feel happy because they can {5}. This is why Tom loves what he does.',
    hl: [
      P('has a job', 'works', 'the usual verb for having a job', 'My sister works at a bank.'),
      P('likes', 'enjoys', "a warmer way to say 'like'", 'He enjoys cooking.'),
      P('One more thing is', 'Also,', 'a short way to add another point', 'Also, the food is cheap.'),
      P('people', 'many customers', 'names exactly who is talking about it', 'Many customers come back every week.'),
      P('go to', 'drop by', 'a casual way to say visit for a short time', 'Drop by my house anytime.'),
      P('have good coffee', 'drink good coffee', "'drink' is the natural verb for coffee", 'I drink coffee every morning.')] },
  { topic: 'My Weekend', level: 'A1', scene: 'weekend', cat: 'lifestyle',
    tpl: 'I often {0} early on Saturday mornings. I {1} with my family in the kitchen. And then, I {2}. In the afternoon, I {3} at a supermarket near my house. I {4} my weekend.',
    hl: [
      P('get up', 'wake up', 'a natural way to say you stop sleeping', 'I wake up at six every day.'),
      P('eat breakfast', 'have breakfast', "'have' is the common verb for meals", 'We have breakfast at seven.'),
      P('put my clothes into the washing machine', 'do laundry', 'one phrase for washing clothes', 'I do laundry on Sundays.'),
      P('go and buy things', 'go shopping', 'the common phrase for buying things', 'We go shopping on Saturdays.'),
      P('like', 'enjoy', "a warmer way to say 'like'", 'I enjoy my weekend.')] }
];

/* ---------- 2) Giữ 2 bài cũ có sẵn giọng đọc (Going to School, My Hobbies); bỏ My Family cũ (đã có bản mới) ---------- */
const m = s.match(/const ALL = [^\n]*: (\[[\s\S]*?\n\]);/);
const old = new Function('return ' + m[1])();
const keep = old.filter(p => p.topic !== 'My Family');
const all = [...NEW, ...keep].map((p, i) => ({ id: i + 1, ...p }));
// serialise gọn: mỗi bài một khối
const ser = all.map(p => '{ ' + Object.entries(p).filter(([k]) => k !== 'hl').map(([k, v]) => `${k}:${JSON.stringify(v)}`).join(', ') + ',\n  hl:[\n' +
  p.hl.map(h => '   ' + JSON.stringify(h)).join(',\n') + '\n  ]}').join(',\n');
s = s.replace(m[0], m[0].slice(0, m[0].indexOf(m[1])) + '[\n' + ser + '\n];');

/* ---------- 3) Ảnh minh hoạ mới ---------- */
const SC = `friends:\`<svg class="scene" viewBox="0 0 400 200" role="img" aria-label="Two best friends with games, food and a pet">
<rect width="400" height="200" fill="#fde7c8"/><rect y="150" width="400" height="50" fill="#e8b774"/>
<circle cx="345" cy="45" r="22" fill="#ffd66b"/>
<g><rect x="120" y="95" width="46" height="70" rx="16" fill="#3f8fd6"/><circle cx="143" cy="72" r="24" fill="#f1c19a"/><rect x="128" y="160" width="12" height="22" rx="4" fill="#2b4f7a"/><rect x="146" y="160" width="12" height="22" rx="4" fill="#2b4f7a"/></g>
<g><rect x="234" y="95" width="46" height="70" rx="16" fill="#7bc77e"/><circle cx="257" cy="72" r="24" fill="#f1c19a"/><rect x="242" y="160" width="12" height="22" rx="4" fill="#3f7a42"/><rect x="260" y="160" width="12" height="22" rx="4" fill="#3f7a42"/></g>
<path d="M160 118l30-6M240 118l-30-6" stroke="#f1c19a" stroke-width="9" stroke-linecap="round"/>
<g transform="translate(176,100)"><rect width="48" height="26" rx="12" fill="#2b2622"/><circle cx="14" cy="13" r="4" fill="#fff"/><path d="M32 8v10M27 13h10" stroke="#ffd66b" stroke-width="3"/></g>
<path d="M200 60c-8-14-26-2-14 10l14 14 14-14c12-12-6-24-14-10z" fill="#e4715a"/>
<g transform="translate(40,140)"><ellipse cx="22" cy="26" rx="22" ry="16" fill="#ffb84d"/><circle cx="22" cy="8" r="12" fill="#ffb84d"/><path d="M12 -2l-4-8 10 4M32 -2l4-8-10 4" fill="#ffb84d"/></g>
</svg>\`,
work:\`<svg class="scene" viewBox="0 0 400 200" role="img" aria-label="A small coffee shop">
<rect width="400" height="200" fill="#f3dfc6"/><rect y="150" width="400" height="50" fill="#a8704a"/>
<rect x="0" y="0" width="400" height="38" fill="#e4715a"/>
<g fill="#fff"><path d="M0 38h50v10q-25 12-50 0zM50 38h50v10q-25 12-50 0zM100 38h50v10q-25 12-50 0zM150 38h50v10q-25 12-50 0zM200 38h50v10q-25 12-50 0zM250 38h50v10q-25 12-50 0zM300 38h50v10q-25 12-50 0zM350 38h50v10q-25 12-50 0z"/></g>
<rect x="30" y="110" width="340" height="70" rx="8" fill="#7a4a2b"/><rect x="24" y="102" width="352" height="14" rx="6" fill="#a8704a"/>
<g transform="translate(60,52)"><rect width="70" height="52" rx="6" fill="#2b2622"/><rect x="8" y="8" width="54" height="14" rx="3" fill="#ffd66b"/><rect x="26" y="34" width="18" height="18" rx="3" fill="#8a8580"/></g>
<g transform="translate(168,70)"><path d="M0 12h60l-6 38a8 8 0 0 1-8 7H14a8 8 0 0 1-8-7z" fill="#fff" stroke="#7a4a2b" stroke-width="4"/><path d="M60 20h8a10 10 0 0 1 0 22h-8" fill="none" stroke="#7a4a2b" stroke-width="4"/><path d="M18 2q-6-10 0-18M32 2q-6-10 0-18M46 2q-6-10 0-18" stroke="#c9b79c" stroke-width="3" fill="none" stroke-linecap="round"/></g>
<g transform="translate(278,62)"><rect width="76" height="38" rx="8" fill="#3f8fd6"/><text x="38" y="26" font-family="Inter,Arial,sans-serif" font-size="20" font-weight="800" text-anchor="middle" fill="#fff">OPEN</text></g>
</svg>\`,
weekend:\`<svg class="scene" viewBox="0 0 400 200" role="img" aria-label="Laundry and shopping on the weekend">
<rect width="400" height="200" fill="#d6edf8"/><circle cx="348" cy="40" r="22" fill="#ffd66b"/><rect y="150" width="400" height="50" fill="#c9d8b0"/>
<g transform="translate(50,56)"><rect width="104" height="110" rx="12" fill="#fff" stroke="#8a8580" stroke-width="4"/><rect x="10" y="10" width="84" height="18" rx="5" fill="#e4e4e4"/><circle cx="26" cy="19" r="4" fill="#e4715a"/><circle cx="52" cy="68" r="31" fill="#bfe3f2" stroke="#8a8580" stroke-width="5"/><path d="M30 70q11-12 22 0t22 0" stroke="#3f8fd6" stroke-width="4" fill="none"/></g>
<g transform="translate(220,84)"><path d="M0 10h130l-14 70a10 10 0 0 1-10 8H24a10 10 0 0 1-10-8z" fill="#ffb84d" stroke="#a8402e" stroke-width="4"/><path d="M26 10c0-26 12-40 39-40s39 14 39 40" fill="none" stroke="#a8402e" stroke-width="5"/><circle cx="40" cy="4" r="14" fill="#e4715a"/><rect x="62" y="-14" width="26" height="30" rx="5" fill="#7bc77e"/><rect x="92" y="-2" width="22" height="22" rx="4" fill="#fff" stroke="#a8402e" stroke-width="3"/></g>
</svg>\`,
`;
s = s.replace('const scenes = {\n', 'const scenes = {\n' + SC);
s = s.replace('${scenes[p.scene].replace(', '${(scenes[p.scene]||scenes.hobbies).replace(');
// loader: nhãn chủ đề dự phòng
s = s.replace('const TITLE_CAT={"My Hobbies":"lifestyle","Going to School":"school","My Family":"family"};',
  'const TITLE_CAT={"My Hobbies":"lifestyle","Going to School":"school","My Family":"family","Best Friend":"friends","Where is my school?":"school","Love what you do":"work","My Weekend":"lifestyle"};');
fs.writeFileSync(FILE, s);
console.log('lessons:', all.length);
