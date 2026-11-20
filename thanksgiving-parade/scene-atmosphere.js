'use strict';

(() => {
  const folder = 'assets/scenes/';
  const scenes = Object.freeze([
    {id:'storybook', name:'Macy’s Flagship', badge:'MACY’S FLAGSHIP · 34TH STREET', art:'flagship-moving-crowd.webp', ratio:1927/816, street:9, movieHandlers:.925, movieFloats:.968, runs:[[0,.089,.738,.733],[.151,.831,.731,.699],[.867,1,.697,.687]], rail:[[0,.692],[.32,.682],[.7,.665],[1,.650]]},
    {id:'central-park', name:'Central Park West', badge:'CENTRAL PARK WEST · UPPER WEST SIDE', art:'original-central-park.webp', ratio:1800/763, street:13, movieHandlers:.846, movieFloats:.924, runs:[[0,.390,.677,.671],[.590,1,.665,.675]], rail:[[0,.656],[.39,.647],[.59,.645],[1,.650]]},
    {id:'columbus', name:'Columbus Circle', badge:'COLUMBUS CIRCLE · NEW YORK CITY', art:'original-columbus.webp', ratio:1800/763, street:12, movieHandlers:.879, movieFloats:.946, runs:[[.214,.543,.727,.727],[.657,1,.727,.727]], rail:[[0,.703],[1,.703]]},
    {id:'sixth-avenue', name:'Sixth Avenue', badge:'SIXTH AVENUE · MIDTOWN MANHATTAN', art:'original-sixth-avenue.webp', ratio:1800/763, street:11, movieHandlers:.852, movieFloats:.941, runs:[[0,.420,.720,.711],[.641,1,.715,.723]], rail:[[0,.686],[.42,.681],[.641,.681],[1,.688]]},
    {id:'herald-square', name:'Herald Square', badge:'HERALD SQUARE · 34TH STREET', art:'original-herald-square.webp', ratio:1800/763, street:10, movieHandlers:.904, movieFloats:.962, runs:[[0,.615,.784,.776],[.667,.874,.770,.715],[.938,1,.779,.785]], rail:[[0,.762],[.615,.749],[.667,.745],[.874,.69],[.938,.75],[1,.759]]},
    {id:'brownstone-row', name:'Brownstone Row', badge:'BROWNSTONE ROW · NEW YORK CITY', art:'brownstone-moving-crowd.webp', ratio:1902/827, street:10, movieHandlers:.902, movieFloats:.957, runs:[[0,.125,.586,.586],[.165,.925,.586,.586],[.957,1,.586,.586]], rail:[[0,.552],[1,.552]]}
  ].map(({ratio,art,...scene}) => Object.freeze({...scene, src:folder+art, movieAspect:ratio})));
  const palette = ['#ffac27','#e73144','#b34f88','#ffdb63','#45c5e5','#ff823d','#fff3b8'];
  function confetti() {
    const field=document.createElement('div');
    field.className='parade-ambient-confetti';
    for(let i=0;i<34;i++) {
      const path=document.createElement('span');
      path.className='parade-confetti-path'+(i%5===0?' parade-confetti-star':'');
      path.style.cssText='--x:'+((i*41+8)%100)+'%;--land:'+((i*23+16)%92)+'%;--phase:-'+((i*47)%69/10)+'s;--pace:'+(3.7+(i%7)*.43)+'s;--side:'+((i*13)%37-19)+'px;--paper:'+palette[i%palette.length];
      path.append(document.createElement('i'));
      field.append(path);
    }
    return field;
  }
  function crowd(scene) {
    const row=document.createElement('div');
    row.className='parade-crowd';
    let n=0;
    const alternates=[0,3,1,4,2,5,1,0,4,3,5,2];
    for (const [left,right,groundL,groundR] of scene.runs) {
      const groupWidth=.051;
      const count=Math.max(2,Math.ceil((right-left)/(groupWidth*.91)));
      for(let j=0;j<count;j++,n++){
        const group=document.createElement('span');
        const progress=j/(count-1);
        const x=left+(right-left-groupWidth)*progress;
        const y=groundL+(groundR-groundL)*progress;
        group.className='parade-spectator-group';
        group.style.cssText='--x:'+x*100+'%;--y:'+y*100+'%;--w:'+groupWidth*100+'%;--cell:'+alternates[n%alternates.length]+';--phase:-'+(n*47%111/43)+'s;--pace:'+(1.12+(n%5)*.13)+'s;--tilt:'+(n%2?4:-4)+'deg';
        const art=new Image();
        art.alt='';
        art.decoding='async';
        art.src=folder+'edition2-crowd.webp';
        group.append(art);
        row.append(group);
      }
    }
    return row;
  }
  function apply(root,scene) {
    if(!root||!scene||root.dataset.scene===scene.id)return;
    const rail=document.createElement('div');
    rail.className='parade-ambient-rail';
    rail.style.backgroundImage="url('"+scene.src+"')";
    rail.style.clipPath='polygon('+scene.rail.map(([x,y])=>x*100+'% '+y*100+'%').join(',')+',100% 100%,0 100%)';
    root.replaceChildren(crowd(scene),rail,confetti());
    root.dataset.scene=scene.id;
  }
  window.PARADE_SCENE_ATMOSPHERE=Object.freeze({scenes,apply});
})();
