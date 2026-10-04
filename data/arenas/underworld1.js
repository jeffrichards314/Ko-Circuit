// Underworld I arena: Ferryman's Shore (spec §2b, §18). Fog and black water. The ring is the end of a long
// wooden landing stage, its planks wet and dark and worn into the shape of a circle by the feet of everyone who
// ever waited here. Behind it the water runs off into the fog: a far shore of black hills with a few
// lantern-lights, a ferry with a small hooded figure standing in the stern, tall mooring poles with
// green soul-lanterns at each end. The crowd is a row of shades in dark hoods on the landing's benches.
// Animated: the lanterns and the soul-light flicker (palette), fog drifts over the water, ripples widen on
// the river and wisps rise (overlay); on a knockdown or a star the whole shore flares pale.
import { makePalette } from '../../src/engine/palette.js';
import { shadePalette, crowdOf, ringRopes, seatedCrowdReact } from './_uw.js';

const shore = makePalette('underworld1.shore', {
  sky0: [1, 2, 5], sky1: [2, 4, 8], sky2: [4, 7, 12], sky3: [7, 11, 17],
  hill: [1, 1, 3], fog: [9, 14, 19], fogHi: [14, 20, 25],
  lampA: [28, 20, 6], lampB: [18, 10, 3], soul: [10, 27, 25], soulHi: [22, 31, 30], soulDk: [3, 12, 12],
  waterHi: [6, 11, 18], waterDk: [1, 3, 7], flash: [18, 24, 28],
});
const dock = makePalette('underworld1.dock', {
  plankHi: [11, 9, 8], plank: [6, 5, 5], plankSh: [3, 3, 3], plankDk: [1, 1, 2],
  ironHi: [15, 16, 19], iron: [8, 9, 12], ironSh: [4, 4, 6],
  post: [7, 5, 4], postHi: [13, 10, 8], postDk: [3, 2, 2], rope: [17, 14, 9], ropeDk: [8, 6, 4], moss: [5, 10, 6],
});
const crowd = shadePalette('underworld1.crowd', [[5, 5, 9], [3, 3, 6], [8, 8, 12]], [[5, 8, 14], [4, 6, 10], [8, 10, 15], [2, 3, 6]]);
const ring = makePalette('underworld1.ring', {
  plankHi: [12, 10, 9], plank: [7, 6, 5], plankSh: [4, 3, 3], plankDk: [1, 1, 2], rune: [6, 19, 18], runeDk: [3, 10, 10],
  ropeH: [17, 14, 9], ropeHs: [8, 6, 4], ropeI: [14, 15, 18], ropeIs: [7, 8, 11], shadow: [1, 1, 2], cap: [15, 16, 19], capHi: [22, 23, 26],
});
const WISPS = Array.from({ length: 10 }, (_, i) => ({ x: 30 + ((i * 47) % 200), s: 0.15 + ((i * 3) % 4) * 0.06, o: (i * 83) % 200 }));
const RIPPLES = Array.from({ length: 6 }, (_, i) => ({ x: 40 + ((i * 71) % 180), y: 68 + ((i * 13) % 14), o: (i * 61) % 180 }));

export default {
  id: 'underworld1',
  name: 'FERRYMAN\'S SHORE',
  circuit: 'u1',
  music: 'shoreFight',
  palettes: [shore, dock, crowd, ring],
  ring: { canvas: ['plankHi', 'plank', 'plankSh', 'plankDk'], ropes: ['ropeH', 'ropeI', 'ropeH'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
  shadowColor: 'shadow',
  crowd: crowdOf(6101),
  paintBack(p) {
    // the fog-bound sky, banded and dithered
    p.rect(0, 0, 256, 88, 'sky0');
    for (let i = 1; i < 4; i++) { p.rect(0, i * 13, 256, 13, `sky${i}`); p.dither(0, i * 13 - 4, 256, 4, `sky${i - 1}`, 0.5); }
    p.dither(0, 40, 256, 18, 'fog', 0.22);
    // the far shore: black hills and a few lantern-lights
    p.poly([[0, 62], [22, 52], [50, 58], [84, 46], [120, 56], [150, 50], [190, 58], [224, 48], [256, 56], [256, 66], [0, 66]], 'hill');
    for (const [x, y, k] of [[24, 60, 'lampA'], [66, 55, 'lampB'], [104, 60, 'lampA'], [148, 56, 'lampA'], [178, 61, 'lampB'], [212, 56, 'lampA'], [240, 60, 'lampB']]) { p.px(x, y, k); p.px(x, y + 1, 'lampB'); }
    // the water: black, the fog resting on it, the lamps reflected in short broken strokes
    p.rect(0, 66, 256, 22, 'waterDk');
    for (let y = 68; y < 86; y += 3) for (let x = (y * 7) % 11; x < 256; x += 11) p.hline(x, x + 3 + (y & 3), y, 'waterHi');
    p.dither(0, 66, 256, 6, 'fog', 0.5); p.dither(0, 72, 256, 5, 'fog', 0.25);
    for (const [x, k] of [[24, 'lampA'], [104, 'lampA'], [148, 'lampA'], [212, 'lampA']]) for (let j = 0; j < 9; j++) if (j % 3 !== 2) p.px(x + ((j * 5) % 3) - 1, 68 + j * 2, j < 4 ? k : 'lampB');
    // the ferry: a long black boat low on the water, a lantern at the bow, and the Ferryman in the stern with his pole
    p.poly([[28, 76], [78, 76], [72, 82], [34, 82]], 'hill'); p.poly([[28, 76], [24, 72], [30, 74]], 'hill');
    p.px(25, 72, 'soul'); p.px(25, 73, 'soulDk');
    p.rect(64, 60, 4, 16, 'hill'); p.ellipse(66, 59, 3, 3, 'hill', true); p.line(70, 48, 66, 76, 'hill');
    // tall mooring poles at the ends, green soul-lanterns hung from them
    for (const x of [14, 238]) {
      p.rect(x, 8, 5, 80, 'post'); p.vline(x + 1, 8, 87, 'postHi'); p.vline(x + 4, 8, 87, 'postDk'); p.rect(x - 1, 8, 7, 3, 'postDk');
      for (let y = 20; y < 84; y += 14) p.rect(x - 1, y, 7, 2, 'iron');
      p.line(x + 2, 14, x + (x < 100 ? 12 : -12), 14, 'ropeDk'); p.rect(x + (x < 100 ? 10 : -14), 14, 5, 8, 'soulDk'); p.rect(x + (x < 100 ? 11 : -13), 15, 3, 6, 'soul'); p.px(x + (x < 100 ? 12 : -12), 17, 'soulHi');
    }
    // the landing stage's back edge, and the benches the shades sit on
    p.rect(0, 84, 256, 4, 'plankDk'); p.hline(0, 255, 84, 'iron');
    for (const y of [72, 85]) p.rect(8, y, 240, 2, 'post');
  },
  paintRing(p) {
    p.rect(0, 88, 256, 136, 'plank'); p.rect(0, 88, 256, 2, 'plankHi');
    // long planks running away from you, seams and butt joints, worn dark toward the front
    for (let x = 0; x < 256; x += 18) p.vline(x, 90, 223, 'plankSh');
    for (let y = 96; y < 224; y += 14 + ((y - 96) >> 5)) for (let x = ((y * 5) % 18); x < 256; x += 36) p.hline(x, x + 17, y, 'plankDk');
    p.dither(0, 90, 256, 16, 'plankSh', 0.4); p.dither(0, 200, 256, 24, 'plankSh', 0.35);
    for (let i = 0; i < 40; i++) p.px((i * 97 + 13) % 256, 92 + ((i * 53) % 130), 'plankHi');
    // the circle worn into the boards by everyone who waited: a rune ring
    p.ellipse(128, 186, 78, 25, 'runeDk', false); p.ellipse(128, 186, 76, 24, 'plankDk', false);
    for (let a = 0; a < 24; a++) { const t = (a / 24) * Math.PI * 2; if (a % 3 === 0) p.px(128 + Math.cos(t) * 78, 186 + Math.sin(t) * 25, 'rune'); }
    ringRopes(p, [[60, 'ropeH', 'ropeHs'], [68, 'ropeI', 'ropeIs'], [76, 'ropeH', 'ropeHs']], ['plankDk', 'plankSh', 'plankHi', 'plankDk', 'ropeI', 'ropeIs']);
  },
  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 3) % 7) === 3) set('lampA', 'lampB');
    if (((t >> 4) & 3) === 2) { set('soul', 'soulHi'); set('soulDk', 'soul'); }
    if (arena.react > 0 && (t >> 2) % 4 === 0) { set('sky1', 'flash'); set('fog', 'fogHi'); }
  },
  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // fog banks sliding across the water
    for (let b = 0; b < 3; b++) {
      const y = 62 + b * 7, drift = ((t * (0.12 + b * 0.05)) % 300);
      for (let x = 0; x < 256; x += 2) { const n = Math.sin((x + drift * 6) * 0.05 + b) + Math.sin((x - drift * 3) * 0.13); if (n > 0.55 && ((x + y) & 1) === 0) frame.px(x, y + (n > 1.3 ? 1 : 0), col(n > 1.3 ? 'fogHi' : 'fog')); }
    }
    // ripples widening on the river
    for (const R of RIPPLES) {
      const k = ((t + R.o) % 180) / 180, w = 2 + Math.round(k * 12);
      if (k < 0.85) { frame.px(R.x - w, R.y, col('waterHi')); frame.px(R.x + w, R.y, col('waterHi')); if (k < 0.45) { frame.px(R.x - w + 1, R.y - 1, col('waterHi')); frame.px(R.x + w - 1, R.y - 1, col('waterHi')); } }
    }
    // wisps of soul-light rising off the water
    for (const W of WISPS) { const y = 84 - (((t * W.s + W.o) % 70)), x = W.x + Math.sin((t + W.o) / 16) * 4; if (y > 20) { frame.px(Math.round(x), Math.round(y), col('soul')); if (y > 60) frame.px(Math.round(x), Math.round(y) + 1, col('soulDk')); } }
    seatedCrowdReact(frame, arena, t, col('soulHi'));
  },
};
