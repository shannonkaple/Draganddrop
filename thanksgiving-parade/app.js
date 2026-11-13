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
[34,'Holiday Countdown','float'],[35,'Tom Turkey','float'],[36,'Santa’s Sleigh','float']
].map(([id,name,type])=>({id,name,type,src:(window.PARADE_PIECE_ASSETS||{})[id]||ASSETS+id+'.svg'}));
const SCENES=[
{id:'central-park',name:'Central Park West',badge:'CENTRAL PARK WEST · UPPER WEST SIDE',src:(window.PARADE_SCENE_ASSETS||{})['central-park']||'assets/scenes/central-park.svg'},
{id:'columbus',name:'Columbus Circle',badge:'COLUMBUS CIRCLE · NEW YORK CITY',src:(window.PARADE_SCENE_ASSETS||{})['columbus']||'assets/scenes/columbus.svg'},
{id:'sixth-avenue',name:'Sixth Avenue',badge:'SIXTH AVENUE · MIDTOWN MANHATTAN',src:(window.PARADE_SCENE_ASSETS||{})['sixth-avenue']||'assets/scenes/sixth-avenue.svg'},
{id:'herald-square',name:'Herald Square',badge:'HERALD SQUARE · 34TH STREET',src:(window.PARADE_SCENE_ASSETS||{})['herald-square']||'assets/scenes/herald-square.svg'}
];
const COLORS=[['cranberry','#a83d5b'],['pumpkin','#ee853f'],['gold','#f3b83c'],['forest','#357c62'],['blue','#397cb6'],['purple','#9470b1']];
const MUSIC=[{id:'march',label:'Grand Parade March',sub:'Brass & drums',bpm:114},{id:'bouncy',label:'Silly Balloon Bounce',sub:'Happy & playful',bpm:145},{id:'cozy',label:'Autumn Stroll',sub:'Warm & gentle',bpm:90},{id:'celebration',label:'Big Celebration',sub:'Bright & exciting',bpm:130}];
const MAX={1:25,2:25};
const $=id=>document.getElementById(id);
let state={grade:1,classCode:'',number:null,pieces:[],customPieces:[],scene:'central-park',routeTour:false,color:'cranberry',music:'march',activePiece:null};
let tab='balloons',saveTimer=null,studentModalOpen=true,movie={active:false,paused:false,elapsed:0,lastFrame:0,raf:null,audio:null,muted:false,playedAudio:false,stageIdx:-1,done:false};
function cleanId(x){return Number.isInteger(Number(x))&&Number(x)>=1&&Number(x)<=36?Number(x):null;}
function storageKey(){return `parade_2026_${state.classCode}_${state.grade}_${state.number}`;}
function draft(){return {pieces:[...state.pieces],customPieces:[...state.customPieces],scene:state.scene,routeTour:state.routeTour,color:state.color,music:state.music};}
function sanitizeDraft(input){
 const v=input&&typeof input==='object'?input:{};
 const customs=Array.isArray(v.customPieces)?v.customPieces.slice(0,50).map(c=>{
  if(!c||!Number.isInteger(c.id)||c.id<1001||c.id>1099)return null;
  const name=String(c.name||'My Balloon').replace(/[^a-z0-9 -]/gi,'').slice(0,26);
  if(c.workshop&&Number.isInteger(c.baseId)&&c.baseId>=301&&c.baseId<=315){
   const o=c.options&&typeof c.options==='object'?c.options:{};
   const caps={eyes:10,nose:8,mouth:7,hat:7,clothes:7,shoes:6,prop:7};
   const options={};for(const [key,max] of Object.entries(caps))options[key]=Math.max(0,Math.min(max,Number(o[key])||0));
   return {id:c.id,name,baseId:c.baseId,workshop:true,options};
  }
  if(!Number.isInteger(c.baseId)||c.baseId<1||c.baseId>27)return null;
  return {id:c.id,baseId:c.baseId,name,hue:Math.max(0,Math.min(330,Number(c.hue)||0)),strokes:Array.isArray(c.strokes)?c.strokes.slice(0,6).map(st=>({color:['#ffffff','#f8c648','#f66b75','#659bd1','#44b288','#734aa9','#21252d'].includes(st.color)?st.color:'#f66b75',pts:Array.isArray(st.pts)?st.pts.slice(0,40).map(pt=>[Number(pt[0])||0,Number(pt[1])||0]):[]})):[ ]};
 }).filter(Boolean):[];
 const validIds=new Set([...PIECES.map(x=>x.id),...customs.map(x=>x.id)]);
 return {pieces:Array.isArray(v.pieces)?v.pieces.map(Number).filter(id=>validIds.has(id)).slice(0,MAX[state.grade]):[],customPieces:customs,scene:SCENES.some(x=>x.id===v.scene)?v.scene:SCENES[0].id,routeTour:false,color:COLORS.some(x=>x[0]===v.color)?v.color:'cranberry',music:MUSIC.some(x=>x.id===v.music)?v.music:'march'};
}
function loadDraft(v){Object.assign(state,sanitizeDraft(v));state.activePiece=null;renderAll();}
function notify(message,good=true){$('saveStatus').textContent=message;$('saveStatus').style.color=good?'#6d8b6c':'#b75462';}
function localSave(){if(!state.number)return;try{localStorage.setItem(storageKey(),JSON.stringify(draft()));}catch(e){console.warn('Local save unavailable',e)}}
async function cloudLoad(){const query=new URLSearchParams({select:'parade',class_code:`eq.${state.classCode}`,grade:`eq.${state.grade}`,student_number:`eq.${state.number}`,limit:'1'});const res=await fetch(`${SUPABASE_URL}/rest/v1/parade_projects?${query}`,{headers:{apikey:SUPABASE_KEY,Accept:'application/json'}});if(!res.ok)throw new Error('Cloud load '+res.status);const rows=await res.json();return rows[0]?.parade||null}
async function cloudSave(){const data={class_code:state.classCode,grade:state.grade,student_number:state.number,parade:draft(),updated_at:new Date().toISOString()};const res=await fetch(`${SUPABASE_URL}/rest/v1/parade_projects?on_conflict=class_code,student_number,grade`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(data)});if(!res.ok)throw new Error('Cloud save '+res.status+': '+(await res.text()).slice(0,150));}
function markChanged(){localSave();notify('Saving…');clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveParade(false),850)}
async function saveParade(manual=true){if(!state.number)return;clearTimeout(saveTimer);localSave();try{await cloudSave();notify('✓ Saved online');}catch(e){console.warn(e);notify('Saved on this Chromebook only',false)}if(manual){const button=$('saveBtn');button.textContent='✓ Saved';setTimeout(()=>button.textContent='💾 Save Parade',1600)}}
function scene(){return SCENES.find(x=>x.id===state.scene)||SCENES[0]}
function currentColor(){return COLORS.find(x=>x[0]===state.color)?.[1]||'#a83d5b'}
function renderAll(){renderProgress();renderLineup();renderGallery();renderDecorate();renderScene();renderPreview();renderTabs();}
function renderProgress(){const count=state.pieces.length;$('countText').textContent=`${count} parade ${count===1?'star':'stars'} chosen`;$('gradeTag').textContent=`GRADE ${state.grade}`;$('lineupCount').textContent=`${count} in your parade`;$('progressBar').style.width=`${Math.min(100,Math.max(5,count*4))}%`;$('studentTitle').textContent=`Director #${state.number}`;$('gradeDescription').textContent='Pick balloons and floats, arrange your lineup, and watch your parade!';$('playBtn').disabled=count===0;$('tipText').textContent=count===MAX[state.grade]?'Your parade is ready! Remove a piece to make a change.':'Pick your favorites and use the arrows to choose their parade order.'}
const customSrcCache=new Map();
function customSource(c){
 if(c.workshop&&window.PARADE_WORKSHOP)return window.PARADE_WORKSHOP.compose(c);
 const signature=JSON.stringify(c);if(customSrcCache.has(signature))return customSrcCache.get(signature);
 const original=PIECES.find(x=>x.id===c.baseId)||PIECES[0];
 const strokes=(c.strokes||[]).map(st=>{const points=st.pts.map(pt=>`${Math.round(pt[0])},${Math.round(pt[1])}`).join(' ');return `<polyline points="${points}" stroke="${st.color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`}).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="450" viewBox="0 0 480 450"><image href="${original.src}" x="42" y="0" width="396" height="450" preserveAspectRatio="xMidYMid meet" style="filter:hue-rotate(${c.hue}deg)"/>${strokes}</svg>`;
 const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);customSrcCache.set(signature,url);return url;
}
function getPiece(id){const standard=PIECES.find(p=>p.id===id);if(standard)return standard;const c=state.customPieces.find(p=>p.id===id);return c?{id:c.id,name:c.name,type:'balloon',src:customSource(c),custom:true}:null;}
function renderLineup(){const el=$('lineup');el.innerHTML='';const max=MAX[state.grade];const visible=Math.min(max,Math.max(5,state.pieces.length+1));el.style.gridTemplateColumns=`repeat(${Math.min(8,visible)},minmax(77px,1fr))`;for(let i=0;i<visible;i++){const id=state.pieces[i];const piece=getPiece(id);const slot=document.createElement('div');slot.className='slot '+(piece?'filled':'')+(state.activePiece===i?' active':'');slot.setAttribute('role','listitem');slot.innerHTML=`<span class="slot-number">${i+1}</span>`;if(piece){slot.draggable=true;slot.innerHTML+=`<img src="${piece.src}" alt="${piece.name}" loading="lazy"><span class="slot-label" title="${piece.name.replaceAll('"','')}">${piece.name}</span><div class="slot-controls"><button type="button" data-action="left" aria-label="Move ${piece.name} left" ${i===0?'disabled':''}>◀</button><button type="button" data-action="right" aria-label="Move ${piece.name} right" ${i===state.pieces.length-1?'disabled':''}>▶</button><button type="button" data-action="remove" aria-label="Remove ${piece.name}">×</button></div>`;slot.addEventListener('click',e=>{if(e.target.closest('button')){const act=e.target.dataset.action;if(act==='remove'){state.pieces.splice(i,1);state.activePiece=null;}else if(act==='left'&&i>0){[state.pieces[i-1],state.pieces[i]]=[state.pieces[i],state.pieces[i-1]];state.activePiece=i-1;}else if(act==='right'&&i<state.pieces.length-1){[state.pieces[i+1],state.pieces[i]]=[state.pieces[i],state.pieces[i+1]];state.activePiece=i+1;}markChanged();renderAll()}else{state.activePiece=i;renderLineup()}});slot.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',String(i))});slot.addEventListener('dragover',e=>e.preventDefault());slot.addEventListener('drop',e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(from)&&from>=0&&from<state.pieces.length&&from!==i&&i<state.pieces.length){const [x]=state.pieces.splice(from,1);state.pieces.splice(i,0,x);markChanged();renderAll()}})}else{slot.innerHTML+='<span class="slot-empty">+</span><span class="slot-empty-text">EMPTY</span>';slot.addEventListener('click',()=>switchTab('balloons'))}el.appendChild(slot)}}
function renderGallery(){const g=$('gallery');g.innerHTML='';const type=tab==='floats'?'float':'balloon';const choices=[...PIECES.filter(p=>p.type===type),...(type==='balloon'?state.customPieces.map(p=>getPiece(p.id)):[])];$('libraryCount').textContent=choices.length+' choices';$('libraryEyebrow').textContent=type==='float'?'FLOAT COLLECTION':'BALLOON COLLECTION';$('libraryTitle').textContent=type==='float'?'Choose a fantastic float':'Choose your favorite balloons';for(const p of choices){const selected=state.pieces.includes(p.id);const btn=document.createElement('button');btn.className='asset-card'+(selected?' selected-asset':'')+(p.custom?' custom-card':'');btn.type='button';btn.title=p.name;btn.setAttribute('aria-label',`Add ${p.name} to your parade`);btn.innerHTML=`<span class="add-dot">${selected?'✓':'+'}</span><img src="${p.src}" alt="" loading="lazy"><span class="asset-name">${p.name}</span>`;btn.disabled=state.pieces.length>=MAX[state.grade];btn.onclick=()=>{if(state.pieces.length>=MAX[state.grade]){notify('Lineup full — remove one first!',false);return}state.pieces.push(p.id);state.activePiece=state.pieces.length-1;markChanged();renderAll()};g.appendChild(btn)}}
function renderTabs(){document.querySelectorAll('.step').forEach(el=>el.classList.toggle('selected',el.dataset.tab===tab));const special=tab==='decorate'||tab==='design';$('gallery').classList.toggle('hidden',special);$('decoratePanel').classList.toggle('hidden',tab!=='decorate');$('designPanel').classList.toggle('hidden',tab!=='design');$('galleryBack').classList.toggle('hidden',special);$('galleryForward').classList.toggle('hidden',special);$('libraryCount').classList.toggle('hidden',special);if(tab==='decorate'){$('libraryTitle').textContent='Dress up your parade';$('libraryEyebrow').textContent='PARADE DESIGN STUDIO'}if(tab==='design'){$('libraryTitle').textContent='Create your own balloon';$('libraryEyebrow').textContent='YOUR BALLOON WORKSHOP';drawDesigner()}}
function renderScene(){const s=scene();$('stageScene').style.backgroundImage=`url('${s.src}')`;$('sceneChip').textContent=s.name;$('stageSign').textContent=s.badge;$('stageHeading').textContent=state.grade===1?'Your magical NYC parade':'Your own NYC parade'}
function renderPreview(){const g=$('stageCharacters');g.innerHTML='';$('stageEmpty').classList.toggle('hidden',state.pieces.length>0);let items=state.pieces.slice(0,2);items.forEach((id,i)=>{const p=getPiece(id);if(!p)return;const el=document.createElement('img');el.src=p.src;el.alt=p.name;el.style.cssText=`position:absolute;bottom:${p.type==='float'?'1%':'18%'};left:${i===0?0:50}%;width:${p.type==='float'?'55%':'47%'};height:${p.type==='float'?'93%':'77%'};object-fit:contain;object-position:center bottom;filter:drop-shadow(0 5px 5px #33253675);${p.type==='float'?'':`animation:bob ${2.5+i*.31}s ease-in-out infinite;`}`;el.loading='lazy';g.appendChild(el)});$('previewCaption').textContent=state.pieces.length?`${state.pieces.length} parade stars are ready for the big day!`:'Make your lineup, then watch it come to life.'}
function renderDecorate(){const sc=$('scenes');sc.innerHTML='';SCENES.forEach(s=>{const b=document.createElement('button');b.type='button';b.className='scene-option'+(state.scene===s.id?' active':'');b.innerHTML=`<img class="scene-thumb" src="${s.src}" alt="">${s.name}`;b.onclick=()=>{state.scene=s.id;markChanged();renderAll()};sc.appendChild(b)});
const colors=$('colors');colors.innerHTML='';COLORS.forEach(([name,color])=>{const b=document.createElement('button');b.type='button';b.className='swatch'+(state.color===name?' active':'');b.style.background=color;b.title=name;b.setAttribute('aria-label',name+' banner color');b.onclick=()=>{state.color=name;document.documentElement.style.setProperty('--wine',color);markChanged();renderAll()};colors.appendChild(b)});
const music=$('musicOptions');music.innerHTML='';MUSIC.forEach(m=>{const b=document.createElement('button');b.type='button';b.className='music-option'+(state.music===m.id?' active':'');b.innerHTML=`♫ ${m.label}<small>${m.sub}</small>`;b.onclick=()=>{state.music=m.id;markChanged();renderAll();if(movie.active&&movie.audio){movie.audio.stop();movie.audio=new ParadeMusic(state.music);if(!movie.muted&&!movie.paused)movie.audio.start()}};music.appendChild(b)});
}
function switchTab(next){tab=next;renderTabs();if(next==='balloons'||next==='floats')renderGallery();else if(next==='decorate')renderDecorate();else if(next==='design')drawDesigner();}
async function enterStudent(){const classCode=$('classCode').value.trim().toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12),number=Number($('studentNumber').value);if(!/^[A-Z0-9-]{2,12}$/.test(classCode)){$('entryError').textContent='Please use a classroom code with 2–12 letters or numbers.';return}if(!Number.isInteger(number)||number<1||number>99){$('entryError').textContent='Please enter your student number (1–99).';return}state.classCode=classCode;state.number=number;$('entryError').textContent='';studentModalOpen=false;$('studentModal').classList.add('hidden');renderAll();let saved;try{saved=JSON.parse(localStorage.getItem(storageKey())||'null')}catch{saved=null}if(saved)loadDraft(saved);notify('Checking your cloud save…');try{const cloud=await cloudLoad();if(cloud){loadDraft(cloud);notify('✓ Your parade was loaded')}else if(saved){notify('Local parade loaded');await saveParade(false)}else notify('New parade — have fun!')}catch(e){console.warn(e);notify(saved?'Local parade loaded — offline':'Offline — saves on this computer',false)}}
function openStudent(){if(movie.active)closeMovie();localSave();state.number=null;showPortal('grade');notify('Choose your grade, teacher and number')}
function addConfetti(){const root=$('confetti');root.innerHTML='';for(let i=0;i<65;i++){const b=document.createElement('b');b.style.left=(Math.random()*100)+'%';b.style.background=COLORS[i%COLORS.length][1];b.style.animationDuration=(3+Math.random()*3)+'s';b.style.animationDelay=(Math.random()*3)+'s';root.appendChild(b)}}
// Six parade-crew looks: different complexions, hairstyles, coats, hats and boots.
function handlerIllustration(index){
 const people=[
  {skin:'#c77954',hair:'#322739',coat:'#da4b64',hat:'#803b63',pant:'#374568'},
  {skin:'#f2c294',hair:'#6c4431',coat:'#397eab',hat:'#f1b952',pant:'#293b5e'},
  {skin:'#8f503c',hair:'#292635',coat:'#50a08d',hat:'#4f507d',pant:'#394567'},
  {skin:'#dfab78',hair:'#a46e3f',coat:'#e6a64a',hat:'#723c74',pant:'#39567d'},
  {skin:'#70412f',hair:'#171d32',coat:'#be70a2',hat:'#e0bb5c',pant:'#42476b'},
  {skin:'#e7b6a0',hair:'#533341',coat:'#8a7ac3',hat:'#c85169',pant:'#39476c'}
 ];
 const p=people[(index+people.length)%people.length],v=index%6;
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 133">'+
 '<defs><linearGradient id="coat" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#ffffff" stop-opacity=".35"/><stop offset=".36" stop-color="'+p.coat+'"/><stop offset="1" stop-color="'+p.coat+'"/></linearGradient></defs>'+
 '<path d="M30 91 L25 125 L36 125 L40 95 M48 95 L47 125 L58 125 L57 91" fill="'+p.pant+'" stroke="#343448" stroke-width="3" stroke-linejoin="round"/>'+
 '<path d="M19 123 Q29 119 38 124 L38 131 L18 131 Z M44 123 Q55 119 61 125 L61 131 L43 131 Z" fill="#3d3d55"/>'+
 '<path d="M22 45 Q12 49 13 66 L9 82 Q7 89 17 88 L24 69 L25 97 Q38 103 58 97 L56 59 Q51 48 44 46 Z" fill="url(#coat)" stroke="#4e3e57" stroke-width="2.7"/>'+
 '<path d="M53 56 Q64 48 61 33 L66 19" fill="none" stroke="'+p.coat+'" stroke-width="12" stroke-linecap="round"/>'+
 '<circle cx="67" cy="19" r="7" fill="'+p.skin+'" stroke="#704957" stroke-width="1.2"/>'+
 '<path d="M19 45 Q14 38 17 29 L25 15" fill="none" stroke="'+p.coat+'" stroke-width="10" stroke-linecap="round"/>'+
 '<circle cx="26" cy="15" r="7" fill="'+p.skin+'" stroke="#704957" stroke-width="1.2"/>'+
 '<ellipse cx="39" cy="30" rx="18" ry="20" fill="'+p.skin+'" stroke="#6e4a50" stroke-width="1.5"/>'+
 '<path d="M20 26 Q18 7 35 7 Q49 4 56 22 Q44 12 34 18 Q27 20 20 26" fill="'+p.hair+'"/>'+
 (v%2===0?'<path d="M21 13 Q25 1 40 3 Q52 3 57 15 L55 18 L22 18 Z" fill="'+p.hat+'" stroke="#51435e" stroke-width="2"/><path d="M16 18 Q42 14 62 18" stroke="'+p.hat+'" stroke-width="7" stroke-linecap="round"/>':'<path d="M19 16 Q25 4 42 5 Q53 6 58 18" fill="none" stroke="'+p.hat+'" stroke-width="8" stroke-linecap="round"/>')+
 '<circle cx="34" cy="30" r="1.5" fill="#332d39"/><circle cx="47" cy="30" r="1.5" fill="#332d39"/>'+
 '<path d="M36 37 Q41 41 47 36" fill="none" stroke="#854b4b" stroke-width="2" stroke-linecap="round"/>'+
 '<path d="M32 65 L42 64" stroke="#fff5e9" stroke-width="2"/><path d="M34 56 L42 56" stroke="#fff5e9" stroke-width="2"/>'+
 '<path d="M25 93 L54 93" stroke="#ffd9a3" stroke-width="3" stroke-linecap="round"/>'+
 '</svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function createHandlerLine(parent,seed=0){
 const tethers=document.createElement('div');tethers.className='tethers';
 for(let i=0;i<4;i++){const rope=document.createElement('i');rope.className='tether-rope';tethers.appendChild(rope)}
 parent.appendChild(tethers);
 const crew=document.createElement('div');crew.className='handler-line';
 for(let i=0;i<4;i++){
  const person=document.createElement('span');person.className='handler';
  const img=document.createElement('img');img.src=handlerIllustration(seed*4+i);img.alt='';
  person.appendChild(img);crew.appendChild(person);
 }
 parent.appendChild(crew);
}
const PARADE_INTERVAL=7.5;const PARADE_DURATION_PADDING=16;
function totalDuration(){return state.pieces.length*PARADE_INTERVAL+PARADE_DURATION_PADDING}
function setMovieScene(){const current=SCENES.find(x=>x.id===state.scene)||SCENES[0];if(!current)return;$('movieBackground').style.backgroundImage=`url('${current.src}')`;$('movieLocation').textContent=current.badge;$('movieLocation').style.borderColor=currentColor();}
function buildMovie(){const root=$('movieCharacters');root.innerHTML='';const n=state.pieces.length;state.pieces.forEach((id,i)=>{const p=getPiece(id);if(!p)return;const el=document.createElement('div');el.id='moviePiece'+i;el.className='movie-piece '+p.type;el.style.width=p.type==='float'?'min(84vw,1140px)':'min(37vw,540px)';el.style.height=p.type==='float'?'min(60vh,545px)':'min(68vh,600px)';const art=document.createElement('div');art.className='piece-art';const img=document.createElement('img');img.src=p.src;img.alt=p.name;art.appendChild(img);el.appendChild(art);if(p.type==='balloon')createHandlerLine(el,i);root.appendChild(el)});$('movieSubtitle').textContent=`Director #${state.number} · ${state.classCode} · Grade ${state.grade}`;addConfetti()}
function startMovie(){if(!state.pieces.length)return;$('cinema').classList.remove('hidden');document.body.style.overflow='hidden';movie.active=true;movie.paused=false;movie.elapsed=0;movie.lastFrame=0;movie.stageIdx=-1;movie.done=false;buildMovie();setMovieScene(0);$('movieLocation').style.backgroundColor=currentColor()+'ef';$('pauseBtn').textContent='⏸️ Pause';$('pauseBtn').disabled=false;$('playMovieBtn').disabled=true;$('nowPlaying').textContent='And here comes your parade!';$('timelineFill').style.width='0%';$('soundBtn').textContent=movie.muted?'♫ Sound Off':'♫ Sound On';if(movie.audio)movie.audio.stop();movie.audio=new ParadeMusic(state.music);if(!movie.muted)movie.audio.start();cancelAnimationFrame(movie.raf);movie.raf=requestAnimationFrame(movieFrame)}
function movieFrame(ts){if(!movie.active)return;if(!movie.lastFrame)movie.lastFrame=ts;let delta=Math.min(.1,(ts-movie.lastFrame)/1000);movie.lastFrame=ts;if(!movie.paused&&!movie.done)movie.elapsed+=delta;let t=movie.elapsed;const total=totalDuration();const screen=$('movieScene').getBoundingClientRect();const W=screen.width,H=screen.height;state.pieces.forEach((id,i)=>{const p=getPiece(id),el=$('moviePiece'+i);if(!p||!el)return;const start=i*PARADE_INTERVAL;const progress=(t-start)/15;const x=W*(1.08-progress*1.90);const floatY=H*.97-el.offsetHeight;const y=p.type==='float'?floatY:H*.065;const drift=0;if(p.type==='balloon')el.style.setProperty('--handler-ground',Math.max(76,H*.91-(y+el.offsetHeight))+'px');el.style.transform=`translate3d(${x}px,${y+drift}px,0)`;el.style.opacity=progress<0||progress>1?'0':'1';el.style.zIndex=String(i+1)});
 /* Keep the student's chosen NYC location unchanged for the entire parade. */const current=Math.min(state.pieces.length-1,Math.max(0,Math.floor(t/PARADE_INTERVAL)));const p=getPiece(state.pieces[current]);if(p)$('nowPlaying').textContent=`${p.name} is on parade!`;$('timelineFill').style.width=Math.min(100,t/total*100)+'%';if(t>=total&&!movie.done){movie.done=true;$('nowPlaying').textContent='HOORAY! Your parade was amazing!';addConfetti();movie.audio?.stop();$('playMovieBtn').disabled=false;$('pauseBtn').disabled=true}movie.raf=requestAnimationFrame(movieFrame)}
function pauseMovie(){if(!movie.active||movie.done||movie.paused)return;movie.paused=true;movie.audio?.stop();$('pauseBtn').disabled=true;$('playMovieBtn').disabled=false;$('nowPlaying').textContent='Parade paused — press Play to keep going.'}
function playMovie(){if(!movie.active)return;if(movie.done){startMovie();return}if(!movie.paused)return;movie.paused=false;movie.lastFrame=0;if(!movie.muted)movie.audio?.start();$('playMovieBtn').disabled=true;$('pauseBtn').disabled=false;$('nowPlaying').textContent='Your parade is playing!'}
function closeMovie(){movie.active=false;cancelAnimationFrame(movie.raf);movie.raf=null;movie.audio?.stop();movie.audio=null;$('cinema').classList.add('hidden');document.body.style.overflow='';if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}
class ParadeMusic{
 constructor(style){this.style=style;this.ctx=null;this.timer=null;this.step=0;this.started=false;this.bpm=MUSIC.find(x=>x.id===style)?.bpm||110;this.notes={march:[0,4,7,12,7,4,0,7,5,9,12,9,7,4,2,0],bouncy:[0,7,9,7,4,0,4,7,12,9,7,4,2,4,0,-5],cozy:[0,4,7,4,2,5,9,5,0,4,7,4,-2,2,5,2],celebration:[0,4,7,12,11,7,9,12,14,12,9,7,5,4,2,0]}[style]||[0,4,7,12]}
 start(){if(this.started)return;this.started=true;this.ctx=this.ctx||new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();this.tick();this.timer=setInterval(()=>this.tick(),60000/this.bpm/2)}
 tick(){if(!this.ctx)return;let now=this.ctx.currentTime;let note=this.notes[this.step%this.notes.length];let bass=[-12,-12,-7,-5][Math.floor(this.step/4)%4];this.playTone(293.66*2**(note/12),now,.18,.055,this.style==='cozy'?'sine':'triangle');if(this.step%2===0)this.playTone(130.81*2**(bass/12),now,.22,.028,'sine');if(this.style!=='cozy'&&this.step%4===0)this.playTone(120,now,.09,.025,'sawtooth');this.step++}
 playTone(freq,t,length,vol,type){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+length);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+length+.02)}
 stop(){if(this.timer){clearInterval(this.timer);this.timer=null}this.started=false;this.ctx?.suspend().catch(()=>{})}
}
// All controls remain operable with keyboard and trackpad. Avoid any touch-only interactions.
document.querySelectorAll('.step').forEach(el=>el.addEventListener('click',()=>switchTab(el.dataset.tab)));
document.querySelectorAll('.grade-pick').forEach(el=>el.addEventListener('click',()=>{state.grade=Number(el.dataset.grade);document.querySelectorAll('.grade-pick').forEach(e=>e.classList.toggle('selected',e===el))}));
$('enterBtn').addEventListener('click',enterStudent);$('studentNumber').addEventListener('keydown',e=>{if(e.key==='Enter')enterStudent()});$('classCode').addEventListener('keydown',e=>{if(e.key==='Enter')$('studentNumber').focus()});$('changeStudentBtn').addEventListener('click',openStudent);$('homeBtn').addEventListener('click',openStudent);$('saveBtn').addEventListener('click',()=>saveParade(true));$('playBtn').addEventListener('click',startMovie);$('closeMovieBtn').addEventListener('click',closeMovie);$('replayBtn').addEventListener('click',startMovie);$('pauseBtn').addEventListener('click',pauseMovie);$('playMovieBtn').addEventListener('click',playMovie);$('soundBtn').addEventListener('click',()=>{movie.muted=!movie.muted;if(movie.muted)movie.audio?.stop();else if(!movie.paused&&!movie.done)movie.audio?.start();$('soundBtn').textContent=movie.muted?'♫ Sound Off':'♫ Sound On'});
$('fullscreenBtn').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else $('cinema').requestFullscreen?.()});$('previewSceneNext').addEventListener('click',()=>{let i=SCENES.findIndex(x=>x.id===state.scene);state.scene=SCENES[(i+1)%SCENES.length].id;markChanged();renderAll()});$('galleryBack').addEventListener('click',()=>$('gallery').scrollBy({left:-560,behavior:'smooth'}));$('galleryForward').addEventListener('click',()=>$('gallery').scrollBy({left:560,behavior:'smooth'}));$('shuffleBtn').addEventListener('click',()=>{const max=Math.min(8,MAX[state.grade]);const pool=[...PIECES].sort(()=>Math.random()-.5);state.pieces=pool.slice(0,max).map(x=>x.id);state.activePiece=null;markChanged();renderAll()});$('helpBtn').addEventListener('click',()=>$('helpModal').classList.remove('hidden'));$('helpClose').addEventListener('click',()=>$('helpModal').classList.add('hidden'));$('helpGotIt').addEventListener('click',()=>$('helpModal').classList.add('hidden'));
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(movie.active)closeMovie();else $('helpModal').classList.add('hidden')}});
// Teachers can bookmark a class-specific link such as ?class=JOHNSON&grade=1.
const params=new URLSearchParams(window.location.search);const classFromUrl=(params.get('class')||'').trim().toUpperCase();if(/^[A-Z0-9-]{2,12}$/.test(classFromUrl)){$('classCode').value=classFromUrl;state.classCode=classFromUrl}const gradeFromUrl=Number(params.get('grade'));if(gradeFromUrl===1||gradeFromUrl===2){state.grade=gradeFromUrl;document.querySelectorAll('.grade-pick').forEach(el=>el.classList.toggle('selected',Number(el.dataset.grade)===gradeFromUrl))}
window.addEventListener('beforeunload',localSave);renderAll();

// Student entrance: grade → teacher → number. Names reflect the school's saved STEM roster groups.
const TEACHERS={
 1:['Arceneaux','Basso','Bell','Boyle','Brice','Canatella','Haney','Hicks','LaCroix','Messer','Ricketts','Simon','Sims','Juvenal','Rizzutto','Vannoy','Williams','Wycoff'],
 2:['Campbell','Dupuy','Ensminger','Flotte','Gremillion','Jeansonne','Johnson','Lord','Mansur','Monte','Satterwhite','Sims','Juvenal','Rizzutto','Thomas','Toler','Tucker']
};
const portalState={grade:1,teacher:'',number:null,step:'grade'};
function showPortal(step){portalState.step=step;$('onboarding').classList.remove('hidden');['Grade','Teacher','Number'].forEach(name=>$('portal'+name).classList.toggle('hidden',name.toLowerCase()!==step));const stages=['grade','teacher','number'];[1,2,3].forEach(n=>{const el=$('portalDot'+n);el.classList.toggle('current',stages[n-1]===step);el.classList.toggle('done',n-1<stages.indexOf(step))});if(step==='teacher')renderTeacherChoices();if(step==='number'){renderNumberChoices();$('portalSummary').textContent=`Grade ${portalState.grade} · ${portalState.teacher.toUpperCase()}`;$('numberOther').value='';$('portalError').textContent=''}}
function renderTeacherChoices(){const root=$('teacherChoices');root.innerHTML='';TEACHERS[portalState.grade].slice().sort((a,b)=>a.localeCompare(b)).forEach(name=>{let button=document.createElement('button');button.type='button';button.textContent=name.toUpperCase();button.onclick=()=>{portalState.teacher=name;showPortal('number')};root.appendChild(button)})}
function renderNumberChoices(){const root=$('numberChoices');root.innerHTML='';for(let n=1;n<=30;n++){const b=document.createElement('button');b.type='button';b.textContent=n;b.onclick=()=>submitPortal(n);root.appendChild(b)}}
function submitPortal(number){const num=Number(number);if(!Number.isInteger(num)||num<1||num>99){$('portalError').textContent='Choose a number from 1 to 99.';return;}portalState.number=num;state.grade=portalState.grade;state.pieces=[];state.customPieces=[];state.activePiece=null;
 $('classCode').value=portalState.teacher.toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12);$('studentNumber').value=String(num);document.querySelectorAll('.grade-pick').forEach(el=>el.classList.toggle('selected',Number(el.dataset.grade)===state.grade));$('onboarding').classList.add('hidden');enterStudent();}
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

// Students decorate a polished uploaded balloon illustration on a real drawing canvas.
/* Original outfit workshop; legacy recoloring canvas intentionally retired. */
function drawDesigner(){window.PARADE_WORKSHOP?.draw()}
window.paradeCustomIds=()=>state.customPieces.map(x=>x.id-1001);
window.paradeAddCustom=c=>{
 if(state.pieces.length>=MAX[state.grade]){notify('Your lineup is full. Remove one first.',false);return false}
 if(state.customPieces.some(x=>x.id===c.id)||c.id>1099){notify('Choose another character to replace a previous creation.',false);return false}
 state.customPieces.push(c);state.pieces.push(c.id);state.activePiece=state.pieces.length-1;
 markChanged();renderAll();notify('Your dressed balloon joined the parade!');return true;
};
