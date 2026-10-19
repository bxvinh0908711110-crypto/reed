// Chủ đề Stories + bài đặc biệt "The Fall of the Soviet Union" (iframe). Chạy: node tools/pw/stories.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
fs.mkdirSync('tools/pw/shots',{recursive:true});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const INIT=()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))};
for(const [name,opts] of [['mobile',devices['iPhone 13']],['desktop',{viewport:{width:1280,height:720}}]]){
  console.log('--',name);
  const ctx=await b.newContext(opts); await ctx.addInitScript(INIT); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[],bad=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('response',r=>{ if(r.status()>=400&&!/supabase/.test(r.url())) bad.push(r.status()+' '+r.url().slice(-50)); });
  await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  const tabs=await p.evaluate(()=>[...document.querySelectorAll('#topics button')].map(b=>b.dataset.k));
  ok(tabs[0]==='all'&&tabs[tabs.length-1]==='stories'&&!(await p.evaluate(()=>document.querySelector('#topics [data-k=stories]').dataset.soon)),'thanh chủ đề: All … Stories (cuối), không bị "coming soon" '+JSON.stringify(tabs.slice(-2)));
  // trang All: mục Stories
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(900);
  const ov=await p.evaluate(()=>{ const s=document.querySelector('.ovSec[data-k="stories"]'); const i=s&&s.querySelector('.ovTopic img'); return {has:!!s,name:s&&s.querySelector('.ovName').textContent,meta:s&&s.querySelector('.ovTopic .lscMeta').textContent,img:!!i&&i.naturalWidth>0}; });
  ok(ov.has&&ov.name==='Stories'&&ov.meta==='1 story'&&ov.img,'trang All: mục Stories, thẻ bìa có ảnh, "1 story" '+JSON.stringify(ov));
  await p.evaluate(()=>document.querySelector('.ovTopic[data-k="stories"]').click()); await p.waitForTimeout(900);
  const L=await p.evaluate(()=>({ls:lscEl.classList.contains('on'),cards:[...document.querySelectorAll('#lscGrid .lscCard')].map(c=>({story:c.dataset.story,title:c.querySelector('.lscTitle').textContent,meta:c.querySelector('.lscMeta').textContent,dur:c.querySelector('.lscDur').textContent.trim()})),pressed:document.querySelector('#topics [data-k=stories]').getAttribute('aria-pressed')}));
  ok(L.ls&&L.cards.length===1&&L.cards[0].story==='ussr'&&L.cards[0].meta==='Story · B1'&&L.cards[0].dur.endsWith('1:13')&&L.pressed==='true','danh sách Stories: thẻ bài, tab Stories sáng '+JSON.stringify(L.cards[0]));
  await p.screenshot({path:`tools/pw/shots/stories_list_${name}.png`});
  // nhạc nền đang phát → mở bài thì tạm dừng
  await p.evaluate(()=>Bgm.on()); await p.waitForTimeout(500);
  ok(await p.evaluate(()=>Bgm.playing),'nhạc nền đang phát trước khi mở bài');
  await p.evaluate(()=>document.querySelector('#lscGrid .lscCard.story').click()); await p.waitForTimeout(500);
  ok(await p.evaluate(()=>!document.querySelector('#storyView').hidden&&document.body.classList.contains('storyOpen')&&document.querySelector('#storyFrame').src.includes('stories/ussr/index.html?embed=1&lang=en_michael')),'mở bài: overlay + iframe (embed, giọng English)');
  ok(!(await p.evaluate(()=>Bgm.playing)),'mở bài: nhạc nền của Reed tạm dừng');
  const fr=p.frames().find(f=>f.url().includes('/stories/ussr/'));
  await fr.waitForSelector('body[data-ready="1"]',{timeout:60000}); await p.waitForTimeout(500);
  ok(await p.evaluate(()=>document.querySelector('#storyLoad').hidden),'trang con sẵn sàng: màn hình chờ ẩn');
  ok(await fr.evaluate(()=>document.querySelector('#start h1').textContent==='The Fall of the Soviet Union'),'chữ giao diện của bài là tiếng Anh');
  await p.screenshot({path:`tools/pw/shots/stories_start_${name}.png`});
  await fr.evaluate(()=>document.querySelector('#go0').click()); await p.waitForTimeout(800);
  // xem hết → đánh dấu đã đọc
  ok(!(await p.evaluate(()=>readSet.has('story-ussr'))),'chưa xem hết: chưa đánh dấu đã đọc');
  await fr.evaluate(()=>{ scrollTo(0,(document.querySelectorAll('.step').length-1)*innerHeight); }); await p.waitForTimeout(1500);
  ok(await p.evaluate(()=>readSet.has('story-ussr')&&JSON.parse(localStorage.getItem('reed_read_v1')).includes('story-ussr')),'xem tới bước cuối: đánh dấu đã đọc (lưu trong máy)');
  await p.screenshot({path:`tools/pw/shots/stories_end_${name}.png`});
  // Esc trong iframe đóng bài
  await fr.evaluate(()=>{ window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'})); }); await p.waitForTimeout(600);
  ok(await p.evaluate(()=>document.querySelector('#storyView').hidden&&!document.body.classList.contains('storyOpen')&&!document.querySelector('#storyFrame')),'Esc trong bài: đóng, iframe bị gỡ hẳn (âm thanh dừng)');
  ok(await p.evaluate(()=>Bgm.playing),'đóng bài: nhạc nền của Reed phát lại');
  ok(await p.evaluate(()=>!!document.querySelector('#lscGrid .lscCard.story.read')),'danh sách hiện dấu ✓ cho bài đã đọc');
  // nút ✕
  await p.evaluate(()=>document.querySelector('#lscGrid .lscCard.story').click()); await p.waitForTimeout(500);
  await p.evaluate(()=>document.querySelector('#storyClose').click()); await p.waitForTimeout(400);
  ok(await p.evaluate(()=>document.querySelector('#storyView').hidden),'nút ✕ đóng bài');
  await p.evaluate(()=>Bgm.off());
  // Esc: danh sách Stories (mở từ tổng quan) → tổng quan
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);
  ok(await p.evaluate(()=>ovsEl.classList.contains('on')&&!lscEl.classList.contains('on')&&document.querySelector('#topics [data-all]').getAttribute('aria-pressed')==='true'),'Esc: danh sách Stories → trang All');
  // bấm tab Stories khi ở trang All
  await p.evaluate(()=>document.querySelector('#topics [data-k=stories]').click()); await p.waitForTimeout(900);
  ok(await p.evaluate(()=>lscEl.classList.contains('on')&&!ovsEl.classList.contains('on')&&!!document.querySelector('#lscGrid .story')),'tab Stories từ trang All: mở danh sách Stories');
  // bấm tab chủ đề khác khi đang ở Stories
  await p.evaluate(()=>document.querySelector('#topics [data-k=school]').click()); await p.waitForTimeout(1300);
  const S2=await p.evaluate(()=>({topic:curTopic,cards:document.querySelectorAll('#lscGrid .lscCard').length,story:!!document.querySelector('#lscGrid .story'),pressed:document.querySelector('#topics [data-k=school]').getAttribute('aria-pressed'),sp:document.querySelector('#topics [data-k=stories]').getAttribute('aria-pressed')}));
  ok(S2.topic==='school'&&S2.cards===2&&!S2.story&&S2.pressed==='true'&&S2.sp==='false','từ Stories bấm School: hiện danh sách School '+JSON.stringify(S2));
  // đóng hết, rồi bấm tab Stories khi đang đọc bài
  await p.evaluate(()=>document.querySelector('#brandHome').click()); await p.waitForTimeout(1500);
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1300);
  await p.evaluate(()=>document.querySelector('#topics [data-k=stories]').click()); await p.waitForTimeout(900);
  ok(await p.evaluate(()=>lscEl.classList.contains('on')&&!!document.querySelector('#lscGrid .story')),'đang đọc bài, bấm tab Stories: mở danh sách Stories');
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);
  ok(await p.evaluate(()=>!listOpen()&&curTopic==='school'&&!storiesView),'Esc: về đang đọc, chủ đề đọc không bị đổi');
  ok(errs.length===0&&bad.length===0,'không lỗi JS / không file 404'+(errs.length?': '+errs[0]:'')+(bad.length?' '+bad[0]:'')); await ctx.close();
}
// vuốt ngang giữa Tech ↔ Stories (điện thoại, cảm ứng thật)
{ const ctx=await b.newContext(devices['iPhone 13']); await ctx.addInitScript(INIT); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  const T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  async function swipe(x1,x2,y){ await T('touchStart',x1,y); for(let i=1;i<=8;i++){ await T('touchMove',x1+(x2-x1)*i/8,y); await p.waitForTimeout(16);} await T('touchEnd'); await p.waitForTimeout(800); }
  await p.evaluate(()=>{ document.querySelector('#startBtn').click(); }); await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('.ovTopic[data-k="tech"]').click()); await p.waitForTimeout(900);
  await swipe(300,80,600);
  ok(await p.evaluate(()=>lscEl.classList.contains('on')&&storiesView&&!!document.querySelector('#lscGrid .story')&&document.querySelector('#topics [data-k=stories]').getAttribute('aria-pressed')==='true'),'vuốt trái ở Tech: sang Stories');
  await swipe(300,80,600); ok(await p.evaluate(()=>storiesView),'vuốt trái ở Stories (cuối): đứng yên');
  await swipe(80,300,600);
  ok(await p.evaluate(()=>!storiesView&&curTopic==='tech'&&document.querySelectorAll('#lscGrid .lscCard:not(.story)').length>=1),'vuốt phải ở Stories: về Tech');
  await ctx.close(); }
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
