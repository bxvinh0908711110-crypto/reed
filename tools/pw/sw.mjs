import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8789);
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:720}}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8789/index.html'); await p.waitForTimeout(5500);
await p.click('#topics button[data-k="tech"]');
for(const t of [60,160,260,420,900]){await p.waitForTimeout(t===60?60:t-[60,160,260,420,900][[60,160,260,420,900].indexOf(t)-1]);
 const o=await p.evaluate(()=>({main:+getComputedStyle(document.querySelector('#main')).opacity,cls:document.querySelector('#main').className,art:+(+getComputedStyle(document.querySelector('.passage .art')).opacity).toFixed(2),topic:curTopic}));
 console.log(t+'ms',JSON.stringify(o));}
await p.screenshot({path:'shots/sw_tech.png'});
// double click guard + switch rapidly
await p.click('#topics button[data-k="family"]'); await p.click('#topics button[data-k="work"]'); await p.waitForTimeout(2200);
console.log('after rapid clicks topic:',await p.evaluate(()=>[curTopic,passages[0].topic,Math.round(scrollY)]),'errors',errs);
await b.close(); srv.close();
