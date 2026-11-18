'use strict';
/* Use the actual visible browser viewport, not an assumed Chromebook model.
 * At smaller dimensions the studio is scaled as a single composition instead
 * of pushing controls offscreen or creating nested horizontal scrollbars.
 * The left/right arrows in app.js change pages; there is no gallery scrolling.
 */
(function () {
  const TARGET_WIDTH = 1120;
  const TARGET_HEIGHT = 640;
  let raf = 0;
  function fitStudio() {
    const viewport = window.visualViewport;
    const width = Math.max(1, Math.min(window.innerWidth, viewport?.width || window.innerWidth));
    const height = Math.max(1, Math.min(window.innerHeight, viewport?.height || window.innerHeight));
    const scale = Math.max(0.3, Math.min(1, width / TARGET_WIDTH, height / TARGET_HEIGHT));
    document.documentElement.style.setProperty('--studio-scale', scale.toFixed(5));
    document.documentElement.dataset.paradeViewport = Math.round(width) + 'x' + Math.round(height);
    window.dispatchEvent(new Event('parade:viewport-fit'));

  }
  function scheduleFit() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fitStudio);
  }
  window.addEventListener('resize', scheduleFit, {passive:true});
  window.addEventListener('orientationchange', scheduleFit, {passive:true});
  window.addEventListener('fullscreenchange', scheduleFit);
  window.visualViewport?.addEventListener('resize', scheduleFit, {passive:true});
  fitStudio();
})();
