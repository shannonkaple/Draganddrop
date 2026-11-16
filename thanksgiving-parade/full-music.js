'use strict';
// Full original soundtrack recordings are stored in 15 contiguous pieces each.
// Assemble them only when chosen. Cache the playable MP3 so the same recording
// is reused by LISTEN and by the actual parade movie; short OGGs are fallbacks.
(() => {
 const songBase={
  'assets/music/balloons_over_the_boulevard-classroom-loop.ogg':'balloons_over_the_boulevard',
  'assets/music/the_tinsel_cadence-classroom-loop.ogg':'the_tinsel_cadence',
  'assets/music/fifty_yard_triumph-classroom-loop.ogg':'fifty_yard_triumph',
  'assets/music/sunday_morning_strut-classroom-loop.ogg':'sunday_morning_strut'
 };
 const active=new Map(),ready=new Map();
 async function load(source){
  const base=songBase[source];
  if(!base)return source;
  if(ready.has(source))return ready.get(source);
  if(active.has(source))return active.get(source);
  const task=(async()=>{
   const urls=Array.from({length:15},(_,i)=>
    'assets/music/'+base+'.part-'+String(i+1).padStart(2,'0')+'.bin'
   );
   // Concurrent requests fetch the full student-provided recordings, not 30-second excerpts.
   const requests=urls.map(url=>fetch(url,{cache:'force-cache'}).then(async response=>{
    if(!response.ok)throw new Error('Could not load music part: '+url);
    return response.arrayBuffer();
   }));
   const segments=await Promise.all(requests);
   const blob=new Blob(segments,{type:'audio/mpeg'});
   if(blob.size<1000000)throw new Error('Full music file incomplete');
   const url=URL.createObjectURL(blob);
   ready.set(source,url);
   return url;
  })();
  active.set(source,task);
  try{return await task}finally{active.delete(source)}
 }
 function peek(source){return ready.get(source)||null}
 window.PARADE_FULL_MUSIC={load,peek};
})();