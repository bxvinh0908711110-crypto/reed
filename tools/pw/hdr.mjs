import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8788);
const b=await chromium.launch();
for(const [w,h] of [[1440,800],[1280,720],[1000,700]]){const p=await b.newPage({viewport:{width:w,height:h}});await p.route('**/*supabase.co/**',r=>r.abort());await p.goto('http://localhost:8788/index.html');await p.waitForTimeout(5200);
 await p.click('#topics button[data-k="work"]');await p.waitForTimeout(900);
 const m=await p.evaluate(()=>{const g=s=>document.querySelector(s).getBoundingClientRect();return {brandTop:Math.round(g('.brand').top),topicsTop:Math.round(g('#topics').top),topicsBottom:Math.round(g('#topics').bottom),labelTop:Math.round(g('.passage .label').top),textTop:Math.round(g('.passage .sents').top)}});
 console.log(w,JSON.stringify(m)); await p.screenshot({path:`tools/pw/shots/hdr_${w}.png`}); await p.close();}
await b.close(); srv.close();
