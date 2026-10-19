// Công tắc Auto-play (tự đọc khi sang câu mới, mặc định bật). Chạy: node tools/pw/auto.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
fs.mkdirSync('tools/pw/shots',{recursive:true});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for(const [name,opts] of [['13',devices['iPhone 13']],['SE',devices['iPhone SE']],['desktop',{viewport:{width:1280,height:720}}]]){
  console.log('--',name);
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{window.__played=[]; const op=HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play=function(){ try{ window.__played.push(this.src.split('/audio/')[1]||this.src); }catch(e){} return op.apply(this,arguments); }; localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  const src=()=>p.evaluate(()=>{ const l=window.__played.filter(x=>/^(fe)?male[/]/.test(x)); return l.length?l[l.length-1]:null; });
  const mark=()=>p.evaluate(()=>{ window.__played=[]; });
  ok(await p.evaluate(()=>document.querySelector('#autoBtn').getAttribute('aria-pressed')==='true'),'mặc định bật');
  const said=()=>p.evaluate(()=>{ const inv=Object.fromEntries(Object.entries(AUDIO).map(([k,v])=>[v,k])); return window.__played.filter(x=>/^(fe)?male[/]/.test(x)).map(x=>inv[x.split('/')[1].replace('.mp3','')]); });
  const mark2=()=>p.evaluate(()=>{ window.__played=[]; });
  ok((await said()).length===0,'ở trang chủ: không tự phát');
  await mark2(); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(2000);
  ok((await said()).length===0,'vào bài, câu đầu không có cụm A1/A2: không đọc gì');
  await mark2(); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1800);
  let sa=await said(); ok(sa.length===1&&sa[0]==='father and mother','sang câu có cụm: chỉ đọc cụm A1, không đọc cả câu '+JSON.stringify(sa));
  await mark2(); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1800);
  sa=await said(); ok(sa.length===1&&sa[0]==='parents','bước kế (A1 → A2): đọc cụm A2 '+JSON.stringify(sa));
  // chạm cụm: chỉ phát một lần (không đọc đôi)
  await mark2(); await p.evaluate(()=>{ document.querySelector('.sent .ph').click(); }); await p.waitForTimeout(2200);
  sa=await said(); ok(sa.length===1,'chạm cụm: đọc đúng một lần '+JSON.stringify(sa));
  // vuốt nhanh nhiều bước: không chồng
  await mark2(); await p.evaluate(()=>{ goStep(1); }); await p.waitForTimeout(950); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1800);
  sa=await said(); ok(sa.length>=1&&sa.length<=2&&sa.every(x=>x.split(' ').length<=4),'qua nhiều bước: chỉ đọc cụm, ít lần phát '+JSON.stringify(sa));
  // tắt công tắc
  await p.evaluate(()=>document.querySelector('#openSettings').click()); await p.waitForTimeout(600);
  const lay=await p.evaluate(()=>{ const R=e=>{const r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.right),Math.round(r.width)]}; const bar=R(document.querySelector('#player')); const bs=[...document.querySelectorAll('.settings-row button')].map(R); return {bar,btns:bs,minW:Math.min(...bs.map(x=>x[2])),inside:bs.every(x=>x[0]>=bar[0]-1&&x[1]<=bar[1]+1)}; });
  ok(lay.inside&&lay.minW>=30,'hàng cài đặt: mọi nút nằm trong thanh, rộng ≥ 30px '+JSON.stringify({minW:lay.minW,inside:lay.inside,bar:lay.bar}));
  await p.screenshot({path:`tools/pw/shots/auto_${name}.png`,clip:{x:0,y:(opts.viewport?.height||opts.screen?.height||720)-130,width:opts.viewport?.width||opts.screen?.width||390,height:130}});
  await p.evaluate(()=>document.querySelector('#autoBtn').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>document.querySelector('#autoBtn').getAttribute('aria-pressed')==='false'&&localStorage.getItem('reed_autoplay')==='0'),'tắt công tắc: lưu trong máy');
  await p.evaluate(()=>document.querySelector('#closeSettings').click()); await p.waitForTimeout(500);
  await p.evaluate(()=>{ stopAll(); }); await mark2(); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1800);
  ok((await said()).length===0,'công tắc tắt: sang câu mới không tự đọc');
  await p.reload(); await p.waitForTimeout(5000);
  ok(await p.evaluate(()=>document.querySelector('#autoBtn').getAttribute('aria-pressed')==='false'),'tải lại trang: vẫn tắt');
  ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:'')); await ctx.close();
}
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
