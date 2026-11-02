import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {GALAXY_MAP,PLANET_BACKGROUNDS,GALAXY_STOPS,LEVEL_STOPS} from './art-assets.mjs';
import {PLANETS} from './curriculum.mjs';
const directory=dirname(fileURLToPath(import.meta.url));
function jpegDimensions(data){
 assert.equal(data.readUInt16BE(0),0xffd8,'must be a real JPEG');
 let i=2;
 while(i<data.length){
  if(data[i]!==0xff){i++;continue}
  const marker=data[i+1];if(marker===0xd9||marker===0xda)break;
  if([0x00,0x01,0xd0,0xd1,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7].includes(marker)){i+=2;continue}
  const length=data.readUInt16BE(i+2);
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return [data.readUInt16BE(i+7),data.readUInt16BE(i+5)];
  i+=2+length;
 }
 throw Error('Missing JPEG dimensions');
}
test('One overview plus eight independent full-resolution planet JPEGs',()=>{
 assert.equal(PLANET_BACKGROUNDS.length,8);
 assert.equal(new Set([GALAXY_MAP,...PLANET_BACKGROUNDS]).size,9);
 for(const p of [GALAXY_MAP,...PLANET_BACKGROUNDS]){
  const img=readFileSync(resolve(directory,p));
  assert.deepEqual(jpegDimensions(img),[1672,941],p);
  assert.ok(img.length>100000,'Not a valid full-quality image: '+p);
 }
});
test('Eight visible map pads and eight level locations stay within each scene',()=>{
 assert.equal(PLANETS.length,8);
 for(const points of [GALAXY_STOPS,LEVEL_STOPS]){
  assert.equal(points.length,8);
  for(const p of points)assert.ok(p.x>=5&&p.x<=95&&p.y>=15&&p.y<=85,JSON.stringify(p));
 }
});
test('World identifiers remain stable so prior student saves survive image changes',()=>{
 assert.deepEqual(PLANETS.map(p=>p.id),['launch','moon','robot','crystal','slime','ice','jungle','core']);
});
