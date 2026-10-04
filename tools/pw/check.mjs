import { webkit, chromium, devices } from 'playwright';
import { pathToFileURL } from 'url';
const url = pathToFileURL('E:/Your English/index.html').href;
const list = ['iPhone SE','iPhone 13','iPhone 15 Pro Max','iPad Mini','Pixel 7'];
for (const name of list) {
  const d = devices[name]; const br = d.defaultBrowserType==='webkit' ? webkit : chromium;
  const b = await br.launch(); const ctx = await b.newContext({...d}); const p = await ctx.newPage();
  await p.goto(url); await p.waitForTimeout(4500);
  await p.evaluate(()=>{unlockUpTo(3);document.documentElement.style.scrollSnapType='none';});
  const shots = { start: ()=>0, recap3: ()=>P[2].el.getBoundingClientRect().top+scrollY+P[2].total-1 };
  const res = [];
  for (const [k,fn] of Object.entries(shots)) {
    await p.evaluate(`scrollTo(0,(${fn.toString()})())`); await p.waitForTimeout(1200);
    const over = await p.evaluate(()=>{const W=innerWidth;const bad=[];document.querySelectorAll('.art,.sents,.foot,.line,mark,.cap,#player').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.height&&r.top<innerHeight&&r.bottom>0&&r.right>W+1)bad.push(e.className||e.id)});return {docW:document.documentElement.scrollWidth,W,bad:[...new Set(bad)]}});
    res.push(k+': '+JSON.stringify(over));
    await p.screenshot({path:`shots/${name.replace(/ /g,'_')}_${k}.png`});
  }
  console.log(name, d.defaultBrowserType, '\n  '+res.join('\n  '));
  await b.close();
}
