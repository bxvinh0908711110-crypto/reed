// Hero demo Word to Word: HAI thẻ (chó + mèo) hiện cùng lúc. Chạy: node tools/pw/demo.mjs   (ảnh: tools/pw/shots/demo_*.png)
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
fs.mkdirSync('tools/pw/shots',{recursive:true});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch();
const ph={hasTouch:true,isMobile:true,deviceScaleFactor:2};
const CASES=[
  ['w320x568',{viewport:{width:320,height:568},...ph},''],
  ['w320',{viewport:{width:320,height:640},...ph},''],
  ['w375x667',{viewport:{width:375,height:667},...ph},''],
  ['w390',{...devices['iPhone 13']},''],
  ['w834',{viewport:{width:834,height:1112}},''],
  ['w1280',{viewport:{width:1280,height:720}},''],
  ['lite390',{...devices['iPhone 13']},'?lite=1'],
  ['reduce1280',{viewport:{width:1280,height:720},reducedMotion:'reduce'},''],
];
const rgb=s=>s.startsWith('color(')?s.match(/[\d.]+/g).slice(0,3).map(v=>Math.round(v*255)):s.match(/\d+/g).slice(0,3).map(Number);
const near=(c,h)=>{ const e=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); return rgb(c).every((v,i)=>Math.abs(v-e[i])<=6); };
for(const [name,opts,qs] of CASES){
  console.log('--',name);
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/${qs}`); await p.waitForTimeout(1500);
  const info=()=>p.evaluate(()=>{
    const root=document.getElementById('heroDemo'), nav=document.getElementById('bnav'), nr=nav&&getComputedStyle(nav).display!=='none'?nav.getBoundingClientRect():null;
    const cards=[...root.querySelectorAll('.dmCard')].map(c=>{
      const r=c.getBoundingClientRect(), ph=c.querySelector('.ph'), line=c.querySelector('.dmLine'), lr=line.getBoundingClientRect(), pr=ph.getBoundingClientRect(), art=c.querySelector('.dmArt').getBoundingClientRect(), img=c.querySelector('.dmAnimal');
      return {top:r.top,bot:r.bottom,f:ph._f,color:getComputedStyle(ph).color,fs:parseFloat(getComputedStyle(line).fontSize),lh:lr.height,sw:line.scrollWidth,cw:line.clientWidth,inCard:pr.left>=r.left&&pr.right<=r.right,gap:art.left-lr.right,img:img.complete&&img.naturalWidth>0,t:[...ph.querySelectorAll('.o')].map(o=>o.textContent),op:[...ph.querySelectorAll('.o')].map(o=>+getComputedStyle(o).opacity)};
    });
    const rr=root.getBoundingClientRect();
    return {cards,vw:innerWidth,docW:document.documentElement.scrollWidth,navTop:nr?nr.top:innerHeight,rootL:rr.left,rootR:rr.right};
  });
  const a=await info(), [d,c]=a.cards;
  ok(a.cards.length===2&&d.t[0]==='baby dog'&&c.t[0]==='baby cat','hai thẻ cùng hiện: chó (baby dog→puppy) và mèo (baby cat→kitten)');
  ok(d.img&&c.img,'cả hai ảnh tải được');
  ok(a.vw>1100?(c.top===d.top):(d.bot<=c.top+1&&c.top>d.top),`hai thẻ ${a.vw>1100?'cạnh nhau':'xếp chồng'}, không đè nhau (chó ${Math.round(d.top)}-${Math.round(d.bot)}, mèo ${Math.round(c.top)}-${Math.round(c.bot)})`);
  ok(c.bot<=a.navTop-2,`thẻ mèo không bị navbar đáy che (bottom ${Math.round(c.bot)} <= ${Math.round(a.navTop)})`);
  ok(a.cards.every(x=>x.lh<x.fs*1.4&&x.sw<=x.cw+1&&x.inCard&&x.gap>=-2)&&a.docW<=a.vw,'mỗi thẻ: chữ MỘT dòng, nằm trong thẻ, không chồng ảnh, không tràn ngang');
  ok(a.cards.every(x=>near(x.color,'#4433ff')||x.f>0),'A1 chữ xanh #4433ff');
  const h=await p.evaluate(()=>['h1','p','#startBtn'].map(q=>getComputedStyle(document.querySelector('.hero '+q)).display)); ok(h.every(x=>x==='none'),'tiêu đề / câu mô tả / nút Start Reading đã bỏ (ẩn) '+h);
  if(name==='w1280') ok(Math.abs((a.rootL+a.rootR)/2-a.vw/2)<40,'desktop: hai thẻ nằm giữa');
  if(name.startsWith('reduce')){
    await p.waitForTimeout(4000); const r0=(await info()).cards; ok(r0.every(x=>x.f===0),'giảm chuyển động: không tự chạy');
    await p.evaluate(()=>document.querySelector('.dmCard .ph').click()); await p.waitForTimeout(300);
    const r1=(await info()).cards[0]; ok(near(r1.color,'#ff004c'),'giảm chuyển động: chạm cụm đổi sang A2 đỏ hồng');
    ok((await p.evaluate(()=>document.getAnimations().length))===0,'giảm chuyển động: không animation nào đang chạy');
    await p.screenshot({path:`tools/pw/shots/demo_${name}.png`}); ok(!errs.length,'không lỗi JS '+errs); await ctx.close(); continue;
  }
  const until=(fn,ms)=>p.waitForFunction(fn,null,{timeout:ms}).then(()=>true,()=>false);
  const q=i=>`document.querySelectorAll('.dmCard .ph')[${i}]`;
  ok(await until(`${q(0)}._f===1&&${q(1)}._f===1`,12000),'cả hai thẻ tự cuộn sang A2');
  const m=await info(); ok(m.cards.every(x=>near(x.color,'#ff004c')&&x.op[1]>.9&&x.op[0]<.1),'A2: "puppy" và "kitten" đỏ hồng #ff004c, A1 đã tan '+m.cards.map(x=>x.color));
  ok(m.cards.every(x=>x.lh<x.fs*1.4&&x.sw<=x.cw+1&&x.inCard),'A2 vẫn một dòng trong thẻ');
  await p.waitForTimeout(300); await p.screenshot({path:`tools/pw/shots/demo_${name}.png`});
  ok(await until(`${q(0)}._f===0&&${q(1)}._f===0`,14000),'rồi cuộn lại A1 (lặp)');
  const fl=await p.evaluate(()=>[...document.querySelectorAll('#heroDemo *')].filter(e=>!e.classList.contains('o')&&getComputedStyle(e).filter!=='none'&&!e.closest('.ph')).length); ok(fl===0,'không filter/blur trên thẻ (ngoài chữ .o của cơ chế bài)');
  await until(`${q(0)}._f===1`,8000);
  await p.evaluate(()=>{ Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}); document.dispatchEvent(new Event('visibilitychange')); });
  await p.waitForTimeout(1500); const f1=await p.evaluate(()=>[...document.querySelectorAll('.dmCard .ph')].map(x=>x._f));
  await p.waitForTimeout(7000); const f2=await p.evaluate(()=>[...document.querySelectorAll('.dmCard .ph')].map(x=>x._f));
  ok(JSON.stringify(f1)===JSON.stringify(f2),'tab ẩn: dừng, không đổi A1/A2 trong 7s');
  await p.evaluate(()=>{ delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  ok(await until(`[...document.querySelectorAll('.dmCard .ph')].some((x,i)=>x._f!==${JSON.stringify(f2)}[i])`,9000),'tab hiện lại: chạy tiếp');
  await p.evaluate(()=>document.getElementById('heroDemo').click()); await p.waitForTimeout(900);
  ok(await p.evaluate(()=>!ovsEl.hidden&&ovsEl.classList.contains('on')),'chạm thẻ mở trang tổng quan');
  ok(!errs.length,'không lỗi JS '+errs);
  await ctx.close();
}
await b.close(); srv.close(); console.log(fails?`\n${fails} FAIL`:'\nTẤT CẢ PASS'); process.exit(fails?1:0);
