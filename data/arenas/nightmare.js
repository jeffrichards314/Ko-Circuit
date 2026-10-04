// Nightmare arena: The Void.
// A ring floating in nothing. Where the stands should be, rows of crowd
// silhouettes ripple and warp like a reflection in black water, and dozens of
// eyes open and close in the dark above them. The ropes are bone-white; the
// canvas is black with a spiral worn into it.
// The colours are never the same twice: every round the void, the crowd's glow
// and the ropes shift to a new hue (round 1 violet, round 2 blood red,
// round 3 sick green; see TINTS).
// Animated: the crowd warps (overlay: its rows slide on a sine), eyes blink
// open and shut in the dark (overlay), the void's bands breathe (palette);
// knockdowns set the whole crowd writhing.

import { makePalette, c32 } from '../../src/engine/palette.js';

const voidPal = makePalette('nightmare.void', {
  v0: [1, 0, 3], v1: [3, 1, 6], v2: [5, 2, 9], v3: [8, 3, 13],
  eye: [28, 28, 20], eyeHi: [31, 31, 31], lid: [2, 1, 4],
});
const crowd = makePalette('nightmare.crowd', {
  outline: [0, 0, 1],
  c1: [5, 2, 9], c1s: [3, 1, 6],
  c2: [7, 3, 12], c2s: [4, 2, 8],
  h1: [2, 1, 4], h2: [4, 2, 7],
  t1: [3, 1, 6], t2: [6, 2, 10], ts: [1, 0, 3],
});
const ring = makePalette('nightmare.ring', {
  rope: [26, 24, 22], ropeS: [15, 13, 13],
  postHi: [18, 12, 22], post: [9, 5, 12], postDk: [4, 2, 6],
  pad: [20, 6, 24], padS: [10, 2, 13],
  apron: [2, 1, 3], apronHi: [16, 8, 20],
});
const floor = makePalette('nightmare.canvas', {
  canvasHi: [8, 5, 11], canvas: [4, 2, 6], canvasSh: [2, 1, 4], canvasDk: [1, 0, 2],
  spiral: [11, 5, 15], shadow: [1, 0, 1],
});

// round -> the colours the void takes: [v0..v3, crowd lit, crowd shade, spiral, pad]
const TINTS = [
  { v: [[1, 0, 3], [3, 1, 6], [5, 2, 9], [8, 3, 13]], c: [7, 3, 12], cs: [4, 2, 8], sp: [11, 5, 15], pad: [20, 6, 24], rope: [26, 24, 22] },
  { v: [[3, 0, 0], [6, 1, 1], [10, 1, 2], [15, 2, 3]], c: [13, 2, 3], cs: [8, 1, 2], sp: [17, 3, 4], pad: [26, 4, 5], rope: [29, 24, 20] },
  { v: [[0, 2, 1], [1, 4, 2], [2, 7, 3], [4, 11, 4]], c: [4, 12, 5], cs: [2, 7, 3], sp: [7, 16, 6], pad: [10, 22, 6], rope: [24, 28, 18] },
].map((T) => ({ v: T.v.map((x) => c32(...x)), c: c32(...T.c), cs: c32(...T.cs), sp: c32(...T.sp), pad: c32(...T.pad), rope: c32(...T.rope) }));

const ROWS = [
  { y: 54, x0: 6, x1: 250, spacing: 11 },
  { y: 64, x0: 2, x1: 254, spacing: 11 },
  { y: 75, x0: 6, x1: 250, spacing: 12 },
];
const EYES = Array.from({ length: 18 }, (_, i) => ({ x: (i * 61 + 23) % 244 + 6, y: 10 + ((i * 37) % 30), p: 60 + ((i * 47) % 90), o: (i * 71) % 200 }));

export default {
  id: 'nightmare',
  name: 'THE VOID',
  circuit: 'nightmare',
  music: 'nightmareFight',
  palettes: [voidPal, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['rope', 'rope', 'rope'],
    turnbuckles: ['pad', 'pad'],
    pads: ['pad', 'pad'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'warped',
    density: 0.85,
    excitable: 0.9,
    seed: 66,
    outline: 'outline',
    rows: ROWS,
    skins: [['c1', 'c1s'], ['c2', 'c2s']],
    hairs: ['h1', 'h2'],
    shirts: [['t1', 'ts'], ['t2', 'ts']],
  },

  paintBack(p) {
    // bands of void, darkest at the top
    const bands = ['v0', 'v1', 'v2', 'v3'];
    for (let y = 0; y < 92; y++) {
      const k = Math.min(3, Math.floor(y / 22));
      p.hline(0, 255, y, bands[k]);
      if (k < 3 && y % 22 > 17) for (let x = (y & 1); x < 256; x += 2) p.px(x, y, bands[k + 1]);
    }
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    p.text('NO WAY OUT', 8, 88, 'apronHi', { mono: false });
    p.text('NO WAY OUT', 186, 88, 'apronHi', { mono: false });
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 10, 'canvasHi', 0.2);
    // a spiral worn into the canvas
    for (let a = 0; a < 26; a += 0.02) {
      const r = a * 3.2;
      const x = 128 + Math.cos(a) * r * 1.9, y = 170 + Math.sin(a) * r * 0.55;
      if (y > 96) p.px(x, y, 'spiral');
    }
    // bone-white ropes that sag like they're melting
    for (const [yy, s] of [[62, 3], [70, 4], [78, 5]]) {
      for (let x = 16; x < 240; x++) { const Y = yy + Math.round(Math.sin((x - 16) / 223 * Math.PI) * s); p.px(x, Y, 'rope'); p.px(x, Y + 1, 'ropeS'); }
      p.line(12, yy, -10, yy + 38, 'rope'); p.line(12, yy + 1, -10, yy + 39, 'ropeS');
      p.line(243, yy, 266, yy + 38, 'rope'); p.line(243, yy + 1, 266, yy + 39, 'ropeS');
    }
    for (const x of [8, 241]) {
      p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi');
      p.rect(x - 1, 57, 9, 27, 'padS'); p.rect(x, 58, 7, 25, 'pad');
    }
  },

  // the colours shift every round; the void's bands breathe
  paletteAnim(t, live, pal, state) {
    const T = TINTS[Math.min(TINTS.length, state.round || 1) - 1];
    const put = (k, v) => { live[pal.idx(k)] = v; };
    const b = (t >> 5) & 3;
    ['v0', 'v1', 'v2', 'v3'].forEach((k, i) => put(k, T.v[Math.min(3, i + (b === 3 && i < 3 ? 1 : 0))]));
    put('c2', T.c); put('c2s', T.cs); put('t2', T.c); put('spiral', T.sp); put('pad', T.pad); put('rope', T.rope);
    put('c1', T.v[3]); put('t1', T.v[2]); put('apronHi', T.pad); put('postHi', T.sp);
    if (state.writhe > 0) state.writhe--;
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko') state.writhe = 150;
    if (kind === 'star') state.writhe = Math.max(state.writhe || 0, 40);
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // the warp: the crowd band's rows slide back and forth on a sine
    const amp = state.writhe > 0 ? 5 : 2;
    const W = frame.w, row = new Uint32Array(W);
    for (let y = 40; y < 88; y++) {
      const sh = Math.round(Math.sin(y / 5 + t / 18) * amp);
      if (!sh) continue;
      const o = y * W;
      row.set(frame.buf.subarray(o, o + W));
      for (let x = 0; x < W; x++) frame.buf[o + x] = row[Math.min(W - 1, Math.max(0, x - sh))];
    }
    // eyes opening and closing in the dark
    for (const e of EYES) {
      const k = (t + e.o) % e.p;
      if (k > 30) continue;
      const open = k < 3 || k > 27 ? 1 : 2;
      frame.rect(e.x - 2, e.y, 5, open, col('eye'));
      if (open === 2) { frame.px(e.x, e.y, col('lid')); frame.px(e.x, e.y + 1, col('lid')); frame.px(e.x - 2, e.y, col('eyeHi')); }
    }
  },
};
