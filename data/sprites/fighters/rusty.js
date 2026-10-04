// "Big Rig" Rusty: sprite layers on the heavy build.
// Long-haul trucker: a red trucker cap with a white mesh front panel and a
// chrome-wheel patch, a big bushy ginger beard, a green flannel vest hanging
// open over a white tank top, denim trunks with a huge chrome belt buckle and a
// chain wallet, work boots, fire-engine red gloves. Poses: pawing the canvas
// and the head-down bull rush, hanging off the ropes after a crash, and the
// taunt (yanking the air horn cord).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('rusty.A', {
  outline: [3, 2, 2],
  skinHi: [31, 24, 18], skin: [27, 17, 12], skinSh: [20, 11, 8], skinDk: [11, 6, 5],
  ruddy: [27, 12, 10], white: [31, 31, 30], mouth: [13, 2, 4],
  hairHi: [31, 18, 7], hair: [24, 10, 3], hairDk: [13, 5, 2],
  gloveHi: [31, 13, 10], glove: [25, 4, 4], gloveDk: [13, 2, 3],
});
const B = makePalette('rusty.B', {
  capHi: [29, 8, 7], cap: [21, 3, 4], capDk: [11, 2, 2], mesh: [28, 28, 27],
  plaidHi: [8, 19, 10], plaid: [4, 12, 6], plaidDk: [2, 6, 3],
  tankSh: [21, 21, 24],
  denimHi: [13, 17, 26], denim: [7, 10, 19], denimDk: [3, 5, 11],
  chromeHi: [31, 31, 31], chrome: [19, 21, 24],
  bootHi: [18, 12, 7], boot: [10, 6, 3],
});
export const palettes = { rusty: { A, B } };

const poses = {
  // pawing the canvas like a bull: low, head down, one boot scraping back
  paw1: {
    extends: 'crouchTell', shift: [0, 2],
    head: { at: [0, -86], face: 'focus', tilt: 'down', look: [0, 2] },
    elL: [-27, -58], elR: [27, -58], fiL: [-16, -72], fiR: [16, -72],
    knR: [16, -20], ftR: [20, -4],
  },
  paw2: {
    extends: 'paw1', shift: [1, 0],
    knR: [14, -24], ftR: [22, -10],
    head: { at: [1, -87], face: 'strain', tilt: 'down', look: [0, 2] },
  },
  // head down, shoulders forward, gloves up by the ears: here he comes
  chargeTell: {
    extends: 'crouchTell', shift: [0, 4],
    head: { at: [0, -82], face: 'strain', tilt: 'down', look: [0, 2] },
    shL: [-22, -76], shR: [22, -76],
    elL: [-30, -76], elR: [30, -76], fiL: [-15, -90], fiR: [15, -90],
    gloveL: { angle: 30 }, gloveR: { angle: -30 },
  },
  // the rush: coming straight through, both gloves at the camera
  charge: {
    extends: 'idle1', shift: [0, 5],
    knL: [-16, -18], knR: [16, -18], ftL: [-17, 0], ftR: [17, 0],
    head: { at: [0, -88], face: 'strain', tilt: 'down', look: [0, 2] },
    shL: [-21, -76], shR: [21, -76],
    elL: [-24, -70], elR: [24, -70], fiL: [-12, -66], fiR: [12, -66],
    gloveL: { view: 'front', size: 1.45 }, gloveR: { view: 'front', size: 1.45 },
    frontOrder: ['L', 'R'],
  },
  // hung on the ropes after a crash, arms draped back, seeing stars
  crash1: {
    extends: 'idle1', shift: [0, 3],
    knL: [-17, -19], knR: [15, -20], ftL: [-18, 0], ftR: [15, 0],
    head: { at: [-2, -94], face: 'ko', tilt: 'up', look: [-1, -1] },
    elL: [-40, -84], elR: [40, -84], fiL: [-50, -70], fiR: [50, -70],
    gloveL: { angle: -150 }, gloveR: { angle: 150 },
    armZ: { L: 'back', R: 'back' },
  },
  crash2: {
    extends: 'crash1', shift: [2, 1],
    head: { at: [3, -93], face: 'dazed', tilt: 'down', look: [1, 0] },
  },
  // taunt: yanks the air horn cord
  hornPull1: {
    extends: 'idle1',
    head: { at: [1, -101], face: 'grin', tilt: 'up', look: [1, -1] },
    elR: [30, -100], fiR: [24, -122], gloveR: { angle: 10 },
    elL: [-26, -60], fiL: [-12, -72],
  },
  hornPull2: {
    extends: 'hornPull1', shift: [0, 1],
    head: { at: [1, -100], face: 'wide', tilt: 'up', look: [1, -1] },
    elR: [32, -88], fiR: [26, -106],
  },
};

export default {
  id: 'rusty',
  build: 'heavy',
  // his own body on the build: a long-haul trucker: a big hard gut, heavy arms
  body: { size: [1.08, 0.98], legLen: 0.92, dims: { belly: 14, waistW: 23, upperArm: [8, 6.8] } },
  palettes: { default: 'rusty' },
  torsoMaterial: 'tank',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['mesh', 'tankSh', 'chrome'],
    tank: ['white', 'white', 'tankSh', 'chrome'],
    shorts: ['denimHi', 'denim', 'denimDk'],
    sock: ['white', 'tankSh', 'chrome'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    cap: ['capHi', 'cap', 'capDk'],
    plaid: ['plaidHi', 'plaid', 'plaidDk', 'outline'],
    chrome: ['chromeHi', 'chromeHi', 'chrome', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const open = ['strain', 'hurt', 'wide'].includes(face);

    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // big bushy ginger beard, down onto the chest
    const bd = ctx.mask().ellipse(fx, fy + 10, H.rx + 2.5, 10.5).cut(ctx.mask().rect(fx - 20, fy - 8, 40, 12));
    bd.rect(x - Math.round(H.rx) - 1, y - 2, 4, 10).rect(x + Math.round(H.rx) - 3, y - 2, 4, 10);
    const mo = ctx.mask().ellipse(fx, fy + 9.5, 3.4, 1.8);
    if (open) bd.cut(mo);
    cv.part(bd, { ramp: ramps.hair, bevel: 4, inner: 'line' });
    for (const [dx, dy] of [[-9, 8], [-5, 14], [0, 17], [5, 14], [9, 8], [-7, 12], [7, 12], [-2, 13], [3, 16]]) { cv.shade(fx + dx, fy + dy, 1); cv.shade(fx + dx + 1, fy + dy - 1, -1); }
    if (open) { cv.flat(mo, c('mouth'), true); cv.px(fx - 1, fy + 8, c('white')); cv.px(fx, fy + 8, c('white')); }
    for (const s of [-1, 1]) { cv.px(fx + s * 6, fy + 3, c('ruddy')); cv.px(fx + s * 6 - s, fy + 3, c('ruddy')); }
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.8, thick: 1.4, y: -4 });
    nose(ctx, fx, fy, ['skinHi', 'ruddy', 'skinSh', 'skinDk'].map(c), [3, 2.6], 3.6);
    cv.part(ctx.mask().ellipse(fx - 3.4, fy + 7, 4.4, 1.9, 1, -0.25).ellipse(fx + 3.4, fy + 7, 4.4, 1.9, 1, 0.25), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    if (face === 'grin') for (let i = -2; i <= 2; i++) cv.px(fx + i, fy + 9, c('mouth'));
    // trucker cap: red crown, white mesh-panel front with a chrome wheel patch, flat bill
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const hx = x + lx * 0.4;
    const crown = ctx.mask().ellipse(hx, cy - 9, H.rx + 2, 8).cut(ctx.mask().rect(hx - 20, cy - 5, 40, 12));
    cv.part(crown, { ramp: ramps.cap, bevel: 4 });
    const panel = ctx.mask().ellipse(hx, cy - 10, 7.5, 7).cut(ctx.mask().rect(hx - 20, cy - 5, 40, 12)).clip(crown);
    cv.part(panel, { ramp: ['mesh', 'mesh', 'tankSh'].map(c), bevel: 2, inner: 'line', shadow: false });
    const bx = Math.round(hx), by = Math.round(cy - 11);
    cv.stamp(['.cc.', 'c..c', 'c..c', '.cc.'], bx - 2, by - 1, { c: c('chrome') });
    cv.px(bx - 1, by, c('capDk')); cv.px(bx, by + 1, c('capDk'));
    cv.px(Math.round(hx), Math.round(cy - 17), c('capHi'));
    cv.part(ctx.mask().ellipse(hx + lx * 0.6, cy - 4.5, H.rx + 2, 2.4).cut(ctx.mask().rect(hx - 22, cy - 12, 44, 7)), { ramp: ramps.cap, bevel: 1, bias: -0.2, inner: 'line' });
    for (let i = -8; i <= 8; i++) if (hm.in(fx + i, cy - 2)) cv.shade(fx + i, cy - 2, 1);
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // the open flannel vest: two panels down the sides, plaid lines
    for (const s of [-1, 1]) {
      const pan = ctx.mask().poly([
        [n[0] + s * 7, n[1]], [J[s < 0 ? 'shL' : 'shR'][0] + s * 8, n[1] - 1], [w[0] + s * (D.waistW + 3), w[1] + 1], [w[0] + s * 9, w[1] + 1], [ch[0] + s * 8, ch[1]],
      ]).clip(tm);
      cv.part(pan, { ramp: ramps.plaid, bevel: 2, inner: 'line' });
      for (let y = 0; y < pan.h; y++) for (let x = 0; x < pan.w; x++) {
        if (!pan.in(x, y)) continue;
        if (y % 5 === 0) cv.shade(x, y, 1);
        if (x % 5 === 0) cv.shade(x, y, y % 5 === 0 ? 2 : 1);
        if (x % 5 === 2 && y % 5 === 2) cv.px(x, y, c('capHi'));
      }
    }
    // tank top neckline
    cv.part(ctx.mask().ellipse(n[0], n[1] + 1, 6, 3).clip(tm), { ramp: ramps.skin, bevel: 2, inner: 'line', shadow: false });
    if (pose.lying) return;
    // belt + huge chrome buckle
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ['bootHi', 'boot', 'outline'].map(c), bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(w[0], w[1] - 1.5, 5, 3), { ramp: ramps.chrome, bevel: 2, inner: 'line' });
    cv.px(w[0] - 2, w[1] - 3, c('capHi')); cv.px(w[0] - 1, w[1] - 3, c('capHi'));
    // chain wallet looping to the back pocket
    for (let k = 0; k <= 10; k++) {
      const X = Math.round(h[0] + D.waistW - 4 + k * 0.6), Y = Math.round(w[1] + Math.sin((k / 10) * Math.PI) * 7);
      if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c(k % 2 ? 'chrome' : 'chromeHi'));
    }
    // denim seams
    for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 10), h[1] - 2, h[0] + s * (D.hipSpread + 11), h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.shade(X, Y, -1); });
  },
};
