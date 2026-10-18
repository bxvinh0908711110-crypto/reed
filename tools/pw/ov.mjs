// Trang tổng quan các chủ đề (Start Reading). Chạy: node tools/pw/ov.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
fs.mkdirSync('tools/pw/shots',{recursive:true});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const st=p=>p.evaluate(()=>({ov:!ovsEl.hidden&&ovsEl.classList.contains('on'),ls:!lscEl.hidden&&lscEl.classList.contains('on'),list:document.body.classList.contains('listOpen'),topic:curTopic,y:Math.round(scrollY)}));
const b=await chromium.launch();
for(const [name,opts] of [['mobile',devices['iPhone 13']],['desktop',{viewport:{width:1280,height:720}}]]){
  console.log('--',name);
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5500);
  await p.evaluate(()=>document.querySelector('#brandHome').click()); await p.waitForTimeout(1500);
  const start=async()=>{ await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(800); };
  // 1. Start Reading → trang tổng quan
  await start();
  const o1=await p.evaluate(()=>({secs:document.querySelectorAll('.ovSec').length,topics:TOPICS.filter(t=>topicLessons(t.k).length).length,cards:document.querySelectorAll('#ovsBody .lscCard').length,inList:document.querySelectorAll('#lscGrid .lscCard').length}));
  const s1=await st(p);
  ok(s1.ov&&!s1.ls&&s1.list&&o1.secs===o1.topics&&o1.secs>=2&&o1.cards>=o1.secs,'Start Reading mở trang tổng quan: '+JSON.stringify(o1));
  await p.screenshot({path:`tools/pw/shots/ov_${name}.png`});
  const a1=await p.evaluate(()=>({all:document.querySelector('#topics [data-all]').getAttribute('aria-pressed'),others:[...document.querySelectorAll('#topics button:not([data-all])')].filter(b=>b.getAttribute('aria-pressed')==='true').length,first:document.querySelector('#topics button').dataset.all==='1',heads:[...document.querySelectorAll('.ovHead')].every(h=>h.querySelector('.ovThumb')&&/^[0-9]+ lessons?$/.test(h.querySelector('.ovCount').textContent)),n:document.querySelector('.ovCount').textContent}));
  ok(a1.all==='true'&&a1.others===0&&a1.first&&a1.heads,'tab All đầu thanh và sáng ở trang tổng quan, mỗi chủ đề có thumb xám + số bài '+JSON.stringify(a1));
  // 2. bài khoá: lắc, không vào
  const lk=await p.evaluate(()=>{ const c=document.querySelector('#ovsBody .lscCard.locked'); if(!c) return null; c.click(); return true; }); await p.waitForTimeout(300);
  if(lk) ok(await p.evaluate(()=>document.querySelector('#ovsBody .lscCard.locked.shake')!==null)&&(await st(p)).ov,'bài khoá: lắc, vẫn ở tổng quan'); else console.log('SKIP không có bài khoá');
  // 3. chạm tên chủ đề → danh sách chủ đề
  const k1=await p.evaluate(()=>document.querySelectorAll('.ovHead')[1].dataset.k);
  await p.evaluate(()=>document.querySelectorAll('.ovHead')[1].click()); await p.waitForTimeout(900);
  const s3=await st(p), c3=await p.evaluate(()=>document.querySelectorAll('#lscGrid .lscCard').length);
  ok(s3.ls&&!s3.ov&&s3.topic===k1&&c3===(await p.evaluate(k=>topicLessons(k).length,k1)),'chạm tên chủ đề: mở danh sách '+k1+' '+JSON.stringify(s3));
  ok(await p.evaluate(()=>document.querySelector('#topics [data-all]').getAttribute('aria-pressed')==='false'&&document.querySelector('#topics [data-k="'+curTopic+'"]').getAttribute('aria-pressed')==='true'),'vào danh sách chủ đề: tab All tắt, tab chủ đề sáng');
  // 4. Esc → tổng quan, Esc → đóng hết
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);
  const s4=await st(p); ok(s4.ov&&!s4.ls,'Esc 1: quay về tổng quan');
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);
  const s4b=await st(p); ok(!s4b.ov&&!s4b.ls&&!s4b.list,'Esc 2: đóng hết');
  // 5. chọn bài ở chủ đề khác từ tổng quan → vào thẳng bài
  await start();
  const t5=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#ovsBody .lscCard:not(.locked)')].find(c=>c.dataset.k!==curTopic); if(!c) return null; const r={k:c.dataset.k,id:+c.dataset.id}; c.click(); return r; }); await p.waitForTimeout(1800);
  if(t5){ const s5=await p.evaluate(()=>({topic:curTopic,list:document.body.classList.contains('listOpen'),y:Math.round(scrollY),pid:passages[active.pi].id,away:player.classList.contains('away')}));
    ok(s5.topic===t5.k&&!s5.list&&s5.y>200&&s5.pid===t5.id&&!s5.away,'chọn bài chủ đề khác: đổi chủ đề, vào thẳng bài '+JSON.stringify(s5)); } else console.log('SKIP chỉ có một chủ đề mở');
  // 6. bấm tab chủ đề khi đang ở tổng quan → danh sách chủ đề đó
  await p.evaluate(()=>document.querySelector('#brandHome').click()); await p.waitForTimeout(1500);
  await start();
  const k6=await p.evaluate(()=>{ const bs=[...document.querySelectorAll('#topics button:not([data-soon]):not([data-all])')]; const bt=bs.find(x=>x.dataset.k!==curTopic)||bs[0]; return bt.dataset.k; });
  await p.evaluate(k=>document.querySelector('#topics button[data-k="'+k+'"]').click(),k6); await p.waitForTimeout(1300);
  const s6=await st(p); ok(s6.ls&&!s6.ov&&s6.topic===k6,'bấm tab chủ đề khi ở tổng quan: mở danh sách '+k6+' '+JSON.stringify(s6));
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);
  ok((await st(p)).ov,'Esc từ danh sách (mở bằng tab) quay lại tổng quan');
  // 6b. bấm tab All từ danh sách chủ đề → tổng quan
  await p.evaluate(()=>document.querySelector('#topics [data-all]').click()); await p.waitForTimeout(900);
  const s6b=await st(p); ok(s6b.ov&&!s6b.ls&&await p.evaluate(()=>document.querySelector('#topics [data-all]').getAttribute('aria-pressed')==='true'),'bấm tab All từ danh sách chủ đề: về tổng quan '+JSON.stringify(s6b));
  // 7. chip lọc
  const f=await p.evaluate(async()=>{ const w=()=>new Promise(r=>setTimeout(r,200)); const q=s=>document.querySelector('#ovsChips [data-f="'+s+'"]');
    q('read').click(); await w(); const rd=document.querySelectorAll('#ovsBody .lscCard').length, empty=!!document.querySelector('#ovsBody .lscEmpty');
    q('unread').click(); await w(); const un=document.querySelectorAll('#ovsBody .lscCard').length;
    q('all').click(); await w(); const al=document.querySelectorAll('#ovsBody .lscCard').length; return {rd,empty,un,al}; });
  ok(f.rd===0&&f.empty&&f.un>=1&&f.al>=f.un,'chip lọc All/Unread/Read: '+JSON.stringify(f));
  // 8. mở rộng ⌄ khi > 3 bài
  const ex=await p.evaluate(()=>{ const s=[...document.querySelectorAll('.ovSec')].find(s=>s.querySelector('.ovExpand')); if(!s) return null; const vis=()=>[...s.querySelectorAll('.lscCard')].filter(c=>getComputedStyle(c).display!=='none').length; const a=vis(); s.querySelector('.ovExpand').click(); return {a,b:vis(),n:s.querySelectorAll('.lscCard').length}; });
  if(ex) ok(ex.a===3&&ex.b===ex.n,'dấu ⌄ mở rộng: '+JSON.stringify(ex)); else console.log('SKIP không chủ đề nào > 3 bài');
  // 9. bấm logo đóng hết
  await p.evaluate(()=>document.querySelector('#brandHome').click()); await p.waitForTimeout(700);
  const s9=await st(p); ok(!s9.ov&&!s9.ls&&!s9.list,'bấm logo đóng hết '+JSON.stringify(s9));
  ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:''));
  await ctx.close();
}
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
