// Tour hướng dẫn 13 bước: nội dung, vị trí vùng sáng/thẻ/mũi tên trên điện thoại và máy tính. Chạy: node tools/pw/tour13.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
fs.mkdirSync('tools/pw/shots',{recursive:true});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
// mỗi bước: đoạn chữ phải có + bộ chọn phần tử được làm sáng (null = kiểm tra riêng)
const EXP=[['chủ đề','#topics'],['bài học','#heroDemo'],['câu ngắn','.passage .sents'],['từ tô sáng','.sent .ph'],['loa','#player .play'],['Micro','#micBtn'],['bản dịch','#langBtn'],['giọng Nam/Nữ','#player'],['Ngôi sao','.foot .sv'],['Sổ Tay','#notebook'],['giữ','#player'],['How to learn','#tipBtn'],['nốt nhạc','#musicBtn']];
const b=await chromium.launch();
for(const [name,opts] of [['mobile',devices['iPhone 13']],['SE',devices['iPhone SE']],['desktop',{viewport:{width:1280,height:720}}]]){
  console.log('--',name);
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.removeItem('reed_tour_done')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(9500);
  ok(await p.evaluate(()=>Tour.welcomeOpen),'hộp chào mừng hiện'); await p.click('#welcome .w1'); await p.waitForTimeout(1500);
  for(let n=0;n<13;n++){
    await p.waitForTimeout(1100);
    const o=await p.evaluate((sel)=>{
      const R=e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom}};
      const spot=R(document.querySelector('#tourSpot')), card=R(document.querySelector('#tourCard')), W=innerWidth,H=innerHeight;
      const els=[...document.querySelectorAll(sel)]; const el=els.find(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0})||null;
      const tr=el?R(el):null, cx=tr?(tr.l+tr.r)/2:0, cy=tr?(tr.t+tr.b)/2:0;
      return {n:document.querySelector('#tourCard .tn').textContent, text:document.querySelector('#tourCard .tt').textContent, arrow:document.querySelector('#tourArrow').classList.contains('on'),
        cardIn:card.l>=0&&card.t>=0&&card.r<=W&&card.b<=H, spotIn:spot.r>0&&spot.b>0&&spot.l<W&&spot.t<H,
        covers:!!tr&&cx>=spot.l-2&&cx<=spot.r+2&&cy>=spot.t-2&&cy<=spot.b+2, overlap:!(card.r<spot.l||card.l>spot.r||card.b<spot.t||card.t>spot.b)};
    },EXP[n][1]);
    ok(o.n===(n+1)+'/13'&&o.text.includes(EXP[n][0]),`bước ${n+1}: "${o.text.slice(0,60)}…"`);
    ok(o.cardIn&&o.spotIn&&o.covers&&(o.arrow||n===9),`  bước ${n+1}: thẻ nằm trong màn hình, vùng sáng trùm đúng phần tử ${EXP[n][1]}, có mũi tên `+JSON.stringify({cardIn:o.cardIn,covers:o.covers,arrow:o.arrow,overlap:o.overlap}));
    await p.screenshot({path:`tools/pw/shots/tour13_${name}_${n+1}.png`});
    if(n<12) await p.click('#tourCard .tg2');
  }
  ok(await p.evaluate(()=>!document.querySelector('#tourCard .tx').hidden&&document.querySelector('#tourCard .tg2').textContent==='Xong'),'bước 13: có nút Xong và Làm thử');
  await p.click('#tourCard .tg2'); await p.waitForTimeout(700);
  ok(await p.evaluate(()=>!Tour.active&&localStorage.getItem('reed_tour_done')==='1'&&!musicBtn.classList.contains('x')),'kết thúc: tour đóng, đã ghi nhận');
  ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:'')); await ctx.close();
}
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
