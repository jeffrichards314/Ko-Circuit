// Pantheon IV arena: the Starfield (spec §2b, §18).
// An observatory among the stars: a round brass dome wall with a great slit open onto the night,
// a field of stars and two soft nebulae behind it, a brass telescope on a pillar and a
// star chart on the wall, and the crowd of astronomers seated in tiers in indigo robes. The ring is
// dark blue stone with the constellations inlaid in gold dots and brass-and-silver ropes.
// Animated: the stars twinkle (palette) and drift, a shooting star crosses the slit now and
// then and an orrery turns in the corner (overlay), the crowd reacts; on a knockdown or a star a
// bright flash runs across the whole sky.

import { makePalette } from '../../src/engine/palette.js';

const sky = makePalette('pantheon4.sky', {
  sky0: [1, 1, 6], sky1: [3, 2, 10], sky2: [5, 4, 14], sky3: [8, 5, 18], sky4: [11, 7, 21],
  starHi: [31, 31, 31], starGold: [31, 28, 16], starBlue: [16, 22, 31], starDim: [14, 14, 22],
  nebA: [17, 6, 20], nebB: [8, 10, 24], nebHi: [24, 12, 24], comet: [31, 31, 28], flash: [22, 24, 31],
});
const hall = makePalette('pantheon4.hall', {
  brassHi: [31, 29, 14], brass: [27, 20, 5], brassSh: [17, 11, 3], brassDk: [8, 5, 2],
  wallHi: [12, 12, 22], wall: [8, 8, 17], wallSh: [5, 5, 12], wallDk: [2, 2, 7],
  chart: [21, 19, 10], chartDk: [12, 10, 5], lens: [12, 22, 31], lensHi: [24, 30, 31],
});
const crowd = makePalette('pantheon4.crowd', {
  outline: [2, 2, 6],
  skin1: [29, 21, 17], skin1s: [21, 13, 11],
  skin2: [21, 13, 9], skin2s: [13, 8, 6],
  skin3: [12, 8, 6], skin3s: [7, 4, 3],
  hairA: [3, 3, 4], hairB: [19, 19, 24], hairC: [28, 28, 30],
  robeI: [9, 8, 22], robeV: [16, 8, 24], robeT: [4, 16, 22], robeSh: [4, 4, 12],
});
const ring = makePalette('pantheon4.ring', {
  stoneHi: [12, 13, 24], stone: [7, 8, 17], stoneSh: [4, 5, 12], stoneDk: [2, 3, 8],
  inlay: [28, 24, 10], inlayDim: [17, 14, 6], shadow: [2, 2, 8],
  ropeB: [22, 24, 31], ropeBs: [10, 12, 22], ropeG: [30, 22, 5], ropeGs: [17, 11, 2],
  capHi: [31, 29, 14], cap: [27, 20, 5],
});

const BACK_ROW = { y: 66, x0: 8, x1: 248, spacing: 13, skip: [[70, 186]] };
const FRONT_ROW = { y: 79, x0: 20, x1: 236, spacing: 13, skip: [[100, 156]] };
// fixed star field (x, y, bright)
const STARS = Array.from({ length: 70 }, (_, i) => ({ x: 34 + ((i * 97 + 11) % 190), y: 6 + ((i * 53 + 7) % 46), k: (i * 7) % 5 }));
const ORRERY = { x: 226, y: 50 };

export default {
  id: 'pantheon4',
  name: 'THE STARFIELD OBSERVATORY',
  circuit: 'p4',
  music: 'starFight',
  palettes: [sky, hall, crowd, ring],
  ring: {
    canvas: ['stoneHi', 'stone', 'stoneSh', 'stoneDk'],
    ropes: ['ropeB', 'ropeG', 'ropeB'],
    turnbuckles: ['cap', 'cap'],
    pads: ['cap', 'cap'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'seated',
    density: 0.5,
    excitable: 0.8,
    seed: 5404,
    outline: 'outline',
    rows: [BACK_ROW, FRONT_ROW],
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['robeI', 'robeSh'], ['robeV', 'robeSh'], ['robeT', 'robeSh'], ['robeI', 'robeSh']],
  },

  paintBack(p) {
    // the dome wall, round at the top
    p.rect(0, 0, 256, 88, 'wall');
    for (let x = 0; x < 256; x += 16) { p.rect(x, 0, 1, 74, 'wallSh'); p.rect(x + 1, 0, 1, 74, 'wallHi'); }
    for (let y = 8; y < 74; y += 12) p.hline(0, 255, y, 'wallSh');
    // the great slit: a tall opening onto the night, brass framed
    p.rect(28, 0, 200, 66, 'sky0');
    for (let i = 1; i < 5; i++) p.rect(28, i * 12 - 4, 200, 14, `sky${Math.min(4, i)}`);
    for (let i = 1; i < 5; i++) p.dither(28, i * 12 - 6, 200, 4, `sky${i - 1}`, 0.5);
    // two soft nebulae
    p.ellipse(84, 30, 34, 13, 'nebA', true); p.dither(58, 22, 52, 16, 'nebHi', 0.25, (i, j) => p.get(i, j) === p.c('nebA'));
    p.ellipse(178, 24, 30, 11, 'nebB', true); p.dither(156, 16, 44, 14, 'starBlue', 0.18, (i, j) => p.get(i, j) === p.c('nebB'));
    for (const s of STARS) p.px(s.x, s.y, s.k === 0 ? 'starHi' : s.k === 1 ? 'starGold' : s.k === 2 ? 'starBlue' : 'starDim');
    // the slit's brass frame and the ribs of the dome
    p.rect(24, 0, 5, 68, 'brass'); p.vline(25, 0, 67, 'brassHi'); p.rect(227, 0, 5, 68, 'brass'); p.vline(228, 0, 67, 'brassHi'); p.vline(230, 0, 67, 'brassSh');
    p.rect(24, 66, 208, 4, 'brass'); p.hline(24, 231, 66, 'brassHi'); p.hline(24, 231, 69, 'brassSh');
    for (let x = 34; x < 224; x += 22) { p.rect(x, 0, 2, 66, 'brassDk'); p.vline(x, 0, 65, 'brassSh'); }
    // a star chart pinned to the wall, and a brass telescope on its pillar
    p.rect(2, 22, 20, 28, 'chart'); p.rect(2, 22, 20, 1, 'brassHi'); p.rect(2, 49, 20, 1, 'chartDk');
    for (const [x, y] of [[6, 28], [12, 32], [17, 27], [9, 39], [15, 43]]) p.px(x, y, 'chartDk');
    p.line(6, 28, 12, 32, 'chartDk'); p.line(12, 32, 17, 27, 'chartDk'); p.line(9, 39, 15, 43, 'chartDk');
    p.rect(236, 56, 16, 30, 'wallDk'); p.rect(237, 56, 14, 30, 'wallSh');
    p.poly([[228, 60], [252, 40], [255, 46], [232, 66]], 'brass'); p.line(228, 60, 252, 40, 'brassHi'); p.ellipse(253, 43, 3, 3, 'lens', true); p.px(252, 42, 'lensHi');
    p.rect(238, 64, 12, 3, 'brassSh'); p.rect(236, 84, 16, 3, 'brass');
    // tiers under the crowd
    p.rect(0, 74, 256, 4, 'brassSh'); p.hline(0, 255, 74, 'brass');
    p.rect(0, 78, 256, 10, 'wallSh');
  },

  paintRing(p) {
    p.rect(0, 84, 256, 4, 'brassSh'); p.rect(0, 84, 256, 1, 'brass');
    p.rect(0, 88, 256, 136, 'stone');
    p.rect(0, 88, 256, 2, 'stoneHi');
    p.dither(0, 90, 256, 16, 'stoneSh', 0.35);
    p.dither(0, 200, 256, 24, 'stoneSh', 0.3);
    // constellations inlaid in the floor: dots joined by dim lines
    const dots = [[36, 118], [58, 132], [84, 124], [110, 142], [40, 176], [70, 190], [212, 116], [190, 134], [228, 148], [206, 170], [176, 194], [150, 118]];
    const links = [[0, 1], [1, 2], [2, 3], [4, 5], [6, 7], [7, 8], [8, 9], [9, 10], [11, 7]];
    for (const [a, b] of links) p.line(dots[a][0], dots[a][1], dots[b][0], dots[b][1], 'inlayDim');
    for (const [x, y] of dots) { p.px(x, y, 'inlay'); p.px(x - 1, y, 'inlayDim'); p.px(x + 1, y, 'inlayDim'); p.px(x, y - 1, 'inlayDim'); p.px(x, y + 1, 'inlayDim'); }
    // a great inlaid ring under the fighters
    p.ellipse(128, 186, 72, 22, 'stoneSh', false); p.ellipse(128, 186, 70, 21, 'inlayDim', false);
    for (let a = 0; a < 24; a++) { const t = (a / 24) * Math.PI * 2; p.px(128 + Math.cos(t) * 70, 186 + Math.sin(t) * 21, 'inlay'); }
    // ropes: brass and blue-silver, with corner posts
    const ropes = [[60, 'ropeB', 'ropeBs'], [68, 'ropeG', 'ropeGs'], [76, 'ropeB', 'ropeBs']];
    for (const [y, a, b] of ropes) {
      p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
      for (let x = 20; x < 240; x += 9) p.px(x, y, b);
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    for (const x of [8, 241]) {
      p.rect(x, 44, 7, 48, 'stoneDk'); p.rect(x + 1, 44, 5, 48, 'stoneSh'); p.vline(x + 2, 45, 90, 'stoneHi');
      p.rect(x - 1, 40, 9, 5, 'brassSh'); p.rect(x, 40, 7, 4, 'brass'); p.hline(x, x + 6, 40, 'brassHi');
      p.rect(x - 1, 90, 9, 3, 'stoneDk');
    }
  },

  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    // the stars twinkle: the dim ones swell, the bright ones dip
    if (((t >> 3) & 3) === 1) { set('starDim', 'starBlue'); set('starBlue', 'starHi'); }
    if (((t >> 4) & 7) === 3) { set('starGold', 'starHi'); }
    if (arena.react > 0 && (t >> 2) % 5 === 0) { set('sky2', 'flash'); set('sky3', 'flash'); set('nebA', 'nebHi'); }
  },

  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // a shooting star crosses the slit now and then
    const c = t % 420;
    if (c < 26) {
      const x = 40 + c * 6, y = 6 + c * 1.6;
      for (let i = 0; i < 12; i++) frame.px(Math.round(x - i * 2.2), Math.round(y - i * 0.6), col(i < 2 ? 'comet' : i < 6 ? 'starBlue' : 'starDim'));
    }
    // the orrery: a brass sun and three planets on tilted rings
    frame.rect(ORRERY.x - 1, ORRERY.y - 1, 3, 3, col('brassHi'));
    for (const [rx, ry, sp, k] of [[9, 4, 0.05, 'lensHi'], [16, 7, 0.032, 'starGold'], [23, 10, 0.02, 'nebHi']]) {
      const a = t * sp + rx;
      frame.px(Math.round(ORRERY.x + Math.cos(a) * rx), Math.round(ORRERY.y + Math.sin(a) * ry), col(k));
      frame.px(Math.round(ORRERY.x + Math.cos(a) * rx) + 1, Math.round(ORRERY.y + Math.sin(a) * ry), col(k));
    }
    if (arena.react > 0 && arena.crowd.length) {
      const k = ((t >> 2) * 7919) % arena.crowd.length, sp = arena.crowd[k];
      if (sp && !((t >> 2) % 3)) { const c2 = col('starHi'); frame.px(sp.x + 2, sp.y - 7, c2); frame.px(sp.x + 1, sp.y - 7, c2); frame.px(sp.x + 3, sp.y - 7, c2); frame.px(sp.x + 2, sp.y - 8, c2); frame.px(sp.x + 2, sp.y - 6, c2); }
    }
  },
};
