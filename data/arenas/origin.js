// THE BEGINNING (2026-10-04, ORIGIN's arena): a ring floating at the centre of the world in a sky of gold light, with fragments of every arena in the game drifting
// around it. The twelve arenas of ORIGIN's styles (data/fighters/origin/styles.js) float in two columns beside the ring: each lights up (a white rim, a halo,
// a beam of its colour) while he uses a move tied to that place (the fight writes `state.lit[circuit]` frames: src/fight/asc/origin.js). The others of the
// game's thirty-odd arenas drift far above in a slow turning ring, small. Each fragment is tinted with its circuit's belt (src/scene/belts.js).
//   origin       the Gauntlet's: the fragments drift
//   originTrue   the Title Defense's TRUE FORM: the light is white-gold and the fragments COLLIDE: the two columns swing together, meet at the sides of the ring
//                with a flash and a shower of pieces, and spring apart again
// (`state.round` is unused; a knockdown flashes the whole sky.)
import { makePalette } from '../../src/engine/palette.js';
import { BELTS } from '../../src/scene/belts.js';
import { STYLES } from '../fighters/origin/styles.js';

const sky = (n, gold) => makePalette(n + '.sky', gold
  ? { black: [3, 2, 1], g0: [10, 6, 2], g1: [18, 11, 3], g2: [25, 17, 5], g3: [29, 23, 9], g4: [31, 28, 15], g5: [31, 31, 24], white: [31, 31, 31], ray: [31, 29, 12], rayHi: [31, 31, 22], star: [31, 31, 28], flash: [31, 31, 31], hot: [31, 20, 4], hotHi: [31, 26, 8] }
  : { black: [2, 1, 5], g0: [8, 4, 11], g1: [16, 9, 10], g2: [24, 15, 8], g3: [28, 21, 8], g4: [31, 26, 12], g5: [31, 30, 21], white: [31, 31, 31], ray: [31, 28, 14], rayHi: [31, 31, 22], star: [31, 31, 28], flash: [31, 31, 31], hot: [31, 20, 4], hotHi: [31, 26, 8] });
const ringP = (n) => makePalette(n + '.ring', {
  slabHi: [31, 30, 22], slab: [27, 22, 10], slabSh: [18, 12, 5], slabDk: [8, 4, 2], rope: [31, 31, 26], ropeS: [26, 20, 8], postHi: [31, 31, 31], post: [28, 24, 12], postDk: [14, 9, 3],
  edge: [31, 31, 31], shadow: [6, 3, 2], apron: [20, 14, 6], crack: [4, 2, 1],
});
// the fragments' colours: seven hue families, a light and a dark of each (a fragment takes the nearest to its belt)
const FAM = [['R', [31, 8, 6]], ['O', [31, 18, 3]], ['Y', [31, 29, 6]], ['G', [6, 26, 8]], ['C', [4, 26, 31]], ['B', [8, 8, 30]], ['V', [24, 6, 30]]];
const fragP = (n) => makePalette(n + '.frag', Object.fromEntries(FAM.flatMap(([k, [r, g, b]]) => [['f' + k, [r, g, b]], ['f' + k + 'd', [r >> 1, g >> 1, b >> 1]]])));
const nearest = ([r, g, b]) => { let best = FAM[0][0], bd = 1e9; for (const [k, c] of FAM) { const d = (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2; if (d < bd) { bd = d; best = k; } } return best; };
const familyOf = (circuit) => { const B = BELTS[circuit]; return nearest(B ? B.strap[1] : [20, 14, 4]); };
const rng = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

// the far fragments: every belt of the game that is not one of the twelve styles' (small, slow, turning round the whole picture)
const STYLE_CIRCUITS = STYLES.map((s) => s.circuit);
const FAR = Object.keys(BELTS).filter((c) => !STYLE_CIRCUITS.includes(c)).map((c, i, a) => ({ c, fam: familyOf(c), a0: (i / a.length) * Math.PI * 2, ry: 8 + (i % 4) * 5, w: 4 + (i % 3) * 2, s: 0.0016 + (i % 5) * 0.0004 }));
// the near fragments: the twelve of the styles, six down each side of the ring
const NEAR = STYLES.map((s, i) => ({ c: s.circuit, fam: familyOf(s.circuit), side: i < 6 ? -1 : 1, row: i % 6, w: 12 + ((i * 5) % 6), h: 4 + (i % 3), ph: i * 1.7 }));

// one floating slab of an arena: a lit top face, a darker front, a shard hanging under it; `lit` 0..1 (a white rim, a halo, a beam of its colour)
function slab(frame, arena, x, y, w, h, fam, lit, t) {
  const col = (k) => arena.live[arena.pal.idx(k)];
  const hi = col('f' + fam), lo = col('f' + fam + 'd'), white = col('white');
  x = Math.round(x); y = Math.round(y);
  if (lit > 0.05) {
    // a beam of its colour straight up, and a halo round it
    for (let j = 0; j < 60; j++) { const a = lit * (1 - j / 60); if (((x + j) & 1) === 0 && a > 0.2) frame.px(x, y - 3 - j, a > 0.6 ? white : hi); frame.px(x - 1, y - 3 - j, j & 1 ? hi : lo); }
    for (let j = -h - 3; j <= h + 3; j++) for (let i = -w - 4; i <= w + 4; i++) { const d = Math.hypot(i / (w + 4), j / (h + 3)); if (d < 1 && (((x + i) * 7 + (y + j) * 3) & 7) / 8 < (1 - d) * lit * 0.9 && d > 0.55) frame.px(x + i, y + j, hi); }
  }
  // top: a flattened diamond
  for (let j = -h; j <= 0; j++) { const k = 1 + j / h, half = Math.round(w * k); frame.rect(x - half, y + j, half * 2 + 1, 1, j < -h * 0.5 ? hi : lo); }
  // front edge
  frame.rect(x - w, y + 1, w * 2 + 1, 3, lo);
  // the shard under it
  for (let j = 0; j < 5; j++) { const half = Math.max(0, Math.round(w * (1 - j / 5) * 0.8)); frame.rect(x - half, y + 4 + j, half * 2 + 1, 1, j & 1 ? lo : hi); }
  if (lit > 0.3) { for (let i = -w; i <= w; i++) frame.px(x + i, y - h - 1 + Math.round(Math.abs(i) * h / w), white); frame.rect(x - w, y + 1, w * 2 + 1, 1, white); }
  void t;
}

function make(id, { gold, collide }) {
  const sk = sky(id, gold), rp = ringP(id), fp = fragP(id);
  const R = rng(gold ? 9001 : 8191);
  const stars = Array.from({ length: 46 }, () => ({ x: R() * 256, y: R() * 90, b: R() }));
  return {
    id, name: gold ? 'THE BEGINNING (TRUE FORM)' : 'THE BEGINNING', circuit: id, music: gold ? 'originTrueI' : 'originI', musicFrom: 1,
    palettes: [sk, rp, fp],
    ring: { canvas: ['slabHi', 'slab', 'slabSh', 'slabDk'], ropes: ['rope', 'rope', 'rope'], turnbuckles: ['post', 'post'], pads: ['post', 'post'] },
    shadowColor: 'shadow',
    crowd: null,
    paintBack(p) {
      // a sky of gold light, brightest low over the ring, with rays standing out of the middle of the world
      for (let y = 0; y < 92; y++) { const k = y / 92, key = k < 0.18 ? 'g0' : k < 0.36 ? 'g1' : k < 0.58 ? 'g2' : k < 0.78 ? 'g3' : k < 0.92 ? 'g4' : 'g5'; p.rect(0, y, 256, 1, key); }
      for (let y = 0; y < 90; y += 2) p.dither(0, y, 256, 2, y < 40 ? 'g0' : 'g1', 0.18);
      for (const s of stars) p.px(s.x, s.y, s.b > 0.7 ? 'white' : 'star');
      for (let k = 0; k < 15; k++) { const a = Math.PI + 0.08 + (k / 14) * (Math.PI - 0.16); p.line(128, 92, 128 + Math.cos(a) * 190, 92 + Math.sin(a) * 120, k % 3 === 0 ? 'ray' : 'g4'); }
      p.dither(0, 70, 256, 22, 'g5', 0.55);
      p.hline(0, 255, 91, 'rayHi');
    },
    paintRing(p) {
      p.rect(0, 92, 256, 132, 'black');
      // the ring: a slab of gold stone, seen from the front, with a bright front edge, floating over a world that has nothing under it
      p.rect(0, 92, 256, 132, 'slab'); p.rect(0, 92, 256, 2, 'slabHi');
      p.dither(0, 94, 256, 14, 'slabSh', 0.3); p.dither(0, 196, 256, 28, 'slabSh', 0.45);
      for (let y = 100; y < 224; y += 22) p.hline(0, 255, y, 'slabSh');
      p.rect(0, 92, 1, 132, 'edge'); p.rect(255, 92, 1, 132, 'edge');
      p.ellipse(128, 186, 84, 26, 'edge', false); p.ellipse(128, 186, 30, 9, 'slabHi', false);
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; p.px(128 + Math.cos(a) * 84, 186 + Math.sin(a) * 26, 'white'); }
      for (const yy of [62, 70, 78]) { p.hline(16, 239, yy, 'rope'); p.hline(16, 239, yy + 1, 'ropeS'); p.line(12, yy, -10, yy + 38, 'rope'); p.line(243, yy, 266, yy + 38, 'rope'); }
      for (const x of [8, 241]) { p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi'); }
    },
    paletteAnim(t, live, pal, state) {
      const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
      if (state.flash > 0) { state.flash--; if ((state.flash >> 2) & 1) { set('g0', 'flash'); set('g1', 'flash'); set('g2', 'flash'); } }
      // the light breathes
      if (((t >> 5) & 3) === 3) { set('g3', 'g4'); set('g4', 'g5'); }
    },
    onReaction(kind, state) { if (kind === 'knockdown' || kind === 'ko') state.flash = 16; },
    overlay(frame, arena, t, state) {
      const lit = state.lit || {};
      // far: every other arena, small, turning slowly round the whole picture
      for (const f of FAR) {
        const a = f.a0 + t * f.s * 6, x = 128 + Math.cos(a) * 138, y = 22 + (Math.sin(a) + 1) * f.ry + (f.ry & 3);
        const back = Math.sin(a) < 0;
        slab(frame, arena, x, y, back ? Math.max(3, f.w - 2) : f.w, back ? 1 : 2, f.fam, 0, t);
      }
      // near: the twelve styles' arenas, in two columns beside the ring (they bob; in the true form they swing together and COLLIDE)
      if (!state.col) state.col = { t0: 0, sparks: [] };
      for (const n of NEAR) {
        const bob = Math.sin(t / 40 + n.ph) * 4, yy = 52 + n.row * 22 + bob;
        let xx = 128 + n.side * (108 + Math.sin(t / 70 + n.ph) * 5);
        if (collide) {
          // the columns swing in: at the top of the swing the two meet at the sides of the ring
          const sw = (Math.sin(t / 95 + n.row * 0.5) + 1) / 2, k = sw * sw;
          xx = 128 + n.side * (108 - k * 62);
          if (k > 0.97 && !((t + n.row) % 24)) { for (let q = 0; q < 10; q++) state.col.sparks.push({ x: 128 + n.side * 46, y: yy, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2.4, life: 24, fam: n.fam }); state.flash = Math.max(state.flash || 0, 3); }
        }
        const L = Math.min(1, (lit[n.c] || 0) / 30);
        slab(frame, arena, xx, yy, n.w, n.h, n.fam, L, t);
      }
      if (state.col.sparks.length) {
        const col = (k) => arena.live[arena.pal.idx(k)];
        state.col.sparks = state.col.sparks.filter((s) => { s.x += s.vx; s.y += s.vy; s.vy += 0.12; return --s.life > 0; });
        for (const s of state.col.sparks) frame.px(Math.round(s.x), Math.round(s.y), s.life > 12 ? col('white') : col('f' + s.fam));
      }
    },
  };
}

export const ORIGIN_ARENAS = { origin: make('origin', { gold: false, collide: false }), originTrue: make('originTrue', { gold: true, collide: true }) };
