// Pantheon VII arena: the Summit (spec §2b, §18). The top of the stairs: a white-and-gold terrace on the last
// step before the gates of light. Behind the ring the gates themselves: two colossal fluted columns and a
// door of pure light, rays fanning out of it across a pale gold sky, statues of winged figures on
// plinths either side, and a crowd of robed watchers in white and gold. The ring is white marble with a
// gold sun inlaid, gold-and-white ropes.
// Animated: the light in the gates pulses and the rays turn slowly (palette and overlay), feathers
// drift down, the crowd reacts; on a knockdown or a star the gates blaze white.
import { makePalette } from '../../src/engine/palette.js';
import { crowdPalette, crowdOf, ringRopes, seatedCrowdReact } from './_zone.js';

const sky = makePalette('pantheon7.sky', {
  s0: [31, 30, 22], s1: [31, 28, 17], s2: [30, 25, 13], s3: [28, 21, 12], s4: [24, 17, 13],
  door: [31, 31, 31], doorGlow: [31, 31, 26], ray: [31, 29, 16], cloudHi: [31, 28, 26], cloud: [27, 22, 21], feather: [31, 31, 31], flash: [31, 31, 30],
});
const hall = makePalette('pantheon7.hall', {
  marbleHi: [31, 31, 30], marble: [28, 27, 26], marbleSh: [21, 20, 22], marbleDk: [12, 12, 16], vein: [23, 22, 24],
  goldHi: [31, 30, 16], gold: [28, 21, 5], goldDk: [16, 10, 2], wing: [30, 30, 31], wingSh: [22, 22, 27],
});
const crowd = crowdPalette('pantheon7.crowd', [[31, 30, 27], [29, 22, 7], [30, 26, 20], [18, 15, 17]], [4, 3, 6]);
const ring = makePalette('pantheon7.ring', {
  tileHi: [31, 31, 29], tile: [28, 27, 25], tileSh: [21, 20, 21], tileDk: [12, 11, 14], sun: [29, 22, 6], sunHi: [31, 30, 16],
  ropeG: [31, 26, 9], ropeGs: [19, 13, 3], ropeW: [31, 30, 28], ropeWs: [21, 20, 22], capHi: [31, 30, 16], cap: [28, 21, 5], shadow: [19, 18, 21],
});
const FEATHERS = Array.from({ length: 14 }, (_, i) => ({ x: (i * 79 + 17) % 250, s: 0.2 + ((i * 5) % 4) * 0.07, o: (i * 149) % 500 }));

export default {
  id: 'pantheon7',
  name: 'THE SUMMIT',
  circuit: 'p7',
  music: 'summitFight',
  palettes: [sky, hall, crowd, ring],
  ring: { canvas: ['tileHi', 'tile', 'tileSh', 'tileDk'], ropes: ['ropeG', 'ropeW', 'ropeG'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
  shadowColor: 'shadow',
  crowd: crowdOf(5707),
  paintBack(p) {
    const bands = ['s0', 's1', 's2', 's3', 's4'];
    bands.forEach((k, i) => p.rect(0, i * 18, 256, 18, k));
    for (let i = 1; i < bands.length; i++) p.dither(0, i * 18 - 4, 256, 4, bands[i - 1], 0.5);
    // the gate of light: a tall arch of white
    p.ellipse(128, 52, 46, 44, 'doorGlow', true); p.rect(82, 52, 92, 22, 'doorGlow');
    p.ellipse(128, 52, 36, 36, 'door', true); p.rect(92, 52, 72, 22, 'door');
    for (let a = -7; a <= 7; a++) { const t = a * 0.21; for (let d = 46; d < 130; d += 2) p.px(128 + Math.sin(t) * d * 1.3, 62 - Math.cos(t) * d * 0.7, (d + a) % 4 ? 'ray' : 'doorGlow'); }
    // two colossal fluted columns and a lintel
    for (const x of [62, 182]) { p.rect(x, 0, 12, 76, 'marble'); p.vline(x + 1, 0, 75, 'marbleHi'); p.vline(x + 5, 0, 75, 'marbleSh'); p.vline(x + 10, 0, 75, 'marbleSh'); p.rect(x - 3, 0, 18, 4, 'goldHi'); p.rect(x - 3, 70, 18, 6, 'goldDk'); p.rect(x - 2, 70, 16, 3, 'gold'); }
    p.rect(62, 0, 120, 6, 'gold'); p.hline(62, 181, 0, 'goldHi'); p.hline(62, 181, 5, 'goldDk');
    // winged statues on plinths either side
    for (const [x, dir] of [[20, -1], [226, 1]]) {
      p.rect(x - 8, 56, 20, 20, 'marbleSh'); p.rect(x - 8, 56, 20, 3, 'marbleHi');
      p.rect(x - 3, 30, 10, 26, 'marble'); p.ellipse(x + 2, 26, 5, 6, 'marble', true);
      for (let i = 0; i < 6; i++) p.line(x + 2 + dir * 3, 40 + i * 2, x + 2 + dir * (16 + i), 26 + i * 4, i & 1 ? 'wing' : 'wingSh');
      p.px(x, 25, 'marbleDk'); p.px(x + 4, 25, 'marbleDk');
    }
    // clouds below the terrace and the rail
    for (let x = 0; x < 256; x += 30) { p.ellipse(x + 10, 84, 20, 6, 'cloud', true); p.ellipse(x + 8, 82, 14, 4, 'cloudHi', true); }
    p.rect(0, 74, 256, 3, 'marbleHi'); p.rect(0, 77, 256, 4, 'marble'); p.rect(0, 81, 256, 3, 'marbleSh');
    for (let x = 6; x < 256; x += 22) { p.rect(x, 62, 5, 12, 'marble'); p.vline(x, 62, 73, 'marbleHi'); }
  },
  paintRing(p) {
    p.rect(0, 84, 256, 4, 'marbleSh');
    p.rect(0, 88, 256, 136, 'tile'); p.rect(0, 88, 256, 2, 'tileHi');
    p.dither(0, 90, 256, 18, 'tileSh', 0.3);
    for (const [x, y, l] of [[30, 124, 24], [190, 138, 30], [90, 208, 22], [206, 190, 20], [60, 168, 20]]) for (let i = 0; i < l; i++) p.px(x + i, y + Math.round(Math.sin(i * 0.45) * 2) + (i >> 3), 'vein');
    // a gold sun inlaid where they fight
    p.ellipse(128, 186, 70, 22, 'sun', false);
    for (let a = 0; a < 20; a++) { const t = (a / 20) * Math.PI * 2; for (let d = 26; d < 60; d += 3) p.px(128 + Math.cos(t) * d * 1.15, 186 + Math.sin(t) * d * 0.33, a & 1 ? 'sun' : 'sunHi'); }
    ringRopes(p, [[60, 'ropeG', 'ropeGs'], [68, 'ropeW', 'ropeWs'], [76, 'ropeG', 'ropeGs']], ['marbleDk', 'marbleSh', 'marbleHi', 'goldDk', 'gold', 'goldHi']);
  },
  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 5) & 3) === 1) { set('doorGlow', 'door'); set('ray', 'doorGlow'); }
    if (arena.react > 0 && (t >> 2) % 4 === 0) { set('s2', 'flash'); set('s3', 'flash'); set('doorGlow', 'flash'); }
  },
  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    for (const F of FEATHERS) {
      const y = ((t * F.s + F.o) % 240) - 10, x = F.x + Math.sin((t + F.o) / 22) * 8;
      if (y < 38 || y > 208) continue;
      frame.px(Math.round(x), Math.round(y), col('feather')); frame.px(Math.round(x) + 1, Math.round(y) + 1, col('feather')); frame.px(Math.round(x) - 1, Math.round(y) + 1, col('cloud'));
    }
    seatedCrowdReact(frame, arena, t, col('door'));
  },
};
