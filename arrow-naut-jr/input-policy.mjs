/** First-grade puzzle input policy: a physical trackpad/mouse click may select,
 * but touchscreen taps, stylus taps, and their synthesized clicks cannot.
 * This is intentionally scoped to the puzzle board, not student login or menus.
 */
export function touchGeneratedClick(event, lastPointerType='mouse') {
 const type=event?.pointerType;
 return type==='touch'||type==='pen'||
  event?.sourceCapabilities?.firesTouchEvents===true||
  lastPointerType==='touch'||lastPointerType==='pen';
}
