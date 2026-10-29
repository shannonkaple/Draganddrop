// Mobile-only touch accessibility. ChromeOS touchscreens are deliberately excluded.
// Do not store this setting in student saves or teacher settings.
export function isMobileTouchDevice(device = typeof navigator === 'undefined' ? {} : navigator) {
  const ua = String(device?.userAgent || '');
  if (/CrOS/i.test(ua)) return false;
  return /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(ua) ||
    (device?.platform === 'MacIntel' && Number(device?.maxTouchPoints) > 1);
}

export function mobileArrowPadHtml(label = 'Touch arrow controls') {
  const keys = [['ArrowUp','↑','up'],['ArrowLeft','←','left'],['ArrowDown','↓','down'],['ArrowRight','→','right']];
  return '<div class="mobile-arrow-pad" role="group" aria-label="' + label + '">' +
    keys.map(([key,symbol,position]) =>
      '<button class="mobile-arrow-button mobile-arrow-' + position +
      '" type="button" data-mobile-arrow="' + key +
      '" aria-label="' + key.replace('Arrow','') + '">' + symbol + '</button>').join('') +
    '</div>';
}

export function bindMobileArrows(root, onDirection) {
  if (!root) return;
  root.querySelectorAll('[data-mobile-arrow]').forEach(button => {
    button.addEventListener('click', () => onDirection(button.dataset.mobileArrow));
  });
}
