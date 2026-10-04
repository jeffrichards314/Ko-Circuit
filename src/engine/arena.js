// Arena pipeline. An arena file (/data/arenas/<id>.js) provides:
//   palettes     up to 4 background palettes (15 colors each)
//   paintBack(p) static wall/ceiling layer          (behind the crowd)
//   paintRing(p) static ropes/posts/canvas layer    (in front of the crowd)
//   crowd        spectator rows, style and density
//   paletteAnim(t, pal, state)  palette animation (flicker, flashes)
//   overlay(frame, api, t, state) small dynamic props (clocks, fans, ...)
// The pipeline builds both layers once as index buffers, generates the crowd,
// and handles crowd reactions for knockdowns and stars.

import { bgPalette } from './palette.js';
import { W, H } from './renderer.js';
import { drawText as fontText } from './font.js';

// Paint API over an index buffer, addressed by palette key.
export class IndexCanvas {
  constructor(pal, w = W, h = H) {
    this.pal = pal; this.w = w; this.h = h;
    this.data = new Uint8Array(w * h);
  }
  c(key) { return typeof key === 'number' ? key : this.pal.idx(key); }
  px(x, y, key) {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.data[y * this.w + x] = this.c(key);
  }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.data[y * this.w + x] : 0; }
  rect(x, y, w, h, key) {
    const v = this.c(key);
    for (let j = Math.max(0, y); j < Math.min(this.h, y + h); j++)
      for (let i = Math.max(0, x); i < Math.min(this.w, x + w); i++) this.data[j * this.w + i] = v;
  }
  hline(x0, x1, y, key) { this.rect(Math.min(x0, x1), y, Math.abs(x1 - x0) + 1, 1, key); }
  vline(x, y0, y1, key) { this.rect(x, Math.min(y0, y1), 1, Math.abs(y1 - y0) + 1, key); }
  line(x0, y0, x1, y1, key, thick = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      for (let t = 0; t < thick; t++) this.px(x0, y0 + t, key);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  ellipse(cx, cy, rx, ry, key, fill = true) {
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
        if (fill ? d <= 1 : d <= 1 && d > (1 - 1.6 / Math.min(rx, ry)) ** 2) this.px(x, y, key);
      }
  }
  poly(pts, key) {
    let miny = Infinity, maxy = -Infinity;
    for (const [, y] of pts) { miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
    for (let y = Math.floor(miny); y <= Math.ceil(maxy); y++) {
      const cy = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= cy && by > cy) || (by <= cy && ay > cy)) xs.push(ax + ((cy - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) this.px(x, y, key);
    }
  }
  // Checker/ordered dither of `key` over a rect (density 0..1, 4x4 Bayer).
  dither(x, y, w, h, key, density = 0.5, test = null) {
    const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
      if (B[(j & 3) * 4 + (i & 3)] / 16 < density && (!test || test(i, j))) this.px(i, j, key);
    }
  }
  // Only paint where the current pixel is `onKey`.
  recolor(x, y, w, h, onKey, key) {
    const a = this.c(onKey), b = this.c(key);
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.get(i, j) === a) this.px(i, j, b);
  }
  text(str, x, y, key, opts = {}) {
    const v = this.c(key);
    const shim = { px: (X, Y, c) => this.px(X, Y, c) }; // (arena signs are scenery, clipped on purpose: the text-fit audit only reads text drawn on the frame itself)
    const shadow = opts.shadow !== undefined ? this.c(opts.shadow) : undefined;
    return fontText(shim, str, x, y, v, { ...opts, shadow });
  }
  stamp(rows, x, y, map) {
    rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const k = map[row[i]]; if (k) this.px(x + i, y + j, k); } });
  }
}

// Tiny seeded RNG so arenas are identical every load.
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

export class Arena {
  constructor(def) {
    this.def = def;
    this.pal = bgPalette(def.palettes);
    this.live = new Uint32Array(this.pal.u32); // palette after animation
    this.back = new IndexCanvas(this.pal);
    def.paintBack(this.back);
    this.ring = new IndexCanvas(this.pal);
    def.paintRing(this.ring);
    this.crowd = def.crowd ? buildCrowd(def.crowd, this.pal) : [];
    this.t = 0;
    this.react = 0;       // frames of crowd reaction left
    this.reactBig = false;
    this.state = {};      // free-form state for the arena's own animations
  }

  // kind: 'star' | 'knockdown' | 'ko' | 'hit'
  reaction(kind) {
    const big = kind === 'knockdown' || kind === 'ko';
    this.react = Math.max(this.react, big ? 150 : kind === 'star' ? 70 : 24);
    this.reactBig = this.reactBig || big;
    if (this.def.onReaction) this.def.onReaction(kind, this.state);
  }

  update() {
    this.t++;
    if (this.react > 0 && --this.react === 0) this.reactBig = false;
    this.live.set(this.pal.u32);
    if (this.def.paletteAnim) this.def.paletteAnim(this.t, this.live, this.pal, this.state, this);
  }

  // Draw everything behind the fighters.
  draw(frame) {
    frame.blitIndexed(this.back.data, this.live);
    const t = this.t;
    for (const sp of this.crowd) {
      let f = 0, dy = 0;
      const phase = (t + sp.phase) % sp.period;
      if (this.react > 0 && sp.excitable) {
        f = 1;
        dy = ((t >> 3) + sp.seat) & 1 ? -1 : 0;
        if (this.reactBig) dy = ((t >> 2) + sp.seat) & 1 ? -2 : 0;
      } else if (phase < sp.period * 0.18) dy = 1; // idle bob / shuffle
      else if (sp.fidget && phase > sp.period * 0.8) f = 2;
      frame.blit(sp.frames[f], sp.x, sp.y + dy, this.live);
    }
    frame.blitIndexed(this.ring.data, this.live);
    if (this.def.overlay) this.def.overlay(frame, this, t, this.state);
  }
}

// --- crowd -----------------------------------------------------------------
// Spectator templates: o outline, h hair, s skin, S skin shade, t shirt, T shirt shade.
// frame 0 idle, 1 cheering (arms up), 2 fidget (one hand to face / clap)
const SEATED = [
  [
    '...oooo...',
    '..ohhhho..',
    '.ohhhhhho.',
    '.ohsssssho',
    '.osSsSsso.',
    '..osssso..',
    '...oSSo...',
    '.oottttoo.',
    'otttttttto',
    'otTttttTto',
    'osTttttTso',
    'osottttoso',
    '.otttttto.',
  ],
  [
    'so......so',
    'so.oooo.so',
    'soohhhhoso',
    'sohhhhhhso',
    'sohsssssho',
    'sosSsSssso',
    '.o.osssso.',
    '.o..oSSo..',
    '.ooottttoo',
    '.otttttttto',
    '.otTttttTto',
    '..oTttttTo.',
    '..otttttto.',
  ],
  [
    '...oooo...',
    '..ohhhho..',
    '.ohhhhhho.',
    '.ohsssssho',
    '.osSsSsso.',
    '..osssso..',
    '...oSSo...',
    '.oottttoo.',
    'otttoosstto',
    'otTosssoTto',
    'otTtoootTto',
    'ottttttttto',
    '.otttttto.',
  ],
];

function buildCrowd(C, pal) {
  const R = rng(C.seed || 7);
  const out = [];
  for (const row of C.rows) {
    let seat = 0;
    for (let x = row.x0; x <= row.x1; x += row.spacing) {
      seat++;
      if (R() > C.density) continue;
      if (row.skip && row.skip.some(([a, b]) => x >= a && x <= b)) continue;
      const skin = C.skins[Math.floor(R() * C.skins.length)];
      const hair = C.hairs[Math.floor(R() * C.hairs.length)];
      const shirt = C.shirts[Math.floor(R() * C.shirts.length)];
      const map = {
        o: pal.idx(C.outline), h: pal.idx(hair), s: pal.idx(skin[0]), S: pal.idx(skin[1]),
        t: pal.idx(shirt[0]), T: pal.idx(shirt[1]),
      };
      const frames = SEATED.map((rows) => {
        const w = Math.max(...rows.map((r) => r.length));
        const data = new Uint8Array(w * rows.length);
        rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) data[j * w + i] = map[r[i]] || 0; });
        return { w, h: rows.length, data, ax: Math.floor(w / 2), ay: rows.length - 1 };
      });
      out.push({
        x: x + Math.round((R() - 0.5) * 2), y: row.y, frames, seat,
        phase: Math.floor(R() * 200), period: 90 + Math.floor(R() * 140),
        excitable: R() < (C.excitable ?? 0.85), fidget: R() < 0.4,
      });
    }
  }
  return out;
}
