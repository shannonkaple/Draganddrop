/* Balloon Maker — builds upon the existing Thanksgiving Parade Studio and art catalog. */
'use strict';
(() => {
  const catalog = window.PARADE_CATALOG;
  if (!catalog || !window.PARADE_WORKSHOP) return;
  const cats = [
    ['eyes','Eyes'],['noses','Noses'],['mouths','Mouths'],['hats','Hats'],
    ['shirts','Shirts'],['shorts','Shorts'],['skirts','Skirts'],['shoes','Shoes'],['accessories','Accessories']
  ];
  const defaults = () => ({eyes:1,noses:0,mouths:1,hats:0,shirts:0,shorts:0,skirts:0,shoes:0,accessories:0});
  let design = {baseId:401,options:defaults()};
  let current = 'body', editing = null, renderTicket = 0;
  let optionPage=0, categoryPage=0, madePage=0;
  const css = document.createElement('style');
  css.textContent = `
  .balloon-maker-entry{margin:12px 0;border:0;border-radius:17px;padding:14px 20px;background:#f9c967;color:#50253b;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 4px 0 #bd8645;display:flex;align-items:center;justify-content:center;gap:10px;width:100%}
  .balloon-maker-entry:hover{filter:brightness(1.05)}
  .balloon-maker-overlay{position:fixed;inset:0;z-index:3000;background:#261b30cf;display:none;align-items:center;justify-content:center;padding:12px}
  .balloon-maker-overlay.open{display:flex}
  .balloon-maker{background:#fffaf0;color:#38263c;width:min(1150px,98vw);height:min(760px,96dvh);border-radius:23px;overflow:hidden;display:grid;grid-template-rows:auto minmax(0,1fr) auto;box-shadow:0 20px 80px #1a142399;font-family:inherit}
  .balloon-maker button{cursor:pointer;font:inherit}
  .balloon-maker-head{background:#763247;color:white;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .balloon-maker-head h2{margin:0;font-size:clamp(19px,2.3vw,28px);color:white}
  .balloon-maker-head button{border:2px solid #ffffff80;border-radius:12px;background:#fff;color:#692c42;font-weight:900;padding:8px 14px}
  .balloon-maker-layout{display:grid;grid-template-columns:minmax(240px,42%) minmax(0,1fr);gap:10px;padding:12px;min-height:0}
  .balloon-maker-preview{background:linear-gradient(165deg,#cdeaf4,#e8f3ed 63%,#f8d8a2);border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;min-height:0;overflow:hidden}
  .balloon-maker-preview:before{content:'✦  YOUR GIANT PARADE BALLOON  ✦';font-weight:900;letter-spacing:1px;color:#674568;font-size:13px;position:absolute;top:15px}
  .balloon-maker-preview img{width:95%;height:78%;object-fit:contain;filter:drop-shadow(0 10px 9px #65566355)}
  .balloon-maker-preview small{position:absolute;bottom:12px;color:#62495b;font-weight:700}
  .balloon-maker-control{min-width:0;min-height:0;display:flex;flex-direction:column;gap:9px}
  .balloon-maker-tabs{display:flex;gap:5px;flex-wrap:wrap}
  .balloon-maker-tabs button{border:2px solid #e7d9d2;border-radius:12px;background:white;padding:8px 10px;font-size:13px;font-weight:800;color:#5b364a}
  .balloon-maker-tabs button.active{background:#ffe6a1;border-color:#a86d3d}
  .balloon-maker-options{overflow-y:auto;min-height:0;flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-content:start;gap:9px;padding:3px}
  .balloon-maker-option{background:#fff;border:2px solid #e5d9cf;border-radius:13px;min-height:96px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5px;gap:4px;color:#473446;min-width:0}
  .balloon-maker-option.selected{border:3px solid #b45a65;background:#fff0db}
  .balloon-maker-option img{width:100%;height:66px;object-fit:contain}
  .balloon-maker-option span{font-weight:800;font-size:12px;text-align:center;overflow-wrap:anywhere}
  .balloon-maker-bottom{background:#fff;border-top:1px solid #eadbd4;padding:10px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .balloon-maker-bottom label{font-size:13px;font-weight:900}
  .balloon-maker-bottom input{width:145px;max-width:38vw;border:2px solid #ceb6ac;border-radius:10px;padding:9px;font-size:15px}
  .balloon-maker-bottom button{border:0;border-radius:12px;padding:11px 13px;background:#f3e7d7;color:#51344b;font-weight:900}
  .balloon-maker-bottom #balloonMakerFinish{background:#377b61;color:#fff;margin-left:auto}
  #balloonMakerMessage{font-size:12px;font-weight:800}
  .made-balloon-card{display:flex;align-items:center;gap:9px;padding:8px;border:2px solid #edd2b2;background:#fff9eb;border-radius:15px;min-width:155px}
  .made-balloon-card img{width:84px;height:87px;object-fit:contain}
  .made-balloon-card button{border:0;border-radius:8px;background:#7f344a;color:white;padding:7px;font-weight:800}
  @media(max-width:720px){.balloon-maker{height:98dvh}.balloon-maker-layout{grid-template-columns:38% 1fr;padding:6px}.balloon-maker-options{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.balloon-maker-tabs button{padding:6px;font-size:11px}.balloon-maker-option{min-height:75px}.balloon-maker-option img{height:50px}.balloon-maker-bottom{padding:7px;gap:5px}.balloon-maker-bottom button{padding:8px}.balloon-maker-preview:before{font-size:10px}}
  `;
  document.head.append(css);
  const overlay = document.createElement('div');
  overlay.id = 'balloonMakerOverlay'; overlay.className = 'balloon-maker-overlay';
  overlay.innerHTML = `<section class="balloon-maker" role="dialog" aria-modal="true" aria-labelledby="balloonMakerHeading">
    <div class="balloon-maker-head"><h2 id="balloonMakerHeading">🎈 Design Your Own Balloon</h2><button type="button" id="balloonMakerClose">✕ Back to Parade</button></div>
    <div class="balloon-maker-layout"><div class="balloon-maker-preview"><img id="balloonMakerImage" alt="Your balloon design"><small>Choose a body, then mix and match!</small></div>
      <div class="balloon-maker-control"><nav class="balloon-maker-tabs" id="balloonMakerTabs" aria-label="Choose what to customize"></nav><div class="balloon-maker-options" id="balloonMakerOptions"></div><div class="balloon-maker-pager"><button id="balloonMakerPrev" type="button" aria-label="Previous choices page">‹</button><span id="balloonMakerPageLabel" aria-live="polite">Page 1 of 1</span><button id="balloonMakerNext" type="button" aria-label="Next choices page">›</button></div></div></div>
    <div class="balloon-maker-bottom"><label for="balloonMakerName">Balloon name</label><input id="balloonMakerName" maxlength="26" autocomplete="off" value="My Balloon" aria-label="Balloon name"><button id="balloonMakerSurprise" type="button">✳ Surprise Me</button><button id="balloonMakerReset" type="button">↺ Start Over</button><span id="balloonMakerMessage" role="status"></span><button id="balloonMakerFinish" type="button">✓ Add to My Parade</button></div>
  </section>`;
  document.body.append(overlay);
  const el = id => document.getElementById(id);
  const makeButton = document.createElement('button');
  makeButton.type = 'button'; makeButton.className = 'balloon-maker-entry';
  makeButton.innerHTML = '<span aria-hidden="true">🎨 🎈</span> DESIGN YOUR OWN BALLOON';
  document.querySelector('#balloonShelves')?.prepend(makeButton);
  const ownShelf = document.createElement('section');
  ownShelf.className='balloon-shelf';ownShelf.id='myBalloonShelf';
  ownShelf.innerHTML='<div class="shelf-heading"><h2>My Created Balloons</h2><span id="myBalloonCount">0 creations</span><button class="arrow-btn" id="myBalloonPrev" type="button" aria-label="Previous saved balloon page">‹</button><button class="arrow-btn" id="myBalloonNext" type="button" aria-label="Next saved balloon page">›</button></div><div id="myBalloonGallery" class="gallery"></div>';
  makeButton.after(ownShelf);
  function optionButton(name, src, selected, action) {
    const b=document.createElement('button');b.type='button';
    b.className='balloon-maker-option'+(selected?' selected':'');
    if(src){const img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';b.append(img)}
    const span=document.createElement('span');span.textContent=name;b.append(span);b.onclick=action;
    return b;
  }
  function options(){
    const pane=el('balloonMakerOptions');
    const cards=[];
    if(current==='body'){
      catalog.bases.forEach(base=>cards.push(optionButton(base.name,base.path,design.baseId===base.id,()=>{
        design.baseId=base.id;options();preview();
      })));
    }else{
      cards.push(optionButton('None / Remove','',!design.options[current],()=>{
        design.options[current]=0;options();preview();
      }));
      const parts=catalog.parts[current]||[];
      parts.forEach((part,i)=>cards.push(optionButton(part.name,part.path,design.options[current]===i+1,()=>{
        design.options[current]=i+1;options();preview();
      })));
      Object.entries(catalog.extra?.[current]||{}).forEach(([id,part])=>cards.push(
        optionButton(part.name,part.path,design.options[current]===Number(id),()=>{
          design.options[current]=Number(id);options();preview();
        })
      ));
    }
    const perPage=window.innerWidth<=720?4:6;
    const pages=Math.max(1,Math.ceil(cards.length/perPage));
    optionPage=Math.min(Math.max(0,optionPage),pages-1);
    pane.replaceChildren(...cards.slice(optionPage*perPage,(optionPage+1)*perPage));
    el('balloonMakerPageLabel').textContent='Page '+(optionPage+1)+' of '+pages;
    el('balloonMakerPrev').disabled=optionPage===0;
    el('balloonMakerNext').disabled=optionPage>=pages-1;
  }
  el('balloonMakerPrev').onclick=()=>{optionPage=Math.max(0,optionPage-1);options()};
  el('balloonMakerNext').onclick=()=>{optionPage++;options()};
  function tabs(){
    const panel=el('balloonMakerTabs');
    const choices=[['body','Body'],...cats];
    const perPage=4;
    const pages=Math.max(1,Math.ceil(choices.length/perPage));
    categoryPage=Math.min(Math.max(0,categoryPage),pages-1);
    panel.replaceChildren();
    const makeArrow=(direction)=>{
      const b=document.createElement('button');
      b.type='button';b.className='maker-category-arrow';
      b.textContent=direction<0?'‹':'›';
      b.setAttribute('aria-label',direction<0?'Previous customization categories':'Next customization categories');
      b.disabled=direction<0?categoryPage===0:categoryPage>=pages-1;
      b.onclick=()=>{categoryPage+=direction;tabs()};
      return b;
    };
    panel.append(makeArrow(-1));
    choices.slice(categoryPage*perPage,(categoryPage+1)*perPage).forEach(([key,name])=>{
      const b=document.createElement('button');b.type='button';b.textContent=name;
      b.className=current===key?'active':'';
      b.setAttribute('aria-pressed',String(current===key));
      b.onclick=()=>{current=key;optionPage=0;tabs();options()};
      panel.append(b);
    });
    panel.append(makeArrow(1));
  }
  function preview(){
    const ticket=++renderTicket;
    const img=el('balloonMakerImage');
    const attempt=(n=0)=>{
      if(ticket!==renderTicket || !overlay.classList.contains('open'))return;
      const src=window.PARADE_WORKSHOP.compose(design);
      if(src){img.src=src;el('balloonMakerMessage').textContent='';return;}
      if(n<32){el('balloonMakerMessage').textContent='Loading artwork…';setTimeout(()=>attempt(n+1),140)}
      else el('balloonMakerMessage').textContent='Some artwork could not load. Try another option.';
    };
    attempt();
  }
  function openMaker(existing=null){
    if(!studentSession)return;
    editing=existing?.id??null;
    design=existing?{baseId:existing.baseId,options:{...defaults(),...existing.options}}:{baseId:401,options:defaults()};
    current='body';optionPage=0;categoryPage=0;el('balloonMakerName').value=existing?.name||'My Balloon';
    overlay.classList.add('open');tabs();options();preview();el('balloonMakerClose').focus();
  }
  function closeMaker(){overlay.classList.remove('open');renderTicket++;makeButton.focus()}
  makeButton.addEventListener('click',()=>openMaker());
  el('balloonMakerClose').onclick=closeMaker;
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeMaker()}});
  el('balloonMakerSurprise').onclick=()=>{
    design.baseId=catalog.bases[Math.floor(Math.random()*catalog.bases.length)].id;
    for(const [key] of cats){const count=(catalog.parts[key]||[]).length;design.options[key]=Math.floor(Math.random()*(count+1))}
    if(design.options.skirts)design.options.shorts=0;
    tabs();options();preview();
  };
  el('balloonMakerReset').onclick=()=>{design={baseId:401,options:defaults()};editing=null;el('balloonMakerName').value='My Balloon';current='body';optionPage=0;categoryPage=0;tabs();options();preview()};
  function nextId(){
    const used=new Set(state.customPieces.map(c=>c.id));
    for(let i=1001;i<=1099;i++)if(!used.has(i))return i;
    return null;
  }
  el('balloonMakerFinish').onclick=async()=>{
    if(!studentSession)return;
    const id=editing||nextId();
    if(!id||(!editing&&state.customPieces.length>=50)){el('balloonMakerMessage').textContent='You have reached the balloon limit.';return}
    const name=(el('balloonMakerName').value||'My Balloon').replace(/[^a-z0-9 -]/gi,'').trim().slice(0,26)||'My Balloon';
    const created={id,name,baseId:design.baseId,workshop:true,options:{...design.options}};
    const src=window.PARADE_WORKSHOP.compose(created);
    if(!src){el('balloonMakerMessage').textContent='Artwork is still loading. Try again.';preview();return}
    const button=el('balloonMakerFinish');button.disabled=true;
    try{
      const index=state.customPieces.findIndex(c=>c.id===id);
      if(index<0)state.customPieces.push(created);else state.customPieces[index]=created;
      savedImages.set(id,src);
      try{await window.PARADE_IMAGES.put(studentSession.key,created,src)}catch{}
      if(!state.pieces.includes(id)&&state.pieces.length<MAX[state.grade])state.pieces.push(id);
      markChanged();renderAll();renderMade();closeMaker();
      notify('Your balloon was added! Save your parade.');
    }finally{button.disabled=false}
  };
  function renderMade(){
    const gallery=el('myBalloonGallery');gallery.replaceChildren();
    const creations=state.customPieces.filter(c=>c.workshop);
    const perPage=2;
    const pages=Math.max(1,Math.ceil(creations.length/perPage));
    madePage=Math.min(Math.max(0,madePage),pages-1);
    gallery.style.setProperty('--page-columns',String(perPage));
    el('myBalloonCount').textContent=creations.length+' creations · '+(madePage+1)+'/'+pages;
    el('myBalloonPrev').disabled=madePage===0;
    el('myBalloonNext').disabled=madePage>=pages-1;
    creations.slice(madePage*perPage,(madePage+1)*perPage).forEach(c=>{
      const card=document.createElement('div');card.className='made-balloon-card';
      const img=document.createElement('img');img.alt=c.name;const src=customSource(c);if(src)img.src=src;card.append(img);
      const info=document.createElement('div');const name=document.createElement('b');name.textContent=c.name;info.append(name);
      const add=document.createElement('button');add.type='button';add.textContent=state.pieces.includes(c.id)?'In Parade':'Add';
      add.disabled=state.pieces.includes(c.id)||state.pieces.length>=MAX[state.grade];
      add.onclick=()=>{state.pieces.push(c.id);markChanged();renderAll();renderMade()};
      const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.style.margin='4px';edit.onclick=()=>openMaker(c);
      const del=document.createElement('button');del.type='button';del.textContent='Delete';del.style.background='#a55a55';
      del.onclick=()=>{
        if(!confirm('Delete '+c.name+'?'))return;
        state.customPieces=state.customPieces.filter(x=>x.id!==c.id);
        state.pieces=state.pieces.filter(id=>id!==c.id);
        state.savedParades=state.savedParades.map(copy=>({...copy,pieces:copy.pieces.filter(id=>id!==c.id)}));
        savedImages.delete(c.id);window.PARADE_IMAGES.remove(studentSession.key,c).catch(()=>{});
        markChanged();renderAll();renderMade();
      };
      info.append(document.createElement('br'),add,edit,del);card.append(info);gallery.append(card);
    });
  }
  el('myBalloonPrev').onclick=()=>{madePage=Math.max(0,madePage-1);renderMade()};
  el('myBalloonNext').onclick=()=>{madePage++;renderMade()};
  // Repaint custom creations when a student or saved draft changes.
  const originalRender=window.paradeRefreshCreations;
  window.paradeRefreshCreations=()=>{originalRender?.();renderMade()};
  const observer=new MutationObserver(()=>{if(!el('balloonShelves')?.classList.contains('hidden'))renderMade()});
  observer.observe(el('balloonShelves'),{attributes:true,attributeFilter:['class']});
  document.querySelectorAll('[data-tab="balloons"]').forEach(b=>b.addEventListener('click',renderMade));
  document.querySelector('#guestModeBtn')?.addEventListener('click',()=>setTimeout(renderMade,100));
  renderMade();
})();