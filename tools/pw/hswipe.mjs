// Vuốt ngang trong bài = đổi bước (trái = tiếp, phải = lùi); giữ-rồi-trượt chọn bài không bị tính. Chạy: node tools/pw/hswipe.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch(); const ctx=await b.newContext(devices['iPhone 13']);
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const cdp=await ctx.newCDPSession(p);
await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5500);
const T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
async function swipe(x1,y1,x2,y2){ await T('touchStart',x1,y1); for(let i=1;i<=8;i++){ await T('touchMove',x1+(x2-x1)*i/8,y1+(y2-y1)*i/8); await p.waitForTimeout(16);} await T('touchEnd'); await p.waitForTimeout(900); }
const y=()=>p.evaluate(()=>Math.round(scrollY));
// ở hero (chưa vào bài): vuốt ngang không làm gì
let y0=await y(); await swipe(300,500,60,510); ok(await y()===y0,'ở trang chủ: vuốt ngang không đi bước (y='+await y()+')');
// ở trang chủ: vuốt lên / lăn chuột / phím ↓ mở trang tổng quan (như Start Reading), không rơi vào bài
const ovOpen=()=>p.evaluate(()=>ovsEl.classList.contains('on'));
const closeOv=async()=>{ await p.keyboard.press('Escape'); await p.waitForTimeout(700); };
await swipe(200,500,200,200); ok(await ovOpen()&&await y()===0,'trang chủ: vuốt lên mở trang tổng quan (y='+await y()+')'); await closeOv();
await p.mouse.move(200,400); await p.mouse.wheel(0,300); await p.waitForTimeout(900); ok(await ovOpen()&&await y()===0,'trang chủ: lăn chuột xuống mở trang tổng quan'); await closeOv();
await p.keyboard.press('ArrowDown'); await p.waitForTimeout(900); ok(await ovOpen()&&await y()===0,'trang chủ: phím ↓ mở trang tổng quan'); await closeOv();
await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1200); const yIn=await y(); ok(yIn>300,'đi thẳng vào bài bằng goStep (y='+yIn+')');
await swipe(200,500,200,200); const yNext=await y(); ok(yNext>yIn,'trong bài: vuốt lên = bước kế ('+yIn+' → '+yNext+')'); await swipe(200,300,200,600);
await swipe(300,500,60,510); const y1=await y(); ok(y1>yIn,'vuốt trái = bước kế ('+yIn+' → '+y1+')');
await swipe(60,500,300,510); const y2=await y(); ok(y2<y1,'vuốt phải = bước trước ('+y1+' → '+y2+')');
await swipe(200,400,230,410); ok(await y()===y2,'vuốt ngang ngắn (30px): không đổi bước');
// giữ rồi trượt ngang chọn bài: không đi bước
const box=await p.locator('#lessonContent').boundingBox(); const cx=box.x+box.width/2, cy=box.y+box.height/2;
const yb=await y(); await T('touchStart',cx,cy); await p.waitForTimeout(700); for(let i=1;i<=8;i++){ await T('touchMove',cx-i*14,cy); await p.waitForTimeout(30); } await T('touchEnd'); await p.waitForTimeout(900);
ok(await y()===yb,'giữ rồi trượt ngang chọn bài: không đổi bước ('+yb+' → '+await y()+')');
ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:''));
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
