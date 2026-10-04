import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8805);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch();
for(const [name,opts] of [['mobile',{...devices['iPhone 13'],deviceScaleFactor:3}],['desktop',{viewport:{width:1280,height:720},deviceScaleFactor:2}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8805/index.html'); await p.waitForTimeout(6500);
  await p.evaluate(()=>{document.querySelector('#micBtn').classList.add('has')}); await p.waitForTimeout(300);
  const bx=await p.locator('#micBtn').boundingBox();
  await p.screenshot({path:`shots/badge_${name}.png`,clip:{x:bx.x-30,y:bx.y-24,width:bx.width+110,height:bx.height+48}});
  await ctx.close();
}
await b.close(); srv.close();
