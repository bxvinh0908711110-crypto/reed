import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const srv=http.createServer((q,r)=>{const f='E:/Your English/'+decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{r.end(fs.readFileSync(f.endsWith('/')?f+'index.html':f))}catch{r.statusCode=404;r.end()}}).listen(8777);
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']}); const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const reqs=[]; p.on('request',r=>r.url().includes('supabase')&&reqs.push(r.url().slice(0,70)));
await p.goto('http://localhost:8777/index.html'); await p.waitForTimeout(5000);
console.log('remote used:',await p.evaluate(()=>!!(window.__PASSAGES&&window.__PASSAGES.length)), 'lessons:',await p.evaluate(()=>passages.length), 'uid?',await p.evaluate(()=>!!passages[0].uid));
console.log('title0',await p.evaluate(()=>passages[0].topic),'phrases',await p.evaluate(()=>passages.map(x=>x.hl.length)));
console.log('cache saved:',await p.evaluate(()=>!!localStorage.getItem('reed_lessons_v1')));
console.log('requests:',reqs.length,'errors:',errs.slice(0,3));
await p.screenshot({path:'shots/remote.png'});
// offline: block supabase, clear nothing -> should use cache; then clear cache -> embedded
const ctx2=await b.newContext({...devices['iPhone 13']}); await ctx2.route('**/*supabase.co/**',r=>r.abort());
const p2=await ctx2.newPage(); await p2.goto('http://localhost:8777/index.html'); await p2.waitForTimeout(5000);
console.log('blocked, no cache -> embedded lessons:',await p2.evaluate(()=>passages.length),'remote?',await p2.evaluate(()=>!!window.__PASSAGES));
await b.close(); srv.close();
