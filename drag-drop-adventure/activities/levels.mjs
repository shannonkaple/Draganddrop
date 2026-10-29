import {ACTIVITY_TYPES,ACTIVITY_NAMES,rect} from './engines.mjs';
export {ACTIVITY_TYPES,ACTIVITY_NAMES};
export const WORLD_IDS=['candy','pirate','arctic','castle','space','jurassic','ocean','lava'];
const tray=(i,n)=>({x:70+i*(860/Math.max(1,n-1)),y:515});
const patterns=[['A','B'],['A','A','B'],['A','B','B'],['A','B','C'],['A','B','B','C']];
// Every world/activity owns an independently replaceable configuration.
export function makeLevel(def,theme,override={}){
 const wi=def.worldIndex,engine=ACTIVITY_TYPES[def.worldStage-1],assets=theme.items;
 if(!assets?.length)throw Error('A level needs approved image assets');
 const art=i=>assets[(i+wi)%assets.length],pieces=[],targets=[];
 const piece=(i,key,w=88,h=w)=>({id:'piece-'+i,key,...tray(i,6),w,h,asset:art(i)});
 const target=(i,accept,x,y,w=120,h=120)=>({id:'target-'+i,accept:[accept],...rect(x,y,w,h),snap:20,capacity:1,asset:art(i)});
 const level={id:def.id,world:WORLD_IDS[wi],engine,title:ACTIVITY_NAMES[def.worldStage-1],width:1000,height:600,background:theme.background,pieces,targets,walls:[],hazards:[],artStatus:'existing-approved-art',snap:20};
 if(engine==='maze'){
  pieces.push({...piece(0,'exit',72),x:95,y:120});
  targets.push({...target(0,'exit',850,425,130,130),label:'EXIT',asset:null});
  const shift=(wi%3)*15;
  level.walls=[rect(250+shift,0,38,390),rect(565-shift,210,38,390)];
  level.solution=[{x:95,y:120},{x:120,y:480},{x:420,y:480},{x:420,y:110},{x:730,y:110},{x:915,y:490}];
  level.hazards=theme.enemies.slice(0,wi>2?2:1).map((asset,i)=>({id:'hazard-'+i,asset,...rect(i?735:390,i?270:290,80,80),motion:wi%2||i?{axis:'x',range:45,period:6500+wi*300}:null}));
 }else if(engine==='sort'){
  const n=6+wi%5;
  for(let i=0;i<n;i++)pieces.push({...piece(i,'group-'+i%3,78),...tray(i,n),asset:art(i%3)});
  for(let i=0;i<3;i++)targets.push({...target(i,'group-'+i,100+i*300,110,200,245),capacity:0,asset:art(i),label:art(i).name+' group'});
 }else if(engine==='pack'){
  const n=4+wi%4;
  for(let i=0;i<n;i++){
   const w=75+(i%3)*22,h=65+(i%2)*30,key='fit-'+i;
   pieces.push({...piece(i,key,w,h),...tray(i,n)});
   targets.push({...target(i,key,105+(i%4)*225,70+Math.floor(i/4)*180,w+14,h+14),label:'Fit here'});
  }
  level.container=rect(65,35,870,355);
 }else if(engine==='path'){
  const n=4+wi%3;
  for(let i=0;i<n;i++){
   pieces.push({...piece(i,'path-'+i,95),...tray(n-1-i,n)});
   targets.push({...target(i,'path-'+i,55+i*(810/(n-1)),155+(i%2)*110,115,115),label:'Gap '+(i+1)});
  }
 }else if(engine==='pattern'){
  for(let i=0;i<3;i++)pieces.push({...piece(i,['A','B','C'][i],100),x:300+i*200,asset:art(i)});
  level.rounds=patterns.map((pattern,ri)=>{
   const n=pattern.length*2+2,sequence=Array.from({length:n},(_,i)=>pattern[i%pattern.length]);
   const slots=sequence.map((key,i)=>({...target(i,key,30+i*(930/n),160,Math.min(108,880/n),110),asset:art(['A','B','C'].indexOf(key))}));
   return {name:pattern.join(''),sequence,fixed:slots.slice(0,-2),targets:slots.slice(-2).map(t=>({...t,id:'round-'+ri+'-'+t.id,asset:null,label:'?'}))};
  });
 }else if(engine==='scene'){
  const n=6;
  for(let i=0;i<n;i++){
   pieces.push({...piece(i,'scene-'+i),...tray(n-1-i,n)});
   targets.push({...target(i,'scene-'+i,100+(i%3)*310,55+Math.floor(i/3)*195,135,135),label:art(i).name});
  }
  if(wi>=3)level.hazards=theme.enemies.slice(0,1).map(asset=>({id:'hazard-0',asset,...rect(470,385,75,75),motion:{axis:'x',range:180,period:9000}}));
 }else if(engine==='order'){
  const n=4+wi%4;
  for(let i=0;i<n;i++){
   const size=55+i*10;
   pieces.push({...piece(i,'rank-'+i,size),...tray(n-1-i,n),asset:art(0)});
   targets.push({...target(i,'rank-'+i,30+i*(940/n),160,Math.min(130,880/n),155),asset:null,label:String(i+1)});
  }
 }else if(engine==='deliver'){
  const n=4+wi%3;
  for(let i=0;i<n;i++)pieces.push({...piece(i,'cargo-'+i%2,85),...tray(i,n),asset:art(i%2)});
  for(let i=0;i<2;i++)targets.push({...target(i,'cargo-'+i,150+i*500,135+i*90,190,155),capacity:0,label:'Deliver here',asset:art(i),motion:{axis:wi%2?'y':'x',range:65+wi*3,period:7000+wi*350,phase:i*Math.PI}});
 }
 // Art Agent overrides can replace images AND geometry without engine edits.
 const result={...level,...override,id:def.id,world:WORLD_IDS[wi],engine};
 validateLevel(result);return result;
}
export function validateLevel(level){
 if(!ACTIVITY_TYPES.includes(level.engine)||!level.pieces.length)throw Error('Invalid engine or pieces: '+level.id);
 if(new Set(level.pieces.map(p=>p.id)).size!==level.pieces.length)throw Error('Duplicate pieces');
 const groups=level.rounds?level.rounds.map(r=>r.targets):[level.targets];
 for(const targets of groups){
  if(new Set(targets.map(t=>t.id)).size!==targets.length)throw Error('Duplicate targets');
  for(const t of targets){if(t.w<=0||t.h<=0||t.x<0||t.y<0||t.x+t.w>1000||t.y+t.h>600||!t.accept?.length)throw Error('Invalid target geometry');if(!level.pieces.some(p=>t.accept.includes(p.key)))throw Error('Unsolvable target');}
 }
 for(const asset of [...level.targets.map(t=>t.asset),...level.hazards.map(h=>h.asset),...(level.rounds||[]).flatMap(r=>r.fixed.map(t=>t.asset))].filter(Boolean))if(!/\.(png|jpe?g)(?:[?#]|$)/i.test(asset.image||''))throw Error('Only PNG/JPEG artwork is allowed');
 for(const p of level.pieces)if(!/\.(png|jpe?g)(?:[?#]|$)/i.test(p.asset?.image||'')||!Number.isFinite(p.w)||!Number.isFinite(p.h))throw Error('Missing piece art or dimensions');
 return level;
}
