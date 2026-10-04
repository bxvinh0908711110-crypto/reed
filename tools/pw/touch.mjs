import { chromium, devices } from 'playwright';
import { pathToFileURL } from 'url';
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'],userAgent:devices['iPhone 13'].userAgent});
const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
await p.goto(pathToFileURL('E:/Your English/index.html').href); await p.waitForTimeout(4500);
const T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
async function swipe(x,y1,y2,steps=8,dt=16){await T('touchStart',x,y1);for(let i=1;i<=steps;i++){await T('touchMove',x,y1+(y2-y1)*i/steps);await p.waitForTimeout(dt);}await T('touchEnd');}
const y=()=>p.evaluate(()=>Math.round(scrollY));
console.log('start',await y());
await swipe(200,400,200); await p.waitForTimeout(800); console.log('after swipe up',await y());
await swipe(200,450,100,4,8); await p.waitForTimeout(800); console.log('fast swipe up',await y());
await swipe(200,200,450); await p.waitForTimeout(800); console.log('swipe down',await y());
// long press on lesson title then slide
const box=await p.locator('#lessonContent').boundingBox(); const cx=box.x+box.width/2, cy=box.y+box.height/2;
await T('touchStart',cx,cy); await p.waitForTimeout(700);
console.log('picker open',await p.evaluate(()=>player.classList.contains('picker-open')), 'sel', await p.evaluate(()=>String(getSelection())));
for(let i=1;i<=6;i++){await T('touchMove',cx-i*12,cy);await p.waitForTimeout(30);}
console.log('idx while held',await p.evaluate(()=>pickerIndex), 'bubble', await p.evaluate(()=>document.querySelector('#pickBubble').innerText.replace(/\n/g,' ')));
await p.screenshot({path:'shots/picker.png'});
await T('touchEnd'); await p.waitForTimeout(900);
console.log('after release',await p.evaluate(()=>[player.classList.contains('picker-open'),Math.round(scrollY)]));
await b.close();
