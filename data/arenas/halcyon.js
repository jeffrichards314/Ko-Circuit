// Halcyon's arena: the Gate (spec §2b, §18 A7): the very top, above the Summit. A round platform of white
// marble floating in an open sky with nothing round it but light, a great arch of gold behind the ring, and no crowd
// at all: only the sun. The lighting is the boss: it changes with his form.
//   round 1  DAWN   a low rosy-gold sun climbing on the left, a violet-to-rose sky, long soft light
//   round 2  NOON   the sun straight overhead, the whole sky white-hot, every colour bleached
//   round 3  DUSK   a red sun sinking on the right, the sky bruised to purple and black, cold marble
// (the fight reads state.round, like the Nightmare's void). The ring is a bare marble disc with a gold rim.
import { makePalette } from '../../src/engine/palette.js';

const sky = makePalette('halcyon.sky', {
  s0: [5, 4, 12], s1: [9, 6, 17], s2: [16, 9, 20], s3: [24, 12, 20], s4: [29, 19, 16],
  sun: [31, 30, 20], sunHi: [31, 31, 28], glow: [31, 26, 12], glow2: [30, 20, 11], cloud: [25, 14, 19], cloudHi: [30, 21, 20], ray: [31, 27, 15], star: [31, 31, 31],
});
const hall = makePalette('halcyon.hall', {
  marbleHi: [31, 31, 30], marble: [27, 26, 26], marbleSh: [19, 18, 21], marbleDk: [10, 10, 14], vein: [22, 21, 24],
  goldHi: [31, 30, 16], gold: [28, 21, 5], goldDk: [16, 10, 2], arch: [26, 20, 6], archSh: [15, 10, 3],
  floorGlow: [31, 25, 12], floorDk: [8, 7, 11],
});
const ring = makePalette('halcyon.ring', {
  tileHi: [31, 31, 30], tile: [27, 26, 26], tileSh: [19, 18, 21], tileDk: [10, 10, 14], rim: [28, 21, 5], rimHi: [31, 30, 16],
  ropeG: [31, 26, 9], ropeGs: [19, 13, 3], ropeW: [31, 30, 28], ropeWs: [21, 20, 22], cap: [28, 21, 5], shadow: [14, 12, 18],
});
const empty = makePalette('halcyon.pad', { outline: [3, 3, 6], skin1: [30, 22, 16], skin1s: [22, 14, 10], hairA: [4, 3, 3], robeA: [30, 29, 27], robeSh: [17, 14, 16] });

// by form: the sky's five bands, the sun's colour, the glow, the marble's tint and the sun's place
const FORMS = [
  { name: 'DAWN', sky: [[5, 4, 12], [9, 6, 17], [16, 9, 20], [24, 12, 20], [29, 19, 16]], sun: [31, 30, 20], glow: [31, 26, 12], glow2: [30, 20, 11], cloud: [25, 14, 19], cloudHi: [30, 21, 20], ray: [31, 27, 15], marble: [27, 26, 26], at: [70, 66], r: 15, rays: 0.7 },
  { name: 'NOON', sky: [[26, 28, 31], [28, 30, 31], [30, 31, 31], [31, 31, 31], [31, 31, 30]], sun: [31, 31, 31], glow: [31, 31, 30], glow2: [31, 31, 28], cloud: [28, 29, 31], cloudHi: [31, 31, 31], ray: [31, 31, 28], marble: [30, 30, 30], at: [128, 22], r: 20, rays: 1 },
  { name: 'DUSK', sky: [[2, 1, 5], [5, 2, 9], [10, 3, 12], [19, 5, 10], [27, 10, 7]], sun: [31, 14, 6], glow: [28, 8, 5], glow2: [20, 5, 5], cloud: [12, 4, 12], cloudHi: [22, 7, 9], ray: [22, 6, 5], marble: [16, 14, 20], at: [190, 66], r: 16, rays: 0.5 },
];
const formOf = (state) => FORMS[Math.min(2, Math.max(0, (state.round || 1) - 1))];

export default {
  id: 'halcyon',
  name: 'THE GATE',
  circuit: 'halcyon',
  music: 'halcyonDawn',
  palettes: [sky, hall, empty, ring],
  ring: { canvas: ['tileHi', 'tile', 'tileSh', 'tileDk'], ropes: ['ropeG', 'ropeW', 'ropeG'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
  shadowColor: 'shadow',
  crowd: null,
  paintBack(p) {
    const bands = ['s0', 's1', 's2', 's3', 's4'];
    bands.forEach((k, i) => p.rect(0, i * 18, 256, 18, k));
    for (let i = 1; i < bands.length; i++) p.dither(0, i * 18 - 4, 256, 4, bands[i - 1], 0.5);
    p.rect(0, 90, 256, 30, 's4');
    // clouds far below the platform
    for (let x = 0; x < 256; x += 28) { p.ellipse(x + 8, 88, 20, 7, 'cloud', true); p.ellipse(x + 6, 85, 14, 4, 'cloudHi', true); }
    // the great arch of gold behind the ring
    for (let i = 0; i < 6; i++) p.ellipse(128, 76, 74 - i, 66 - i, i < 2 ? 'goldDk' : i < 4 ? 'arch' : 'gold', false);
    p.rect(52, 30, 8, 46, 'arch'); p.vline(53, 30, 75, 'goldHi'); p.rect(196, 30, 8, 46, 'arch'); p.vline(197, 30, 75, 'goldHi');
    p.rect(46, 74, 20, 4, 'gold'); p.rect(190, 74, 20, 4, 'gold');
    p.rect(0, 80, 256, 4, 'marbleSh');
  },
  paintRing(p) {
    p.rect(0, 84, 256, 4, 'marbleSh'); p.rect(0, 84, 256, 1, 'marbleHi');
    p.rect(0, 88, 256, 136, 'tile'); p.rect(0, 88, 256, 2, 'tileHi');
    p.dither(0, 90, 256, 18, 'tileSh', 0.3); p.dither(0, 200, 256, 24, 'tileSh', 0.3);
    for (const [x, y, l] of [[26, 122, 24], [196, 136, 28], [80, 206, 22], [214, 186, 20], [56, 166, 20]]) for (let i = 0; i < l; i++) p.px(x + i, y + Math.round(Math.sin(i * 0.45) * 2) + (i >> 3), 'vein');
    p.ellipse(128, 186, 80, 25, 'rim', false); p.ellipse(128, 186, 78, 24, 'tileDk', false);
    for (let a = 0; a < 32; a++) { const t = (a / 32) * Math.PI * 2; p.px(128 + Math.cos(t) * 80, 186 + Math.sin(t) * 25, 'rimHi'); }
    const ropes = [[60, 'ropeG', 'ropeGs'], [68, 'ropeW', 'ropeWs'], [76, 'ropeG', 'ropeGs']];
    for (const [y, a, b] of ropes) {
      p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
      for (let x = 20; x < 240; x += 9) p.px(x, y, b);
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    for (const x of [8, 241]) { p.rect(x, 44, 7, 48, 'marbleDk'); p.rect(x + 1, 44, 5, 48, 'marble'); p.vline(x + 2, 45, 90, 'marbleHi'); p.rect(x - 1, 40, 9, 5, 'goldDk'); p.rect(x, 40, 7, 4, 'gold'); p.hline(x, x + 6, 40, 'goldHi'); p.rect(x - 1, 90, 9, 3, 'marbleDk'); }
  },
  // the whole palette follows the form: a new light for every round
  paletteAnim(t, live, pal, state, arena) {
    const F = formOf(state), set = (k, c) => { live[pal.idx(k)] = 0xff000000 | (c[2] * 8 << 16) | (c[1] * 8 << 8) | (c[0] * 8); };
    F.sky.forEach((c, i) => set('s' + i, c));
    set('sun', F.sun); set('glow', F.glow); set('glow2', F.glow2); set('cloud', F.cloud); set('cloudHi', F.cloudHi); set('ray', F.ray);
    set('marble', F.marble); set('tile', F.marble);
    if (state.round === 2) { set('marbleHi', [31, 31, 31]); set('tileHi', [31, 31, 31]); set('tileSh', [26, 26, 28]); set('marbleSh', [26, 26, 28]); }
    if (state.round === 3) { set('tileHi', [24, 20, 26]); set('marbleHi', [24, 20, 26]); set('tileSh', [10, 8, 14]); set('marbleSh', [10, 8, 14]); set('tileDk', [4, 3, 8]); }
    if (arena.react > 0 && (t >> 2) % 5 === 0) set('s2', [31, 31, 31]);
  },
  overlay(frame, arena, t, state) {
    const F = formOf(state || arena.state), col = (k) => arena.live[arena.pal.idx(k)];
    const [sx, sy] = F.at;
    // rays from the sun, turning slowly
    for (let r = 0; r < 9; r++) {
      const ang = (r / 9) * Math.PI * 2 + t * 0.004;
      for (let d = F.r + 3; d < 150 * F.rays + 20; d++) if (((d + r * 3) & 3) === 0) { const x = Math.round(sx + Math.cos(ang) * d), y = Math.round(sy + Math.sin(ang) * d * 0.8); if (y > 44 && y < 84 && x >= 0 && x < 256) frame.px(x, y, col('ray')); }
    }
    for (let y = -F.r; y <= F.r; y++) { const w = Math.round(Math.sqrt(F.r * F.r - y * y)); frame.rect(sx - w, sy + y, w * 2 + 1, 1, col('glow')); }
    for (let y = -F.r + 3; y <= F.r - 3; y++) { const w = Math.round(Math.sqrt((F.r - 3) ** 2 - y * y)); frame.rect(sx - w, sy + y, w * 2 + 1, 1, col('sun')); }
  },
};
