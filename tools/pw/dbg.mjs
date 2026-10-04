import { webkit, devices } from 'playwright';
import { pathToFileURL } from 'url';
const p = await (await (await webkit.launch()).newContext({...devices['iPhone 13']})).newPage();
await p.goto(pathToFileURL('E:/Your English/index.html').href); await p.waitForTimeout(4500);
await p.evaluate(()=>{unlockUpTo(3);document.documentElement.style.scrollSnapType='none';scrollTo(0,P[2].el.getBoundingClientRect().top+scrollY+P[2].total-1)}); await p.waitForTimeout(1200);
console.log(JSON.stringify(await p.evaluate(()=>{const r=P[2].sents.at(-1).el;return ['.sents','.sent.recap','.rcw','.rl.base','.recap'].map(s=>{const e=(r.matches(s)?r:r.querySelector(s))||document.querySelector(s);const b=e.getBoundingClientRect();return [s,Math.round(b.left),Math.round(b.width),getComputedStyle(e).width, getComputedStyle(e).paddingRight]})})));
