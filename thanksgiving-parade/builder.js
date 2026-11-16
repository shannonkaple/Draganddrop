'use strict';

(() => {
  const WIDTH = 640;
  const HEIGHT = 430;
  const LEGACY_BODY = 'assets/custom/parade-bodies-15.webp';
  const LEGACY_ART = window.PARADE_LEGACY_ART;
  const catalog = window.PARADE_CATALOG;
  const categories = Object.keys(LEGACY_ART);
  const elements = id => document.getElementById(id);
  const images = new Map();
  const rendered = new Map();

  const legacyBases = [
    ['Teddy Bear', 0, 0, 0, 0], ['Puppy', 5, -4, -4, 4], ['Pink Bunny', 4, 8, 0, 0],
    ['White Cat', -4, -1, 0, 0], ['Dinosaur', -9, 4, 12, -4], ['Alien', 2, -2, 0, 0],
    ['Friendly Monster', 5, -4, 0, 4], ['Curly Puff Girl', -8, 7, -10, 1],
    ['Curly-Hair Boy', 4, -5, 0, 5], ['Ponytail Girl', 1, 5, 0, 3], ['Unicorn', -5, -8, 0, -1],
    ['Dragon', -7, 4, 5, -5], ['Chick', -3, 5, 0, 4], ['Squirrel', 0, -5, 2, 6],
    ['Space Robot', -2, 7, -6, -2]
  ];
  const firstBase = catalog.bases[0].id;
  const bodyById = new Map(catalog.bases.map(base => [base.id, base]));
  const legacyOrder = ['shirts', 'shorts', 'skirts', 'costumes', 'shoes', 'eyes', 'noses', 'mouths', 'hats', 'accessories'];
  const aliases = { noses: 'nose', mouths: 'mouth', hats: 'hat', shirts: 'clothes', accessories: 'prop' };
  let recipe = { baseId: firstBase, options: {} };
  let active = 'eyes';
  let editingId = null;
  let previewRun = 0;
  let boardRun = 0;

  function loadImage(src) {
    if (!images.has(src)) {
      const image = new Image();
      const entry = { image, complete: false };
      entry.promise = new Promise((resolve, reject) => {
        image.onload = () => {
          entry.complete = true;
          resolve(image);
        };
        image.onerror = () => reject(new Error('This picture could not load: ' + src));
      });
      images.set(src, entry);
      image.src = src;
      entry.promise.catch(() => images.delete(src));
    }
    return images.get(src);
  }

  function legacyPath(category, option) {
    const filename = LEGACY_ART[category].files[option - 1];
    return filename && 'assets/customization/' + category + '/' + filename;
  }

  function legacyLayers(design) {
    const i = design.baseId - 301;
    const [, dx, dy, torsoX, torsoY] = legacyBases[i];
    const layers = [{ path: LEGACY_BODY, rect: [(i % 5) * 512, Math.floor(i / 5) * 512, 512, 466], box: [55, 8, 555, 400] }];
    const centers = {
      eyes: [277 + dx, 155 + dy, 265, 181],
      noses: [277 + dx, 207 + dy, 220, 150],
      mouths: [277 + dx, 242 + dy, 142, 108],
      hats: [277 + dx, 63 + dy, 315 * (i >= 4 && i < 7 ? 1.07 : 1), 215 * (i >= 4 && i < 7 ? 1.07 : 1)],
      shirts: [380 + torsoX, 273 + torsoY, 300, 207],
      shorts: [445 + torsoX, 287 + torsoY, 253, 174],
      skirts: [426 + torsoX, 294 + torsoY, 275, 189],
      shoes: [515 + torsoX, 302 + torsoY, 237 * (i < 7 ? 1.12 : 1), 163 * (i < 7 ? 1.12 : 1)],
      accessories: [159 + dx, 262 + dy, 180, 124],
      costumes: [380 + torsoX, 273 + torsoY, 295, 203]
    };
    function append(category, option) {
      const path = legacyPath(category, option);
      if (!path) return;
      const [x, y, w, h] = centers[category];
      layers.push({ path, box: [x - w / 2, y - h / 2, w, h] });
    }
    if (i >= 7 && i <= 9) {
      append('shirts', 11);
      append('shorts', 11);
    }
    for (const category of legacyOrder) {
      append(category, design.options[category] ?? design.options[aliases[category]] ?? 0);
    }
    return layers;
  }

  function fitPart(part, anchor, index = 0) {
    const { path, bounds, rotation = 0, pivot = [.5, .5] } = part;
    const [x, y, maxWidth, maxHeight, angle = 0] = anchor;
    const source = Array.isArray(bounds[0]) ? bounds[index] : bounds;
    const widthRatio = maxWidth / source[2];
    const heightRatio = maxHeight / source[3];
    const multiplier = part.scale ?? 1;
    const width = source[2] * Math.min(widthRatio, heightRatio) * multiplier;
    const height = source[3] * Math.min(widthRatio, heightRatio) * multiplier;
    const [offsetX, offsetY] = part.offset ?? [0, 0];
    return { path, rect: source, box: [-pivot[0] * width, -pivot[1] * height, width, height], transform: [x + offsetX, y + offsetY, angle + rotation] };
  }

  function modernLayers(design, base) {
    const back = [];
    const front = [];
    for (const category of legacyOrder) {
      if (category === 'costumes') continue;
      const option = design.options[category];
      const picked = catalog.parts[category][option - 1] ?? catalog.extra?.[category]?.[option];
      if (!picked) continue;
      const part = { ...picked, ...picked.variants?.[base.family], ...picked.variants?.[base.id] };
      const target = part.layer === 'back' ? back : front;
      const fitting = part.anchor ?? category;
      if (part.placement === 'body-canvas') {
        target.push({ path: part.path, box: [0, 0, WIDTH, HEIGHT] });
      } else if (fitting === 'feet') {
        target.push(fitPart(part, base.fit.farFoot, 0), fitPart(part, base.fit.nearFoot, 1));
      } else if (base.fit[fitting]) {
        const anchor = base.fit[fitting];
        target.push(fitPart(part, anchor));
        if (part.grip) {
          const [x, y] = anchor;
          front.push({ path: base.path, box: [0, 0, WIDTH, HEIGHT], clip: [x, y + 3, 11, 8] });
        }
      }
    }
    return [...back, { path: base.path, box: [0, 0, WIDTH, HEIGHT] }, ...front];
  }

  function layersFor(design) {
    const base = bodyById.get(design.baseId);
    return base ? modernLayers(design, base) : legacyLayers(design);
  }

  function paint(canvas, layers, resolution) {
    canvas.width = WIDTH * resolution;
    canvas.height = HEIGHT * resolution;
    const context = canvas.getContext('2d');
    context.scale(resolution, resolution);
    context.imageSmoothingQuality = 'high';
    for (const layer of layers) {
      const asset = images.get(layer.path);
      if (!asset?.complete) return false;
      context.save();
      if (layer.clip) {
        context.beginPath();
        context.ellipse(...layer.clip, 0, 0, Math.PI * 2);
        context.clip();
      }
      if (layer.transform) {
        const [x, y, angle] = layer.transform;
        context.translate(x, y);
        context.rotate(angle * Math.PI / 180);
      }
      context.drawImage(asset.image, ...(layer.rect ?? []), ...layer.box);
      context.restore();
    }
    return true;
  }

  async function render(canvas, design, resolution = 1) {
    const layers = layersFor(design);
    await Promise.all(layers.map(layer => loadImage(layer.path).promise));
    paint(canvas, layers, resolution);
  }

  function signature(design) {
    return JSON.stringify([design.baseId, design.options]);
  }

  function remember(design, image) {
    rendered.set(signature(design), image);
    if (rendered.size > 58) rendered.delete(rendered.keys().next().value);
    return image;
  }

  function compose(design) {
    const cached = rendered.get(signature(design));
    if (cached) return cached;
    const layers = layersFor(design);
    const pending = layers.map(layer => loadImage(layer.path)).filter(entry => !entry.complete);
    if (pending.length) {
      queueShelfUpdate(pending);
      return '';
    }
    const canvas = document.createElement('canvas');
    paint(canvas, layers, 1.5);
    return remember(design, canvas.toDataURL('image/webp', .89));
  }

  const updates = new Set();
  function queueShelfUpdate(pending) {
    for (const entry of pending) {
      if (updates.has(entry)) continue;
      updates.add(entry);
      entry.promise.then(() => {
        updates.delete(entry);
        if (updates.size === 0) window.paradeRefreshCreations?.();
      }, () => updates.delete(entry));
    }
  }

  function setStatus(message) {
    elements('workshopStatus').textContent = message;
  }

  function draw() {
    const drawId = ++previewRun;
    const snapshot = { baseId: recipe.baseId, options: { ...recipe.options } };
    const layers = layersFor(snapshot);
    elements('saveCreation').disabled = true;
    Promise.all(layers.map(layer => loadImage(layer.path).promise)).then(() => {
      if (drawId !== previewRun) return;
      paint(elements('workshopCanvas'), layers, 1);
      elements('saveCreation').disabled = false;
      setStatus('');
    }, () => {
      if (drawId === previewRun) setStatus('A picture could not load. Try choosing the piece again.');
    });
  }

  function choose(buttons, index) {
    for (const [i, button] of [...buttons].entries()) {
      button.classList.toggle('chosen', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    }
  }

  function label(text) {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }

  function button(className, text) {
    const b = document.createElement('button');
    b.className = className;
    b.type = 'button';
    if (text) b.textContent = text;
    return b;
  }

  function renderBases() {
    const root = elements('workshopBases');
    const choices = [...catalog.bases];
    if (recipe.baseId < 401) {
      choices.push({ id: recipe.baseId, name: legacyBases[recipe.baseId - 301][0] });
    }
    root.replaceChildren(...choices.map((base, i) => {
      const b = button('workshop-body');
      b.dataset.baseId = base.id;
      if (base.path) {
        const img = new Image();
        img.src = base.path;
        img.alt = '';
        b.append(img);
      } else {
        const canvas = document.createElement('canvas');
        b.append(canvas);
        render(canvas, { baseId: base.id, options: {} }, .25).catch(() => {});
      }
      b.append(label(base.name));
      b.onclick = () => {
        const isModern = bodyById.has(base.id);
        if (isModern !== bodyById.has(recipe.baseId)) recipe.options = {};
        recipe.baseId = base.id;
        choose(root.children, i);
        renderOptions();
        draw();
      };
      return b;
    }));
    choose(root.children, choices.findIndex(base => base.id === recipe.baseId));
  }

  function renderTabs() {
    const root = elements('workshopTabs');
    root.replaceChildren(...categories.map((category, i) => {
      const b = button('workshop-tab', LEGACY_ART[category].name);
      b.dataset.category = category;
      b.onclick = () => {
        active = category;
        choose(root.children, i);
        renderOptions();
      };
      return b;
    }));
    choose(root.children, categories.indexOf(active));
  }

  function renderOptions() {
    const run = ++boardRun;
    const root = elements('workshopOptions');
    const modern = bodyById.has(recipe.baseId);
    const current = active;
    const items = modern ? catalog.parts[current] : LEGACY_ART[current].names.map((name, i) => ({
      name, path: legacyPath(current, i + 1)
    }));
    root.replaceChildren(...[{ name: 'Remove' }, ...items].map((item, index) => {
      const b = button('workshop-choice');
      b.dataset.option = index;
      const thumb = document.createElement('canvas');
      thumb.width = 112;
      thumb.height = 72;
      if (item.path) loadImage(item.path).promise.then(image => {
        if (run !== boardRun) return;
        let bounds = item.bounds ?? [0, 0, image.width, image.height];
        if (Array.isArray(bounds[0])) {
          const [left, right] = bounds;
          const y = Math.min(left[1], right[1]);
          bounds = [left[0], y, right[0] + right[2] - left[0], Math.max(left[1] + left[3], right[1] + right[3]) - y];
        }
        const [, , width, height] = bounds;
        const scale = Math.min(105 / width, 66 / height);
        thumb.getContext('2d').drawImage(image, ...bounds, (112 - width * scale) / 2,
          (72 - height * scale) / 2, width * scale, height * scale);
      }).catch(() => {
        if (run === boardRun) {
          b.disabled = true;
          b.title = 'Picture unavailable';
        }
      });
      if (item.path) b.append(thumb);
      b.append(label(item.name));
      b.onclick = () => {
        if (modern && current === 'costumes') {
          const previous = items[recipe.options.costumes - 1];
          for (const [slot, option] of Object.entries(previous?.equips ?? {})) {
            if (recipe.options[slot] === option) recipe.options[slot] = 0;
          }
          Object.assign(recipe.options, items[index - 1]?.equips);
        }
        recipe.options[current] = index;
        if (current === 'shorts' && index) recipe.options.skirts = 0;
        if (current === 'skirts' && index) recipe.options.shorts = 0;
        choose(root.children, index);
        draw();
      };
      return b;
    }));
    choose(root.children, recipe.options[current] || 0);
  }

  function begin(design) {
    editingId = design?.id ?? null;
    recipe = { baseId: design?.baseId ?? firstBase, options: { ...design?.options } };
    for (const [cat, old] of Object.entries(aliases)) {
      if (recipe.options[cat] == null && recipe.options[old] != null) recipe.options[cat] = recipe.options[old];
    }
    active = 'eyes';
    elements('designName').value = design?.name ?? '';
    renderBases();
    renderTabs();
    renderOptions();
    draw();
  }

  function reset() {
    recipe.options = {};
    renderOptions();
    draw();
  }

  async function save() {
    const name = elements('designName').value.trim().replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 26) || 'My Balloon';
    const design = { name, baseId: recipe.baseId, options: { ...recipe.options }, workshop: true };
    const button = elements('saveCreation');
    button.disabled = true;
    setStatus('Saving your balloon…');
    try {
      const canvas = document.createElement('canvas');
      await render(canvas, design, 2);
      const image = remember(design, canvas.toDataURL('image/webp', .91));
      if (!await window.paradeSaveCreation?.(design, editingId, image)) setStatus('Your balloon could not be saved.');
    } catch (error) {
      console.warn(error);
      setStatus('The picture could not be saved. Try again.');
    } finally {
      button.disabled = false;
    }
  }

  elements('workshopReset').addEventListener('click', reset);
  elements('saveCreation').addEventListener('click', save);
  window.PARADE_WORKSHOP = { begin, compose, render, draw };
  window.paradeRefreshCreations?.();
})();
