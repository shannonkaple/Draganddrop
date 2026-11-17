import assert from 'node:assert/strict';
import fs from 'node:fs';
const s=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const code=s.slice(s.indexOf(' function introduceFriend('),s.indexOf(' function openCandyWorld('));
for(let i=0;i<8;i++){
 const a={wallet:{rainbowStars:37},mazeRuns:{keep:{steps:12}}},companions=Array.from({length:8},(_,n)=>({id:'world'+n,name:'Friend '+n}));let shown=0;
 const fn=new Function('a','companions','save','saved','modal','companionArt','esc','$','closeModal',code+';return introduceFriend')(a,companions,()=>{},true,(title,body)=>{shown++;assert.ok(body.includes('Friend '+i));return {classList:{add(){}}}},id=>id,x=>x,()=>({}),()=>{});
 fn(i);fn(i);assert.equal(shown,1);assert.equal(a.friendIntrosShown['world'+i],true);assert.equal(a.wallet.rainbowStars,37);assert.equal(a.mazeRuns.keep.steps,12);
 const copy=JSON.parse(JSON.stringify(a));assert.equal(copy.friendIntrosShown['world'+i],true);
}
assert.match(s,/ready\?'YOU DID IT!'/);assert.match(s,/introduceFriend\(0\)/);assert.match(s,/introduceFriend\(i\)/);assert.match(s,/friendProgress\(i\)/);
console.log('PASS: eight once-only introductions, persisted flags, unchanged wallet/run, celebration and progress wiring');
