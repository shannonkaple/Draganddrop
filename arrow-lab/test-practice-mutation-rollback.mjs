// Run: node arrow-lab/test-practice-mutation-rollback.mjs
// Source-level regression only; live Chromebook/browser QA remains open.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./game.mjs',import.meta.url),'utf8');
const start=source.indexOf('function commitPracticeChange(change){');
const end=source.indexOf('function restore(){',start);
assert.ok(start>=0&&end>start,'the actual practice transaction is present');
const exactHelper=source.slice(start,end);
function harness(persist){
 const create=new Function('persist',`
  let run={player:{x:1,y:1},trail:[[1,1]],level:3};
  let wallet={total:25,owned:['violet']};
  let saving=true,warnings=0,writes=0;
  function showLoginStorageWarning(){warnings++}
  function save(){writes++;saving=persist(run,wallet);if(!saving)showLoginStorageWarning()}
  ${exactHelper}
  return {
   act:mode=>commitPracticeChange(()=>{
    run.player.x=7;run.trail.push([7,1]);
    wallet.total=5;wallet.owned.push('pink');
    if(mode==='reject')return false;
    if(mode==='throw')throw Error('partial mutation');
   }),
   state:()=>({run,wallet,saving,warnings,writes})
  };
 `);
 return create(persist);
}
for(const [mode,persist,expected,writes,warnings] of [
 ['reject',()=>true,false,0,0],
 ['throw',()=>true,false,0,1],
 ['saveFailure',()=>false,false,1,1],
 ['success',()=>true,true,1,0]
]){
 const h=harness(persist);
 assert.equal(h.act(mode),expected,mode+' result');
 const state=h.state();
 assert.equal(state.writes,writes,mode+' storage writes');
 assert.equal(state.warnings,warnings,mode+' accessible warning');
 assert.equal(state.run.player.x,expected?7:1,mode+' player position');
 assert.deepEqual(state.run.trail,expected?[[1,1],[7,1]]:[[1,1]],mode+' maze trail');
 assert.equal(state.wallet.total,expected?5:25,mode+' wallet');
 assert.deepEqual(state.wallet.owned,expected?['violet','pink']:['violet'],mode+' nested purchases');
}
console.log('PASS: rejected/throwing/failed-write practice mutations roll back; verified save commits');
