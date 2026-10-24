import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const b=await chromium.launch();
for(const [n,o] of [['m390',devices['iPhone 13']],['m320',{viewport:{width:320,height:640},hasTouch:true,isMobile:true}],['t834',{viewport:{width:834,height:1112},hasTouch:true}],['d1280',{viewport:{width:1280,height:720}}]]){
 const ctx=await b.newContext(o); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({s:1}));});
 const p=await ctx.newPage(); await p.goto('http://localhost:8080/'); await p.waitForTimeout(4500);
 await p.screenshot({path:`E:/Your English/tools/pw/shots/home_${n}.png`}); await ctx.close(); }
await b.close();
