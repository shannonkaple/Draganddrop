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
  const SPEED = .137;
  const STREETS = {
    storybook: { handlers: .925, floats: .968 },
    'central-park': { handlers: .846, floats: .924 },
    columbus: { handlers: .879, floats: .946 },
    'sixth-avenue': { handlers: .852, floats: .941 },
    'herald-square': { handlers: .904, floats: .962 }
  };
  const CREW = [
    { path: 'assets/handlers/cranberry.webp', hand: [.055, .146] },
    { path: 'assets/handlers/teal.webp', hand: [.058, .147] },
    { path: 'assets/handlers/gold.webp', hand: [.062, .146] },
    { path: 'assets/handlers/lavender.webp', hand: [.052, .144] }
  ];

  const pictures = new Map();
  const measurement = document.createElement('canvas');
  const measure = measurement.getContext('2d', { willReadFrequently: true });
  let playing = null;
  let frame;
  let muted = false;
  let lastImage = '';
  let lastTrack = '';
  let bounds = { width: 0, height: 0 };

  function picture(src) {
    if (!pictures.has(src)) {
      const image = new Image();
      const entry = { image, ready: false };
      pictures.set(src, entry);
      image.onload = () => {
        entry.ready = true;
        measurePicture(entry);
        if (playing?.paused) paint();
      };
      image.onerror = () => { entry.failed = true; };
      image.src = src;
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
    const available = view.getBoundingClientRect();
    const ratio = 1800 / 763;
    const width = Math.min(available.width, available.height * ratio);
    const height = width / ratio;
    const scale = Math.min(2, devicePixelRatio || 1);
    bounds = { width, height };
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
    const width = Math.min(.515 * W, H * .54 * aspect);
    const height = width / aspect;
    if (center + width / 2 < 0 || center - width / 2 > W) return;
    groundShadow(center, ground, width * .38, H * .012);
    context.save();
    sprite(entry, center - width / 2, ground - height, width, height);
    context.restore();
  }

  function drawCrew(entry, x, ground, width, height, step, split = .68) {
    const [sourceX, sourceY, sourceW, sourceH] = entry.crop;
    // Keep the head and rope hand stable while the legs take short marching steps.
    const travel = Math.sin(step) * width * .075;
    context.drawImage(entry.image, sourceX, sourceY, sourceW, sourceH * split,
      x, ground - height, width, height * split);
    const lowerY = sourceY + sourceH * split;
    const lowerH = sourceH * (1 - split);
    context.drawImage(entry.image, sourceX, lowerY, sourceW / 2, lowerH,
      x + travel, ground - height * (1 - split), width / 2, height * (1 - split));
    context.drawImage(entry.image, sourceX + sourceW / 2, lowerY, sourceW / 2, lowerH,
      x + width / 2 - travel, ground - height * (1 - split), width / 2, height * (1 - split));
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
    const crew = [.16, .36, .64, .84].map((percent, person) => {
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
      const ropeX = x + [.22, .40, .60, .78][i] * width;
      const ropeY = y + entry.tetherY[i] * height;
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
      drawCrew(person.asset, person.x, person.y, person.wide, crewHeight, time * 14 + i * 1.6);
    });
    sprite(entry, x, y, width, height);
  }

  function drawBand(members, center, ground, time) {
    const { width: W, height: H } = bounds;
    const height = H * .25;
    const spacing = Math.min(W * .125, H * .245);
    members.forEach((asset, index) => {
      if (!asset.ready) return;
      const width = height * asset.crop[2] / asset.crop[3];
      const x = center + (index - 1) * spacing;
      const y = ground + H * (index % 2 === 0 ? .014 : -.005);
      groundShadow(x, y, width * .32, H * .005);
      drawCrew(asset, x - width / 2, y, width, height, time * 14 + index * 1.55, .78);
    });
  }

  function paint() {
    if (!playing) return;
    const { width: W, height: H } = bounds;
    context.clearRect(0, 0, W, H);
    const { elapsed, pieces, scene } = playing;
    const street = STREETS[scene.id] ?? STREETS['central-park'];
    pieces.forEach((piece, i) => {
      if (piece.type !== 'band' && !piece.art.ready) return;
      const localTime = elapsed - i * INTERVAL;
      const center = W * (1.16 - SPEED * localTime);
      if (center < -W * .28 || center > W * 1.25) return;
      if (piece.type === 'band') drawBand(piece.musicians, center, H * street.handlers, elapsed);
      else if (piece.type === 'float') drawFloat(piece.art, center, H * street.floats);
      else drawBalloon(piece.art, center, H * street.handlers, i, elapsed);
    });
  }

  function showMessage(text) {
    el('nowPlaying').textContent = text;
  }

  function controls() {
    pause.disabled = !playing || playing.paused || playing.done;
    resume.disabled = !playing || !playing.paused || playing.done;
    sound.setAttribute('aria-pressed', String(!muted));
    sound.querySelector('span').textContent = muted ? 'Sound Off' : 'Sound On';
    fullscreen.querySelector('span').textContent = document.fullscreenElement ? 'Exit Full Screen' : 'Full Screen';
    cinema.classList.toggle('parade-paused', Boolean(playing?.paused));
  }

  // Never silently substitute an older song for one of the four student-selected tracks.
  audio.addEventListener('error', () => {
    if (playing && !playing.done)
      showMessage('This song could not load. Return to Scenes & Music to pick another.');
  });

  function playAudio() {
    audio.muted = muted;
    audio.play().catch(error => {
      if (!playing || muted || playing.done) return;
      if (error.name === 'NotAllowedError') showMessage('Press Sound Off and Sound On to hear the music.');
      else if (error.name !== 'AbortError') showMessage('Music could not start. Please choose another song.');
    });
  }

  function advance(timestamp) {
    if (!playing || playing.paused || playing.done) return;
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
    playing = { pieces: pieces.map(piece => ({ ...piece, art: picture(piece.src), musicians: piece.members?.map(picture) })), scene, track, elapsed: 0, last: 0, announced: -1, done: false, paused: false };
    CREW.forEach(person => picture(person.path));
    if (lastImage !== scene.src) {
      lastImage = scene.src;
      backdrop.src = scene.src;
    }
    backdrop.alt = scene.name + ' parade route';
    el('movieLocation').textContent = scene.name;
    endCard.classList.add('hidden');
    el('endSaveStatus').textContent = '';
    el('timelineFill').style.width = '0%';
    if (lastTrack !== track.src || audio.getAttribute('src') !== track.src) {
      lastTrack = track.src;
      audio.src = track.src;
    }
    audio.currentTime = 0;
    playAudio();
    controls();
    resize();
    el('closeMovieBtn').focus({ preventScroll: true });
    frame = requestAnimationFrame(advance);
  }

  function close() {
    if (!playing) return;
    playing = null;
    cancelAnimationFrame(frame);
    audio.pause();
    cinema.classList.add('hidden');
    document.body.classList.remove('parade-playing');
    el('app').inert = false;
    if (document.fullscreenElement === cinema) document.exitFullscreen().catch(() => {});
    el('playBtn').focus({ preventScroll: true });
  }

  pause.onclick = () => {
    if (!playing || playing.paused || playing.done) return;
    playing.paused = true;
    cancelAnimationFrame(frame);
    audio.pause();
    controls();
    resume.focus();
    showMessage('Parade paused.');
  };
  resume.onclick = () => {
    if (!playing?.paused || playing.done) return;
    playing.paused = false;
    playing.last = 0;
    playAudio();
    controls();
    pause.focus();
    showMessage(playing.pieces[playing.announced]?.name + ' is on parade!');
    frame = requestAnimationFrame(advance);
  };
  sound.onclick = () => {
    muted = !muted;
    audio.muted = muted;
    if (!muted && playing && !playing.paused && !playing.done && audio.paused) playAudio();
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
    if (playing) start(playing.pieces, playing.scene, playing.track);
  };
  el('closeMovieBtn').onclick = close;
  document.addEventListener('fullscreenchange', controls);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && playing && !document.fullscreenElement) close();
  });
  new ResizeObserver(resize).observe(view);
  window.PARADE_PLAYER = { start, close, get active() { return Boolean(playing); }, get finished() { return Boolean(playing?.done); } };
})();
