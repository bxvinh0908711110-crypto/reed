// Chụp trang All ở nhiều cỡ để xem bố cục. Chạy: node tools/pw/shot_all.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.json':'application/json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.writeHead(200,{'content-type':MIME[path.extname(u)]||'application/octet-stream'});r.end(b);}catch(e){r.writeHead(404);r.end();}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
fs.mkdirSync('E:/Your English/tools/pw/shots',{recursive:true});
const b=await chromium.launch();
for(const [name,opts] of [['m390',devices['iPhone 13']],['t834',{viewport:{width:834,height:1112},hasTouch:true}],['d1280',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({s:1}));});
  const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(4500);
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(1200);
  await p.screenshot({path:`E:/Your English/tools/pw/shots/all_${name}.png`}); console.log(name,'ok');
  await ctx.close();
}
await b.close(); srv.close();
