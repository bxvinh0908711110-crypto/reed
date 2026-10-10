import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8816);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch();
for(const [name,opts] of [['se',{...devices['iPhone SE']}],['pm',{...devices['iPhone 14 Pro Max']}],['m13',{...devices['iPhone 13']}],['d',{viewport:{width:1280,height:720}}],['w900',{viewport:{width:900,height:700}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8816/index.html'); await p.waitForTimeout(6500);
  const m=await p.evaluate(()=>{const t=document.querySelector('#tipBtn').getBoundingClientRect(),n=document.querySelector('#nbBtn').getBoundingClientRect(),br=document.querySelector('.brand').getBoundingClientRect(),tp=document.querySelector('#topics').getBoundingClientRect();return {W:innerWidth,docW:document.documentElement.scrollWidth,tip:[Math.round(t.left),Math.round(t.right)],nb:[Math.round(n.left),Math.round(n.right)],brandR:Math.round(br.right),topics:[Math.round(tp.left),Math.round(tp.right),Math.round(tp.top)]}});
  console.log(name,JSON.stringify(m)); await p.screenshot({path:`shots/how_${name}.png`,clip:{x:0,y:0,width:opts.viewport?.width||390,height:130}});
  if(name==='m13'){ await p.click('#tipBtn'); await p.waitForTimeout(1000); console.log('click -> tour',await p.evaluate(()=>Tour.active)); }
  await ctx.close();
}
await b.close(); srv.close();
