import { chromium } from 'playwright'; import { pathToFileURL } from 'url';
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
await p.goto(pathToFileURL('E:/Your English/index.html').href); await p.waitForTimeout(4500);
await p.mouse.move(400,300);
for(let i=0;i<10;i++){await p.mouse.wheel(0,300);await p.waitForTimeout(20);} await p.waitForTimeout(800);
console.log('desktop flick',await p.evaluate(()=>Math.round(scrollY)));
await p.mouse.wheel(0,100); await p.waitForTimeout(800); console.log('next',await p.evaluate(()=>Math.round(scrollY)));
await b.close();
