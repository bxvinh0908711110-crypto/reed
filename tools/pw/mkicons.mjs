// Sinh icon PWA từ reed-icon.svg (R màu cyan trên nền navy của thanh player). Chạy: node tools/pw/mkicons.mjs
import { chromium } from 'playwright'; import fs from 'fs';
const ROOT='E:/Your English/';
const svg=fs.readFileSync(ROOT+'reed-icon.svg','utf8').replace(/<\?xml[^>]*\?>/,'');
const mk=(size,{radius,scale})=>`<html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px;background:#1d2433;border-radius:${radius}px;display:flex;align-items:center;justify-content:center"><div style="width:${size*scale}px;height:${size*scale}px;display:flex;align-items:center;justify-content:center">${svg.replace('<svg ','<svg style="width:100%;height:100%" ')}</div></div></body></html>`;
const out=[['icon-192.png',192,{radius:192*.22,scale:.56}],['icon-512.png',512,{radius:512*.22,scale:.56}],['icon-maskable-512.png',512,{radius:0,scale:.46}],['apple-touch-icon.png',180,{radius:0,scale:.54}]];
const b=await chromium.launch(); const p=await b.newPage();
for(const [name,size,o] of out){ await p.setViewportSize({width:size,height:size}); await p.setContent(mk(size,o)); await p.screenshot({path:ROOT+'icons/'+name,omitBackground:true,clip:{x:0,y:0,width:size,height:size}}); console.log(name,size); }
await b.close();
