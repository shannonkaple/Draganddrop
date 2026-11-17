// Isolated browser profiles only. Run with Playwright and optional CHROMIUM_EXECUTABLE / ARROW_QA_URL.
const {chromium}=require('playwright');
const fs=require('fs'),http=require('http'),path=require('path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((q,r)=>{let f=path.join(root,q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';try{r.setHeader('Content-Type',({'.mjs':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream');r.end(fs.readFileSync(f))}catch{r.statusCode=404;r.end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});let checks=0;
for(const size of [{width:1366,height:768},{width:1280,height:720},{width:1024,height:600}]){
const picker=await b.newPage({viewport:size});
await picker.goto(process.env.ARROW_QA_URL||'http://127.0.0.1:'+server.address().port+'/arrow-lab/');
const teachers=picker.locator('[data-teacher]');
const count=await teachers.count();
if(!await teachers.first().evaluate(e=>e===document.activeElement))throw Error('Teacher picker lacks initial focus');
await picker.keyboard.press('ArrowDown');
const afterDown=await teachers.evaluateAll(bs=>bs.indexOf(document.activeElement));
if(afterDown<1)throw Error('Down did not move to next teacher row');
await picker.keyboard.press('ArrowUp');
if(!await teachers.first().evaluate(e=>e===document.activeElement))throw Error('Up did not return to first teacher');
for(let i=1;i<count;i++){
 await picker.keyboard.press('ArrowRight');
 const visible=await teachers.nth(i).evaluate(e=>{const r=e.getBoundingClientRect();return document.activeElement===e&&r.top>=0&&r.bottom<=innerHeight});
 if(!visible)throw Error('Teacher '+i+' is not focused and visible at '+size.width);
}
await picker.keyboard.press('ArrowLeft');await picker.keyboard.press('ArrowRight');
const name=await teachers.last().textContent();await picker.keyboard.press('Enter');
if(!(await picker.locator('#app').textContent()).includes(name))throw Error('Enter selected wrong teacher');
if(!await picker.locator('[data-number="1"]').evaluate(e=>e===document.activeElement))throw Error('Number picker lacks focus');
await picker.keyboard.press('ArrowRight');
if(!await picker.locator('[data-number="2"]').evaluate(e=>e===document.activeElement))throw Error('Number arrow selection failed');
await picker.keyboard.press('Enter');await picker.locator('[data-hero]').first().waitFor();
console.log('PASS: keyboard-only teacher scrolling, Enter and number selection at '+size.width+'x'+size.height);
await picker.close();
for(const id of ['luna_axolotl','cosmo_fox','nova_panda','pixel_pig','zippy_turtle','coco_koala','berry_bunny','sparky_dragon','mochi_otter','bolt_bot']){
const p=await b.newPage({viewport:size});await p.goto(process.env.ARROW_QA_URL||'http://127.0.0.1:'+server.address().port+'/arrow-lab/');await p.locator('[data-teacher="grade1-01"]').click();await p.locator('[data-number="24"]').click();await p.locator('[data-hero="'+id+'"]').click();await p.locator('#continue-adventure').click();
await p.locator('.character-player img').evaluate(i=>i.decode());
await p.waitForTimeout(150);
for(const duck of [false,true]){
if(duck)await p.keyboard.down('Space');
const result=await p.locator('.character-player').evaluate(e=>{const i=e.querySelector('img'),c=e.parentElement,ir=i.getBoundingClientRect(),cr=c.getBoundingClientRect();return {loaded:i.naturalWidth>0,fit:getComputedStyle(i).objectFit,inside:ir.left>=cr.left&&ir.right<=cr.right&&ir.top>=cr.top&&ir.bottom<=cr.bottom,cell:[cr.width,cr.height],image:[ir.width,ir.height]}});
if(!result.loaded||!result.inside||result.fit!=='contain')throw Error(JSON.stringify({id,size,duck,result}));checks++;
if(duck)await p.keyboard.up('Space');
}
if(id==='cosmo_fox'&&process.env.ARROW_QA_OUTPUT)await p.screenshot({path:path.join(process.env.ARROW_QA_OUTPUT,'portrait-fit-'+size.width+'.png')});
await p.close();
}}
console.log('PASS: '+checks+' portrait bounds/decode checks, all ten characters at three Chromebook sizes, standing and ducking.');await b.close();server.close()})().catch(e=>{console.error(e);process.exit(1)});
