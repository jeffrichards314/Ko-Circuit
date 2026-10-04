// Pantheon VI arena: the Mirror Sanctum (spec §2b, §18). A hall of crystal: tall mirror panes in
// silver frames all round the back wall, each catching a slice of a pale violet sky, a chandelier of
// glass over the ring, and a crowd of reflections in white-and-lilac robes. The ring is a mirrored floor
// of black-and-silver tile with crystal-white ropes.
// `pantheon6d` is the same hall for Dash Desperate (spec §18 A5): one pane is cracked across, and his
// teal-and-gold banner hangs torn from the frame.
// Animated: glints slide across the panes (overlay), the chandelier turns and throws light (palette),
// the crowd reacts; on a knockdown or a star every pane flashes white and a crack runs across one.
import { makePalette } from '../../src/engine/palette.js';
import { crowdPalette, crowdOf, ringRopes, seatedCrowdReact } from './_zone.js';

const glass = makePalette('pantheon6.glass', {
  paneA: [14, 12, 24], paneB: [19, 16, 29], paneC: [24, 21, 31], paneHi: [30, 29, 31], paneDk: [8, 6, 16],
  frameHi: [30, 30, 31], frame: [21, 22, 28], frameSh: [12, 12, 19], frameDk: [5, 5, 10],
  sky: [12, 9, 22], glint: [31, 31, 31], lilac: [22, 16, 30], crack: [3, 2, 7], flash: [31, 30, 31],
});
const hall = makePalette('pantheon6.hall', {
  wall: [7, 6, 13], wallSh: [4, 3, 8], wallHi: [11, 10, 19], gold: [28, 22, 6], goldDk: [15, 11, 2],
  chandHi: [31, 31, 31], chand: [22, 24, 31], chandSh: [12, 14, 24], teal: [3, 21, 20], tealDk: [1, 11, 12], goldDash: [30, 24, 6],
  bench: [10, 9, 17], benchHi: [16, 15, 25],
});
const crowd = crowdPalette('pantheon6.crowd', [[26, 25, 31], [19, 16, 29], [30, 28, 31], [13, 12, 22]], [3, 2, 7]);
const ring = makePalette('pantheon6.ring', {
  tileHi: [27, 27, 31], tile: [6, 6, 12], tileSh: [3, 3, 8], tileDk: [1, 1, 4], tileB: [20, 20, 27], tileBs: [12, 12, 19],
  ropeW: [31, 31, 31], ropeWs: [17, 18, 26], ropeL: [22, 16, 30], ropeLs: [12, 8, 20], shadow: [1, 1, 4], capHi: [31, 31, 31], cap: [21, 22, 28],
});
const GLINTS = Array.from({ length: 8 }, (_, i) => ({ x: (i * 43 + 10) % 230, y: 12 + ((i * 17) % 44), s: 0.5 + (i % 3) * 0.3, o: (i * 91) % 300 }));
const PANES = [[10, 30], [44, 34], [78, 30], [112, 34], [146, 30], [180, 34], [214, 30]]; // x, height

function build(dash) {
  return {
    id: dash ? 'pantheon6d' : 'pantheon6',
    name: 'THE MIRROR SANCTUM',
    circuit: dash ? 'rival6' : 'p6',
    music: dash ? 'rivalDesperate' : 'sanctumFight',
    palettes: [glass, hall, crowd, ring],
    ring: { canvas: ['tileB', 'tile', 'tileSh', 'tileDk'], ropes: ['ropeW', 'ropeL', 'ropeW'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
    shadowColor: 'shadow',
    crowd: crowdOf(dash ? 5616 : 5606),
    paintBack(p) {
      p.rect(0, 0, 256, 88, 'wall');
      // the mirror panes: tall arched glass in silver frames, each with its own slice of sky
      PANES.forEach(([x, h], i) => {
        const w = 28, y0 = 8;
        p.rect(x - 2, y0 - 2, w + 4, 70, 'frameDk'); p.rect(x - 1, y0 - 1, w + 2, 68, 'frame'); p.rect(x, y0, w, 66, 'paneA');
        p.vline(x - 1, y0 - 1, y0 + 66, 'frameHi');
        for (let j = 0; j < 66; j += 2) p.hline(x, x + w - 1, y0 + j, j < 22 ? 'paneA' : j < 44 ? 'paneB' : 'paneC');
        p.dither(x, y0 + 20, w, 6, 'paneB', 0.5); p.dither(x, y0 + 42, w, 6, 'paneC', 0.5);
        p.ellipse(x + w / 2, y0 + 2, w / 2, 6, 'paneA', true);
        // a slanting glare
        for (let j = 0; j < 30; j++) if (j % 4 < 2) p.px(x + 4 + j * 0.5, y0 + 6 + j, 'paneHi');
        p.rect(x + 3, y0 + 40, 4, 1, 'paneHi');
        // a tiny reflection of a robed figure in some
        if (i % 2 === 1) { p.rect(x + 12, y0 + 44, 5, 12, 'lilac'); p.ellipse(x + 14, y0 + 42, 3, 3, 'paneHi', true); }
      });
      // the chandelier of glass over the ring
      p.line(128, 0, 128, 14, 'frame');
      p.poly([[110, 32], [146, 32], [136, 16], [120, 16]], 'chandSh'); p.poly([[114, 30], [142, 30], [134, 18], [122, 18]], 'chand');
      for (let x = 112; x <= 144; x += 5) { p.line(x, 32, x, 38, 'chand'); p.px(x, 39, 'chandHi'); }
      p.rect(126, 12, 4, 6, 'chandHi');
      if (dash) {
        // Dash's banner: torn, hanging from the frame of the fifth pane; one pane cracked across
        p.poly([[150, 6], [176, 6], [176, 40], [163, 33], [150, 40]], 'tealDk'); p.poly([[153, 8], [173, 8], [173, 36], [163, 30], [153, 36]], 'teal');
        p.rect(160, 14, 6, 6, 'goldDash'); p.hline(155, 171, 10, 'goldDash');
        for (const [a, b, c2, d] of [[46, 12, 60, 44], [60, 44, 52, 62], [60, 44, 72, 52], [46, 12, 40, 24]]) p.line(a, b, c2, d, 'crack');
      }
      p.rect(0, 74, 256, 4, 'frame'); p.hline(0, 255, 74, 'frameHi'); p.rect(0, 78, 256, 10, 'wallSh');
    },
    paintRing(p) {
      p.rect(0, 84, 256, 4, 'frameSh'); p.rect(0, 84, 256, 1, 'frame');
      p.rect(0, 88, 256, 136, 'tile');
      // a mirrored checker floor
      for (let y = 90; y < 224; y += 16) for (let x = ((y - 90) / 16) % 2 ? 0 : 16; x < 256; x += 32) p.rect(x, y, 16, 16, 'tileSh');
      for (let y = 88; y < 224; y += 16) p.hline(0, 255, y, 'tileDk');
      p.dither(0, 90, 256, 30, 'tileB', 0.18); p.dither(0, 90, 256, 12, 'tileBs', 0.3);
      // a great silver ring inlaid under the fighters
      p.ellipse(128, 186, 72, 22, 'tileB', false); p.ellipse(128, 186, 70, 21, 'tileBs', false);
      ringRopes(p, [[60, 'ropeW', 'ropeWs'], [68, 'ropeL', 'ropeLs'], [76, 'ropeW', 'ropeWs']], ['tileDk', 'tileSh', 'tileB', 'frameSh', 'frame', 'frameHi']);
    },
    paletteAnim(t, live, pal, state, arena) {
      const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
      if (((t >> 5) & 3) === 1) { set('chand', 'chandHi'); set('chandSh', 'chand'); }
      if (arena.react > 0 && (t >> 2) % 4 === 0) { set('paneA', 'paneC'); set('paneB', 'flash'); set('paneC', 'flash'); }
    },
    overlay(frame, arena, t) {
      const col = (k) => arena.live[arena.pal.idx(k)];
      for (const g of GLINTS) {
        const x = ((g.o + t * g.s) % 240), y = g.y;
        if (((x | 0) % 34) > 22) continue;
        for (let j = 0; j < 8; j++) frame.px(Math.round(x + j * 0.6), Math.round(y + j), col('glint'));
      }
      // the chandelier throws a sparkle
      if ((t >> 3) % 7 === 0) { const k = (t >> 3) % 5; frame.px(112 + k * 8, 40, col('chandHi')); frame.px(112 + k * 8 - 1, 40, col('chand')); frame.px(112 + k * 8 + 1, 40, col('chand')); }
      seatedCrowdReact(frame, arena, t, col('glint'));
    },
  };
}
export const MIRROR_SANCTUM = { pantheon6: build(false), pantheon6d: build(true) };
export default MIRROR_SANCTUM.pantheon6;
