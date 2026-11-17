import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const start=source.indexOf(' function pauseHiddenHazards(){');
const end=source.indexOf(' function blur(){',start);
assert.ok(start>=0&&end>start,'hidden-tab patrol pause helper is present');
assert.match(source,/document\.addEventListener\('visibilitychange',pauseHiddenHazards\)/);
assert.match(source,/document\.removeEventListener\('visibilitychange',pauseHiddenHazards\)/);
assert.match(source,/function blur\(\)\{heldSpace=false;setDuck\(false\);pauseHiddenHazards\(\)\}/);
assert.match(source,/warning=setTimeout\(\(\)=>\{if\(closed\|\|view!=='maze'\|\|\$\('adventure-dialog'\)\?\.open\|\|document\.hidden\)\{pauseHiddenHazards\(\);return\}/);

const create=(hidden,run)=>{
  const document={hidden},cleared=[];
  const fn=new Function('document','clearTimeout','r',
    'let warning=123;'+source.slice(start,end)+';return {pauseHiddenHazards,getWarning:()=>warning};');
  const result=fn(document,id=>cleared.push(id),run);
  result.pauseHiddenHazards();
  return {cleared,warning:result.getWarning(),run};
};
const hiddenRun={hazards:[
 {id:'pirate_parrot_enemy',index:2,path:[{x:1,y:2},{x:2,y:2}],warning:true},
 {id:'pirate_crab_enemy',index:0,path:[{x:4,y:4}],warning:true}
],player:{x:2,y:3},steps:14,items:[{id:'treasure',collected:true}]};
const before=structuredClone(hiddenRun);
const paused=create(true,hiddenRun);
assert.deepEqual(paused.cleared,[123],'pending enemy movement timeout cancelled');
assert.equal(paused.warning,null);
assert.ok(paused.run.hazards.every(enemy=>!('warning' in enemy)));
assert.deepEqual(paused.run.hazards.map(enemy=>enemy.index),before.hazards.map(enemy=>enemy.index),'enemy patrol indexes unchanged');
assert.deepEqual(paused.run.player,before.player,'student stays on the same maze tile');
assert.deepEqual(paused.run.items,before.items,'collected rewards are preserved');
const visibleRun=structuredClone(before),visible=create(false,visibleRun);
assert.deepEqual(visible.cleared,[],'visible game keeps normal warning timer');
assert.equal(visible.warning,123);
assert.deepEqual(visible.run,before,'normal gameplay is untouched');
console.log('PASS: hidden-tab hazard pause, cleanup and preserved student state');
