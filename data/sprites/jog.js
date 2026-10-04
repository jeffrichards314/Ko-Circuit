// Side-view sprites for the jogging cutscene (§5): the player running (4-frame
// cycle, in the player's customized palette and hair style) and the trainer
// riding a bike alongside (4 pedal frames, in the trainer's palette).
// Built with the same part/shade/outline pipeline as the fighters.

import { Mask, SpriteCanvas } from '../../src/engine/sprites.js';
import { playerPalettes, hairStyleOf } from '../customization.js';
import { trainerPortrait } from './trainers.js';

const W = 40, H = 56, AX = 20, AY = 52;

// Joint sets per frame (x right = forward). A/B are the two sides; B is the far side.
const RUN = [
  { hip: [0, -19], sh: [1, -31], head: [2, -38], kA: [5, -11], fA: [8, -1], kB: [-3, -10], fB: [-9, -5], eA: [-4, -25], hA: [-3, -20], eB: [5, -26], hB: [9, -29] },
  { hip: [0, -21], sh: [1, -33], head: [2, -40], kA: [6, -14], fA: [4, -7], kB: [0, -11], fB: [-2, -2], eA: [-2, -26], hA: [2, -23], eB: [2, -26], hB: [5, -24] },
  { hip: [0, -19], sh: [1, -31], head: [2, -38], kA: [-3, -10], fA: [-9, -5], kB: [5, -11], fB: [8, -1], eA: [5, -26], hA: [9, -29], eB: [-4, -25], hB: [-3, -20] },
  { hip: [0, -21], sh: [1, -33], head: [2, -40], kA: [0, -11], fA: [-2, -2], kB: [6, -14], fB: [4, -7], eA: [2, -26], hA: [5, -24], eB: [-2, -26], hB: [2, -23] },
];

// Jump rope (the training camp): feet together on the balls of the feet, then
// tucked in the air; hands low at the hips, turning the rope.
const SKIP = [
  { hip: [0, -20], sh: [0, -32], head: [1, -39], kA: [2, -11], fA: [1, -1], kB: [1, -11], fB: [-1, -1], eA: [2, -25], hA: [6, -21], eB: [-1, -25], hB: [4, -21] },
  { hip: [0, -21], sh: [0, -33], head: [1, -40], kA: [4, -13], fA: [0, -5], kB: [3, -13], fB: [-2, -5], eA: [2, -26], hA: [6, -22], eB: [-1, -26], hB: [4, -22] },
];

// (k: drawing scale; the jump rope draws these at 2x, natively, not blown up)
const HAIR = {
  spiky: (m, x, y, k = 1) => m.ellipse(x - k, y - 2 * k, 5 * k, 3.6 * k).poly([[x - 6 * k, y - 2 * k], [x - 9 * k, y - 5 * k], [x - 4 * k, y - 5 * k]]).poly([[x - 3 * k, y - 4 * k], [x - 4 * k, y - 8 * k], [x, y - 5 * k]]).poly([[x, y - 5 * k], [x + 2 * k, y - 8 * k], [x + 3 * k, y - 4 * k]]),
  buzz: (m, x, y, k = 1) => m.ellipse(x - 0.5 * k, y - 1.8 * k, 4.7 * k, 3.4 * k),
  afro: (m, x, y, k = 1) => m.ellipse(x - 1.5 * k, y - 2.5 * k, 7 * k, 6 * k),
  mohawk: (m, x, y, k = 1) => m.rect(x - 4 * k, y - 8 * k, 6 * k, 4 * k).poly([[x - 4 * k, y - 8 * k], [x - k, y - 11 * k], [x + 2 * k, y - 8 * k]]),
  ponytail: (m, x, y, k = 1) => m.ellipse(x - k, y - 2 * k, 5 * k, 3.6 * k).capsule(x - 5 * k, y - k, x - 9 * k, y + 4 * k, 1.8 * k, 1.2 * k),
  slick: (m, x, y, k = 1) => m.ellipse(x - k, y - 1.5 * k, 5.2 * k, 3.8 * k).rect(x - 6 * k, y - 2 * k, 3 * k, 5 * k),
};

// k draws the whole figure k times bigger (joints, radii and detail), for the
// jump rope's close-up, so the pixels stay the game's size.
export function jogFrames(profile, poses = RUN, k = 1) {
  const pal = playerPalettes(profile).default;
  const c = (k) => pal.idx(k);
  const skin = ['skinHi', 'skin', 'skinSh', 'outline'].map(c), skinFar = ['skin', 'skinSh', 'outline', 'outline'].map(c);
  const tank = ['shirtHi', 'shirt', 'outline'].map(c), trunks = ['trunksHi', 'trunks', 'trunksDk'].map(c);
  const shoe = ['shoeHi', 'shoe', 'shoeDk'].map(c), shoeFar = ['shoe', 'shoeDk', 'shoeDk'].map(c);
  const hair = ['hairHi', 'hair', 'outline'].map(c);
  const style = HAIR[hairStyleOf(profile)] || HAIR.spiky;
  const frames = poses.map((J) => {
    const cv = new SpriteCanvas(W * k, H * k, c('outline'));
    const m = () => new Mask(W * k, H * k);
    const P = ([x, y]) => [AX * k + x * k, AY * k + y * k];
    const b = (n) => Math.max(1, Math.round(n * (1 + (k - 1) * 0.6))); // bevels grow a little slower
    const hip = P(J.hip), sh = P(J.sh), hd = P(J.head);
    const leg = (kn, f, far) => {
      const K = P(kn), F = P(f);
      cv.part(m().capsule(hip[0], hip[1], K[0], K[1], 3 * k, 2.6 * k), { ramp: far ? skinFar : skin, bevel: b(2) });
      cv.part(m().capsule(K[0], K[1], F[0], F[1] - 2 * k, 2.4 * k, 1.8 * k), { ramp: far ? skinFar : skin, bevel: b(2) });
      cv.part(m().ellipse(F[0] + 1.5 * k, F[1] - k, 3.2 * k, 1.8 * k), { ramp: far ? shoeFar : shoe, bevel: b(1) });
    };
    const arm = (e, h, far) => {
      const E = P(e), Hh = P(h);
      cv.part(m().capsule(sh[0], sh[1] + k, E[0], E[1], 2 * k, 1.8 * k), { ramp: far ? skinFar : skin, bevel: b(2) });
      cv.part(m().capsule(E[0], E[1], Hh[0], Hh[1], 1.8 * k, 1.8 * k), { ramp: far ? skinFar : skin, bevel: b(2) });
      if (k > 1) cv.part(m().ellipse(Hh[0], Hh[1], 1.6 * k, 1.6 * k), { ramp: far ? skinFar : skin, bevel: b(1) }); // a fist on the rope handle
    };
    // the trunks' leg over the top of a thigh (down to about two thirds of it, boxing-trunk length), so a leg never
    // shows bare where the shorts are; at the map's half size the trunks still read as a solid block of colour
    const cuff = (kn, far) => {
      const K = P(kn), x = hip[0] + (K[0] - hip[0]) * 0.68, y = hip[1] + (K[1] - hip[1]) * 0.68;
      cv.part(m().capsule(hip[0], hip[1], x, y, 4 * k, 3.5 * k), { ramp: far ? ['trunks', 'trunksDk', 'trunksDk'].map(c) : trunks, bevel: b(2) });
    };
    arm(J.eB, J.hB, true);
    leg(J.kB, J.fB, true);
    cuff(J.kB, true);
    // trunks + tank top
    cv.part(m().capsule(hip[0], hip[1] - 2 * k, hip[0], hip[1] + 3 * k, 4.8 * k, 4.6 * k), { ramp: trunks, bevel: b(3) });
    cv.part(m().capsule(sh[0], sh[1] + k, hip[0], hip[1] - 3 * k, 4.4 * k, 4 * k), { ramp: tank, bevel: b(3) });
    // the waistband: a bright line where the top meets the trunks
    cv.part(m().rect(hip[0] - 4 * k, hip[1] - 3 * k, 9 * k, Math.max(1, k)), { ramp: ['trunksHi', 'trunksHi', 'trunks'].map(c), bevel: 0, shadow: false });
    leg(J.kA, J.fA, false);
    cuff(J.kA, false);
    // head + hair
    cv.part(m().capsule(sh[0], sh[1], hd[0], hd[1] + 3 * k, 1.8 * k, 1.8 * k), { ramp: skin, bevel: b(1) });
    cv.part(m().ellipse(hd[0], hd[1], 4.4 * k, 4.8 * k), { ramp: skin, bevel: b(3) });
    cv.part(style(m(), hd[0], hd[1], k), { ramp: hair, bevel: b(2), inner: 'line' });
    // eye (and at 2x a brow and an ear), nose
    cv.px(hd[0] + 2 * k, hd[1] - k, c('outline'));
    if (k > 1) { cv.px(hd[0] + 2 * k + 1, hd[1] - k, c('outline')); cv.px(hd[0] + 2 * k, hd[1] - 2 * k - 1, c('outline')); cv.px(hd[0] + 2 * k + 1, hd[1] - 2 * k - 1, c('outline')); cv.part(m().ellipse(hd[0] - k, hd[1] + k, 1.4 * k / 2 + 1, 1.8 * k / 2 + 1), { ramp: skin, bevel: 1, inner: 'line' }); }
    cv.px(hd[0] + 4 * k, hd[1] + 2 * k, c('skinSh'));
    arm(J.eA, J.hA, false);
    return cv.toSprite(AX * k, AY * k);
  });
  return { frames, pal: pal.u32 };
}
export const ropeFrames = (profile, k = 1) => jogFrames(profile, SKIP, k);

// Trainer on a bicycle. Body/hat colors come from the trainer's palette keys.
const RIDER = {
  oldschool: { body: ['shirtHi', 'shirt', 'greyDk'], hat: ['capHi', 'cap', 'capDk'], metal: ['white', 'grey', 'greyDk'] },
  tactician: { body: ['poloHi', 'polo', 'poloDk'], hat: ['hairHi', 'hair', 'outline'], metal: ['white', 'metal', 'outline'], bun: true },
  hype: { body: ['jacketHi', 'jacket', 'jacketDk'], hat: ['hairHi', 'hair', 'outline'], metal: ['goldHi', 'gold', 'outline'], shades: true, tall: true },
};

export function bikeFrames(trainerId) {
  const { palette } = trainerPortrait(trainerId);
  const c = (k) => palette.idx(k);
  const R = RIDER[trainerId] || RIDER.oldschool;
  const body = R.body.map(c), hat = R.hat.map(c), metal = R.metal.map(c);
  const skin = ['skinHi', 'skin', 'skinSh', 'skinDk'].map(c);
  const BW = 56, BH = 56, bx = 28, by = 52;
  const frames = [0, 1, 2, 3].map((k) => {
    const cv = new SpriteCanvas(BW, BH, c('outline'));
    const m = () => new Mask(BW, BH);
    const wheel = (x) => {
      const ring = m().ellipse(x, by - 8, 8, 8).cut(m().ellipse(x, by - 8, 6.4, 6.4));
      cv.flat(ring, c('outline'));
      for (let s = 0; s < 4; s++) {
        const a = (s * Math.PI) / 4 + k * 0.4;
        cv.line(x - Math.cos(a) * 6, by - 8 - Math.sin(a) * 6, x + Math.cos(a) * 6, by - 8 + Math.sin(a) * 6, (X, Y) => cv.px(X, Y, metal[1]));
      }
      cv.px(x, by - 8, metal[0]);
    };
    wheel(bx - 13); wheel(bx + 13);
    // frame: seat post, top tube, down tube, fork, handlebars
    const fr = (x0, y0, x1, y1) => cv.line(bx + x0, by + y0, bx + x1, by + y1, (X, Y) => { cv.px(X, Y, metal[1]); cv.px(X, Y + 1, metal[2]); });
    fr(-13, -8, -4, -22); fr(-4, -22, 9, -21); fr(-4, -22, 0, -8); fr(0, -8, -13, -8); fr(0, -8, 9, -21); fr(9, -21, 13, -8); fr(9, -21, 8, -27);
    cv.line(bx + 6, by - 27, bx + 11, by - 27, (X, Y) => cv.px(X, Y, c('outline')));
    cv.part(m().ellipse(bx - 5, by - 23, 3.5, 1.4), { ramp: ['outline', 'outline', 'outline'].map(() => c('outline')), bevel: 1, shadow: false });
    // pedalling legs
    const crank = [[4, 0], [0, 4], [-4, 0], [0, -4]][k];
    const hip = [bx - 4, by - 26];
    const pedal = [bx + crank[0], by - 8 + crank[1]];
    const pedal2 = [bx - crank[0], by - 8 - crank[1]];
    const knee = (p) => [(hip[0] + p[0]) / 2 + 5, (hip[1] + p[1]) / 2 - 3];
    for (const [p, far] of [[pedal2, true], [pedal, false]]) {
      const K = knee(p);
      cv.part(m().capsule(hip[0], hip[1], K[0], K[1], 3.2, 2.8), { ramp: far ? body.map((x, i) => body[Math.min(2, i + 1)]) : body, bevel: 2 });
      cv.part(m().capsule(K[0], K[1], p[0], p[1] - 1, 2.6, 2.2), { ramp: far ? body.map((x, i) => body[Math.min(2, i + 1)]) : body, bevel: 2 });
      cv.part(m().ellipse(p[0] + 1, p[1], 3, 1.6), { ramp: ['outline', 'outline', 'outline'].map(() => c('outline')), bevel: 1, shadow: false });
    }
    // torso leaning forward, arm to the bars, head
    const sh = [bx + 1, by - 38];
    cv.part(m().capsule(hip[0], hip[1] - 1, sh[0], sh[1], 5, 5.4), { ramp: body, bevel: 3 });
    cv.part(m().capsule(sh[0], sh[1], bx + 5, by - 29, 2.2, 2), { ramp: body, bevel: 2 });
    cv.part(m().capsule(bx + 5, by - 29, bx + 9, by - 27, 2, 1.8), { ramp: skin, bevel: 2 });
    const hd = [bx + 4, by - 45];
    cv.part(m().ellipse(hd[0], hd[1], 4.6, 5), { ramp: skin, bevel: 3 });
    if (R.tall) cv.part(m().rect(hd[0] - 5, hd[1] - 11, 9, 8), { ramp: hat, bevel: 2 });
    else if (R.bun) { cv.part(m().ellipse(hd[0] - 1, hd[1] - 2, 5, 3.6).ellipse(hd[0] - 6, hd[1] - 4, 2.4, 2.2), { ramp: hat, bevel: 2 }); }
    else { cv.part(m().ellipse(hd[0] - 1, hd[1] - 3, 5.4, 3).rect(hd[0] - 1, hd[1] - 3, 8, 1.6), { ramp: hat, bevel: 2 }); }
    if (R.shades) cv.line(hd[0], hd[1], hd[0] + 4, hd[1], (X, Y) => cv.px(X, Y, c('shade')));
    else cv.px(hd[0] + 2, hd[1], c('outline'));
    return cv.toSprite(bx, by);
  });
  return { frames, pal: palette.u32 };
}
