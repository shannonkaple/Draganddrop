'use strict';
// Compact embed view for the STEM Classroom Screen. Grade, teacher and number entry remain interactive.
if(new URLSearchParams(window.location.search).get('embed')==='1')document.documentElement.classList.add('embedded');
/* Thanksgiving Parade Studio — original browser app. Provided artwork remains unmodified. */
const SUPABASE_URL='https://vcjyhcnsuiwdeqqbiwgx.supabase.co';
const SUPABASE_KEY='sb_publishable_EwVEFoVOIY4F_qH69otfww_FmYOLGBe';
const ASSETS='assets/balloons/';
const PIECES=[
[1,'Hello Kitty','balloon'],[2,'Billie Brightpaw','balloon'],[3,'Earl the Squirrel','balloon'],[4,'Bluey','balloon'],
[5,'Snoopy & Woodstock','balloon'],[6,'Sorcerer Mickey','balloon'],[7,'Underdog','balloon'],[8,'Giant Acorn','balloon'],
[9,'Buckaroo Bob','balloon'],[10,'Buzz Lightyear','balloon'],[11,'Diary of a Wimpy Kid','balloon'],[12,'Dora','balloon'],
[13,'Felix the Cat','balloon'],[14,'Gabby & Pandy','balloon'],[15,'Goku','balloon'],[16,'Derpy Tiger','balloon'],
[17,'Sussie Bird','balloon'],[18,'Mario','balloon'],[19,'Marshall','balloon'],[20,'Noorah','balloon'],
[21,'PAC-MAN','balloon'],[22,'Pikachu & Eevee','balloon'],[23,'Shrek Carriage','balloon'],[24,'Smokey Bear','balloon'],
[25,'Spider-Man','balloon'],[26,'SpongeBob & Gary','balloon'],[27,'Pillsbury Doughboy','balloon'],
[28,'Parade All-Stars','float'],[29,'Amazing Marionettes','float'],[30,'123 Sesame Street','float'],
[31,'Winter Mountain','float'],[32,'Friendsgiving in POPCITY','float'],[33,'Dazzling Dance Party','float'],
[34,'Holiday Countdown','float'],[35,'Tom Turkey','float'],[36,'Santa’s Sleigh','float'],
[37,'Penny the Astronaut','balloon','astronaut-girl'],
[38,'Plum the Dragon','balloon','purple-dragon'],
[39,'Maple the Red Panda','balloon','red-panda'],
[40,'Bubbles the Axolotl','balloon','pink-axolotl'],
[41,'Waffle the Corgi','balloon','waffle-corgi'],
[42,'Juniper the Fox','balloon','juniper-fox'],
[43,'Pebble the Otter','balloon','pebble-otter'],
[44,'Clover the Bunny','balloon','clover-bunny'],
[45,'Miso the Kitten','balloon','miso-kitten'],
[46,'Nori the Frog','balloon','nori-frog'],
[47,'Tater the Turtle','balloon','tater-turtle'],
[48,'Poppy the Penguin','balloon','poppy-penguin'],
[49,'Doodle the Duck','balloon','doodle-duck'],
[50,'Orbit the Robot','balloon','orbit-robot'],
[51,'Nova the Alien','balloon','nova-alien'],
[52,'Comet the Unicorn','balloon','comet-unicorn'],
[53,'Pickle the Triceratops','balloon','pickle-triceratops'],
[54,'Sprout the Stegosaurus','balloon','sprout-stegosaurus'],
[55,'Marshmallow the Yeti','balloon','marshmallow-yeti'],
[56,'Ziggy the Zebra','balloon','ziggy-zebra'],
[57,'Cinnamon the Giraffe','balloon','cinnamon-giraffe'],
[58,'Dot the Ladybug','balloon','dot-ladybug'],
[59,'Peaches the Drum Major','balloon','peaches-drum-major'],
[60,'Kai the Skateboarder','balloon','kai-skateboarder'],
[61,'Sofia the Scientist','balloon','sofia-scientist'],
[62,'Sam the Soccer Star','balloon','sam-soccer-star'],
[63,'Scout the Space Pup','balloon','scout-space-pup'],
[64,'Pip the Octopus','balloon','pip-octopus'],
[65,'Taffy the Narwhal','balloon','taffy-narwhal'],
[66,'Crumb the Gingerbread Kid','balloon','crumb-gingerbread-kid'],
[67,'Emberling','balloon','emberling'],
[68,'Sparkskip','balloon','sparkskip'],
[69,'Mossbloom','balloon','mossbloom']
].map(([id,name,type,art])=>({
 id,name,type,original:Boolean(art),src:art?ASSETS+art+'.webp':(window.PARADE_PIECE_ASSETS||{})[id]||ASSETS+id+'.svg'
}));
const GALLERY_PIECES=PIECES.filter(piece=>piece.id!==8);
const SCENES=[
{id:'storybook',name:'Storybook Parade',badge:'HERALD SQUARE · STORYBOOK PARADE',src:'assets/scenes/storybook-parade.jpg'},
{id:'central-park',name:'Central Park West',badge:'CENTRAL PARK WEST · UPPER WEST SIDE',src:(window.PARADE_SCENE_ASSETS||{})['central-park']||'assets/scenes/central-park.svg'},
{id:'columbus',name:'Columbus Circle',badge:'COLUMBUS CIRCLE · NEW YORK CITY',src:(window.PARADE_SCENE_ASSETS||{})['columbus']||'assets/scenes/columbus.svg'},
{id:'sixth-avenue',name:'Sixth Avenue',badge:'SIXTH AVENUE · MIDTOWN MANHATTAN',src:(window.PARADE_SCENE_ASSETS||{})['sixth-avenue']||'assets/scenes/sixth-avenue.svg'},
{id:'herald-square',name:'Herald Square',badge:'HERALD SQUARE · 34TH STREET',src:(window.PARADE_SCENE_ASSETS||{})['herald-square']||'assets/scenes/herald-square.svg'}
];
const COLORS=[['cranberry','#a83d5b'],['pumpkin','#ee853f'],['gold','#f3b83c'],['forest','#357c62'],['blue','#397cb6'],['purple','#9470b1']];
const MUSIC=[
 {id:'march',label:'Balloons Over the Boulevard',sub:'Festive brass & drums',src:'assets/music/balloons_over_the_boulevard-classroom-loop.ogg',fallback:'assets/music/grand-parade-march.ogg'},
 {id:'bouncy',label:'The Tinsel Cadence',sub:'Upbeat parade music',src:'assets/music/the_tinsel_cadence-classroom-loop.ogg',fallback:'assets/music/silly-balloon-bounce.ogg'},
 {id:'cozy',label:'Fifty Yard Triumph',sub:'Triumphant marching melody',src:'assets/music/fifty_yard_triumph-classroom-loop.ogg',fallback:'assets/music/autumn-stroll.ogg'},
 {id:'celebration',label:'Sunday Morning Strut',sub:'Bright jazzy parade',src:'assets/music/sunday_morning_strut-classroom-loop.ogg',fallback:'assets/music/big-celebration.ogg'}
];
const MAX={1:25,2:25};
const $=id=>document.getElementById(id);
let state={grade:1,classCode:'',number:null,pieces:[],customPieces:[],scene:'storybook',routeTour:false,color:'cranberry',music:'march',activePiece:null};
let tab='balloons',saveTimer=null,studentSession=null,entryRun=0;
function draft(){return {pieces:[...state.pieces],customPieces:[...state.customPieces],scene:state.scene,routeTour:state.routeTour,color:state.color,music:state.music};}
function sanitizeDraft(input,grade=state.grade){
 const v=input&&typeof input==='object'?input:{};
 const customs=Array.isArray(v.customPieces)?v.customPieces.slice(0,50).map(c=>{
  if(!c||!Number.isInteger(c.id)||c.id<1001||c.id>1099)return null;
  const name=String(c.name||'My Balloon').replace(/[^a-z0-9 -]/gi,'').slice(0,26);
  if(c.workshop&&Number.isInteger(c.baseId)&&((c.baseId>=301&&c.baseId<=315)||(c.baseId>=401&&c.baseId<=410))){
   const o=c.options&&typeof c.options==='object'?c.options:{};
   const caps={eyes:10,noses:10,mouths:10,hats:c.baseId>=401?15:10,shirts:10,shorts:10,skirts:10,shoes:10,accessories:10,costumes:10,nose:8,mouth:7,hat:7,clothes:7,prop:7};
   const options={};for(const [key,max] of Object.entries(caps)){if(Object.prototype.hasOwnProperty.call(o,key))options[key]=Math.max(0,Math.min(max,Number(o[key])||0));}
   return {id:c.id,name,baseId:c.baseId,workshop:true,options};
  }
  if(!Number.isInteger(c.baseId)||c.baseId<1||c.baseId>27)return null;
  return {id:c.id,baseId:c.baseId,name,hue:Math.max(0,Math.min(330,Number(c.hue)||0)),strokes:Array.isArray(c.strokes)?c.strokes.slice(0,6).map(st=>({color:['#ffffff','#f8c648','#f66b75','#659bd1','#44b288','#734aa9','#21252d'].includes(st.color)?st.color:'#f66b75',pts:Array.isArray(st.pts)?st.pts.slice(0,40).map(pt=>[Number(pt[0])||0,Number(pt[1])||0]):[]})):[ ]};
 }).filter(Boolean):[];
 const validIds=new Set([...PIECES.map(x=>x.id),...customs.map(x=>x.id)]);
 return {pieces:Array.isArray(v.pieces)?v.pieces.map(Number).filter(id=>validIds.has(id)).slice(0,MAX[grade]):[],customPieces:customs,scene:SCENES.some(x=>x.id===v.scene)?v.scene:SCENES[0].id,routeTour:false,color:COLORS.some(x=>x[0]===v.color)?v.color:'cranberry',music:MUSIC.some(x=>x.id===v.music)?v.music:'march'};
}
const store=window.createParadeStore(SUPABASE_URL,SUPABASE_KEY,(value,grade)=>sanitizeDraft(value,grade));
function notify(message,good=true){$('saveStatus').textContent=message;$('saveStatus').style.color=good?'#6d8b6c':'#b75462';}
function localSave(){if(studentSession?.dirty)store.write(studentSession)}
function markChanged(){
 if(!studentSession)return;
 store.change(studentSession,draft());
 notify('Saving…');
 clearTimeout(saveTimer);
 const session=studentSession;
 saveTimer=setTimeout(()=>saveParade(session),625);
}
async function saveParade(session=studentSession){
 if(!session)return;
 if(session===studentSession)clearTimeout(saveTimer);
 const message=await store.save(session);
 if(session===studentSession)notify(message);
}
function scene(){return SCENES.find(x=>x.id===state.scene)||SCENES[0]}
function currentColor(){return COLORS.find(x=>x[0]===state.color)?.[1]||'#a83d5b'}
function renderAll(){renderProgress();renderLineup();renderGallery();renderDecorate();renderScene();renderPreview();renderTabs();}
function renderProgress(){const count=state.pieces.length;$('countText').textContent=`${count} parade ${count===1?'star':'stars'} chosen`;$('gradeTag').textContent=`GRADE ${state.grade}`;$('lineupCount').textContent=`${count} in your parade`;$('progressBar').style.width=`${Math.min(100,Math.max(5,count*4))}%`;$('studentTitle').textContent=`Director #${state.number}`;$('gradeDescription').textContent='Pick balloons and floats, arrange your lineup, and watch your parade!';$('playBtn').disabled=count===0||state.pieces.some(id=>!getPiece(id)?.src);$('tipText').textContent=count===MAX[state.grade]?'Your parade is ready! Remove a piece to make a change.':'Pick your favorites and use the arrows to choose their parade order.'}
const customSrcCache=new Map();
const savedImages=new Map();
async function restoreImages(session){
 savedImages.clear();
 await Promise.all(state.customPieces.filter(design=>design.workshop).map(async design=>{
  try{
   const src=await window.PARADE_IMAGES?.get(session.key,design);
   if(src&&studentSession===session&&state.customPieces.includes(design))savedImages.set(design.id,src);
  }catch{}
 }));
 if(studentSession===session)window.paradeRefreshCreations();
}

function customSource(c){
 if(c.workshop)return savedImages.get(c.id)||window.PARADE_WORKSHOP?.compose(c)||'';
 const signature=JSON.stringify(c);if(customSrcCache.has(signature))return customSrcCache.get(signature);
 const original=PIECES.find(x=>x.id===c.baseId)||PIECES[0];
 const strokes=(c.strokes||[]).map(st=>{const points=st.pts.map(pt=>`${Math.round(pt[0])},${Math.round(pt[1])}`).join(' ');return `<polyline points="${points}" stroke="${st.color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`}).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="450" viewBox="0 0 480 450"><image href="${original.src}" x="42" y="0" width="396" height="450" preserveAspectRatio="xMidYMid meet" style="filter:hue-rotate(${c.hue}deg)"/>${strokes}</svg>`;
 const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);customSrcCache.set(signature,url);return url;
}
function getPiece(id){const standard=PIECES.find(p=>p.id===id);if(standard)return standard;const c=state.customPieces.find(p=>p.id===id);return c?{id:c.id,name:c.name,type:'balloon',src:customSource(c),custom:true}:null;}
function renderLineup(){const el=$('lineup');el.innerHTML='';const max=MAX[state.grade];const visible=Math.min(max,Math.max(5,state.pieces.length+1));el.style.gridTemplateColumns=`repeat(${Math.min(8,visible)},minmax(var(--slot-min,77px),1fr))`;for(let i=0;i<visible;i++){const id=state.pieces[i];const piece=getPiece(id);const slot=document.createElement('div');slot.className='slot '+(piece?'filled':'')+(state.activePiece===i?' active':'');slot.setAttribute('role','listitem');slot.innerHTML=`<span class="slot-number">${i+1}</span>`;if(piece){slot.draggable=true;slot.innerHTML+=`<img ${piece.src?'src="'+piece.src+'"':''} alt="${piece.name}" loading="lazy"><span class="slot-label" title="${piece.name.replaceAll('"','')}">${piece.name}</span><div class="slot-controls"><button type="button" data-action="left" aria-label="Move ${piece.name} left" ${i===0?'disabled':''}>◀</button><button type="button" data-action="right" aria-label="Move ${piece.name} right" ${i===state.pieces.length-1?'disabled':''}>▶</button><button type="button" data-action="remove" aria-label="Remove ${piece.name}">×</button></div>`;slot.addEventListener('click',e=>{if(e.target.closest('button')){const act=e.target.dataset.action;if(act==='remove'){state.pieces.splice(i,1);state.activePiece=null;}else if(act==='left'&&i>0){[state.pieces[i-1],state.pieces[i]]=[state.pieces[i],state.pieces[i-1]];state.activePiece=i-1;}else if(act==='right'&&i<state.pieces.length-1){[state.pieces[i+1],state.pieces[i]]=[state.pieces[i],state.pieces[i+1]];state.activePiece=i+1;}markChanged();renderAll()}else{state.activePiece=i;renderLineup()}});slot.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',String(i))});slot.addEventListener('dragover',e=>e.preventDefault());slot.addEventListener('drop',e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(from)&&from>=0&&from<state.pieces.length&&from!==i&&i<state.pieces.length){const [x]=state.pieces.splice(from,1);state.pieces.splice(i,0,x);markChanged();renderAll()}})}else{slot.innerHTML+='<span class="slot-empty">+</span><span class="slot-empty-text">EMPTY</span>';slot.addEventListener('click',()=>switchTab('balloons'))}el.appendChild(slot)}}
const newBalloons=GALLERY_PIECES.filter(piece=>piece.original);
const featuredBalloons=[37,59,60,61,62,67,68,69];
const newChoices=[
 ...featuredBalloons.map(id=>newBalloons.find(piece=>piece.id===id)),
 ...newBalloons.filter(piece=>!featuredBalloons.includes(piece.id))
];
function renderShelf(id,choices){
 const gallery=$(id);
 const scrollLeft=gallery.scrollLeft;
 const cards=choices.map(piece=>{
  const selected=state.pieces.includes(piece.id);
  const button=document.createElement('button');
  button.className='asset-card'+(selected?' selected-asset':'');
  button.type='button';
  button.title=piece.name;
  button.setAttribute('aria-label',`Add ${piece.name} to your parade`);
  button.innerHTML=`<span class="add-dot">${selected?'✓':'+'}</span><img src="${piece.src}" alt="" loading="lazy"><span class="asset-name">${piece.name}</span>`;
  button.disabled=state.pieces.length>=MAX[state.grade];
  button.onclick=()=>{
   if(state.pieces.length>=MAX[state.grade])return;
   state.pieces.push(piece.id);
   state.activePiece=state.pieces.length-1;
   markChanged();
   renderAll();
  };
  return button;
 });
 gallery.replaceChildren(...cards);
 gallery.scrollLeft=scrollLeft;
 $(id+'Count').textContent=choices.length+' choices';
}
function renderGallery(){
 if(tab==='balloons'){
  renderShelf('realGallery',GALLERY_PIECES.filter(piece=>piece.type==='balloon'&&!piece.original));
  renderShelf('newGallery',newChoices);
 } else if(tab==='floats'){
  renderShelf('floatGallery',GALLERY_PIECES.filter(piece=>piece.type==='float'));
 }
}
function renderTabs(){
 document.querySelectorAll('.step').forEach(button=>{
  const active=button.dataset.tab===tab;
  button.classList.toggle('selected',active);
  button.setAttribute('aria-pressed',String(active));
 });
 $('balloonShelves').classList.toggle('hidden',tab!=='balloons');
 $('floatShelf').classList.toggle('hidden',tab!=='floats');
 $('decoratePanel').classList.toggle('hidden',tab!=='decorate');
}
function renderScene(){const s=scene();$('stageScene').style.backgroundImage=`url('${s.src}')`;$('sceneChip').textContent=s.name;$('stageSign').textContent=s.badge;$('stageHeading').textContent=state.grade===1?'Your magical NYC parade':'Your own NYC parade'}
function renderPreview(){const g=$('stageCharacters');g.innerHTML='';$('stageEmpty').classList.toggle('hidden',state.pieces.length>0);let items=state.pieces.slice(0,2);items.forEach((id,i)=>{const p=getPiece(id);if(!p?.src)return;const el=document.createElement('img');el.src=p.src;el.alt=p.name;el.style.cssText=`position:absolute;bottom:${p.type==='float'?'-8%':'18%'};left:${i===0?0:50}%;width:${p.type==='float'?'55%':'47%'};height:${p.type==='float'?'93%':'77%'};object-fit:contain;object-position:center bottom;filter:drop-shadow(0 5px 5px #33253675);${p.type==='float'?'':`animation:bob ${2.5+i*.31}s ease-in-out infinite;`}`;el.loading='lazy';g.appendChild(el)});$('previewCaption').textContent=state.pieces.length?`${state.pieces.length} parade stars are ready for the big day!`:'Make your lineup, then watch it come to life.'}
function renderDecorate(){const sc=$('scenes');sc.innerHTML='';SCENES.forEach(s=>{const b=document.createElement('button');b.type='button';b.className='scene-option'+(state.scene===s.id?' active':'');b.innerHTML=`<img class="scene-thumb" src="${s.src}" alt="">${s.name}`;b.onclick=()=>{state.scene=s.id;markChanged();renderAll()};sc.appendChild(b)});
const colors=$('colors');colors.innerHTML='';COLORS.forEach(([name,color])=>{const b=document.createElement('button');b.type='button';b.className='swatch'+(state.color===name?' active':'');b.style.background=color;b.title=name;b.setAttribute('aria-label',name+' banner color');b.onclick=()=>{state.color=name;document.documentElement.style.setProperty('--wine',color);markChanged();renderAll()};colors.appendChild(b)});
const music=$('musicOptions');music.innerHTML='';MUSIC.forEach(m=>{const b=document.createElement('button');b.type='button';b.className='music-option'+(state.music===m.id?' active':'');b.innerHTML=`♫ ${m.label}<small>${m.sub}</small>`;b.onclick=()=>{state.music=m.id;markChanged();renderAll();};music.appendChild(b)});
}
function switchTab(next){
 tab=next;
 renderTabs();
 if(tab==='decorate')renderDecorate();
 else renderGallery();
 document.querySelector('.body-layout')?.scrollTo({top:0});
 window.scrollTo({top:0,behavior:'instant'});
}
async function enterStudent(){
 const classCode=$('classCode').value.trim().toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12);
 const number=Number($('studentNumber').value);
 if(!/^[A-Z0-9-]{2,12}$/.test(classCode)){ $('entryError').textContent='Use a classroom code with 2–12 letters or numbers.';return; }
 if(!Number.isInteger(number)||number<1||number>99){ $('entryError').textContent='Choose a number from 1 to 99.';return; }
 const run=++entryRun;
 const identity={classCode,number,grade:portalState.grade};
 $('portalError').textContent='Loading your parade…';
 const {session,message}=await store.load(identity);
 if(run!==entryRun)return;
 studentSession=session;
 Object.assign(state,identity,session.draft,{activePiece:null});
 $('entryError').textContent='';
 $('onboarding').classList.add('hidden');
 $('studentModal').classList.add('hidden');
 $('app').inert=false;
 switchTab('balloons');
 renderAll();
 notify(message);
 restoreImages(session);
}
function openStudent(){
 if(window.PARADE_PLAYER?.active)window.PARADE_PLAYER.close();
 clearTimeout(saveTimer);
 if(studentSession?.dirty)saveParade(studentSession);
 entryRun++;
 studentSession=null;
 state.number=null;
 savedImages.clear();
 showPortal('grade');
}
function startMovie(){
 const pieces=state.pieces.map(getPiece).filter(piece=>piece?.src);
 if(!pieces.length)return;
 const track=MUSIC.find(song=>song.id===state.music)??MUSIC[0];
 window.PARADE_PLAYER?.start(pieces,scene(),track);
}
for(const button of document.querySelectorAll('[data-scroll-gallery]')){
 button.addEventListener('click',()=>{
  const gallery=$(button.dataset.scrollGallery);
  gallery.scrollBy({left:Number(button.dataset.direction)*gallery.clientWidth*.85,behavior:'smooth'});
 });
}
// All controls remain operable with keyboard and trackpad. Avoid any touch-only interactions.
document.querySelectorAll('.step').forEach(el=>el.addEventListener('click',()=>switchTab(el.dataset.tab)));
document.querySelectorAll('.grade-pick').forEach(el=>el.addEventListener('click',()=>{state.grade=Number(el.dataset.grade);document.querySelectorAll('.grade-pick').forEach(e=>e.classList.toggle('selected',e===el))}));
$('enterBtn').addEventListener('click',enterStudent);$('studentNumber').addEventListener('keydown',e=>{if(e.key==='Enter')enterStudent()});$('classCode').addEventListener('keydown',e=>{if(e.key==='Enter')$('studentNumber').focus()});$('changeStudentBtn').addEventListener('click',openStudent);$('homeBtn').addEventListener('click',openStudent);$('saveBtn').addEventListener('click',()=>saveParade());$('playBtn').addEventListener('click',startMovie);
$('previewSceneNext').addEventListener('click',()=>{let i=SCENES.findIndex(x=>x.id===state.scene);state.scene=SCENES[(i+1)%SCENES.length].id;markChanged();renderAll()});$('shuffleBtn').addEventListener('click',()=>{const max=Math.min(8,MAX[state.grade]);const pool=[...GALLERY_PIECES].sort(()=>Math.random()-.5);state.pieces=pool.slice(0,max).map(x=>x.id);state.activePiece=null;markChanged();renderAll()});$('helpBtn').addEventListener('click',()=>$('helpModal').classList.remove('hidden'));$('helpClose').addEventListener('click',()=>$('helpModal').classList.add('hidden'));$('helpGotIt').addEventListener('click',()=>$('helpModal').classList.add('hidden'));
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!window.PARADE_PLAYER?.active)$('helpModal').classList.add('hidden');});
// Teachers can bookmark a class-specific link such as ?class=JOHNSON&grade=1.
const params=new URLSearchParams(window.location.search);const classFromUrl=(params.get('class')||'').trim().toUpperCase();if(/^[A-Z0-9-]{2,12}$/.test(classFromUrl)){$('classCode').value=classFromUrl;state.classCode=classFromUrl}const gradeFromUrl=Number(params.get('grade'));if(gradeFromUrl===1||gradeFromUrl===2){state.grade=gradeFromUrl;document.querySelectorAll('.grade-pick').forEach(el=>el.classList.toggle('selected',Number(el.dataset.grade)===gradeFromUrl))}
window.addEventListener('beforeunload',localSave);renderAll();

// Student entrance: grade → teacher → number. Names reflect the school's saved STEM roster groups.
const TEACHERS={
 1:['Arceneaux','Basso','Bell','Boyle','Brice','Canatella','Haney','Hicks','LaCroix','Messer','Ricketts','Simon','Sims','Juvenal','Rizzutto','Vannoy','Williams','Wycoff'],
 2:['Campbell','Dupuy','Ensminger','Flotte','Gremillion','Jeansonne','Johnson','Lord','Mansur','Monte','Satterwhite','Sims','Juvenal','Rizzutto','Thomas','Toler','Tucker']
};
const portalState={grade:1,teacher:'',number:null,step:'grade'};
function showPortal(step){entryRun++;$('app').inert=true;portalState.step=step;$('onboarding').dataset.step=step;const art=$('portalArt');if(art){const names={grade:'choose-grade',teacher:'choose-teacher',number:'choose-number'};art.src='assets/ui/'+(names[step]||'choose-grade')+'.webp';art.alt=step==='grade'?'Choose your grade':step==='teacher'?'Choose your teacher':'Choose your number';}$('onboarding').classList.remove('hidden');['Grade','Teacher','Number'].forEach(name=>$('portal'+name).classList.toggle('hidden',name.toLowerCase()!==step));const stages=['grade','teacher','number'];[1,2,3].forEach(n=>{const el=$('portalDot'+n);el.classList.toggle('current',stages[n-1]===step);el.classList.toggle('done',n-1<stages.indexOf(step))});if(step==='teacher')renderTeacherChoices();if(step==='number'){renderNumberChoices();$('portalSummary').textContent=`Grade ${portalState.grade} · ${portalState.teacher.toUpperCase()}`;$('numberOther').value='';$('portalError').textContent=''}}
function renderTeacherChoices(){const root=$('teacherChoices');root.innerHTML='';TEACHERS[portalState.grade].slice().sort((a,b)=>a.localeCompare(b)).forEach(name=>{let button=document.createElement('button');button.type='button';button.textContent=name.toUpperCase();button.onclick=()=>{portalState.teacher=name;showPortal('number')};root.appendChild(button)})}
function renderNumberChoices(){const root=$('numberChoices');root.innerHTML='';for(let n=1;n<=30;n++){const b=document.createElement('button');b.type='button';b.textContent=n;b.onclick=()=>submitPortal(n);root.appendChild(b)}}
function submitPortal(number){const num=Number(number);if(!Number.isInteger(num)||num<1||num>99){$('portalError').textContent='Choose a number from 1 to 99.';return;}portalState.number=num;
 $('classCode').value=portalState.teacher.toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12);$('studentNumber').value=String(num);document.querySelectorAll('.grade-pick').forEach(el=>el.classList.toggle('selected',Number(el.dataset.grade)===portalState.grade));enterStudent();}
// Decorate the grade menu with the teacher-provided illustrated NYC scenes.
function decorateGameMenus(){
 const artworks=window.PARADE_SCENE_ASSETS||{};
 const scenes=[artworks['central-park'],artworks['columbus'],artworks['sixth-avenue'],artworks['herald-square']].filter(Boolean);
 const menuArt=window.PARADE_MENU_ART;
 if(menuArt)document.documentElement.style.setProperty('--parade-menu-art','url("'+menuArt+'")');
 document.querySelectorAll('[data-portal-grade]').forEach((btn,i)=>{
  const scene=scenes.length?scenes[(i*2)%scenes.length]:null;
  if(scene){btn.style.backgroundImage='linear-gradient(180deg,rgba(255,250,243,.04),rgba(28,32,53,.77)),url("'+scene+'")';btn.style.backgroundSize='cover';btn.style.backgroundPosition='center'}
 });
}
decorateGameMenus();
document.querySelectorAll('[data-portal-grade]').forEach(b=>b.addEventListener('click',()=>{portalState.grade=Number(b.dataset.portalGrade);portalState.teacher='';showPortal('teacher')}));
document.querySelectorAll('[data-go-back]').forEach(b=>b.addEventListener('click',()=>showPortal(b.dataset.goBack)));
$('numberEnter').addEventListener('click',()=>submitPortal($('numberOther').value));$('numberOther').addEventListener('keydown',e=>{if(e.key==='Enter')submitPortal(e.target.value)});
// Original standalone modal is retained for compatibility but the full-screen entrance replaces it.
$('studentModal').classList.add('hidden');showPortal('grade');

// Existing saved creations still render in a student's lineup and parade.
window.paradeRefreshCreations=()=>{
 renderProgress();
 renderLineup();
 renderPreview();
};
