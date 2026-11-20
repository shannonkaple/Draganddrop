'use strict';

(() => {
  const el = id => document.getElementById(id);
  const cinema = el('cinema');
  const view = el('movieScene');
  const backdrop = el('movieBackground');
  const canvas = el('movieStage');
  const context = canvas.getContext('2d');
  const audio = el('paradeAudio');
  audio.volume = .62;
  const pause = el('pauseBtn');
  const resume = el('playMovieBtn');
  const sound = el('soundBtn');
  const fullscreen = el('fullscreenBtn');
  const endCard = el('movieCelebration');
  const INTERVAL = 4.8;
  const TRAVEL_TIME = 10.8;
  const SPEED = .115;
  const ART_LOAD_LIMIT = 6000;
  const CREW = [
    { path: 'assets/handlers/cranberry.webp', hand: [.055, .146] },
    { path: 'assets/handlers/teal.webp', hand: [.058, .147] },
    { path: 'assets/handlers/gold.webp', hand: [.062, .146] },
    { path: 'assets/handlers/lavender.webp', hand: [.052, .144] }
  ];

  const pictures = new Map();
  const measurement = document.createElement('canvas');
  const measure = measurement.getContext('2d', { willReadFrequently: true });
  const visualStatus = document.createElement('p');
  visualStatus.className = 'movie-visual-status';
  visualStatus.hidden = true;
  visualStatus.setAttribute('aria-hidden', 'true');
  view.append(visualStatus);
  let playing = null;
  let frame;
  let muted = false;
  let lastImage = '';
  let lastTrack = '';
  let bounds = { width: 0, height: 0, visibleWidth: 0, visibleLeft: 0 };

  function picture(src) {
    if (!pictures.has(src)) {
      const image = new Image();
      const entry = { image, ready: false, failed: false };
      entry.loaded = new Promise(resolve => { entry.resolve = resolve; });
      pictures.set(src, entry);
      let settled = false;
      function finish(ok) {
        if (settled) return;
        settled = true;
        clearTimeout(deadline);
        entry.ready = ok;
        entry.failed = !ok;
        if (ok) {
          // A measurement failure must not block an otherwise usable image.
          entry.crop = [0, 0, image.naturalWidth, image.naturalHeight];
          entry.tetherY = [.87, .96, .96, .87];
          try { measurePicture(entry); }
          catch (error) { console.warn('Parade artwork could not be measured:', error); }
        }
        entry.resolve();
        if (ok && playing?.paused) paint();
      }
      const deadline = setTimeout(() => finish(false), ART_LOAD_LIMIT);
      image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0);
      image.onerror = () => finish(false);
      if (src) image.src = src;
      else finish(false);
    }
    return pictures.get(src);
  }

  function measurePicture(entry) {
    const { image } = entry;
    const scale = Math.min(1, 210 / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    measurement.width = width;
    measurement.height = height;
    measure.drawImage(image, 0, 0, width, height);
    let pixels;
    try { pixels = measure.getImageData(0, 0, width, height).data; }
    catch {
      entry.crop = [0, 0, image.naturalWidth, image.naturalHeight];
      entry.tetherY = [.87, .96, .96, .87];
      return;
    }
    const opaque = (x, y) => pixels[(y * width + x) * 4 + 3] > 104;
    let left = width - 1;
    let right = 0;
    let top = height - 1;
    let bottom = 0;
    const lastOpaque = new Array(width).fill(-1);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!opaque(x, y)) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
        lastOpaque[x] = y;
      }
    }
    if (right <= left || bottom <= top) {
      entry.crop = [0, 0, image.naturalWidth, image.naturalHeight];
      entry.tetherY = [.87, .96, .96, .87];
      return;
    }
    left = Math.max(0, left - 1);
    top = Math.max(0, top - 1);
    right = Math.min(width, right + 2);
    bottom = Math.min(height, bottom + 2);
    entry.crop = [
      left / width * image.naturalWidth, top / height * image.naturalHeight,
      (right - left) / width * image.naturalWidth, (bottom - top) / height * image.naturalHeight
    ];
    entry.tetherY = [.22, .40, .60, .78].map(x => {
      const y = lastOpaque[Math.min(width - 1, Math.round(left + x * (right - left)))];
      return y < top ? .78 : Math.max(.29, (y - top - 2) / (bottom - top));
    });
  }

  function resize() {
    if (!playing) return;
    const visibleWidth = view.clientWidth;
    const visibleHeight = view.clientHeight;
    if (!visibleWidth || !visibleHeight) return;
    const currentBackground = new URL(playing.scene.src, document.baseURI).href;
    const hasBackground = backdrop.currentSrc === currentBackground && backdrop.naturalWidth && backdrop.naturalHeight;
    const ratio = hasBackground ? backdrop.naturalWidth / backdrop.naturalHeight : playing.scene.movieAspect || 1800 / 763;
    // Fit the entire illustrated scene into the TV instead of zooming past
    // its edges. The street, its spectators, and sprites share this size.
    const width = Math.min(visibleWidth, visibleHeight * ratio);
    const height = width / ratio;
    const scale = Math.min(2, devicePixelRatio || 1);
    bounds = { width, height, visibleWidth: width, visibleLeft: 0 };
    el('movieWorld').style.width = width + 'px';
    el('movieWorld').style.height = height + 'px';
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    context.setTransform(scale, 0, 0, scale, 0, 0);
    paint();
  }

  function groundShadow(x, y, width, height) {
    context.save();
    context.fillStyle = 'rgba(26,29,46,.20)';
    context.beginPath();
    context.ellipse(x, y + 1, width, height, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function sprite(entry, x, y, width, height) {
    context.drawImage(entry.image, ...entry.crop, x, y, width, height);
  }

  function drawFloat(entry, center, ground) {
    const { width: W, height: H } = bounds;
    const aspect = entry.crop[2] / entry.crop[3];
    const width = Math.min(.553 * W, H * .58 * aspect);
    const height = width / aspect;
    if (center + width / 2 < 0 || center - width / 2 > W) return;
    groundShadow(center, ground, width * .38, H * .012);
    context.save();
    sprite(entry, center - width / 2, ground - height, width, height);
    context.restore();
  }

  function drawCrew(entry, x, ground, width, height, step, split = .68) {
    const [sourceX, sourceY, sourceW, sourceH] = entry.crop;
    const upperHeight = height * split;
    const legHeight = height - upperHeight;
    const sourceLegHeight = sourceH * (1 - split);
    const seamY = ground - legHeight;
    context.drawImage(entry.image, sourceX, sourceY, sourceW, sourceH * split,
      x, ground - height, width, upperHeight);
    // Anchor both legs at the seam, then taper the reach down toward each foot.
    for (let leg = 0; leg < 2; leg++) {
      const phase = step + leg * Math.PI;
      const reach = Math.sin(phase) * width * .085;
      const lift = Math.max(0, Math.cos(phase)) * legHeight * .065;
      context.save();
      context.transform(1, 0, reach / legHeight, 1 - lift / legHeight,
        x + leg * width / 2, seamY);
      context.drawImage(entry.image, sourceX + leg * sourceW / 2, sourceY + sourceH * split,
        sourceW / 2, sourceLegHeight, 0, 0, width / 2, legHeight);
      context.restore();
    }
  }

  function drawBalloon(entry, center, ground, index, time) {
    const { width: W, height: H } = bounds;
    const aspect = entry.crop[2] / entry.crop[3];
    const height = Math.min(H * .49, W * .43 / aspect);
    const width = height * aspect;
    const x = center - width / 2;
    if (x > W + 24 || x + width < -24) return;
    const y = H * .095 + H * .014 * Math.sin(time * 1.85 + index * .87);
    const crewHeight = H * .145;
    const crew = [.10, .25, .42, .58, .75, .90].map((percent, person) => {
      const design = CREW[(index + person) % CREW.length];
      const asset = picture(design.path);
      if (!asset.ready) return null;
      const wide = crewHeight * asset.crop[2] / asset.crop[3];
      const px = x + percent * width - wide / 2;
      const py = ground + (person % 2 === 0 ? -.008 : .015) * H;
      return {
        asset, wide, x: px, y: py,
        gripX: px + wide * design.hand[0], gripY: py - crewHeight + crewHeight * design.hand[1]
      };
    });
    crew.forEach((person, i) => {
      if (!person) return;
      const tether = i * (entry.tetherY.length - 1) / (crew.length - 1);
      const before = Math.floor(tether);
      const after = Math.ceil(tether);
      const attachY = entry.tetherY[before] + (entry.tetherY[after] - entry.tetherY[before]) * (tether - before);
      const ropeX = x + (.22 + .56 * i / (crew.length - 1)) * width;
      const ropeY = y + attachY * height;
      context.beginPath();
      context.moveTo(ropeX, ropeY);
      context.quadraticCurveTo((ropeX + person.gripX) / 2 + H * .012, (ropeY + person.gripY) / 2 + H * .02, person.gripX, person.gripY);
      context.strokeStyle = 'rgba(255,250,210,.90)';
      context.lineWidth = Math.max(1.25, H * .0031);
      context.stroke();
      context.strokeStyle = 'rgba(86,56,48,.80)';
      context.lineWidth = Math.max(.65, H * .00145);
      context.stroke();
    });
    crew.forEach((person, i) => {
      if (!person) return;
      groundShadow(person.x + person.wide / 2, person.y, person.wide * .36, H * .004);
      drawCrew(person.asset, person.x, person.y, person.wide, crewHeight, time * 9.5 + i * 1.6);
    });
    sprite(entry, x, y, width, height);
  }

  function drawBand(members, center, ground, time) {
    if (!members.length) return;
    const { width: W, height: H } = bounds;
    const spacing = Math.min(W * .095, H * .23);
    // Draw the far rank first so the front rank naturally overlaps it.
    for (let rank = 0; rank < 3; rank++) {
      const height = H * (.215 + rank * .017);
      for (let file = 0; file < 4; file++) {
        const asset = members[(rank + file) % members.length];
        if (!asset.ready) continue;
        const width = height * asset.crop[2] / asset.crop[3];
        const x = center + (file - 1.5 + (rank - 1) * .25) * spacing;
        const y = ground + H * (-.049 + rank * .033);
        groundShadow(x, y, width * .32, H * .005);
        drawCrew(asset, x - width / 2, y, width, height,
          time * 9.5 + (file % 2) * Math.PI + rank * .25, .78);
      }
    }
  }

  function paint() {
    if (!playing) return;
    const { width: W, height: H, visibleWidth, visibleLeft } = bounds;
    if (!W || !H || !visibleWidth) return;
    context.clearRect(0, 0, W, H);
    const { elapsed, pieces, scene } = playing;
    const handlers = scene.movieHandlers ?? .88, floats = scene.movieFloats ?? .95;
    pieces.forEach((piece, i) => {
      if (piece.type !== 'band' && !piece.art.ready) return;
      const localTime = elapsed - i * INTERVAL;
      // Travel relative to what the TV actually shows, not the offscreen
      // portions of a wide background. The first star is visible immediately.
      const center = visibleLeft + visibleWidth * (.95 - SPEED * localTime);
      if (center < visibleLeft - W * .28 || center > visibleLeft + visibleWidth + W * .28) return;
      if (piece.type === 'band') drawBand(piece.musicians, center, H * handlers, elapsed);
      else if (piece.type === 'float') drawFloat(piece.art, center, H * floats);
      else drawBalloon(piece.art, center, H * handlers, i, elapsed);
    });
  }

  function showMessage(text) {
    el('nowPlaying').textContent = text;
  }

  function showVisualStatus(text = '') {
    visualStatus.textContent = text;
    visualStatus.hidden = !text;
  }

  function controls() {
    pause.disabled = !playing || playing.failed || playing.paused || playing.done;
    resume.disabled = !playing || playing.failed || !playing.paused || playing.done;
    sound.setAttribute('aria-pressed', String(!muted));
    sound.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    pause.setAttribute('aria-pressed', String(Boolean(playing?.paused)));
    fullscreen.setAttribute('aria-label', document.fullscreenElement ? 'Exit full screen' : 'Full screen');
    sound.querySelector('span').textContent = muted ? 'Sound Off' : 'Sound On';
    fullscreen.querySelector('span').textContent = document.fullscreenElement ? 'Exit Full Screen' : 'Full Screen';
    cinema.classList.toggle('parade-paused', Boolean(playing?.paused));
    cinema.classList.toggle('parade-ambient-still', !playing || playing.paused || playing.done || playing.failed);
  }

  // Never silently substitute an older song for one of the four student-selected tracks.
  audio.addEventListener('error', () => {
    if (playing && !playing.done)
      showMessage('This song could not load. Return to Marching Bands & Music to pick another.');
  });

  function playAudio() {
    audio.muted = muted;
    const session = playing;
    audio.play().catch(error => {
      if (!playing || playing !== session || muted || playing.done || playing.failed) return;
      if (error.name === 'NotAllowedError') showMessage('Press Sound Off and Sound On to hear the music.');
      else if (error.name !== 'AbortError') showMessage('Music could not start. Please choose another song.');
    });
  }

  function advance(timestamp) {
    if (!playing || playing.paused || playing.done || playing.failed || playing.loading) return;
    const delta = playing.last ? Math.max(0, Math.min(.09, (timestamp - playing.last) / 1000)) : 0;
    playing.last = timestamp;
    playing.elapsed += delta;
    const total = INTERVAL * (playing.pieces.length - 1) + TRAVEL_TIME;
    const current = Math.min(playing.pieces.length - 1, Math.floor(playing.elapsed / INTERVAL));
    if (current !== playing.announced) {
      playing.announced = current;
      showMessage(playing.pieces[current].name + ' is on parade!');
    }
    el('timelineFill').style.width = Math.min(100, 100 * playing.elapsed / total) + '%';
    paint();
    if (playing.elapsed >= total) {
      playing.done = true;
      audio.pause();
      controls();
      endCard.classList.remove('hidden');
      showMessage('Hooray! Your parade is complete.');
      el('endSaveBtn').focus({ preventScroll: true });
      return;
    }
    frame = requestAnimationFrame(advance);
  }

  function start(pieces, scene, track) {
    if (!pieces.length) return;
    window.PARADE_STOP_MUSIC_PREVIEW?.();
    if (!playing) {
      cinema.classList.remove('hidden');
      document.body.classList.add('parade-playing');
      el('app').inert = true;
    }
    cancelAnimationFrame(frame);
    for (const [src, entry] of pictures) if (entry.failed) pictures.delete(src);
    const original = pieces.map(({ art, musicians, ...piece }) => piece);
    playing = {
      original, scene, track, elapsed: 0, last: 0, announced: -1,
      done: false, paused: false, loading: true, failed: false,
      pieces: original.map(piece => ({
        ...piece,
        art: piece.type === 'band' ? null : picture(piece.src),
        musicians: (piece.members || []).map(picture)
      }))
    };
    const session = playing;
    const required = new Set(session.pieces.flatMap(piece => piece.type === 'band' ? piece.musicians : [piece.art]));
    if (session.pieces.some(piece => piece.type === 'balloon')) CREW.forEach(person => picture(person.path));
    showVisualStatus([...required].every(entry => entry.ready) ? '' : 'Getting your parade ready…');
    if (visualStatus.textContent) showMessage(visualStatus.textContent);
    if (lastImage !== scene.src) {
      lastImage = scene.src;
      backdrop.src = scene.src;
    }
    backdrop.alt = scene.name + ' parade route';
    window.PARADE_SCENE_ATMOSPHERE?.apply(el('movieAtmosphere'), scene);
    el('movieLocation').textContent = scene.name;
    endCard.classList.add('hidden');
    el('endSaveStatus').textContent = '';
    el('timelineFill').style.width = '0%';
    // Begin immediately on the user’s PLAY click, then transition once to the
    // complete original recording assembled from the existing MP3 parts.
    // This prevents the old short classroom OGG from repeating every ~30 seconds.
    const loader = window.PARADE_FULL_MUSIC;
    const available = loader?.peek(track.src);
    const initialSource = available || track.src;
    if (lastTrack !== initialSource || audio.getAttribute('src') !== initialSource) {
      lastTrack = initialSource;
      audio.src = initialSource;
    }
    audio.loop = true;
    audio.currentTime = 0;
    playAudio();
    if (!available && loader) {
      loader.load(track.src).then(fullSource => {
        if (playing !== session || playing.done || playing.failed) return;
        const offset = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
        lastTrack = fullSource;
        audio.src = fullSource;
        audio.loop = true;
        audio.addEventListener('loadedmetadata', () => {
          if (playing === session && Number.isFinite(audio.duration))
            audio.currentTime = Math.min(offset, Math.max(0, audio.duration - .1));
        }, {once:true});
        if (!playing.paused) playAudio();
      }).catch(error => {
        console.warn('Full-length parade soundtrack unavailable:', error);
        if (playing === session && !playing.done)
          showMessage('The full song did not load; the shorter version will repeat.');
      });
    }
    controls();
    resize();
    el('closeMovieBtn').focus({ preventScroll: true });
    Promise.all([...required].map(entry => entry.loaded)).then(() => {
      if (playing !== session) return;
      playing.loading = false;
      playing.pieces = playing.pieces.filter(piece =>
        piece.type === 'band' ? piece.musicians.some(entry => entry.ready) : piece.art.ready);
      if (!playing.pieces.length) {
        playing.failed = true;
        audio.pause();
        controls();
        showVisualStatus('The parade pictures couldn’t load. Try Replay or go Home.');
        showMessage(visualStatus.textContent);
        return;
      }
      if (required.size && [...required].some(entry => entry.failed)) {
        const warning = 'Some pictures couldn’t load. Playing the rest of your parade.';
        showVisualStatus(warning);
        showMessage(warning);
        setTimeout(() => {
          if (playing === session && visualStatus.textContent === warning) showVisualStatus();
        }, 3000);
      } else {
        showVisualStatus();
      }
      paint();
      if (!playing.paused) frame = requestAnimationFrame(advance);
    });
  }

  function close() {
    if (!playing) return;
    playing = null;
    cancelAnimationFrame(frame);
    audio.pause();
    showVisualStatus();
    cinema.classList.add('hidden');
    document.body.classList.remove('parade-playing');
    el('app').inert = false;
    if (document.fullscreenElement === cinema) document.exitFullscreen().catch(() => {});
    el('playBtn').focus({ preventScroll: true });
  }

  pause.onclick = () => {
    if (!playing || playing.failed || playing.paused || playing.done) return;
    playing.paused = true;
    cancelAnimationFrame(frame);
    audio.pause();
    controls();
    resume.focus({ preventScroll: true });
    showMessage('Parade paused.');
  };
  resume.onclick = () => {
    if (!playing?.paused || playing.failed || playing.done) return;
    playing.paused = false;
    playing.last = 0;
    playAudio();
    controls();
    pause.focus({ preventScroll: true });
    if (!playing.loading && playing.pieces[playing.announced])
      showMessage(playing.pieces[playing.announced].name + ' is on parade!');
    frame = requestAnimationFrame(advance);
  };
  sound.onclick = () => {
    muted = !muted;
    audio.muted = muted;
    if (!muted && playing && !playing.failed && !playing.paused && !playing.done && audio.paused) playAudio();
    controls();
  };
  fullscreen.onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.fullscreenEnabled) await cinema.requestFullscreen();
      else showMessage('Full screen is unavailable here.');
    } catch {
      showMessage('Full screen is unavailable here.');
    }
  };
  el('replayBtn').onclick = () => {
    if (playing) start(playing.original, playing.scene, playing.track);
  };
  el('closeMovieBtn').onclick = close;
  document.addEventListener('fullscreenchange', controls);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && playing && !document.fullscreenElement) close();
  });
  backdrop.addEventListener('load', resize);
  new ResizeObserver(resize).observe(view);
  window.PARADE_PLAYER = { start, close, get active() { return Boolean(playing); }, get finished() { return Boolean(playing?.done); } };
})();
