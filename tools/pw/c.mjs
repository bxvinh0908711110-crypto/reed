import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8781);
const b=await chromium.launch();
for(const w of [1440,1320,1280,1000,850]){const p=await b.newPage({viewport:{width:w,height:700}});await p.goto('http://localhost:8781/index.html');await p.waitForTimeout(5200);
 const m=await p.evaluate(()=>{const t=document.querySelector('#topics').getBoundingClientRect(),br=document.querySelector('.brand').getBoundingClientRect(),n=document.querySelector('#nbBtn').getBoundingClientRect();return {W:innerWidth,topicsCenter:Math.round((t.left+t.right)/2),topicsL:Math.round(t.left),topicsR:Math.round(t.right),brandR:Math.round(br.right),nbL:Math.round(n.left)}});
 console.log(JSON.stringify(m)); if(w===1440||w===1000||w===850)await p.screenshot({path:`shots/c_${w}.png`}); await p.close();}
await b.close(); srv.close();
