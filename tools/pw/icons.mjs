import { chromium } from 'playwright'; import fs from 'fs';
const names=['Family','Family_1','Health','School','Tech','Tech_1','Lifestyle'];
const html='<body style="margin:20px;font:14px sans-serif;display:flex;gap:24px;flex-wrap:wrap">'+names.map(n=>`<div style="text-align:center"><div style="width:110px;height:110px;color:#1b3bff">${fs.readFileSync('E:/Your English/Icon/SVG/'+n+'.svg','utf8').replace(/<\?xml[^>]*>/,'').replace('<svg ','<svg width="110" height="110" fill="currentColor" ')}</div>${n}</div>`).join('')+'</body>';
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1000,height:200}}); await p.setContent(html); await p.screenshot({path:'shots/icons.png'}); await b.close();
