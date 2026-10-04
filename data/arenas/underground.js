// Underground arena: The Cage.
// A condemned dockside warehouse after midnight. Corrugated walls, rusted steel
// girders, stacked crates, one high window with the moon behind the grime. The
// crowd is packed in the dark behind a chain-link cage and all you can see of
// them is silhouettes (and the ends of their cigarettes). The only light is a
// single bare bulb on a long cord over the ring.
// Animated: the bulb swings on its cord, and its pool of light swings across
// the canvas with it (overlay); the bulb stutters now and then and the whole
// room dips dark (palette); cigarette embers glow and fade in the crowd
// (palette); on a knockdown the cage rattles.

import { makePalette } from '../../src/engine/palette.js';

const house = makePalette('underground.house', {
  dark: [1, 1, 2], wall: [4, 4, 5], wallHi: [7, 7, 8], wallDk: [2, 2, 3],
  girder: [10, 5, 3], girderHi: [15, 8, 4],
  crate: [9, 7, 4], crateHi: [13, 10, 6],
  glass: [5, 7, 10], moon: [22, 24, 28],
  cord: [2, 2, 2], bulb: [31, 29, 20], bulbHot: [31, 31, 28], glow: [24, 20, 10],
});

// the crowd: silhouettes, a hair's difference between them
const crowd = makePalette('underground.crowd', {
  outline: [0, 0, 1],
  s1: [3, 3, 4], s1s: [2, 2, 3],
  s2: [4, 3, 3], s2s: [2, 2, 2],
  hA: [1, 1, 1], hB: [3, 3, 3],
  tA: [2, 2, 3], tB: [3, 3, 4], tS: [1, 1, 2],
  ember: [27, 9, 3], emberHi: [31, 22, 8],
});

const ring = makePalette('underground.ring', {
  link: [14, 15, 16], linkDk: [7, 7, 8], linkHi: [20, 21, 22],
  postHi: [16, 16, 18], post: [9, 9, 11], postDk: [4, 4, 5],
  pad: [16, 3, 3], padS: [8, 1, 2],
  apron: [3, 3, 4], apronHi: [18, 8, 3],
});

const floor = makePalette('underground.canvas', {
  canvasHi: [17, 16, 14], canvas: [12, 11, 10], canvasSh: [8, 7, 7], canvasDk: [4, 4, 4],
  stain: [10, 5, 4], stainDk: [6, 3, 3],
  shadow: [3, 3, 3], lit: [21, 19, 15],
});

const ROWS = [
  { y: 60, x0: 4, x1: 252, spacing: 10 },
  { y: 70, x0: 8, x1: 248, spacing: 10 },
  { y: 80, x0: 4, x1: 252, spacing: 11 },
];
const BULB = { x: 128, y: 0, len: 54 };    // the cord hangs from (x, y), len px long (the bulb clears the HUD)
const swing = (t) => Math.sin(t / 34) * 0.42;  // radians

export default {
  id: 'underground',
  name: 'THE CAGE',
  circuit: 'underground',
  music: 'undergroundFight',
  palettes: [house, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['link', 'link', 'link'],
    turnbuckles: ['post', 'post'],
    pads: ['pad', 'pad'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'silhouette',
    density: 0.9,
    excitable: 0.7,
    seed: 13,
    outline: 'outline',
    rows: ROWS,
    skins: [['s1', 's1s'], ['s2', 's2s']],
    hairs: ['hA', 'hB'],
    shirts: [['tA', 'tS'], ['tB', 'tS']],
  },

  paintBack(p) {
    p.rect(0, 0, 256, 92, 'dark');
    // corrugated walls
    for (let x = 0; x < 256; x++) for (let y = 8; y < 56; y++) p.px(x, y, x % 6 === 0 ? 'wallDk' : x % 6 === 1 ? 'wallHi' : 'wall');
    // girders: a beam along the top and two uprights, rivets
    p.rect(0, 4, 256, 5, 'girder'); p.hline(0, 255, 4, 'girderHi');
    for (const x of [30, 222]) { p.rect(x, 8, 6, 50, 'girder'); p.vline(x, 8, 57, 'girderHi'); }
    for (let x = 3; x < 256; x += 9) p.px(x, 6, 'girderHi');
    for (let x = 34; x < 222; x += 14) p.line(x, 9, x + 14, 22, 'girder');
    // one high window, the moon behind the grime
    p.rect(160, 14, 30, 20, 'girder'); p.rect(162, 16, 26, 16, 'glass');
    p.ellipse(180, 21, 4, 4, 'moon');
    p.vline(175, 16, 31, 'girder'); p.hline(162, 187, 24, 'girder');
    p.dither(162, 16, 26, 16, 'wall', 0.3);
    // crates stacked in the corners
    for (const [x, y, w, h] of [[4, 38, 22, 18], [14, 24, 16, 14], [232, 34, 22, 22]]) {
      p.rect(x, y, w, h, 'crate'); p.hline(x, x + w - 1, y, 'crateHi'); p.vline(x, y, y + h - 1, 'crateHi');
      p.line(x, y, x + w - 1, y + h - 1, 'girder'); p.line(x + w - 1, y, x, y + h - 1, 'girder');
    }
  },

  paintRing(p) {
    // the cage: chain-link from post to post, in front of the crowd
    for (let y = 20; y < 88; y++) for (let x = 0; x < 256; x++) {
      const a = (x + y) % 8, b = (x - y + 256) % 8;
      if (a === 0 || b === 0) p.px(x, y, (x + y) % 16 === 0 ? 'linkHi' : 'link');
      else if (a === 1 && y % 3 === 0) p.px(x, y, 'linkDk');
    }
    p.hline(0, 255, 20, 'post'); p.hline(0, 255, 21, 'postDk');
    for (const x of [6, 124, 243]) {
      p.rect(x, 18, 6, 72, 'postDk'); p.rect(x + 1, 18, 4, 72, 'post'); p.vline(x + 1, 19, 88, 'postHi');
    }
    for (const x of [6, 243]) { p.rect(x - 1, 62, 8, 18, 'padS'); p.rect(x, 63, 6, 16, 'pad'); }
    // apron and canvas: dirty grey, old stains
    p.rect(0, 88, 256, 4, 'apron');
    p.text('NO RULES', 8, 88, 'apronHi', { mono: false });
    p.text('NO REFUNDS', 190, 88, 'apronHi', { mono: false });
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 130, 'canvasSh', 0.2);
    for (const [x, y, rx, ry] of [[60, 150, 12, 4], [190, 130, 8, 3], [150, 200, 16, 5], [40, 205, 7, 2]]) {
      p.ellipse(x, y, rx, ry, 'stainDk'); p.ellipse(x - 1, y - 1, rx * 0.7, ry * 0.6, 'stain');
    }
  },

  // the bulb stutters now and then (the whole room dips), embers glow and fade
  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    const stutter = ((t >> 2) % 97 === 0) || ((t >> 2) % 131 === 3) || state.rattle > 0;
    if (stutter && (t & 2)) {
      for (const k of ['wall', 'wallHi', 'girderHi', 'crateHi', 'canvasHi', 'lit']) set(k, k === 'lit' ? 'canvas' : 'wallDk');
      set('bulb', 'glow'); set('bulbHot', 'glow');
    }
    if (((t >> 4) & 7) < 3) set('ember', 'emberHi');
    if (state.rattle > 0) state.rattle--;
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko') state.rattle = 30;
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    const a = swing(t);
    const bx = Math.round(BULB.x + Math.sin(a) * BULB.len), by = Math.round(BULB.y + Math.cos(a) * BULB.len);
    // the pool of light on the canvas follows the bulb
    const px = Math.round(128 + Math.sin(a) * 120);
    const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const lit = col('lit');
    for (let y = 150; y < 222; y += 1) for (let x = px - 70; x < px + 70; x++) {
      if (x < 0 || x > 255) continue;
      const d = ((x - px) / 70) ** 2 + ((y - 190) / 30) ** 2;
      if (d < 1 && B[(y & 3) * 4 + (x & 3)] / 16 < 0.55 * (1 - d)) frame.px(x, y, lit);
    }
    // the cord and the bulb
    const n = BULB.len;
    for (let i = 0; i <= n; i++) frame.px(Math.round(BULB.x + Math.sin(a) * i), Math.round(BULB.y + Math.cos(a) * i), col('cord'));
    frame.rect(bx - 2, by - 1, 5, 2, col('cord'));
    frame.rect(bx - 2, by + 1, 5, 4, col('bulb')); frame.rect(bx - 1, by + 5, 3, 1, col('bulb'));
    frame.px(bx - 1, by + 2, col('bulbHot'));
    if ((t >> 3) & 1) { frame.px(bx - 4, by + 3, col('glow')); frame.px(bx + 4, by + 3, col('glow')); }
    // embers in the crowd: little points behind the cage
    for (let i = 0; i < 9; i++) {
      const ex = (i * 53 + 17) % 250 + 3, ey = 56 + ((i * 29) % 26);
      if (((t >> 5) + i) % 4) frame.px(ex, ey, col('ember'));
    }
    // a rattle of the cage on knockdowns
    if (state.rattle > 0 && (t & 2)) for (let x = 0; x < 256; x += 8) frame.px(x + (t & 4 ? 1 : 0), 21, col('linkHi'));
  },
};
