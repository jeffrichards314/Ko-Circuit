// Title Defense looks (§6): a champion's sprite layers may carry a `remix` block,
// and the remix fights in `<id>.td` layers built from it, so a remix is a new
// costume, not just a recolour:
//   remix: {
//     colors: { A: {...}, B: {...} },   extra palette keys (appended after the costume swap;
//                                       a palette holds 15 colours, so mind the room)
//     body: {...},                      merged over his own body (size, dims, legLen...)
//     ramps: {...},                     extra ramps (may use the new keys)
//     back(ctx), torso(ctx), front(ctx) drawn after his own hooks of the same name
//     backUnder(ctx)                    drawn before his own back (a cape under a collar)
//     head(ctx, H)                      drawn after his own head
//   }
// His own hooks see `ctx.layers.remixed` and can skip what the remix replaces
// (Gus's paper cap under the new toque, Baron's monocle under the eye patch...).

const chain = (a, b) => (a || b ? (ctx, ...r) => { if (a) a(ctx, ...r); if (b) b(ctx, ...r); } : undefined);

export function remixLayers(L) {
  const R = L.remix;
  const has = (k) => !(R.skip || []).includes(k);
  const body = L.body || R.body ? { ...(L.body || {}), ...(R.body || {}), dims: { ...((L.body || {}).dims || {}), ...((R.body || {}).dims || {}) } } : undefined;
  return {
    ...L,
    id: L.id + '.td',
    remixed: true,
    body,
    palettes: { ...L.palettes, default: L.palettes.default + '.td' },
    ramps: { ...L.ramps, ...(R.ramps || {}) },
    back: chain(chain(R.backUnder, has('back') ? L.back : undefined), R.back),
    torso: chain(has('torso') ? L.torso : undefined, R.torso),
    front: chain(has('front') ? L.front : undefined, R.front),
    head: L.head || R.head ? chain(L.head, R.head) : undefined,
  };
}
