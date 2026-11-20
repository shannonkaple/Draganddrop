'use strict';

// Ambient art is independent of the student's lineup and is never saved as a piece.
// The older scene IDs are unchanged, including "storybook" for the flagship route.
(() => {
  const folder = 'assets/scenes/';
  const scenes = Object.freeze([
    {id:'storybook', name:'Macy’s Flagship', badge:'MACY’S FLAGSHIP · 34TH STREET', art:'flagship', street:9, movieHandlers:.925, movieFloats:.968, crowd:[70,68]},
    {id:'central-park', name:'Central Park West', badge:'CENTRAL PARK WEST · UPPER WEST SIDE', art:'park', street:13, movieHandlers:.846, movieFloats:.924, crowd:[67,65]},
    {id:'columbus', name:'Columbus Circle', badge:'COLUMBUS CIRCLE · NEW YORK CITY', art:'circle', street:12, movieHandlers:.879, movieFloats:.946, crowd:[68,66]},
    {id:'sixth-avenue', name:'Sixth Avenue', badge:'SIXTH AVENUE · MIDTOWN MANHATTAN', art:'sixth', street:11, movieHandlers:.852, movieFloats:.941, crowd:[69,67]},
    {id:'herald-square', name:'Herald Square', badge:'HERALD SQUARE · 34TH STREET', art:'herald', street:10, movieHandlers:.904, movieFloats:.962, crowd:[70,68]},
    {id:'brownstone-row', name:'Brownstone Row', badge:'BROWNSTONE ROW · NEW YORK CITY', art:'brownstone', street:10, movieHandlers:.902, movieFloats:.957, crowd:[69,67]}
  ].map(scene => Object.freeze({...scene, src:folder+'edition2-'+scene.art+'.webp'})));
  const palette = ['#f8b03a','#ee655d','#d3619c','#fceb75','#78d5e6','#f48346','#fff1cd'];
  function sprite(parent, kind, cell, cells, left, width, phase) {
    const person = document.createElement('span');
    person.className = 'parade-ambient-sprite parade-ambient-'+kind;
    person.style.cssText = '--x:'+left+'%;--w:'+width+'%;--cell:'+cell+';--cells:'+cells+';--phase:'+phase+'s';
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.addEventListener('error', () => person.remove(), {once:true});
    img.src = folder + 'edition2-' + (kind === 'crowd' ? 'crowd' : 'clowns') + '.webp';
    person.append(img);
    parent.append(person);
  }
  function build(root) {
    const fragment = document.createDocumentFragment();
    const confetti = document.createElement('div');
    confetti.className = 'parade-ambient-confetti';
    for (let i = 0; i < 24; i++) {
      const path = document.createElement('span');
      path.className = 'parade-confetti-path';
      path.style.cssText = '--x:'+((i*41+8)%100)+'%;--land:'+((i*23+16)%94)+'%;--phase:-'+((i*17)%73/10)+'s;--pace:'+(5.8+(i%7)*.48)+'s;--side:'+((i*7)%21-10)+'px;--paper:'+palette[i%palette.length];
      path.append(document.createElement('i'));
      confetti.append(path);
    }
    fragment.append(confetti);
    [1,9,22,72,84,93].forEach((x,i) => sprite(fragment,'crowd',i,6,x,i%3===0?7.2:8.1,-.41*i));
    [[16,0],[30,1],[74,2]].forEach(([x,i]) => sprite(fragment,'clown',i,3,x,6.5,-.7*i));
    root.replaceChildren(fragment);
  }
  function apply(root, scene) {
    if (!root || !scene || root.dataset.scene === scene.id) return;
    if (!root.hasChildNodes()) build(root);
    root.dataset.scene = scene.id;
    root.style.setProperty('--crowd-ground',scene.crowd[root.id === 'movieAtmosphere' ? 1 : 0]+'%');
  }
  window.PARADE_SCENE_ATMOSPHERE = Object.freeze({ scenes, apply });
})();
