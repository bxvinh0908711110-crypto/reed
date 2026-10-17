// Kiểm thử PWA trên bản deploy/: manifest, service worker, offline, Range âm thanh, tải sẵn âm thanh, cập nhật, nút cài app.
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='E:/Your English/deploy/';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg'};
let swSuffix='';   // đổi để mô phỏng bản mới của sw.js
const srv=http.createServer((q,r)=>{
  const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';
  if(q.url.split('?')[0]==='/index.html'){ r.statusCode=307; r.setHeader('Location','/'); r.end(); return; }   // giống Cloudflare: /index.html chuyển về /
  try{
    let buf=fs.readFileSync(ROOT+u); const ext=path.extname(u);
    if(u==='sw.js'&&swSuffix) buf=Buffer.from(buf.toString('utf8').replace('"reed-v2"','"reed-v2'+swSuffix+'"'));
    r.setHeader('Content-Type',MIME[ext]||'application/octet-stream');
    if(u==='sw.js'||u==='index.html') r.setHeader('Cache-Control','no-cache');
    r.setHeader('Accept-Ranges','bytes'); r.end(buf);
  }catch{ r.statusCode=404; r.end(); }
}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
const base=`http://localhost:${port}/`;
let fails=0; const ok=(c,msg)=>{ console.log((c?'PASS ':'FAIL ')+msg); if(!c) fails++; };
const b=await chromium.launch();
const newCtx=async(opts={},init)=>{ const c=await b.newContext(opts); await c.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); if(init) await c.addInitScript(init); await c.route('**/*supabase.co/**',r=>r.abort()); return c; };

// ---------- 1. Cài đặt, manifest, offline ----------
{
  const ctx=await newCtx({viewport:{width:1280,height:720}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/supabase|Failed to load resource/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base+'index.html'); await p.waitForTimeout(5500);
  const man=await p.evaluate(async()=>{ const href=document.querySelector('link[rel=manifest]').href; const m=await (await fetch(href)).json(); const r=await Promise.all(m.icons.map(i=>fetch(new URL(i.src,href)).then(x=>x.status))); return {name:m.name,display:m.display,icons:m.icons.length,iconStatus:r,start:m.start_url}; });
  ok(man.display==='standalone'&&man.icons===3&&man.iconStatus.every(s=>s===200),'manifest hợp lệ, 3 icon tải được '+JSON.stringify(man));
  ok(await p.evaluate(()=>!!document.querySelector('link[rel=apple-touch-icon]')&&!!document.querySelector('meta[name=theme-color]')),'có apple-touch-icon và theme-color');
  await p.evaluate(()=>navigator.serviceWorker.ready); await p.reload(); await p.waitForTimeout(3500);
  ok(await p.evaluate(()=>!!navigator.serviceWorker.controller),'service worker điều khiển trang sau lần tải thứ hai');
  const cached=await p.evaluate(async()=>{ const ks=await caches.keys(); const sh=ks.find(k=>k.endsWith('-shell')); const c=await caches.open(sh); return {keys:ks,n:(await c.keys()).length}; });
  ok(cached.n>=15,'đã lưu khung app: '+cached.n+' file ('+cached.keys.join(', ')+')');
  const fontsOk=await p.evaluate(async()=>{ await document.fonts.ready; return [...document.fonts].filter(f=>f.family.includes('Inter')&&f.status==='loaded').length; });
  ok(fontsOk>=1,'phông Inter tự lưu đã nạp ('+fontsOk+' mặt)');
  // âm thanh: tải khi online → offline vẫn có (cả Range kiểu Safari)
  const aUrl=await p.evaluate(()=>new URL('audio/female/'+Object.values(AUDIO)[0]+'.mp3',location.href).href);
  const online=await p.evaluate(async u=>{ const r=await fetch(u); return {s:r.status,n:(await r.arrayBuffer()).byteLength}; },aUrl);
  ok(online.s===200&&online.n>1000,'âm thanh tải được khi online ('+online.n+' byte)');
  await ctx.setOffline(true);
  const off=await p.evaluate(async u=>{ const a=await fetch(u); const n=(await a.arrayBuffer()).byteLength; const r=await fetch(u,{headers:{Range:'bytes=0-1'}}); const rb=(await r.arrayBuffer()).byteLength; const r2=await fetch(u,{headers:{Range:'bytes=100-'}}); return {full:a.status,n,range:r.status,cr:r.headers.get('Content-Range'),rb,open:r2.status,openCR:r2.headers.get('Content-Range')}; },aUrl);
  ok(off.full===200&&off.n===online.n,'offline: âm thanh đã lưu trả về đủ '+off.n+' byte');
  ok(off.range===206&&off.rb===2&&/^bytes 0-1\//.test(off.cr)&&off.open===206,'offline: yêu cầu Range trả 206 đúng ('+off.cr+' | '+off.openCR+')');
  await p.reload(); await p.waitForTimeout(4500);
  const offPage=await p.evaluate(()=>({h1:!!document.querySelector('.hero h1'),topics:document.querySelectorAll('#topics button').length,heroImg:document.querySelector('.heroImg').naturalWidth,lessons:typeof passages!=='undefined'&&passages.length}));
  ok(offPage.h1&&offPage.topics>=7&&offPage.heroImg>0&&offPage.lessons>0,'offline: tải lại trang vẫn chạy '+JSON.stringify(offPage));
  await p.evaluate(()=>{ document.querySelector('#startBtn').click(); }); await p.waitForTimeout(900); await p.evaluate(()=>{ document.querySelector('.lscCard').click(); }); await p.waitForTimeout(1600);   // Start Reading mở danh sách bài, chọn bài 1
  ok(await p.evaluate(()=>scrollY)>300,'offline: Start Reading vào được bài (scrollY='+await p.evaluate(()=>Math.round(scrollY))+')');
  await ctx.setOffline(false);
  ok(errs.length===0,'không lỗi JS/console'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await ctx.close();
}

// ---------- 1b. Ngoại tuyến ngay sau lần cài đầu (chưa có lần điều hướng nào qua service worker) ----------
{
  const ctx=await newCtx({viewport:{width:1280,height:720}}); const p=await ctx.newPage();
  await p.goto(base+'index.html'); await p.waitForTimeout(4500); await p.evaluate(()=>navigator.serviceWorker.ready); await p.waitForTimeout(800);
  await ctx.setOffline(true);
  const resp=await p.goto(base,{timeout:15000}).catch(e=>({err:String(e).slice(0,80)}));
  await p.waitForTimeout(3500);
  const okPage=await p.evaluate(()=>!!document.querySelector('.hero h1')).catch(()=>false);
  ok(okPage,'offline ngay sau lần cài đầu: trang chính tải được từ bản đã lưu (không bị lỗi "redirected")');
  await ctx.setOffline(false); await ctx.close();
}

// ---------- 2. Tải sẵn âm thanh qua service worker ----------
{
  const ctx=await newCtx({viewport:{width:1280,height:720}}); const p=await ctx.newPage();
  await p.goto(base+'index.html'); await p.waitForTimeout(5000); await p.evaluate(()=>navigator.serviceWorker.ready);
  const r=await p.evaluate(()=>new Promise(res=>{ const urls=[]; Object.values(AUDIO).slice(0,20).forEach(id=>['female','male'].forEach(v=>urls.push(new URL(`audio/${v}/${id}.mp3`,location.href).href))); const msgs=[]; navigator.serviceWorker.addEventListener('message',e=>{ msgs.push(e.data.type); if(e.data.type==='AUDIO_DONE') caches.open('reed-audio-v1').then(c=>c.keys()).then(k=>res({n:k.length,expected:urls.length,msgs:[...new Set(msgs)]})); }); navigator.serviceWorker.controller?navigator.serviceWorker.controller.postMessage({type:'PRECACHE_AUDIO',urls}):navigator.serviceWorker.ready.then(g=>g.active.postMessage({type:'PRECACHE_AUDIO',urls})); setTimeout(()=>res({timeout:true}),20000); }));
  ok(!r.timeout&&r.n>=r.expected,'tải sẵn âm thanh: '+JSON.stringify(r));
  await ctx.close();
}

// ---------- 3. Cập nhật: bản mới → thanh "Có bản mới" → bấm → nạp lại bằng bản mới ----------
{
  const ctx=await newCtx({viewport:{width:1280,height:720}}); const p=await ctx.newPage();
  await p.goto(base+'index.html'); await p.waitForTimeout(5000); await p.evaluate(()=>navigator.serviceWorker.ready); await p.reload(); await p.waitForTimeout(3000);
  swSuffix='-test2';
  await p.evaluate(()=>navigator.serviceWorker.getRegistration().then(r=>r.update())); await p.waitForTimeout(2500);
  const bar=await p.evaluate(()=>{ const b=document.querySelector('.pwaBar'); return b?{show:b.classList.contains('show'),text:b.textContent.trim()}:null; });
  ok(bar&&bar.show&&/Có bản mới/.test(bar.text),'thanh cập nhật hiện: '+JSON.stringify(bar));
  const nav=p.waitForNavigation({timeout:8000}).catch(()=>null);
  await p.evaluate(()=>document.querySelector('.pwaBar button').click()); await nav; await p.waitForTimeout(3000);
  const keys=await p.evaluate(()=>caches.keys());
  ok(keys.includes('reed-v2-test2-shell')&&!keys.includes('reed-v2-shell'),'sau cập nhật: cache mới thay cache cũ ('+keys.join(', ')+')');
  swSuffix=''; await ctx.close();
}

// ---------- 4. Nút cài app ----------
{
  const ctx=await newCtx({viewport:{width:1280,height:720}}); const p=await ctx.newPage();
  await p.goto(base+'index.html'); await p.waitForTimeout(4500);
  await p.evaluate(()=>{ const e=new Event('beforeinstallprompt'); e.prompt=()=>{ window.__prompted=1; }; e.userChoice=Promise.resolve({outcome:'dismissed'}); window.dispatchEvent(e); });
  await p.waitForTimeout(600);
  const pill=await p.evaluate(()=>{ const x=document.querySelector('.pwaPill'); if(!x) return null; const r=x.getBoundingClientRect(); return {text:x.textContent.trim(),visible:getComputedStyle(x).display!=='none',inView:r.bottom<=innerHeight&&r.top>=0}; });
  ok(pill&&pill.visible&&pill.inView&&/Cài app/.test(pill.text),'nút "Cài app" hiện ở màn hình đầu '+JSON.stringify(pill));
  await p.screenshot({path:'tools/pw/shots/pwa_pill_desktop.png'});
  await p.evaluate(()=>document.querySelector('.pwaGo').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>window.__prompted===1),'bấm nút gọi hộp thoại cài app');
  // ẩn khi vào bài
  await p.evaluate(()=>{ const e=new Event('beforeinstallprompt'); e.prompt=()=>{}; e.userChoice=Promise.resolve({}); window.dispatchEvent(e); }); await p.waitForTimeout(300);
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(900); await p.evaluate(()=>document.querySelector('.lscCard').click()); await p.waitForTimeout(1600);
  ok(await p.evaluate(()=>{ const x=document.querySelector('.pwaPill'); return !x||getComputedStyle(x).display==='none'; }),'nút cài ẩn khi đã vào bài');
  await ctx.close();
  // đã cài (standalone): không hiện nút, tự tải sẵn âm thanh
  const ctx2=await newCtx({viewport:{width:1280,height:720}},()=>{ const mm=window.matchMedia.bind(window); window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}:mm(q); });
  const p2=await ctx2.newPage(); await p2.goto(base+'index.html'); await p2.waitForTimeout(5000);
  await p2.evaluate(()=>{ const e=new Event('beforeinstallprompt'); e.prompt=()=>{}; e.userChoice=Promise.resolve({}); window.dispatchEvent(e); }); await p2.waitForTimeout(400);
  ok(await p2.evaluate(()=>!document.querySelector('.pwaPill')),'chạy ở chế độ standalone: không hiện nút cài');
  for(let t=0;t<60;t++){ const have=await p2.evaluate(()=>caches.open('reed-audio-v1').then(c=>c.keys()).then(k=>[k.length,new Set(Object.values(AUDIO)).size*2])); if(have[0]>=have[1]) break; await p2.waitForTimeout(1000); }
  const n=await p2.evaluate(()=>caches.open('reed-audio-v1').then(c=>c.keys()).then(k=>[k.length,new Set(Object.values(AUDIO)).size*2]));
  ok(n[0]>=n[1]&&n[0]>0,'standalone: tự tải sẵn toàn bộ âm thanh ('+n[0]+'/'+n[1]+')');
  await ctx2.close();
  // iOS Safari (giả lập UA): hướng dẫn "Thêm vào MH chính"
  const ctx3=await newCtx({...devices['iPhone 13']}); const p3=await ctx3.newPage(); await p3.goto(base+'index.html'); await p3.waitForTimeout(9000);
  const ip=await p3.evaluate(()=>{ const x=document.querySelector('.pwaPill'); if(!x) return null; const r=x.getBoundingClientRect(); return {text:x.textContent.trim(),cx:Math.round(r.left+r.width/2),vw:innerWidth,bottom:Math.round(innerHeight-r.bottom)}; });
  ok(ip&&/Thêm vào MH chính/.test(ip.text),'iOS: hiện nút hướng dẫn '+JSON.stringify(ip));
  await p3.screenshot({path:'tools/pw/shots/pwa_pill_ios.png'});
  await p3.evaluate(()=>document.querySelector('.pwaGo').click()); await p3.waitForTimeout(500);
  ok(await p3.evaluate(()=>/Chia sẻ/.test(document.querySelector('.pwaBar').textContent)),'iOS: bấm nút hiện hướng dẫn Chia sẻ');
  await p3.screenshot({path:'tools/pw/shots/pwa_hint_ios.png'});
  await ctx3.close();
}
await b.close(); srv.close();
console.log(fails?`\n${fails} kiểm tra rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
