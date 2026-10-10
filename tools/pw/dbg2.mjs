import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs';
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8814);
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}}); await p.route('**/*supabase.co/**',r=>r.abort());
await p.goto('http://localhost:8814/index.html?edit'); await p.waitForTimeout(8000);
console.log(await p.evaluate(()=>[location.search,Tour.welcomeOpen,document.body.className]));
await b.close(); srv.close();
