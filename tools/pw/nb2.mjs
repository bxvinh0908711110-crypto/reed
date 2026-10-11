import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8811);
const b=await chromium.launch();
for(const [name,opts] of [['13',devices['iPhone 13']],['d1280',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(5000);
  await p.evaluate(()=>{ const items=[]; const now=Date.now(); const ago=[20*6e4,5*36e5,30*36e5,80*36e5,200*36e5,500*36e5]; let k=0; ALL.filter(x=>x.id>0).slice(0,6).forEach(l=>l.hl.slice(0,l.id%2?3:2).forEach(h=>{ items.push({key:nbKey(h.o,h.u),base:h.o,upgraded:h.u,level:h.lv,meaning:h.vn,example:h.ex,topic:l.topic,category:nbCategory(h.u),savedAt:now-ago[l.id-1]-k++*1000}); })); nbSaveAll(items); nbRenderCount(); });
  await p.evaluate(()=>nbOpen()); await p.waitForTimeout(1000);
  const st=()=>p.evaluate(()=>({groups:document.querySelectorAll('.nbGroup').length,open:[...document.querySelectorAll('.nbGroup.open')].map(g=>g.querySelector('.nbGTitle').textContent),heads:[...document.querySelectorAll('.nbGHead')].map(h=>h.querySelector('.nbGTitle').textContent+'|'+h.querySelector('.nbBadge').textContent),cards:document.querySelectorAll('.nbItem').length}));
  console.log(name,'nhóm',await st()); await p.screenshot({path:`tools/pw/shots/nb2_${name}_a.png`});
  // mở nhóm thứ 2, gập nhóm đầu
  await p.evaluate(()=>{document.querySelectorAll('.nbGHead')[1].click()}); await p.waitForTimeout(500); console.log(' mở nhóm 2',(await st()).open);
  await p.evaluate(()=>{document.querySelectorAll('.nbGHead')[0].click()}); await p.waitForTimeout(500); console.log(' gập nhóm 1',(await st()).open);
  await p.screenshot({path:`tools/pw/shots/nb2_${name}_b.png`});
  // vuốt phải = đã thuộc (nhóm 2 đang mở)
  const box=await p.evaluate(()=>{const c=document.querySelectorAll('.nbGroup.open .nbItem')[0];c.scrollIntoView({block:'center'});const r=c.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
  await p.waitForTimeout(300); const bb=await p.evaluate(()=>{const c=document.querySelectorAll('.nbGroup.open .nbItem')[0];const r=c.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
  const learned0=await p.evaluate(()=>nbLoad().filter(x=>x.learned).length);
  await p.mouse.move(bb.x-40,bb.y); await p.mouse.down(); for(let i=1;i<=10;i++) await p.mouse.move(bb.x-40+i*14,bb.y); await p.screenshot({path:`tools/pw/shots/nb2_${name}_drag.png`}); await p.mouse.up(); await p.waitForTimeout(500);
  console.log(' vuốt phải: đã thuộc',learned0,'→',await p.evaluate(()=>nbLoad().filter(x=>x.learned).length),'| nhóm:',(await st()).heads.slice(0,3));
  // vuốt trái = xoá + hoàn tác
  const n0=await p.evaluate(()=>nbLoad().length);
  const bb2=await p.evaluate(()=>{const c=document.querySelectorAll('.nbGroup.open .nbItem')[0];const r=c.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
  await p.mouse.move(bb2.x+40,bb2.y); await p.mouse.down(); for(let i=1;i<=10;i++) await p.mouse.move(bb2.x+40-i*14,bb2.y); await p.mouse.up(); await p.waitForTimeout(700);
  console.log(' vuốt trái: xoá',n0,'→',await p.evaluate(()=>nbLoad().length),'undo hiện:',await p.evaluate(()=>nbUndo.classList.contains('show')+' '+nbUndo.textContent.trim().slice(0,30)));
  await p.screenshot({path:`tools/pw/shots/nb2_${name}_undo.png`});
  await p.evaluate(()=>nbUndoBtn.click()); await p.waitForTimeout(400); console.log(' hoàn tác →',await p.evaluate(()=>nbLoad().length));
  // tìm kiếm / lọc => phẳng
  await p.fill('#nbSearch','chat'); await p.waitForTimeout(500); console.log(' tìm → nhóm',await p.evaluate(()=>document.querySelectorAll('.nbGroup').length),'thẻ',await p.evaluate(()=>document.querySelectorAll('.nbItem').length));
  await p.fill('#nbSearch',''); await p.waitForTimeout(400); await p.evaluate(()=>document.querySelector('.nbTab[data-tab="word"]').click()); await p.waitForTimeout(400); console.log(' tab Words → nhóm',await p.evaluate(()=>document.querySelectorAll('.nbGroup').length),'thẻ',await p.evaluate(()=>document.querySelectorAll('.nbItem').length));
  await p.evaluate(()=>document.querySelector('.nbTab[data-tab="all"]').click()); await p.waitForTimeout(500); console.log(' All → nhóm',await p.evaluate(()=>document.querySelectorAll('.nbGroup').length),'mở:',(await st()).open);
  console.log(' lỗi JS',errs); await ctx.close();
}
await b.close(); srv.close();
