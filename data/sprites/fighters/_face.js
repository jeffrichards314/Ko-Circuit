// Shared face kit for fighter head layers. Expressions follow the style bible
// set by Barney: 20px-wide eye stamps, capsule brows, flat mouths with teeth.
// Faces: neutral focus strain hurt dazed ko grin (+ chew for eating).

export const EYES = {
  neutral: ['...oooo......oooo...', '...wppw......wppw...', '....ss........ss....'],
  focus: ['....................', '...oooo......oooo...', '....ss........ss....'],
  strain: ['...oooo......oooo...', '...wpww......wwpw...', '...oooo......oooo...'],
  hurt: ['...oo..........oo...', '.....oo......oo.....', '...oo..........oo...'],
  dazed: ['...oooo......oooo...', '...wwwp......pwww...', '...oooo......oooo...'],
  ko: ['...o..o......o..o...', '....oo........oo....', '...o..o......o..o...'],
  grin: ['....................', '....oo........oo....', '...o..o......o..o...'],
  chew: ['....................', '...oooo......oooo...', '....ss........ss....'],
  wide: ['...oooo......oooo...', '...wwpw......wpww...', '...wwww......wwww...'],
};
// [innerDy, outerDy]
export const BROWS = {
  neutral: [0, 0], focus: [1, -1], strain: [1, -1], hurt: [-1, 1], dazed: [-1, 0],
  ko: [-1, 1], grin: [-1, 0], chew: [0, 0], wide: [-2, -1],
};
export const MOUTHS = {
  neutral: null, focus: 'teeth', strain: 'open', hurt: 'open', dazed: 'slack', ko: 'slack', grin: 'smile', chew: 'chew', wide: 'open',
};

// eye spacing: `gap` px between the stamps' default positions (0 = Barney's)
export function eyes(ctx, fx, fy, face, gap = 0) {
  const { cv, c } = ctx;
  const rows = EYES[face] || EYES.neutral;
  const map = { o: c('outline'), w: c('white'), p: c('outline'), s: { shade: 1 } };
  const h = Math.floor(gap / 2);
  cv.stamp(rows.map((r) => r.slice(0, 10)), fx - 10 - h, fy - 2, map);
  cv.stamp(rows.map((r) => r.slice(10)), fx + gap - h, fy - 2, map);
}

export function brows(ctx, fx, fy, face, ramp, { len = 4.5, thick = 1.1, gap = 0, y = -3.4 } = {}) {
  const [bi, bo] = BROWS[face] || BROWS.neutral;
  const h = gap / 2;
  const m = ctx.mask()
    .capsule(fx - 3 - len - h, fy + y + bo, fx - 3 - h, fy + y + bi, thick, thick * 0.9)
    .capsule(fx + 2 + len + h, fy + y + bo, fx + 2 + h, fy + y + bi, thick, thick * 0.9);
  ctx.cv.part(m, { ramp, bevel: 1, inner: 'soft' });
  return m;
}

// Mouth centered at (fx, my). white/tooth colors come from the palette keys.
export function mouth(ctx, fx, my, face, { w = 4, teeth = 'white', inside = 'mouth' } = {}) {
  const { cv, c } = ctx;
  const kind = MOUTHS[face];
  const mo = ctx.mask();
  if (kind === 'open') mo.ellipse(fx, my + 1.5, w * 0.85, 2.4);
  else if (kind === 'slack') mo.ellipse(fx + 1, my + 1.5, w * 0.65, 1.8);
  else if (kind === 'teeth' || kind === 'smile') mo.rect(fx - w, my, w * 2, 2);
  else if (kind === 'chew') mo.ellipse(fx, my + 1, w * 0.5, 1.2);
  if (mo.empty()) {
    for (let i = -Math.round(w * 0.6); i < Math.round(w * 0.6); i++) cv.px(fx + i, my + 1, c('outline'));
    return kind;
  }
  cv.flat(mo, c(inside), true);
  if (kind === 'open') for (let i = -2; i <= 1; i++) cv.px(fx + i, my, c(teeth));
  if (kind === 'teeth') { for (let i = -w + 1; i < w - 1; i++) cv.px(fx + i, my, c(teeth)); for (let i = -w + 1; i < w - 1; i += 2) cv.px(fx + i, my + 1, c(teeth)); }
  if (kind === 'smile') { for (let i = -w; i < w; i++) cv.px(fx + i, my, c(teeth)); cv.px(fx - w - 1, my - 1, c('outline')); cv.px(fx + w, my - 1, c('outline')); }
  return kind;
}

export function ears(ctx, H, ramp, [rx, ry] = [2.4, 3.5]) {
  const [lx, ly] = H.look;
  const m = ctx.mask()
    .ellipse(H.x - H.rx + 0.5 + lx * 0.3, H.y + 1 + ly * 0.5, rx, ry)
    .ellipse(H.x + H.rx - 0.5 + lx * 0.3, H.y + 1 + ly * 0.5, rx, ry);
  ctx.cv.part(m, { ramp, bevel: 2 });
}

// Skull + jaw. jaw: 'square' | 'round' | 'narrow' | 'chin'
export function skull(ctx, H, ramp, jaw = 'round') {
  const x = Math.round(H.x), y = Math.round(H.y);
  const [lx, ly] = H.look;
  const m = ctx.mask().ellipse(x, y, H.rx, H.ry);
  if (jaw === 'square') m.ellipse(x + lx * 0.3, y + 4 + ly * 0.3, H.rx + 0.4, H.ry - 4).rect(x - H.rx + 2 + lx * 0.3, y + 3, H.rx * 2 - 4, H.ry - 2);
  else if (jaw === 'round') m.ellipse(x + lx * 0.3, y + 4 + ly * 0.3, H.rx + 0.8, H.ry - 3.5);
  else if (jaw === 'narrow') m.ellipse(x + lx * 0.3, y + 5 + ly * 0.3, H.rx - 1.5, H.ry - 4);
  else if (jaw === 'chin') m.ellipse(x + lx * 0.3, y + 4 + ly * 0.3, H.rx + 0.3, H.ry - 4).ellipse(x + lx * 0.5, y + H.ry - 1 + ly * 0.3, 4, 3);
  ctx.cv.part(m, { ramp, bevel: 7 });
  ctx.headMask = m;
  return m;
}

export function nose(ctx, fx, fy, ramp, [rx, ry] = [2.2, 2.2], dy = 3.5) {
  const m = ctx.mask().ellipse(fx, fy + dy, rx, ry).rect(fx - 1, fy, 2, 2);
  ctx.cv.part(m, { ramp, bevel: 2, inner: 'soft' });
  ctx.cv.px(fx - Math.round(rx) + 0, fy + dy + ry - 0.5, ctx.c('skinDk'));
  ctx.cv.px(fx + Math.round(rx) - 1, fy + dy + ry - 0.5, ctx.c('skinDk'));
}

// Checker stubble over the jaw.
export function stubble(ctx, fx, fy, from = 7, to = 12, n = 1) {
  const hm = ctx.headMask;
  for (let j = from; j <= to; j++) for (let i = -9; i <= 9; i++) {
    const X = fx + i, Y = fy + j;
    if (hm.in(X, Y) && (X + Y) % 2 === 0 && Math.abs(i) > 1 - (j > 9 ? 3 : 0)) ctx.cv.shade(X, Y, n);
  }
}

// Little sweat drops that fly off (pose.sweat = 1 or 2 for the frame).
export function sweat(ctx, H, k, key = 'white') {
  const { cv, c } = ctx;
  const drops = k === 1 ? [[-H.rx - 3, -4], [H.rx + 4, -7], [H.rx + 2, 2]] : [[-H.rx - 5, -8], [H.rx + 6, -3], [-H.rx - 2, 1]];
  for (const [dx, dy] of drops) {
    const x = Math.round(H.x + dx), y = Math.round(H.y + dy);
    cv.px(x, y, c(key)); cv.px(x, y + 1, c(key)); cv.px(x - 1, y + 1, c('outline')); cv.px(x + 1, y + 1, c('outline')); cv.px(x, y + 2, c('outline')); cv.px(x, y - 1, c('outline'));
  }
}
