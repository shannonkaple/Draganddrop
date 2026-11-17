'use strict';
/* Student music previews. This component is deliberately separate from parade playback. */
(() => {
  const TRACKS = [
    {name:'Balloons Over the Boulevard',src:'assets/music/balloons_over_the_boulevard-classroom-loop.ogg'},
    {name:'The Tinsel Cadence',src:'assets/music/the_tinsel_cadence-classroom-loop.ogg'},
    {name:'Fifty Yard Triumph',src:'assets/music/fifty_yard_triumph-classroom-loop.ogg'},
    {name:'Sunday Morning Strut',src:'assets/music/sunday_morning_strut-classroom-loop.ogg'}
  ];
  const root=document.getElementById('musicOptions');
  if(!root)return;
  const audio=document.createElement('audio');
  audio.id='musicPreviewAudio';
  audio.preload='none';
  audio.loop=false;
  audio.volume=.65;
  audio.setAttribute('aria-label','Parade soundtrack preview');
  document.body.append(audio);
  const status=document.createElement('div');
  status.id='musicPreviewStatus';
  status.className='music-preview-status';
  status.setAttribute('role','status');
  status.textContent='Press LISTEN to hear a song before choosing it.';
  root.after(status);
  let active=-1;
  let requestToken=0;
  function refresh(){
    document.querySelectorAll('.music-preview-btn').forEach(btn=>{
      const index=Number(btn.dataset.trackIndex);
      const isActive=active===index;
      btn.textContent=isActive?'■ STOP':'▶ LISTEN';
      btn.setAttribute('aria-pressed',String(isActive));
      btn.setAttribute('aria-label',(isActive?'Stop preview: ':'Preview: ')+(TRACKS[index]?.name||'song'));
    });
  }
  function stopPreview(clearStatus=true){
    requestToken++;
    audio.pause();
    try{audio.currentTime=0}catch{}
    active=-1;
    if(clearStatus)status.textContent='Press LISTEN to hear a song before choosing it.';
    refresh();
  }
  function setError(message){
    stopPreview(false);
    status.textContent=message;
  }
  async function preview(index){
    if(index===active){stopPreview();return}
    const track=TRACKS[index];
    if(!track)return;
    stopPreview(false);
    active=index;
    const token=++requestToken;
    // Begin in the click's user gesture, so school Chromebooks permit sound.
    // Once the complete recording is ready, switch without restarting it.
    const cached=window.PARADE_FULL_MUSIC?.peek(track.src);
    audio.src=cached||track.src;
    audio.loop=false;
    audio.load();
    status.textContent=cached?'Starting '+track.name+'…':'Starting '+track.name+' while the full song loads…';
    refresh();
    try{
      await audio.play();
      if(token!==requestToken)return;
      if(!cached){
        const full=await window.PARADE_FULL_MUSIC.load(track.src);
        if(token!==requestToken)return;
        const seconds=Number.isFinite(audio.currentTime)?audio.currentTime:0;
        audio.src=full;
        audio.loop=false;
        audio.addEventListener('loadedmetadata',()=>{
          if(token===requestToken&&Number.isFinite(audio.duration))
            audio.currentTime=Math.min(seconds,Math.max(0,audio.duration-.1));
        },{once:true});
        await audio.play();
        if(token!==requestToken)return;
      }
      status.textContent='Now playing the full song: '+track.name+'. Press STOP to finish.';
    }catch(error){
      if(token!==requestToken)return;
      if(error?.name==='AbortError')return;
      setError('Could not play '+track.name+'. Check this Chromebook’s sound settings.');
    }
  }
  audio.addEventListener('ended',()=>stopPreview());
  audio.addEventListener('error',()=>{
    if(active>=0)setError('This music file could not load. Please try another song.');
  });
  function buildButtons(){
    const choices=Array.from(root.querySelectorAll('button.music-option'));
    choices.forEach((select,index)=>{
      const track=TRACKS[index];
      if(!track || select.closest('.music-choice'))return;
      const card=document.createElement('div');
      card.className='music-choice';
      select.before(card);
      card.append(select);
      const listen=document.createElement('button');
      listen.type='button';
      listen.className='music-preview-btn';
      listen.dataset.trackIndex=String(index);
      listen.addEventListener('click',ev=>{ev.stopPropagation();preview(index)});
      // Selecting a song should NOT start a sample automatically.
      select.addEventListener('click',()=>{if(active>=0)stopPreview()},{capture:true});
      card.append(listen);
    });
    refresh();
  }
  const observer=new MutationObserver(buildButtons);
  observer.observe(root,{childList:true,subtree:false});
  buildButtons();
  // A parade always owns the soundtrack: never let the sample overlap the movie.
  document.addEventListener('click',event=>{
    if(event.target.closest('#playBtn,#homeBtn,#changeStudentBtn,#closeMovieBtn') ||
       (event.target.closest('.step') && event.target.closest('.step').dataset.tab!=='bands')) {
      if(active>=0)stopPreview();
    }
  },true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active>=0)stopPreview()});
  const cinema=document.getElementById('cinema');
  if(cinema)new MutationObserver(()=>{
    if(!cinema.classList.contains('hidden')&&active>=0)stopPreview();
  }).observe(cinema,{attributes:true,attributeFilter:['class']});
  window.PARADE_STOP_MUSIC_PREVIEW=()=>stopPreview();
})();
