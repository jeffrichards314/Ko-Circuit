// Figure composer: build template + pose + fighter layers -> palette-index sprite.
//
// Builds (/data/sprites/builds) give proportions and a shared pose library.
// Fighter layers (/data/sprites/fighters) give material ramps, head/face,
// costume detail and props. Poses are joint positions relative to the feet
// anchor, in "medium build" units; builds scale them.

import { Mask, SpriteCanvas } from './sprites.js';

const SIDES = ['L', 'R'];

export function resolvePose(poses, name) {
  // '~pose' = the left/right mirror of any pose (a stance switch, Tempest Tia)
  if (name[0] === '~') return mirrorPose(resolvePose(poses, name.slice(1)));
  const p = poses[name];
  if (!p) throw new Error(`unknown pose ${name}`);
  // `mirror: 'jab'` = the other arm doing the same thing (other keys override)
  if (p.mirror) {
    const out = { ...mirrorPose(resolvePose(poses, p.mirror)), ...p };
    delete out.mirror;
    return out;
  }
  if (!p.extends) return p;
  const base = resolvePose(poses, p.extends);
  const out = { ...base, ...p };
  delete out.extends;
  // nested objects merge one level deep
  for (const k of ['head', 'gloveL', 'gloveR', 'armZ']) if (base[k] && p[k]) out[k] = { ...base[k], ...p[k] };
  if (p.shift) {
    const [dx, dy] = p.shift;
    for (const k of JOINTS) if (p[k] === undefined && out[k]) out[k] = [out[k][0] + dx, out[k][1] + dy];
    if (!(p.head && p.head.at) && out.head) out.head = { ...out.head, at: [base.head.at[0] + dx, base.head.at[1] + dy] };
    delete out.shift;
  }
  return out;
}

const JOINTS = ['hip', 'waist', 'chest', 'neck', 'shL', 'shR', 'elL', 'elR', 'fiL', 'fiR', 'knL', 'knR', 'ftL', 'ftR'];

// A fighter's own body (layers.body, merged into his build by spriteCache): the
// shared poses are reshaped before drawing. L stretches the legs (feet stay on
// the floor), T the torso above the hips, W spreads the shoulders (the arms
// move with them) and N lengthens the neck (in medium-build pixels).
export function reshape(p, { L = 1, T = 1, W = 1, N = 0 }) {
  if (L === 1 && T === 1 && W === 1 && !N) return p;
  const out = { ...p };
  const hipY = p.hip ? p.hip[1] : -40;
  const up = (y) => hipY * L + (y - hipY) * T;
  for (const k of ['hip', 'knL', 'knR', 'ftL', 'ftR']) if (p[k]) out[k] = [p[k][0], p[k][1] * L];
  for (const k of ['waist', 'chest', 'neck', 'shL', 'shR', 'elL', 'elR', 'fiL', 'fiR']) if (p[k]) out[k] = [p[k][0], up(p[k][1])];
  if (p.head && p.head.at) out.head = { ...p.head, at: [p.head.at[0], up(p.head.at[1]) - N] };
  const cx = p.chest ? p.chest[0] : 0;
  for (const s of SIDES) {
    const sh = out['sh' + s];
    if (!sh) continue;
    const dx = (sh[0] - cx) * (W - 1);
    for (const k of ['sh', 'el', 'fi']) if (out[k + s]) out[k + s] = [out[k + s][0] + dx, out[k + s][1]];
  }
  return out;
}

// Left/right mirror of a resolved pose: joints swap sides, x flips, glove angles flip.
export function mirrorPose(p) {
  const out = { ...p };
  const swap = (k) => k.replace(/L$/, '\0').replace(/R$/, 'L').replace('\0', 'R');
  for (const k of JOINTS) {
    if (!p[k]) continue;
    out[swap(k)] = [-p[k][0], p[k][1]];
  }
  if (p.head) out.head = { ...p.head, at: [-p.head.at[0], p.head.at[1]], look: p.head.look && [-p.head.look[0], p.head.look[1]] };
  const g = (o) => o && { ...o, angle: o.angle !== undefined ? -o.angle : undefined, thumb: o.thumb && -o.thumb };
  out.gloveL = g(p.gloveR); out.gloveR = g(p.gloveL);
  if (p.armZ) out.armZ = { L: p.armZ.R, R: p.armZ.L };
  if (p.frontOrder) out.frontOrder = p.frontOrder.map((s) => (s === 'L' ? 'R' : 'L'));
  if (p.lean) out.lean = -p.lean;
  return out;
}

export function composeFigure(build, layers, pose, pal) {
  if (build.body) pose = reshape(pose, build.body);
  const C = build.canvas;
  const D = build.dims;
  const sx = build.scale[0], sy = build.scale[1];
  const cv = new SpriteCanvas(C.w, C.h, pal.idx('outline'));
  const J = {};
  const tr = ([x, y]) => [C.ax + x * sx, C.ay + y * sy];
  for (const k of JOINTS) if (pose[k]) J[k] = tr(pose[k]);
  const headPose = { face: 'neutral', look: [0, 0], ...(pose.head || {}) };
  J.head = tr(headPose.at);
  const ramps = {};
  for (const [k, keys] of Object.entries(layers.ramps)) ramps[k] = keys.map((key) => pal.idx(key));
  const ctx = {
    cv, J, D, pose, pal, ramps, build, layers,
    mask: () => new Mask(C.w, C.h),
    c: (key) => pal.idx(key),
    head: headPose,
    sx, sy,
  };
  const armZ = pose.armZ || {};

  layers.back && layers.back(ctx); // capes, bags: behind everything
  for (const s of SIDES) if (armZ[s] === 'back') drawArm(ctx, s);
  if (pose.lying) {
    // feet toward the camera: torso, hips, legs; the head goes on last so the
    // face reads (drawn first, the neck and chest painted over it)
    drawNeck(ctx);
    drawTorso(ctx);
    drawShorts(ctx, true);
    layers.torso && layers.torso(ctx);
    drawLegs(ctx);
    drawHead(ctx);
  } else {
    drawLegs(ctx);
    drawNeck(ctx);
    drawTorso(ctx);
    drawShorts(ctx);
    layers.torso && layers.torso(ctx);
    drawHead(ctx);
  }
  const order = pose.frontOrder || SIDES;
  for (const s of order) if (armZ[s] !== 'back') drawArm(ctx, s);
  layers.front && layers.front(ctx);
  return cv.toSprite(C.ax, C.ay);
}

// --- body parts --------------------------------------------------------------

function drawLegs(ctx) {
  const { J, D, cv, ramps, pose } = ctx;
  const spread = (pose.hipSpread ?? D.hipSpread) * ctx.sx;
  for (const s of SIDES) {
    const sign = s === 'L' ? -1 : 1;
    const hipJ = [J.hip[0] + sign * spread, J.hip[1]];
    const kn = J['kn' + s], ft = J['ft' + s];
    const ank = [ft[0] - sign * 0.5, ft[1] - D.ankle];
    const m = ctx.mask().capsule(kn[0], kn[1], ank[0], ank[1], D.shin[0], D.shin[1]);
    cv.part(m, { ramp: ramps.skin, bevel: 3, inner: 'line' });
    const th = ctx.mask().capsule(hipJ[0], hipJ[1], kn[0], kn[1], D.thigh[0], D.thigh[1]);
    cv.part(th, { ramp: ramps.skin, bevel: 4, inner: 'soft' });
    // knee cap hint
    cv.shade(kn[0] + sign, kn[1] + 2, 1);
    // sock
    if (ramps.sock) {
      const top = lerp(ank, kn, D.sockHeight);
      const sm = ctx.mask().capsule(top[0], top[1], ank[0], ank[1], D.shin[1] + 0.9, D.shin[1] + 0.6);
      cv.part(sm, { ramp: ramps.sock, bevel: 3, inner: 'line' });
      // ribbing stripe
      for (let x = -4; x <= 4; x++) if (sm.in(Math.round(top[0] + x), Math.round(top[1] + 2))) cv.shade(top[0] + x, top[1] + 2, 1);
    }
    drawBoot(ctx, ft, sign, pose.lying);
  }
}

function drawBoot(ctx, ft, sign, lying) {
  const { cv, D, ramps } = ctx;
  const m = ctx.mask();
  if (lying) {
    // sole facing the camera
    m.ellipse(ft[0], ft[1] - 3, D.boot[1] + 1, D.boot[0] - 1);
    cv.part(m, { ramp: ramps.boot, bevel: 2 });
    const sole = ctx.mask().ellipse(ft[0], ft[1] - 2, D.boot[1] - 1.5, D.boot[0] - 3.5);
    cv.part(sole, { ramp: ramps.sole || ramps.boot, bevel: 1, inner: 'line', shadow: false });
    return;
  }
  m.capsule(ft[0], ft[1] - D.ankle - 2, ft[0], ft[1] - 3, D.shin[1] + 1.2, D.shin[1] + 1.8);
  m.ellipse(ft[0] + sign * 2, ft[1] - 3, D.boot[0], D.boot[1]);
  cv.part(m, { ramp: ramps.boot, bevel: 3, inner: 'line' });
  // sole line + laces
  for (let x = -D.boot[0] + 1; x < D.boot[0]; x++) cv.shade(ft[0] + sign * 2 + x, ft[1] - 1, 2);
  cv.shade(ft[0], ft[1] - D.ankle, -1);
  cv.shade(ft[0], ft[1] - D.ankle + 2, -1);
}

function drawNeck(ctx) {
  const { J, D, cv, ramps } = ctx;
  const m = ctx.mask().capsule(J.neck[0], J.neck[1] + 3, J.head[0], J.head[1] + 4, D.neck, D.neck);
  cv.part(m, { ramp: ramps.skin, bevel: 3, bias: -0.1 });
}

export function torsoMask(ctx) {
  const { J, D } = ctx;
  const sw = D.deltoid;
  const sL = J.shL, sR = J.shR, n = J.neck, ch = J.chest, w = J.waist;
  const pts = [
    [n[0] - D.neck - 1, n[1] + 1],
    [sL[0] + 2, sL[1] - sw + 1],
    [sL[0] - sw + 1, sL[1] + 1],
    [ch[0] - D.chestW, ch[1] + 1],
    [w[0] - D.waistW, w[1]],
    [w[0] + D.waistW, w[1]],
    [ch[0] + D.chestW, ch[1] + 1],
    [sR[0] + sw - 1, sR[1] + 1],
    [sR[0] - 2, sR[1] - sw + 1],
    [n[0] + D.neck + 1, n[1] + 1],
  ];
  const m = ctx.mask().poly(pts);
  m.ellipse(sL[0], sL[1], sw, sw);
  m.ellipse(sR[0], sR[1], sw, sw);
  if (D.belly) m.ellipse(w[0], w[1] - D.belly * 0.6, D.waistW + D.belly * 0.5, D.belly);
  return m;
}

function drawTorso(ctx) {
  const { cv, ramps, layers } = ctx;
  const m = torsoMask(ctx);
  ctx.torsoMask = m;
  cv.part(m, { ramp: ramps[layers.torsoMaterial || 'skin'], bevel: 7 });
}

function drawShorts(ctx, lying) {
  const { J, D, cv, ramps, pose } = ctx;
  const spread = (pose.hipSpread ?? D.hipSpread) * ctx.sx;
  const w = J.waist, h = J.hip;
  const m = ctx.mask();
  const top = w[1] - (lying ? 0 : 2);
  m.poly([
    [w[0] - D.waistW - 1, top], [w[0] + D.waistW + 1, top],
    [h[0] + spread + D.thigh[0], h[1]], [h[0] - spread - D.thigh[0], h[1]],
  ]);
  for (const s of SIDES) {
    const sign = s === 'L' ? -1 : 1;
    const hipJ = [h[0] + sign * spread, h[1]];
    const kn = J['kn' + s];
    const hem = lerp(hipJ, kn, D.shortsLen);
    m.capsule(hipJ[0], hipJ[1] - 2, hem[0], hem[1], D.thigh[0] + 1, D.thigh[0] + 0.8);
  }
  ctx.shortsMask = m;
  cv.part(m, { ramp: ramps.shorts, bevel: 5 });
}

function drawHead(ctx) {
  const { J, D, cv, ramps, layers, head } = ctx;
  const [hx, hy] = J.head;
  const H = { x: hx, y: hy, rx: D.head[0], ry: D.head[1], ...head };
  if (layers.head) return layers.head(ctx, H);
  const m = ctx.mask().ellipse(hx, hy, H.rx, H.ry);
  cv.part(m, { ramp: ramps.skin, bevel: 8 });
}

function drawArm(ctx, s) {
  const { J, D, cv, ramps, layers, pose } = ctx;
  const sign = s === 'L' ? -1 : 1;
  const sh = J['sh' + s], el = J['el' + s], fi = J['fi' + s];
  const gOpt = pose['glove' + s] || {};
  const sleeve = layers.sleeve;
  // upper arm
  const ua = ctx.mask().capsule(sh[0], sh[1], el[0], el[1], D.upperArm[0], D.upperArm[1]);
  cv.part(ua, { ramp: ramps.skin, bevel: 4, inner: 'line' });
  if (sleeve) {
    const end = lerp(sh, el, sleeve.length);
    const sm = ctx.mask().capsule(sh[0], sh[1], end[0], end[1], D.upperArm[0] + 0.6, D.upperArm[1] + 1);
    cv.part(sm, { ramp: ramps[sleeve.material], bevel: 4, inner: 'line' });
    // rolled cuff band
    const c0 = lerp(sh, el, sleeve.length - 0.12);
    const cm = ctx.mask().capsule(c0[0], c0[1], end[0], end[1], D.upperArm[1] + 1.2, D.upperArm[1] + 1.2).clip(sm);
    cv.part(cm, { ramp: ramps[sleeve.material], bevel: 2, bias: 0.25, inner: 'line', shadow: false });
  }
  // forearm
  const fa = ctx.mask().capsule(el[0], el[1], fi[0], fi[1], D.forearm[0], D.forearm[1]);
  cv.part(fa, { ramp: ramps.skin, bevel: 3, inner: 'soft' });
  if (!gOpt.hidden) drawGlove(ctx, fi, el, sign, gOpt);
}

export function drawGlove(ctx, fi, el, sign, opt = {}) {
  const { D, cv, ramps } = ctx;
  const size = opt.size || 1;
  const view = opt.view || 'side';
  // Orientation: degrees from straight up (knuckles up), clockwise positive.
  const ang = opt.angle !== undefined ? (opt.angle * Math.PI) / 180 : Math.atan2(fi[0] - el[0], -(fi[1] - el[1]));
  const ux = Math.sin(ang), uy = -Math.cos(ang); // toward the knuckles
  const vx = -uy, vy = ux;                        // across the glove
  const tside = opt.thumb || -sign;               // thumb faces the body centre
  const G = D.glove;
  if (view === 'front') {
    // fist coming at the camera: round, thumb tucked on the inner-lower side
    const r = G[1] * size;
    const cx = fi[0], cy = fi[1];
    const gm = ctx.mask().ellipse(cx, cy, r, r * 0.94);
    cv.part(gm, { ramp: ramps.glove, bevel: r * 0.85 });
    const tm = ctx.mask().ellipse(cx + tside * r * 0.5, cy + r * 0.42, r * 0.42, r * 0.36, 1, -tside * 0.4);
    cv.part(tm, { ramp: ramps.glove, bevel: 2, inner: 'line', shadow: false });
    for (let k = -1; k <= 1; k++) {
      const kx = cx + k * r * 0.36 + tside, ky = cy - r * 0.1;
      cv.shade(kx, ky, 1); cv.shade(kx, ky + 1, 1);
    }
    cv.shade(cx - r * 0.42, cy - r * 0.45, -2); cv.shade(cx - r * 0.3, cy - r * 0.55, -2);
    return;
  }
  const rx = G[0] * size, ry = G[1] * size;
  const cx = fi[0] + ux * ry * 0.3, cy = fi[1] + uy * ry * 0.3;
  const wx = cx - ux * ry * 0.82, wy = cy - uy * ry * 0.82;
  const cuffR = ry * 0.3, cuffW = rx * 0.58;
  const gm = ctx.mask().ellipse(cx, cy, rx, ry, 1, ang);
  gm.capsule(wx - vx * cuffW, wy - vy * cuffW, wx + vx * cuffW, wy + vy * cuffW, cuffR, cuffR);
  cv.part(gm, { ramp: ramps.glove, bevel: rx * 0.9 });
  const cuff = ctx.mask().capsule(wx - vx * cuffW, wy - vy * cuffW, wx + vx * cuffW, wy + vy * cuffW, cuffR, cuffR);
  cuff.cut(ctx.mask().ellipse(cx + ux, cy + uy, rx, ry * 0.92, 1, ang));
  cv.part(cuff.clip(gm), { ramp: ramps.cuff || ramps.glove, bevel: 1.5, bias: 0.2, inner: 'line', shadow: false });
  if (view === 'back') { cv.shade(cx - rx * 0.35, cy - ry * 0.4, -2); return; }
  const tx = cx + vx * tside * rx * 0.72 - ux * ry * 0.08, ty = cy + vy * tside * rx * 0.72 - uy * ry * 0.08;
  const tm = ctx.mask().ellipse(tx, ty, rx * 0.4, ry * 0.52, 1, ang);
  cv.part(tm, { ramp: ramps.glove, bevel: 2, inner: 'line', shadow: false });
  cv.shade(cx - rx * 0.35, cy - ry * 0.45, -2);
  cv.shade(cx - rx * 0.2, cy - ry * 0.55, -2);
}

export function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
