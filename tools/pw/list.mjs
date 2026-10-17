// Màn hình danh sách bài (Start Reading) + bài đã đọc + đổi chữ tức thì trên điện thoại. Chạy: node tools/pw/list.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch();
for(const [name,opts] of [['mobile',devices['iPhone 13']],['desktop',{viewport:{width:1280,height:720}}]]){
  console.log('--',name);
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5500);
  await p.click('#topics button[data-k="school"]'); await p.waitForTimeout(1200);
  await p.evaluate(()=>{ document.querySelector('#brandHome').click(); }); await p.waitForTimeout(1600);
  ok(await p.evaluate(()=>scrollY)<5,'đang ở màn hình đầu (hero)');
  // 1. Start Reading mở danh sách
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(900);
  const s1=await p.evaluate(()=>({open:document.body.classList.contains('listOpen'),title:lscTitle.textContent,count:lscSub.textContent,cards:document.querySelectorAll('.lscCard').length,locked:document.querySelectorAll('.lscCard.locked').length,y:scrollY,vis:getComputedStyle(lessonScreen).opacity}));
  ok(s1.open&&s1.cards===2&&s1.title==='School'&&s1.y<5&&+s1.vis>.9,'Start Reading mở danh sách bài: '+JSON.stringify(s1));
  await p.screenshot({path:`tools/pw/shots/list_${name}.png`});
  // 2. vuốt/lăn khi danh sách mở không đi bước
  await p.evaluate(()=>goStep(1)); await p.mouse.wheel(0,400); await p.waitForTimeout(700);
  ok(await p.evaluate(()=>scrollY)<5,'đang mở danh sách: goStep/lăn chuột không cuộn trang phía sau');
  // 3. bài chưa mở: lắc, danh sách vẫn mở
  await p.evaluate(()=>document.querySelectorAll('.lscCard')[1].click()); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>document.body.classList.contains('listOpen')&&document.querySelectorAll('.lscCard')[1].classList.contains('shake')),'bài chưa mở: lắc nhẹ, không vào');
  // 4. đổi chủ đề khi danh sách mở
  await p.evaluate(()=>document.querySelector('#topics button[data-k="family"]').click()); await p.waitForTimeout(1200);
  const s4=await p.evaluate(()=>({title:lscTitle.textContent,cards:document.querySelectorAll('.lscCard').length,open:document.body.classList.contains('listOpen'),y:Math.round(scrollY)}));
  ok(s4.title==='Family'&&s4.open&&s4.y<5,'đổi chủ đề: danh sách làm mới, trang phía sau giữ nguyên '+JSON.stringify(s4));
  // 5. Esc đóng
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);
  ok(await p.evaluate(()=>!document.body.classList.contains('listOpen')&&lessonScreen.hidden),'Esc đóng danh sách');
  // 6. chọn bài 1 từ danh sách
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(800);
  await p.evaluate(()=>document.querySelectorAll('.lscCard')[0].click()); await p.waitForTimeout(1500);
  const s6=await p.evaluate(()=>({open:document.body.classList.contains('listOpen'),y:Math.round(scrollY),away:player.classList.contains('away'),cur:active.pi}));
  ok(!s6.open&&s6.y>300&&!s6.away&&s6.cur===0,'chọn bài 1: vào bài, hiện thanh player '+JSON.stringify(s6));
  // 7. bài đã đọc: cuộn tới trang tổng kết
  await p.evaluate(()=>{ const pp=P[0]; scrollTo(0,pp.el.getBoundingClientRect().top+scrollY+pp.sents[pp.sents.length-1].lo+2); }); await p.waitForTimeout(900);
  const rd=await p.evaluate(()=>JSON.parse(localStorage.getItem('reed_read_v1')||'[]'));
  ok(rd.length>=1,'tới trang tổng kết: ghi nhận bài đã đọc '+JSON.stringify(rd));
  await p.evaluate(()=>document.querySelector('#brandHome').click()); await p.waitForTimeout(1500);
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(800);
  ok(await p.evaluate(()=>document.querySelectorAll('.lscCard.read').length>=1&&/1 read/.test(lscSub.textContent)),'danh sách hiện dấu ✓ cho bài đã đọc ('+await p.evaluate(()=>lscSub.textContent)+')');
  await p.screenshot({path:`tools/pw/shots/list_${name}_read.png`});
  // chip lọc Unread / Read (giống chip Mới nhất/Phổ biến của YouTube)
  await p.evaluate(()=>document.querySelector('#lscChips [data-f="read"]').click()); await p.waitForTimeout(300);
  const fr=await p.evaluate(()=>({cards:document.querySelectorAll('.lscCard').length,all:[...document.querySelectorAll('.lscCard')].every(c=>c.classList.contains('read')),pressed:document.querySelector('#lscChips [data-f="read"]').getAttribute('aria-pressed')}));
  await p.evaluate(()=>document.querySelector('#lscChips [data-f="unread"]').click()); await p.waitForTimeout(300);
  const fu=await p.evaluate(()=>({cards:document.querySelectorAll('.lscCard').length,empty:!!document.querySelector('.lscEmpty')}));
  await p.evaluate(()=>document.querySelector('#lscChips [data-f="all"]').click()); await p.waitForTimeout(300);
  ok(fr.cards>=1&&fr.all&&fr.pressed==='true'&&fu.cards===0&&fu.empty&&await p.evaluate(()=>document.querySelectorAll('.lscCard').length)>=1,'chip lọc: Read '+JSON.stringify(fr)+', Unread '+JSON.stringify(fu)+', All trở lại');
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  // 8. đổi chữ A1→A2: tức thì trên điện thoại, mượt trên máy tính
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1300); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900);
  const sw=await p.evaluate(()=>new Promise(res=>{ const act=[...document.querySelectorAll('.sent')].find(s=>+s.style.opacity>.5&&s.querySelector('.ph')); if(!act) return res(null); const ph=act.querySelector('.ph'); const before=ph._f||0; ph.click(); requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>res({before,after3frames:+(ph._f||0).toFixed(2),target:ph._t})))); }));
  const mobile=name==='mobile';
  ok(sw&&(mobile?sw.after3frames===sw.target:sw.after3frames<sw.target&&sw.after3frames>sw.before),'đổi chữ '+(mobile?'tức thì':'mượt (đang chạy)')+' sau 3 khung hình: '+JSON.stringify(sw));
  ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:''));
  await ctx.close();
}
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
