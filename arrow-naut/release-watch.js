/* Classroom release watcher. Only compares a tiny public version marker.
 * Never clears localStorage/sessionStorage. Changes are reloaded at safe points.
 * Previously opened tabs without this script cannot be remotely refreshed.
 */
(() => {
  const build = document.querySelector('meta[name="classroom-build"]')?.content;
  const endpoint = new URL('release.json', document.currentScript.src);
  let refreshing = false;
  const check = async () => {
    if (refreshing || !build || document.visibilityState !== 'visible') return;
    try {
      const response = await fetch(endpoint.toString()+'?t='+Date.now(),{cache:'no-store'});
      if (!response.ok) return;
      const release = await response.json();
      if (release?.build !== build) {
        // Both games make verified synchronous progress writes during play.
        // An in-progress drag is not guaranteed safe: wait until released.
        if (document.querySelector('.resizing-with-trackpad,.m2-piece.dragging,.scene-decor[style*="grabbing"],.space-placed[style*="grabbing"]')) return;
        refreshing = true;
        window.location.reload();
      }
    } catch (_) { /* Never disrupt a class because a network check failed. */ }
  };
  setInterval(check,45000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
  window.addEventListener('focus',check);
})();
