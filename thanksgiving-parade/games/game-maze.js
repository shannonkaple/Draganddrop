(() => {
  'use strict';
  const maps = [
    {name:'Central Park', theme:'park', goal:'the park gate', rows:[
      '###########','S...#.....#','###.#.#####','#...#.....#','#.###.###.#',
      '#...#...#.#','###.#####.#','#.........F','###########'
    ]},
    {name:'Midtown Streets', theme:'midtown', goal:'the city checkpoint', rows:[
      '#############','S.....#.....#','#####.###.###','#...#...#...#','###.###.###.#',
      '#...#...#...#','#.#.#.###.#.#','#.#.#.#...#.#','#.###.#.###.#','#.......#...F','#############'
    ]},
    {name:'Herald Square', theme:'herald', goal:'the finish at Herald Square', rows:[
      '###############','S.....#.......#','#####.#.#####.#','#.....#.....#.#','#.#####.###.###',
      '#.#...#.#.#...#','#.#.#.#.#.###.#','#.#.#.......#.#','#.###########.#',
      '#...#...#.....#','###.#.#.#.###.#','#.....#...#...F','###############'
    ]}
  ];
  const directions = {
    up:[0,-1,'↑'],left:[-1,0,'←'],down:[0,1,'↓'],right:[1,0,'→']
  };
  const topologyOrder=[['up','n'],['right','e'],['down','s'],['left','w']];
  const earned = new Set();
  const prizeKey='kaple-parade-maze-earned-v1';
  function readEarned() {
    try {
      const saved=JSON.parse(localStorage.getItem(prizeKey)||'[]');
      if(Array.isArray(saved)) for(const n of saved) if(Number.isInteger(n)&&n>=0&&n<maps.length) earned.add(n);
    } catch {}
  }
  function openStreet(rows,x,y) {
    const tile=rows[y]?.[x];
    return tile!==undefined&&tile!=='#';
  }
  function el(tag,cls,text) {
    const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;
  }
  function button(label, fn, cls='arc-btn') {
    const n=el('button',cls,label);n.type='button';n.addEventListener('click',fn);return n;
  }
  window.mountParadeMaze = (root,onBack) => {
    readEarned();
    let completed=0;
    while(completed<maps.length&&earned.has(completed))completed++;
    let stage=0, maxStage=Math.min(completed,maps.length-1), x=0, y=0, solved=false,
        disposed=false, visited=new Set(), cells=[], facing='right', heading='right';
    const car=el('img','route-car');
    car.alt='';car.draggable=false;
    car.src=window.portableArt?.['brand/maze-car.webp']||'brand/maze-car.webp';
    let board, status, title, next, nav, reset, buttons;
    const wrap=el('section','route-game');
    wrap.setAttribute('aria-label','Parade Route Maze');
    const controls=el('div','route-top');
    title=el('h3','route-title','Parade Route Maze');title.tabIndex=-1;
    controls.append(title,button('Back to games',()=>{if(disposed)return;cleanup();onBack?.()},'arc-btn alt'));
    const text=el('p','game-direction route-directions','Drive the parade car to the finish. Use the arrows or tap the next street square. You can go back if you get stuck.');
    nav=el('div','route-tabs');nav.setAttribute('aria-label','Maze stages');
    const layout=el('div','route-layout');
    board=el('div','route-board');board.tabIndex=0;
    board.setAttribute('role','group');board.setAttribute('aria-label','Street map; use arrow keys to drive');
    const aside=el('div','route-controls');
    const legend=el('div','route-legend');
    legend.append(el('span','route-example start','Start'),el('span','route-example road','Open street'),el('span','route-example wall','Blocked block'),el('span','route-example goal','Finish'));
    buttons=el('div','route-arrows');buttons.setAttribute('role','group');buttons.setAttribute('aria-label','Drive the parade car');
    Object.keys(directions).forEach(dir=>{
      const b=button(directions[dir][2],()=>move(dir),'route-arrow');
      b.dataset.dir=dir;b.setAttribute('aria-label','Move '+dir);buttons.append(b);
    });
    status=el('p','route-feedback');status.setAttribute('role','status');status.setAttribute('aria-atomic','true');
    reset=button('Start map over',()=>draw(stage,true),'arc-btn alt');
    next=button('Next map',()=>{if(stage!==maps.length-1){draw(stage+1);board.focus({preventScroll:true})}else {draw(0);board.focus({preventScroll:true})}});
    const actions=el('div','route-actions');actions.append(reset,next);
    aside.append(legend,buttons,status,actions);
    layout.append(board,aside);wrap.append(controls,text,nav,layout);root.replaceChildren(wrap);
    function cleanup(){
      if(disposed)return;disposed=true;
      document.removeEventListener('keydown',keyDown);
      if(wrap.parentNode===root)wrap.remove();
    }
    function keyDown(e){
      if(disposed||!wrap.isConnected||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||
         e.target?.closest?.('input,textarea,select,[contenteditable]'))return;
      const dir=e.key.slice(5).toLowerCase();
      if(e.key.startsWith('Arrow')&&directions[dir]&&!solved&&(e.target===document.body||wrap.contains(e.target))){
        e.preventDefault();move(dir);
      }
    }
    function draw(n,restarting=false) {
      if(disposed)return;
      stage=n;solved=false;visited=new Set();cells=[];facing=heading='right';
      const map=maps[stage], width=map.rows[0].length;
      board.className='route-board route-'+map.theme;
      wrap.dataset.theme=map.theme;
      board.style.setProperty('--columns',width);
      board.setAttribute('aria-label',map.name+' street map. Use arrow keys to drive.');
      const bits=document.createDocumentFragment();
      map.rows.forEach((row,j)=>{
        cells[j]=[];
        Array.from(row).forEach((value,i)=>{
          const c=el('div','route-square '+(value==='#'?'route-wall':'route-road'));
          c.setAttribute('aria-hidden','true');c.dataset.x=i;c.dataset.y=j;
          if(value==='#'){
            c.dataset.block=(Math.floor(i/2)*2+Math.floor(j/2)+stage)%3;
            if(i===0||j===0||i===width-1||j===map.rows.length-1)c.classList.add('route-frame');
          }else{
            const open=topologyOrder.filter(([dir])=>{
              const [dx,dy]=directions[dir];
              return openStreet(map.rows,i+dx,j+dy);
            });
            c.dataset.road=open.map(([,letter])=>letter).join('');
            for(const [dir] of open)c.classList.add('route-open-'+dir);
          }
          if(value==='S'){x=i;y=j;visited.add(i+','+j);c.classList.add('route-start');c.append(el('span','route-pin','START'))}
          if(value==='F'){c.classList.add('route-flag');c.append(el('span','route-pin','FINISH'))}
          bits.append(c);cells[j][i]=c;
        });
      });
      board.replaceChildren(bits);
      nav.replaceChildren(...maps.map((part,i)=>{
        const tab=button((i+1)+'. '+part.name,()=>{draw(i);board.focus({preventScroll:true})},'route-tab');
        tab.disabled=i>maxStage;
        if(i===n)tab.setAttribute('aria-current','step');
        if(earned.has(i))tab.classList.add('route-already');
        return tab;
      }));
      next.hidden=true;reset.disabled=false;
      for(const b of buttons.children)b.disabled=false;
      paint();
      status.textContent=(restarting?'Back at the start. ':'')+'Start at the car. Follow the streets to '+map.goal+'.';
    }
    function paint(){
      if(car.parentNode)car.remove();
      for(const row of cells) for(const c of row){
        const selected=+c.dataset.x===x&&+c.dataset.y===y;
        c.classList.toggle('route-visited',visited.has(c.dataset.x+','+c.dataset.y));
        c.classList.toggle('route-current',selected);
      }
      car.dataset.dir=heading;
      car.dataset.facing=facing;
      cells[y][x].append(car);
    }
    function move(dir) {
      if(disposed||solved||!directions[dir])return;
      const [dx,dy]=directions[dir],map=maps[stage], nx=x+dx,ny=y+dy;
      const cell=map.rows[ny]?.[nx];
      if(!cell||cell==='#'){status.textContent='That street is blocked. Try another arrow.';return}
      x=nx;y=ny;heading=dir;
      if(dir==='left'||dir==='right')facing=dir;
      visited.add(x+','+y);paint();
      if(cell!=='F'){
        const options=Object.entries(directions).flatMap(([k,[ox,oy]])=>{
          const tile=map.rows[y+oy]?.[x+ox];return tile&&tile!=='#'?[k]:[];
        });
        const ways=options.length===2?options.join(' or '):options.length>2?options.slice(0,-1).join(', ')+', or '+options.at(-1):options[0];
        status.textContent=(options.length===1?'Dead end. Go back. ':'Open streets: '+ways+'. ')+
          'Car: row '+(y+1)+', column '+(x+1)+'.';return;
      }
      solved=true;maxStage=Math.max(maxStage,Math.min(stage+1,maps.length-1));
      for(const b of buttons.children)b.disabled=true;
      readEarned();
      const wonNow=!earned.has(stage);
      if(wonNow){
        earned.add(stage);
        try{localStorage.setItem(prizeKey,JSON.stringify([...earned]))}catch{}
        window.paradeReward?.('nyc-maze');
      }
      const tabs=nav.children;tabs[stage]?.classList.add('route-already');if(tabs[stage+1])tabs[stage+1].disabled=false;
      status.textContent=(stage===maps.length-1?'You reached Herald Square!':'You reached the finish!')+
        (wonNow?' You earned a balloon!':'');
      next.textContent=stage===maps.length-1?'Play the maps again':'Next map: '+maps[stage+1].name;
      next.hidden=false;next.focus({preventScroll:true});
    }
    board.addEventListener('click',e=>{
      if(solved)return;
      const c=e.target.closest('.route-square');
      if(!c||!board.contains(c))return;
      const dx=+c.dataset.x-x,dy=+c.dataset.y-y;
      if(dx===0&&dy===0)return;
      const dir=Object.keys(directions).find(k=>directions[k][0]===dx&&directions[k][1]===dy);
      if(dir)move(dir);else status.textContent='Move one square. Tap next to the car or use an arrow.';
    });
    document.addEventListener('keydown',keyDown);
    draw(completed<maps.length?completed:0);
    return cleanup;
  };
})();
