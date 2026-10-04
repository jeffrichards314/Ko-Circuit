// The boss arena: the Throne of Vorgath (spec §2b, §18). The deepest hall of the Underworld: a cavern roofed by the ribs of something
// larger than the world, and at the back of it THE THRONE, cut from the skull and spine of a dead titan, its jaws open round the empty
// seat, red light in its eye sockets. Braziers of dull red flame stand in a ring, a few shades sit in the dark of the ribs. The ring is a
// slab of cracked black stone hung over nothing: its edges are broken and glow faintly red where they end. Vorgath fights in near-darkness (the
// `gloom` modifier, which also takes a piece of this floor away in each phase), so what you actually see of this room is a few red
// points and the edge of the stone.
// Animated: the braziers pulse (palette) and embers fall from the ribs (overlay); on a knockdown or a star the eye sockets flare.
import { makePalette } from '../../src/engine/palette.js';
import { shadePalette, crowdOf, ringRopes, seatedCrowdReact } from './_uw.js';

const hall = makePalette('vorgath.hall', {
  rockHi: [6, 4, 6], rock: [3, 2, 4], rockSh: [1, 1, 2], rockDk: [0, 0, 1], boneHi: [17, 15, 14], bone: [11, 9, 9], boneSh: [5, 4, 5], boneDk: [2, 1, 2],
  redHi: [31, 14, 12], red: [26, 5, 6], redLo: [14, 2, 4], redDk: [7, 1, 2], flash: [31, 24, 22], spine: [13, 11, 11],
});
const props = makePalette('vorgath.props', {
  ironHi: [14, 11, 12], iron: [7, 6, 7], ironSh: [3, 2, 3], bowl: [9, 5, 6], flameHi: [31, 22, 12], flame: [28, 9, 5], flameLo: [16, 3, 3], ember: [31, 16, 8],
  cloth: [10, 1, 3], clothDk: [5, 0, 2], chain: [12, 10, 11], chainDk: [4, 3, 4], smoke: [4, 3, 4], smokeHi: [9, 6, 7],
});
const crowd = shadePalette('vorgath.crowd', [[4, 2, 4], [2, 1, 3], [6, 3, 5]], [[6, 1, 3], [3, 0, 2], [9, 2, 4], [1, 0, 1]], [0, 0, 1]);
const ring = makePalette('vorgath.ring', {
  slabHi: [8, 7, 9], slab: [4, 3, 5], slabSh: [2, 1, 3], slabDk: [0, 0, 1], crack: [24, 4, 6], crackHi: [31, 14, 12], edge: [14, 2, 4],
  ropeI: [9, 7, 9], ropeIs: [4, 3, 4], ropeR: [16, 2, 4], ropeRs: [8, 1, 2], shadow: [0, 0, 1], cap: [11, 9, 11], capHi: [17, 14, 16],
});
const EMBERS = Array.from({ length: 16 }, (_, i) => ({ x: (i * 59 + 19) % 250, s: 0.15 + ((i * 3) % 5) * 0.07, o: (i * 53) % 260 }));
const BRAZIERS = [22, 78, 178, 234];

export default {
  id: 'vorgath',
  name: 'THE THRONE OF VORGATH',
  circuit: 'vorgath',
  music: 'vorgathI',
  palettes: [hall, props, crowd, ring],
  ring: { canvas: ['slabHi', 'slab', 'slabSh', 'slabDk'], ropes: ['ropeI', 'ropeR', 'ropeI'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
  shadowColor: 'shadow',
  crowd: crowdOf(6707, { density: 0.25 }),
  paintBack(p) {
    p.rect(0, 0, 256, 88, 'rock');
    p.dither(0, 0, 256, 60, 'rockDk', 0.55);
    // the ribs of the roof: great curved bones coming down either side
    for (const [x0, dir] of [[0, 1], [256, -1]]) for (let i = 0; i < 4; i++) { const bx = x0 + dir * (10 + i * 22); for (let y = 0; y < 70; y++) { const x = bx + dir * Math.round(Math.pow(y / 70, 1.8) * 26); p.rect(x, y, 5, 1, 'bone'); p.px(x, y, 'boneHi'); p.px(x + 4, y, 'boneSh'); } }
    // the throne: a titan's skull, its jaws open round an empty seat, a spine rising behind it
    p.rect(112, 0, 32, 20, 'spine'); for (let y = 2; y < 22; y += 5) { p.rect(108, y, 40, 3, 'bone'); p.rect(108, y, 40, 1, 'boneHi'); }
    p.ellipse(128, 44, 50, 34, 'bone', true); p.ellipse(124, 40, 42, 28, 'boneHi', true); p.ellipse(128, 46, 44, 30, 'bone', true);
    p.ellipse(108, 40, 11, 13, 'rockDk', true); p.ellipse(148, 40, 11, 13, 'rockDk', true); // the sockets
    p.ellipse(108, 41, 6, 8, 'redDk', true); p.ellipse(148, 41, 6, 8, 'redDk', true); p.ellipse(108, 42, 3, 5, 'red', true); p.ellipse(148, 42, 3, 5, 'red', true);
    p.poly([[124, 50], [132, 50], [130, 60], [126, 60]], 'boneSh'); // the nasal cavity
    // the open jaws: teeth above, teeth below, the empty seat between them
    p.rect(88, 60, 80, 26, 'rockDk'); p.rect(96, 64, 64, 22, 'redDk'); p.rect(108, 70, 40, 16, 'clothDk');
    for (let x = 90; x < 166; x += 8) { p.poly([[x, 60], [x + 4, 72], [x + 8, 60]], 'boneHi'); p.poly([[x + 1, 86], [x + 4, 76], [x + 7, 86]], 'bone'); }
    p.rect(112, 64, 32, 22, 'cloth'); p.rect(112, 64, 32, 2, 'clothDk'); // the throne's cushion, black-red
    // braziers in a ring, a chain of red from the roof to each
    for (const x of BRAZIERS) { for (let y = 0; y < 44; y += 3) p.px(x, y, 'chain'); p.rect(x - 7, 44, 15, 6, 'bowl'); p.rect(x - 7, 44, 15, 2, 'ironHi'); p.rect(x - 1, 50, 3, 34, 'iron'); }
    p.rect(0, 84, 256, 4, 'rockDk'); p.hline(0, 255, 84, 'boneSh');
    for (const y of [72, 85]) p.rect(8, y, 240, 2, 'rockSh');
  },
  paintRing(p) {
    p.rect(0, 88, 256, 136, 'slab'); p.rect(0, 88, 256, 2, 'slabHi');
    for (let y = 92; y < 224; y += 26) for (let x = ((y / 26) | 0) % 2 ? 0 : 34; x < 256; x += 68) { p.rect(x, y, 68, 1, 'slabDk'); p.rect(x, y, 1, 26, 'slabDk'); p.px(x + 3, y + 3, 'slabHi'); }
    p.dither(0, 90, 256, 16, 'slabSh', 0.45); p.dither(0, 200, 256, 24, 'slabSh', 0.4);
    // cracks with a red light in them, and the ring's own edge
    for (const [x0, y0, x1, y1] of [[18, 104, 62, 130], [218, 108, 182, 140], [38, 212, 88, 192], [234, 202, 190, 220], [128, 176, 118, 196], [128, 178, 140, 198]]) { p.line(x0, y0, x1, y1, 'crack'); p.line(x0 + 1, y0, x1 + 1, y1, 'slabDk'); }
    p.ellipse(128, 186, 78, 25, 'crack', false); p.ellipse(128, 186, 76, 24, 'slabDk', false);
    // the broken edges of the slab at both ends: chunks already gone, a dull red where the stone ends
    for (const [x, dir] of [[0, 1], [255, -1]]) for (let y = 130; y < 224; y += 9) { const w = 6 + ((y * 7) % 9); for (let i = 0; i < w; i++) p.px(x + dir * i, y + (i & 1), 'edge'); }
    ringRopes(p, [[60, 'ropeI', 'ropeIs'], [68, 'ropeR', 'ropeRs'], [76, 'ropeI', 'ropeIs']], ['slabDk', 'slabSh', 'slabHi', 'slabDk', 'ropeI', 'ropeIs']);
  },
  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 3) % 6) === 2) { set('flame', 'flameHi'); set('flameLo', 'flame'); set('crack', 'crackHi'); }
    if (((t >> 4) % 7) === 3) { set('red', 'redHi'); set('redDk', 'red'); }
    if (arena.react > 0 && (t >> 2) % 3 === 0) { set('red', 'flash'); set('redDk', 'redHi'); }
  },
  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    for (const x of BRAZIERS) for (const [dx, h] of [[-3, 6], [0, 11], [3, 7]]) { const hh = h + ((t + dx * 5) % 6 < 3 ? 2 : 0); for (let j = 0; j < hh; j++) frame.px(x + dx, 43 - j, col(j < hh * 0.4 ? 'flameHi' : j < hh * 0.75 ? 'flame' : 'flameLo')); }
    for (const E of EMBERS) { const y = 6 + (((t * E.s + E.o) % 78)), x = E.x + Math.sin((t + E.o) / 20) * 5; frame.px(Math.round(x), Math.round(y), col('ember')); }
    seatedCrowdReact(frame, arena, t, col('ember'));
  },
};
