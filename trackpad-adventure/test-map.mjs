import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=process.cwd();
const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep))throw Error('invalid path');
  const bytes=await fs.readFile(file);
  res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
  res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found')}
});
const worlds=['candy','pirate','arctic','castle','space','jurassic','ocean','lava'];
const levels=[[14,37],[37,37],[60,37],[83,37],[14,74],[37,74],[60,74],[83,74]];
const islands=[[13,25.5],[38.5,23.5],[63,25.5],[89,25.5],[10,81.5],[39,81.5],[63.5,81.5],[89,81.5]];
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/trackpad-adventure.html');
 await page.locator('[data-teacher]').first().click();
 await page.locator('[data-number="24"]').click();
 await page.locator('[data-hero="rainbow_rocket_unicorn"]').click();
 await page.waitForSelector('.arrow-world-stage .map-jpeg-backdrop');
 const inspect=async(selector,expectedWidth,expectedHeight,positions)=>{
  const report=await page.locator(selector).evaluate(async(el)=>{
   const img=el.querySelector('img.map-jpeg-backdrop');
   await img.decode();
   const rect=img.getBoundingClientRect();
   const stops=Array.from(el.querySelectorAll('button[data-map-world],button[data-campaign-level]')).map(b=>{
    const r=b.getBoundingClientRect();
    return {x:((r.left+r.right)/2-rect.left)/rect.width*100,
     y:((r.top+r.bottom)/2-rect.top)/rect.height*100,
     text:b.textContent.trim(),name:b.getAttribute('aria-label'),
     disabled:b.disabled,hasSvg:!!b.querySelector('svg')};
   });
   return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
    displayWidth:rect.width,displayHeight:rect.height,stops,src:img.currentSrc,
    background:getComputedStyle(el).backgroundImage};
  });
  assert.equal(report.naturalWidth,expectedWidth);
  assert.equal(report.naturalHeight,expectedHeight);
  assert.ok(Math.abs(report.displayWidth/report.displayHeight-expectedWidth/expectedHeight)<0.012,
   'JPEG is squashed/stretched: '+report.displayWidth+'x'+report.displayHeight);
  assert.equal(report.stops.length,8);
  assert.equal(report.background,'none','Map should have one <img>, no competing CSS backgrounds');
  for(let i=0;i<8;i++){
   assert.ok(Math.abs(report.stops[i].x-positions[i][0])<1.2,'misaligned hotspot x '+i);
   assert.ok(Math.abs(report.stops[i].y-positions[i][1])<1.2,'misaligned hotspot y '+i);
   assert.equal(report.stops[i].text,'','Every clickable map circle must be blank');
   assert.ok(report.stops[i].name?.length>5,'hotspot needs screen-reader label');
   assert.equal(report.stops[i].hasSvg,false,'No SVG-built shapes');
  }
  return report;
 };
 const home=await inspect('.arrow-world-stage',1600,760,islands);
 // A typical school Chromebook viewport must preserve the SAME blank JPEG and hotspot alignment.
 await page.setViewportSize({width:1366,height:768});
 await inspect('.arrow-world-stage',1600,760,islands);
 assert.ok(home.src.includes('.jpg'),'Home must show a JPEG');
 const homeButtons=page.locator('.arrow-world-node');
 assert.equal(await homeButtons.count(),8);
 assert.equal(await homeButtons.nth(0).isEnabled(),true);
 for(let i=1;i<8;i++)assert.equal(await homeButtons.nth(i).isDisabled(),true);
 await page.screenshot({path:'trackpad-adventure/preview-fixed-map.png',fullPage:true});
 await homeButtons.first().click();
 await page.waitForSelector('.world-map-art .map-jpeg-backdrop');
 const candyCoords=[[136,283],[425,365],[679,477],[809,287],[1096,388],[1431,351],[1724,475],[1891,252]].map(([x,y])=>[x/2048*100,y/682*100]);
 const candy=await inspect('.world-map-art',2048,682,candyCoords);
 await page.setViewportSize({width:1024,height:600});
 await inspect('.world-map-art',2048,682,candyCoords);
 assert.ok(candy.src.includes('/candy-original.png'));
 const spots=page.locator('.world-map-hotspot');
 assert.equal(await spots.count(),8);
 assert.equal(await spots.nth(0).isEnabled(),true);
 for(let i=1;i<8;i++)assert.equal(await spots.nth(i).isDisabled(),true);
 // Validate that EVERY themed background can load, instead of just Candy.
 const all=await page.evaluate(async names=>Promise.all(names.map(async(name)=>{
  const img=new Image();
  img.src='/trackpad-adventure/maps/'+name+'.jpg?v=20261027-blank-jpg';
  await img.decode();
  return {name,width:img.naturalWidth,height:img.naturalHeight};
 })),worlds);
 assert.deepEqual(all.map(x=>[x.width,x.height]),Array(8).fill(0).map(()=>[1600,900]));
 await spots.first().click();
 assert.equal(await page.locator('.bag-target').count(),1,'first drag activity must still open');
 assert.deepEqual(errors,[]);
 console.log('PASS: 9 correctly proportioned JPEG maps, 64 truly blank and accurately positioned hotspots, locks and live Trackpad activity.');
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}