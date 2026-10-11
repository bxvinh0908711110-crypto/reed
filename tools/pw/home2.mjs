import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8799);
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:720}});
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8799/index.html'); await p.waitForTimeout(5500);
await p.click('#topics button[data-k="work"]'); await p.waitForTimeout(800); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(700);
await p.evaluate(()=>brandHome.click());
for(const t of [120,330,330,500]){ await p.waitForTimeout(t); const o=await p.evaluate(()=>[Math.round(scrollY),+(+getComputedStyle(document.querySelector('.hero h1')).opacity).toFixed(2),+(+getComputedStyle(document.querySelector('.heroImg')).opacity).toFixed(2),+(+getComputedStyle(main).opacity).toFixed(2)]); console.log(t,o); }
await p.waitForTimeout(900); console.log('cuối',await p.evaluate(()=>[Math.round(scrollY),getComputedStyle(document.querySelector('.hero h1')).opacity,document.querySelector('.hero').className,main.className]));
await b.close(); srv.close();
