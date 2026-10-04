// Pantheon I arena: the Gate of Dawn (spec §2b, §18).
// Marble steps at sunrise: a low gold sun over a tall marble gate (two fluted
// columns, an arch and bronze doors) with a stone sentinel statue either side,
// the sky going from violet to rose to gold, and robed onlookers on the steps.
// The ring is white marble with gold-and-rose ropes and pillar posts.
// Animated: the sun pulses and the sky shimmers (palette), petals drift down
// through the light and a bird crosses the sun now and then (overlay), the
// crowd reacts; on knockdowns and stars the whole gate blazes gold.

import { makePalette } from '../../src/engine/palette.js';

const sky = makePalette('pantheon1.sky', {
  sky0: [5, 4, 12], sky1: [9, 6, 17], sky2: [16, 8, 20], sky3: [24, 11, 20], sky4: [29, 17, 17], sky5: [31, 24, 14],
  sun: [31, 30, 20], sunHi: [31, 31, 28], sunGlow: [31, 27, 13], sunGlow2: [30, 22, 11],
  cloud: [25, 14, 19], cloudHi: [30, 20, 18], ray: [31, 28, 17], bird: [8, 4, 10],
});
const hall = makePalette('pantheon1.hall', {
  marbleHi: [31, 30, 28], marble: [27, 26, 25], marbleSh: [20, 19, 21], marbleDk: [12, 11, 15], vein: [23, 22, 24],
  goldHi: [31, 30, 16], gold: [28, 21, 5], goldDk: [16, 10, 2],
  bronze: [17, 10, 5], bronzeHi: [25, 17, 8], stone: [15, 14, 17], stoneHi: [21, 20, 22],
  petal: [31, 20, 24], petalHi: [31, 25, 27],
});
const crowd = makePalette('pantheon1.crowd', {
  outline: [3, 2, 5],
  skin1: [30, 22, 16], skin1s: [22, 14, 10],
  skin2: [22, 14, 9], skin2s: [14, 8, 6],
  skin3: [13, 8, 5], skin3s: [8, 5, 3],
  hairA: [4, 3, 3], hairB: [20, 13, 5], hairC: [27, 26, 24],
  robeW: [30, 29, 27], robeG: [29, 22, 7], robeR: [25, 7, 8], robeSh: [17, 14, 16],
});
const ring = makePalette('pantheon1.ring', {
  ropeG: [31, 26, 9], ropeGs: [19, 13, 3],
  ropeR: [30, 14, 18], ropeRs: [18, 6, 10],
  ropeW: [31, 30, 28], ropeWs: [21, 20, 22],
  capHi: [31, 30, 16], cap: [28, 21, 5], capDk: [16, 10, 2],
  shadow: [19, 18, 21], inlay: [28, 21, 5], inlaySh: [17, 11, 3],
});

const BACK_ROW = { y: 64, x0: 8, x1: 248, spacing: 12, skip: [[70, 186]] };
const FRONT_ROW = { y: 78, x0: 20, x1: 236, spacing: 13, skip: [[100, 156]] };
const SUN = [128, 56];
const PETALS = Array.from({ length: 18 }, (_, i) => ({ x: (i * 97 + 13) % 250, s: 0.16 + ((i * 7) % 5) * 0.05, o: (i * 173) % 500, sw: 6 + (i % 4) * 2 }));

export default {
  id: 'pantheon1',
  name: 'THE GATE OF DAWN',
  circuit: 'p1',
  music: 'gateFight',
  palettes: [sky, hall, crowd, ring],
  ring: {
    canvas: ['marbleHi', 'marble', 'marbleSh', 'marbleDk'],
    ropes: ['ropeG', 'ropeR', 'ropeW'],
    turnbuckles: ['cap', 'cap'],
    pads: ['cap', 'cap'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'seated',
    density: 0.5,
    excitable: 0.85,
    seed: 5101,
    outline: 'outline',
    rows: [BACK_ROW, FRONT_ROW],
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['robeW', 'robeSh'], ['robeG', 'robeSh'], ['robeW', 'robeSh'], ['robeR', 'robeSh']],
  },

  paintBack(p) {
    // the sky, band by band, dithered where they meet
    const bands = ['sky0', 'sky1', 'sky2', 'sky3', 'sky4', 'sky5'];
    bands.forEach((k, i) => p.rect(0, i * 15, 256, 15, k));
    for (let i = 1; i < bands.length; i++) p.dither(0, i * 15 - 4, 256, 4, bands[i - 1], 0.5);
    p.dither(0, 88 - 12, 256, 12, 'sky5', 0.5);
    // long thin clouds lit from below
    for (const [x, y, w] of [[10, 34, 60], [170, 40, 70], [90, 22, 46], [210, 24, 40]]) {
      p.rect(x, y, w, 2, 'cloud'); p.rect(x + 6, y - 2, w - 14, 2, 'cloud'); p.hline(x + 4, x + w - 6, y + 2, 'cloudHi');
    }
    // the sun, low over the gate: rings of glow around a bright disc
    const [sx, sy] = SUN;
    p.ellipse(sx, sy, 50, 30, 'sunGlow2', true);
    p.ellipse(sx, sy, 38, 23, 'sunGlow', true);
    p.ellipse(sx, sy, 20, 14, 'sun', true);
    p.ellipse(sx, sy, 12, 8, 'sunHi', true);
    // the marble gate: two fluted columns, an arch, a lintel with a gold sun, and bronze doors
    const colX = [96, 152];
    for (const x of colX) {
      p.rect(x - 2, 32, 12, 4, 'marbleHi'); p.rect(x - 3, 36, 14, 2, 'marbleSh');   // capital
      p.rect(x, 38, 8, 46, 'marble');
      for (let i = 1; i < 8; i += 2) p.vline(x + i, 38, 83, 'marbleSh');
      p.vline(x + 1, 38, 83, 'marbleHi'); p.vline(x + 6, 38, 83, 'marbleDk');
      p.rect(x - 2, 84, 12, 4, 'marbleSh'); p.hline(x - 2, x + 9, 84, 'marbleHi');   // base
    }
    p.rect(92, 26, 72, 6, 'marbleHi'); p.rect(92, 32, 72, 2, 'marbleSh');           // lintel
    p.rect(98, 21, 60, 5, 'marble'); p.rect(106, 17, 44, 4, 'marbleHi');             // pediment steps
    p.ellipse(128, 24, 6, 5, 'gold', true); p.ellipse(128, 24, 3, 2, 'goldHi', true);
    for (let a = 0; a < 8; a++) { const t = (a / 8) * Math.PI * 2; p.px(128 + Math.cos(t) * 9, 24 + Math.sin(t) * 7, 'gold'); }
    // the doors between the columns: bronze, banded with gold
    p.rect(106, 44, 44, 40, 'bronze');
    p.vline(128, 44, 83, 'goldDk'); p.vline(127, 44, 83, 'bronzeHi');
    for (let y = 50; y < 84; y += 8) { p.hline(106, 149, y, 'goldDk'); p.hline(106, 127, y + 1, 'bronzeHi'); }
    p.ellipse(120, 66, 2, 2, 'gold', true); p.ellipse(136, 66, 2, 2, 'gold', true);
    p.poly([[106, 44], [128, 44], [128, 40], [117, 34], [106, 40]], 'bronze');
    // sentinel statues either side: a plumed helm, a shield, a spear
    for (const [x, s] of [[54, 1], [202, -1]]) {
      p.rect(x - 8, 78, 20, 10, 'stone'); p.hline(x - 8, x + 11, 78, 'stoneHi');           // plinth
      p.rect(x - 4, 54, 12, 24, 'stone'); p.rect(x - 4, 54, 3, 24, 'stoneHi');             // body
      p.ellipse(x + 2, 49, 5, 5, 'stone', true); p.rect(x - 3, 43, 10, 4, 'stone'); p.rect(x + 1, 38, 2, 6, 'stoneHi'); // helm and crest
      p.ellipse(x + 2 - s * 8, 66, 6, 8, 'stoneHi', true); p.ellipse(x + 2 - s * 8, 66, 3, 5, 'stone', true); // shield
      p.vline(x + 2 + s * 8, 36, 78, 'stoneHi'); p.px(x + 2 + s * 8, 34, 'stoneHi'); p.px(x + 2 + s * 8, 35, 'stoneHi'); // spear
    }
    // steps climbing up behind the ring: four broad marble treads
    for (let i = 0; i < 4; i++) {
      const y = 60 + i * 7;
      p.rect(0, y, 256, 3, 'marbleHi'); p.rect(0, y + 3, 256, 4, i & 1 ? 'marble' : 'marbleSh');
      for (let x = (i * 19) % 41; x < 256; x += 41) p.px(x, y + 4, 'vein');
    }
  },

  paintRing(p) {
    // marble canvas and a low apron
    p.rect(0, 84, 256, 4, 'marbleSh');
    p.hline(0, 255, 84, 'marbleHi');
    p.rect(0, 88, 256, 136, 'marble');
    p.rect(0, 88, 256, 2, 'marbleHi');
    p.dither(0, 90, 256, 14, 'marbleSh', 0.3);
    p.dither(0, 104, 256, 10, 'marbleSh', 0.1);
    // veins in the marble, a gold inlaid sun (mostly under the fighters)
    for (const [x, y, l] of [[30, 120, 26], [190, 132, 30], [90, 206, 24], [210, 196, 22], [60, 170, 20], [150, 112, 22]]) {
      for (let i = 0; i < l; i++) p.px(x + i, y + Math.round(Math.sin(i * 0.4) * 2) + (i >> 3), 'vein');
    }
    p.ellipse(128, 184, 78, 24, 'inlaySh', false);
    p.ellipse(128, 184, 74, 22, 'inlay', false);
    for (let a = 0; a < 24; a++) { const t = (a / 24) * Math.PI * 2; for (let d = 40; d < 66; d += 2) p.px(128 + Math.cos(t) * d * 1.05, 184 + Math.sin(t) * d * 0.3, a & 1 ? 'inlay' : 'inlaySh'); }
    p.dither(50, 160, 156, 50, 'marble', 0.25, (i, j) => p.get(i, j) === p.c('inlay') || p.get(i, j) === p.c('inlaySh'));
    // ropes: gold, rose, white
    const ropes = [[60, 'ropeG', 'ropeGs'], [68, 'ropeR', 'ropeRs'], [76, 'ropeW', 'ropeWs']];
    for (const [y, a, b] of ropes) {
      p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
      for (let x = 20; x < 240; x += 9) p.px(x, y, b);
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    // marble pillar posts with gold caps
    for (const x of [8, 241]) {
      p.rect(x, 44, 7, 48, 'marbleDk'); p.rect(x + 1, 44, 5, 48, 'marble'); p.vline(x + 2, 45, 90, 'marbleHi');
      p.rect(x - 1, 40, 9, 5, 'capDk'); p.rect(x, 40, 7, 4, 'cap'); p.hline(x, x + 6, 40, 'capHi');
      p.rect(x - 1, 90, 9, 3, 'marbleDk');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'capDk');
    }
  },

  // the sun breathes; a knockdown or a star sets the whole gate ablaze
  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 5) & 3) === 2) { set('sunGlow2', 'sunGlow'); set('sky5', 'sunGlow2'); }
    if (((t >> 6) & 7) === 5) set('ray', 'sunHi');
    if (arena.react > 0 && (t >> 2) % 3 === 0) { set('marble', 'marbleHi'); set('bronze', 'gold'); set('goldDk', 'goldHi'); }
  },

  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // a few slow rays of light through the columns
    for (let r = 0; r < 5; r++) {
      const ang = -0.4 + r * 0.2 + Math.sin(t * 0.006 + r) * 0.03;
      for (let d = 18; d < 60; d += 2) frame.px(Math.round(SUN[0] + Math.sin(ang) * d * 1.6), Math.round(SUN[1] + Math.cos(ang) * d * 0.9), col('ray'));
    }
    // petals falling through the light
    for (const P of PETALS) {
      const y = ((t * P.s + P.o) % 240) - 10, x = P.x + Math.sin((t + P.o) / P.sw / 6) * P.sw;
      if (y < 38 || y > 210) continue;
      frame.px(Math.round(x), Math.round(y), col('petal')); frame.px(Math.round(x) + 1, Math.round(y), col('petalHi'));
    }
    // a bird crosses the sun
    const bt = (t % 900) - 60;
    if (bt > 0 && bt < 240) {
      const bx = 40 + bt, by = 48 + Math.round(Math.sin(bt / 12) * 4), up = (t >> 3) & 1;
      const c = col('bird');
      frame.px(bx, by, c); frame.px(bx - 1, by + (up ? -1 : 1), c); frame.px(bx + 1, by + (up ? -1 : 1), c); frame.px(bx - 2, by + (up ? -2 : 1), c); frame.px(bx + 2, by + (up ? -2 : 1), c);
    }
    // phone-flash glints in the crowd on the big moments
    if (arena.react > 0 && arena.crowd.length) {
      const k = ((t >> 2) * 7919) % arena.crowd.length, sp = arena.crowd[k];
      if (sp && !((t >> 2) % 3)) { const c = col('sunHi'); frame.px(sp.x + 2, sp.y - 7, c); frame.px(sp.x + 1, sp.y - 7, c); frame.px(sp.x + 3, sp.y - 7, c); frame.px(sp.x + 2, sp.y - 8, c); frame.px(sp.x + 2, sp.y - 6, c); }
    }
  },
};
