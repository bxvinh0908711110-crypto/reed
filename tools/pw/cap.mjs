import { webkit, devices } from 'playwright';
import { pathToFileURL } from 'url';
const p = await (await (await webkit.launch()).newContext({...devices['iPhone SE']})).newPage();
await p.goto(pathToFileURL('E:/Your English/index.html').href); await p.waitForTimeout(4500);
await p.evaluate(()=>{unlockUpTo(3);document.documentElement.style.scrollSnapType='none';const s=P[2].sents[3];scrollTo(0,P[2].el.getBoundingClientRect().top+scrollY+(s.lo+s.hi)/2)}); await p.waitForTimeout(1500);
await p.screenshot({path:'shots/cap.png'});
