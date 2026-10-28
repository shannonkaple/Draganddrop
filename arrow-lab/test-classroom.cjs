// Isolated browser profiles only. Run with Playwright and optional CHROMIUM_EXECUTABLE / ARROW_QA_URL.
const {chromium}=require('playwright');
const fs=require('fs'),http=require('http'),path=require('path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((q,r)=>{let f=path.join(root,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';try{r.setHeader('Content-Type',({'.mjs':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream');r.end(fs.readFileSync(f))}catch{r.statusCode=404;r.end()}});
const assert=require('node:assert/strict');
const key='arrow-lab-class-v1:grade1-01:24';
const worlds=['candy','pirate','arctic','castle','space','jurassic','ocean','lava'];
const gear=JSON.parse(fs.readFileSync(path.join(root,'rainbow-road/data/computer_collectibles.json'))).map(x=>x.id);
async function login(p){await p.locator('[data-teacher="grade1-01"]').click();await p.locator('[data-number="24"]').click();}
async function state(p){return p.evaluate(k=>JSON.parse(localStorage.getItem(k)).adventure,key)}
async function fits(p,selector){const r=await p.locator(selector).boundingBox(),v=p.viewportSize();assert.ok(r&&r.x>=0&&r.y>=0&&r.x+r.width<=v.width+1&&r.y+r.height<=v.height+1,selector+' outside viewport: '+JSON.stringify(r));}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox']});
const url=process.env.ARROW_QA_URL||'http://127.0.0.1:'+server.address().port+'/arrow-lab/';
try{for(const size of [{width:1366,height:768},{width:1280,height:720},{width:1024,height:600}]){
 const p=await b.newPage({viewport:size});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url);await login(p);await p.locator('[data-hero="cosmo_fox"]').click();
 const seed=await state(p);seed.collectedComputerGearIds=gear;seed.wallet.rainbowStars=50;
 seed.decorations={background_candy:['candy_lollipop']};seed.collectionExtraObjects={background_candy:['desktop']};
 seed.worldFriends={candy:{homeLandId:'background_candy'}};
 seed.friends.luna_axolotl={isRescued:true,upgradeStage:'power_up',homeLandId:'background_candy'};
 for(let wi=0;wi<8;wi++){
  const a=structuredClone(seed);a.highestUnlockedLevel=wi*8+2;a.completedLevelIds=['lab_'+worlds[wi]+'_1'];
  await p.evaluate(({key,a})=>{const raw=JSON.parse(localStorage.getItem(key));raw.adventure=a;localStorage.setItem(key,JSON.stringify(raw))},{key,a});
  await p.reload();await login(p);await p.locator('[data-world-index="'+wi+'"]').click();
  const nodes=p.locator('[data-level]');assert.equal(await nodes.count(),8);
  for(let k=0;k<8;k++){
   const n=nodes.nth(k);await fits(p,'[data-level="'+(wi*8+k+1)+'"]');
   assert.ok((await n.textContent()).includes(String(k+1)),'number visible');
   assert.equal(await n.getAttribute('aria-disabled'),String(k>1));
   if(k===0)assert.ok((await n.getAttribute('aria-label')).includes('completed'));
   if(k>1)assert.ok((await n.textContent()).includes('🔒'));
  }
  const lockRect=await nodes.nth(3).boundingBox();await p.mouse.click(lockRect.x+lockRect.width/2,lockRect.y+lockRect.height/2);await fits(p,'dialog[open]');await p.keyboard.press('Enter');
  assert.equal(await p.locator('dialog[open]').count(),0);assert.equal(await p.locator('[data-level]').first().getAttribute('data-level'),String(wi*8+1));
  await nodes.first().click();await p.keyboard.press('Enter');assert.equal(await p.locator('[data-level]').count(),8);
  if(wi===0){
   await nodes.nth(1).click();await fits(p,'#adventure-maze');
   const rect=await p.locator('#adventure-maze .cell').first().boundingBox();assert.ok(rect.width>=29&&rect.height>=29,'maze cells too small '+JSON.stringify(rect));
   console.log('maze tile',size.width,rect.width,rect.height);
   await p.locator('#restart-level').click();const before=await state(p);await p.keyboard.press('Enter');
   assert.equal(await p.locator('[data-level]').count(),8);assert.deepEqual((await state(p)).mazeRuns,before.mazeRuns,'Enter never resets maze');
  }
 }
 // Largest generated maze is also measured, not just the starter layout.
 await p.evaluate(key=>{const raw=JSON.parse(localStorage.getItem(key));raw.adventure.highestUnlockedLevel=64;localStorage.setItem(key,JSON.stringify(raw))},key);
 await p.reload();await login(p);await p.locator('[data-world-index="7"]').click();await p.locator('[data-level="64"]').click();
 await fits(p,'#adventure-maze');await fits(p,'.maze-controls');
 const largest=await p.locator('#adventure-maze .cell').first().boundingBox();
 assert.ok(largest.width>=26&&largest.height>=26,'largest maze unreadably small');console.log('largest maze tile',size.width,largest.width,largest.height);
 if(await p.locator('#duck-ready').count()){await p.keyboard.press('Enter');assert.equal(await p.locator('[data-level]').first().getAttribute('data-level'),'57');await p.locator('[data-level="64"]').click();await p.locator('#duck-ready').click();}
 await p.screenshot({path:'/tmp/classroom-maze-'+size.width+'.png'});
 await p.locator('#help').click();await p.keyboard.press('Enter');assert.equal(await p.locator('[data-level]').first().getAttribute('data-level'),'57');
 // Loaded final world fixture still has seeded purchases. Verify scene/collection and changing player.
 await p.locator('#global-home').click();await p.locator('#change-player').click();await p.locator('[data-hero="nova_panda"]').click();
 await p.locator('[data-nav="computer"]').first().click();
 await fits(p,'.my-stuff-room');await fits(p,'#collection-scene');await fits(p,'#my-stuff-tray');await fits(p,'#stuff-world-select');
 const overflow=await p.locator('#app').evaluate(e=>({height:e.scrollHeight-e.clientHeight,width:e.scrollWidth-e.clientWidth}));assert.ok(overflow.height<=1&&overflow.width<=1,JSON.stringify(overflow));
 assert.equal(await p.locator('[data-world-object="cosmo_fox"]').count(),0);assert.equal(await p.locator('[data-world-object="luna_axolotl"]').count(),0);assert.equal(await p.locator('[data-world-object="nova_panda"]').count(),1);
 assert.ok((await state(p)).friends.luna_axolotl.upgradeStage==='power_up','saved upgrade preserved');
 assert.equal(await p.locator('[data-world-object="companion:candy"]').count(),1,'rescued friend retained');
 const total=await p.locator('.my-stuff-item').count();let seen=0;
 do{const visible=p.locator('.my-stuff-item:visible');for(let j=0;j<await visible.count();j++){
  const button=visible.nth(j).locator('button');const r=await button.boundingBox();const tray=await p.locator('#my-stuff-tray').boundingBox();assert.ok(r.x>=tray.x&&r.x+r.width<=tray.x+tray.width+1&&r.y>=tray.y&&r.y+r.height<=tray.y+tray.height+1,'inventory item cut off '+JSON.stringify(r));
 }seen+=await visible.count();if(await p.locator('#stuff-scroll-next').isDisabled())break;await p.locator('#stuff-scroll-next').click();}while(true);
 assert.equal(seen,total,'all inventory reachable without scrolling');
 const item=await p.locator('[data-world-object="decor:candy_lollipop"]').boundingBox(),scene=await p.locator('#collection-scene').boundingBox();
 await p.mouse.move(item.x+item.width/2,item.y+item.height/2);await p.mouse.down();await p.mouse.move(scene.x+scene.width-5,scene.y+scene.height-5,{steps:5});await p.mouse.up();
 const moved=await p.locator('[data-world-object="decor:candy_lollipop"]').boundingBox();assert.ok(moved.x+moved.width<=scene.x+scene.width&&moved.y+moved.height<=scene.y+scene.height,'drag remains in scene');
 await p.locator('[data-world-object="decor:candy_lollipop"] .scene-remove').click();assert.equal(await p.locator('[data-world-object="decor:candy_lollipop"]').count(),0);assert.ok((await state(p)).decorations.background_candy.includes('candy_lollipop'));
 await p.locator('[data-world-object="treasure:desktop"]').focus();await p.keyboard.press('Delete');assert.equal(await p.locator('[data-world-object="treasure:desktop"]').count(),0);assert.ok((await state(p)).collectedComputerGearIds.includes('desktop'));
 await p.locator('[data-world-object="companion:candy"] .scene-remove').click();assert.equal(await p.locator('[data-world-object="companion:candy"]').count(),0);assert.ok((await state(p)).worldFriends.candy);
 await p.screenshot({path:'/tmp/classroom-'+size.width+'.png'});
 await p.reload();await login(p);await p.locator('[data-nav="computer"]').first().click();assert.equal(await p.locator('[data-world-object="decor:candy_lollipop"]').count(),0,'removal persists');
 assert.equal(await p.locator('[data-world-object="nova_panda"]').count(),1);
 while(!await p.locator('#stuff-scroll-prev').isDisabled())await p.locator('#stuff-scroll-prev').click();
 await p.locator('[data-stuff-decor="candy_lollipop"]').click();assert.equal(await p.locator('[data-world-object="decor:candy_lollipop"]').count(),1,'removed purchase can be restored');
 await p.locator('[data-stuff-friend="candy"]').click();assert.equal(await p.locator('[data-world-object="companion:candy"]').count(),1,'rescued friend can be restored');
 assert.deepEqual(errors,[]);
 console.log('PASS classroom maps, Enter return, inventory pages, character replacement, scene removals/reload at '+size.width+'x'+size.height);await p.close();
}}finally{await b.close();server.close()}})().catch(e=>{console.error(e);process.exit(1)});
