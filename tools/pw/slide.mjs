// Hiệu ứng trượt khi chuyển chủ đề (đọc bài, trang All, danh sách bài) theo hướng của thanh chủ đề. Chạy: node tools/pw/slide.mjs
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch();
for(const [name,opts] of [['mobile',{viewport:{width:390,height:844},isMobile:true,hasTouch:true}],['desktop',{viewport:{width:1280,height:720}}]]){
  console.log('--',name);
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  ok(!(await p.evaluate(()=>LITE)),'không ở chế độ nhẹ (hiệu ứng được bật)');
  // 1. đang đọc: sang chủ đề bên PHẢI (family → friends) rồi bên TRÁI
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1300);
  const dirs=[];
  await p.evaluate(()=>document.querySelector('#topics [data-k=friends]').click()); await p.waitForTimeout(60); dirs.push(await p.evaluate(()=>document.querySelector('#main').style.getPropertyValue('--tdir'))); await p.waitForTimeout(1200);
  await p.evaluate(()=>document.querySelector('#topics [data-k=family]').click()); await p.waitForTimeout(60); dirs.push(await p.evaluate(()=>document.querySelector('#main').style.getPropertyValue('--tdir'))); await p.waitForTimeout(1200);
  ok(dirs[0]==='1'&&dirs[1]==='-1','đọc bài: sang tab bên phải trượt +1, sang tab bên trái trượt -1 '+JSON.stringify(dirs));
  ok(await p.evaluate(()=>getComputedStyle(document.querySelector('#main')).transitionProperty.includes('transform')),'#main có chuyển động transform');
  // 2. pager: bấm tab → trang bên cạnh (đã dựng sẵn) và trang hiện tại trượt cùng hướng, xong thì đổi thật và gỡ trang phụ
  const pager=async(clickSel,expect)=>{
    await p.evaluate(sel=>document.querySelector(sel).click(),clickSel); await p.waitForTimeout(90);
    const mid=await p.evaluate(()=>({ghosts:document.querySelectorAll('.pgGhost').length,anims:[...document.querySelectorAll('.pgGhost,#overviewScreen,#lessonScreen')].reduce((n,e)=>n+e.getAnimations().length,0),title:document.querySelector('.pgGhost')?[...document.querySelectorAll('.pgGhost .lscTitle,.pgGhost .ovName')].slice(0,1).map(x=>x.textContent)[0]:null}));
    await p.waitForTimeout(650);
    const end=await p.evaluate(()=>({ghosts:document.querySelectorAll('.pgGhost').length,anims:[ovsEl,lscEl].reduce((n,e)=>n+e.getAnimations().length,0),commit:document.body.classList.contains('pgCommit'),key:viewKey(),tf:[ovsEl.style.transform,lscEl.style.transform]}));
    return {mid,end,ok:mid.ghosts===1&&mid.anims>=2&&end.ghosts===0&&end.anims===0&&!end.commit&&end.key===expect&&end.tf.every(x=>!x)};
  };
  await p.evaluate(()=>document.querySelector('#topics [data-all]').click()); await p.waitForTimeout(900);
  let r=await pager('#topics [data-k=school]','school'); ok(r.ok,'All → School: trang School đã dựng sẵn trượt vào cùng lúc, xong thì gỡ trang phụ '+JSON.stringify(r));
  r=await pager('#topics [data-k=friends]','friends'); ok(r.ok&&await p.evaluate(()=>curTopic==='friends'),'School → Friends (sang trái) '+JSON.stringify(r.end));
  r=await pager('#topics [data-k=stories]','stories'); ok(r.ok&&await p.evaluate(()=>storiesView),'sang Stories');
  r=await pager('#topics [data-all]','all'); ok(r.ok&&await p.evaluate(()=>ovsEl.classList.contains('on')&&!lscEl.classList.contains('on')),'về trang All');
  // 3. bấm 3 tab liên tiếp nhanh: chỉ lần đầu chạy, các lần sau bị bỏ qua khi đang trượt, kết thúc ở trạng thái sạch
  await p.evaluate(()=>{ document.querySelector('#topics [data-k=family]').click(); document.querySelector('#topics [data-k=friends]').click(); document.querySelector('#topics [data-k=school]').click(); }); await p.waitForTimeout(1200);
  ok(await p.evaluate(()=>document.querySelectorAll('.pgGhost').length===0&&!document.body.classList.contains('pgCommit')&&[ovsEl,lscEl].every(e=>!e.style.transform&&e.getAnimations().length===0)),'bấm liên tiếp: không còn trang phụ / animation / transform treo (đang ở '+await p.evaluate(()=>viewKey())+')');
  // 4. hiệu ứng chạy xong thì không để lại trạng thái (opacity/transform)
  ok(await p.evaluate(()=>{ const c=getComputedStyle(lscGrid); return c.opacity==='1'&&lscGrid.getAnimations().length===0; }),'xong hiệu ứng: nội dung về trạng thái bình thường, không còn animation');
  ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:'')); await ctx.close();
}
// 4b. KÉO bằng ngón tay (cảm ứng thật qua CDP): trang bên cạnh đi theo ngón tay, thả xa → sang, thả gần → quay lại
{ const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  const T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  const mv=async(x1,x2,y,steps=8,dt=16)=>{ for(let i=1;i<=steps;i++){ await T('touchMove',x1+(x2-x1)*i/steps,y); await p.waitForTimeout(dt);} };
  console.log('-- kéo bằng ngón tay');
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(900);
  await T('touchStart',300,500); await mv(300,180,500); await p.waitForTimeout(80);
  const mid=await p.evaluate(()=>{ const g=document.querySelector('.pgGhost'); return {ghost:!!g,host:ovsEl.style.transform,gt:g&&g.style.transform,title:g&&g.querySelector('.lscTitle')&&g.querySelector('.lscTitle').textContent,key:viewKey()}; });
  ok(mid.ghost&&mid.host==='translateX(-120px)'&&mid.gt==='translateX(270px)'&&mid.key==='all','đang kéo 120px: trang All đi theo ngón tay, trang Family dựng sẵn ở bên phải (270px) '+JSON.stringify(mid));
  await T('touchEnd'); await p.waitForTimeout(700);
  ok(await p.evaluate(()=>viewKey()==='family'&&lscEl.classList.contains('on')&&!document.querySelector('.pgGhost')),'thả (xa hơn 28%): sang trang Family, gỡ trang phụ');
  await T('touchStart',300,500); await mv(300,270,500); await T('touchEnd'); await p.waitForTimeout(600);
  ok(await p.evaluate(()=>viewKey()==='family'&&!document.querySelector('.pgGhost')&&!lscEl.style.transform),'kéo ngắn (30px) rồi thả: quay lại, vẫn ở Family');
  await T('touchStart',100,500); await mv(100,330,500,8,12); await T('touchEnd'); await p.waitForTimeout(700);
  ok(await p.evaluate(()=>viewKey()==='all'&&ovsEl.classList.contains('on')),'kéo sang phải: về trang All');
  await T('touchStart',100,500); await mv(100,330,500); await T('touchEnd'); await p.waitForTimeout(700);
  ok(await p.evaluate(()=>viewKey()==='all'&&!document.querySelector('.pgGhost')&&!ovsEl.style.transform),'hết trang bên trái: kéo có lực cản rồi tự về, không đổi trang');
  await T('touchStart',300,500); await mv(300,300,300); await T('touchEnd'); await p.waitForTimeout(400);
  ok(await p.evaluate(()=>viewKey()==='all'&&!document.querySelector('.pgGhost')),'kéo dọc: không dựng trang bên cạnh');
  await ctx.close(); }
// 4b2. viên thuốc của thanh chủ đề: đi theo ngón tay giữa hai tab, rồi dừng khớp tab đang chọn
{ const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  const T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  const geo=()=>p.evaluate(()=>{ const bar=document.querySelector('#topics'),pl=bar.querySelector('.tpill'),pr=bar.querySelector('button[aria-pressed="true"]'); if(!pl||!pr) return null; const a=pl.getBoundingClientRect(),c=pr.getBoundingClientRect(); return {pill:[Math.round(a.left),Math.round(a.width)],btn:[Math.round(c.left),Math.round(c.width)],op:getComputedStyle(pl).opacity,key:pr.dataset.k||'all'}; });
  console.log('-- viên thuốc thanh chủ đề');
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(1200);
  let g=await geo(); ok(g&&g.op==='1'&&Math.abs(g.pill[0]-g.btn[0])<=1&&Math.abs(g.pill[1]-g.btn[1])<=1,'có viên thuốc, khớp tab All '+JSON.stringify(g));
  await T('touchStart',300,500); for(let i=1;i<=6;i++){ await T('touchMove',300-i*16,500); await p.waitForTimeout(16);} await p.waitForTimeout(250);
  const mid=await geo(); ok(mid&&mid.pill[0]>g.pill[0]+3&&mid.key==='all','đang kéo: viên thuốc rời tab All đi về phía tab kế '+JSON.stringify({from:g.pill,mid:mid&&mid.pill}));
  for(let i=7;i<=14;i++){ await T('touchMove',300-i*16,500); await p.waitForTimeout(16);} await T('touchEnd'); await p.waitForTimeout(900);
  g=await geo(); ok(g&&g.key==='family'&&Math.abs(g.pill[0]-g.btn[0])<=1&&Math.abs(g.pill[1]-g.btn[1])<=1,'thả: viên thuốc dừng khớp tab Family '+JSON.stringify(g));
  await p.evaluate(()=>document.querySelector('#topics [data-k=school]').click()); await p.waitForTimeout(1100);
  g=await geo(); ok(g&&g.key==='school'&&Math.abs(g.pill[0]-g.btn[0])<=1&&Math.abs(g.pill[1]-g.btn[1])<=1,'bấm tab School: viên thuốc trượt tới và khớp '+JSON.stringify(g));
  await ctx.close(); }
// 4c. CHẾ ĐỘ NHẸ (?lite=1, như máy của người dùng) vẫn phải dựng trang bên cạnh và có nền che — không được lộ trang chủ phía sau
{ const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p); await p.goto(`http://localhost:${port}/?lite=1`); await p.waitForTimeout(5000);
  const T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  const mv=async(x1,x2,y)=>{ for(let i=1;i<=8;i++){ await T('touchMove',x1+(x2-x1)*i/8,y); await p.waitForTimeout(16);} };
  console.log('-- chế độ nhẹ (LITE)'); ok(await p.evaluate(()=>LITE),'đang ở chế độ nhẹ');
  await p.evaluate(()=>{ document.querySelector('#startBtn').click(); }); await p.waitForTimeout(900);
  await T('touchStart',300,500); await mv(300,170,500); await p.waitForTimeout(80);
  let m=await p.evaluate(()=>({ghost:!!document.querySelector('.pgGhost'),back:document.body.classList.contains('pgActive'),bg:getComputedStyle(document.body,'::after').backgroundColor,pos:getComputedStyle(document.body,'::after').position}));
  ok(m.ghost&&m.back&&m.pos==='fixed'&&m.bg!=='rgba(0, 0, 0, 0)','LITE: đang kéo vẫn có trang bên cạnh + nền che phía sau '+JSON.stringify(m));
  await T('touchEnd'); await p.waitForTimeout(800);
  ok(await p.evaluate(()=>viewKey()==='family'&&!document.body.classList.contains('pgActive')&&!document.querySelector('.pgGhost')),'LITE: thả → sang Family, gỡ nền và trang phụ');
  // kéo sang phải ở trang đầu (hết trang): không có trang bên cạnh nhưng phải có nền che
  await p.evaluate(()=>document.querySelector('#topics [data-all]').click()); await p.waitForTimeout(900);
  await T('touchStart',100,500); await mv(100,230,500); await p.waitForTimeout(80);
  m=await p.evaluate(()=>({ghost:!!document.querySelector('.pgGhost'),back:document.body.classList.contains('pgActive'),tf:ovsEl.style.transform}));
  ok(!m.ghost&&m.back&&/translateX/.test(m.tf),'hết trang: trang hơi dịch (lực cản) và có nền che, không lộ trang chủ '+JSON.stringify(m));
  await T('touchEnd'); await p.waitForTimeout(600);
  ok(await p.evaluate(()=>!document.body.classList.contains('pgActive')&&!ovsEl.style.transform),'thả: về chỗ cũ, gỡ nền');
  await ctx.close(); }
// 5. chế độ nhẹ / giảm chuyển động: không có hiệu ứng
{ const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(4500);
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('#topics [data-k=family]').click()); await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('#topics [data-k=friends]').click()); await p.waitForTimeout(80);
  ok(await p.evaluate(()=>lscGrid.getAnimations().length===0),'giảm chuyển động: không trượt');
  await ctx.close(); }
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
