import { chromium, devices } from 'playwright';
const b=await chromium.launch(); const ctx=await b.newContext(devices['iPhone 13']); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({s:1}));});
const p=await ctx.newPage(); await p.goto('http://localhost:8080/'); await p.waitForTimeout(4500);
await p.evaluate(()=>{ window.__sov.open(); window.__sov.input.value='soc'; });
await p.evaluate(()=>{ window.__sov.input.value='weekend'; window.__sov.render(); }); await p.waitForTimeout(300);
await p.evaluate(()=>[...document.querySelectorAll('#sug .sgChip')].find(c=>c.dataset.a==='lesson').click()); await p.waitForTimeout(500);
await p.screenshot({path:'E:/Your English/tools/pw/shots/flash.png'}); await b.close();
