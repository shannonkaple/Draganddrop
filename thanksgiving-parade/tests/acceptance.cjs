#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'), http=require('node:http'), path=require('node:path'), os=require('node:os');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'), output=path.resolve(process.env.PARADE_TEST_ARTIFACTS||path.join(os.tmpdir(),'parade-qa'));
const types={html:'text/html',js:'application/javascript',css:'text/css',png:'image/png',jpg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',ogg:'audio/ogg',mp3:'audio/mpeg',woff2:'font/woff2'};
const dimensions=[[1280,720],[1366,768],[1024,600]];
const panels={balloons:'#balloonShelves',floats:'#floatShelf',bands:'#bandShelf',decorate:'#decoratePanel'};
const rows=new Map(),calls=[];
let failRead=false,failWrite=false,version=0,url,origin,server;
const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,PATCH,OPTIONS','access-control-allow-headers':'apikey,accept,content-type,prefer'};
async function serve(){
  server=http.createServer((req,res)=>{
    if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();
    let file,size;
    try{
      file=path.resolve(root,decodeURIComponent(new URL(req.url,'http://test').pathname).slice(1)||'index.html');
      if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
      const s=fs.statSync(file);if(!s.isFile())return res.writeHead(404).end();
      size=s.size;
    }catch{return res.writeHead(404).end();}
    const headers={'Content-Type':types[file.split('.').pop().toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes','Content-Length':size};
    const bytes=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    let range;
    if(bytes){
      const start=+bytes[1],end=Math.min(size-1,bytes[2]?+bytes[2]:size-1);
      if(start>end)return res.writeHead(416,{'Content-Range':'bytes */'+size}).end();
      Object.assign(headers,{'Content-Length':end-start+1,'Content-Range':'bytes '+start+'-'+end+'/'+size});range={start,end};
    }
    res.writeHead(range?206:200,headers);
    if(req.method==='HEAD')return res.end();
    fs.createReadStream(file,range).on('error',()=>res.destroy()).pipe(res);
  });
  await new Promise((resolve,reject)=>server.on('error',reject).listen(0,'127.0.0.1',resolve));
  return 'http://127.0.0.1:'+server.address().port+'/';
}
async function guard(ctx){
  await ctx.route('**/*',async route=>{
    const request=route.request(), u=new URL(request.url()), method=request.method();
    if(u.hostname.endsWith('.supabase.co')||u.pathname.includes('/rest/v1/')||u.pathname.includes('parade_projects')){
      if(method==='OPTIONS')return route.fulfill({status:204,headers:cors});
      const reply=(json,status=200)=>route.fulfill({status,headers:cors,json});
      if(!u.pathname.endsWith('/parade_projects'))return reply([],404);
      const get=k=>u.searchParams.get(k)?.replace(/^eq\./,'');
      const body=['POST','PATCH'].includes(method)?request.postDataJSON():{};
      const fields=['class_code','grade','student_number'];
      const key=fields.map(k=>method==='POST'?body[k]:get(k)).join(':');
      calls.push([method,key]);
      const previous=rows.get(key);
      if(method==='GET')return failRead?reply([],503):reply(previous?[previous]:[]);
      if(!['POST','PATCH'].includes(method))return reply([],405);
      if(failWrite)return reply([],503);
      if((method==='POST'&&previous)||(method==='PATCH'&&previous?.updated_at!==get('updated_at')))return reply([]);
      const row={parade:structuredClone(body.parade),updated_at:new Date(1e12+1000*++version).toISOString()};
      rows.set(key,row);return reply([row],method==='POST'?201:200);
    }
    if(u.origin===origin&&u.pathname.endsWith('/__qa_embed__')){
      const iframe=new URL(url);iframe.searchParams.set('embed','1');
      return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><meta charset=utf-8><style>html,body{margin:0;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%;display:block}</style><iframe title="Parade Maker" allowfullscreen src="'+iframe.href.replaceAll('&','&amp;')+'"></iframe>'});
    }
    return ['GET','HEAD','OPTIONS'].includes(method)?route.continue():route.abort();
  });
  await ctx.addInitScript(()=>Object.defineProperty(navigator,'sendBeacon',{configurable:true,value:()=>false}));
}
async function context(browser,width=1280,height=720){
  const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});await guard(ctx);return ctx;
}
const l=(p,s)=>p.locator(s);
const visible=async(p,s)=>l(p,s).waitFor({state:'visible',timeout:6000});
const hidden=async(p,s)=>l(p,s).waitFor({state:'hidden',timeout:6000});
const key=(p,s,k='Enter')=>l(p,s).press(k);
const count=async p=>Number((await l(p,'#lineupCount').textContent()).match(/\d+/)[0]);
const names=p=>l(p,'#lineup .slot.filled .slot-label').allTextContents();
const status=(p,re)=>p.waitForFunction(re=>new RegExp(re,'i').test(document.querySelector('#saveStatus')?.textContent||''),re,{timeout:8000});
async function enterGuest(p){await p.goto(url,{waitUntil:'domcontentloaded'});await visible(p,'#guestModeBtn');await hidden(p,'#studentModal');await key(p,'#guestModeBtn');await hidden(p,'#onboarding');}
async function select(p,tab,keyName='Enter'){
  await key(p,'[data-tab="'+tab+'"]',keyName);
  assert.equal(await l(p,'[data-tab="'+tab+'"]').getAttribute('aria-pressed'),'true');
  for(const [name,selector] of Object.entries(panels))await (name===tab?visible:hidden)(p,selector);
  await (tab==='balloons'?visible:hidden)(p,'#balloonGroupNav');
}
async function tools(p,s){
  if(!await l(p,s).isVisible())await l(p,'.studio-tools > summary').click();
  await l(p,s).click();
}
async function capture(p,name){
  await p.evaluate(async()=>{
    await document.fonts?.ready;
    let timeout;
    await Promise.race([Promise.allSettled([...document.images].filter(i=>i.getClientRects().length&&i.getBoundingClientRect().top<innerHeight).map(i=>i.decode())),new Promise(r=>timeout=setTimeout(r,3000))]);
    clearTimeout(timeout);
  });
  if(process.env.PARADE_SCREENSHOTS!=='0')await p.screenshot({path:path.join(output,name+'.png')});
}
async function geometry(p,selector,name){
  await capture(p,name);
  const result=await p.evaluate(selector=>{
    const s=document.querySelector(selector), b=e=>e.getBoundingClientRect(), visible=e=>e.getClientRects().length&&!e.closest('[aria-hidden=true]')&&getComputedStyle(e).visibility!=='hidden'&&!e.classList.contains('sr-only');
    const overflow=[...s.querySelectorAll('button,input,select,summary,a[href]')].filter(visible).filter(e=>{const r=b(e);return r.left<-2||r.top<-2||r.right>innerWidth+2||r.bottom>innerHeight+2;}).map(e=>e.getAttribute('aria-label')||e.textContent.trim());
    const scroll=[...s.querySelectorAll('.body-layout,.library-panel,.preview-panel,.lineup-panel,.balloon-shelf,.gallery,.scenes,.music-options,#lineup,.movie-scene')].filter(visible).filter(e=>{const c=getComputedStyle(e), scrolls=x=>['scroll','auto'].includes(x);return scrolls(c.overflowX)&&e.scrollWidth>e.clientWidth+2||scrolls(c.overflowY)&&e.scrollHeight>e.clientHeight+2;}).map(e=>e.id||e.className);
    const broken=[...s.querySelectorAll('img')].filter(visible).filter(i=>!i.complete||!i.naturalWidth||/\.svg(?:[?#]|$)/i.test(i.src)).map(i=>i.src);
    const overlap=(u,v)=>Math.min(u.right,v.right)-Math.max(u.left,v.left)>2&&Math.min(u.bottom,v.bottom)-Math.max(u.top,v.top)>2;
    const collisions=[...s.querySelectorAll('.music-choice,.slot.filled')].flatMap(c=>[...c.querySelectorAll('button')].filter(visible).flatMap((a,i,list)=>list.slice(i+1).filter(d=>overlap(b(a),b(d))).map(d=>[a.getAttribute('aria-label'),d.getAttribute('aria-label')])));
    const covered=[...s.querySelectorAll('[data-balloon-group]')].filter(visible).flatMap(g=>[...s.querySelectorAll('.shelf-heading .panel-title')].filter(visible).filter(h=>overlap(b(g),b(h))).map(()=>g.textContent.trim()));
    const doc=document.documentElement;const sizeOK=doc.scrollWidth<=innerWidth+2&&doc.scrollHeight<=innerHeight+2;
    let studio=true;
    if(selector==='#app'){
      const a=b(s.querySelector('#libraryPanel')), c=b(s.querySelector('#paradePreviewPanel')), d=b(s.querySelector('#paradeLineupPanel')), logo=b(s.querySelector('.game-brand-image'));
      const tabs=[...s.querySelectorAll('[data-tab]')].map(e=>[e.querySelector('img')?.naturalWidth,b(e)]);
      studio=a.left<c.left&&a.right<=c.left+2&&Math.abs(a.top-c.top)<=6&&Math.abs(a.bottom-c.bottom)<=6&&d.top>=c.bottom-2&&d.left<=a.left+innerWidth*.018&&d.right>=c.right-innerWidth*.018&&Math.abs((logo.left+logo.right)/2-innerWidth/2)<=20&&tabs.length===4&&tabs.every(([image,r])=>image&&Math.abs(r.width-tabs[0][1].width)<3&&Math.abs(r.height-tabs[0][1].height)<3);
    }
    return {overflow,scroll,broken,collisions,covered,sizeOK,studio};
  },selector);
  assert.deepEqual(result,{overflow:[],scroll:[],broken:[],collisions:[],covered:[],sizeOK:true,studio:true},name+' layout/visible raster assets');
}
async function gallery(p,id,selector,total,art=true){
  const items=l(p,'#'+id+' '+selector), next=l(p,'[data-page-gallery="'+id+'"][data-direction="1"]'), prev=l(p,'[data-page-gallery="'+id+'"][data-direction="-1"]');
  const names=new Set(), srcs=new Set(), pages=new Set();
  for(let i=0;i<15;i++){
    const data=await items.evaluateAll(items=>items.map(e=>[e.title||e.innerText.trim(),e.querySelector('img:not(.control-art)')?.getAttribute('src')]));
    const k=JSON.stringify(data);assert.ok(data.length&&!pages.has(k),id+' advances with unique choices');
    pages.add(k);
    for(const [name,src] of data){assert.ok(name);names.add(name);if(src)srcs.add(src);}
    if(!await next.isVisible()||!await next.isEnabled())break;
    await next.press('Enter');
  }
  assert.equal(names.size,total,id+' distinct choices');
  if(art){
    assert.ok(srcs.size>=total,id+' uses distinct raster images');
    for(const src of srcs)assert.ok(await p.evaluate(src=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(!!image.naturalWidth);image.onerror=()=>resolve(false);image.src=src;}),src),src);
  }
  for(let i=1;i<pages.size;i++)await prev.press('Space');
}
async function hear(p){
  const ls=l(p,'#musicOptions .music-preview-btn');
  await ls.nth(1).waitFor({state:'visible'});
  await ls.nth(0).press('Enter');
  await p.waitForFunction(()=>{const a=document.querySelector('#musicPreviewAudio');return a&&!a.paused&&a.readyState>=2;});
  const src=await l(p,'#musicPreviewAudio').evaluate(a=>a.currentSrc);
  await ls.nth(1).press('Space');
  await p.waitForFunction(src=>{const a=document.querySelector('#musicPreviewAudio');return a.currentSrc!==src&&!a.paused&&a.readyState>=2;},src);
  assert.equal(await ls.nth(0).getAttribute('aria-pressed'),'false');
  await l(p,'#musicOptions .music-option').last().press('Space');
  assert.equal(await l(p,'#musicPreviewAudio').evaluate(a=>a.paused),true);
}
async function movie(p,w,h,tag){
  await key(p,'#playBtn');await visible(p,'#cinema');
  await p.waitForFunction(()=>document.querySelector('#movieBackground')?.naturalWidth>0);
  assert.match(await l(p,'#movieLocation').textContent(),/sixth avenue/i);
  const stage=await l(p,'#movieStage').boundingBox();
  assert.ok(stage.width>w*.55&&stage.height>h*.3);
  const ready=t=>p.waitForFunction(t=>parseFloat(document.querySelector('#timelineFill').style.width)>t,t);
  await ready(14);
  assert.ok(await l(p,'#movieStage').evaluate(c=>{
    const bytes=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let n=0;for(let i=3;i<bytes.length;i+=4)if(bytes[i])n++;
    return n>c.width*c.height*.01&&n<c.width*c.height*.9;
  }),'Live paint appears on transparent canvas');
  let geometryError;
  try{await geometry(p,'#cinema',tag+'-5-movie');}catch(e){geometryError=e;}
  for(const id of ['pauseBtn','playMovieBtn','replayBtn','soundBtn','fullscreenBtn','closeMovieBtn'])await visible(p,'#'+id);
  const progress=()=>l(p,'#timelineFill').evaluate(e=>parseFloat(e.style.width));
  await key(p,'#pauseBtn','Space');const stopped=await progress();
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  assert.equal(await progress(),stopped);
  assert.equal(await l(p,'#paradeAudio').evaluate(a=>a.paused),true);
  await key(p,'#soundBtn');assert.equal(await l(p,'#paradeAudio').evaluate(a=>a.muted),true);
  await key(p,'#soundBtn','Space');assert.equal(await l(p,'#paradeAudio').evaluate(a=>a.muted),false);
  await key(p,'#playMovieBtn');await ready(stopped+1.5);
  if(w===1280){
    await ready(36);await capture(p,tag+'-5-movie-float');
    await ready(63);await capture(p,tag+'-5-movie-bands');
  }
  const before=await progress();await key(p,'#replayBtn');assert.ok(await progress()<before);
  if(await p.evaluate(()=>document.fullscreenEnabled)){
    await l(p,'#fullscreenBtn').click();await p.waitForFunction(()=>!!document.fullscreenElement);await p.evaluate(()=>document.exitFullscreen());
  }
  await p.keyboard.press('Escape');await hidden(p,'#cinema');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'playBtn');
  if(geometryError)throw geometryError;
}
async function visual(browser,w,h){
  const before=calls.length, tag=w+'x'+h, ctx=await context(browser,w,h), p=await ctx.newPage(), js=[],bad=[],warnings=[], diagnostics=[];
  p.on('pageerror',e=>js.push(String(e)));
  p.on('console',m=>{if(['error','warning'].includes(m.type()))warnings.push(m.text());});
  p.on('requestfailed',r=>{if(['image','font','media'].includes(r.resourceType())&&!r.failure()?.errorText.includes('ERR_ABORTED'))bad.push(r.url());});
  p.on('response',r=>{if(r.status()>=400&&['image','font','media'].includes(r.request().resourceType()))bad.push(r.status()+' '+r.url());});
  const check=async(fn)=>{try{await fn();}catch(e){diagnostics.push(e.message);}};
  await p.goto(url,{waitUntil:'domcontentloaded'});
  await visible(p,'#guestModeBtn');
  await check(()=>geometry(p,'#onboarding',tag+'-0-entrance'));
  await key(p,'#guestModeBtn');await hidden(p,'#onboarding');
  assert.equal(await count(p),0);
  assert.equal(await l(p,'#playBtn').isEnabled(),false);
  const tabSizes=await p.evaluate(async()=>{
    const urls=['balloons','floats','bands','scenes'].flatMap(tab=>['','-active'].map(state=>'assets/ui/individual-jpeg/tab-'+tab+state+'.jpg'));
    return await Promise.all(urls.map(async url=>{const im=new Image();im.src=url;await im.decode();return [im.naturalWidth,im.naturalHeight];}));
  });
  assert.deepEqual(tabSizes,Array.from({length:8},()=>[672,200]),'Every tab JPEG shares one canvas');
  assert.equal(await l(p,'#stageHeading img[src$="heading-preview.jpg"]').count(),1);

  let focus=false;
  for(let i=0;i<3&&!focus;i++){
    await p.keyboard.press('Tab');
    focus=await p.evaluate(()=>document.activeElement!==document.body&&document.activeElement.getBoundingClientRect().width>0);
  }
  assert.ok(focus,'Tab reaches a usable control after guest entry');
  await select(p,'balloons');await l(p,'#realGallery .asset-card').first().press('Space');
  assert.equal(await count(p),1);
  assert.ok(await l(p,'#realGallery .native-add svg').count()>0);
  assert.equal(await l(p,'#lineup .native-remove svg').count(),1);
  await check(()=>geometry(p,'#app',tag+'-1-balloons'));
  if(w===1280)await check(async()=>{
    await gallery(p,'realGallery','.asset-card',26);
    await key(p,'[data-balloon-group="new"]','Space');
    await gallery(p,'newGallery','.asset-card',33);
    await key(p,'[data-balloon-group="real"]');
  });
  await select(p,'floats','Space');await l(p,'#floatGallery .asset-card').first().press('Enter');
  assert.equal(await count(p),2);
  await check(()=>geometry(p,'#app',tag+'-2-floats'));
  if(w===1280)await check(()=>gallery(p,'floatGallery','.asset-card',23));
  await select(p,'decorate');
  if(w===1280)await check(()=>gallery(p,'scenes','.scene-option',5));
  await p.getByRole('button',{name:'Sixth Avenue',exact:true}).press('Enter');
  assert.match(await l(p,'#sceneChip').textContent(),/sixth avenue/i);
  await check(()=>geometry(p,'#app',tag+'-3-scenes'));
  await select(p,'bands','Space');await l(p,'#bandGallery .asset-card').first().press('Space');
  if(w===1280)await check(async()=>{await gallery(p,'bandGallery','.asset-card',3);await gallery(p,'musicOptions','.music-option',4,false);await hear(p);});
  await l(p,'#musicOptions .music-option').last().press('Space');
  assert.equal(await l(p,'#musicOptions .music-option[aria-pressed=true]').count(),1);
  await check(()=>geometry(p,'#app',tag+'-4-bands'));
  await check(()=>movie(p,w,h,tag));
  assert.equal(await count(p),3,'Returning from cinema preserves lineup');
  assert.deepEqual(js,[],'No JS exceptions');
  assert.deepEqual(bad,[],'No broken image/audio/font requests');
  assert.equal(calls.length,before,'Guest never accesses student data');
  console.log(JSON.stringify({viewport:tag,warnings}));
  assert.deepEqual(diagnostics,[]);
}
const state=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('parade_2026_GUEST_2_0')));
async function guest(browser){
  const before=calls.length;
  const p=await (await context(browser)).newPage();
  await enterGuest(p);
  await l(p,'#realGallery .asset-card').first().dblclick();assert.equal(await count(p),1);
  await l(p,'#realGallery .asset-card').nth(1).press('Enter');assert.equal(await count(p),2);
  const n=await names(p);
  await key(p,'#lineup .slot.filled:first-child [data-action="right"]','Space');
  assert.deepEqual(await names(p),[n[1],n[0]]);
  await l(p,'#lineup .slot.filled').last().locator('[data-action="left"]').press('Space');
  assert.deepEqual(await names(p),n);
  await l(p,'#lineup .slot.filled').last().locator('[data-action="remove"]').press('Enter');
  assert.deepEqual(await names(p),n.slice(0,1));
  await select(p,'decorate');
  await p.getByRole('button',{name:'Sixth Avenue',exact:true}).click();
  await select(p,'bands');await l(p,'#musicOptions .music-option').last().click();
  await select(p,'balloons');
  while(await count(p)<10)await l(p,'#realGallery .asset-card').first().press('Enter');
  assert.equal(await count(p),10);
  assert.equal(await l(p,'#realGallery .asset-card:not(:disabled)').count(),0);
  await key(p,'[data-scroll-gallery="lineup"][data-direction="-1"]','Space');
  await key(p,'[data-scroll-gallery="lineup"][data-direction="1"]');await visible(p,'#lineup .slot[data-index="9"]');
  await tools(p,'#saveBtn');await status(p,'saved on this device');
  const old=await state(p);assert.equal(old.pieces.length,10);assert.equal(old.scene,'sixth-avenue');assert.equal(old.music,'celebration');assert.equal(old.savedParades.length,1);
  await tools(p,'#builderNewParadeBtn');assert.equal(await count(p),0);
  await tools(p,'#savedParadesBtn');await l(p,'#savedParadeList button').first().click();assert.equal(await count(p),10);
  await tools(p,'#saveBtn');await status(p,'saved on this device');
  await p.reload();await l(p,'#guestModeBtn').click();await visible(p,'#entryParadeChoice');
  await l(p,'#entryOpenParadeBtn').click();assert.equal(await count(p),10);
  const current=await state(p);assert.deepEqual(current.pieces,old.pieces);assert.equal(current.scene,old.scene);assert.equal(current.music,old.music);
  await tools(p,'#helpBtn');await visible(p,'#helpModal');await p.keyboard.press('Escape');await hidden(p,'#helpModal');
  await key(p,'#homeBtn');await visible(p,'#portalGrade');
  assert.equal(calls.length,before);
}
async function quota(browser){
  const ctx=await context(browser);
  await ctx.addInitScript(()=>{const method=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(k).startsWith('parade_2026_'))throw new DOMException('Test quota','QuotaExceededError');return method.call(this,k,v);};});
  const before=calls.length,p=await ctx.newPage();
  await enterGuest(p);await l(p,'#realGallery .asset-card').first().click();await tools(p,'#saveBtn');await status(p,'saving is unavailable');
  assert.equal(await count(p),1);assert.equal(calls.length,before);
}
async function enterStudent(p,grade,no){
  await p.goto(url,{waitUntil:'domcontentloaded'});
  await key(p,'[data-portal-grade="'+grade+'"]');await visible(p,'#portalTeacher');
  await l(p,'#teacherChoices button').first().press('Space');await visible(p,'#portalNumber');
  await l(p,'#numberOther').fill(String(no));await key(p,'#numberOther');await hidden(p,'#onboarding');await hidden(p,'#studentModal');
}
async function student(browser){
  rows.clear();calls.length=0;
  const a=await (await context(browser)).newPage(), b=await (await context(browser,1024,600)).newPage();
  try{
    await enterStudent(a,1,97);assert.equal(await count(a),0);assert.match(await l(a,'#gradeTag').textContent(),/grade 1/i);
    await visible(a,'#homeBtn');assert.equal(await l(a,'a[href*="balloon-designer"]:visible,#workshopNav:visible,#myBalloonsBtn:visible').count(),0);
    await l(a,'#realGallery .asset-card').first().press('Enter');await tools(a,'#saveBtn');await status(a,'saved online');
    const storageKey=calls.find(([method])=>method==='POST')?.[1];assert.ok(storageKey,'Mock intercepted create');
    assert.equal(rows.get(storageKey).parade.pieces.length,1);
    await enterStudent(b,1,97);await visible(b,'#entryParadeChoice');await key(b,'#entryOpenParadeBtn');assert.equal(await count(b),1);
    await l(b,'#realGallery .asset-card').nth(1).press('Space');await tools(b,'#saveBtn');await status(b,'saved online');
    assert.equal(rows.get(storageKey).parade.pieces.length,2);
    const saved=structuredClone(rows.get(storageKey));
    await l(a,'#realGallery .asset-card').nth(2).press('Space');await tools(a,'#saveBtn');await status(a,'other copy|ask your teacher');
    assert.deepEqual(rows.get(storageKey),saved,'Stale version cannot overwrite newer save');assert.equal(await count(a),2);
    failRead=failWrite=true;
    await enterStudent(b,2,98);assert.equal(await count(b),0);assert.match(await l(b,'#gradeTag').textContent(),/grade 2/i);
    await status(b,'offline|unavailable');await l(b,'#realGallery .asset-card').first().press('Enter');await tools(b,'#saveBtn');await status(b,'online saving is unavailable');
    assert.equal(await count(b),1);
    failRead=failWrite=false;
    await enterStudent(b,2,98);await key(b,'#entryOpenParadeBtn');
    assert.equal(await count(b),1);assert.deepEqual(rows.get(storageKey),saved,'Grade 2 fallback never touches Grade 1');
  }finally{failRead=failWrite=false;}
}
async function embed(browser){
  const p=await (await context(browser,1024,600)).newPage();
  await p.goto(new URL('__qa_embed__',url).href);
  const f=p.frameLocator('iframe[title="Parade Maker"]');
  await visible(f,'#guestModeBtn');assert.equal(await f.locator('html.embedded').count(),1);
  await key(f,'#guestModeBtn');await f.locator('#realGallery .asset-card').first().press('Space');await key(f,'#playBtn');await visible(f,'#cinema');
  assert.ok(await f.locator('#cinema').evaluate(e=>{const r=e.getBoundingClientRect(),d=document.documentElement;return d.scrollWidth<=innerWidth+2&&d.scrollHeight<=innerHeight+2&&r.width>=900&&r.height>=500;}));
  await key(f,'#closeMovieBtn');await hidden(f,'#cinema');
}
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  url=process.env.PARADE_URL?new URL(process.env.PARADE_URL).href:await serve();origin=new URL(url).origin;
  const executablePath=process.env.PARADE_CHROMIUM_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
  const args=process.env.PARADE_CHROMIUM_ARGS_MODULE?require(process.env.PARADE_CHROMIUM_ARGS_MODULE).args:undefined;
  const proxy=process.env.PARADE_BROWSER_PROXY?{server:process.env.PARADE_BROWSER_PROXY,bypass:'localhost,127.0.0.1'}:undefined;
  let fails=0;
  const checks=[...dimensions.map(([w,h])=>['Chromebook '+w+'×'+h,b=>visual(b,w,h)]),['Guest save/keyboard/limit',guest],['Guest storage failure',quota],['Mock student save/grade/conflict/offline',student],['Guest synthetic classroom embed',embed]];
  for(const [name,fn] of checks){
    if(process.env.PARADE_TEST_FILTER&&!name.match(new RegExp(process.env.PARADE_TEST_FILTER,'i')))continue;
    let browser;
    try{
      browser=await chromium.launch({headless:true,executablePath,args,proxy});
      await fn(browser);console.log('PASS '+name);
    }catch(e){fails++;console.error('FAIL '+name+'\n'+e.stack);}
    finally{await browser?.close().catch(()=>{});}
  }
  console.log('Parade acceptance failures: '+fails);process.exitCode=fails?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server?.close());
