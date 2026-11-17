const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:1366,height:768}});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(process.env.PARADE_TEST_URL || 'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#portalGrade [data-portal-grade="1"]');
  async function tvHidden(label){
    const state=await page.locator('#cinema').evaluate(el=>({
      hasHiddenClass:el.classList.contains('hidden'),
      display:getComputedStyle(el).display,
      visibility:getComputedStyle(el).visibility
    }));
    if(!state.hasHiddenClass||state.display!=='none') throw new Error(label+': TV incorrectly visible: '+JSON.stringify(state));
    console.log('PASS TV hidden:',label);
  }
  await tvHidden('initial grade picker');
  await page.locator('#portalGrade [data-portal-grade="1"]').click();
  await page.waitForSelector('#teacherChoices button');
  if(!(await page.locator('#portalTeacher').isVisible()))throw new Error('Teacher picker not visible');
  await tvHidden('teacher picker');
  await page.locator('#teacherChoices button').first().click();
  if(!(await page.locator('#portalNumber').isVisible()))throw new Error('Student number picker not visible');
  await tvHidden('student-number picker');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#guestModeBtn');
  await page.locator('#guestModeBtn').click();
  await page.waitForFunction(()=>document.querySelector('#app')&&!document.querySelector('#app').inert,{timeout:15000});
  await tvHidden('parade creator after entering as guest');
  const count=(await page.locator('#lineupCount').textContent()).trim();
  if(!/^0\b/.test(count)) throw new Error('Guest parade did not start empty: '+count);
  console.log('PASS new parade starts with zero items');
  const first=page.locator('#realGallery button.asset-card').first();
  await first.click();
  if(await page.locator('#playBtn').isDisabled())throw new Error('Play stayed disabled after choosing a balloon');
  console.log('PASS Play activates after one selection');
  if(errors.length)console.warn('Nonfatal page errors:',errors.slice(0,4));
  await page.screenshot({path:'thanksgiving-parade/qa-editor.png',fullPage:false});
await page.locator('.step[data-tab="bands"]').click();
console.log('BAND_DIAGNOSTICS',JSON.stringify(await page.locator('#bandGallery .band-members img').evaluateAll(imgs=>imgs.map(img=>({src:img.getAttribute('src'),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,rect:{w:img.getBoundingClientRect().width,h:img.getBoundingClientRect().height},display:getComputedStyle(img).display,visibility:getComputedStyle(img).visibility,opacity:getComputedStyle(img).opacity})))));
  await page.screenshot({path:'thanksgiving-parade/qa-bands.png',fullPage:false});
await page.locator('#playBtn').click();
await page.waitForTimeout(800);
await page.screenshot({path:'thanksgiving-parade/qa-playback.png',fullPage:false});
await page.screenshot({path:'thanksgiving-parade/qa-playback.jpg',type:'jpeg',quality:66,fullPage:false});
const movie=page.locator('#cinema');
if(!(await movie.isVisible())) throw new Error('Play did not open parade playback');
const dims=await page.locator('#movieScene').boundingBox();
if(!dims||dims.width<950)throw new Error('Parade stage is still too small: '+JSON.stringify(dims));
const frameVisible=await page.locator('#tvFrameRaster').isVisible();
if(frameVisible)throw new Error('Rejected navy TV frame is still visible');
if(await page.locator('#pauseBtn').isDisabled())throw new Error('Pause should be available during playback');
await page.locator('#pauseBtn').click();
if(await page.locator('#playMovieBtn').isDisabled())throw new Error('Resume did not enable after Pause');
await page.locator('#playMovieBtn').click();
if(await page.locator('#pauseBtn').isDisabled())throw new Error('Pause did not re-enable after Resume');
const soundBefore=await page.locator('#soundBtn').getAttribute('aria-pressed');
await page.locator('#soundBtn').click();
const soundAfter=await page.locator('#soundBtn').getAttribute('aria-pressed');
if(soundBefore===soundAfter)throw new Error('Sound button did not toggle');
await page.locator('#closeMovieBtn').click();
if(await movie.isVisible())throw new Error('Back to Studio did not close playback');
console.log('PASS large movie playback, Pause, Resume, Sound, Back to Studio');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
