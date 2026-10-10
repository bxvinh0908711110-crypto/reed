import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8817);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch();
for(const [name,opts] of [['d1920',{viewport:{width:1920,height:900}}],['d1440',{viewport:{width:1440,height:800}}],['d1280',{viewport:{width:1280,height:720}}],['d1000',{viewport:{width:1000,height:700}}],['m13',{...devices['iPhone 13']}],['se',{...devices['iPhone SE']}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8817/index.html'); await p.waitForTimeout(6500);
  const m=await p.evaluate(()=>{const c=s=>{const r=document.querySelector(s).getBoundingClientRect();return Math.round(r.top+r.height/2)};return {brand:c('.brand'),topics:c('#topics'),tip:c('#tipBtn'),nb:c('#nbBtn'),W:innerWidth,docW:document.documentElement.scrollWidth}});
  console.log(name,JSON.stringify(m)); if(name==='d1440'||name==='m13') await p.screenshot({path:`shots/align_${name}.png`,clip:{x:0,y:0,width:opts.viewport?.width||390,height:130}});
  await ctx.close();
}
await b.close(); srv.close();
