// Bước 3: chọn tag trong lớp phủ → danh sách bài lọc theo tag (tái dùng màn hình danh sách). Chạy: node tools/patch_search3.mjs
import fs from 'fs';
const F = 'E:/Your English/index.html';
let h = fs.readFileSync(F, 'utf8').split('\r\n').join('\n');
const rep = (a, b) => { const n = h.split(a).length - 1; if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 80)); h = h.replace(a, () => b); };
if (h.includes('let tagMode=')) { console.log('already'); process.exit(0); }
rep('let storiesView=false;', 'let tagMode=null;   /* {key,label}: danh sách bài đang hiển thị là danh sách lọc theo tag (từ ô tìm kiếm) */\nlet storiesView=false;');
rep('const viewKey=()=>ovsEl.classList.contains("on")?"all":(storiesView?"stories":curTopic);', 'const viewKey=()=>ovsEl.classList.contains("on")?"all":(tagMode?"tag":(storiesView?"stories":curTopic));');
rep('(!ov&&b.dataset.k===(storiesView?"stories":curTopic)&&curTopic!=="practice")', '(!ov&&!tagMode&&b.dataset.k===(storiesView?"stories":curTopic)&&curTopic!=="practice")');
// vẽ danh sách theo tag
rep('function renderLessonList(){\n  document.querySelectorAll("#lscChips button")', 'function tagListHTML(){\n  const ids=Search.byTag(searchIdx(),tagMode.key), cards=[];\n  ids.forEach(id=>{\n    const st=STORIES.find(x=>x.id===id);\n    if(st){ cards.push(storyCardHTML(st,cards.length,readSet.has(st.id))); return; }\n    const p=ALL.find(x=>x.id===id); if(!p) return;\n    const k=p.cat, i=topicLessons(k).findIndex(x=>x.id===id);\n    cards.push(lscCardHTML(p,i,i>=topicUnlocked(k),readSet.has(id),cards.length,k));\n  });\n  return `<div class="lscTagHead"><b>#${tagMode.label}</b><span>${cards.length+(cards.length===1?" lesson":" lessons")}</span></div>`+cards.join("");\n}\nfunction renderLessonList(){\n  lscEl.classList.toggle("tagMode",!!tagMode);\n  if(tagMode){ lscGrid.innerHTML=tagListHTML(); markLoaded(lscGrid); return; }\n  document.querySelectorAll("#lscChips button")');
// bấm thẻ trong danh sách theo tag: vào đúng bài (theo chủ đề của bài), bài khoá thì lắc
rep('  const i=+c.dataset.i;\n  if(i>=unlockedCount){', '  if(tagMode){ const k=c.dataset.k, id=+c.dataset.id, i=+c.dataset.i; if(i>=topicUnlocked(k)){ c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake"); return; } closeAllScreens(); goToLesson(k,id); return; }\n  const i=+c.dataset.i;\n  if(i>=unlockedCount){');
rep('function closeLessonList(back){\n  lscEl.classList.remove("on"); storiesView=false;', 'function closeLessonList(back){\n  lscEl.classList.remove("on"); storiesView=false;\n  if(tagMode){ const t=tagMode; tagMode=null; setTimeout(()=>{ if(!lscEl.classList.contains("on")&&!tagMode) lscEl.classList.remove("tagMode"); },340); }');
// bấm tab chủ đề khi đang ở danh sách theo tag: thoát chế độ tag rồi chuyển như bình thường
rep('function switchView(to){\n', 'function switchView(to){\n  if(tagMode){ tagMode=null; renderLessonList(); syncTabs(); }\n');
// mở danh sách theo tag
rep('function openTopicList(k){', 'function openTag(key,label){\n  closeAllScreens(); storiesView=false; tagMode={key,label}; lscFrom="ov"; openLessonList(); syncTabs();\n}\nfunction openTopicList(k){');
// lớp phủ: dòng tag mở danh sách theo tag
const ui = fs.readFileSync('E:/Your English/tools/search_ui.js', 'utf8');
if (!ui.includes('openTag(')) throw new Error('cập nhật tools/search_ui.js trước');
fs.writeFileSync(F, h.split('\n').join('\r\n'));
console.log('ok');
