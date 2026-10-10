import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8813);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch();
for(const [name,opts] of [['desktop',{viewport:{width:1280,height:720}}],['mobile',{...devices['iPhone 13']}]]){
  const ctx=await b.newContext(opts); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8813/index.html?edit'); await p.waitForTimeout(6500);
  const info=()=>p.evaluate(()=>{const i=document.querySelector('.heroImg').getBoundingClientRect();return {panel:!document.querySelector('#heroPanel').hidden,mode:document.querySelector('#hpMode').textContent,img:[Math.round(i.left),Math.round(i.top),Math.round(i.width)],welcome:Tour.welcomeOpen,out:document.querySelector('#hpOut').value}});
  console.log(name,'open',JSON.stringify(await info()));
  const box=await p.locator('.heroImg').boundingBox(); const cx=box.x+box.width*0.5, cy=box.y+box.height*0.5;
  await p.mouse.move(cx,cy); await p.mouse.down(); for(let i=1;i<=5;i++){ await p.mouse.move(cx-16*i,cy-8*i); await p.waitForTimeout(40); } await p.mouse.up(); await p.waitForTimeout(200);
  console.log(name,'after drag',JSON.stringify(await info()),'scrollY',await p.evaluate(()=>scrollY));
  await p.fill('#hpWn','70'); await p.waitForTimeout(200); console.log(name,'width=70',(await info()).img,(await info()).out);
  await p.screenshot({path:`shots/panel_${name}.png`});
  await p.reload(); await p.waitForTimeout(3500); console.log(name,'persist',(await info()).out);
  await p.click('#hpReset'); console.log(name,'reset',(await info()).out,errs);
  await ctx.close();
}
await b.close(); srv.close();
