import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8791);
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8791/index.html'); await p.waitForTimeout(5500);
await p.click('#topics button[data-k="tech"]'); await p.waitForTimeout(1000);
// tap the phrase to upgrade -> shows A2 caption
await p.evaluate(()=>{const ph=document.querySelector('.passage .sent .ph'); ph.dispatchEvent(new MouseEvent('click',{bubbles:true}));}); await p.waitForTimeout(1400);
await p.screenshot({path:'shots/cap2.png',clip:{x:0,y:260,width:390,height:300}});
console.log(await p.evaluate(()=>{const c=document.querySelector('.passage .sent .cap');return [...c.children].map(e=>[e.tagName,Math.round(e.getBoundingClientRect().top),Math.round(e.getBoundingClientRect().left)]).join(' | ')}));
await b.close(); srv.close();
