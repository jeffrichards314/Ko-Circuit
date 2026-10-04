// Underworld IV arena: the Hall of the Fallen (spec §2b, §18). A funeral hall of black marble under a roof lost in the dark: the
// champions of the upper world stand along the back wall in alcoves as statues (a broad block of a man, a cloaked figure with a bat's
// cape, a slim conductor with a baton, a king with a crown), each cracked across the face by something that came up from below, one with its
// head fallen off at its own feet. Tattered black-and-red banners hang between them and three lanterns of cold green fire on chains
// light the whole of it. The ring is a floor of black marble cracked with green light, its ropes gone to rust and dried blood; the crowd is
// shades in the aisles. Animated: the lanterns flicker (palette), dust hangs in the light and a low mist drifts along the floor (overlay);
// on a knockdown or a star the green flares.
import { makePalette } from '../../src/engine/palette.js';
import { shadePalette, crowdOf, ringRopes, seatedCrowdReact } from './_uw.js';

const hall = makePalette('underworld4.hall', {
  wallHi: [7, 6, 10], wall: [4, 3, 7], wallSh: [2, 2, 4], wallDk: [1, 0, 2],
  pillarHi: [11, 10, 14], pillar: [7, 6, 9], pillarSh: [3, 3, 5],
  banner: [12, 2, 5], bannerDk: [6, 1, 3], bannerTat: [17, 10, 10], glow: [10, 26, 18], glowDk: [4, 12, 9], flash: [20, 31, 26],
});
const stat = makePalette('underworld4.statues', {
  stoneHi: [16, 15, 18], stone: [10, 9, 12], stoneSh: [5, 5, 7], stoneDk: [2, 2, 3], crackk: [1, 1, 2],
  crown: [24, 18, 6], crownDk: [12, 8, 2], eyeGlow: [26, 4, 6], lantern: [12, 28, 20], lanternDk: [5, 14, 10],
  mist: [8, 10, 12], mistHi: [14, 16, 19], chain: [12, 12, 15],
});
const crowd = shadePalette('underworld4.crowd', [[5, 5, 9], [3, 3, 6], [8, 8, 12]], [[7, 4, 9], [4, 2, 6], [10, 6, 13], [2, 1, 4]]);
const ring = makePalette('underworld4.ring', {
  marbleHi: [12, 11, 15], marble: [7, 6, 10], marbleSh: [3, 3, 5], marbleDk: [1, 1, 2], seam: [4, 16, 11], seamHi: [14, 30, 22],
  ropeI: [11, 10, 14], ropeIs: [5, 5, 7], ropeR: [18, 3, 5], ropeRs: [9, 1, 3], shadow: [1, 0, 2], cap: [13, 12, 16], capHi: [20, 19, 24],
});
const DUST = Array.from({ length: 16 }, (_, i) => ({ x: (i * 61 + 13) % 250, s: 0.08 + ((i * 3) % 4) * 0.04, o: (i * 67) % 200 }));
const LANTERNS = [[68, 22], [128, 16], [188, 22]];

// one statue, 26 wide, standing on a pedestal at (x, 84): kind picks the silhouette
function statue(p, x, kind, headless = false) {
  const top = 84;
  p.rect(x - 15, top - 8, 30, 8, 'stoneSh'); p.rect(x - 15, top - 8, 30, 2, 'stone'); p.rect(x - 13, top - 10, 26, 2, 'stoneHi');
  const body = (poly, hi) => { p.poly(poly, 'stone'); p.poly(hi, 'stoneHi'); };
  if (kind === 0) { // a block of a man: shoulders like a wall
    body([[x - 13, top - 10], [x - 14, top - 34], [x - 9, top - 44], [x + 9, top - 44], [x + 14, top - 34], [x + 13, top - 10]], [[x - 13, top - 12], [x - 14, top - 34], [x - 9, top - 44], [x - 4, top - 44], [x - 6, top - 12]]);
    p.rect(x - 15, top - 34, 5, 20, 'stoneSh'); p.rect(x + 10, top - 34, 5, 20, 'stoneSh');
  } else if (kind === 1) { // cloaked, a bat's cape spread behind
    p.poly([[x - 24, top - 12], [x - 10, top - 44], [x, top - 30], [x + 10, top - 44], [x + 24, top - 12]], 'stoneSh');
    body([[x - 8, top - 10], [x - 8, top - 36], [x + 8, top - 36], [x + 8, top - 10]], [[x - 8, top - 10], [x - 8, top - 36], [x - 3, top - 36], [x - 3, top - 10]]);
  } else if (kind === 2) { // slim, one arm raised with a baton
    body([[x - 8, top - 10], [x - 7, top - 38], [x + 7, top - 38], [x + 8, top - 10]], [[x - 8, top - 10], [x - 7, top - 38], [x - 3, top - 38], [x - 3, top - 10]]);
    p.line(x + 7, top - 36, x + 16, top - 50, 'stoneHi'); p.line(x + 16, top - 50, x + 22, top - 62, 'stone');
  } else { // a king: broad, with a cape to the floor
    p.poly([[x - 17, top - 10], [x - 13, top - 40], [x + 13, top - 40], [x + 17, top - 10]], 'stoneSh');
    body([[x - 10, top - 10], [x - 11, top - 38], [x + 11, top - 38], [x + 10, top - 10]], [[x - 10, top - 10], [x - 11, top - 38], [x - 5, top - 38], [x - 5, top - 10]]);
  }
  const hy = kind === 0 ? top - 52 : top - 46;
  if (!headless) {
    p.ellipse(x, hy, 8, 9, 'stone', true); p.ellipse(x - 2, hy - 1, 5, 6, 'stoneHi', true);
    p.px(x - 3, hy, 'stoneDk'); p.px(x + 3, hy, 'stoneDk');
    if (kind === 3) { p.rect(x - 8, hy - 9, 16, 3, 'crown'); for (const dx of [-6, -2, 2, 6]) p.poly([[x + dx - 1, hy - 9], [x + dx, hy - 13], [x + dx + 1, hy - 9]], 'crown'); }
    p.line(x - 1, hy - 8, x + 3, hy + 8, 'crackk'); p.line(x + 3, hy + 8, x + 1, hy + 12, 'crackk'); // the crack across the face
    p.px(x - 3, hy - 1, 'eyeGlow'); p.px(x + 3, hy - 1, 'eyeGlow'); // something looks out of the cracks
  } else { p.rect(x - 4, hy + 8, 8, 3, 'stoneDk'); p.ellipse(x + 20, top - 2, 6, 5, 'stone', true); p.line(x + 18, top - 4, x + 22, top, 'crackk'); }
}

export default {
  id: 'underworld4',
  name: 'THE HALL OF THE FALLEN',
  circuit: 'u4',
  music: 'hallFight',
  palettes: [hall, stat, crowd, ring],
  ring: { canvas: ['marbleHi', 'marble', 'marbleSh', 'marbleDk'], ropes: ['ropeI', 'ropeR', 'ropeI'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
  shadowColor: 'shadow',
  crowd: crowdOf(6404),
  paintBack(p) {
    p.rect(0, 0, 256, 88, 'wall');
    for (let y = 0; y < 80; y += 14) { p.hline(0, 255, y, 'wallSh'); for (let x = (y / 14) % 2 ? 0 : 14; x < 256; x += 28) p.vline(x, y, y + 13, 'wallSh'); }
    p.dither(0, 0, 256, 40, 'wallDk', 0.5);
    // pillars between the alcoves
    for (const x of [6, 66, 130, 194, 250]) { p.rect(x - 5, 0, 11, 86, 'pillar'); p.rect(x - 5, 0, 3, 86, 'pillarHi'); p.rect(x + 3, 0, 3, 86, 'pillarSh'); p.rect(x - 7, 78, 15, 8, 'pillarSh'); p.rect(x - 7, 0, 15, 5, 'pillarSh'); }
    // the four champions, cracked: Brody, Midnight, Vale, Karver (Midnight's head is on the floor)
    statue(p, 36, 0); statue(p, 98, 1, true); statue(p, 162, 2); statue(p, 222, 3);
    // banners from the roof, tattered at the hem
    for (const [x, len] of [[80, 46], [146, 40], [206, 44], [20, 36]]) {
      p.rect(x - 6, 0, 13, len, 'banner'); p.rect(x - 6, 0, 13, 3, 'bannerDk');
      for (let i = 0; i < 4; i++) p.poly([[x - 6 + i * 3.5, len], [x - 4.5 + i * 3.5, len + 4 + (i * 5) % 6], [x - 3 + i * 3.5, len]], 'banner');
      for (const [dx, dy] of [[-1, 10], [0, 11], [1, 10], [0, 16], [-2, 22], [2, 24]]) p.px(x + dx, dy, 'bannerTat');
    }
    // the lanterns: green fire in a cage on a chain
    for (const [x, y] of LANTERNS) {
      for (let j = 0; j < y; j += 3) p.px(x, j, 'chain');
      p.rect(x - 4, y, 9, 10, 'lanternDk'); p.rect(x - 3, y + 1, 7, 8, 'lantern'); p.rect(x - 1, y + 3, 3, 4, 'glow');
      p.rect(x - 5, y - 1, 11, 2, 'pillarSh');
    }
    p.rect(0, 84, 256, 4, 'wallDk'); p.hline(0, 255, 84, 'pillarSh');
    for (const y of [72, 85]) p.rect(8, y, 240, 2, 'wallSh');
  },
  paintRing(p) {
    p.rect(0, 88, 256, 136, 'marble'); p.rect(0, 88, 256, 2, 'marbleHi');
    // black marble: big tiles, white veins, the joints cracked with green light
    for (let y = 92; y < 224; y += 22) for (let x = ((y / 22) | 0) % 2 ? 0 : 28; x < 256; x += 56) { p.rect(x, y, 56, 1, 'marbleDk'); p.rect(x, y, 1, 22, 'marbleDk'); p.px(x + 3, y + 3, 'marbleHi'); }
    for (const [x0, y0, x1, y1] of [[14, 110, 60, 104], [190, 118, 240, 112], [30, 196, 92, 204], [170, 200, 230, 194]]) p.line(x0, y0, x1, y1, 'marbleHi');
    p.dither(0, 90, 256, 16, 'marbleSh', 0.4); p.dither(0, 200, 256, 24, 'marbleSh', 0.35);
    for (const [x0, y0, x1, y1] of [[24, 100, 62, 126], [214, 106, 184, 138], [38, 212, 88, 192], [232, 202, 192, 220], [128, 178, 128, 196]]) { p.line(x0, y0, x1, y1, 'seam'); p.line(x0 + 1, y0, x1 + 1, y1, 'marbleDk'); }
    p.ellipse(128, 186, 78, 25, 'seam', false); p.ellipse(128, 186, 76, 24, 'marbleDk', false);
    ringRopes(p, [[60, 'ropeI', 'ropeIs'], [68, 'ropeR', 'ropeRs'], [76, 'ropeI', 'ropeIs']], ['marbleDk', 'marbleSh', 'marbleHi', 'marbleDk', 'ropeI', 'ropeIs']);
  },
  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 3) % 7) === 3) { set('glow', 'flash'); set('lantern', 'glow'); set('seam', 'seamHi'); }
    if (((t >> 4) % 13) === 5) set('eyeGlow', 'crown');
    if (arena.react > 0 && (t >> 2) % 3 === 0) { set('wallSh', 'glowDk'); set('seam', 'seamHi'); }
  },
  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // the lanterns burn, and light the dust
    for (const [x, y] of LANTERNS) for (const [dx, h] of [[-1, 4], [1, 5]]) { const hh = h + ((t + dx * 7) % 7 < 3 ? 1 : 0); for (let j = 0; j < hh; j++) frame.px(x + dx, y + 7 - j, col(j < 2 ? 'lantern' : 'glow')); }
    for (const D of DUST) { const y = 8 + (((t * D.s + D.o) % 76)), x = D.x + Math.sin((t + D.o) / 36) * 4; frame.px(Math.round(x), Math.round(y), col('mistHi')); }
    // a low mist along the foot of the wall, drifting
    for (let x = 0; x < 256; x++) { const y = 84 + Math.round(Math.sin((x + t * 0.4) * 0.09) * 1.6); if ((x + (t >> 3)) % 3) frame.px(x, y, col('mist')); if (!((x + (t >> 2)) % 5)) frame.px(x, y - 1, col('mistHi')); }
    seatedCrowdReact(frame, arena, t, col('glow'));
  },
};
