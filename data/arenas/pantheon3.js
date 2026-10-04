// Pantheon III arena: the Hall of Heroes (spec §2b, §18).
// A long hall of columns and framed portraits of every era of the ring: four
// portrait frames on the back wall whose pictures shimmer between eras (sepia, silent
// film, television grey, disco), ghostly banners hanging between the columns, and a
// pale spectral crowd in the seats. The ring is a checkered marble floor with pale
// ropes and pillar posts; a torch of blue flame burns at each corner.
// `pantheon3d` is the same hall dressed for Dash Ascendant: his own gold-and-teal
// banner hangs among the heroes (spec §18 A5).
// Animated: the portraits change era, the torches flicker (palette), ghost banners
// ripple, motes drift up (overlay); on knockdowns and stars every portrait flares.

import { makePalette } from '../../src/engine/palette.js';

const hall = makePalette('pantheon3.hall', {
  wall: [7, 8, 16], wallHi: [11, 12, 22], wallSh: [4, 5, 11],
  colHi: [24, 26, 31], col: [17, 19, 27], colSh: [10, 11, 19], colDk: [5, 6, 12],
  goldHi: [30, 28, 16], gold: [24, 18, 5], goldDk: [13, 9, 2],
  bannerHi: [20, 24, 31], banner: [12, 16, 26], bannerDk: [6, 8, 16],
});
const pics = makePalette('pantheon3.pics', {
  sepiaA: [26, 20, 12], sepiaB: [15, 10, 6],
  filmA: [26, 26, 29], filmB: [10, 10, 13],
  tvA: [24, 25, 23], tvB: [8, 9, 8],
  discoA: [31, 22, 6], discoB: [22, 7, 5],
  now: [26, 26, 29], nowB: [10, 10, 13],
  tealDash: [3, 21, 20], goldDash: [30, 24, 6], tealDk: [1, 11, 12],
});
const crowd = makePalette('pantheon3.crowd', {
  outline: [3, 4, 10],
  skin1: [24, 27, 31], skin1s: [16, 19, 27],
  skin2: [19, 22, 30], skin2s: [12, 14, 23],
  skin3: [14, 17, 27], skin3s: [8, 10, 19],
  hairA: [20, 22, 30], hairB: [28, 29, 31], hairC: [12, 14, 24],
  robeA: [17, 20, 30], robeB: [24, 25, 31], robeC: [12, 16, 27], robeSh: [8, 10, 20],
});
const ring = makePalette('pantheon3.ring', {
  tileHi: [29, 30, 31], tile: [24, 25, 29], tileSh: [17, 18, 25], tileDk: [9, 10, 17],
  ropeP: [27, 29, 31], ropePs: [16, 18, 25], ropeB: [16, 22, 31], ropeBs: [8, 11, 22],
  cap: [24, 22, 12], capHi: [31, 30, 18], shadow: [13, 14, 22],
  flameHi: [24, 31, 31], flame: [10, 24, 31], flameLo: [4, 12, 26],
});

const BACK_ROW = { y: 66, x0: 8, x1: 248, spacing: 12, skip: [[60, 196]] };
const FRONT_ROW = { y: 79, x0: 20, x1: 236, spacing: 13 };
const FRAMES = [[24, 40], [80, 40], [156, 40], [212, 40]]; // portrait frames on the back wall (x, y)
const ERAS = ['sepia', 'film', 'tv', 'disco'];
const MOTES = Array.from({ length: 14 }, (_, i) => ({ x: (i * 71 + 9) % 250, s: 0.12 + ((i * 3) % 5) * 0.04, o: (i * 137) % 400 }));

function build(dash) {
  return {
    id: dash ? 'pantheon3d' : 'pantheon3',
    name: dash ? 'THE HALL OF HEROES: DASH\'S BANNER' : 'THE HALL OF HEROES',
    circuit: dash ? 'rival5' : 'p3',
    music: dash ? 'rivalAscendant' : 'heroesFight',
    palettes: [hall, pics, crowd, ring],
    ring: {
      canvas: ['tileHi', 'tile', 'tileSh', 'tileDk'],
      ropes: ['ropeP', 'ropeB', 'ropeP'],
      turnbuckles: ['cap', 'cap'],
      pads: ['cap', 'cap'],
    },
    shadowColor: 'shadow',
    crowd: {
      style: 'seated', density: 0.55, excitable: 0.8, seed: dash ? 5304 : 5303, outline: 'outline',
      rows: [BACK_ROW, FRONT_ROW],
      skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
      hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
      shirts: [['robeA', 'robeSh'], ['robeB', 'robeSh'], ['robeC', 'robeSh'], ['robeA', 'robeSh']],
    },

    paintBack(p) {
      p.rect(0, 0, 256, 88, 'wall');
      for (let y = 4; y < 88; y += 8) p.hline(0, 255, y, 'wallSh');
      p.rect(0, 84, 256, 4, 'wallHi');
      // the columns: fluted, with gold capitals
      for (const x of [0, 52, 104, 152, 204, 250]) {
        p.rect(x, 14, 8, 72, 'col'); p.vline(x + 1, 14, 85, 'colHi'); p.vline(x + 4, 14, 85, 'colSh'); p.vline(x + 7, 14, 85, 'colDk');
        p.rect(x - 2, 10, 12, 4, 'goldHi'); p.rect(x - 2, 14, 12, 2, 'gold'); p.rect(x - 2, 84, 12, 4, 'colSh');
      }
      p.rect(0, 6, 256, 4, 'gold'); p.hline(0, 255, 6, 'goldHi'); p.hline(0, 255, 9, 'goldDk');
      // the portrait frames (the pictures themselves are drawn live)
      for (const [x, y] of FRAMES) {
        p.rect(x - 3, y - 3, 34, 42, 'goldDk'); p.rect(x - 2, y - 2, 32, 40, 'gold'); p.rect(x - 1, y - 1, 30, 38, 'goldHi'); p.rect(x, y, 28, 36, 'wallSh');
        p.rect(x + 8, y + 40, 12, 4, 'gold'); // plaque
      }
      // ghostly banners between the columns
      for (const x of [34, 86, 134, 186, 234]) {
        p.rect(x, 18, 9, 30, 'banner'); p.rect(x, 18, 9, 2, 'gold'); p.poly([[x, 48], [x + 9, 48], [x + 4, 55]], 'banner');
        p.vline(x + 1, 20, 47, 'bannerHi'); p.ellipse(x + 4, 32, 2, 2, 'bannerHi', true);
      }
      if (dash) {
        // Dash's banner among the heroes: teal with a gold DM crest
        p.rect(114, 16, 28, 42, 'goldDk'); p.rect(115, 17, 26, 38, 'tealDash'); p.poly([[115, 55], [141, 55], [128, 65]], 'tealDash');
        p.rect(115, 17, 26, 2, 'goldDash'); p.text('DM', 121, 26, 'goldDash', { mono: false });
        p.ellipse(128, 42, 6, 6, 'goldDash', false);
      }
    },

    paintRing(p) {
      // a checkered marble floor in perspective-ish bands
      p.rect(0, 84, 256, 4, 'tileDk');
      for (let y = 88; y < 224; y += 12) for (let x = -((y / 12) % 2) * 12; x < 256; x += 24) { p.rect(x, y, 12, 12, 'tile'); p.rect(x + 12, y, 12, 12, 'tileHi'); }
      p.rect(0, 88, 256, 2, 'tileHi');
      p.dither(0, 90, 256, 16, 'tileSh', 0.3);
      p.dither(0, 200, 256, 24, 'tileSh', 0.2);
      // a wreath inlaid in gold
      p.ellipse(128, 186, 74, 23, 'cap', false); p.ellipse(128, 186, 70, 21, 'capHi', false);
      const ropes = [[60, 'ropeP', 'ropePs'], [68, 'ropeB', 'ropeBs'], [76, 'ropeP', 'ropePs']];
      for (const [y, a, b] of ropes) {
        p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
        for (let x = 20; x < 240; x += 9) p.px(x, y, b);
        p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
        p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
      }
      for (const x of [8, 241]) {
        p.rect(x, 44, 7, 48, 'colDk'); p.rect(x + 1, 44, 5, 48, 'col'); p.vline(x + 2, 45, 90, 'colHi');
        p.rect(x - 1, 40, 9, 5, 'goldDk'); p.rect(x, 40, 7, 4, 'gold'); p.hline(x, x + 6, 40, 'goldHi');
        p.rect(x - 1, 90, 9, 3, 'colDk');
        for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'colDk');
        // a torch bracket with a blue flame (the flame is animated)
        p.rect(x + 2, 32, 3, 8, 'goldDk');
      }
    },

    paletteAnim(t, live, pal, state, arena) {
      const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
      if ((t >> 2) % 3 === 0) { set('flame', 'flameHi'); set('flameLo', 'flame'); }
      if (arena.react > 0 && (t >> 2) % 3 === 0) { set('gold', 'goldHi'); set('banner', 'bannerHi'); }
    },

    overlay(frame, arena, t) {
      const col = (k) => arena.live[arena.pal.idx(k)];
      // the portraits: a silhouette of a fighter in the look of an era, the eras rotating
      FRAMES.forEach(([x, y], i) => {
        const era = ERAS[(Math.floor(t / 210) + i) % 4], cross = (t % 210) < 8;
        const A = col(era + 'A'), B = col(era + 'B');
        frame.rect(x, y, 28, 36, B);
        for (let j = 0; j < 36; j += 2) frame.rect(x, y + j, 28, 1, era === 'tv' ? A : B);
        // shoulders, neck, head, a hat or hair by era
        frame.rect(x + 4, y + 26, 20, 10, A);
        frame.rect(x + 11, y + 20, 6, 7, A);
        for (let j = -7; j <= 7; j++) { const w = Math.round(Math.sqrt(49 - j * j) * 0.8); frame.rect(x + 14 - w, y + 13 + j, w * 2, 1, A); }
        if (era === 'film') { frame.rect(x + 7, y + 3, 14, 11, B); frame.rect(x + 4, y + 13, 20, 2, B); }
        else if (era === 'disco') { for (let j = -9; j <= 9; j++) { const w = Math.round(Math.sqrt(81 - j * j) * 0.95); frame.rect(x + 14 - w, y + 11 + j, w * 2, 1, j < 0 ? B : A); } for (let j = -5; j <= 6; j++) { const w = Math.round(Math.sqrt(36 - j * j) * 0.75); frame.rect(x + 14 - w, y + 14 + j, w * 2, 1, A); } }
        else if (era === 'sepia') { frame.rect(x + 6, y + 10, 16, 3, B); frame.rect(x + 9, y + 18, 10, 2, B); }
        else { frame.rect(x + 8, y + 5, 12, 5, B); }
        if (cross) for (let j = 0; j < 36; j += 3) frame.rect(x, y + j, 28, 1, col('goldHi'));
        // a glint across the glass now and then
        const g = (t + i * 37) % 300;
        if (g < 24) for (let j = 0; j < 12; j++) { const gx = x + Math.round(g) + j, gy = y + 28 - j * 2; if (gx > x && gx < x + 28 && gy > y) frame.px(gx, gy, col('wallHi')); }
      });
      if (dash) for (let k = 0; k < 6; k++) frame.px(122 + ((t * 2 + k * 9) % 12), 18 + ((t + k * 7) % 4), col('goldDash'));
      // the torches
      for (const x of [10, 243]) {
        const f = Math.round(Math.sin(t / 5 + x) * 1);
        for (let j = 0; j < 9; j++) { const w = Math.max(1, 4 - (j >> 1)); frame.rect(x + 2 - (w >> 1) + f * (j > 5 ? 1 : 0), 31 - j, w, 1, col(j < 3 ? 'flameHi' : j < 6 ? 'flame' : 'flameLo')); }
      }
      // ghost banners ripple
      for (const x of [34, 86, 134, 186, 234]) for (let j = 0; j < 6; j++) frame.px(x + 4 + Math.round(Math.sin(t / 14 + x + j) * 3), 49 + j, col('bannerDk'));
      // motes drift up through the hall
      for (const M of MOTES) { const y = 88 - ((t * M.s + M.o) % 60); frame.px(M.x + Math.round(Math.sin((t + M.o) / 30) * 2), Math.round(y), col('flameHi')); }
      if (arena.react > 0 && arena.crowd.length) {
        const k = ((t >> 2) * 7919) % arena.crowd.length, sp = arena.crowd[k];
        if (sp && !((t >> 2) % 3)) { const c = col('tileHi'); frame.px(sp.x + 2, sp.y - 7, c); frame.px(sp.x + 1, sp.y - 7, c); frame.px(sp.x + 3, sp.y - 7, c); frame.px(sp.x + 2, sp.y - 8, c); frame.px(sp.x + 2, sp.y - 6, c); }
      }
    },
  };
}

export const HEROES_HALL = { pantheon3: build(false), pantheon3d: build(true) };
export default HEROES_HALL.pantheon3;
