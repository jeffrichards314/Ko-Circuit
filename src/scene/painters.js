// Backdrop painters (spec §19 G1): named layers a scene's data lists, drawn back to front in world
// coordinates. A layer is `{ p: 'name', ...options, par }`; `par` is its parallax against the camera
// (1 = moves with the world, 0 = fixed to the screen). Every painter writes palette colours only: bands,
// stepped shapes and Bayer dither, never blending (§2).
import { layout, drawLabel } from '../engine/textbox.js';
import { c32 } from '../engine/palette.js';
import { W, H } from '../engine/renderer.js';
import { Arena } from '../engine/arena.js';
import { ARENAS } from '../../data/arenas/index.js';
import { LANDMARKS } from './landmarks/index.js';
import { Gfx, bayer } from './gfx.js';
import { COL } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered } from '../engine/font.js';
import { beltSprite } from './belts.js';
import { CIRCUITS, SHORT } from '../../data/circuits.js';
import { playerPortrait, PORTRAITS } from '../../data/sprites/portraits.js';
import { frontPalette, hairStyleOf, nicknameOf } from '../../data/customization.js';
import { paletteFor } from '../engine/spriteCache.js';
import { FIGHTERS } from '../../data/fighters/index.js';

const cc = new Map();
export const C = (r, g, b) => { const k = (r << 10) | (g << 5) | b; let v = cc.get(k); if (v === undefined) { v = c32(r, g, b); cc.set(k, v); } return v; };
const col = (a) => (typeof a === 'number' ? a : C(a[0], a[1], a[2]));
const rnd = (seed) => { let s = (seed * 9301 + 49297) % 233280; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
const disc = (f, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); f.rect(cx - w, cy + y, w * 2 + 1, 1, c); } };

// time-of-day skies: six bands, top to horizon
// the colours of a road's verge: [ground, speck]
export const VERGES = {
  grass: [[6, 13, 6], [10, 18, 8]], rock: [[11, 10, 13], [17, 16, 19]], desert: [[19, 12, 6], [25, 18, 9]], sand: [[25, 21, 13], [29, 26, 17]],
  city: [[14, 14, 17], [19, 19, 22]], warp: [[9, 5, 14], [18, 7, 24]], snow: [[25, 27, 31], [30, 31, 31]], dark: [[3, 7, 5], [6, 11, 7]],
};
export const SKIES = {
  dawn: [[8, 7, 18], [14, 9, 21], [22, 12, 21], [29, 17, 16], [31, 23, 13], [31, 28, 17]],
  day: [[8, 16, 28], [10, 19, 30], [13, 22, 30], [17, 25, 31], [22, 28, 31], [27, 30, 31]],
  dusk: [[6, 5, 16], [11, 7, 21], [19, 10, 22], [26, 14, 18], [30, 20, 14], [31, 26, 17]],
  night: [[1, 1, 6], [2, 3, 10], [3, 5, 14], [5, 7, 18], [8, 9, 22], [11, 12, 25]],
  storm: [[3, 3, 6], [5, 5, 9], [7, 7, 12], [9, 10, 15], [11, 12, 17], [13, 14, 19]],
  gold: [[29, 24, 12], [31, 27, 15], [31, 29, 19], [31, 30, 23], [31, 31, 27], [31, 31, 30]],
  heaven: [[12, 16, 28], [16, 20, 30], [22, 24, 31], [27, 27, 31], [30, 29, 30], [31, 30, 27]],
  cloudtop: [[10, 12, 26], [15, 16, 29], [22, 20, 30], [28, 23, 28], [31, 27, 24], [31, 30, 22]],
  ash: [[3, 2, 4], [6, 3, 5], [10, 4, 6], [14, 5, 6], [18, 7, 6], [22, 9, 6]],
  hell: [[1, 0, 3], [3, 1, 5], [6, 2, 7], [10, 3, 8], [14, 4, 8], [20, 5, 8]],
  river: [[1, 2, 4], [2, 4, 8], [4, 7, 12], [7, 11, 17], [10, 15, 20], [14, 19, 24]],
  nightmare: [[3, 0, 6], [7, 1, 11], [12, 2, 15], [18, 3, 15], [24, 4, 12], [28, 8, 10]],
  void: [[0, 0, 1], [0, 0, 2], [1, 1, 3], [2, 2, 5], [3, 3, 7], [4, 4, 9]],
  white: [[31, 31, 31], [31, 31, 31], [30, 30, 31], [29, 29, 31], [28, 28, 31], [27, 27, 31]],
  indoor: [[3, 3, 8], [4, 4, 10], [5, 5, 12], [6, 6, 14], [7, 7, 16], [8, 8, 18]],
};

// full-screen dither toward a colour (density 0..1): fades, vignettes, night
export function veil(f, colr, density, y0 = 0, y1 = H) {
  if (density <= 0) return;
  if (density >= 1) { f.rect(0, y0, W, y1 - y0, colr); return; }
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) if (bayer(x, y) < density) f.px(x, y, colr);
}

export const PAINTERS = {
  // a flat colour
  fill(f, L) { f.rect(0, 0, W, H, col(L.color)); },

  // banded sky, optional stars and a dithered blend between bands. { tone, h (default 132) }
  sky(f, L, S) {
    const B = SKIES[L.tone || 'dusk'], h = L.h || 132, n = B.length, bh = Math.ceil(h / n);
    B.forEach((c, i) => f.rect(0, i * bh, W, bh + 1, col(c)));
    for (let i = 1; i < n; i++) for (let y = i * bh - 5; y < i * bh; y++) for (let x = (y & 1); x < W; x += 2) f.px(x, y, col(B[i - 1]));
    if (L.stars) {
      const R = rnd(L.seed || 5);
      for (let i = 0; i < (L.stars === true ? 46 : L.stars); i++) { const x = Math.floor(R() * W), y = Math.floor(R() * h * 0.8), tw = ((S.t >> 4) + i) % 9 === 0; f.px(x, y, tw ? C(31, 31, 31) : C(20, 22, 30)); }
    }
  },
  sun(f, L, S) { const x = Math.round(L.x - S.cam.x * (L.par ?? 0.05)), y = L.y; disc(f, x, y, L.r || 18, col(L.color || [31, 29, 16])); disc(f, x, y, Math.round((L.r || 18) * 0.6), col(L.hi || [31, 31, 25])); },
  moon(f, L, S) { const x = Math.round(L.x - S.cam.x * (L.par ?? 0.05)), y = L.y, r = L.r || 10; disc(f, x, y, r, C(29, 29, 27)); disc(f, x + 3, y - 2, Math.round(r * 0.8), C(31, 31, 30)); f.px(x - 3, y + 2, C(22, 22, 24)); f.px(x - 1, y - 3, C(22, 22, 24)); },

  // a silhouette of rolling hills. { color, base (bottom y), top (highest y), scale, par, seed }
  hills(f, L, S) {
    const par = L.par ?? 0.2, o = S.cam.x * par, c = col(L.color), sc = L.scale || 0.03;
    for (let x = 0; x < W; x++) {
      const X = x + o + (L.seed || 0) * 97;
      const hgt = Math.round((L.top ?? 100) + Math.sin(X * sc) * (L.amp ?? 6) + Math.sin(X * sc * 2.4 + 1.3) * ((L.amp ?? 6) * 0.6));
      f.rect(x, hgt, 1, (L.base ?? 132) - hgt, c);
    }
  },
  // a skyline of towers. { color, lite (window colour), base, par, seed, minH, maxH }
  city(f, L, S) {
    const par = L.par ?? 0.35, o = S.cam.x * par, c = col(L.color), lite = L.lite ? col(L.lite) : null, R = rnd(L.seed || 3);
    const cell = L.cell || 30, n = Math.ceil((W + cell * 2) / cell) + 2, first = Math.floor(o / cell) - 1;
    for (let i = first; i < first + n; i++) {
      const rr = rnd(i * 31 + (L.seed || 3)), w = 14 + Math.floor(rr() * 14), h = (L.minH || 20) + Math.floor(rr() * ((L.maxH || 60) - (L.minH || 20)));
      const x = Math.round(i * cell - o), y = (L.base ?? 132) - h;
      f.rect(x, y, w, h, c);
      if (lite) for (let yy = y + 4; yy < (L.base ?? 132) - 3; yy += 5) for (let xx = x + 3; xx < x + w - 3; xx += 4) if (((xx + yy + i) % 3) === 0) f.rect(xx, yy, 2, 2, lite);
      if (rr() < 0.3) f.rect(x + (w >> 1), y - 6, 1, 6, c);
    }
    void R;
  },
  // bare or leafy trees along a line. { color, hi, base, par, every, dead }
  trees(f, L, S) {
    const par = L.par ?? 0.6, o = S.cam.x * par, every = L.every || 46, first = Math.floor(o / every) - 1, c = col(L.color), hi = L.hi ? col(L.hi) : c;
    for (let i = first; i < first + Math.ceil(W / every) + 3; i++) {
      const rr = rnd(i * 17 + 5), x = Math.round(i * every + rr() * 20 - o), b = L.base ?? 130, h = 18 + Math.floor(rr() * 14);
      if (L.dead) { f.rect(x, b - h, 2, h, c); for (let k = 0; k < 3; k++) { f.rect(x - 4 + k, b - h + 4 + k * 5, 5, 1, c); f.rect(x + 2, b - h + 6 + k * 5, 5, 1, c); } }
      else if (L.pine) { f.rect(x + 1, b - 5, 2, 5, C(8, 5, 3)); for (let y = 0; y < h + 4; y++) { const w = Math.round((y / (h + 4)) * 6) + ((y % 6) > 3 ? 1 : 0); f.rect(x + 2 - w, b - 5 - (h + 4) + y, w * 2 + 1, 1, y < 4 ? hi : c); } }
      else if (L.palm) { for (let y = 0; y < h; y++) f.px(x + 2 + Math.round(Math.sin(y / 9) * 2), b - y, C(14, 9, 4)); for (const dx of [-7, -4, 0, 4, 7]) f.rect(x + 2 + Math.min(0, dx), b - h - Math.abs(dx) / 3, Math.abs(dx) + 2, 2, dx === 0 ? hi : c); }
      else { f.rect(x + 1, b - 8, 3, 8, C(8, 5, 3)); for (let y = -10; y <= 10; y++) { const w = Math.round(Math.sqrt(100 - y * y) * 0.85); f.rect(x + 2 - w, b - 16 + y * 0.8, w * 2, 1, y < -3 ? hi : c); } }
    }
  },

  // a landmark from the library. { id, x, base, k (default 3), par, dim, sil, lit }
  landmark(f, L, S) {
    const lm = LANDMARKS[L.id];
    if (!lm) return;
    const x = Math.round(L.x - S.cam.x * (L.par ?? 1)), y = Math.round(L.base - S.cam.y);
    const g = new Gfx(f, lm.pal, x, y, L.k || 3, S.t, { sil: L.sil != null ? col(L.sil) : null, lit: L.lit !== false });
    lm.draw(g);
    if (L.dim) veil(f, col(L.dimColor || [1, 1, 5]), L.dim, Math.max(0, y - 60 * (L.k || 3)), Math.min(H, y + 4));
  },

  // the ground: 'road' (grass, curb, asphalt with a moving line), 'grass', 'marble', 'stone', 'ash', 'planks', 'void'
  ground(f, L, S) {
    const o = Math.round(S.cam.x * (L.par ?? 1));
    const y0 = L.y ?? 128;
    switch (L.kind || 'road') {
      case 'road': {
        // the verge either side matches where the road runs (spec §19 G11): grass, the Highlands' rock, the Grand Prix's desert,
        // city pavement, the warped city's purple stone
        const V = VERGES[L.verge || 'grass'];
        f.rect(0, y0, W, 20, C(...V[0]));
        for (let x = 0; x < W; x += 4) f.px(x, y0 + (((x + o) * 7) & 7) % 6, C(...V[1]));
        if (L.verge === 'city') for (let x = -(((o % 16) + 16) % 16); x < W; x += 16) f.rect(x, y0, 1, 20, C(...V[1]));
        f.rect(0, y0 + 20, W, 4, C(18, 18, 20)); f.rect(0, y0 + 24, W, 48, C(9, 9, 12));
        f.rect(0, y0 + 72, W, 24, C(18, 18, 20)); f.rect(0, y0 + 74, W, 22, C(...V[0]));
        for (let x = 0; x < W; x += 5) f.px(x, y0 + 76 + (((x + o) * 5) & 7) % 16, C(...V[1]));
        for (let y = y0 + 26; y < y0 + 72; y += 3) for (let x = ((y * 7) % 5); x < W; x += 9) f.px(x, y, C(7, 7, 10));
        const s = ((o % 40) + 40) % 40;
        for (let x = -s; x < W; x += 40) f.rect(x, y0 + 48, 20, 2, C(28, 26, 16));
        break;
      }
      case 'grass': { f.rect(0, y0, W, H - y0, C(6, 13, 6)); for (let y = y0; y < H; y += 3) for (let x = ((y * 7) % 11); x < W; x += 11) f.px((x + 400 - o % 11 + 11) % W, y, C(10, 18, 8)); break; }
      case 'marble': {
        f.rect(0, y0, W, H - y0, L.tone === 'dark' ? C(19, 19, 22) : C(29, 28, 27));
        f.rect(0, y0, W, 3, C(31, 31, 30));
        f.rect(0, y0 + 3, W, 2, L.tone === 'dark' ? C(13, 13, 17) : C(21, 20, 22));
        for (let x = -(o % 64); x < W; x += 64) f.rect(x, y0 + 5, 1, H - y0, C(22, 22, 24));
        for (let y = y0 + 22; y < H; y += 22) f.rect(0, y, W, 1, C(22, 22, 24));
        break;
      }
      case 'stone': { f.rect(0, y0, W, H - y0, C(8, 7, 10)); f.rect(0, y0, W, 2, C(13, 12, 15)); for (let y = y0 + 12; y < H; y += 14) f.rect(0, y, W, 1, C(4, 3, 6)); for (let x = -(o % 40); x < W; x += 40) f.rect(x, y0 + 2, 1, H, C(4, 3, 6)); break; }
      case 'ash': { f.rect(0, y0, W, H - y0, C(9, 8, 9)); for (let x = 0; x < W; x += 3) f.px(x, y0 + ((x + o) * 5) % 9, C(15, 14, 14)); for (let i = 0; i < 5; i++) { const x = ((i * 61 - o) % 300 + 300) % 300 - 20; f.rect(x, y0 + 8 + i * 6, 14, 1, C(28, 10, 3)); } break; }
      case 'planks': { f.rect(0, y0, W, H - y0, C(8, 6, 6)); f.rect(0, y0, W, 2, C(14, 11, 10)); for (let x = -(o % 22); x < W; x += 22) f.rect(x, y0 + 2, 1, H, C(4, 3, 4)); break; }
      case 'canvas': { f.rect(0, y0, W, H - y0, C(20, 20, 24)); f.rect(0, y0, W, 2, C(28, 28, 31)); break; }
      case 'void': { f.rect(0, y0, W, 1, C(9, 9, 15)); break; }
      default: break;
    }
  },

  // water: a horizon, ripples sliding, fog resting on it. { y, tone: 'river' | 'void' }
  water(f, L, S) {
    const y0 = L.y ?? 126, o = S.cam.x * (L.par ?? 1), v = L.tone === 'void', t = S.t;
    f.rect(0, y0, W, H - y0, v ? C(0, 0, 1) : C(1, 3, 7));
    const hi = v ? C(11, 11, 17) : C(6, 11, 18);
    for (let y = y0 + 6; y < H; y += 4) for (let x = ((y * 7) % 13) - ((o * (0.4 + (y - y0) / 150)) % 13); x < W; x += 13) f.rect(Math.round(x), y, 3 + (y & 3), 1, hi);
    if (!v) for (let y = y0 - 2; y < y0 + 24; y++) for (let x = 0; x < W; x++) { const n = Math.sin((x + t * 0.3 + o) * 0.04 + y * 0.2) * 0.5 + 0.5; if (bayer(x, y) < (1 - (y - y0 + 2) / 26) * 0.5 * n) f.px(x, y, (x + y) & 3 ? C(9, 14, 19) : C(14, 20, 25)); }
  },
  // rows of heads, an arena's crowd seen from afar. { y, color, rows, seed }
  crowd(f, L, S) {
    const R = rnd(L.seed || 9), c = col(L.color || [3, 3, 8]), n = L.rows || 3;
    for (let r = 0; r < n; r++) for (let x = -4; x < W + 4; x += 6) { const yy = L.y + r * 6 + Math.round(Math.sin((S.t + x * 3 + r * 40) / 30) * (L.wave || 0.6)), xx = x + (r & 1) * 3; f.rect(xx, yy, 4, 5, c); f.rect(xx + 1, yy - 2, 2, 2, c); if (R() < 0.05) f.px(xx + 1, yy - 2, C(31, 31, 31)); }
  },
  stars(f, L, S) {
    const R = rnd(L.seed || 11), n = L.n || 60;
    for (let i = 0; i < n; i++) { const x = ((R() * W - S.cam.x * (L.par ?? 0.05)) % W + W) % W, y = R() * (L.h || H), b = R(); f.px(Math.floor(x), Math.floor(y), b > 0.85 ? C(28, 28, 31) : b > 0.5 ? C(16, 17, 24) : C(8, 9, 14)); if (b > 0.96 && ((S.t >> 3) + i) % 7 < 2) { f.px(Math.floor(x) + 1, Math.floor(y), C(20, 22, 30)); f.px(Math.floor(x) - 1, Math.floor(y), C(20, 22, 30)); } }
  },
  // drifting things: { kind: 'ember' | 'ash' | 'petal' | 'rain' | 'snow' | 'spark' | 'feather', n }
  drift(f, L, S) {
    const n = L.n || 20, t = S.t, kind = L.kind || 'ember', R = rnd(L.seed || 1);
    for (let i = 0; i < n; i++) {
      const bx = R() * W, by = R() * H, sp = 0.25 + R() * 0.7;
      let x, y, c;
      if (kind === 'ember') { x = bx + Math.sin((t + i * 9) / 24) * 3; y = ((by - t * sp * 1.1) % H + H) % H; c = y > 130 ? C(31, 14, 4) : C(31, 24, 9); }
      else if (kind === 'ash') { x = bx + Math.sin((t + i * 13) / 30) * 4; y = (by + t * sp * 0.6) % H; c = i % 3 ? C(16, 15, 16) : C(24, 23, 22); }
      else if (kind === 'petal') { x = (bx + t * sp * 0.5) % W; y = (by + t * sp * 0.7 + Math.sin((t + i * 7) / 20) * 4) % H; c = C(31, 20, 16); }
      else if (kind === 'rain') { x = (bx - t * 1.2 + H) % W; y = (by + t * 6 * sp + i * 5) % H; c = C(14, 18, 27); f.px(Math.floor(x + 1), Math.floor(y - 2), c); }
      else if (kind === 'snow') { x = bx + Math.sin((t + i * 7) / 25) * 4; y = (by + t * sp * 0.5) % H; c = C(27, 28, 31); }
      else if (kind === 'feather') { x = (bx + t * sp * 0.35) % W; y = (by + t * sp * 0.55) % H; c = C(31, 29, 22); f.px(Math.floor(x) + 1, Math.floor(y), c); }
      else if (kind === 'dust') { x = (bx + t * sp * 0.3) % W; y = ((by - t * sp * 0.2) % H + H) % H; c = C(20, 21, 26); }
      else { x = bx; y = (by - t * sp) % H; c = C(31, 31, 22); }
      f.px(Math.floor(x), Math.floor(((y % H) + H) % H), c);
    }
  },
  fog(f, L, S) { const y0 = L.y ?? 150, c = col(L.color || [10, 15, 20]), c2 = col(L.hi || [14, 20, 25]); for (let y = y0; y < y0 + (L.h || 30); y++) for (let x = 0; x < W; x++) { const n = Math.sin((x + S.t * 0.3 + S.cam.x * 0.5) * 0.04 + y * 0.2) * 0.5 + 0.5; if (bayer(x, y) < (1 - (y - y0) / (L.h || 30)) * (L.density ?? 0.5) * n) f.px(x, y, (x + y) & 3 ? c : c2); } },
  vignette(f, L) { const c = col(L.color || [1, 1, 3]), k = L.k ?? 0.55; for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) { const dx = (x - 128) / 128, dy = (y - 112) / 112, d = dx * dx + dy * dy; if (bayer(x, y) < Math.max(0, d - (L.from ?? 0.5)) * k) f.px(x, y, c); } },
  // a stepped cone of light from the top: { x, color, w0, spread }
  spot(f, L, S) {
    const x0 = L.x - S.cam.x * (L.par ?? 0), c = col(L.color || [8, 9, 16]);
    for (let y = L.y || 0; y < (L.h || H); y++) { const w = (L.w0 || 12) + (y - (L.y || 0)) * (L.spread || 0.4); for (let x = -w; x <= w; x++) if (bayer(Math.round(x0 + x), y) < 0.55 * (1 - Math.abs(x) / w) + 0.2) f.px(Math.round(x0 + x), y, c); }
  },
  // the game's own arena (ring, ropes, crowd), animated. { id, dim, dimColor }
  arena(f, L, S) {
    const A = S.arenaFor(L.id);
    A.update();
    A.draw(f);
    if (L.dim) veil(f, col(L.dimColor || [0, 0, 2]), L.dim);
  },
  confetti(f, L, S) {
    const R = rnd(L.seed || 4), cols = [[31, 27, 6], [28, 6, 8], [6, 26, 30], [8, 26, 10], [30, 14, 26], [31, 31, 31], [31, 18, 4]];
    for (let i = 0; i < (L.n || 70); i++) { const x = R() * W + Math.sin((S.t + i * 5) * 0.05) * 6, y = ((R() * H + S.t * (0.6 + R() * 0.9)) % (H + 20)) - 10; f.rect(Math.round(x), Math.round(y), R() < 0.5 ? 2 : 1, 2, col(cols[i % cols.length])); }
  },
  // fireworks bursts over a skyline: { n, y }
  fireworks(f, L, S) {
    const cols = [[31, 28, 10], [31, 10, 14], [10, 26, 31], [10, 31, 14], [31, 20, 31]];
    for (let b = 0; b < (L.n || 3); b++) {
      const ph = (S.t + b * 61) % 150, cx = 40 + ((b * 83 + Math.floor((S.t + b * 61) / 150) * 47) % 176), cy = (L.y || 40) + ((b * 29) % 30), k = cols[(b + Math.floor((S.t + b * 61) / 150)) % cols.length];
      if (ph < 44) for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = ph * 0.9; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r + ph * ph * 0.008; f.px(Math.round(x), Math.round(y), ph > 30 && i & 1 ? C(31, 31, 22) : col(k)); if (ph < 30) f.px(Math.round(x - Math.cos(a) * 2), Math.round(y - Math.sin(a) * 2), col(k)); }
      else if (ph < 56) f.px(cx, cy + 66 - ph, C(31, 30, 18));
    }
  },
  // camera flashes in the dark: { n }
  flashes(f, L, S) { const R = rnd(L.seed || 6); for (let i = 0; i < (L.n || 14); i++) { const x = Math.floor(R() * W), y = L.y + Math.floor(R() * (L.h || 60)); if (((S.t >> 1) + i * 11) % 37 === 0) { f.rect(x, y, 3, 3, C(31, 31, 31)); f.rect(x - 1, y + 1, 5, 1, C(31, 31, 31)); } } },
  // a beam of light between two points, stepped: { x0, y0, x1, y1, color }
  beam(f, L, S) {
    const o = S.cam.x * (L.par ?? 1), c = col(L.color || [26, 28, 31]), n = 90;
    for (let i = 0; i <= n; i++) { const x = Math.round(L.x0 - o + ((L.x1 - L.x0) * i) / n + (L.sway ? Math.sin(S.t / (L.sway)) * i * 0.4 : 0)), y = Math.round(L.y0 + ((L.y1 - L.y0) * i) / n); f.rect(x, y, 2, 1, c); }
  },
  // a tiled row of pillars: { x, y, n, gap, w, h, color, par }
  columns(f, L, S) {
    const o = S.cam.x * (L.par ?? 1), c = col(L.color || [26, 26, 28]), sh = col(L.shade || [16, 16, 20]);
    for (let i = 0; i < (L.n || 6); i++) { const x = Math.round(L.x + i * (L.gap || 48) - o); f.rect(x, L.y - (L.h || 80), L.w || 12, L.h || 80, c); f.rect(x + (L.w || 12) - 3, L.y - (L.h || 80), 3, L.h || 80, sh); f.rect(x - 2, L.y - (L.h || 80) - 3, (L.w || 12) + 4, 3, c); f.rect(x - 2, L.y - 3, (L.w || 12) + 4, 3, sh); }
  },
  // the ring canvas seen from the front: a raised platform and ropes. { y, x0, x1 }
  ringfront(f, L, S) {
    const o = S.cam.x * (L.par ?? 1), x0 = Math.round(L.x0 - o), x1 = Math.round(L.x1 - o);
    f.rect(x0, L.y, x1 - x0, 8, C(22, 22, 27)); f.rect(x0, L.y, x1 - x0, 2, C(31, 31, 31)); f.rect(x0, L.y + 6, x1 - x0, 2, C(13, 13, 18));
    for (const x of [x0, x1 - 4]) f.rect(x, L.y - 40, 4, 44, C(18, 18, 24));
    for (let i = 0; i < 3; i++) f.rect(x0, L.y - 14 - i * 12, x1 - x0, 2, C(28, 6, 8));
  },
};

// ---- the belt card of a victory ceremony (the classic layout of §5: NEW / name / portrait / belt / CHAMPION) ----------------
const memo = new Map();
const once = (k, make) => { if (!memo.has(k)) memo.set(k, make()); return memo.get(k); };
PAINTERS.ceremony = (f, L, S) => {
  const ctx = S.ctx, id = ctx.circuit, t = S.t - (L.t0 || 0), p = ctx.profile, replay = ctx.flags.replay;
  f.rect(0, 0, W, H, COL.black);
  const tint = L.tint || [3, 4, 8];
  // the spotlight: a stepped cone, in the circuit's own tint
  [[tint[0], tint[1], tint[2]], [tint[0] + 2, tint[1] + 2, tint[2] + 4], [tint[0] + 5, tint[1] + 5, tint[2] + 8]].forEach((c, i) => { for (let y = 0; y < H; y++) { const w = 30 + y * (0.45 - i * 0.12); f.rect(Math.round(128 - w), y, Math.round(w * 2), 1, C(Math.min(31, c[0]), Math.min(31, c[1]), Math.min(31, c[2]))); } });
  drawTextCentered(f, replay ? 'TITLE RECLAIMED' : 'NEW', 128, 8, replay ? COL.cyan : COL.white);
  const [nm, place] = CIRCUITS[id].name.split(': ');
  if (place) { drawTextBig(f, nm, 128, 16, COL.yellow, COL.black, 2); drawTextCentered(f, place, 128, 33, COL.orange, { mono: false }); }
  else drawTextBig(f, nm, 128, 20, COL.yellow, COL.black, Math.max(1, Math.min(2, Math.floor(236 / Math.max(1, nm.length * 8)))));
  const fp = once('fp' + JSON.stringify(p), () => frontPalette(p));
  const portrait = once('pp' + JSON.stringify(p), () => playerPortrait(fp, hairStyleOf(p)));
  f.rect(93, 42, 70, 66, COL.white); f.rect(95, 44, 66, 62, C(9, 24, 12));
  f.blit(portrait, 96, 46, fp.u32);
  const B = once('belt' + id, () => beltSprite(id));
  f.blit(B.sprite, 38, 114 - ((t >> 4) & 1), B.pal);
  drawTextCentered(f, replay ? 'STILL THE CHAMPION' : 'CHAMPION', 128, 176, (t >> 3) & 1 ? COL.yellow : COL.orange);
  if (ctx.params.unlocked) drawTextCentered(f, `SECRET UNLOCKED: THE ${SHORT[ctx.params.unlocked]}!`, 128, 199, (t >> 3) & 1 ? COL.cyan : COL.white, { mono: false });
  drawTextCentered(f, `${p.name} "${nicknameOf(p)}"`, 128, 190, COL.white, { mono: false });
  // confetti in the circuit's colours, falling: a deterministic function of the time
  const cols = L.confetti || [[31, 27, 6], [28, 6, 8], [6, 26, 30], [8, 26, 10], [30, 14, 26], [31, 31, 31], [31, 18, 4]], R = rnd(99);
  for (let i = 0; i < 70; i++) { const x0 = R() * W, y0 = -R() * H, v = 0.5 + R(), c = cols[Math.floor(R() * cols.length)], w = R() < 0.5 ? 2 : 1; const y = ((y0 + t * v) % (H + 16)) - 8, x = x0 + Math.sin((t + y) * 0.05) * 6; f.rect(Math.round(x), Math.round(y), w, 2, col(c)); }
  if (L.press && t > (L.pressAt || 90) && (t >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 208, COL.grey);
};

// a low podium with a step at each side: the player stands on the middle. { y, w }
PAINTERS.podium = (f, L, S) => {
  const x = Math.round((L.x ?? 128) - S.cam.x), y = L.y ?? 196, w = L.w || 64;
  const gold = L.gold ? [[31, 26, 8], [24, 16, 3], [14, 8, 1]] : [[31, 31, 31], [22, 22, 26], [12, 12, 17]];
  f.rect(x - w, y + 8, w * 2, H - y - 8, col(gold[1]));
  f.rect(x - w, y + 8, w * 2, 2, col(gold[0])); f.rect(x - w, y + 10, w * 2, 2, col(gold[2]));
  f.rect(x - (w >> 1), y, w, 8, col(gold[1])); f.rect(x - (w >> 1), y, w, 2, col(gold[0])); f.rect(x - (w >> 1), y + 6, w, 2, col(gold[2]));
  for (let i = -w + 6; i < w; i += 14) f.rect(x + i, y + 14, 1, 10, col(gold[2]));
};

// a fighter's portrait, large, for a close-up: { id, cx, y (top), k (scale), kTo + grow (frames): the camera pushes in }
PAINTERS.face = (f, L, S) => {
  const d = FIGHTERS[L.id], pal = once('facepal' + d.palette, () => paletteFor(d.palette));
  const spr = once('face' + L.id, () => (PORTRAITS[L.id] || PORTRAITS.barney)(pal));
  const k = (L.k ?? 3) + (L.grow ? Math.min(1, Math.max(0, (S.t - (L.t0 || 0)) / L.grow)) * ((L.kTo ?? L.k) - (L.k ?? 3)) : 0);
  const w = spr.w * k;
  f.blit(spr, Math.round((L.cx ?? 128) - w / 2 + spr.ax * k), Math.round((L.y ?? 0) + spr.ay * k), pal.u32, { scale: k });
  if (L.frame) f.frameRect(Math.round((L.cx ?? 128) - w / 2) - 1, Math.round(L.y ?? 0) - 1, Math.round(w) + 2, Math.round(spr.h * k) + 2, col(L.frame));
};

// two glowing eyes in the dark: { x, y, gap, w, h, color, glow }
PAINTERS.eyes = (f, L, S) => {
  const on = L.blinkEvery ? (S.t % L.blinkEvery) > 6 : true;
  if (!on) return;
  const c = col(L.color || [31, 6, 4]), gap = L.gap || 20, w = L.w || 8, h = L.h || 3;
  for (const s of [-1, 1]) { const x = Math.round(L.x + s * gap / 2 - w / 2); f.rect(x, L.y, w, h, c); f.rect(x + 1, L.y - 1, w - 2, 1, c); f.rect(x + (s < 0 ? w - 3 : 0), L.y + 1, 3, 1, C(31, 24, 16)); if (L.glow) for (let j = -6; j <= 8; j++) for (let i = -8; i <= w + 8; i++) { const d = Math.hypot((i - w / 2) / 10, (j - 1) / 7); if (d < 1 && bayer(x + i, L.y + j) < (1 - d) * 0.5 && !(i >= 0 && i < w && j >= 0 && j < h)) f.px(x + i, L.y + j, col(L.glowColor || [14, 2, 4])); } }
};
// a glitch: horizontal bands of the picture already drawn slide sideways; { amp, bands, every }
PAINTERS.glitch = (f, L, S) => {
  const on = (S.t % (L.every || 40)) < (L.len || 8);
  if (!on) return;
  const R = rnd((S.t >> 1) + 3), n = L.bands || 5, amp = L.amp || 10;
  for (let b = 0; b < n; b++) {
    const y = Math.floor(R() * (H - 20)), h = 2 + Math.floor(R() * 12), dx = Math.round((R() - 0.5) * 2 * amp);
    for (let j = y; j < y + h; j++) { const row = f.buf.slice(j * W, j * W + W); for (let x = 0; x < W; x++) f.buf[j * W + x] = row[((x - dx) % W + W) % W]; }
  }
};
// stepped rays from a point: { x, y, n, len, color }
PAINTERS.rays = (f, L, S) => {
  const c = col(L.color || [31, 30, 18]), c2 = col(L.color2 || [31, 27, 8]), n = L.n || 14;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + S.t * (L.spin ?? 0.004); for (let r = (L.r0 || 20); r < (L.len || 150); r += 2) { const x = Math.round(L.x + Math.cos(a) * r), y = Math.round(L.y + Math.sin(a) * r); if (x < 0 || y < 0 || x >= W || y >= H) break; if (((r >> 1) + i + (S.t >> 2)) % 5 < 3) f.px(x, y, i & 1 ? c : c2); } }
};
// a growing hole (or disc) of one colour: { x, y, r, color }
PAINTERS.hole = (f, L) => { disc(f, L.x, L.y, Math.round(L.r), col(L.color || [0, 0, 1])); };

// a door in a wall, light leaking under it: { x (centre), y (top), w, h, wood, light, wall }
PAINTERS.door = (f, L, S) => {
  const x = Math.round(L.x - S.cam.x), w = L.w || 70, h = L.h || 120, y = L.y || 30, wood = col(L.wood || [14, 9, 5]), hi = col(L.woodHi || [20, 14, 8]), sh = col(L.woodSh || [8, 5, 3]);
  f.rect(0, 0, W, y + h + 6, col(L.wall || [5, 4, 10]));
  f.rect(x - w / 2 - 5, y - 5, w + 10, h + 5, sh); f.rect(x - w / 2, y, w, h, wood);
  f.rect(x - w / 2, y, w, 2, hi); f.rect(x - w / 2, y, 2, h, hi);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { f.rect(x - w / 2 + 6 + i * (w / 2 - 3), y + 8 + j * (h / 2 - 4), w / 2 - 15, h / 2 - 16, sh); f.rect(x - w / 2 + 8 + i * (w / 2 - 3), y + 10 + j * (h / 2 - 4), w / 2 - 19, h / 2 - 20, wood); }
  f.rect(x + w / 2 - 12, y + h / 2, 5, 5, C(26, 20, 6)); f.px(x + w / 2 - 11, y + h / 2, C(31, 30, 18));
  // the light under it, spilling on the floor
  const lc = col(L.light || [31, 26, 10]), gy = y + h;
  f.rect(x - w / 2 + 2, gy - 2, w - 4, 3, lc);
  for (let j = 0; j < 22; j++) for (let i = -w / 2 - 6 + j; i < w / 2 + 6 - j; i++) if (bayer(x + i, gy + 2 + j) < 0.6 * (1 - j / 22)) f.px(x + i, gy + 2 + j, lc);
};
// a sheet of paper with a letter typed onto it: { lines, paper, ink, border, w, y, speed }
PAINTERS.paper = (f, L, S) => {
  const t = S.t - (L.t0 || 0), w = L.w || 224, x = Math.round(128 - w / 2), y = L.y ?? 14, h = L.h || 196;
  f.rect(x - 2, y - 2, w + 4, h + 4, C(2, 1, 3)); f.rect(x, y, w, h, col(L.paper || [31, 29, 22]));
  f.frameRect(x + 3, y + 3, w - 6, h - 6, col(L.border || [24, 20, 12]));
  let n = Math.floor(t * (L.speed || 1.1));
  // the letter's lines as written, any too wide for the paper wrapped onto the next (the shared text layout)
  const lines = (L.lines || []).flatMap((line) => (line ? layout(line, w - 24) : ['']));
  lines.forEach((line, i) => { if (n <= 0) return; const txt = line.slice(0, n); n -= line.length + 3; if (line) drawText(f, txt, x + 12, y + 14 + i * 12, col(L.ink || [5, 3, 6]), { mono: false }); });
  if (L.seal) { const sx = x + w - 34, sy = y + h - 34; disc(f, sx, sy, 12, col(L.seal)); disc(f, sx, sy, 8, col(L.sealHi || L.seal)); if (L.eye) { f.rect(sx - 6, sy - 1, 12, 3, C(31, 31, 31)); f.rect(sx - 2, sy - 2, 4, 5, C(28, 3, 10)); } }
};

// telephone poles and their wire along the road (the jogging scene): { y (top of the poles), every }
PAINTERS.poles = (f, L, S) => {
  const o = Math.round(S.cam.x * (L.par ?? 1)), s3 = ((o % 96) + 96) % 96;
  for (let x = -s3; x < W; x += 96) { f.rect(x + 40, 70, 4, 76, C(14, 9, 5)); f.rect(x + 40, 70, 1, 76, C(20, 14, 8)); f.rect(x + 32, 76, 20, 3, C(14, 9, 5)); }
  for (let x = 0; x < W; x++) { const X = (x + s3) % 96; f.px(x, 78 + Math.round(((X - 48) / 48) ** 2 * 6), C(5, 4, 6)); }
};
// a line of text fixed to the screen: { text, x, y, color }
PAINTERS.label = (f, L) => { drawLabel(f, L.text, L.x ?? 8, L.y ?? 212, 248 - (L.x ?? 8), L.color ? col(L.color) : COL.white, { mono: false, where: 'scene label' }); };
PAINTERS.legacy = (f, L, S) => { const H = S.host(L.screen); H.screen.render(f); };

// the painters that need the arena cache live on the scene: see engine.js (S.arenaFor)
export const arenaCache = new Map();
export function arenaFor(id) {
  if (!arenaCache.has(id)) arenaCache.set(id, new Arena(ARENAS[id]));
  return arenaCache.get(id);
}
