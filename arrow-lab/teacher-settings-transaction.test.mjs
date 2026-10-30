import assert from 'node:assert/strict';
import test from 'node:test';
import {commitTeacherSettings} from './teacher-settings-transaction.mjs';
const previous={difficulty:'standard',speed:1600,hints:true,sound:false,reducedMotion:false,touchArrows:false,costs:{power_up:2,super_power_additional:4}};
const next={difficulty:'gentle',speed:2200,hints:false,sound:true,reducedMotion:true,costs:{power_up:3,super_power_additional:6}};
function fixture(mode){
 const records=new Map([['arrow-lab-teacher-settings',JSON.stringify(previous)]]);
 const storage={getItem:k=>records.has(k)?records.get(k):null,setItem:(k,v)=>{if(mode==='throw')throw Error('Storage blocked');if(mode!=='ignore')records.set(k,v)},removeItem:k=>records.delete(k)};
 const settings=structuredClone(previous),config={progression:{upgradeCost:structuredClone(previous.costs)}};
 let persisted=0;
 const ok=commitTeacherSettings({settings,config,next,storage,persist:()=>{persisted++;return mode!=='student-fails'}});
 return {ok,settings,config,records,persisted};
}
test('teacher settings save succeeds only after verified writes',()=>{const f=fixture('ok');assert.equal(f.ok,true);assert.equal(f.settings.difficulty,'gentle');assert.equal(f.config.progression.upgradeCost.power_up,3);assert.equal(f.persisted,1)});
for(const mode of ['throw','ignore','student-fails'])test('teacher settings '+mode+' preserves previous settings',()=>{const f=fixture(mode);assert.equal(f.ok,false);assert.deepEqual(f.settings,previous);assert.deepEqual(f.config.progression.upgradeCost,previous.costs);assert.deepEqual(JSON.parse(f.records.get('arrow-lab-teacher-settings')),previous);assert.equal(f.persisted,mode==='student-fails'?1:0)});
