(() => {
  'use strict';
  const art = {
    duck:['doodle-duck','Duck balloon','balloon'], bunny:['clover-bunny','Bunny balloon','balloon'],
    dino:['pickle-triceratops','Dinosaur balloon','balloon'], unicorn:['comet-unicorn','Unicorn balloon','balloon'],
    penguin:['poppy-penguin','Penguin balloon','balloon'], drummer:['blue-drum','Drummer','marcher'],
    rocket:['parade-float-40','Rocket float','float'], harvest:['parade-float-42','Harvest float','float'],
    peanut:['parade-float-50','Peanut float','float'],
    giraffe:['cinnamon-giraffe','Giraffe balloon','balloon'], robot:['orbit-robot','Robot balloon','balloon'],
    dragon:['purple-dragon','Dragon balloon','balloon'], dog:['waffle-corgi','Dog balloon','balloon']
  };
  const levels=[4,5,5,6,6,7,7,8,8,9], source=path=>window.portableArt?.[path]||path;
  function el(tag, css, text){const x=document.createElement(tag);if(css)x.className=css;if(text!==undefined)x.textContent=text;return x}
  function button(label, action, css='primary'){const x=el('button',css,label);x.type='button';x.onclick=action;return x}
  function shuffle(values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function image(path,alt='',css=''){const img=el('img',css);img.alt=alt;img.draggable=false;img.src=source(path);return img}
  function star(key, css='order-art'){return image('art-b/'+art[key][0]+'.webp', '', css)}
  function mount(root){
    let level=0, line=[], bank=[], guess=[], state='ready', paused=false, stepMode=false, narrate=false;
    let i=0, duration=2700, frame=0, elapsed=0, last=null, disposed=false, sprite=null;
    let cue, screen, speech, stage, prompt, tools, choices, slots, check, undo, clear, outcome, pauseButton;
    const cleanupFrame=()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=null};
    const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
    function round(){
      const deck=shuffle(Object.keys(art));line=deck.slice(0,levels[level]);bank=shuffle(deck.slice(0,levels[level]+2));
      guess=[];state='ready';draw();
    }
    function readStar(){
      if(!narrate||!window.speechSynthesis||!line[i])return;
      const u=new SpeechSynthesisUtterance(art[line[i]][1]);u.rate=.87;u.lang='en-US';
      speechSynthesis.cancel();speechSynthesis.speak(u);
    }
    function togglePause(){
      if(state!=='watch'||stepMode)return;
      paused=!paused;if(pauseButton)pauseButton.textContent=paused?'Keep watching':'Pause';
      if(paused)cleanupFrame();else frame=requestAnimationFrame(animate);
    }
    function buildTV(){
      const box=el('div','order-tv-zone'), tv=el('div','order-tv');
      screen=el('div','order-screen');screen.append(image('art-tv/street.webp','','order-street'));
      stage=el('div','order-stage');stage.setAttribute('aria-hidden','true');
      const transport=el('div','order-tv-transport');
      const play=button('TV play',()=>{if(state==='ready')start(reduced());else if(paused)togglePause()},'order-tv-hit');
      const pause=button('TV pause',()=>{if(!paused)togglePause()},'order-tv-hit');
      pause.disabled=state==='ready'||stepMode;
      const again=button('TV restart',()=>start(state==='watch'?stepMode:reduced()),'order-tv-hit');
      const sound=button('Read star names',()=>{narrate=!narrate;sound.setAttribute('aria-pressed',narrate);if(narrate&&state==='watch')readStar();else window.speechSynthesis?.cancel()},'order-tv-hit');
      sound.disabled=!window.speechSynthesis;sound.setAttribute('aria-pressed',narrate);
      transport.append(play,pause,again,sound);
      tv.append(screen, image('art-tv/cinema-tv-shell.png','','order-set'),transport);screen.append(stage);
      cue=el('div','order-tv-cue');screen.append(cue);box.append(tv);return box;
    }
    function draw(){
      prompt=el('h3','game-direction order-direction',state==='ready'?'Watch the parade. Remember who goes by first, next, and last.':state==='solve'?'Tap the pictures in the order they went by.':state==='correct'?'You remembered the whole parade!':'You’re a parade director!');
      prompt.tabIndex=-1;
      const wrap=el('section','order-game'), badge=el('p','order-round',state==='done'?'Parade complete':'Parade '+(level+1)+' of '+levels.length+' · '+line.length+' stars');
      speech=el('p','order-sr');speech.setAttribute('role','status');
      wrap.append(badge,prompt,speech);
      tools=el('div','order-controls');
      if(state==='ready'){
        wrap.append(buildTV(),tools);
        cue.textContent='Ready to watch?';
        tools.append(button('Watch parade',()=>start(reduced())),button('One at a time',()=>start(true),'primary order-alt'));
      }else if(state==='solve'||state==='correct'){
        outcome=el('p','order-feedback',state==='solve'?'Start with the first star.':'🎈 You earned a balloon! Every star is in the right spot.');
        outcome.setAttribute('role','status');slots=el('ol','order-slots');slots.setAttribute('aria-label','Your parade order');slots.style.setProperty('--slot-count',line.length);
        choices=el('div','order-choices');choices.setAttribute('aria-label','Pick a parade star');
        wrap.append(slots);
        if(state==='solve'){
          undo=button('Undo last',()=>{const k=guess.pop();update('Keep going!',k)},'primary order-alt');
          clear=button('Clear',()=>{guess=[];update('Try a new order.','bank')},'primary order-alt');
          check=button('Check my order',verify);
          tools.append(check,undo,clear,button('Watch again',()=>start(stepMode),'primary order-alt'));
          wrap.append(choices);
        }else{
          tools.append(button(level<levels.length-1?'Next parade':'Finish',()=>{level++;if(level===levels.length){state='done';draw()}else round();prompt.focus() }));
        }
        wrap.append(outcome,tools);
        update();
      }else if(state==='done'){
        wrap.append(el('p','order-finish','You put all ten parades in order!'),tools);
        tools.append(button('Play again',()=>{level=0;round();prompt.focus()}));
      }
      root.replaceChildren(wrap);
    }
    function update(message, focus){
      if(message)outcome.textContent=message;
      slots.replaceChildren(...line.map((_,j)=>{
        const k=guess[j], slot=el('li','order-slot');
        slot.append(el('span','order-position',j+1));
        if(k){slot.append(star(k));slot.setAttribute('aria-label',(j+1)+': '+art[k][1])}
        else{slot.append(el('span','order-blank','?'));slot.setAttribute('aria-label',(j+1)+': Empty')}
        return slot;
      }));
      if(state!=='solve')return;
      for(const k of bank){
        if(choices.querySelector('[data-star="'+k+'"]'))continue;
        const b=button('',()=>{if(guess.includes(k)||guess.length>=line.length)return;guess.push(k);update(guess.length===line.length?'Ready to check?':'Who went by next?',guess.length===line.length?'check':'bank')},'order-choice');
        b.dataset.star=k;b.append(star(k),el('span','',art[k][1]));choices.append(b);
      }
      for(const b of choices.children){b.disabled=guess.includes(b.dataset.star)||guess.length>=line.length;b.classList.toggle('order-picked',guess.includes(b.dataset.star))}
      undo.disabled=clear.disabled=!guess.length;check.disabled=guess.length!==line.length;
      if(focus==='check')check.focus({preventScroll:true});
      else if(focus==='bank')choices.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
      else if(focus)choices.querySelector('[data-star="'+focus+'"]')?.focus({preventScroll:true});
    }
    function verify(){
      if(guess.length!==line.length)return;
      const hits=guess.filter((k,j)=>k===line[j]).length;
      if(hits===line.length){state='correct';window.paradeReward?.('parade-order');draw();tools.firstElementChild.focus({preventScroll:true});return}
      outcome.textContent=hits===0?'None in the right spot yet. Try again or watch the parade.':hits+' of '+line.length+' in the right spots. Try again or watch the parade.';
    }
    function place(){
      const k=line[i];stage.replaceChildren();sprite=el('div','order-sprite order-'+art[k][2]);
      sprite.append(star(k,'order-sprite-art'));stage.append(sprite);
      speech.textContent=art[k][1];readStar();
      if(stepMode)sprite.style.left='50%';
    }
    function animate(t){
      frame=0;if(disposed||paused||state!=='watch'||stepMode)return;
      if(last!==null)elapsed+=Math.min(80,t-last);last=t;
      while(elapsed>=duration){
        elapsed-=duration;i++;
        if(i>=line.length){finishWatch();return}
        place();
      }
      const progress=elapsed/duration;
      sprite.style.left=(122-144*progress)+'%';
      sprite.style.setProperty('--bob',(art[line[i]][2]==='balloon'?Math.sin(progress*9)*3:Math.sin(progress*30)*.8)+'%');
      frame=requestAnimationFrame(animate);
    }
    function finishWatch(){
      cleanupFrame();state='solve';draw();prompt.focus({preventScroll:true});
    }
    function start(manual){
      cleanupFrame();guess=[];stepMode=manual;state='watch';paused=false;i=0;elapsed=0;duration=Math.max(2150,2780-level*95);
      const wrap=el('section','order-game'), badge=el('p','order-round','Parade '+(level+1)+' of '+levels.length+' · '+line.length+' stars');
      prompt=el('h3','game-direction order-direction','Watch closely. Remember the order!');prompt.tabIndex=-1;
      speech=el('p','order-sr');speech.setAttribute('role','status');speech.setAttribute('aria-live','polite');
      tools=el('div','order-controls');wrap.append(badge,prompt,speech,buildTV(),tools);
      cue.hidden=true;
      if(manual){
        const next=button('Next star',()=>{i++;if(i===line.length){finishWatch();return}place();next.textContent=i===line.length-1?'Build my order':'Next star'});
        tools.append(next,button('Start over',()=>start(true),'primary order-alt'));
      }else{
        pauseButton=button('Pause',togglePause);
        tools.append(pauseButton,button('Start over',()=>start(false),'primary order-alt'),button('One at a time',()=>start(true),'primary order-alt'));
      }
      root.replaceChildren(wrap);place();
      if(!manual){sprite.style.left='122%';frame=requestAnimationFrame(animate)}
      tools.firstElementChild.focus({preventScroll:true});
    }
    round();
    return ()=>{disposed=true;cleanupFrame();if(narrate)window.speechSynthesis?.cancel();root.replaceChildren()};
  }
  window.arcadeOrder=[{id:'parade-order',title:'Parade Order',icon:'📺',blurb:'Watch the TV parade. Rebuild the order from memory.',mount}];
})();
