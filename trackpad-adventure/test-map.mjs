import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');
const cwd=process.cwd();
const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{
 try {
   const url=new URL(req.url,'http://localhost'),file=path.resolve(cwd,'.'+decodeURIComponent(url.pathname));
   if(!file.startsWith(cwd+path.sep))throw new Error('invalid path');
   const data=await fs.readFile(file);
   res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
   res.end(data);
 }catch{res.writeHead(404);res.end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1870,height:889},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/trackpad-adventure.html');
 await page.locator('[data-teacher]').first().click();
 await page.locator('[data-number="24"]').click();
 await page.locator('[data-hero="rainbow_rocket_unicorn"]').click();
 await page.waitForSelector('.arrow-world-stage');
 const map=page.locator('.arrow-world-stage');
 const img=await map.evaluate(async elem=>{
   const bg=getComputedStyle(elem).backgroundImage;
   const match=bg.match(/url\(["']?([^"')]+)/);
   if(!match)throw new Error('Missing map JPEG URL');
   const image=new Image();
   image.src=match[1];
   await image.decode();
   return {width:image.naturalWidth,height:image.naturalHeight,src:image.src};
 });
 assert.ok(img.src.includes('overview.jpg'),'game must use an actual JPEG');
 assert.ok(img.width>=1600&&img.height>=900,'JPEG background must be original resolution, not a thumbnail');
 const worlds=await page.locator('[data-map-world]').evaluateAll(nodes=>nodes.map(node=>({
   name:node.querySelector('.arrow-world-name')?.textContent?.trim(),
   x:Number.parseFloat(node.style.left),y:Number.parseFloat(node.style.top),
   disabled:node.disabled
 })));
 const names=['Candy','Pirate','Arctic','Castle','Space','Jurassic','Ocean','Lava'];
 assert.equal(worlds.length,8);
 worlds.forEach((w,i)=>{
   assert.match(w.name,new RegExp(names[i],'i'));
   assert.ok(Math.abs(w.x-([13,38.5,63,89,10,39,63.5,89][i]))<0.2);
   assert.ok(Math.abs(w.y-([31,29,31,31,79,79,79,79][i]))<0.2);
   assert.equal(w.disabled,i!==0,'Only Candy should unlock on a fresh play');
 });
 await page.screenshot({path:'trackpad-adventure/preview-fixed-map.png',fullPage:true});
 await page.locator('[data-map-world="0"]').click();
 assert.equal(await page.locator('.campaign-level').count(),8,'Candy mini-map has eight levels');
 assert.equal(await page.locator('.campaign-level:not([disabled])').count(),1,'only first Candy level unlocked initially');
 await page.locator('[data-campaign-level="0"]').click();
 assert.equal(await page.locator('.bag-target').count(),1,'level 1 is still playable');
 assert.deepEqual(errors,[],'No browser JavaScript errors');
 console.log('PASS: original-resolution JPEG '+img.width+'x'+img.height+', 8 correctly placed real world buttons, locks, Candy mini-map and first drag activity.');
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}