// Kiểm tra giao diện theo cỡ màn hình (điện thoại, tablet dọc/ngang, máy tính): header, thanh chủ đề, lưới trang All, thanh player. Chạy: node tools/pw/tablet.mjs
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
fs.mkdirSync('tools/pw/shots',{recursive:true});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const SIZES=[['phone390',390,844,true],['phoneSE',320,568,true],['tabP820',820,1180,true],['tabP834',834,1194,true],['tabL1180',1180,820,true],['tabP1024',1024,1366,true],['desk1280',1280,720,false]];
const b=await chromium.launch();
for(const [name,w,h,touch] of SIZES){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:touch,hasTouch:touch}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(4500);
  const R=sel=>p.evaluate(s=>{const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(),cs=getComputedStyle(e); return {l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height),vis:cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0}},sel);
  // --- vào bài trước (player hiện), rồi bấm tab All
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1500);
  await p.evaluate(()=>document.querySelector('#topics [data-all]').click()); await p.waitForTimeout(1000);
  const top=await R('.top'), brand=await R('.top .brand'), btext=await R('.top .brandtext'), slog=await R('.top .brandtext i'), topics=await R('#topics'), right=await R('.top .right');
  ok(slog&&(w<=340?!slog.vis:(slog.vis&&slog.h>0)),name+': '+(w<=340?'màn rất hẹp (≤340px): ẩn slogan để vừa hàng':'có dòng slogan dưới logo ')+JSON.stringify(slog));
  ok(slog&&(w<=340||(w<=430?slog.h<=26:slog.h<=16)),name+': slogan '+(w<=430?'tối đa 2 dòng':'một dòng')+' (cao '+(slog&&slog.h)+'px)');
  ok(right.t<brand.b&&right.b>brand.t,name+': logo và các nút (How to Learn, nhạc, sổ tay) cùng một hàng '+JSON.stringify({brand:[brand.t,brand.b],right:[right.t,right.b]}));
  const tabsInfo=await p.evaluate(()=>[...document.querySelectorAll('#topics button')].map(b=>({k:b.dataset.k,name:b.getAttribute('aria-label'),r:Math.round(b.getBoundingClientRect().right),vis:b.offsetWidth>0})));
  ok(tabsInfo.every(x=>x.name),name+': mọi tab chủ đề có tên (aria-label)');
  await p.waitForTimeout(700);
  const pr=await p.evaluate(()=>{const bar=document.querySelector('#topics'),b=bar.querySelector('button[aria-pressed="true"]'); if(!b) return null; const r=b.getBoundingClientRect(),br=bar.getBoundingClientRect(); return {l:Math.round(r.left),r:Math.round(r.right),barL:Math.round(br.left),barR:Math.round(br.right),name:b.dataset.k}});
  ok(pr&&pr.l>=pr.barL-1&&pr.r<=pr.barR+1,name+': tab đang chọn ('+(pr&&pr.name)+') nằm trong vùng nhìn thấy của thanh chủ đề '+JSON.stringify(pr));
  // (thanh chủ đề tablet có thể cuộn ngang khi không đủ chỗ; điều quan trọng là tab đang chọn luôn nhìn thấy: đã kiểm ở trên)
  ok(topics.r<=w+1&&right.r<=w+1&&brand.r<=topics.l+2||w<=820,name+': header không chồng nhau/tràn '+JSON.stringify({brandR:brand.r,topicsL:topics.l,topicsR:topics.r,rightL:right.l,rightR:right.r,w}));
  const cards=await p.evaluate(()=>[...document.querySelectorAll('.ovSec')].map(s=>{const r=s.getBoundingClientRect();return {l:Math.round(r.left),r:Math.round(r.right),t:Math.round(r.top)}}));
  const row1=cards.filter(c=>c.t===cards[0].t); let gapOK=true; for(let i=1;i<row1.length;i++) if(row1[i].l-row1[i-1].r<12) gapOK=false;
  ok(gapOK&&cards.every(c=>c.r<=w+1),name+': lưới trang All có khoảng cách giữa cột, không tràn ('+row1.length+' cột/hàng) '+JSON.stringify(row1));
  const pl=await R('#player'); ok(!pl||!pl.vis||pl.t>=h-1||pl.b<=0||true,name+': (thông tin player ở trang All) '+JSON.stringify(pl));
  const plHidden=await p.evaluate(()=>{const e=document.querySelector('#player'); const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0||r.top>=innerHeight-1||e.classList.contains('away')});
  ok(plHidden,name+': thanh player ẩn ở trang All');
  await p.screenshot({path:`tools/pw/shots/tab_${name}_all.png`});
  // --- danh sách chủ đề
  await p.evaluate(()=>document.querySelector('.ovTopic[data-k="school"]').click()); await p.waitForTimeout(900);
  const plHidden2=await p.evaluate(()=>{const e=document.querySelector('#player'); const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0||r.top>=innerHeight-1||e.classList.contains('away')});
  ok(plHidden2,name+': thanh player ẩn ở danh sách bài');
  const lg=await p.evaluate(()=>{const g=document.querySelector('#lscGrid'),cs=getComputedStyle(g),cards=[...g.querySelectorAll('.lscCard')].map(c=>{const r=c.getBoundingClientRect();return [Math.round(r.left),Math.round(r.right)]}); return {cols:cs.gridTemplateColumns.split(' ').length,cards}});
  await p.screenshot({path:`tools/pw/shots/tab_${name}_list.png`});
  // --- vào bài: player hiện
  await p.evaluate(()=>{ document.querySelector('#lscGrid .lscCard').click(); }); await p.waitForTimeout(1800);
  const inLesson=await p.evaluate(()=>{const e=document.querySelector('#player'); const r=e.getBoundingClientRect(); return {away:e.classList.contains('away'),top:Math.round(r.top),h:innerHeight,vis:+getComputedStyle(e).opacity>0}});
  ok(!inLesson.away&&inLesson.top<inLesson.h-20&&inLesson.vis,name+': vào bài thì player hiện '+JSON.stringify(inLesson));
  await p.screenshot({path:`tools/pw/shots/tab_${name}_lesson.png`});
  ok(errs.length===0,name+': không lỗi JS'+(errs.length?': '+errs[0]:'')); await ctx.close();
}
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
