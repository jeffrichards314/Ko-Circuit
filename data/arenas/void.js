// The Void's arenas (spec §18 A7, Phase E): white on black. ZERO's shards fight on a ring floating in nothing: a slab of pale
// stone with ropes drawn as thin white lines, fragments of other rooms drifting past. It breaks apart more with each fragment of the Void:
//   void1  The Fundamentals   the ring whole, a few fragments far off
//   void2  The Senses         the edges chipped away, a crack across the canvas, more fragments, nearer
//   void3  The Mind           the ring in two halves with a gap of black between them, fragments everywhere
//   zeroTrue  ZERO            the same ring; from the fourth phase on the whole screen is pure white (the arena's state.round)
//   dashUnbound  the amateur gym where you both started, empty, cut out of the world and floating: its cinderblock wall broken off, its
//                folding chairs empty, the banner hanging by one corner, a mop bucket by the ring
// Animated: fragments drift (overlay); on a knockdown the void flashes (palette).
import { makePalette } from '../../src/engine/palette.js';

const sky = (n) => makePalette(n + '.void', {
  black: [0, 0, 1], b1: [1, 1, 3], b2: [2, 2, 5], b3: [3, 3, 7], mote: [12, 12, 17], moteHi: [23, 23, 28], white: [31, 31, 31], flash: [26, 26, 31],
  fragHi: [27, 27, 30], frag: [18, 18, 23], fragSh: [8, 8, 13], fragDk: [3, 3, 7], line: [20, 20, 26], lineHi: [31, 31, 31],
});
const ringP = (n) => makePalette(n + '.ring', {
  slabHi: [16, 16, 22], slab: [7, 7, 12], slabSh: [4, 4, 8], slabDk: [1, 1, 3], rope: [27, 27, 31], ropeS: [12, 12, 18],
  postHi: [31, 31, 31], post: [22, 22, 27], postDk: [10, 10, 15], crack: [0, 0, 1], edge: [31, 31, 31], shadow: [1, 1, 3], apron: [10, 10, 15],
});
const rng = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

// drifting fragments: chunks of stone and torn edges of other rooms, [x, y, w, h, speed, phase]
const fragments = (seed, n, rows = [[6, 80]]) => { const R = rng(seed); return Array.from({ length: n }, () => { const [y0, y1] = rows[Math.floor(R() * rows.length)]; return { x: R() * 256, y: y0 + R() * (y1 - y0), w: 3 + Math.floor(R() * 9), h: 2 + Math.floor(R() * 5), s: 0.05 + R() * 0.2, o: R() * 400 }; }); };

function make(id, { frags, chipped = 0, split = false, crack = false, seed, musicFrom }) {
  const sk = sky(id), rp = ringP(id);
  const F = fragments(seed, frags, [[4, 84], [96, 220]]);
  const R = rng(seed + 5);
  const stars = Array.from({ length: 34 }, () => ({ x: R() * 256, y: R() * 86, b: R() }));
  return {
    id, name: 'THE VOID', circuit: id === 'void1' ? 'v1' : id === 'void2' ? 'v2' : id === 'void3' ? 'v3' : 'zeroTrue',
    music: id === 'void1' ? 'voidFight1' : id === 'void2' ? 'voidFight2' : id === 'void3' ? 'voidFight3' : 'zeroTrueI',
    ...(musicFrom ? { musicFrom } : {}),
    palettes: [sk, rp],
    ring: { canvas: ['slabHi', 'slab', 'slabSh', 'slabDk'], ropes: ['rope', 'rope', 'rope'], turnbuckles: ['post', 'post'], pads: ['post', 'post'] },
    shadowColor: 'shadow',
    crowd: null,
    paintBack(p) {
      p.rect(0, 0, 256, 92, 'black');
      for (let y = 0; y < 92; y += 4) if (y > 40) p.dither(0, y, 256, 4, 'b1', Math.min(0.5, (y - 40) / 110));
      // a far horizon of nothing: one faint line, and a few points
      p.hline(0, 255, 58, 'b3'); p.hline(0, 255, 59, 'b2');
      for (const s of stars) p.px(s.x, s.y, s.b > 0.7 ? 'moteHi' : 'mote');
    },
    paintRing(p) {
      p.rect(0, 92, 256, 132, 'black');
      // the slab: a pale floor, seen from the front (drawn as bands), with a bright front edge
      const gap = split ? 14 : 0;
      const slab = (x0, x1) => {
        p.rect(x0, 92, x1 - x0, 132, 'slab'); p.rect(x0, 92, x1 - x0, 2, 'slabHi');
        p.dither(x0, 94, x1 - x0, 14, 'slabSh', 0.3); p.dither(x0, 196, x1 - x0, 28, 'slabSh', 0.45);
        for (let y = 100; y < 224; y += 22) p.hline(x0, x1 - 1, y, 'slabSh');
        p.rect(x0, 92, 1, 132, 'edge'); p.rect(x1 - 1, 92, 1, 132, 'edge');
      };
      if (split) { slab(0, 128 - gap / 2); slab(128 + gap / 2, 256); } else slab(0, 256);
      // a white ring drawn on the floor
      p.ellipse(128, 186, 84, 26, 'edge', false); p.ellipse(128, 186, 30, 9, 'slabHi', false);
      // ropes: thin white lines, three of them, and two plain posts
      for (const yy of [62, 70, 78]) {
        p.hline(16, 239, yy, 'rope'); p.hline(16, 239, yy + 1, 'ropeS');
        p.line(12, yy, -10, yy + 38, 'rope'); p.line(243, yy, 266, yy + 38, 'rope');
      }
      for (const x of [8, 241]) { p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi'); }
      // the edges of the world: chunks bitten out of the front of the slab
      const B = rng(seed + 9);
      for (let i = 0; i < chipped; i++) {
        const w = 8 + Math.floor(B() * 22), x = Math.floor(B() * 232), y = 214 + Math.floor(B() * 10);
        p.poly([[x, 224], [x + w, 224], [x + w * 0.7, y], [x + w * 0.2, y + 3]], 'black');
        p.hline(x, x + w, y, 'edge');
      }
      if (crack) { p.line(128, 100, 118, 130, 'crack'); p.line(118, 130, 134, 160, 'crack'); p.line(134, 160, 122, 200, 'crack'); p.line(118, 130, 96, 146, 'crack'); p.line(134, 160, 168, 172, 'crack'); for (const [x, y] of [[118, 130], [134, 160]]) p.px(x - 1, y, 'edge'); }
      if (split) { p.rect(128 - gap / 2, 92, gap, 132, 'black'); }
    },
    // the void flashes on a knockdown; from the fourth phase of ZERO's fight the whole screen is white (`state.round`)
    paletteAnim(t, live, pal, state) {
      const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
      if (state.flash > 0) { state.flash--; if ((state.flash >> 2) & 1) { set('black', 'flash'); set('b1', 'flash'); } }
      if (id === 'zeroTrue' && state.round >= 4) {
        for (const k of ['black', 'b1', 'b2', 'b3', 'mote', 'moteHi']) set(k, 'white');
        // the whole ring goes white with the sky: the floor, the ropes, the posts (only a grey line keeps the edge of things)
        for (const [k, v] of [['slabHi', 'white'], ['slab', 'white'], ['slabSh', 'flash'], ['slabDk', 'flash'], ['rope', 'frag'], ['ropeS', 'line'], ['postHi', 'white'], ['post', 'line'], ['postDk', 'frag'], ['edge', 'line'], ['shadow', 'flash'], ['apron', 'flash']]) set(k, v);
      }
    },
    onReaction(kind, state) { if (kind === 'knockdown' || kind === 'ko') state.flash = 16; },
    overlay(frame, arena, t) {
      const col = (k) => arena.live[arena.pal.idx(k)];
      const white = id === 'zeroTrue' && arena.state.round >= 4;
      for (const f of F) {
        const x = ((f.x + t * f.s + f.o) % 300) - 22, y = f.y + Math.sin((t + f.o) / 60) * 3;
        frame.rect(Math.round(x), Math.round(y), f.w, f.h, white ? col('fragSh') : col('frag'));
        frame.rect(Math.round(x), Math.round(y), f.w, 1, white ? col('fragDk') : col('fragHi'));
        frame.rect(Math.round(x), Math.round(y) + f.h, Math.max(1, f.w - 2), 1, col('fragDk'));
      }
    },
  };
}

export const VOID_ARENAS = {
  void1: make('void1', { frags: 6, chipped: 2, seed: 1108 }),
  void2: make('void2', { frags: 12, chipped: 6, crack: true, seed: 2112 }),
  void3: make('void3', { frags: 20, chipped: 9, split: true, crack: true, seed: 3116 }),
  zeroTrue: make('zeroTrue', { frags: 14, chipped: 4, crack: true, seed: 4120 }),
};

// Dash Unbound's arena: the Maple Street rec center where you both started, as it was the day it was empty, cut out of the world and floating
// in the Void. A wall of painted cinderblock that ends in a broken edge, a banner hanging by one corner, a stopped clock, a dead tube, folding
// chairs with nobody in them, a mop bucket by the ring, and under it all the black.
const gymWall = makePalette('dashUnbound.wall', {
  black: [0, 0, 1], b1: [1, 1, 3], mote: [12, 12, 17], flash: [26, 26, 31],
  wallHi: [21, 20, 18], wall: [16, 15, 14], wallSh: [11, 10, 10], mortar: [8, 8, 8], greenHi: [10, 16, 12], green: [6, 11, 8], greenSh: [3, 7, 5],
  stripe: [16, 5, 4], tubeDim: [9, 10, 12], fixture: [8, 8, 10],
});
const gymRing = makePalette('dashUnbound.ring', {
  canvasHi: [18, 19, 21], canvas: [13, 14, 17], canvasSh: [9, 10, 13], canvasDk: [5, 6, 9], ropeR: [22, 5, 5], ropeRs: [11, 2, 3], ropeW: [26, 26, 26], ropeWs: [14, 14, 17],
  postHi: [22, 23, 25], post: [13, 14, 17], postDk: [6, 6, 9], chair: [12, 13, 15], chairDk: [5, 5, 7], shadow: [1, 1, 3], edge: [31, 31, 31],
});
const gymProps = makePalette('dashUnbound.props', {
  banner: [16, 4, 5], bannerDk: [8, 2, 3], bannerTxt: [25, 23, 18], bucket: [22, 17, 3], bucketSh: [12, 9, 1],
});
const mote = Array.from({ length: 16 }, (_, i) => ({ x: (i * 67 + 13) % 250, s: 0.05 + ((i * 3) % 5) * 0.03, o: (i * 71) % 300, y: 6 + (i * 29) % 78 }));
VOID_ARENAS.dashUnbound = {
  id: 'dashUnbound', name: 'THE GYM, ADRIFT', circuit: 'rival9', music: 'rivalUnbound',
  palettes: [gymWall, gymRing, gymProps],
  ring: { canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'], ropes: ['ropeR', 'ropeW', 'ropeR'], turnbuckles: ['post', 'post'], pads: ['ropeR', 'ropeR'] },
  shadowColor: 'shadow',
  crowd: null,
  paintBack(p) {
    p.rect(0, 0, 256, 92, 'black');
    // the wall: painted cinderblock, green below and pale above, ending in a broken edge along the bottom and both sides
    const x0 = 22, x1 = 234, y1 = 86;
    p.rect(x0, 8, x1 - x0, y1 - 8, 'wall'); p.rect(x0, 8, x1 - x0, 2, 'wallHi');
    p.rect(x0, 50, x1 - x0, y1 - 50, 'green'); p.rect(x0, 50, x1 - x0, 2, 'greenHi'); p.dither(x0, 70, x1 - x0, 16, 'greenSh', 0.4);
    for (let y = 10; y < y1; y += 6) { p.hline(x0, x1 - 1, y, 'mortar'); for (let x = x0 + ((y / 6) % 2 ? 0 : 8); x < x1; x += 16) p.vline(x, y, y + 5, 'mortar'); }
    p.rect(x0, 40, x1 - x0, 3, 'stripe');
    // the broken edge: bites out of the wall
    for (const [bx, bw, by] of [[22, 12, 60], [70, 10, 78], [120, 16, 80], [190, 12, 76], [222, 12, 30], [26, 10, 20]]) p.poly([[bx, by + 14], [bx + bw, by + 14], [bx + bw * 0.6, by], [bx + bw * 0.1, by + 4]], 'black');
    // the dead tube and its fixture, the stopped clock
    p.rect(60, 4, 70, 4, 'fixture'); p.rect(64, 8, 62, 2, 'tubeDim');
    p.ellipse(196, 26, 9, 9, 'fixture', true); p.ellipse(196, 26, 8, 8, 'wallHi', true); p.line(196, 26, 196, 20, 'black'); p.line(196, 26, 200, 27, 'black');
    for (const s of [[7, 0], [0, -7], [-7, 0], [0, 7]]) p.px(196 + s[0], 26 + s[1], 'black');
    // the banner hangs by one corner
    p.poly([[86, 12], [166, 12], [162, 30], [90, 38]], 'banner'); p.poly([[86, 12], [166, 12], [166, 14], [86, 14]], 'bannerDk');
    p.text('MAPLE STREET REC', 92, 19, 'bannerTxt', { mono: false });
  },
  paintRing(p) {
    p.rect(0, 92, 256, 132, 'black');
    p.rect(0, 92, 256, 132, 'canvas'); p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 14, 'canvasSh', 0.3); p.dither(0, 196, 256, 28, 'canvasSh', 0.4);
    p.ellipse(128, 186, 84, 26, 'edge', false);
    // empty folding chairs along the near side of the wall, and a mop bucket by the ring
    for (const x of [30, 60, 190, 220]) { p.rect(x, 74, 12, 2, 'chair'); p.rect(x + 1, 76, 2, 10, 'chairDk'); p.rect(x + 9, 76, 2, 10, 'chairDk'); p.rect(x, 62, 2, 12, 'chair'); }
    p.rect(226, 84, 12, 14, 'bucket'); p.rect(226, 84, 12, 2, 'bucketSh');
    for (const yy of [62, 70, 78]) {
      const col = yy === 70 ? 'ropeW' : 'ropeR', sh = yy === 70 ? 'ropeWs' : 'ropeRs';
      p.hline(16, 239, yy, col); p.hline(16, 239, yy + 1, sh);
      p.line(12, yy, -10, yy + 38, col); p.line(243, yy, 266, yy + 38, col);
    }
    for (const x of [8, 241]) { p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi'); }
    // the floor ends in a broken edge along the front
    for (let i = 0; i < 7; i++) { const w = 10 + (i * 13) % 24, x = i * 38 + 6; p.poly([[x, 224], [x + w, 224], [x + w * 0.7, 214 + (i % 3) * 2], [x + w * 0.2, 217]], 'black'); p.hline(x, x + w, 214 + (i % 3) * 2, 'edge'); }
  },
  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (state.flash > 0) { state.flash--; if ((state.flash >> 2) & 1) { set('black', 'flash'); set('b1', 'flash'); } }
  },
  onReaction(kind, state) { if (kind === 'knockdown' || kind === 'ko') state.flash = 16; },
  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    for (const m of mote) { const x = ((m.x + t * m.s + m.o) % 290) - 16; frame.px(Math.round(x), Math.round(m.y + Math.sin((t + m.o) / 50) * 2), col('mote')); }
  },
};
