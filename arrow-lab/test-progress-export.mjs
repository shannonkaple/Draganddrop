import assert from 'node:assert/strict';
import {buildArrowLabProgressCsv} from './progress-export.mjs';
const entries=new Map([
 ['arrow-lab-class-v1:t1:1',JSON.stringify({teacherName:'Mrs. "Fox"',adventure:{completedLevelIds:['a','b'],worldFriends:{candy:{}},wallet:{rainbowStars:9},collectedComputerGearIds:['mouse','keyboard'],earnedSkillBadgeIds:['arrows']}})],
 ['arrow-lab-class-v1:t1:2','{broken json'],
 ['arrow-lab-class-v1:t1:3',JSON.stringify({teacherName:'Mrs. Fox',run:{level:3}})],
 ['arrow-lab-class-v1:t1:4',JSON.stringify({adventure:'broken'})],
 ['arrow-lab-class-v1:t1:5',JSON.stringify({adventure:{completedLevelIds:['a'],wallet:{rainbowStars:'wrong'}}})]
]);
let reads=0;const storage={getItem(k){reads++;return entries.get(k)??null},setItem(){throw Error('must never write')},removeItem(){throw Error('must never delete')}};
const csv=buildArrowLabProgressCsv([{id:'t1',name:'Fox'}],storage,5);
assert.equal(reads,5);assert.equal(csv.trim().split('\n').length,6);
assert.match(csv,/Mrs\. ""Fox""/);assert.match(csv/,/,'');
assert.match(csv,/UNREADABLE SAVE — DO NOT OVERWRITE/);assert.match(csv,/PRACTICE ONLY — NO ADVENTURE/);
assert.match(csv,/UNREADABLE ADVENTURE — DO NOT OVERWRITE/);assert.match(csv,/NEEDS REVIEW — ORIGINAL PRESERVED/);
const unavailable={getItem(){throw Error('blocked')},setItem(){throw Error('must never write')}};
assert.match(buildArrowLabProgressCsv([{id:'t1',name:'Fox'}],unavailable,1),/STORAGE UNAVAILABLE/);
console.log('Progress CSV read-only export checks passed');
