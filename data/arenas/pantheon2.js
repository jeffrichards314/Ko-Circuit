// Pantheon II arena: the Cloud Terrace (spec §2b, §18).
// A ring on a cloud: open blue sky with cloud banks in layers, a marble terrace rail
// with a wind chime hanging off it, and the crowd sitting on the cloud tops in pale
// robes. The ring is white marble on a bank of cloud, with silver-and-sky-blue ropes.
// Animated: cloud banks drift past (overlay), feathers tumble down, the wind chime
// swings (overlay), the sky shimmers (palette), the crowd reacts; a knockdown or star
// sends a flash of lightning through the far clouds.

import { makePalette } from '../../src/engine/palette.js';

const sky = makePalette('pantheon2.sky', {
  sky0: [8, 17, 30], sky1: [11, 21, 31], sky2: [15, 25, 31], sky3: [20, 28, 31], sky4: [25, 30, 31],
  cloudHi: [31, 31, 31], cloud: [27, 29, 31], cloudSh: [19, 23, 29], cloudDk: [12, 16, 24],
  sun: [31, 31, 26], feather: [31, 31, 31], chime: [26, 26, 30], chimeDk: [14, 15, 22], flash: [30, 30, 31],
});
const hall = makePalette('pantheon2.hall', {
  marbleHi: [31, 31, 31], marble: [28, 29, 31], marbleSh: [21, 23, 28], marbleDk: [12, 14, 21], vein: [24, 26, 30],
  silverHi: [31, 31, 31], silver: [23, 25, 29], silverDk: [13, 15, 21],
  gold: [30, 24, 6], goldDk: [17, 11, 2],
  ropeB: [12, 22, 31], ropeBs: [6, 12, 24],
});
const crowd = makePalette('pantheon2.crowd', {
  outline: [3, 4, 9],
  skin1: [30, 23, 18], skin1s: [22, 15, 12],
  skin2: [22, 14, 9], skin2s: [14, 8, 6],
  skin3: [13, 8, 5], skin3s: [8, 5, 3],
  hairA: [4, 3, 3], hairB: [20, 15, 8], hairC: [28, 29, 31],
  robeW: [31, 31, 31], robeB: [17, 24, 31], robeP: [25, 20, 30], robeSh: [16, 18, 26],
});
const ring = makePalette('pantheon2.ring', {
  shadow: [17, 20, 27], chimeStr: [24, 24, 28],
  ropeSky: [10, 20, 31], ropeSkyS: [5, 11, 22],
  ropeSil: [26, 28, 31], ropeSilS: [15, 17, 24],
});

const BACK_ROW = { y: 66, x0: 8, x1: 248, spacing: 13, skip: [[72, 184]] };
const FRONT_ROW = { y: 79, x0: 20, x1: 236, spacing: 13 };
const FEATHERS = Array.from({ length: 12 }, (_, i) => ({ x: (i * 83 + 20) % 250, s: 0.2 + ((i * 5) % 4) * 0.06, o: (i * 149) % 500 }));
const BANKS = [{ y: 44, w: 70, s: 0.10, o: 0 }, { y: 54, w: 90, s: 0.16, o: 90 }, { y: 36, w: 56, s: 0.07, o: 170 }, { y: 62, w: 110, s: 0.22, o: 40 }];

export default {
  id: 'pantheon2',
  name: 'THE CLOUD TERRACE',
  circuit: 'p2',
  music: 'cloudFight',
  palettes: [sky, hall, crowd, ring],
  ring: {
    canvas: ['marbleHi', 'marble', 'marbleSh', 'marbleDk'],
    ropes: ['ropeSky', 'ropeSil', 'ropeSky'],
    turnbuckles: ['silver', 'silver'],
    pads: ['silver', 'silver'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'seated',
    density: 0.5,
    excitable: 0.85,
    seed: 5202,
    outline: 'outline',
    rows: [BACK_ROW, FRONT_ROW],
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['robeW', 'robeSh'], ['robeB', 'robeSh'], ['robeP', 'robeSh'], ['robeW', 'robeSh']],
  },

  paintBack(p) {
    const bands = ['sky0', 'sky1', 'sky2', 'sky3', 'sky4'];
    bands.forEach((k, i) => p.rect(0, i * 18, 256, 18, k));
    for (let i = 1; i < bands.length; i++) p.dither(0, i * 18 - 4, 256, 4, bands[i - 1], 0.5);
    p.ellipse(214, 34, 12, 12, 'sun', true);
    // far cloud towers and banks
    for (const [x, y, w, h] of [[-10, 30, 60, 30], [40, 40, 50, 22], [150, 26, 70, 34], [210, 38, 60, 26], [100, 46, 60, 18]]) {
      p.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 'cloud', true);
      p.ellipse(x + w / 2 - 6, y + h / 2 - 4, w / 2.5, h / 2.4, 'cloudHi', true);
      p.dither(x, y + h / 2, w, h / 2, 'cloudSh', 0.45, (i, j) => p.get(i, j) === p.c('cloud'));
    }
    // the marble terrace rail and pillars along the back
    p.rect(0, 74, 256, 3, 'marbleHi'); p.rect(0, 77, 256, 4, 'marble'); p.rect(0, 81, 256, 3, 'marbleSh');
    for (let x = 6; x < 256; x += 20) { p.rect(x, 62, 5, 12, 'marble'); p.vline(x, 62, 73, 'marbleHi'); p.rect(x - 1, 60, 7, 2, 'marbleHi'); }
    // cloud tops under the crowd
    for (let x = 0; x < 256; x += 22) { p.ellipse(x + 8, 88, 16, 8, 'cloud', true); p.ellipse(x + 5, 85, 11, 5, 'cloudHi', true); }
  },

  paintRing(p) {
    // a bank of cloud with a marble floor on it
    p.rect(0, 84, 256, 4, 'cloudSh');
    p.rect(0, 88, 256, 136, 'marble');
    p.rect(0, 88, 256, 2, 'marbleHi');
    p.dither(0, 90, 256, 14, 'marbleSh', 0.3);
    for (let x = 0; x < 256; x += 18) { p.ellipse(x + 6, 86, 14, 5, 'cloud', true); p.ellipse(x + 4, 84, 9, 3, 'cloudHi', true); }
    for (const [x, y, l] of [[30, 124, 24], [180, 136, 30], [90, 206, 22], [206, 190, 20], [60, 168, 20]]) for (let i = 0; i < l; i++) p.px(x + i, y + Math.round(Math.sin(i * 0.45) * 2) + (i >> 3), 'vein');
    // a silver compass rose inlaid, mostly under the fighters
    p.ellipse(128, 186, 70, 22, 'silverDk', false); p.ellipse(128, 186, 66, 20, 'silver', false);
    for (let a = 0; a < 16; a++) { const t = (a / 16) * Math.PI * 2; for (let d = 30; d < 60; d += 2) p.px(128 + Math.cos(t) * d * 1.05, 186 + Math.sin(t) * d * 0.3, a & 1 ? 'silver' : 'silverDk'); }
    p.dither(60, 164, 136, 44, 'marble', 0.25, (i, j) => p.get(i, j) === p.c('silver') || p.get(i, j) === p.c('silverDk'));
    // a wind chime hanging off the far rail (drawn live: overlay), ropes: sky, silver, sky
    const ropes = [[60, 'ropeSky', 'ropeSkyS'], [68, 'ropeSil', 'ropeSilS'], [76, 'ropeSky', 'ropeSkyS']];
    for (const [y, a, b] of ropes) {
      p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
      for (let x = 20; x < 240; x += 9) p.px(x, y, b);
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    for (const x of [8, 241]) {
      p.rect(x, 44, 7, 48, 'marbleDk'); p.rect(x + 1, 44, 5, 48, 'marble'); p.vline(x + 2, 45, 90, 'marbleHi');
      p.rect(x - 1, 40, 9, 5, 'silverDk'); p.rect(x, 40, 7, 4, 'silver'); p.hline(x, x + 6, 40, 'silverHi');
      p.rect(x - 1, 90, 9, 3, 'marbleDk');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'silverDk');
    }
  },

  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 6) & 3) === 1) { set('sky3', 'sky4'); set('sky2', 'sky3'); }
    if (arena.react > 0 && (t >> 2) % 5 === 0) { set('sky1', 'flash'); set('sky2', 'flash'); set('cloudSh', 'cloudHi'); }
  },

  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // cloud banks drifting past, front to back at different speeds
    for (const b of BANKS) {
      const x = (((b.o - t * b.s) % (256 + b.w)) + (256 + b.w)) % (256 + b.w) - b.w;
      for (let i = 0; i < b.w; i += 2) {
        const h = Math.round(Math.sin(i * 0.25 + b.o) * 2 + 4);
        frame.rect(x + i, b.y - h, 2, h, col('cloud')); frame.rect(x + i, b.y - h, 2, 1, col('cloudHi'));
      }
    }
    // feathers tumbling down
    for (const F of FEATHERS) {
      const y = ((t * F.s + F.o) % 240) - 10, x = F.x + Math.sin((t + F.o) / 22) * 8;
      if (y < 38 || y > 208) continue;
      frame.px(Math.round(x), Math.round(y), col('feather')); frame.px(Math.round(x) + 1, Math.round(y) + 1, col('feather')); frame.px(Math.round(x) - 1, Math.round(y) + 1, col('cloudSh'));
    }
    // the wind chime, swinging off the rail
    const sw = Math.round(Math.sin(t / 40) * 3);
    frame.rect(196, 60, 1, 6, col('chimeStr'));
    for (const [dx, len] of [[-6, 9], [-2, 13], [2, 11], [6, 15]]) { const x = 196 + dx + Math.round((sw * len) / 12); frame.rect(x, 66, 1, 2, col('chimeStr')); frame.rect(x, 68, 2, len, col('chime')); frame.rect(x, 68 + len, 2, 1, col('chimeDk')); }
    if (arena.react > 0 && arena.crowd.length) {
      const k = ((t >> 2) * 7919) % arena.crowd.length, sp = arena.crowd[k];
      if (sp && !((t >> 2) % 3)) { const c = col('flash'); frame.px(sp.x + 2, sp.y - 7, c); frame.px(sp.x + 1, sp.y - 7, c); frame.px(sp.x + 3, sp.y - 7, c); frame.px(sp.x + 2, sp.y - 8, c); frame.px(sp.x + 2, sp.y - 6, c); }
    }
  },
};
