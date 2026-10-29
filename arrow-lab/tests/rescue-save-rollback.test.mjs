import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../adventure.mjs',import.meta.url),'utf8');
const start=source.indexOf(' function commitRescueHome(');
const end=source.indexOf(' function rescue(',start);
assert.ok(start>=0&&end>start,'Verified rescue commit must exist in the shipped game');
const code=source.slice(start,end);

function fixture({persist=true,eligible=true,existingFriends=true}={}){
 const a={
  ownedWorldIds:['background_candy','background_pirate'],
  worldFriends:existingFriends?{candy:{homeLandId:'background_candy'}}:undefined,
  pendingRescueFriendId:'pirate',
  mazeRuns:{lab_pirate_8:{player:{x:7,y:3}}},
  completedLevelIds:['lab_pirate_8'],
  wallet:{rainbowStars:24},
  decorations:{background_candy:['shop_candy_cloud']}
 };
 let writes=0;
 const context={
  a,saved:false,
  rescueWorld:(record,id,home)=>{
   if(!eligible||id!=='pirate'||!record.ownedWorldIds.includes(home)||record.worldFriends?.[id])return false;
   (record.worldFriends??={})[id]={homeLandId:home};
   record.pendingRescueFriendId=null;
   return true;
  },
  save:()=>{writes++;context.saved=persist}
 };
 const commitRescueHome=runInNewContext(code+'\ncommitRescueHome',context);
 return {a,commitRescueHome,writes:()=>writes};
}
const snapshot=value=>JSON.stringify(value);

test('successful rescue places the friend once in the selected owned world',()=>{
 const f=fixture(),progress=snapshot(f.a.mazeRuns),stars=f.a.wallet.rainbowStars;
 assert.equal(f.commitRescueHome('pirate','background_pirate'),true);
 assert.equal(f.a.worldFriends.pirate.homeLandId,'background_pirate');
 assert.equal(f.a.pendingRescueFriendId,null);
 assert.equal(f.a.wallet.rainbowStars,stars);
 assert.equal(snapshot(f.a.mazeRuns),progress);
 assert.equal(f.writes(),1);
});
test('rejected save restores pending rescue and all existing student data',()=>{
 const f=fixture({persist:false}),before=snapshot(f.a);
 assert.equal(f.commitRescueHome('pirate','background_pirate'),false);
 assert.equal(snapshot(f.a),before);
 assert.equal(f.writes(),1);
});
test('failed save does not invent a worldFriends object in an older record',()=>{
 const f=fixture({persist:false,existingFriends:false}),before=snapshot(f.a);
 assert.equal(f.commitRescueHome('pirate','background_pirate'),false);
 assert.equal(snapshot(f.a),before);
 assert.equal(Object.hasOwn(f.a,'worldFriends'),false);
});
test('invalid rescue or unowned world never saves or changes progress',()=>{
 const f=fixture({eligible:false}),before=snapshot(f.a);
 assert.equal(f.commitRescueHome('pirate','background_pirate'),false);
 assert.equal(snapshot(f.a),before);
 assert.equal(f.writes(),0);
 const g=fixture(),original=snapshot(g.a);
 assert.equal(g.commitRescueHome('pirate','background_lava'),false);
 assert.equal(snapshot(g.a),original);
 assert.equal(g.writes(),0);
});
test('a rescued friend cannot be placed twice or charged again',()=>{
 const f=fixture();
 assert.equal(f.commitRescueHome('pirate','background_pirate'),true);
 const after=snapshot(f.a);
 assert.equal(f.commitRescueHome('pirate','background_pirate'),false);
 assert.equal(snapshot(f.a),after);
 assert.equal(f.writes(),1);
});
