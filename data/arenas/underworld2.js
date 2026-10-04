// Underworld II arena: the Ashen Fields (spec §2b, §18). A burning plain under a sky the colour of a banked
// fire: a great black volcano on the horizon with a river of lava running down it, dead trees still alight, cracks
// in the ground with the glow coming up through them. The ring is a slab of charred stone with glowing seams
// and blackened iron ropes; a brazier burns at each end. The crowd is shades on the ash dunes with two
// embers for eyes.
// Animated: the lava and the braziers flicker (palette), embers rise and smoke drifts off the plain
// (overlay), the crowd reacts; on a knockdown or a star the whole horizon flares.
import { makePalette } from '../../src/engine/palette.js';
import { shadePalette, crowdOf, ringRopes, seatedCrowdReact } from './_uw.js';

const sky = makePalette('underworld2.sky', {
  sk0: [2, 0, 1], sk1: [5, 1, 2], sk2: [9, 2, 3], sk3: [14, 4, 3], sk4: [20, 7, 3],
  smoke: [6, 3, 4], smokeHi: [11, 6, 6], black: [1, 0, 1], volc: [3, 1, 2], volcHi: [7, 3, 3],
  lavaHi: [31, 26, 9], lava: [30, 14, 2], lavaDk: [18, 5, 1], flash: [28, 18, 8],
});
const plain = makePalette('underworld2.plain', {
  earth: [4, 2, 2], earthHi: [8, 4, 3], earthSh: [2, 1, 1], crack: [30, 12, 2], crackDk: [16, 4, 1],
  treeDk: [2, 1, 1], flameHi: [31, 28, 12], flame: [31, 16, 3], flameLo: [22, 6, 2],
  ironHi: [14, 12, 13], iron: [7, 6, 7], ironSh: [3, 3, 4], brazier: [5, 4, 5], ember: [31, 20, 5],
});
const crowd = shadePalette('underworld2.crowd', [[6, 3, 4], [4, 2, 3], [9, 4, 4]], [[8, 3, 3], [5, 2, 3], [11, 5, 4], [3, 1, 2]], [1, 0, 1]);
const ring = makePalette('underworld2.ring', {
  stoneHi: [10, 7, 6], stone: [5, 3, 3], stoneSh: [3, 2, 2], stoneDk: [1, 1, 1], seam: [30, 12, 2], seamHi: [31, 22, 6],
  ropeI: [11, 9, 10], ropeIs: [5, 4, 5], ropeR: [22, 6, 3], ropeRs: [11, 2, 1], shadow: [1, 0, 1], cap: [13, 11, 12], capHi: [20, 17, 18],
});
const EMBERS = Array.from({ length: 20 }, (_, i) => ({ x: (i * 53 + 9) % 250, s: 0.2 + ((i * 3) % 5) * 0.09, o: (i * 47) % 260 }));
const SMOKE = Array.from({ length: 5 }, (_, i) => ({ x: 20 + i * 52, o: i * 61 }));
const TREES = [[18, 62], [46, 66], [206, 64], [238, 62], [150, 68]];

export default {
  id: 'underworld2',
  name: 'THE ASHEN FIELDS',
  circuit: 'u2',
  music: 'ashFight',
  palettes: [sky, plain, crowd, ring],
  ring: { canvas: ['stoneHi', 'stone', 'stoneSh', 'stoneDk'], ropes: ['ropeI', 'ropeR', 'ropeI'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
  shadowColor: 'shadow',
  crowd: crowdOf(6202),
  paintBack(p) {
    // the sky: a banked fire, brightest at the horizon
    for (let i = 0; i < 5; i++) p.rect(0, i * 14, 256, 14, `sk${i}`);
    for (let i = 1; i < 5; i++) p.dither(0, i * 14 - 4, 256, 4, `sk${i - 1}`, 0.5);
    for (const [x, y, rx, ry] of [[40, 16, 40, 7], [150, 10, 56, 8], [222, 26, 34, 6], [90, 34, 46, 6]]) { p.ellipse(x, y, rx, ry, 'smoke', true); p.dither(x - rx, y - ry, rx * 2, ry, 'smokeHi', 0.25, (i, j) => p.get(i, j) === p.c('smoke')); }
    // the volcano: black, a river of lava down its face
    p.poly([[120, 68], [150, 30], [166, 22], [174, 22], [190, 30], [224, 68]], 'volc');
    p.poly([[150, 30], [166, 22], [174, 22], [190, 30], [170, 34]], 'volcHi');
    p.ellipse(170, 22, 8, 2.4, 'lava', true); p.ellipse(170, 22, 5, 1.4, 'lavaHi', true);
    let lx = 168; for (let y = 24; y < 68; y++) { lx += ((y * 7) % 5 === 0 ? 1 : 0) + ((y * 3) % 7 === 0 ? -1 : 0); p.px(lx, y, 'lava'); p.px(lx + 1, y, 'lavaDk'); if (y % 6 < 3) p.px(lx - 1, y, 'lavaHi'); }
    // a range of black hills; the burning plain under it
    p.poly([[0, 66], [30, 56], [60, 62], [96, 54], [126, 66], [200, 66], [240, 58], [256, 62], [256, 76], [0, 76]], 'black');
    p.rect(0, 70, 256, 18, 'earth');
    for (let y = 72; y < 88; y += 3) for (let x = (y * 5) % 9; x < 256; x += 13) p.hline(x, x + 4, y, 'earthHi');
    // cracks in the ground with the glow coming up
    for (const [x0, y0, x1, y1] of [[10, 72, 34, 80], [60, 84, 96, 76], [110, 74, 138, 82], [160, 86, 196, 78], [214, 73, 246, 82]]) { p.line(x0, y0, x1, y1, 'crack'); p.line(x0, y0 + 1, x1, y1 + 1, 'crackDk'); }
    // dead trees, still alight at the tips
    for (const [x, y] of TREES) { p.line(x, y + 8, x, y, 'treeDk'); p.line(x, y + 3, x - 4, y - 2, 'treeDk'); p.line(x, y + 5, x + 4, y, 'treeDk'); p.px(x - 4, y - 3, 'flame'); p.px(x + 4, y - 1, 'flame'); p.px(x, y - 1, 'flameHi'); }
    // braziers at each end
    for (const x of [16, 234]) { p.rect(x - 1, 46, 3, 40, 'iron'); p.rect(x - 8, 44, 17, 6, 'ironHi'); p.rect(x - 7, 46, 15, 4, 'brazier'); p.rect(x - 9, 43, 19, 2, 'iron'); }
    p.rect(0, 84, 256, 4, 'earthSh'); p.hline(0, 255, 84, 'iron');
    for (const y of [72, 85]) p.rect(8, y, 240, 2, 'ironSh');
  },
  paintRing(p) {
    p.rect(0, 88, 256, 136, 'stone'); p.rect(0, 88, 256, 2, 'stoneHi');
    // charred slabs, the joints running with light
    for (let y = 100; y < 224; y += 22) for (let x = ((y / 22) | 0) % 2 ? 0 : 32; x < 256; x += 64) { p.rect(x, y, 64, 1, 'stoneDk'); p.rect(x, y, 1, 22, 'stoneDk'); p.px(x + 2, y + 2, 'stoneHi'); }
    p.dither(0, 90, 256, 16, 'stoneSh', 0.4); p.dither(0, 200, 256, 24, 'stoneSh', 0.35);
    // cracks with the glow coming up, and the ring's own seam
    for (const [x0, y0, x1, y1] of [[20, 104, 60, 130], [210, 108, 180, 140], [40, 210, 90, 190], [230, 200, 190, 218]]) { p.line(x0, y0, x1, y1, 'seam'); p.line(x0 + 1, y0, x1 + 1, y1, 'stoneDk'); }
    p.ellipse(128, 186, 78, 25, 'seam', false); p.ellipse(128, 186, 76, 24, 'stoneDk', false);
    for (let a = 0; a < 22; a++) { const t = (a / 22) * Math.PI * 2; p.px(128 + Math.cos(t) * 78, 186 + Math.sin(t) * 25, 'seamHi'); }
    ringRopes(p, [[60, 'ropeI', 'ropeIs'], [68, 'ropeR', 'ropeRs'], [76, 'ropeI', 'ropeIs']], ['stoneDk', 'stoneSh', 'stoneHi', 'stoneDk', 'ropeI', 'ropeIs']);
  },
  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 3) % 5) === 1) { set('lava', 'lavaHi'); set('crack', 'seamHi'); }
    if (((t >> 2) % 9) === 4) { set('flame', 'flameHi'); set('flameLo', 'flame'); }
    if (arena.react > 0 && (t >> 2) % 3 === 0) { set('sk4', 'flash'); set('sk3', 'sk4'); }
  },
  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // the braziers burn: three tongues each, the middle tallest
    for (const x of [16, 234]) for (const [dx, h] of [[-4, 8], [0, 14], [4, 9]]) { const hh = h + ((t + dx * 5) % 6 < 3 ? 2 : 0); for (let j = 0; j < hh; j++) frame.px(x + dx + (j > hh - 4 ? (t >> 2) % 2 : 0), 43 - j, col(j < hh * 0.4 ? 'flameHi' : j < hh * 0.75 ? 'flame' : 'flameLo')); }
    // embers rising off the whole plain
    for (const E of EMBERS) { const y = 84 - (((t * E.s + E.o) % 78)), x = E.x + Math.sin((t + E.o) / 18) * 5; if (y > 8) { frame.px(Math.round(x), Math.round(y), col('ember')); if (y > 50) frame.px(Math.round(x), Math.round(y) + 1, col('flameLo')); } }
    // smoke going up off the plain
    for (const S of SMOKE) for (let j = 0; j < 18; j++) { const y = 74 - j * 2, x = S.x + Math.sin((t + S.o + j * 7) / 20) * 5 + j * 0.3; if ((j + (t >> 3)) % 3 !== 0) frame.px(Math.round(x), y, col(j < 9 ? 'smokeHi' : 'smoke')); }
    seatedCrowdReact(frame, arena, t, col('ember'));
  },
};
