'use strict';
/* THE LITTLE PARADE COMPANY — flying balloon dress-up workshop.
   Original balloon and glossy face atlasses, no background, no baked-on ropes. */
(function(){
  const BODY_SRC='assets/custom/parade-bodies-15.webp';
  const W=640,H=430;
  const BODIES=[
    'TEDDY BEAR','PUPPY','PINK BUNNY','WHITE CAT','DINOSAUR',
    'ALIEN','FRIENDLY MONSTER','CURLY PUFF GIRL','CURLY-HAIR BOY','PONYTAIL GIRL',
    'UNICORN','DRAGON','CHICK','SQUIRREL','SPACE ROBOT'
  ];
  const CATEGORIES=[{"id":"eyes","name":"EYES","names":["NONE","CLASSIC","BIG BLUE","SLEEPY","SURPRISED","HAPPY","SPARKLING","LASHES","DETERMINED","SILLY","STARRY"]},{"id":"noses","name":"NOSES","names":["NONE","BLACK BUTTON","BROWN BEAR","PINK BUNNY","CAT","PUPPY","CLOWN","HEART","ALIEN","GOLD","TINY"]},{"id":"mouths","name":"MOUTHS","names":["NONE","SMILE","TOOTHY GRIN","LAUGH","SURPRISED","TONGUE OUT","SWEET","CROOKED","EXCITED","POUT","SILLY"]},{"id":"hats","name":"HATS","names":["NONE","SANTA","BASEBALL CAP","CROWN","BOW","CHEF","PIRATE","WITCH","PARTY","TURKEY","HARD HAT"]},{"id":"shirts","name":"SHIRTS","names":["NONE","BASIC","BLUE STRIPED","RED STAR","SPORT","HEARTS","POLKA DOTS","SWEATER","PUMPKIN","DENIM","RAINBOW"]},{"id":"shorts","name":"SHORTS","names":["NONE","RED SPORT","BLUE SPORT","CARGO","YELLOW DOT","PURPLE STAR","DENIM","PINK","PLAID","NAVY","KHAKI"]},{"id":"skirts","name":"SKIRTS","names":["NONE","PINK","BLUE","TUTU","YELLOW RUFFLE","RED DOT","BLUE STAR","CHEER","RAINBOW","DENIM","AUTUMN"]},{"id":"shoes","name":"SHOES","names":["NONE","RED SNEAKERS","BLUE SNEAKERS","BROWN BOOTS","PINK SHOES","HERO BOOTS","PINK FLATS","RAIN BOOTS","RUNNING","PURPLE HI TOPS","BLACK"]},{"id":"accessories","name":"HAND ITEMS","names":["NONE","STAR WAND","PUMPKIN","PIE","PARADE FLAG","FLOWERS","TRUMPET","FOOTBALL","LOLLIPOP","GIFT","BALLOONS"]},{"id":"costumes","name":"COSTUMES","names":["NONE","SUPERHERO","ASTRONAUT","PIRATE","FAIRY","DINOSAUR","TURKEY","PUMPKIN","CHEF","PRINCESS","CONSTRUCTION"]}];
  const COLORS={red:'#f65d62',pink:'#f38ac6',blue:'#439ce1',yellow:'#ffd05d',green:'#65c39b',purple:'#9f7ada',cream:'#fff3de'};
  const bodyImage=new Image();
  const cache=new Map();
  const state={base:0,eyes:0,noses:0,mouths:0,hats:0,shirts:0,shorts:0,skirts:0,shoes:0,accessories:0,costumes:0};
  let active='eyes',ready=false;
  const $=id=>document.getElementById(id);
  function imageReady(){return bodyImage.complete&&bodyImage.naturalWidth}
  function loadReady(){if(imageReady()){
    ready=true;cache.clear();pickBase();categoryTabs();options();draw();
    if(typeof renderAll==='function')renderAll();
  }}
  bodyImage.onload=loadReady;
  bodyImage.src=BODY_SRC;
  /* Old placeholder drawings and feature-sheet crops retired; all accessories load individually. */
  function anchors(index){
    // All fifteen are left-facing, prone in flight; per-form anchor corrections.
    const adjust=[
      [0,0,0,0],[5,-4,-4,4],[4,8,0,0],[-4,-1,0,0],[-9,4,12,-4],
      [2,-2,0,0],[5,-4,0,4],[-8,7,-10,1],[4,-5,0,5],[1,5,0,3],
      [-5,-8,0,-1],[-7,4,5,-5],[-3,5,0,4],[0,-5,2,6],[-2,7,-6,-2]
    ][Math.max(0,Math.min(14,index))];
    return {face:[277+adjust[0],159+adjust[1]],hat:[277+adjust[0],100+adjust[1]],body:[398+adjust[2],282+adjust[3]],feet:[513+adjust[2],315+adjust[3]],hands:[150+adjust[0],287+adjust[1]]};
  }
  
  /* Each accessory is a separate transparent PNG. No SVG assets are loaded. */
  const ART_FILES={"accessories":["accessories-01-star-wand.png","accessories-02-pumpkin-basket.png","accessories-03-pie.png","accessories-04-parade-flag.png","accessories-05-bouquet.png","accessories-06-trumpet.png","accessories-07-football.png","accessories-08-lollipop.png","accessories-09-gift.png","accessories-10-balloon-bunch.png"],"costumes":["costumes-01-superhero.png","costumes-02-astronaut.png","costumes-03-pirate.png","costumes-04-fairy.png","costumes-05-dinosaur.png","costumes-06-turkey.png","costumes-07-pumpkin.png","costumes-08-chef.png","costumes-09-princess.png","costumes-10-construction-worker.png"],"eyes":["eyes-01-classic-brown.png","eyes-02-big-blue.png","eyes-03-sleepy.png","eyes-04-surprised.png","eyes-05-happy.png","eyes-06-sparkling.png","eyes-07-lashes.png","eyes-08-determined.png","eyes-09-silly.png","eyes-10-starry.png"],"hats":["hats-01-santa.png","hats-02-baseball-cap.png","hats-03-crown.png","hats-04-red-bow.png","hats-05-chef.png","hats-06-pirate.png","hats-07-witch.png","hats-08-party.png","hats-09-turkey-headband.png","hats-10-hard-hat.png"],"mouths":["mouth-01-closed-smile.png","mouth-02-toothy-grin.png","mouth-03-laugh.png","mouth-04-surprised.png","mouth-05-tongue-out.png","mouth-06-sweet-smile.png","mouth-07-crooked-grin.png","mouth-08-excited.png","mouth-09-pout.png","mouth-10-silly-w.png"],"noses":["noses-01-black-button.png","noses-02-brown-bear.png","noses-03-pink-bunny.png","noses-04-cat-triangle.png","noses-05-puppy.png","noses-06-clown-red.png","noses-07-heart.png","noses-08-alien-green.png","noses-09-gold-button.png","noses-10-little-human.png"],"shirts":["shirts-01-white-basic.png","shirts-02-blue-striped.png","shirts-03-red-star.png","shirts-04-green-sport.png","shirts-05-pink-hearts.png","shirts-06-purple-polka-dot.png","shirts-07-yellow-sweater.png","shirts-08-orange-pumpkin.png","shirts-09-blue-denim.png","shirts-10-rainbow.png","shirts-11-base-white.png"],"shoes":["shoes-01-red-sneakers.png","shoes-02-blue-sneakers.png","shoes-03-brown-boots.png","shoes-04-pink-mary-janes.png","shoes-05-red-superhero.png","shoes-06-pink-flats.png","shoes-07-yellow-rainboots.png","shoes-08-running-shoes.png","shoes-09-purple-high-tops.png","shoes-10-black-dress-shoes.png"],"shorts":["shorts-01-red-sport.png","shorts-02-blue-sport.png","shorts-03-green-cargo.png","shorts-04-yellow-dot.png","shorts-05-purple-star.png","shorts-06-denim.png","shorts-07-pink-ruffle.png","shorts-08-orange-plaid.png","shorts-09-navy-stripe.png","shorts-10-khaki-pocket.png","shorts-11-base-white.png"],"skirts":["skirts-01-pink-pleats.png","skirts-02-blue-pleats.png","skirts-03-lavender-tutu.png","skirts-04-yellow-ruffles.png","skirts-05-red-dot.png","skirts-06-blue-star.png","skirts-07-white-red-cheer.png","skirts-08-rainbow-layered.png","skirts-09-denim.png","skirts-10-autumn-plaid.png"]};
  const ART_ROOT='assets/customization/';
  const artCache=new Map();let artRefresh=0;
  function artPath(category,idx){const name=ART_FILES[category]?.[idx-1];return name?ART_ROOT+category+'/'+name:''}
  function artImage(category,idx){
    const key=category+':'+idx;
    if(!idx)return null;
    if(artCache.has(key))return artCache.get(key);
    const im=new Image();artCache.set(key,im);
    im.onload=()=>{
      if(artRefresh)return;
      artRefresh=requestAnimationFrame(()=>{
        artRefresh=0;
        const canvas=$('workshopCanvas');if(canvas)draw();
        if($('workshopOptions'))options();
      })
    };
    im.onerror=()=>{console.warn('Missing dress-up graphic',key)};
    im.src=artPath(category,idx);
    return im;
  }
  function visualFit(cat,a,base){
    const t={
      eyes:[a.face[0],a.face[1]-4,265,181],
      noses:[a.face[0],a.face[1]+48,220,150],
      mouths:[a.face[0],a.face[1]+83,142,108],
      hats:[a.hat[0],a.hat[1]-37,315,215],
      shirts:[a.body[0]-18,a.body[1]-9,300,207],
      shorts:[a.feet[0]-68,a.feet[1]-28,253,174],
      skirts:[a.feet[0]-87,a.feet[1]-21,275,189],
      shoes:[a.feet[0]+2,a.feet[1]-13,237,163],
      accessories:[a.hands[0]+9,a.hands[1]-25,180,124],
      costumes:[a.body[0]-18,a.body[1]-9,295,203]
    }[cat];
    // Species keep their own anatomy: adjustments target logical attachment areas
    if(!t)return null;
    const [x,y,w,h]=t;
    const species=base<7,creature=base===4||base===5||base===6;
    const scale=(cat==='shoes'&&species)?1.12:(cat==='hats'&&creature)?1.07:1;
    return [x-w*scale/2,y-h*scale/2,w*scale,h*scale];
  }
  function drawSeparate(ctx,cat,idx,a,base){
    if(!idx)return true;
    const im=artImage(cat,idx),r=visualFit(cat,a,base);
    if(!im||!r||!im.complete||!im.naturalWidth)return false;
    ctx.drawImage(im,...r);return true;
  }
  function artworkLoaded(r){
    return CATEGORIES.every(c=>!Number(r[c.id])||(artImage(c.id,Number(r[c.id]))?.complete&&artImage(c.id,Number(r[c.id]))?.naturalWidth));
  }

  function render(canvas,recipe){
    if(!canvas)return false;
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,W,H);
    if(!imageReady())return false;
    const r=recipe||state, idx=Math.max(0,Math.min(14,Number(r.base)||0));
    ctx.drawImage(bodyImage,(idx%5)*512,Math.floor(idx/5)*512,512,466,55,8,555,400);
    const a=anchors(idx);
    // Children ALWAYS wear modest plain white base clothing, even with no outfit selected.
    if(idx===7||idx===8||idx===9){drawSeparate(ctx,'shirts',11,a,idx);drawSeparate(ctx,'shorts',11,a,idx)}
    const value=(cat,old)=>Number(r[cat]??r[old]??0);
    // Dress-up layering matches the forward-reaching flying pose.
    drawSeparate(ctx,'shirts',value('shirts','clothes'),a,idx);
    drawSeparate(ctx,'shorts',value('shorts','shorts'),a,idx);
    drawSeparate(ctx,'skirts',value('skirts','skirts'),a,idx);
    drawSeparate(ctx,'costumes',value('costumes','costumes'),a,idx);
    drawSeparate(ctx,'shoes',value('shoes','shoes'),a,idx);
    drawSeparate(ctx,'eyes',value('eyes','eyes'),a,idx);
    drawSeparate(ctx,'noses',value('noses','nose'),a,idx);
    drawSeparate(ctx,'mouths',value('mouths','mouth'),a,idx);
    drawSeparate(ctx,'hats',value('hats','hat'),a,idx);
    drawSeparate(ctx,'accessories',value('accessories','prop'),a,idx);
    return true;
  }
  function compose(c){
    if(!c||!c.workshop)return null;
    const recipe={base:Math.max(0,Math.min(14,Number(c.baseId)-301)),...c.options};
    const signature=JSON.stringify(recipe);
    if(cache.has(signature))return cache.get(signature);
    if(!imageReady()||!artworkLoaded(recipe))return 'assets/custom/parade-bodies-15.webp';
    const canvas=document.createElement('canvas');render(canvas,recipe);
    const url=canvas.toDataURL('image/webp',.87);cache.set(signature,url);
    return url;
  }
  function draw(){render($('workshopCanvas'),state)}
  function pickBase(){const root=$('workshopBases');if(!root)return;root.innerHTML='';
    BODIES.forEach((name,i)=>{
      const b=document.createElement('button');b.className='workshop-body'+(state.base===i?' chosen':'');b.type='button';
      const cv=document.createElement('canvas');render(cv,{base:i});
      const span=document.createElement('span');span.textContent=name;b.append(cv,span);
      b.onclick=()=>{state.base=i;pickBase();draw()};root.appendChild(b);
    });
  }
  function categoryTabs(){const root=$('workshopTabs');if(!root)return;root.innerHTML='';
    CATEGORIES.forEach(({id,name})=>{const b=document.createElement('button');b.type='button';b.className='workshop-tab'+(id===active?' chosen':'');const icons={eyes:'👀',noses:'👃',mouths:'😁',hats:'👒',shirts:'👕',shorts:'🩳',skirts:'👗',shoes:'👟',accessories:'🎁',costumes:'🎭'};b.textContent=icons[id]+' '+name;b.onclick=()=>{active=id;categoryTabs();options()};root.appendChild(b)})
  }
  function options(){const root=$('workshopOptions');if(!root)return;root.innerHTML='';
    const category=CATEGORIES.find(c=>c.id===active);if(!category)return;
    category.names.forEach((name,i)=>{
      const b=document.createElement('button');b.className='workshop-choice'+(state[active]===i?' chosen':'');b.type='button';
      const cv=document.createElement('canvas');const sample={...state,[active]:i};render(cv,sample);
      const label=document.createElement('span');label.textContent=name;b.append(cv,label);
      b.onclick=()=>{state[active]=i;options();draw()};root.appendChild(b)
    });
  }
  function init(){if(!$('workshopCanvas'))return;
    $('saveCreation').addEventListener('click',()=>{
      if(typeof state==='undefined'||!window.PARADE_WORKSHOP)return;
      if(!artworkLoaded(state)||((state.base===7||state.base===8||state.base===9)&&!(artImage('shirts',11)?.complete&&artImage('shirts',11)?.naturalWidth&&artImage('shorts',11)?.complete&&artImage('shorts',11)?.naturalWidth))){alert('The costume artwork is loading. Please try Save again.');return;}
      // Main game state is a global lexical binding created by app.js.
      if(typeof markChanged!=='function')return;
      if(window.paradeBuilderCount && window.paradeBuilderCount>=99)return;
      /* Saving to MY BALLOONS is independent of the parade lineup limit. */
      const newId=1002+Math.max(-1,...window.paradeCustomIds());
      const name=String($('designName').value||'My Balloon').trim().replace(/[^A-Za-z0-9 -]/g,'').slice(0,26)||'My Balloon';
      const c={id:newId,name,baseId:301+state.base,workshop:true,options:Object.fromEntries(CATEGORIES.map(c=>[c.id,state[c.id]||0]))};
      window.paradeAddCustom(c);
    });
    $('workshopReset').addEventListener('click',()=>{
      for(const c of CATEGORIES)state[c.id]=0;categoryTabs();options();pickBase();draw()
    });
    if(imageReady()){pickBase();categoryTabs();options();draw()}
    else{pickBase();categoryTabs();options()}
    for(const c of CATEGORIES)for(let n=1;n<=10;n++)artImage(c.id,n);artImage('shirts',11);artImage('shorts',11);
  }
  window.PARADE_WORKSHOP={compose,draw,render,state,initialize:init,refresh(){pickBase();categoryTabs();options();draw()},get ready(){return ready}};
  // App-side callbacks keep the saved parade data in the existing cloud/local saving system.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();