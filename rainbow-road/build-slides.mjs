import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {makeMaze,step} from './core.mjs';
const root=process.cwd(),server=http.createServer((req,res)=>{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+relative);if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}try{const b=fs.readFileSync(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.mjs')?'text/javascript':file.endsWith('.jpg')?'image/jpeg':'application/octet-stream');res.end(b)}catch{res.writeHead(404);res.end()}});
await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));let browser;
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/rainbow-road.html');await page.locator('#class-code').fill('BUILD-QA');await page.locator('[data-number="1"]').click();const initial=makeMaze(221,8),wallet={total:0,earned:0,finished:0,color:'violet',owned:['violet']};
 await page.evaluate(({initial,wallet})=>localStorage.setItem('rainbow-road-arrow-v1:build-qa:1',JSON.stringify({run:initial,wallet})),{initial,wallet});
 await page.locator('#start').click();await page.locator('#maze').waitFor();await page.evaluate(()=>document.fonts.ready);
 for(const [width,height]of [[1366,768],[1280,720],[1024,600],[800,600],[1920,1080]]){await page.setViewportSize({width,height});await page.waitForTimeout(250);const box=await page.locator('#maze').boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1,'Maze overflow '+width+'x'+height);assert.ok(box.width/initial.w>=20,'Tiles too small');}
 await page.setViewportSize({width:1366,height:768});await page.keyboard.press('ArrowUp');let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('rainbow-road-arrow-v1:build-qa:1')));assert.deepEqual(state.run.player,{x:1,y:1});
 const dirs=[['ArrowUp',0,-1],['ArrowDown',0,1],['ArrowLeft',-1,0],['ArrowRight',1,0]],queue=[[1,1,[]]],seen=new Set(['1,1']);let route;
 while(queue.length){const[x,y,keys]=queue.shift();if(x===initial.goal.x&&y===initial.goal.y){route=keys;break}for(const[k,dx,dy]of dirs){const a=x+dx,b=y+dy,id=a+','+b;if(initial.grid[b]?.[a]===0&&!seen.has(id)){seen.add(id);queue.push([a,b,[...keys,k]])}}}
 for(const k of route)await page.keyboard.press(k);await page.locator('#win[open]').waitFor();state=await page.evaluate(()=>JSON.parse(localStorage.getItem('rainbow-road-arrow-v1:build-qa:1')));assert.equal(state.wallet.total,5);assert.equal(state.wallet.finished,1);await page.keyboard.press('ArrowRight');state=await page.evaluate(()=>JSON.parse(localStorage.getItem('rainbow-road-arrow-v1:build-qa:1')));assert.equal(state.wallet.total,5);await page.locator('#next').click();state=await page.evaluate(()=>JSON.parse(localStorage.getItem('rainbow-road-arrow-v1:build-qa:1')));assert.equal(state.run.level,9);assert.equal(state.wallet.total,5);
 await page.reload();await page.locator('#class-code').fill('BUILD-QA');await page.locator('[data-number="1"]').click();await page.locator('#start').click();assert.equal(await page.locator('#gem-total').innerText(),'5');
 await page.goto('http://127.0.0.1:4173/rainbow-slides.html');await page.waitForFunction(()=>window.__slideReady===true);fs.mkdirSync('rainbow-road/week-1-slides',{recursive:true});
 for(let i=0;i<12;i++){const data=await page.evaluate(i=>window.renderLessonSlide(i),i);const bytes=Buffer.from(data.split(',')[1],'base64');assert.ok(bytes.length>15000,'Empty JPEG');fs.writeFileSync('rainbow-road/week-1-slides/arrow-week-1-'+String(i+1).padStart(2,'0')+'.jpg',bytes);}
 const download=page.waitForEvent('download');await page.locator('#zip').click();const zip=await download;await zip.saveAs('rainbow-road/week-1-jpegs.zip');
 assert.deepEqual(errors,[]);console.log('PASS: keyboard-only play, completion, rewards, resume, five viewport sizes, 12 JPEG slides and ZIP download.');fs.writeFileSync('rainbow-road/build-report.json',JSON.stringify({checked:new Date().toISOString(),viewports:5,slides:12,fonts:['VAG Rounded','KA Homebody Club'],keyboard:true,rewards:true,resume:true},null,2));
}finally{await browser?.close();server.close();}
