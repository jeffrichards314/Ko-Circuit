// Small shared helpers for the Ascension's sprite layers.

// A ribbon streaming out from `from` (a scarf, a braid, a sash in the wind): a chain of tapering
// capsules along a sine wave, drawn as one shaded part. dir: 1 (to the viewer's right) or -1.
//   len, amp (wave height), waves (how many), r0 -> r1 (radius at the root -> at the tip), lift (rises by)
export function ribbon(ctx, from, dir, len, { amp = 3, waves = 1.2, r0 = 3, r1 = 0.9, lift = 0, ramp, bevel = 2, steps = 9, phase = 0 } = {}) {
  const m = ctx.mask();
  let prev = from;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const p = [from[0] + dir * len * t, from[1] + Math.sin(t * waves * Math.PI * 2 + phase) * amp * Math.min(1, t * 1.6) + lift * t];
    const r = (a) => r0 + (r1 - r0) * a;
    m.capsule(prev[0], prev[1], p[0], p[1], r((i - 1) / steps), r(t));
    prev = p;
  }
  ctx.cv.part(m, { ramp, bevel, inner: 'line' });
  return m;
}
