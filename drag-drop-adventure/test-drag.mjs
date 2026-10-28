import assert from 'node:assert/strict';
import {validDrop,requiredDrops} from './drag-activity.mjs';
const good={pointerType:'mouse',button:0,distance:100,x:160,y:130,rect:{left:100,right:200,top:100,bottom:200}};
assert.equal(validDrop(good),true);
for(const change of [{distance:0},{distance:17},{x:99},{y:201},{pointerType:'touch'},{pointerType:'pen'},{button:2}])assert.equal(validDrop({...good,...change}),false,JSON.stringify(change));
assert.equal(requiredDrops(1),4);assert.equal(requiredDrops(8),11);
console.log('Held drag acceptance, movement threshold, target bounds, input filtering, and difficulty checks passed.');
