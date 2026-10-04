// Shackle (#90): sprite layers on the heavy build.
// A prisoner the size of his cell: pale grey-tan skin, a shaved head under a thick iron collar, a prison
// shirt of grey-and-black stripes with the sleeves torn off, cuffs of rusted iron round both wrists
// with the broken links still hanging, striped trunks. The long chain he is fixed to runs from his ankle
// back to a post (drawn live by the `yank` modifier).
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('shackle', {
  build: 'heavy',
  body: { size: [1.06, 1.0], legLen: 0.9, torsoLen: 1.04, shoulders: 1.12, neckLen: -1, dims: { neck: 10.5, chestW: 28, waistW: 23, belly: 9, deltoid: 10.5, upperArm: [7.6, 6.2] } },
  colors: {
    skin: [[24, 21, 17], [17, 14, 11], [10, 8, 6], [5, 4, 3]],
    hair: [[9, 8, 8], [4, 4, 4], [2, 2, 2]],
    glove: [[16, 17, 20], [9, 10, 13], [4, 4, 6]],
    top: [[22, 22, 23], [14, 14, 16], [8, 8, 10], [3, 3, 4]],
    trim: [[24, 14, 7], [15, 8, 3], [8, 4, 1]],
    boot: [[11, 10, 10], [5, 5, 5], [2, 2, 2]],
    sh: [[19, 19, 20], [11, 11, 12], [5, 5, 6]],
    extraA: { iron: [18, 19, 22], ironDk: [6, 6, 9] }, extraB: { stripe: [4, 4, 5] },
  },
  head: {
    jaw: 'square', ears: [2.8, 3.8], hair: 'none', beard: 'stubble', eyeFace: 'focus', mouthW: 3, brow: { len: 5, thick: 1.4 },
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // a scar across the brow
      cv.line(x + 4, y - 6, x + 9, y - 1, (X, Y) => cv.shade(X, Y, 1));
    },
  },
  top: { style: 'tank', hem: false, emblem(ctx, cx, cy) { const { cv, c } = ctx; for (let x = cx - 12; x <= cx + 12; x += 4) cv.line(x, cy - 12, x, cy + 12, (X, Y) => cv.px(X, Y, c('stripe'))); } },
  belt: { buckle: 'square', ramp: 'trim' }, stripe: false,
  poses: {
    // reeling you in: leaning back with both fists in front, hand over hand on the chain
    holding: {
      extends: 'idle1', shift: [0, 2], knL: [-14, -22], knR: [14, -22], ftL: [-18, 0], ftR: [18, 0],
      head: { at: [0, -95], face: 'strain', tilt: 'down', look: [0, 2] },
      shL: [-22, -79], elL: [-22, -64], fiL: [-6, -58], shR: [22, -79], elR: [22, -64], fiR: [6, -60],
    },
  },
  front(ctx) {
    const { cv, J, pose, ramps, c, mask } = ctx;
    if (pose.lying) return;
    // the collar: an iron ring at the base of the neck, a link hanging from it
    const n = J.neck;
    cv.part(ctx.mask().ellipse(n[0], n[1] + 3, 11, 3.6).cut(ctx.mask().ellipse(n[0], n[1] + 1.4, 7.6, 2.4)), { ramp: [c('iron'), c('glove'), c('ironDk')], bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(n[0], n[1] + 9, 2, 3), { ramp: [c('iron'), c('glove'), c('ironDk')], bevel: 1, inner: 'line', shadow: false });
    // rusted cuffs on both wrists, a broken link hanging from each
    for (const s of ['L', 'R']) {
      const f = J['fi' + s], e = J['el' + s];
      const mx = (f[0] * 2 + e[0]) / 3, my = (f[1] * 2 + e[1]) / 3;
      cv.part(ctx.mask().ellipse(mx, my, 5.4, 3.4), { ramp: ramps.trim, bevel: 2, inner: 'line', shadow: false });
      cv.part(ctx.mask().ellipse(mx + (s === 'L' ? -1 : 1), my + 7, 1.6, 2.4), { ramp: [c('iron'), c('glove'), c('ironDk')], bevel: 1, inner: 'line', shadow: false });
    }
  },
});
export { palettes };
export default layers;
