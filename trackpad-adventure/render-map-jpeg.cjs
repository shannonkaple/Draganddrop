// Render the same illustrated rainbow road used by the game's eight clickable map stops.
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1600,height:690},deviceScaleFactor:1});
    await page.goto(pathToFileURL(path.join(__dirname,'maps','overview.svg')).href,{waitUntil:'load'});
    await page.screenshot({path:path.join(__dirname,'maps','overview.jpg'),type:'jpeg',quality:90,animations:'disabled'});
    console.log('Saved trackpad-adventure/maps/overview.jpg (1600 × 690 JPEG).');
  } finally { await browser.close() }
})().catch(error=>{console.error(error);process.exitCode=1});
