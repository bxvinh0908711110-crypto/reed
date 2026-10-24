// Trang chủ: bấm tab chủ đề mở danh sách chủ đề (không vào thẳng bài) và không tab nào sáng xanh. Chạy: node tools/patch_home_topics.mjs
import fs from 'fs';
const F = 'E:/Your English/index.html';
let h = fs.readFileSync(F, 'utf8').split('\r\n').join('\n');
const rep = (a, b) => { const n = h.split(a).length - 1; if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 80)); h = h.replace(a, () => b); };
if (h.includes('homeNoTab')) { console.log('already'); process.exit(0); }
// 1) bấm tab ở trang chủ → danh sách chủ đề
rep('    if(listOpen()&&!Practice.active){   /* đang ở trang All', '    if(document.body.classList.contains("heroView")&&!listOpen()){ if(Practice.active) Practice.end(); openTopicList(b.dataset.k); return; }   /* trang chủ: sang danh sách của chủ đề, không vào thẳng bài */\n    if(listOpen()&&!Practice.active){   /* đang ở trang All');
// 2) không tab nào sáng ở trang chủ
rep('function syncTabs(){   /* tab "All" sáng khi đang ở trang tổng quan; tab chủ đề sáng khi không ở đó */\n  const ov=!ovsEl.hidden&&ovsEl.classList.contains("on");\n  document.querySelectorAll("#topics button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.all?ov:(',
  'function syncTabs(){   /* tab "All" sáng khi đang ở trang tổng quan; tab chủ đề sáng khi không ở đó; ở trang chủ không tab nào sáng */\n  const ov=!ovsEl.hidden&&ovsEl.classList.contains("on");\n  const homeNoTab=document.body.classList.contains("heroView")&&!ov&&!document.body.classList.contains("listOpen");\n  document.querySelectorAll("#topics button").forEach(b=>b.setAttribute("aria-pressed",homeNoTab?false:b.dataset.all?ov:(');
// 3) heroView đổi → đồng bộ tab
rep('  document.body.classList.toggle("heroView",scrollY<heroEnd-6);', '  { const hv=scrollY<heroEnd-6; document.body.classList.toggle("heroView",hv); if(hv!==window.__hv){ window.__hv=hv; try{ syncTabs(); }catch(e){} } }');
rep('renderLessonList(); document.body.classList.add("listOpen"); lscPlace();','renderLessonList(); document.body.classList.add("listOpen"); syncTabs(); lscPlace();');
fs.writeFileSync(F, h.split('\n').join('\r\n'));
console.log('ok');
