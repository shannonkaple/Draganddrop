import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:4173/thanksgiving-parade/';
const SIZES = [
  {width:1366,height:768},
  {width:1280,height:720},
  {width:1024,height:600},
  {width:1093,height:614},
  {width:800,height:480},
];
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
await fs.mkdir('thanksgiving-parade/tests/screenshots',{recursive:true});
const problems=[];
for(const size of SIZES){
  const context=await browser.newContext({viewport:size,deviceScaleFactor:1});
  const page=await context.newPage();
  const slug=size.width+'x'+size.height;
  try{
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('#guestModeBtn').click({timeout:10000});
    await page.waitForFunction(()=>!document.querySelector('#app')?.hasAttribute('inert'),{timeout:15000});
    await page.waitForTimeout(350);

    // No global scrolling or clipped layout panels. This measures the real
    // visual viewport (including the browser's zoom/screen size).
    const layout=await page.evaluate(()=>{
      const viewport={width:window.innerWidth,height:window.innerHeight};
      const selectors=['#app','.topbar','.body-layout','.sidebar','.main',
        '#paradePreviewPanel','#paradeLineupPanel','#libraryPanel',
        '#realGallery','#newGallery','.lineup-actions'];
      const rects=selectors.map(selector=>{
        const el=document.querySelector(selector);
        if(!el)return {selector,missing:true};
        const rect=el.getBoundingClientRect();
        return {selector,left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,
          width:rect.width,height:rect.height,
          hidden:getComputedStyle(el).display==='none'};
      });
      return {viewport,rects,docW:document.documentElement.scrollWidth,
        docH:document.documentElement.scrollHeight,
        scale:getComputedStyle(document.querySelector('#app')).zoom};
    });
    for(const rect of layout.rects){
      assert(!rect.missing,slug+': missing '+rect.selector);
      if(rect.hidden)continue;
      assert(rect.left>=-3 && rect.top>=-3 && rect.right<=size.width+3 &&
        rect.bottom<=size.height+3,
        slug+': outside viewport '+rect.selector+' '+JSON.stringify(rect));
      assert(rect.width>0 && rect.height>0,slug+': empty '+rect.selector);
    }
    assert(layout.docW<=size.width+3,slug+': global horizontal overflow '+layout.docW);
    assert(layout.docH<=size.height+3,slug+': global vertical overflow '+layout.docH);

    const balloonLabel=page.locator('#newGalleryCount');
    assert.match(await balloonLabel.innerText(),/Page 1\/\d+/);
    const before=await page.locator('#newGallery .asset-card').count();
    assert(before>0 && before<=6,slug+': wrong gallery page size '+before);
    await page.locator('[data-scroll-gallery="newGallery"][data-direction="1"]').click();
    assert.match(await balloonLabel.innerText(),/Page 2\/\d+/);
    await page.locator('[data-tab="floats"]').click();
    assert.match(await page.locator('#floatGalleryCount').innerText(),/Page 1\/\d+/);
    await page.locator('[data-scroll-gallery="floatGallery"][data-direction="1"]').click();
    assert.match(await page.locator('#floatGalleryCount').innerText(),/Page 2\/\d+/);

    // Save a diagnostic screenshot for review on each tested viewport.
    await page.screenshot({path:'thanksgiving-parade/tests/screenshots/'+slug+'.png',fullPage:false});
    console.log('PASS '+slug+' scale='+layout.scale+
      ' actualViewport='+layout.viewport.width+'x'+layout.viewport.height);
  }catch(err){
    problems.push(slug+': '+err.message);
    console.error('FAIL '+slug+' '+err.message);
    await page.screenshot({path:'thanksgiving-parade/tests/screenshots/'+slug+'-failure.png',fullPage:false}).catch(()=>{});
  }finally{await context.close();}
}
await browser.close();
if(problems.length){
  throw new Error('Chromebook viewport checks failed:\n'+problems.join('\n'));
}
console.log('All Chromebook viewport checks passed.');
