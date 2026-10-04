// Bellows (#70): sprite layers on the heavy build.
// The forge's lungs: a red-faced heavyweight with a ginger walrus moustache, a bald pate, a big round
// belly under a scorched leather apron and gloves the colour of old bellows leather. Poses
// inhale1..3: arms flung wide, head back, and the belly swelling with every breath (`inflate` 1-3
// draws it bigger over the apron); blow: the breath let out.
import { rig } from './_rig.js';

const inhale = (n, o = {}) => ({
  extends: 'idle1', inflate: n,
  head: { at: [0, -98 - n * 1.5], face: n >= 3 ? 'wide' : 'strain', tilt: 'up', look: [0, -1] },
  shL: [-26, -80], elL: [-38 - n * 3, -74], fiL: [-46 - n * 4, -66 - n * 2], shR: [26, -80], elR: [38 + n * 3, -74], fiR: [46 + n * 4, -66 - n * 2],
  gloveL: { angle: -50 }, gloveR: { angle: 50 },
  ...o,
});
const { layers, palettes } = rig('bellows', {
  build: 'heavy',
  body: { size: [1.06, 1.0], legLen: 0.9, torsoLen: 1.02, shoulders: 1.04, neckLen: -2, dims: { neck: 10, chestW: 25, waistW: 23, belly: 12, deltoid: 9 } },
  colors: {
    skin: [[29, 19, 14], [24, 13, 9], [17, 8, 6], [10, 4, 3]],
    hair: [[28, 16, 6], [22, 9, 3], [12, 4, 1]],
    glove: [[24, 16, 9], [17, 10, 5], [9, 5, 3]],
    top: [[21, 15, 9], [14, 9, 5], [8, 5, 3], [4, 2, 1]],
    trim: [[28, 26, 20], [20, 18, 13], [11, 10, 8]],
    boot: [[15, 10, 6], [8, 5, 3], [3, 2, 1]],
    sh: [[12, 12, 16], [6, 6, 10], [2, 2, 5]],
    extraA: { flush: [31, 14, 10] }, extraB: { scorch: [3, 2, 2] },
  },
  head: {
    jaw: 'round', ears: [2.6, 3.6], hair: 'none', beard: 'stache', eyeFace: 'neutral', mouthFace: 'neutral', mouthW: 3,
    face(ctx, H) { const { cv, c } = ctx; const x = Math.round(H.x), y = Math.round(H.y); for (const s of [-1, 1]) for (const [dx, dy] of [[9, 4], [10, 5], [8, 5]]) cv.px(x + s * dx, y + dy, c('flush')); },
  },
  top: { style: 'tank', hem: false, emblem(ctx, cx, cy) { const { cv, c } = ctx; for (let i = 0; i < 6; i++) cv.px(cx - 10 + i * 4, cy + 9 + (i & 1), c('scorch')); } },
  belt: { buckle: 'round', ramp: 'top' },
  poses: {
    inhale1: inhale(1), inhale2: inhale(2), inhale3: inhale(3),
    blow: { extends: 'overhead1', head: { at: [0, -94], face: 'strain', look: [0, 2] } },
    exhaled: { extends: 'winded1' },
  },
  front(ctx) {
    const { cv, J, pose, ramps } = ctx;
    if (pose.lying || !pose.inflate) return;
    // the belly swells in front of the apron, one size a breath
    const k = pose.inflate, w = J.waist, ch = J.chest;
    const cx = (w[0] + ch[0]) / 2, cy = w[1] - 4 + k * 1.5, rx = 21 + k * 4.4, ry = 15 + k * 3;
    cv.part(ctx.mask().ellipse(cx, cy, rx, ry), { ramp: ramps.skin, bevel: 8, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(cx, cy + 1, rx - 4, ry - 4).cut(ctx.mask().rect(cx - 30, cy - 30, 60, 22)), { ramp: ramps.top, bevel: 4, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(cx - rx + 2, cy - 2, rx * 2 - 4, 3), { ramp: ramps.trim, bevel: 1, inner: 'line', shadow: false });
  },
});
export { palettes };
export default layers;
