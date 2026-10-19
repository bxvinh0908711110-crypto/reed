// Kiểm tra nhanh site đã đăng (mặc định Cloudflare): node tools/pw/live.mjs [địa chỉ]
import { chromium } from 'playwright';
const base=(process.argv[2]||'https://reed.tothanhhuy1207.workers.dev').replace(/\/?$/,'/');
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:720}});
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(base,{waitUntil:'load'}); await p.waitForTimeout(6000);
ok(await p.evaluate(()=>!!document.querySelector('.hero h1')&&document.querySelectorAll('#topics button').length>=7),'trang chính chạy, có 7 chủ đề');
ok(await p.evaluate(()=>typeof passages!=='undefined'&&passages.length>0),'đã nạp bài (Supabase hoặc dữ liệu nhúng)');
await p.evaluate(()=>navigator.serviceWorker.ready); await p.waitForTimeout(1500);
const sw=await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return {active:!!(r&&r.active),ctrl:!!navigator.serviceWorker.controller,keys:await caches.keys()}});
ok(sw.active&&sw.keys.some(k=>k==='reed-v4-shell'),'service worker đã chạy, cache khung app: '+JSON.stringify(sw.keys));
const shellN=await p.evaluate(async()=>{const c=await caches.open('reed-v4-shell');return (await c.keys()).length});
ok(shellN>=15,'đã lưu '+shellN+' file khung app');
// âm thanh qua service worker (Range kiểu Safari)
const a=await p.evaluate(async()=>{const u=new URL('audio/female/'+Object.values(AUDIO)[0]+'.mp3',location.href).href;const r=await fetch(u,{headers:{Range:'bytes=0-1'}});return {s:r.status,cr:r.headers.get('Content-Range'),viaSW:!!navigator.serviceWorker.controller}});
ok(a.s===206&&/^bytes 0-1\//.test(a.cr||''),'Range âm thanh trả 206 (qua service worker: '+a.viaSW+', '+a.cr+')');
// offline ngay sau lần cài đầu
await ctx.setOffline(true);
await p.goto(base,{timeout:15000}).catch(()=>{}); await p.waitForTimeout(3500);
ok(await p.evaluate(()=>!!document.querySelector('.hero h1')).catch(()=>false),'tắt mạng, tải lại vẫn vào được trang chính');
await ctx.setOffline(false);
ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:''));
await b.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
