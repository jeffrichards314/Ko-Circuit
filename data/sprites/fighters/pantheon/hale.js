// Forgemaster Hale (#71): sprite layers on the giant build. Pantheon V's champion.
// The master of the Thunder Forge: a giant with a white beard to his belt and a cropped white head under an
// iron crown, leather-and-iron plate over a hairy chest, an ember-lit apron, and fists that
// glow with the forge: `hale.h1` (red), `hale.h2` (orange), `hale.h3` (white-hot) recolour the
// gloves, the cuffs and the cracks in his plate: the heat of his hands is the heat he's fighting at.
import { rig } from './_rig.js';
import * as K from '../../remixKit.js';

const { layers, palettes } = rig('hale', {
  build: 'giant',
  body: { size: [0.96, 0.97], legLen: 0.96, torsoLen: 1.0, shoulders: 1.04, dims: { belly: 6 } },
  colors: {
    skin: [[27, 19, 14], [21, 13, 9], [14, 8, 6], [8, 4, 3]],
    hair: [[31, 31, 31], [26, 26, 28], [15, 15, 19]],
    glove: [[25, 16, 12], [17, 8, 6], [9, 3, 3]],
    top: [[16, 17, 22], [9, 10, 15], [5, 5, 9], [2, 2, 5]],
    trim: [[24, 16, 12], [16, 8, 6], [8, 3, 3]],
    boot: [[12, 12, 16], [7, 7, 10], [3, 3, 5]],
    sh: [[10, 10, 14], [5, 5, 9], [2, 2, 4]],
    extraA: { spark: [31, 22, 6] }, extraB: { ember: [31, 14, 3] },
  },
  head: {
    jaw: 'square', ears: [2.8, 3.8], hair: 'crop', beard: 'full', eyeFace: 'focus', mouthW: 3.4,
    gear(ctx, H) {
      if (ctx.layers.remixed) return;
      const { cv } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // an iron crown: a band with four blunt spikes
      cv.part(ctx.mask().rect(x - H.rx, y - 8, H.rx * 2, 3.4), { ramp: ctx.ramps.top, bevel: 2, inner: 'line', shadow: false });
      for (let i = -2; i <= 2; i++) cv.part(ctx.mask().poly([[x + i * 6 - 2.4, y - 8], [x + i * 6, y - 15 + Math.abs(i)], [x + i * 6 + 2.4, y - 8]]), { ramp: ctx.ramps.top, bevel: 1, inner: 'line', shadow: false });
      cv.px(x, y - 6, ctx.c('ember'));
    },
  },
  top: {
    style: 'plate', pauldrons: true,
    emblem(ctx, cx, cy) { const { cv, c } = ctx; for (let i = 0; i < 4; i++) { cv.line(cx - 12 + i * 8, cy - 6, cx - 9 + i * 8, cy + 6, (X, Y) => cv.px(X, Y, c('ember'))); } },
  },
  belt: { buckle: 'square', ramp: 'top' },
  // Title Defense: HALE AT THE ANVIL. He puts the iron crown down for a welder's helm with a slit that glows: blue-steel plate with copper rivets, spiked
  // pauldrons, a long leather apron and heavy bracers.
  remix: {
    swap: {
      A: { skinHi: [26, 18, 15], skin: [19, 12, 9], skinSh: [12, 7, 5], skinDk: [6, 3, 3] },
      B: { topHi: [21, 25, 30], top: [11, 16, 24], topSh: [6, 8, 15], topDk: [3, 4, 8], trimHi: [31, 24, 14], trim: [26, 14, 6], trimSh: [14, 6, 2], shHi: [14, 9, 6], sh: [8, 5, 3], shDk: [4, 2, 1] },
    },
    ramps: { steel: ['topHi', 'top', 'topSh'], copper: ['trimHi', 'trim', 'trimSh'], leather: ['shHi', 'sh', 'shDk'] },
    body: { size: [1.1, 1.05], shoulders: 1.12 },
    back(ctx) { if (!ctx.pose.lying) { K.pipes(ctx, { ramp: 'steel', smoke: 'leather', h: 30, w: 6, spread: 10 }); K.pack(ctx, { ramp: 'leather', w: 26, h: 40, top: 8 }); } },
    head(ctx, H) {
      K.helm(ctx, H, { ramp: 'steel', cover: 0.62, cheeks: true, rim: 'copper' });
      K.visor(ctx, H, { ramp: 'leather', glow: 'copper', h: 4 });
    },
    torso(ctx) {
      if (ctx.pose.lying) return;
      K.apron(ctx, { ramp: 'leather', len: 16, top: false, taper: 6, pocket: 'copper' });
      K.pauldrons(ctx, { ramp: 'steel', style: 'spiked', size: 5, tip: 'copper' });
      K.straps(ctx, { ramp: 'leather', buckle: 'copper' });
    },
    front(ctx) { K.bracers(ctx, { ramp: 'steel', from: 0.2, to: 0.62, wide: 2 }); K.rings(ctx, { ramp: 'copper', where: 0.22 }); },
  },
  swaps: {
    'hale.h1': { A: { gloveHi: [31, 22, 16], glove: [30, 8, 4], gloveDk: [18, 3, 2] }, B: { trimHi: [31, 22, 16], trim: [30, 8, 4], trimSh: [18, 3, 2], ember: [31, 10, 2] } },
    'hale.h2': { A: { gloveHi: [31, 28, 18], glove: [31, 17, 3], gloveDk: [22, 8, 1], spark: [31, 26, 8] }, B: { trimHi: [31, 28, 18], trim: [31, 17, 3], trimSh: [22, 8, 1], ember: [31, 20, 4] } },
    'hale.h3': { A: { gloveHi: [31, 31, 31], glove: [31, 31, 24], gloveDk: [31, 24, 8], spark: [31, 31, 24] }, B: { trimHi: [31, 31, 31], trim: [31, 31, 24], trimSh: [31, 24, 8], ember: [31, 30, 14] } },
  },
});
export { palettes };
export default layers;
