// Navbar đáy (điện thoại / tablet): Explore / Continue / Notebook / You. Chạy: node tools/pw/bnav.mjs
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
fs.mkdirSync('tools/pw/shots',{recursive:true});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const mk=async(opts,init)=>{ const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); if(init) await ctx.addInitScript(init); await ctx.route('**/*supabase.co/**',r=>r.abort()); return ctx; };
const nav=p=>p.evaluate(()=>{ const n=document.querySelector('#bnav'),bar=document.querySelector('#bnBar'),r=bar.getBoundingClientRect(),cs=getComputedStyle(n); return {on:document.body.classList.contains('navOn'),disp:cs.display,op:+cs.opacity,min:n.classList.contains('min'),l:Math.round(r.left),r:Math.round(r.right),t:Math.round(r.top),b:Math.round(r.bottom),w:Math.round(r.width),vh:innerHeight,vw:innerWidth,active:(bar.querySelector('.bnItem.on')||{dataset:{}}).dataset.act,items:[...bar.querySelectorAll('.bnItem')].map(i=>i.dataset.act),badge:bar.querySelector('.badge').hidden?'':bar.querySelector('.badge').textContent}; });
const rightVis=p=>p.evaluate(()=>+getComputedStyle(document.querySelector('.top .right')).opacity);
for(const [name,opts] of [['phone',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}],['tablet',{viewport:{width:834,height:1194},isMobile:true,hasTouch:true}]]){
  console.log('--',name);
  const ctx=await mk(opts); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  let n=await nav(p);
  ok(n.on&&n.op===1&&n.items.join()==='explore,continue,notebook,you'&&n.active==='explore','trang chủ: navbar hiện với 4 mục, Explore sáng '+JSON.stringify({items:n.items,active:n.active}));
  ok(n.b<=n.vh&&n.t>n.vh-100&&n.w<=(name==='phone'?460:520)&&Math.abs((n.l+n.r)/2-n.vw/2)<2,'navbar nằm sát đáy, căn giữa, rộng '+n.w+'px');
  ok(await rightVis(p)===0,'nút How to Learn / nhạc / sổ tay trên thanh trên được ẩn khi có navbar');
  await p.screenshot({path:`tools/pw/shots/bnav_${name}_home.png`});
  // Explore
  await p.evaluate(()=>document.querySelector('.bnItem[data-act=explore]').click()); await p.waitForTimeout(900);
  ok(await p.evaluate(()=>ovsEl.classList.contains('on')),'Explore: mở trang All');
  n=await nav(p); ok(n.on&&n.active==='explore','ở trang All navbar vẫn hiện');
  await p.screenshot({path:`tools/pw/shots/bnav_${name}_all.png`});
  // thu gọn khi cuộn xuống, mở lại khi cuộn lên
  await p.evaluate(()=>{ ovsBody.scrollTop=300; ovsBody.dispatchEvent(new Event('scroll')); }); await p.waitForTimeout(700);
  n=await nav(p); ok(n.min&&n.w<=70,'cuộn xuống: navbar thu thành vòng tròn '+n.w+'px');
  await p.screenshot({path:`tools/pw/shots/bnav_${name}_min.png`});
  await p.evaluate(()=>{ ovsBody.scrollTop=200; ovsBody.dispatchEvent(new Event('scroll')); }); await p.waitForTimeout(700);
  n=await nav(p); ok(!n.min&&n.w>=200,'cuộn lên: navbar mở ra lại '+n.w+'px');
  await p.evaluate(()=>{ ovsBody.scrollTop=400; ovsBody.dispatchEvent(new Event('scroll')); }); await p.waitForTimeout(700);
  await p.evaluate(()=>document.querySelector('.bnItem.on').click()); await p.waitForTimeout(700);
  n=await nav(p); ok(!n.min,'chạm vào vòng tròn: mở ra lại');
  // Notebook
  await p.evaluate(()=>{ ovsBody.scrollTop=0; ovsBody.dispatchEvent(new Event('scroll')); });
  const badge=await p.evaluate(()=>document.querySelector('#nbBtn b').textContent);
  n=await nav(p); ok(n.badge===(+badge>0?badge:''),'huy hiệu sổ tay khớp số cụm đã lưu ('+badge+')');
  await p.evaluate(()=>document.querySelector('.bnItem[data-act=notebook]').click()); await p.waitForTimeout(800);
  ok(await p.evaluate(()=>document.querySelector('#notebook').classList.contains('show')),'Notebook: mở sổ tay');
  await p.evaluate(()=>nbClose()); await p.waitForTimeout(700);
  // You
  await p.evaluate(()=>document.querySelector('.bnItem[data-act=you]').click()); await p.waitForTimeout(800);
  const y=await p.evaluate(()=>({show:document.querySelector('#youSheet').classList.contains('show'),text:document.querySelector('.ysCard').innerText.replace(/\n+/g,' | '),rows:[...document.querySelectorAll('.ysRow')].map(r=>r.dataset.y||'x'),active:document.querySelector('.bnItem.on').dataset.act}));
  ok(y.show&&y.active==='you'&&/Lessons read/.test(y.text)&&/streak/.test(y.text)&&y.rows.join()==='music,auto,tour,x','You: bảng tiến độ + cài đặt, mục You sáng '+y.text.slice(0,120));
  await p.screenshot({path:`tools/pw/shots/bnav_${name}_you.png`});
  await p.evaluate(()=>document.querySelector('.ysRow[data-y=music]').click()); await p.waitForTimeout(500);
  ok(await p.evaluate(()=>Bgm.playing&&document.querySelector('.ysRow[data-y=music]').getAttribute('aria-checked')==='true'),'công tắc Background music bật được');
  await p.evaluate(()=>document.querySelector('.ysRow[data-y=music]').click()); await p.waitForTimeout(500);
  const a0=await p.evaluate(()=>AutoPlay.on); await p.evaluate(()=>document.querySelector('.ysRow[data-y=auto]').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(a=>AutoPlay.on!==a,a0),'công tắc Auto-play đổi trạng thái'); await p.evaluate(()=>document.querySelector('.ysRow[data-y=auto]').click());
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  ok(await p.evaluate(()=>!document.querySelector('#youSheet').classList.contains('show')&&ovsEl.classList.contains('on')),'Esc: đóng bảng You, vẫn ở trang All');
  // Continue: chưa có bài nào → bài đầu; sau khi đọc → đúng chỗ
  await p.evaluate(()=>document.querySelector('.bnItem[data-act=continue]').click()); await p.waitForTimeout(1500);
  let st=await p.evaluate(()=>({away:player.classList.contains('away'),topic:curTopic,pi:active.pi,si:active.si,y:Math.round(scrollY)}));
  ok(!st.away&&st.topic==='family'&&st.pi===0&&st.y>300,'Continue (chưa đọc gì): vào bài đầu của chủ đề đầu tiên '+JSON.stringify(st));
  n=await nav(p); ok(!n.on&&n.op===0,'trong bài: navbar ẩn (nhường chỗ cho player)');
  ok(await rightVis(p)===1,'trong bài: nút trên thanh trên hiện lại');
  await p.evaluate(()=>document.querySelector('#topics [data-k=school]').click()); await p.waitForTimeout(1200);
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1000);
  const where=await p.evaluate(()=>({topic:curTopic,pi:active.pi,si:active.si,saved:localStorage.getItem('reed_last')}));
  await p.evaluate(()=>document.querySelector('#brandHome').click()); await p.waitForTimeout(1500);
  n=await nav(p); ok(n.on,'về trang chủ: navbar hiện lại');
  await p.evaluate(()=>document.querySelector('.bnItem[data-act=continue]').click()); await p.waitForTimeout(1600);
  st=await p.evaluate(()=>({topic:curTopic,pi:active.pi,si:active.si}));
  ok(st.topic===where.topic&&st.pi===where.pi&&st.si===where.si,'Continue: quay lại đúng chỗ đang đọc dở '+JSON.stringify({saved:where,now:st}));
  ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:'')); await ctx.close();
}
// Tour: navbar ẩn, nút trên thanh trên hiện (để tour chỉ vào được)
{ const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); await ctx.route('**/*supabase.co/**',r=>r.abort()); const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(8000);
  ok(await p.evaluate(()=>Tour.welcomeOpen&&!document.body.classList.contains('navOn')),'hộp chào mừng / tour: navbar ẩn');
  await ctx.close(); }
// máy tính: không có navbar đáy
{ const ctx=await mk({viewport:{width:1280,height:720}}); const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  const d=await p.evaluate(()=>({disp:getComputedStyle(document.querySelector('#bnav')).display,right:+getComputedStyle(document.querySelector('.top .right')).opacity}));
  ok(d.disp==='none'&&d.right===1,'máy tính (≥1100px): không có navbar đáy, nút trên thanh trên giữ nguyên '+JSON.stringify(d));
  await ctx.close(); }
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
