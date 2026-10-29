import assert from 'node:assert/strict';
import fs from 'node:fs';
const s=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const code=s.slice(s.indexOf(' function worldTreasures('),s.indexOf(' function computer('));
const ids=Array.from({length:16},(_,i)=>'candy'+i);
const a={collectedWorldItems:[...ids,'pirate','svg','emoji'],wallet:{rainbowStars:50},mazeRuns:{}};
const snapshot=JSON.stringify(a);
const fn=new Function('a','backgroundHomes','objectGroups','earnedKeys','isSupportedCollectibleArt','itemArt',code+';return worldTreasures')(a,[{id:'background_candy',theme:'candy'}],{candy:ids.map(id=>[id,id])},a=>a.collectedWorldItems,p=>/\.(png|jpg)$/.test(p),id=>id==='svg'?'x.svg':id==='emoji'?'⭐':id+'.png');
assert.equal(fn('background_candy').length,10);assert(!fn('background_candy').includes('pirate'));assert.equal(JSON.stringify(a),snapshot);assert.match(s,/const treasures=worldTreasures\(id\)/);assert.match(s,/const pageSize=4/);console.log('PASS capped world inventory, no other-world extras, saved inventory untouched, paging wired');
