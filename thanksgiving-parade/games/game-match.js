(() => {
  'use strict';

  // Source, photographer, and license of each crop are shown in the game.
  const photos = [
    ['felix', 'Felix the Cat', 'A', 'Felix the Cat Balloon, Macy\'s Thanksgiving Day Parade, 2016.jpg', 'slgckgc', 'by/2.0'],
    ['jimmy', 'Jimmy Neutron', 'K', "Macy's Parade 2001 - Jimmy Neutron.jpg", 'Richard Dworkin', 'by-sa/2.0'],
    ['spongebob', 'SpongeBob', 'Q', 'Macys Thanksgiving Parade (38589533352).jpg', 'Tom Hannigan (TomH2323)', 'by/2.0'],
    ['underdog', 'Underdog', 'J', 'Macys-parade-1979.jpg', 'Jon Harder', 'by/2.5'],
    ['star', 'Macy’s Star', '10', "Macy's Ballon Parade.jpg", 'Sondra Grates Stewart', 'by-sa/2.0'],
    ['olaf', 'Olaf', '9', "Macy's parade balloon inflation (11693).jpg", 'Rhododendrites', 'by-sa/4.0']
  ];

  function node(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function button(text, cls, fn) {
    const el = node('button', cls, text);
    el.type = 'button';
    el.addEventListener('click', fn);
    return el;
  }
  function shuffled(values) {
    const list = [...values];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
  function link(text, url) {
    const el = node('a', '', text);
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
    return el;
  }
  function decorative(el) {
    el.setAttribute('aria-hidden', 'true');
    return el;
  }
  function rank(mark, where) {
    const corner = node('span', 'mm-rank mm-' + where);
    corner.append(node('b', '', mark), node('span', '', '★'));
    return corner;
  }

  function makeCardBack() {
    const back = decorative(node('span', 'mm-back'));
    const emblem = node('span', 'mm-emblem');
    emblem.append(node('span', 'mm-emblem-star', '★'), node('b', 'mm-emblem-title', 'PARADE'));
    back.append(node('span', 'mm-corner mm-nw', '✦'), node('span', 'mm-corner mm-ne', '✦'),
      emblem, node('span', 'mm-corner mm-sw', '✦'), node('span', 'mm-corner mm-se', '✦'));
    return back;
  }
  function makeCardFront([id, title, symbol]) {
    const front = decorative(node('span', 'mm-front'));
    const photo = node('img', 'mm-photo');
    const path = 'art-match/' + id + '.webp';
    photo.src = window.portableArt?.[path] || path;
    photo.alt = '';
    photo.draggable = false;
    front.append(rank(symbol, 'nw'), node('span', 'mm-photo-frame'), node('span', 'mm-card-name', title), rank(symbol, 'se'));
    front.children[1].append(photo);
    return front;
  }
  function makeCredits() {
    const credits = node('details', 'mm-credits');
    credits.append(node('summary', '', 'Photo credits'));
    const list = node('ul');
    for (const [, title, , file, by, license] of photos) {
      const li = node('li');
      const source = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file.replaceAll(' ', '_'));
      const licName = license.startsWith('by-sa') ? 'CC BY-SA ' : 'CC BY ';
      li.append(link(title + ' photo', source), ' by ' + by + ' · ',
        link(licName + license.split('/')[1], 'https://creativecommons.org/licenses/' + license + '/'), ' · cropped');
      list.append(li);
    }
    credits.append(list, node('p', '', 'Independent classroom activity, not affiliated with Macy’s.'));
    return credits;
  }

  function mount(root) {
    const wrap = node('section', 'mm-game');
    const directions = node('p', 'game-direction mm-directions', 'Turn over two cards. Match the parade balloons!');
    const modes = node('div', 'mm-modes');
    modes.setAttribute('role', 'group');
    modes.setAttribute('aria-label', 'Choose how many pairs to match');
    const easy = button('4 pairs', 'mm-mode', () => choose(4));
    const standard = button('6 pairs', 'mm-mode', () => choose(6));
    modes.append(easy, standard);
    const board = node('div', 'mm-board');
    board.setAttribute('role', 'group');
    const status = node('p', 'game-feedback mm-status');
    status.setAttribute('role', 'status');
    const actions = node('div', 'mm-actions');
    const hide = button('Hide the two cards', 'mm-action primary', hideTwo);
    const replay = button('Play again', 'mm-action primary', () => start(count, true));
    actions.append(hide, replay);
    wrap.append(directions, modes, board, status, actions, makeCredits());
    root.replaceChildren(wrap);
    let count = 6, first = null, second = null, found = 0, cards = [];

    function choose(n) {
      if (count !== n) start(n, true);
    }
    function start(n, focus) {
      count = n;
      found = 0;
      first = second = null;
      wrap.classList.remove('mm-win');
      easy.setAttribute('aria-pressed', String(n === 4));
      standard.setAttribute('aria-pressed', String(n === 6));
      board.dataset.count = n;
      board.setAttribute('aria-label', n * 2 + ' playing cards');
      hide.hidden = replay.hidden = true;
      status.textContent = '0 of ' + count + ' pairs found';
      const deck = shuffled(photos).slice(0, n);
      cards = shuffled([...deck, ...deck]).map((photo, i) => {
        const data = { photo, i, state: 'down' };
        data.card = button('', 'mm-card', () => flip(data));
        data.card.append(makeCardBack(), makeCardFront(photo), decorative(node('span', 'mm-found', '✓')));
        update(data);
        return data;
      });
      board.replaceChildren(...cards.map(data => data.card));
      if (focus) cards[0].card.focus({ preventScroll: true });
    }
    function update(data) {
      const up = data.state !== 'down';
      data.card.dataset.state = data.state;
      data.card.setAttribute('aria-label', up ? data.photo[1] + (data.state === 'matched' ? ', matched' : ', face up') : 'Turn over card ' + (data.i + 1));
      data.card.setAttribute('aria-disabled', String(up || !!second));
    }
    function flip(data) {
      if (second || data.state !== 'down') return;
      data.state = 'up';
      if (!first) {
        first = data;
        update(first);
        status.textContent = data.photo[1] + '! Pick one more card.';
        return;
      }
      second = data;
      if (first.photo[0] === second.photo[0]) {
        first.state = second.state = 'matched';
        found++;
        first = second = null;
        cards.forEach(update);
        window.paradeReward?.('macys-match');
        if (found === count) {
          wrap.classList.add('mm-win');
          status.textContent = '★ You matched all ' + count + ' pairs!';
          replay.hidden = false;
          replay.focus({ preventScroll: true });
        } else {
          status.textContent = 'A match! ' + found + ' of ' + count + ' pairs found.';
        }
      } else {
        cards.forEach(update);
        status.textContent = 'Different balloons. Take a look, then hide them.';
        hide.hidden = false;
        hide.focus({ preventScroll: true });
      }
    }
    function hideTwo() {
      if (!first || !second) return;
      const anchor = first.card;
      first.state = second.state = 'down';
      first = second = null;
      cards.forEach(update);
      hide.hidden = true;
      status.textContent = found + ' of ' + count + ' pairs found. Pick two cards!';
      anchor.focus({ preventScroll: true });
    }

    start(6, false);
  }

  window.arcadeMatch = [{id: 'macys-match', title: 'Macy’s Match', icon: '★', blurb: 'Find matching photos of real parade balloons.', mount}];
})();
