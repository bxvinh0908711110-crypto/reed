import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8803);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['se',{...devices['iPhone SE']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext({...opts,permissions:['microphone']}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8803/index.html'); await p.waitForTimeout(6500); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900);
  await p.screenshot({path:`shots/rs_${name}_0.png`,clip:{x:0,y:(opts.viewport?opts.viewport.height:opts.viewport?.height||p.viewportSize().height)-110,width:p.viewportSize().width,height:110}});
  await p.click('#micBtn'); await p.waitForTimeout(2600); await p.screenshot({path:`shots/rs_${name}_1.png`,clip:{x:0,y:p.viewportSize().height-110,width:p.viewportSize().width,height:110}});
  await p.click('#player .play'); await p.waitForTimeout(900); await p.screenshot({path:`shots/rs_${name}_2.png`,clip:{x:0,y:p.viewportSize().height-330,width:p.viewportSize().width,height:330}});
  console.log(name,JSON.stringify(await p.evaluate(()=>{const g=s=>{const r=document.querySelector(s).getBoundingClientRect();return [Math.round(r.left),Math.round(r.right),Math.round(r.width)]};return {cmp:g('.rcmp'),redo:g('.rredo'),done:g('.rdone'),sheet:g('#recSheet')}})));
  await ctx.close();
}
await b.close(); srv.close();
