// Chunky 8x8 bitmap font (7x7 glyphs, 2px vertical strokes), drawn into a Frame.

const G = {
  A: ['..###..', '.##.##.', '##...##', '##...##', '#######', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '######.'],
  C: ['..####.', '.##..##', '##.....', '##.....', '##.....', '.##..##', '..####.'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....'],
  G: ['..####.', '.##....', '##.....', '##..###', '##...##', '.##..##', '..#####'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  I: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '######'],
  J: ['....###', '.....##', '.....##', '.....##', '##...##', '##...##', '.#####.'],
  K: ['##...##', '##..##.', '##.##..', '####...', '##.##..', '##..##.', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##'],
  O: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  P: ['######.', '##...##', '##...##', '######.', '##.....', '##.....', '##.....'],
  Q: ['.#####.', '##...##', '##...##', '##...##', '##.#.##', '##..##.', '.###.##'],
  R: ['######.', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##'],
  S: ['.#####.', '##...##', '##.....', '.#####.', '.....##', '##...##', '.#####.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  V: ['##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..', '...#...'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##...##', '.##.##.', '..###..', '..###..', '..###..', '.##.##.', '##...##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..'],
  Z: ['#######', '....##.', '...##..', '..##...', '.##....', '##.....', '#######'],
  0: ['..###..', '.##.##.', '##...##', '##...##', '##...##', '.##.##.', '..###..'],
  // slashed zero, for passwords (so 0 never reads as O)
  'Ø': ['..###..', '.##.##.', '##..###', '##.#.##', '###..##', '.##.##.', '..###..'],
  1: ['..##..', '.###..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  2: ['.#####.', '##...##', '.....##', '...###.', '.###...', '##.....', '#######'],
  3: ['.#####.', '##...##', '.....##', '..####.', '.....##', '##...##', '.#####.'],
  4: ['...###.', '..####.', '.##.##.', '##..##.', '#######', '....##.', '....##.'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '##...##', '.#####.'],
  6: ['..####.', '.##....', '##.....', '######.', '##...##', '##...##', '.#####.'],
  7: ['#######', '##...##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '.######', '.....##', '....##.', '.####..'],
  '.': ['...', '...', '...', '...', '...', '##.', '##.'],
  ',': ['...', '...', '...', '...', '##.', '##.', '#..'],
  ':': ['...', '##.', '##.', '...', '##.', '##.', '...'],
  ';': ['...', '##.', '##.', '...', '##.', '##.', '#..'],
  '!': ['##.', '##.', '##.', '##.', '##.', '...', '##.'],
  '?': ['.#####.', '##...##', '....##.', '...##..', '...##..', '.......', '...##..'],
  '-': ['......', '......', '......', '######', '......', '......', '......'],
  "'": ['##.', '##.', '#..', '...', '...', '...', '...'],
  '"': ['##.##', '##.##', '#..#.', '.....', '.....', '.....', '.....'],
  '#': ['.##.##.', '#######', '.##.##.', '.##.##.', '#######', '.##.##.', '.......'],
  '/': ['.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '.......'],
  '(': ['..##', '.##.', '##..', '##..', '##..', '.##.', '..##'],
  ')': ['##..', '.##.', '..##', '..##', '..##', '.##.', '##..'],
  '+': ['......', '..##..', '..##..', '######', '..##..', '..##..', '......'],
  '=': ['......', '......', '######', '......', '######', '......', '......'],
  '<': ['...##', '..##.', '.##..', '##...', '.##..', '..##.', '...##'],
  '>': ['##...', '.##..', '..##.', '...##', '..##.', '.##..', '##...'],
  '&': ['.###...', '##.##..', '.###...', '.###.##', '##.###.', '##..##.', '.###.##'],
  '%': ['##...##', '##..##.', '...##..', '..##...', '.##....', '##..##.', '#...##.'],
  '*': ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'],
  '_': ['.......', '.......', '.......', '.......', '.......', '.......', '#######'],
  // the "more text" prompt of a paged text box (src/engine/textbox.js)
  '▼': ['.......', '#######', '.#####.', '..###..', '...#...', '.......', '.......'],
};

// Glyphs as 1-bit arrays; advance = glyph width + 1 (proportional) or 8 (mono).
const GLYPHS = {};
for (const [ch, rows] of Object.entries(G)) {
  const w = rows[0].length;
  const bits = new Uint8Array(w * 7);
  rows.forEach((r, y) => { for (let x = 0; x < w; x++) bits[y * w + x] = r[x] === '#' ? 1 : 0; });
  GLYPHS[ch] = { w, bits };
}

export const CHAR_W = 8;

// The text-fit probe (tools/text-fit.mjs): while `on`, every string drawn is logged with its pixel box, and the shared
// text system (src/engine/textbox.js) and hud.panel() log the boxes text is meant to sit in. Off in the game.
// (world: drawn in a scrolling room, where the camera may clip it; seq: draw order, so a panel drawn over a text hides it)
export const PROBE = { on: false, texts: [], boxes: [], over: [], seq: 0, typed: [] };
// (typed: every typewriter block drawn, with how much of it was showing: tools/scene-text-test.mjs checks that no line is ever gone before it was whole)

// opts: shadow (color for a 1px drop shadow), mono (fixed 8px advance, default true)
export function drawText(frame, str, x, y, color, opts = {}) {
  const mono = opts.mono !== false;
  let cx = Math.round(x);
  const cy = Math.round(y);
  str = String(str).toUpperCase();
  if (PROBE.on && str.trim() && !frame.probeSkip && frame.buf) PROBE.texts.push({ s: str, x: cx, y: cy, w: textWidth(str, mono), h: 7, world: !!frame.probeWorld, seq: PROBE.seq++ });
  for (const ch of str) {
    if (ch === ' ') { cx += mono ? CHAR_W : 5; continue; }
    const g = GLYPHS[ch];
    if (!g) { cx += CHAR_W; continue; }
    for (let j = 0; j < 7; j++) for (let i = 0; i < g.w; i++) {
      if (!g.bits[j * g.w + i]) continue;
      if (opts.shadow !== undefined) frame.px(cx + i + 1, cy + j + 1, opts.shadow);
      frame.px(cx + i, cy + j, color);
    }
    if (opts.shadow !== undefined) {
      // redraw glyph over its own shadow
      for (let j = 0; j < 7; j++) for (let i = 0; i < g.w; i++) if (g.bits[j * g.w + i]) frame.px(cx + i, cy + j, color);
    }
    cx += mono ? CHAR_W : g.w + 1;
  }
  return cx;
}

export function textWidth(str, mono = true) {
  let w = 0;
  for (const ch of String(str).toUpperCase()) {
    if (ch === ' ') w += mono ? CHAR_W : 5;
    else w += mono ? CHAR_W : ((GLYPHS[ch] || { w: 7 }).w + 1);
  }
  return w;
}

export function drawTextCentered(frame, str, cx, y, color, opts = {}) {
  const w = textWidth(str, opts.mono !== false);
  return drawText(frame, str, Math.round(cx - w / 2), y, color, opts);
}

// Word-wrap into lines of at most `max` characters.
export function wrap(str, max) {
  const words = String(str).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Word-wrap by pixel width (proportional font by default).
export function wrapPx(str, max, mono = false) {
  const lines = [];
  let cur = '';
  for (const w of String(str).split(/\s+/)) {
    const t = cur ? cur + ' ' + w : w;
    if (textWidth(t, mono) <= max) cur = t;
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

// An in-fight call-out ("SHIELD DROPPED!", "CAUGHT IN THE STORM!"). Spec §4: the only pop-up in a fight is SCOUTED!; what used to
// be called out is shown by the fighter himself, heard, or explained by the cornerman between rounds. Kept as a named no-op so
// every gimmick's call-out stays documented where it was.
export function callout() {}

// Big text: each font pixel becomes a scale x scale block, with a 1px outline.
export function drawTextBig(frame, str, cx, y, color, outline, scale = 2) {
  const pts = [];
  const shim = { px: (x, yy) => pts.push([x, yy]), probeSkip: true };
  if (PROBE.on && String(str).trim()) { const w = textWidth(str) * scale; PROBE.texts.push({ s: String(str).toUpperCase(), x: Math.round(cx - w / 2), y, w, h: 7 * scale, big: scale }); }
  const w = drawText(shim, str, 0, 0, 0);
  const x0 = Math.round(cx - (w * scale) / 2);
  const on = new Set(pts.map(([x, yy]) => x + ',' + yy));
  if (outline !== undefined) {
    for (const [x, yy] of pts) {
      for (let j = -1; j <= scale; j++) for (let i = -1; i <= scale; i++) frame.px(x0 + x * scale + i, y + yy * scale + j, outline);
    }
  }
  for (const [x, yy] of pts) {
    for (let j = 0; j < scale; j++) for (let i = 0; i < scale; i++) frame.px(x0 + x * scale + i, y + yy * scale + j, color);
  }
  return on.size;
}
