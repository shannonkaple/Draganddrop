'use strict';

(() => {
  const WIDTH = 640;
  const HEIGHT = 430;
  const LEGACY_BODY = 'assets/custom/parade-bodies-15.webp';
  const LEGACY_ART = window.PARADE_LEGACY_ART;
  const catalog = window.PARADE_CATALOG;
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
  const bodyById = new Map(catalog.bases.map(base => [base.id, base]));
  const legacyOrder = ['shirts', 'shorts', 'skirts', 'costumes', 'shoes', 'eyes', 'noses', 'mouths', 'hats', 'accessories'];
  const aliases = { noses: 'nose', mouths: 'mouth', hats: 'hat', shirts: 'clothes', accessories: 'prop' };

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
    const multiplier = (part.scale ?? 1) * (part._makerScale ?? 1);
    const width = source[2] * Math.min(widthRatio, heightRatio) * multiplier;
    const height = source[3] * Math.min(widthRatio, heightRatio) * multiplier;
    const [ox, oy] = part.offset ?? [0, 0];
    const offsetX = ox + (part._makerX ?? 0);
    const offsetY = oy + (part._makerY ?? 0);
    return { path, rect: source, box: [-pivot[0] * width, -pivot[1] * height, width, height], transform: [x + offsetX, y + offsetY, angle + rotation] };
  }

  function modernLayers(design, base) {
    const back = [];
    const front = [];
    for (const category of legacyOrder) {
      if (category === 'costumes' || category === 'eyes' || category === 'noses' || category === 'mouths') continue;
      const option = design.options[category];
      const picked = catalog.parts[category][option - 1] ?? catalog.extra?.[category]?.[option];
      if (!picked) continue;
      const part = { ...picked, ...picked.variants?.[base.family], ...picked.variants?.[base.id] };
      // Standalone-only fitting corrections. Preserve untouched original artwork and layouts
      // in the main classroom parade. Avoid oversized sticker-like facial features.
      const adjustments = {
        eyes: { _makerScale: .68, _makerY: 1 },
        noses: { _makerScale: .58, _makerY: 0 },
        mouths: { _makerScale: .62, _makerY: -2 },
        hats: { _makerScale: .86, _makerY: 8 },
        shoes: { _makerScale: .78, _makerX: -11, _makerY: -2 },
        accessories: { _makerScale: .86 }
      };
      Object.assign(part, adjustments[category] || {});
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
    const base = bodyById.get(design.baseId);
    if(base && window.PARADE_FACE_ART) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(1.5, 1.5);
      try { window.PARADE_FACE_ART.paint(ctx, design, base); }
      finally {ctx.restore();}
    }
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

  window.PARADE_WORKSHOP = { compose };
  window.paradeRefreshCreations?.();
})();
