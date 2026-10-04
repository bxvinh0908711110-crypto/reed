import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8790);
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8790/index.html'); await p.waitForTimeout(5500);
for(const k of ['health','tech']){await p.click(`#topics button[data-k="${k}"]`);await p.waitForTimeout(1100);await p.screenshot({path:`shots/sc_${k}.png`,clip:{x:0,y:100,width:390,height:260}});}
const miss=await p.evaluate(()=>ALL.filter(l=>!scenes[l.scene]).map(l=>l.topic)); console.log('lessons without scene:',miss);
await b.close(); srv.close();
