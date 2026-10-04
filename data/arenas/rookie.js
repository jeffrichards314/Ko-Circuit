// Rookie Circuit arena: Maple Street Rec Center.
// Community gym: painted cinderblock, a hand-made banner, folding chairs with a
// sparse crowd, flickering fluorescent tubes, a wall clock, a mop bucket by the ring.
// Animated: fluorescent flicker (palette), wall clock hands, crowd idle/cheer,
// phone-camera flashes on knockdowns and stars.

import { makePalette } from '../../src/engine/palette.js';

const wall = makePalette('rookie.wall', {
  ceil: [4, 5, 8],
  ceilHi: [9, 10, 14],
  wallHi: [29, 27, 22],
  wall: [25, 23, 18],
  wallSh: [20, 18, 14],
  mortar: [16, 14, 11],
  greenHi: [13, 21, 15],
  green: [9, 16, 11],
  greenSh: [6, 11, 8],
  stripe: [24, 8, 6],
  tube: [31, 31, 29],
  tubeF: [31, 31, 29],
  tubeDim: [15, 17, 20],
  fixture: [13, 14, 16],
  exitRed: [27, 5, 4],
});

const crowd = makePalette('rookie.crowd', {
  outline: [3, 3, 5],
  skin1: [30, 22, 16], skin1s: [23, 15, 10],
  skin2: [22, 14, 9], skin2s: [15, 9, 6],
  skin3: [13, 8, 5], skin3s: [8, 5, 3],
  hairA: [4, 3, 3], hairB: [18, 11, 4], hairC: [23, 23, 24],
  shirtR: [25, 6, 7], shirtY: [29, 24, 6], shirtG: [7, 19, 10], shirtB: [7, 11, 24],
  shirtSh: [7, 6, 11],
});

const ring = makePalette('rookie.ring', {
  ropeR: [29, 7, 7], ropeRs: [17, 3, 4],
  ropeW: [30, 30, 30], ropeWs: [19, 19, 22],
  ropeB: [7, 11, 27], ropeBs: [3, 5, 15],
  postHi: [26, 27, 29], post: [16, 17, 20], postDk: [8, 8, 11],
  padR: [27, 8, 8], padRs: [16, 3, 4],
  padB: [8, 12, 27], padBs: [4, 6, 16],
  chair: [18, 19, 21], chairDk: [10, 10, 12],
});

const floor = makePalette('rookie.canvas', {
  canvasHi: [25, 26, 28],
  canvas: [21, 23, 26],
  canvasSh: [17, 19, 23],
  canvasDk: [12, 14, 18],
  apron: [8, 9, 13],
  logo: [25, 11, 9],
  logoSh: [20, 17, 19],
  banner: [22, 5, 6],
  bannerDk: [12, 2, 3],
  bannerTxt: [31, 29, 22],
  shadow: [11, 13, 18],
  bucket: [28, 22, 4],
  bucketSh: [18, 12, 2],
  mopHead: [26, 25, 20],
  mopHandle: [20, 13, 7],
});

const BACK_ROW = { y: 66, x0: 10, x1: 246, spacing: 12, skip: [[66, 190]] };
const FRONT_ROW = { y: 79, x0: 22, x1: 238, spacing: 13 };
const CLOCK = [224, 44];

export default {
  id: 'rookie',
  name: 'MAPLE ST. REC CENTER',
  circuit: 'rookie',
  music: 'rookieFight',
  palettes: [wall, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeR', 'ropeW', 'ropeB'],
    turnbuckles: ['padR', 'padB'],
    pads: ['padR', 'padB'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'seated',
    density: 0.62,
    excitable: 0.8,
    seed: 1337,
    outline: 'outline',
    rows: [BACK_ROW, FRONT_ROW],
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    // ceiling + steel trusses
    p.rect(0, 0, 256, 31, 'ceil');
    p.hline(0, 255, 9, 'ceilHi'); p.hline(0, 255, 21, 'ceilHi');
    for (let x = -12; x < 256; x += 24) { p.line(x, 9, x + 12, 21, 'ceilHi'); p.line(x + 12, 21, x + 24, 9, 'ceilHi'); }
    // painted cinderblock: cream top, green bottom, red stripe
    p.rect(0, 31, 256, 26, 'wall');
    p.rect(0, 31, 256, 3, 'wallHi');
    p.rect(0, 57, 256, 30, 'green');
    p.rect(0, 55, 256, 2, 'stripe');
    for (let y = 37, r = 0; y < 87; y += 6, r++) {
      if (y === 55) continue;
      const lo = y > 55;
      p.hline(0, 255, y, lo ? 'greenSh' : 'mortar');
      if (!lo) p.hline(0, 255, y + 1, 'wallHi');
      for (let x = (r % 2) * 8; x < 256; x += 16) {
        p.vline(x, y - 5, y - 1, lo ? 'greenSh' : 'mortar');
        if (lo) p.px(x + 1, y - 5, 'greenHi');
      }
    }
    p.rect(0, 34, 256, 1, 'wallSh');
    // fluorescent fixtures (the second one flickers)
    [[8, 'tube'], [74, 'tubeF'], [140, 'tube'], [206, 'tube']].forEach(([x, k]) => {
      p.rect(x, 26, 44, 5, 'fixture');
      p.hline(x + 1, x + 42, 26, 'ceilHi');
      p.rect(x + 2, 28, 40, 2, k);
      p.vline(x + 6, 21, 25, 'ceilHi'); p.vline(x + 37, 21, 25, 'ceilHi');
    });
    // exit sign
    p.rect(6, 37, 38, 12, 'fixture');
    p.rect(7, 38, 36, 10, 'exitRed');
    p.text('EXIT', 9, 40, 'tube');
    // hand-made banner
    p.line(62, 35, 72, 38, 'fixture'); p.line(194, 35, 184, 38, 'fixture');
    p.rect(72, 37, 112, 16, 'bannerDk');
    p.rect(73, 38, 110, 14, 'banner');
    for (let x = 73; x < 183; x += 2) p.px(x, 38, 'bannerDk');
    p.text('FRIDAY FIGHTS', 76, 41, 'bannerTxt', { mono: true, shadow: 'bannerDk' });
    // sag at the bottom edge
    p.hline(74, 181, 53, 'bannerDk');
    // wall clock
    const [cx, cy] = CLOCK;
    p.ellipse(cx + 0.5, cy + 0.5, 8, 8, 'fixture');
    p.ellipse(cx + 0.5, cy + 0.5, 6.6, 6.6, 'tube');
    for (let a = 0; a < 12; a++) {
      const ang = (a / 12) * Math.PI * 2;
      p.px(cx + Math.round(Math.sin(ang) * 5.5), cy - Math.round(Math.cos(ang) * 5.5), a % 3 ? 'wallSh' : 'ceil');
    }
    // folding chairs (occupied or not)
    for (const row of [BACK_ROW, FRONT_ROW]) {
      for (let x = row.x0; x <= row.x1; x += row.spacing) {
        if (row.skip && row.skip.some(([a, b]) => x >= a && x <= b)) continue;
        const y = row.y;
        p.rect(x - 5, y - 10, 11, 7, 'chairDk');
        p.rect(x - 4, y - 9, 9, 5, 'chair');
        p.hline(x - 4, x + 4, y - 9, 'ropeWs');
        p.rect(x - 5, y - 3, 11, 2, 'chairDk');
        p.vline(x - 5, y - 1, y + 3, 'chairDk'); p.vline(x + 5, y - 1, y + 3, 'chairDk');
      }
    }
    // gym bleachers folded against the back wall, behind the banner gap
    for (let y = 58; y < 70; y += 3) { p.hline(66, 190, y, 'greenSh'); p.hline(66, 190, y + 1, 'wallSh'); }
  },

  paintRing(p) {
    // apron edge + canvas
    p.rect(0, 84, 256, 4, 'apron');
    p.hline(0, 255, 84, 'canvasDk');
    p.rect(0, 88, 256, 136, 'canvas');
    p.rect(0, 88, 256, 2, 'canvasHi');
    p.dither(0, 90, 256, 14, 'canvasSh', 0.35);
    p.dither(0, 104, 256, 10, 'canvasSh', 0.12);
    // worn patches + scuffs
    const scuffs = [[40, 130], [210, 150], [70, 205], [190, 200], [120, 118], [28, 180], [228, 116]];
    for (const [x, y] of scuffs) p.dither(x - 8, y - 3, 16, 6, 'canvasSh', 0.3, (i, j) => ((i - x) / 8) ** 2 + ((j - y) / 3) ** 2 < 1);
    // faded ring logo (mostly under the fighters)
    p.ellipse(128, 184, 92, 28, 'logoSh', false);
    p.ellipse(128, 184, 88, 25, 'logoSh', false);
    p.ellipse(128, 184, 84, 23, 'logo', false);
    p.text('MAPLE', 52, 180, 'logoSh', { mono: false });
    p.text('STREET', 160, 180, 'logoSh', { mono: false });
    p.dither(30, 153, 200, 62, 'canvas', 0.25, (i, j) => p.get(i, j) === p.c('logo') || p.get(i, j) === p.c('logoSh'));
    // mop bucket just outside the ring (behind the ropes)
    p.line(34, 54, 30, 80, 'mopHandle', 1); p.line(35, 54, 31, 80, 'mopHandle', 1);
    p.rect(22, 74, 16, 10, 'bucketSh');
    p.rect(23, 74, 14, 9, 'bucket');
    p.hline(22, 37, 73, 'mopHead'); p.hline(23, 36, 72, 'bucketSh');
    p.rect(24, 76, 2, 6, 'mopHead');
    p.hline(23, 36, 79, 'bucketSh');
    p.px(28, 70, 'mopHead'); p.px(31, 71, 'mopHead'); p.px(26, 71, 'mopHead');
    // back ropes: red / white / blue
    const ropes = [[60, 'ropeR', 'ropeRs'], [68, 'ropeW', 'ropeWs'], [76, 'ropeB', 'ropeBs']];
    for (const [y, a, b] of ropes) {
      p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
      for (let x = 20; x < 240; x += 9) p.px(x, y, b); // twist
    }
    // side ropes running toward the camera
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    // corner posts + padded turnbuckles
    for (const [x, pad, padS] of [[8, 'padR', 'padRs'], [241, 'padB', 'padBs']]) {
      p.rect(x, 48, 7, 44, 'postDk');
      p.rect(x + 1, 48, 5, 44, 'post');
      p.vline(x + 2, 49, 90, 'postHi');
      p.rect(x - 1, 55, 9, 27, padS);
      p.rect(x, 56, 7, 25, pad);
      p.vline(x + 1, 57, 79, 'ropeW');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, padS);
      p.rect(x - 1, 90, 9, 3, 'postDk');
    }
  },

  // Fluorescent flicker: the second tube stutters every few seconds.
  paletteAnim(t, live, pal, state, arena) {
    const cyc = t % 400;
    const off = (cyc > 250 && cyc < 292 && (cyc % 7 < 3 || (cyc > 270 && cyc < 280))) || (cyc > 350 && cyc < 354);
    if (off) {
      live[pal.idx('tubeF')] = pal.u32[pal.idx('tubeDim')];
    }
    // knockdowns: the whole place lights up with phone flashes
    if (arena.reactBig && (t >> 2) % 5 === 0) live[pal.idx('wallHi')] = pal.u32[pal.idx('tube')];
  },

  overlay(frame, arena, t, state) {
    const pal = arena.live, P = arena.pal;
    // clock hands: second hand ticks every 60 frames, minute hand creeps
    const [cx, cy] = CLOCK;
    const sec = Math.floor(t / 60) % 60;
    const min = (Math.floor(t / 3600) + 42) % 60;
    const hand = (v, len, col) => {
      const a = (v / 60) * Math.PI * 2;
      for (let r = 0; r <= len; r += 0.5) frame.px(Math.round(cx + Math.sin(a) * r), Math.round(cy - Math.cos(a) * r), col);
    };
    hand(min, 4.5, pal[P.idx('ceil')]);
    hand(sec, 5.5, pal[P.idx('stripe')]);
    // phone-camera flashes during crowd reactions
    if (arena.react > 0) {
      const n = arena.reactBig ? 3 : 1;
      for (let i = 0; i < n; i++) {
        const k = ((t >> 2) * 7919 + i * 104729) % arena.crowd.length;
        const sp = arena.crowd[k];
        if (!sp || ((t >> 2) + i) % 3) continue;
        const col = pal[P.idx('tube')];
        const x = sp.x + 2, y = sp.y - 7;
        frame.px(x, y, col); frame.px(x - 1, y, col); frame.px(x + 1, y, col); frame.px(x, y - 1, col); frame.px(x, y + 1, col);
      }
    }
  },
};
