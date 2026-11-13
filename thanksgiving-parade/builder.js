'use strict';
/* THE LITTLE PARADE COMPANY — flying balloon dress-up workshop.
   Original balloon and glossy face atlasses, no background, no baked-on ropes. */
(function(){
  const BODY_SRC='assets/custom/parade-bodies-15.webp';
  const FEATURE_SRC='assets/custom/parade-features.webp';
  const W=640,H=430;
  const BODIES=[
    'TEDDY BEAR','PUPPY','PINK BUNNY','WHITE CAT','DINOSAUR',
    'ALIEN','FRIENDLY MONSTER','CURLY PUFF GIRL','CURLY-HAIR BOY','PONYTAIL GIRL',
    'UNICORN','DRAGON','CHICK','SQUIRREL','SPACE ROBOT'
  ];
  const CATEGORIES=[
    {id:'eyes',name:'EYES',names:['NONE','BRIGHT','ROUND','SWEET','LASHES','SLEEPY','BIG EYES','BOLD','STARRY','WINK','HAPPY BROWS']},
    {id:'nose',name:'NOSE',names:['NONE','BLACK','PINK','BROWN','GOLD','RED','BLUE','TEAL','ORANGE']},
    {id:'mouth',name:'MOUTH',names:['NONE','SMILE','GRIN','SURPRISED','TINY SMILE','TONGUE','SILLY','OPEN SMILE']},
    {id:'hat',name:'HATS',names:['NONE','COWBOY','CROWN','BOW','PARTY HAT','BEANIE','SUPER MASK','VISOR']},
    {id:'clothes',name:'CLOTHES',names:['NONE','SWEATER','SUPER CAPE','OVERALLS','VEST','RAINCOAT','STAR SHIRT','TUTU']},
    {id:'shoes',name:'SHOES',names:['NONE','RED SNEAKERS','BLUE SNEAKERS','PINK BOOTS','YELLOW BOOTS','SPACE SHOES','GREEN SNEAKERS']},
    {id:'prop',name:'HAND ITEMS',names:['NONE','PUMPKIN','STAR WAND','NYC FLAG','FLOWERS','TROPHY','TURKEY SIGN','BALLOONS']}
  ];
  const COLORS={red:'#f65d62',pink:'#f38ac6',blue:'#439ce1',yellow:'#ffd05d',green:'#65c39b',purple:'#9f7ada',cream:'#fff3de'};
  const bodyImage=new Image(),featureImage=new Image();
  const cache=new Map();
  const state={base:0,eyes:0,nose:0,mouth:0,hat:0,clothes:0,shoes:0,prop:0};
  let active='eyes',ready=false;
  const $=id=>document.getElementById(id);
  function imageReady(){return bodyImage.complete&&bodyImage.naturalWidth&&featureImage.complete&&featureImage.naturalWidth}
  function loadReady(){if(imageReady()){
    ready=true;cache.clear();draw();
    if(typeof renderAll==='function')renderAll();
  }}
  bodyImage.onload=loadReady;featureImage.onload=loadReady;
  bodyImage.src=BODY_SRC;featureImage.src=FEATURE_SRC;
  function shape(ctx,color,coords,line='#56465f',lw=4){
    ctx.beginPath();ctx.moveTo(coords[0][0],coords[0][1]);
    for(let i=1;i<coords.length;i++)ctx.lineTo(coords[i][0],coords[i][1]);
    ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=line;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.stroke();
  }
  function glossy(ctx,x,y,w,h,color){
    const g=ctx.createLinearGradient(x,y,x+w*.4,y+h);
    g.addColorStop(0,'#ffffff');g.addColorStop(.19,color);g.addColorStop(.74,color);g.addColorStop(1,'#5d43668f');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,Math.max(1,w/2),Math.max(1,h/2),0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#4d415b98';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.ellipse(x+w*.32,y+h*.26,w*.16,h*.09,-.22,0,Math.PI*2);ctx.fillStyle='#ffffff8e';ctx.fill();
  }
  function drawEyes(ctx,idx,a){
    if(!idx)return;const piece=idx-1,col=piece%5,row=Math.floor(piece/5);let x=a[0]-80,y=a[1]-61;
    ctx.drawImage(featureImage,col*250,row*250+20,250,195,x,y,160,108);
  }
  function drawNose(ctx,idx,a){
    if(!idx)return;const piece=idx-1,col=piece%5,row=2+Math.floor(piece/5);
    ctx.drawImage(featureImage,col*250,row*250,250,250,a[0]-23,a[1]+35,46,35);
  }
  function drawMouth(ctx,n,a){
    if(!n)return;
    const x=a[0],y=a[1]+67;
    ctx.save();ctx.lineWidth=5;ctx.lineCap='round';ctx.strokeStyle='#54394e';ctx.fillStyle='#6f3449';ctx.beginPath();
    if(n===1||n===4){ctx.arc(x,y-8,n===4?12:24,.08,Math.PI-.08);ctx.stroke()}
    if(n===2||n===7){ctx.ellipse(x,y+2,27,n===2?14:20,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-22,y-4);ctx.lineTo(x+22,y-4);ctx.strokeStyle='#fff2eb';ctx.lineWidth=6;ctx.stroke()}
    if(n===3){ctx.ellipse(x,y+1,13,19,0,0,Math.PI*2);ctx.fill();ctx.stroke()}
    if(n===5){ctx.arc(x,y-8,21,.08,Math.PI-.08);ctx.stroke();glossy(ctx,x-10,y+5,20,14,COLORS.pink)}
    if(n===6){ctx.arc(x,y-6,24,0,Math.PI);ctx.stroke();ctx.beginPath();ctx.arc(x+29,y-3,6,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
  }
  function drawHat(ctx,n,a){
    if(!n)return;const x=a[0]-6,y=a[1]-93;
    ctx.save();ctx.translate(x,y);ctx.rotate(-.09);
    if(n===1){ // cowboy, low brim fits flying head
      glossy(ctx,-103,0,207,28,'#ca8050');shape(ctx,'#b87447',[[-66,2],[-55,-46],[-25,-62],[28,-61],[52,-39],[59,2]]);glossy(ctx,-62,-9,130,21,'#e8ad67');
    }else if(n===2){shape(ctx,'#eab64d',[[-74,7],[-70,-52],[-33,-23],[2,-70],[39,-24],[75,-57],[72,10]]);[-70,-33,2,39,72].forEach((xx,i)=>glossy(ctx,xx-9,i===2?-77:-46,17,17,i===2?COLORS.red:COLORS.pink));glossy(ctx,-78,2,160,24,'#ffdd6a')}
    else if(n===3){glossy(ctx,-70,-28,77,53,COLORS.pink);glossy(ctx,0,-28,77,53,COLORS.pink);glossy(ctx,-15,-20,33,37,COLORS.red)}
    else if(n===4){shape(ctx,'#7d66cf',[[-64,4],[12,-91],[73,5]]);glossy(ctx,4,-104,22,22,'#ffca4f');glossy(ctx,-72,-5,150,24,COLORS.purple)}
    else if(n===5){glossy(ctx,-81,-65,163,94,COLORS.blue);glossy(ctx,-89,5,177,28,COLORS.cream);glossy(ctx,-17,-80,35,25,COLORS.cream)}
    else if(n===6){shape(ctx,'#654b98',[[-83,-1],[-58,-38],[15,-34],[80,-9],[75,17],[23,0],[-30,13]]);glossy(ctx,-92,-11,184,31,COLORS.purple)}
    else if(n===7){glossy(ctx,-82,-17,168,31,COLORS.red);glossy(ctx,45,0,99,18,COLORS.red)}
    ctx.restore();
  }
  function drawClothes(ctx,n,a){
    if(!n)return;
    const x=a[0],y=a[1];ctx.save();ctx.translate(x,y);ctx.rotate(-.19);
    const color=[null,COLORS.pink,COLORS.blue,COLORS.yellow,COLORS.green,COLORS.red,COLORS.purple,COLORS.pink][n];
    if(n===2){ // superhero cape trails with the airflow
      shape(ctx,'#ee575c',[[0,-45],[85,-76],[135,-54],[154,13],[114,51],[52,35],[0,31]],'#923c5b',3)
    }
    glossy(ctx,-72,-50,174,120,color);
    glossy(ctx,-88,-46,60,52,color);glossy(ctx,51,-37,60,52,color);
    if(n===3){shape(ctx,'#599fca',[[-28,-44],[-16,-61],[15,-60],[31,-41],[28,52],[-25,54]]);glossy(ctx,-18,-3,39,32,'#8fd8ee');}
    if(n===4){glossy(ctx,-35,-18,68,60,'#f9d5ad');glossy(ctx,-55,27,105,14,COLORS.cream)}
    if(n===5){glossy(ctx,-7,-34,26,85,COLORS.cream);glossy(ctx,-55,43,104,13,COLORS.yellow)}
    if(n===6){shape(ctx,'#fbd55a',[[0,-35],[10,-11],[36,-8],[18,10],[23,35],[1,20],[-18,33],[-12,9],[-38,-5],[-9,-12]]);}
    if(n===7){glossy(ctx,36,17,105,40,COLORS.pink);glossy(ctx,27,37,85,34,COLORS.cream)}
    ctx.restore();
  }
  function drawShoes(ctx,n,a){
    if(!n)return;const colors=['',COLORS.red,COLORS.blue,COLORS.pink,COLORS.yellow,COLORS.cream,COLORS.green];
    const feet=[[a[0]-8,a[1]+8],[a[0]+21,a[1]-42]];
    for(const [x,y] of feet){
      ctx.save();ctx.translate(x,y);ctx.rotate(-.16);
      glossy(ctx,-28,-13,65,n===3||n===4?62:48,colors[n]);
      glossy(ctx,-26,n===3||n===4?29:19,69,14,'#fff8e9');
      ctx.strokeStyle='#fff9ee';ctx.lineWidth=2;
      for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(-9+k*12,-2);ctx.lineTo(-9+k*12,12);ctx.stroke()}
      ctx.restore();
    }
  }
  function drawProp(ctx,n,a){
    if(!n)return;const x=a[0],y=a[1];ctx.save();ctx.translate(x,y);ctx.rotate(-.06);
    if(n===1){glossy(ctx,-16,-10,58,52,COLORS.yellow);glossy(ctx,-16,-12,22,54,COLORS.red);glossy(ctx,10,-12,23,54,COLORS.red);shape(ctx,COLORS.green,[[9,-8],[4,-24],[17,-31],[20,-15]],'#528353',2)}
    if(n===2){ctx.strokeStyle='#d89d4d';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-12,34);ctx.lineTo(20,-52);ctx.stroke();shape(ctx,'#ffe069',[[20,-84],[32,-58],[63,-52],[40,-35],[44,-9],[18,-22],[-11,-7],[-4,-36],[-27,-52],[4,-58]],'#bd8d3b',3)}
    if(n===3){ctx.strokeStyle='#806c6c';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(2,42);ctx.lineTo(2,-75);ctx.stroke();shape(ctx,'#fcf7ee',[[5,-67],[75,-62],[5,-22]],'#946f7e',2);ctx.fillStyle=COLORS.red;ctx.fillRect(13,-61,60,9);ctx.fillStyle=COLORS.blue;ctx.fillRect(13,-61,20,24)}
    if(n===4){for(let k=0;k<5;k++){glossy(ctx,k*17-33,-47-(k%2)*16,25,25,[COLORS.pink,COLORS.yellow,COLORS.purple,COLORS.red,COLORS.blue][k]);ctx.strokeStyle=COLORS.green;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(k*17-20,-26);ctx.lineTo(5,42);ctx.stroke()}glossy(ctx,-10,23,32,24,COLORS.green)}
    if(n===5){glossy(ctx,-31,-64,70,50,COLORS.yellow);glossy(ctx,-12,-20,34,62,COLORS.yellow);glossy(ctx,-35,26,78,16,COLORS.yellow)}
    if(n===6){shape(ctx,'#fff3df',[[-44,-58],[73,-58],[73,18],[-44,18]],'#cc8b5c',5);ctx.font='bold 25px VAG';ctx.textAlign='center';ctx.fillStyle='#7b375e';ctx.fillText('TURKEY',15,-13)}
    if(n===7){for(let k=0;k<3;k++){let bx=-32+k*31,by=-55-(k%2)*12;glossy(ctx,bx,by,36,37,[COLORS.red,COLORS.blue,COLORS.yellow][k]);ctx.strokeStyle='#ead7f3';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx+18,by+37);ctx.lineTo(2,38);ctx.stroke()}}
    ctx.restore();
  }
  function anchors(index){
    // All fifteen are left-facing, prone in flight; per-form anchor corrections.
    const adjust=[
      [0,0,0,0],[5,-4,-4,4],[4,8,0,0],[-4,-1,0,0],[-9,4,12,-4],
      [2,-2,0,0],[5,-4,0,4],[-8,7,-10,1],[4,-5,0,5],[1,5,0,3],
      [-5,-8,0,-1],[-7,4,5,-5],[-3,5,0,4],[0,-5,2,6],[-2,7,-6,-2]
    ][Math.max(0,Math.min(14,index))];
    return {face:[277+adjust[0],159+adjust[1]],hat:[277+adjust[0],100+adjust[1]],body:[398+adjust[2],282+adjust[3]],feet:[513+adjust[2],315+adjust[3]],hands:[150+adjust[0],287+adjust[1]]};
  }
  function render(canvas,recipe){
    if(!canvas)return false;canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,W,H);
    if(!imageReady())return false;
    const r=recipe||state;const idx=Math.min(14,Math.max(0,Number(r.base)||0));
    // Five columns and three rows of 512px tiles; crop bottom tether area, keeping the flying balloon.
    ctx.drawImage(bodyImage,(idx%5)*512,Math.floor(idx/5)*512,512,466,55,8,555,400);
    const a=anchors(idx);
    // Child characters have simple modest base clothes before students choose costumes.
    if(idx>=7&&idx<=9){
      glossy(ctx,a.body[0]-66,a.body[1]-48,164,96,idx===7?'#eebdca':idx===8?'#83bde0':'#f4cc8e');
      glossy(ctx,a.body[0]+42,a.body[1]+17,112,48,'#648fb9');
    }
    drawClothes(ctx,Number(r.clothes)||0,a.body);
    drawShoes(ctx,Number(r.shoes)||0,a.feet);
    drawEyes(ctx,Number(r.eyes)||0,a.face);
    drawNose(ctx,Number(r.nose)||0,a.face);
    drawMouth(ctx,Number(r.mouth)||0,a.face);
    drawHat(ctx,Number(r.hat)||0,a.hat);
    drawProp(ctx,Number(r.prop)||0,a.hands);
    return true;
  }
  function compose(c){
    if(!c||!c.workshop)return null;
    const recipe={base:Math.max(0,Math.min(14,Number(c.baseId)-301)),...c.options};
    const signature=JSON.stringify(recipe);
    if(cache.has(signature))return cache.get(signature);
    if(!imageReady())return 'assets/custom/parade-bodies-15.webp';
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
    CATEGORIES.forEach(({id,name})=>{const b=document.createElement('button');b.type='button';b.className='workshop-tab'+(id===active?' chosen':'');b.textContent=name;b.onclick=()=>{active=id;categoryTabs();options()};root.appendChild(b)})
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
      if(window.state && window.state.pieces.length>=25)return;
      // Main game state is a global lexical binding created by app.js.
      if(typeof markChanged!=='function')return;
      if(window.paradeBuilderCount && window.paradeBuilderCount>=99)return;
      if(typeof maxReached==='function' && maxReached())return;
      const newId=1002+Math.max(-1,...window.paradeCustomIds());
      const name=String($('designName').value||'My Balloon').trim().replace(/[^A-Za-z0-9 -]/g,'').slice(0,26)||'My Balloon';
      const c={id:newId,name,baseId:301+state.base,workshop:true,options:{eyes:state.eyes,nose:state.nose,mouth:state.mouth,hat:state.hat,clothes:state.clothes,shoes:state.shoes,prop:state.prop}};
      window.paradeAddCustom(c);
    });
    $('workshopReset').addEventListener('click',()=>{
      Object.assign(state,{eyes:0,nose:0,mouth:0,hat:0,clothes:0,shoes:0,prop:0});categoryTabs();options();pickBase();draw()
    });
    if(imageReady()){pickBase();categoryTabs();options();draw()}
    else{pickBase();categoryTabs();options()}
  }
  window.PARADE_WORKSHOP={compose,draw,render,state,initialize:init,refresh(){pickBase();categoryTabs();options();draw()},get ready(){return ready}};
  // App-side callbacks keep the saved parade data in the existing cloud/local saving system.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();