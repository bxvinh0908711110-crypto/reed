import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs';
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8815);
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}}); await p.route('**/*supabase.co/**',r=>r.abort());
await p.goto('http://localhost:8815/index.html?edit'); await p.waitForTimeout(6000);
await p.evaluate(()=>{window.__ev=[];const i=document.querySelector('.heroImg');['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture'].forEach(t=>i.addEventListener(t,e=>__ev.push(t+':'+Math.round(e.clientX)),true))});
const box=await p.locator('.heroImg').boundingBox(); const cx=box.x+box.width/2, cy=box.y+box.height/2;
await p.mouse.move(cx,cy); await p.mouse.down(); for(let i=1;i<=4;i++){await p.mouse.move(cx-20*i,cy); await p.waitForTimeout(40);} await p.mouse.up();
console.log(await p.evaluate(()=>__ev));
await b.close(); srv.close();
