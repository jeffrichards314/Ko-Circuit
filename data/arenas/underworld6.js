// Underworld VI arena: the Abyss Gate (spec §2b, §18). The throne's doorway: a cavern of black basalt and, filling the back of it, the
// GATE itself, two leaves of black iron 60 feet tall with the King's crown cut into them and a seam down the middle that a cold white-violet
// light comes through; chains as thick as a man hold the leaves shut, a flight of steps runs up to them, a pillar on each side carries a skull
// with violet fire in a bowl on its head. Mist lies on the floor. The ring is black basalt with a rune circle burning violet in it, its
// ropes dark iron with violet glints. The crowd is pale shades far back in the dark.
// `underworld6d` is the same gate dressed for Dash, the King's Champion (spec §18 A5): his teal-and-gold banner hangs from the left pillar, torn,
// with the King's crown branded on it in black, and a black chain across it.
// Animated: the light in the seam pulses and the fire in the bowls flickers (palette), mist drifts and motes fall through the light (overlay);
// on a knockdown or a star the seam flares.
import { makePalette } from '../../src/engine/palette.js';
import { shadePalette, crowdOf, ringRopes, seatedCrowdReact } from './_uw.js';

const gate = makePalette('underworld6.gate', {
  doorHi: [10, 9, 14], door: [6, 5, 9], doorSh: [3, 3, 5], doorDk: [1, 1, 3], rune: [16, 10, 24], runeHi: [24, 20, 31],
  light: [22, 20, 31], lightDk: [10, 8, 20], mist: [7, 7, 12], mistHi: [12, 12, 20], chain: [11, 11, 15], chainDk: [4, 4, 7], flash: [30, 28, 31],
});
const props = makePalette('underworld6.props', {
  stoneHi: [8, 8, 12], stone: [5, 5, 8], stoneSh: [2, 2, 4], skull: [24, 24, 22], skullDk: [12, 12, 12],
  fireHi: [22, 18, 31], fire: [14, 8, 26], fireLo: [8, 4, 16], teal: [3, 21, 20], tealDk: [1, 11, 12], gold: [30, 24, 6], goldDk: [18, 12, 2], mark: [2, 1, 4],
});
const crowd = shadePalette('underworld6.crowd', [[5, 5, 10], [3, 3, 7], [8, 8, 14]], [[6, 6, 12], [4, 4, 9], [9, 9, 16], [2, 2, 5]]);
const ring = makePalette('underworld6.ring', {
  baHi: [9, 9, 13], ba: [5, 5, 8], baSh: [2, 2, 4], baDk: [1, 1, 2], runeR: [16, 10, 26], runeRHi: [26, 22, 31],
  ropeI: [10, 10, 15], ropeIs: [4, 4, 7], ropeR: [14, 8, 24], ropeRs: [7, 3, 13], shadow: [1, 1, 2], cap: [13, 13, 18], capHi: [20, 20, 27],
});
const MOTES = Array.from({ length: 18 }, (_, i) => ({ x: 70 + ((i * 53 + 7) % 116), s: 0.1 + ((i * 3) % 4) * 0.05, o: (i * 43) % 90 }));
const MIST = Array.from({ length: 6 }, (_, i) => ({ x: i * 48, o: i * 37 }));

function build(dash) {
  return {
    id: dash ? 'underworld6d' : 'underworld6',
    name: 'THE ABYSS GATE',
    circuit: dash ? 'rival8' : 'u6',
    music: dash ? 'rivalAbyss' : 'abyssFight',
    palettes: [gate, props, crowd, ring],
    ring: { canvas: ['baHi', 'ba', 'baSh', 'baDk'], ropes: ['ropeI', 'ropeR', 'ropeI'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
    shadowColor: 'shadow',
    crowd: crowdOf(dash ? 6613 : 6603),
    paintBack(p) {
      p.rect(0, 0, 256, 88, 'stoneSh');
      // basalt columns, the far wall
      for (let x = 0; x < 256; x += 14) { p.vline(x, 0, 86, 'stone'); p.vline(x + 1, 0, 86, 'stoneHi'); }
      p.dither(0, 0, 256, 44, 'doorDk', 0.55);
      // the light behind the gate, spilling out at the seam and along the foot of it
      p.ellipse(128, 76, 62, 40, 'lightDk', true); p.dither(72, 30, 112, 50, 'mist', 0.3, (i, j) => p.get(i, j) === p.c('lightDk'));
      // the gate: two leaves of black iron, the crown cut into each, the seam of light between
      for (const [x0, dir] of [[66, 1], [190, -1]]) {
        const x = dir > 0 ? x0 : x0 - 60;
        p.rect(x, 6, 60, 78, 'door'); p.rect(x, 6, 60, 3, 'doorHi'); p.rect(x, 6, 2, 78, 'doorHi'); p.rect(x + 58, 6, 2, 78, 'doorSh');
        for (const by of [22, 44, 66]) p.rect(x, by, 60, 3, 'doorSh');
        for (let rx = x + 6; rx < x + 56; rx += 12) for (const ry of [14, 34, 56, 75]) { p.px(rx, ry, 'doorHi'); p.px(rx + 1, ry, 'doorDk'); }
        // the crown of Vorgath in the middle of the leaf
        const cx = x + 30, cy = 44;
        p.rect(cx - 12, cy + 6, 25, 4, 'rune');
        for (let i = -2; i <= 2; i++) p.poly([[cx + i * 6 - 3, cy + 6], [cx + i * 6, cy - 8 - (2 - Math.abs(i)) * 2 + 4], [cx + i * 6 + 3, cy + 6]], 'rune');
        p.px(cx, cy - 4, 'runeHi'); p.px(cx - 6, cy - 2, 'runeHi'); p.px(cx + 6, cy - 2, 'runeHi');
      }
      p.rect(125, 6, 6, 78, 'light'); p.rect(127, 6, 2, 78, 'flash');
      // chains across the leaves, as thick as a man
      for (const [y0, y1] of [[24, 36], [58, 46]]) for (let t = 0; t <= 60; t++) { const x = 68 + t * 2, y = Math.round(y0 + (y1 - y0) * (t / 60) + Math.sin(t / 60 * Math.PI) * 5); p.rect(x, y, 3, 3, t & 1 ? 'chain' : 'chainDk'); }
      // the steps up to it
      for (let i = 0; i < 4; i++) { const y = 84 - i * 3; p.rect(66 - i * 3, y, 124 + i * 6, 3, i & 1 ? 'stoneHi' : 'stone'); }
      // a pillar each side with a skull and a bowl of violet fire
      for (const x of [22, 234]) {
        p.rect(x - 8, 20, 16, 66, 'stone'); p.rect(x - 8, 20, 3, 66, 'stoneHi'); p.rect(x + 5, 20, 3, 66, 'stoneSh');
        p.ellipse(x, 30, 7, 8, 'skull', true); p.rect(x - 3, 36, 7, 5, 'skull'); p.rect(x - 4, 28, 3, 3, 'skullDk'); p.rect(x + 2, 28, 3, 3, 'skullDk'); p.px(x, 34, 'skullDk');
        p.rect(x - 9, 16, 19, 4, 'stoneHi'); p.rect(x - 7, 12, 15, 4, 'stoneSh');
      }
      if (dash) {
        // Dash's banner from the left pillar, torn, the King's crown branded on it in black, a black chain across it
        const x = 30, y0 = 34;
        p.rect(x, y0, 24, 38, 'tealDk'); p.rect(x + 2, y0 + 2, 20, 34, 'teal'); p.poly([[x + 2, y0 + 36], [x + 22, y0 + 36], [x + 14, y0 + 46], [x + 10, y0 + 40]], 'teal');
        p.rect(x + 2, y0 + 2, 20, 2, 'gold'); p.ellipse(x + 12, y0 + 18, 6, 7, 'goldDk', true); p.ellipse(x + 12, y0 + 18, 4.4, 5.4, 'gold', true);
        for (const [dx, dy] of [[10, 15], [10, 17], [10, 19], [12, 15], [12, 20], [14, 17], [14, 18]]) p.px(x + dx, y0 + dy, 'tealDk');
        p.rect(x + 3, y0 + 22, 18, 3, 'mark'); for (let i = -2; i <= 2; i++) p.poly([[x + 12 + i * 3.4 - 1.6, y0 + 22], [x + 12 + i * 3.4, y0 + 15 - Math.abs(i)], [x + 12 + i * 3.4 + 1.6, y0 + 22]], 'mark');
        p.line(x - 2, y0 + 6, x + 26, y0 + 34, 'chainDk'); p.line(x - 2, y0 + 7, x + 26, y0 + 35, 'chain');
      }
      p.rect(0, 84, 256, 4, 'doorDk'); p.hline(0, 255, 84, 'stoneHi');
      for (const y of [72, 85]) p.rect(8, y, 240, 2, 'stoneSh');
    },
    paintRing(p) {
      p.rect(0, 88, 256, 136, 'ba'); p.rect(0, 88, 256, 2, 'baHi');
      // basalt flags, the joints dark
      for (let y = 92; y < 224; y += 24) for (let x = ((y / 24) | 0) % 2 ? 0 : 30; x < 256; x += 60) { p.rect(x, y, 60, 1, 'baDk'); p.rect(x, y, 1, 24, 'baDk'); p.px(x + 3, y + 3, 'baHi'); }
      p.dither(0, 90, 256, 16, 'baSh', 0.4); p.dither(0, 200, 256, 24, 'baSh', 0.35);
      // the rune circle, burning violet: two rings and the spokes between them
      p.ellipse(128, 186, 78, 25, 'runeR', false); p.ellipse(128, 186, 76, 24, 'baDk', false); p.ellipse(128, 186, 54, 17, 'runeR', false);
      for (let a = 0; a < 12; a++) { const t = (a / 12) * Math.PI * 2; p.line(128 + Math.cos(t) * 54, 186 + Math.sin(t) * 17, 128 + Math.cos(t) * 78, 186 + Math.sin(t) * 25, 'runeR'); p.px(128 + Math.cos(t) * 66, 186 + Math.sin(t) * 21, 'runeRHi'); }
      ringRopes(p, [[60, 'ropeI', 'ropeIs'], [68, 'ropeR', 'ropeRs'], [76, 'ropeI', 'ropeIs']], ['baDk', 'baSh', 'baHi', 'baDk', 'ropeI', 'ropeIs']);
    },
    paletteAnim(t, live, pal, state, arena) {
      const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
      if (((t >> 4) % 5) === 2) { set('light', 'flash'); set('lightDk', 'light'); }
      if (((t >> 3) % 6) === 3) { set('fire', 'fireHi'); set('fireLo', 'fire'); set('runeR', 'runeRHi'); }
      if (arena.react > 0 && (t >> 2) % 3 === 0) { set('light', 'flash'); set('rune', 'runeHi'); }
    },
    overlay(frame, arena, t) {
      const col = (k) => arena.live[arena.pal.idx(k)];
      // the bowls of violet fire on the skulls
      for (const x of [22, 234]) for (const [dx, h] of [[-4, 6], [0, 11], [4, 7]]) { const hh = h + ((t + dx * 7) % 7 < 3 ? 2 : 0); for (let j = 0; j < hh; j++) frame.px(x + dx + (j > hh - 3 ? (t >> 2) % 2 : 0), 11 - j, col(j < hh * 0.4 ? 'fireHi' : j < hh * 0.75 ? 'fire' : 'fireLo')); }
      // motes falling through the light of the seam
      for (const M of MOTES) { const y = 8 + (((t * M.s + M.o) % 76)); frame.px(Math.round(M.x + Math.sin((t + M.o) / 30) * 3), Math.round(y), col('mistHi')); }
      // mist along the foot of the steps
      for (const S of MIST) for (let i = 0; i < 44; i++) { const x = Math.round(S.x + i + (t * 0.3 + S.o) % 30 - 15), y = 83 + Math.round(Math.sin((i + t * 0.5 + S.o) / 6) * 1.6); if (x >= 0 && x < 256 && (i + (t >> 3)) % 3) frame.px(x, y, col(i & 1 ? 'mist' : 'mistHi')); }
      seatedCrowdReact(frame, arena, t, col('fireHi'));
    },
  };
}
export const ABYSS_GATE = { underworld6: build(false), underworld6d: build(true) };
export default ABYSS_GATE.underworld6;
