import assert from 'node:assert/strict';
import {validDrop,requiredDrops} from './drag-activity.mjs';
const good={pointerType:'mouse',button:0,distance:100,x:160,y:130,rect:{left:100,right:200,top:100,bottom:200}};
assert.equal(validDrop(good),true);
for(const change of [{distance:0},{distance:17},{x:99},{y:201},{pointerType:'touch'},{pointerType:'pen'},{button:2}])assert.equal(validDrop({...good,...change}),false,JSON.stringify(change));
assert.equal(requiredDrops(1),4);assert.equal(requiredDrops(8),11);
console.log('Held drag acceptance, movement threshold, target bounds, input filtering, and difficulty checks passed.');

const {hitsBlocker}=await import('./drag-activity.mjs');
const blocker={left:100,right:180,top:100,bottom:190};
assert.equal(hitsBlocker({x:0,y:145},{x:300,y:145},blocker,55,65),true,'Fast jump across blocker must collide');
assert.equal(hitsBlocker({x:0,y:50},{x:300,y:50},blocker,55,65),true,'Whole token hits even when pointer is outside');
assert.equal(hitsBlocker({x:0,y:20},{x:300,y:20},blocker,55,65),false,'Clear route above remains open');
assert.equal(hitsBlocker({x:0,y:280},{x:300,y:280},blocker,55,65),false,'Clear route below remains open');
assert.equal(hitsBlocker({x:40,y:145},{x:50,y:145},blocker,55,65),true,'Final release at token edge must collide');
assert.equal(hitsBlocker({x:40,y:145},{x:40,y:145},blocker,55,65),false,'Stationary token outside stays safe');
assert.equal(hitsBlocker({x:140,y:145},{x:140,y:145},blocker),true,'Stationary token inside hits');
console.log('Swept blocker collision, whole-token overlap, release-edge checks and open detours passed.');
