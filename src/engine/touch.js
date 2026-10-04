// Touch (spec §3): the on-screen pad for phones and tablets, and taps and swipes on the picture.
//
// THE PAD: a direction pad on one side and A, B, STAR on the other, with PAUSE and START at the top of the columns. They are drawn in the game's own pixel
// art (small canvases scaled up with nearest-neighbour) and press the same actions as the keyboard and the gamepad (input.setVirtual), so every screen and
// every fight plays on a phone. Touch EVENTS are used, not clicks: a finger down is a button down in the same event, so tells, counters and golden moments
// are as hittable as on a keyboard. Fingers are tracked one by one (multi-touch): hold UP and tap A, roll a thumb from B to A, double-tap DOWN.
//   - the pad shows on a touch device and hides as soon as a key or a gamepad button is used; the next touch brings it back (Options: AUTO / ALWAYS / OFF)
//   - the game keeps the biggest whole-number scale that fits; the pad lives in the strips either side of it and never covers the picture or its HUD
//   - size, opacity, side (left-handed) and height are Options (saved with the other global options)
// THE PICTURE: a tap is handed to the screen (input.pushTap, native 256x224 coordinates), a drag scrolls (input.pushDrag).
// PAGE: no scrolling, pinch or double-tap zoom, text selection, long-press menu or pull-to-refresh. Safe areas (notches) are kept clear.
import { Frame } from './renderer.js';
import { drawText, textWidth } from './font.js';
import { c32 } from './palette.js';

// ---- the pad's art (all in art pixels; one art pixel is K css pixels) ---------------------------------------------------------------------------
const INK = c32(2, 2, 6), FACE = c32(9, 11, 18), FACE_HI = c32(15, 17, 25), FACE_LO = c32(5, 6, 11), ON = c32(29, 25, 8), ON_LO = c32(20, 14, 4), TXT = c32(30, 30, 31);
const A_FACE = c32(24, 6, 7), A_HI = c32(30, 14, 12), A_LO = c32(14, 3, 5);
const B_FACE = c32(7, 11, 26), B_HI = c32(14, 18, 31), B_LO = c32(3, 5, 15);
const S_FACE = c32(25, 19, 4), S_HI = c32(31, 27, 12), S_LO = c32(16, 10, 2);

export const K_TABLE = [2.0, 2.5, 3.0, 3.5, 4.2]; // css px per art pixel, for TOUCH SIZE 1..5
const DPAD = 42, BTN = 20, PILL_W = 44, PILL_H = 14;
export const AB_W = 58, AB_H = 48; // the A / B / STAR cluster's box
// button centres inside the cluster's box
const AB = { star: [26, 10], a: [48, 26], b: [20, 38] };

const STAR = ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '##...##'];

function blank(w, h) { return new Frame(w, h); }
function toCanvas(canvas, frame) {
  canvas.width = frame.w; canvas.height = frame.h;
  canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(frame.buf.buffer), frame.w, frame.h), 0, 0);
}
// a round button: ink ring, bevelled face, label
function drawRound(f, d, face, hi, lo, on, label) {
  const r = (d - 1) / 2;
  for (let y = 0; y < d; y++) for (let x = 0; x < d; x++) {
    const dx = x - r, dy = y - r, dist = Math.hypot(dx, dy);
    if (dist > r + 0.4) continue;
    if (dist > r - 1.1) { f.px(x, y, INK); continue; }
    let c = on ? ON : face;
    if (dist > r - 2.3) c = (dx + dy < -0.5) ? (on ? S_HI : hi) : (dx + dy > 0.5) ? (on ? ON_LO : lo) : c;
    f.px(x, y, c);
  }
  if (label === '*') {
    for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if (STAR[j][i] === '#') f.px(Math.round(r) - 3 + i, Math.round(r) - 3 + j, on ? INK : TXT);
  } else if (label) drawText(f, label, Math.round(r - (textWidth(label, false) - 1) / 2), Math.round(r) - 3, on ? INK : TXT, { mono: false });
}
function drawPill(f, label, on) {
  const w = PILL_W, h = PILL_H;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const cx = Math.min(x, w - 1 - x), cy = Math.min(y, h - 1 - y);
    if (cx + cy < 2 && cx < 2 && cy < 2) continue;
    const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1 || (cx + cy === 2 && cx < 2 && cy < 2);
    if (edge) { f.px(x, y, INK); continue; }
    f.px(x, y, on ? ON : y === 1 ? FACE_HI : y === h - 2 ? FACE_LO : FACE);
  }
  drawText(f, label, Math.round((w - textWidth(label, false) + 1) / 2), 4, on ? INK : TXT, { mono: false });
}
function drawDpad(f, held) {
  const c = DPAD / 3, inPlus = (x, y) => (x >= c && x < 2 * c) || (y >= c && y < 2 * c);
  for (let y = 0; y < DPAD; y++) for (let x = 0; x < DPAD; x++) {
    if (!inPlus(x, y)) continue;
    const edge = !inPlus(x - 1, y) || !inPlus(x + 1, y) || !inPlus(x, y - 1) || !inPlus(x, y + 1) || x === 0 || y === 0 || x === DPAD - 1 || y === DPAD - 1;
    if (edge) { f.px(x, y, INK); continue; }
    const arm = y < c ? 'up' : y >= 2 * c ? 'down' : x < c ? 'left' : x >= 2 * c ? 'right' : null;
    f.px(x, y, arm && held[arm] ? ON : (x + y) % 2 && !arm ? FACE_HI : FACE);
  }
  // arrows
  const arrow = (cx, cy, dx, dy, on) => {
    for (let i = 0; i < 4; i++) for (let j = -i; j <= i; j++) {
      const px = dx ? cx + dx * (3 - i) : cx + j, py = dy ? cy + dy * (3 - i) : cy + j;
      f.px(px, py, on ? INK : TXT);
    }
  };
  arrow(21, 7, 0, -1, held.up); arrow(21, 35, 0, 1, held.down); arrow(7, 21, -1, 0, held.left); arrow(35, 21, 1, 0, held.right);
}

// ---- the pad ----------------------------------------------------------------------------------------------------------------------------------
export function installTouch(game, canvas, display) {
  const input = game.input, wrap = canvas.parentElement;
  const O = () => game.options;
  const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const T = { visible: false, portrait: false, hasTouch, onChange: null, k: 2.5 };

  const css = document.createElement('style');
  css.textContent = `
    #touch { position: fixed; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5; display: none; }
    #touch.on { display: block; }
    #touch canvas { position: absolute; image-rendering: pixelated; image-rendering: crisp-edges; pointer-events: none; }
    #rotate, #paused { position: fixed; inset: 0; z-index: 20; background: #05060c; display: none; align-items: center; justify-content: center; flex-direction: column; }
    #rotate.on, #paused.on { display: flex; }
    #rotate canvas, #paused canvas { image-rendering: pixelated; image-rendering: crisp-edges; max-width: 90vw; }
  `;
  document.head.appendChild(css);

  const root = document.createElement('div');
  root.id = 'touch';
  document.body.appendChild(root);
  const mk = (cls) => { const c = document.createElement('canvas'); c.className = cls; root.appendChild(c); return c; };
  const els = { dpad: mk('dpad'), pause: mk('pill'), start: mk('pill'), star: mk('round'), a: mk('round'), b: mk('round') };
  const held = { up: false, down: false, left: false, right: false };
  const down = new Set();
  const redraw = (name) => {
    let f;
    if (name === 'dpad') { f = blank(DPAD, DPAD); drawDpad(f, held); }
    else if (name === 'pause' || name === 'start') { f = blank(PILL_W, PILL_H); drawPill(f, name.toUpperCase(), down.has(name)); }
    else {
      f = blank(BTN, BTN);
      const [face, hi, lo, label] = name === 'a' ? [A_FACE, A_HI, A_LO, 'A'] : name === 'b' ? [B_FACE, B_HI, B_LO, 'B'] : [S_FACE, S_HI, S_LO, '*'];
      drawRound(f, BTN, face, hi, lo, down.has(name), label);
    }
    toCanvas(els[name], f);
  };
  Object.keys(els).forEach(redraw);

  // ---- layout -----------------------------------------------------------------------------------------------------------------------------
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(probe);
  let rects = null; // hit areas, in css px

  function layout() {
    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth, vh = window.innerHeight;
    const cs = getComputedStyle(probe);
    const safe = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
    const availW = vw - safe.l - safe.r, availH = vh - safe.t - safe.b;
    // portrait: a touch device held upright gets the "rotate" message (the game waits)
    T.portrait = hasTouch && vh > vw;
    rotateEl.classList.toggle('on', T.portrait);
    root.classList.toggle('on', T.visible && !T.portrait);
    const place = (el, x, y, w, h) => { el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.width = `${w}px`; el.style.height = `${h}px`; };
    if (!T.visible) {
      // no pad: the picture takes the whole window
      wrap.style.cssText = `position:fixed;left:${safe.l}px;top:${safe.t}px;width:${availW}px;height:${availH}px`;
      rects = null;
      display.resize();
      return;
    }
    const want = K_TABLE[Math.max(0, Math.min(4, (O().touchSize || 3) - 1))];
    const margin = 8;
    // the picture first: the biggest whole-number scale (in device pixels) that still leaves the strips enough room for the pad at 75% of its wanted size
    const sMax = Math.max(1, Math.floor(Math.min(availW * dpr / 256, availH * dpr / 224)));
    let s = sMax;
    for (; s > 1; s--) if ((availW - (256 * s) / dpr) / 2 >= AB_W * want * 0.75 + margin * 2) break;
    const gameW = (256 * s) / dpr, side = Math.max(0, (availW - gameW) / 2);
    const k = Math.max(1.2, Math.min(want, (side - margin * 2) / AB_W));
    T.k = k;
    wrap.style.cssText = `position:fixed;left:${safe.l + side}px;top:${safe.t}px;width:${availW - side * 2}px;height:${availH}px`;
    // columns
    const swap = !!O().touchSide;
    const leftCol = safe.l, rightCol = vw - safe.r - side;
    const dpadCol = swap ? rightCol : leftCol, abCol = swap ? leftCol : rightCol;
    const pillTop = safe.t + margin, pillH = PILL_H * k;
    const minY = pillTop + pillH + margin, maxY = (h) => safe.t + availH - margin - h;
    const yFor = (h) => { const lo = minY, hi = Math.max(lo, maxY(h)); return hi - (hi - lo) * Math.max(0, Math.min(4, O().touchY ?? 1)) / 4; };
    const dW = DPAD * k, dX = dpadCol + (side - dW) / 2, dY = yFor(dW);
    const aW = AB_W * k, aH = AB_H * k, aX = abCol + (side - aW) / 2, aY = yFor(aH);
    place(els.dpad, dX, dY, dW, dW);
    const btn = (name) => { const [cx, cy] = AB[name]; place(els[name], aX + (cx - BTN / 2) * k, aY + (cy - BTN / 2) * k, BTN * k, BTN * k); return { cx: aX + cx * k, cy: aY + cy * k, r: (BTN / 2 + 5) * k }; };
    const pill = (name, col) => { const w = PILL_W * k; place(els[name], col + (side - w) / 2, pillTop, w, pillH); return { x: col + (side - w) / 2 - 4, y: pillTop - 4, w: w + 8, h: pillH + 8 }; };
    rects = {
      dpad: { cx: dX + dW / 2, cy: dY + dW / 2, w: dW, hit: dW * 0.62 },
      a: btn('a'), b: btn('b'), star: btn('star'),
      start: pill('start', abCol), pause: pill('pause', dpadCol),
    };
    display.resize();
  }

  // ---- the "rotate your device" and "paused" cards (drawn with the game's font, like everything else) ----------------------------------------
  function card(id, lines, colors, w) {
    const el = document.createElement('div');
    el.id = id;
    const c = document.createElement('canvas');
    const h = lines.length * 14 + 6;
    const f = blank(w, h);
    lines.forEach((ln, i) => drawText(f, ln, Math.round((w - textWidth(ln, true)) / 2), 3 + i * 14, colors[i % colors.length]));
    toCanvas(c, f);
    c.style.width = `${Math.min(w * 3, Math.floor(window.innerWidth * 0.9))}px`;
    c.style.height = 'auto';
    el.appendChild(c);
    document.body.appendChild(el);
    return el;
  }
  const rotateEl = card('rotate', ['ROTATE YOUR', 'DEVICE', '', 'KO CIRCUIT PLAYS', 'SIDEWAYS'], [c32(31, 29, 10), c32(31, 29, 10), TXT, c32(18, 20, 26), c32(18, 20, 26)], 136);
  // a little phone turning on its side, above the words
  {
    const ph = blank(30, 30);
    const rect = (x, y, w, h, c) => ph.rect(x, y, w, h, c);
    rect(9, 2, 12, 22, INK); rect(10, 3, 10, 20, FACE_HI); rect(11, 5, 8, 15, c32(6, 12, 22)); rect(13, 21, 4, 1, TXT);
    rect(21, 10, 6, 1, ON); rect(24, 8, 1, 5, ON); rect(22, 11, 1, 1, ON);
    const c = document.createElement('canvas'); toCanvas(c, ph); c.style.width = '90px'; c.style.margin = '0 0 12px'; c.style.animation = 'tilt 2s ease-in-out infinite';
    rotateEl.insertBefore(c, rotateEl.firstChild);
    const st = document.createElement('style'); st.textContent = '@keyframes tilt { 0%,30% { transform: rotate(0deg); } 60%,100% { transform: rotate(-90deg); } }'; document.head.appendChild(st);
  }
  const pausedEl = card('paused', ['PAUSED', '', 'TAP OR PRESS ANY KEY', 'TO CONTINUE'], [c32(31, 29, 10), TXT, TXT, TXT], 168);
  T.pausedEl = pausedEl;

  // ---- fingers ------------------------------------------------------------------------------------------------------------------------------
  const fingers = new Map(); // touch id -> { kind: 'dpad' | 'btn' | 'pic', name, x0, y0, t0, moved }
  const setBtn = (name, on) => {
    if (on === down.has(name)) return;
    if (on) down.add(name); else down.delete(name);
    input.setVirtual(name, on);
    redraw(name);
  };
  const setDir = (dx, dy) => {
    // 8-way, with a dead zone; a push that is nearly straight stays straight
    const dz = rects ? rects.dpad.w * 0.1 : 0, ax = Math.abs(dx), ay = Math.abs(dy);
    let want = { up: false, down: false, left: false, right: false };
    if (ax > dz || ay > dz) {
      const horiz = ax > dz && ax * 1.0 >= ay * 0.42, vert = ay > dz && ay * 1.0 >= ax * 0.42;
      if (horiz) { if (dx < 0) want.left = true; else want.right = true; }
      if (vert) { if (dy < 0) want.up = true; else want.down = true; }
    }
    let changed = false;
    for (const d of ['up', 'down', 'left', 'right']) if (want[d] !== held[d]) { held[d] = want[d]; input.setVirtual(d, want[d]); changed = true; }
    if (changed) redraw('dpad');
  };
  const releaseAll = () => {
    for (const n of [...down]) setBtn(n, false);
    setDir(0, 0);
    fingers.clear();
  };
  // which pad control is under a point (css px)?
  const hitBtn = (x, y) => {
    if (!rects) return null;
    for (const n of ['start', 'pause']) { const r = rects[n]; if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return n; }
    let best = null, bd = 1e9;
    for (const n of ['a', 'b', 'star']) { const r = rects[n], d = Math.hypot(x - r.cx, y - r.cy); if (d <= r.r && d < bd) { bd = d; best = n; } }
    return best;
  };
  const inDpad = (x, y) => rects && Math.abs(x - rects.dpad.cx) <= rects.dpad.hit && Math.abs(y - rects.dpad.cy) <= rects.dpad.hit;
  const toNative = (x, y) => display.toNative(x, y);
  const nativePerCss = () => { const r = canvas.getBoundingClientRect(); return r.width ? 256 / r.width : 1; };

  function start(t) {
    const x = t.clientX, y = t.clientY;
    if (!T.visible) show();
    if (T.portrait) return;
    const f = { x0: x, y0: y, x, y, t0: performance.now(), moved: 0 };
    if (inDpad(x, y)) { f.kind = 'dpad'; setDir(x - rects.dpad.cx, y - rects.dpad.cy); }
    else { const b = hitBtn(x, y); if (b) { f.kind = 'btn'; f.name = b; setBtn(b, true); } else { f.kind = 'pic'; input.clearDrag(); } }
    fingers.set(t.identifier, f);
  }
  function move(t) {
    const f = fingers.get(t.identifier);
    if (!f) return;
    const x = t.clientX, y = t.clientY;
    if (f.kind === 'dpad') setDir(x - rects.dpad.cx, y - rects.dpad.cy);
    else if (f.kind === 'btn') {
      // a thumb rolling from one button to another lets go of the first and presses the second
      const b = hitBtn(x, y);
      if (b !== f.name) { setBtn(f.name, false); f.name = b; if (b) setBtn(b, true); }
    } else {
      const k = nativePerCss();
      input.pushDrag((x - f.x) * k, (y - f.y) * k);
      f.moved = Math.max(f.moved, Math.hypot(x - f.x0, y - f.y0));
    }
    f.x = x; f.y = y;
  }
  function end(t, cancelled) {
    const f = fingers.get(t.identifier);
    if (!f) return;
    fingers.delete(t.identifier);
    if (f.kind === 'dpad') setDir(0, 0);
    else if (f.kind === 'btn') { if (f.name) setBtn(f.name, false); }
    else if (!cancelled && f.moved < 12 && performance.now() - f.t0 < 800) {
      const p = toNative(t.clientX, t.clientY);
      input.pushTap(p ? p.x : -99, p ? p.y : -99); // (a tap off the picture still turns a text box)
    }
  }
  const unlockAudio = () => { try { game.audio.unlock(); } catch { /* no audio */ } };
  const each = (e, fn) => { for (const t of e.changedTouches) fn(t); };
  const opts = { passive: false };
  document.addEventListener('touchstart', (e) => { e.preventDefault(); each(e, start); unlockAudio(); }, opts);
  document.addEventListener('touchmove', (e) => { e.preventDefault(); each(e, move); }, opts);
  document.addEventListener('touchend', (e) => { e.preventDefault(); each(e, (t) => end(t, false)); unlockAudio(); }, opts);
  document.addEventListener('touchcancel', (e) => { each(e, (t) => end(t, true)); }, opts);
  // a mouse (a desktop, or a laptop with a pad on screen): a click on the picture is a tap, the wheel scrolls
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const p = toNative(e.clientX, e.clientY);
    if (p) input.pushTap(p.x, p.y);
  });
  window.addEventListener('wheel', (e) => { input.pushDrag(0, -Math.sign(e.deltaY) * 11); }, { passive: true });
  // no long-press menu, text selection, pinch, double-tap zoom or drag ghosts, ever
  for (const ev of ['contextmenu', 'selectstart', 'dragstart', 'gesturestart', 'gesturechange', 'gestureend', 'dblclick']) document.addEventListener(ev, (e) => e.preventDefault(), opts);
  window.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && ['=', '-', '+', '0'].includes(e.key)) e.preventDefault(); });

  // ---- showing and hiding ---------------------------------------------------------------------------------------------------------------
  const mode = () => O().touchMode || 0; // 0 AUTO, 1 ALWAYS, 2 OFF
  function wanted() { const m = mode(); return m === 1 || (m === 0 && T.auto); }
  function show() { T.auto = true; refresh(); }
  function used(device) { // a key or a gamepad button: the pad goes away (in AUTO)
    if (!T.auto || mode() !== 0) return;
    T.auto = false; releaseAll(); refresh();
  }
  function refresh() {
    const v = wanted();
    if (v !== T.visible) { T.visible = v; if (!v) releaseAll(); }
    layout();
    redrawAll();
    if (T.onChange) T.onChange();
  }
  const redrawAll = () => { root.style.opacity = String(Math.max(0.1, Math.min(1, (O().touchOpacity ?? 6) / 10))); };
  T.auto = hasTouch;
  T.refresh = refresh;
  T.releaseAll = releaseAll;
  input.onDevice = used;

  let rt = 0;
  const relayout = () => { layout(); clearTimeout(rt); rt = setTimeout(layout, 250); }; // (iOS reports the new size a moment after a rotation)
  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', relayout);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
  window.addEventListener('blur', () => { if (T.visible) releaseAll(); });
  refresh();
  return T;
}
