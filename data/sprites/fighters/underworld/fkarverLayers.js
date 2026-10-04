// Fallen Karver's own sprite layers: King Karver's (the same man, the same face and cape) on the `fkarver` palette, with a Title Defense look of
// his own. (He used to share `karver`, so his remix would have been the living king's.)
import karver from '../karver.js';
import * as K from '../../remixKit.js';

export default {
  ...karver,
  id: 'fkarver',
  palettes: { default: 'fkarver' },
  // Title Defense: THE KING IN HIS COFFIN ARMOUR. He is buried in steel: a blackened breastplate and spiked pauldrons over the shroud, a crown of seven
  // black nails with the ruby set in it, the cape a torn shroud lined in bone, greaves, and gauntlets of blue-grey steel instead of rust.
  remix: {
    skip: ['torso'],
    swap: {
      A: { gloveHi: [25, 27, 31], glove: [14, 17, 24], gloveDk: [6, 8, 14], skinHi: [21, 21, 24], skin: [14, 14, 18], skinSh: [8, 8, 11], skinDk: [4, 4, 6], hairHi: [28, 28, 30], hair: [21, 21, 24], hairDk: [10, 10, 14] },
      B: { capeHi: [9, 6, 14], cape: [4, 3, 8], capeDk: [2, 1, 4], ermine: [28, 27, 22], ermineSh: [17, 16, 13], bootHi: [14, 16, 22], boot: [6, 7, 11] },
    },
    ramps: { steel: ['gloveHi', 'glove', 'gloveDk'], shroud: ['capeHi', 'cape', 'capeDk'], bone: ['ermine', 'ermine', 'ermineSh'] },
    back(ctx) { if (!ctx.pose.lying) K.cape(ctx, { ramp: 'shroud', inner: 'bone', len: 38, flare: 9, hem: 'tatter' }); },
    head(ctx, H) { K.crown(ctx, H, { ramp: 'shroud', n: 7, h: 12, band: 4, w: 1, gem: null }); const x = Math.round(H.x + H.look[0] * 0.3), ty = Math.round(H.y - H.ry) + 2; ctx.cv.px(x, ty - 1, ctx.c('ruby')); ctx.cv.px(x + 1, ty - 1, ctx.c('ruby')); ctx.cv.px(x, ty - 2, ctx.c('ruby')); },
    torso(ctx) {
      const { cv, J, c, D } = ctx, w = J.waist;
      if (ctx.pose.lying) return;
      K.plate(ctx, { ramp: 'steel', trim: 'bone', shape: 'v' });
      K.pauldrons(ctx, { ramp: 'steel', style: 'spiked', size: 2, tip: 'bone' });
      K.belt(ctx, { ramp: 'shroud', buckle: 'bone', wide: 4 });
      K.skirt(ctx, { ramp: 'shroud', kind: 'strips', len: 14, n: 6 });
      cv.px(J.chest[0], J.chest[1] + 4, c('ruby')); cv.px(J.chest[0], J.chest[1] + 5, c('ruby'));
      void w; void D;
    },
    front(ctx) { K.bracers(ctx, { ramp: 'steel', from: 0.2, to: 0.6, wide: 2 }); K.greaves(ctx, { ramp: 'steel', knee: true }); },
  },
};
