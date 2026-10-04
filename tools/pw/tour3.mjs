import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8799);
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8799/index.html'); await p.waitForTimeout(9500);
await p.click('#welcome .w1'); await p.waitForTimeout(1500);
for(let n=1;n<=6;n++){ await p.click('#tourCard .tg2'); await p.waitForTimeout(500); }
console.log('at step 7: notebook count',await p.evaluate(()=>nbLoad().length));
await p.click('#tourCard .tg2'); await p.waitForTimeout(900);
console.log('step 8: picker open',await p.evaluate(()=>player.classList.contains('picker-open')),'nb count',await p.evaluate(()=>nbLoad().length));
await p.click('#tourCard .tb'); await p.waitForTimeout(900); // back to 7
await p.click('#tourCard .tk',{timeout:2000}).catch(()=>{});
await p.evaluate(()=>Tour.end()); await p.waitForTimeout(900);
console.log('after end: nb',await p.evaluate(()=>nbLoad().length),'picker',await p.evaluate(()=>player.classList.contains('picker-open')),'settings',await p.evaluate(()=>player.classList.contains('settings')),'notebook hidden',await p.evaluate(()=>document.querySelector('#notebook').hidden),'tour active',await p.evaluate(()=>Tour.active));
await b.close(); srv.close();
