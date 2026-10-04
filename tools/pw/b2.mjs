import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const srv=http.createServer((q,r)=>{const f='E:/Your English/'+decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{r.end(fs.readFileSync(f))}catch{r.statusCode=404;r.end()}}).listen(8778);
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']}); const p=await ctx.newPage();
await p.goto('http://localhost:8778/index.html'); await p.waitForTimeout(4500);
await ctx.route('**/*supabase.co/**',r=>r.abort());
await p.reload(); await p.waitForTimeout(6500);
console.log('offline reload uses cache:',await p.evaluate(()=>[passages.length,!!passages[0].uid]));
await b.close(); srv.close();
