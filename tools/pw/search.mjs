// Ô tìm kiếm thông minh: ô + chữ chạy + lớp phủ + kết quả + nối vào luồng. Chạy: node tools/pw/search.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.json':'application/json','.mp4':'video/mp4'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.writeHead(200,{'content-type':MIME[path.extname(u)]||'application/octet-stream'});r.end(b);}catch(e){r.writeHead(404);r.end();}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
const SH='E:/Your English/tools/pw/shots/'; fs.mkdirSync(SH,{recursive:true});
const SEARCH_PHS=['What do you want to learn today?','Tell me what you like.','I’ll find a lesson for you.','Let’s learn something new.'];
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch();
const init=()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({s:1}));};
const view=async p=>p.evaluate(()=>({ov:!ovsEl.hidden&&ovsEl.classList.contains('on'),ls:!lscEl.hidden&&lscEl.classList.contains('on'),sov:window.__sov.isOpen(),topic:curTopic,y:Math.round(scrollY)}));
async function boot(ctx,q=''){ const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message)); await p.goto(`http://localhost:${port}/${q}`); await p.waitForTimeout(4500); return p; }
const startAll=async p=>{ await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(1000); };
const cases=[['m320',{viewport:{width:320,height:640},hasTouch:true,isMobile:true}],['m390',devices['iPhone 13']],['t834',{viewport:{width:834,height:1112},hasTouch:true}],['d1280',{viewport:{width:1280,height:720}}]];
for(const [name,opts] of cases){
  console.log('--',name);
  const ctx=await b.newContext(opts); await ctx.addInitScript(init);
  const p=await boot(ctx);
  ok(await p.evaluate(()=>document.getElementById('sbox').getClientRects().length>0&&document.querySelector('.hero h1').getBoundingClientRect().top>=document.getElementById('sbox').getBoundingClientRect().bottom-1),'trang chủ (hero): ô tìm kiếm hiện, không đè tiêu đề');
  await startAll(p);
  const g=await p.evaluate(()=>{ const r=document.getElementById('sbox').getBoundingClientRect(), t=document.querySelector('.top').getBoundingClientRect(), o=document.getElementById('overviewScreen').getBoundingClientRect(); return {l:r.left,rt:r.right,t:r.top,bt:r.bottom,h:r.height,w:innerWidth,topB:t.bottom,ovT:o.top,sw:document.documentElement.scrollWidth,txt:document.querySelector('.sbA').textContent}; });
  ok(g.h>=40&&g.l>=0&&g.rt<=g.w+0.5,'ô tìm kiếm hiện trên trang All, nằm trong màn hình '+JSON.stringify({l:Math.round(g.l),rt:Math.round(g.rt),h:g.h}));
  ok(g.ovT>=g.bt-1,'trang All bắt đầu dưới ô (ovTop '+g.ovT+' ≥ ô bottom '+Math.round(g.bt)+')'); ok(g.sw<=g.w,'không tràn ngang');
  ok(g.txt==='What do you want to learn today?','câu đầu của chữ chạy');
  await p.screenshot({path:SH+`search_${name}_all.png`});
  // chữ chạy: sau ~3.8s đổi câu
  const t1=await p.evaluate(()=>[...document.querySelectorAll('.sbA,.sbB')].filter(x=>+getComputedStyle(x).opacity>0.5).map(x=>x.textContent)[0]);
  await p.waitForTimeout(3800);
  const t2=await p.evaluate(()=>{ const a=document.querySelector('.sbA'),b=document.querySelector('.sbB'); const vis=[a,b].filter(x=>+getComputedStyle(x).opacity>0.5).map(x=>x.textContent); return vis; });
  ok(t2.length===1&&t2[0]!==t1&&SEARCH_PHS.includes(t2[0]),'chữ chạy đổi câu: '+t1+' → '+t2[0]);
  // mở lớp phủ
  await p.evaluate(()=>document.getElementById('sbox').click()); await p.waitForTimeout(500);
  const o1=await p.evaluate(()=>({open:window.__sov.isOpen(),focus:document.activeElement&&document.activeElement.id,chips:document.querySelectorAll('#sovBody .sovChip').length,secs:[...document.querySelectorAll('#sovBody h3')].map(h=>h.firstChild.textContent),on:document.getElementById('sov').classList.contains('on')}));
  ok(o1.open&&o1.on&&o1.focus==='sovIn','chạm ô: lớp phủ mở, ô nhập được focus '+JSON.stringify(o1));
  ok(o1.secs.includes('Topics')&&o1.secs.includes('Try')&&o1.chips>=8,'lớp phủ trống: Topics + Try (chip '+o1.chips+')');
  await p.screenshot({path:SH+`search_${name}_open.png`});
  await p.keyboard.type('gia dinh',{delay:20}); await p.waitForTimeout(300);
  const r1=await p.evaluate(()=>[...document.querySelectorAll('#sovBody .sovRow b')].map(x=>x.textContent));
  ok(r1[0]==='Family'&&r1.includes('My Family'),'gõ "gia dinh": Family + My Family '+JSON.stringify(r1));
  await p.screenshot({path:SH+`search_${name}_results.png`});
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  let v=await view(p); ok(!v.sov&&v.ov,'Esc đóng lớp phủ, vẫn ở trang All');
  // Enter → mở chủ đề đứng đầu
  await p.evaluate(()=>document.getElementById('sbox').click()); await p.waitForTimeout(400);
  await p.keyboard.type('familly'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.waitForTimeout(1000);
  v=await view(p); ok(!v.sov&&v.ls&&v.topic==='family','sai chính tả "familly" + Enter: mở danh sách Family '+JSON.stringify(v));
  // ô vẫn hiện ở danh sách bài, recent được lưu
  ok(await p.evaluate(()=>document.getElementById('sbox').getClientRects().length>0),'ô tìm kiếm hiện ở danh sách bài');
  await p.evaluate(()=>document.getElementById('sbox').click()); await p.waitForTimeout(400);
  const rc=await p.evaluate(()=>[...document.querySelectorAll('#sovBody .sovChip')].map(x=>x.textContent));
  ok(rc.includes('familly'),'Recent nhớ lượt tìm: '+JSON.stringify(rc.slice(0,3)));
  // chọn bài → vào đúng bài
  await p.evaluate(()=>{ window.__sov.input.value='soviet'; window.__sov.render(); }); await p.waitForTimeout(200);
  ok(await p.evaluate(()=>[...document.querySelectorAll('#sovBody .sovRow b')][0].textContent)==='The Fall of the Soviet Union','"soviet" → Story Liên Xô');
  await p.evaluate(()=>{ window.__sov.input.value='ba me'; window.__sov.render(); }); await p.waitForTimeout(200);
  await p.evaluate(()=>[...document.querySelectorAll('#sovBody .sovRow')].find(r=>r.querySelector('b').textContent==='My Family').click()); await p.waitForTimeout(1500);
  v=await view(p); ok(!v.sov&&!v.ov&&!v.ls&&v.topic==='family','chọn bài "My Family": vào bài (không còn màn hình duyệt) '+JSON.stringify(v));
  ok(await p.evaluate(()=>!document.getElementById('sbox').getClientRects().length),'trong bài đọc: ô tìm kiếm ẩn');
  ok(p.errs.length===0,'không lỗi JS '+JSON.stringify(p.errs));
  await ctx.close();
}
// chọn tag → danh sách lọc theo tag
{ const ctx=await b.newContext(devices['iPhone 13']); await ctx.addInitScript(init); const p=await boot(ctx); await startAll(p);
  await p.evaluate(()=>document.getElementById('sbox').click()); await p.waitForTimeout(300);
  await p.evaluate(()=>{ window.__sov.input.value='daily routine'; window.__sov.render(); }); await p.waitForTimeout(200);
  await p.evaluate(()=>document.querySelector('#sovBody [data-a="tag"]').click()); await p.waitForTimeout(1000);
  const tv=await p.evaluate(()=>({ls:!lscEl.hidden&&lscEl.classList.contains('on'),tag:!!tagMode,cards:document.querySelectorAll('#lscGrid .lscCard').length,head:(document.querySelector('.lscTagHead b')||{}).textContent,pressed:document.querySelectorAll('#topics [aria-pressed="true"]').length,chips:getComputedStyle(document.querySelector('.lscBar')).display}));
  ok(tv.ls&&tv.tag&&tv.cards===3&&tv.head==='#daily routine'&&tv.pressed===0&&tv.chips==='none','tag "daily routine": danh sách lọc 3 bài, không tab nào sáng '+JSON.stringify(tv));
  await p.screenshot({path:SH+'search_tag_list.png'});
  await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  let vv=await view(p); ok(vv.ov&&!vv.ls&&!(await p.evaluate(()=>!!tagMode)),'Esc từ danh sách theo tag: về trang All, thoát chế độ tag '+JSON.stringify(vv));
  await p.evaluate(()=>{ window.__sov.open(); window.__sov.input.value='daily routine'; window.__sov.render(); }); await p.waitForTimeout(200);
  await p.evaluate(()=>document.querySelector('#sovBody [data-a="tag"]').click()); await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('#topics button[data-k="school"]').click()); await p.waitForTimeout(1000);
  vv=await view(p); ok(vv.ls&&vv.topic==='school'&&await p.evaluate(()=>!tagMode&&document.querySelector('#topics [data-k="school"]').getAttribute('aria-pressed')==='true'),'bấm tab School khi đang ở danh sách tag: sang danh sách School '+JSON.stringify(vv));
  await p.evaluate(()=>{ window.__sov.open(); window.__sov.input.value='daily routine'; window.__sov.render(); }); await p.waitForTimeout(200);
  await p.evaluate(()=>document.querySelector('#sovBody [data-a="tag"]').click()); await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('#lscGrid .lscCard:not(.locked)').click()); await p.waitForTimeout(1500);
  vv=await view(p); ok(!vv.ls&&!vv.ov&&!vv.sov,'chạm bài mở khoá trong danh sách tag: vào bài '+JSON.stringify(vv));
  ok(p.errs.length===0,'không lỗi JS '+JSON.stringify(p.errs)); await ctx.close(); }
// chế độ nhẹ và giảm chuyển động: chữ đứng yên
for(const [label,opts,q] of [['LITE',devices['iPhone 13'],'?lite=1'],['reduced-motion',{viewport:{width:390,height:800},reducedMotion:'reduce'},'']]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(init); const p=await boot(ctx,q); await startAll(p);
  await p.waitForTimeout(7500);
  ok(await p.evaluate(()=>document.querySelector('.sbA').textContent==='What do you want to learn today?'&&+getComputedStyle(document.querySelector('.sbA')).opacity===1&&+getComputedStyle(document.querySelector('.sbB')).opacity===0),label+': chữ gợi ý đứng yên ở câu đầu');
  await p.evaluate(()=>document.getElementById('sbox').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>window.__sov.isOpen()),label+': lớp phủ vẫn mở được'); await ctx.close();
}
// tab ẩn: không chạy; lớp phủ mở thì tạm dừng
{ const ctx=await b.newContext(devices['iPhone 13']); await ctx.addInitScript(init); const p=await boot(ctx); await startAll(p);
  await p.evaluate(()=>document.getElementById('sbox').click()); await p.waitForTimeout(3600*2);
  await p.evaluate(()=>window.__sov.close()); await p.waitForTimeout(400);
  ok(await p.evaluate(()=>document.querySelector('.sbA').textContent==='What do you want to learn today?'),'lớp phủ mở: chữ chạy tạm dừng (không đổi câu) '); await ctx.close(); }
await b.close(); srv.close(); console.log(fails?fails+' FAIL':'ALL PASS'); process.exit(fails?1:0);
