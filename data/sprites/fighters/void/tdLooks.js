// Title Defense looks of the twelve Hollowed (spec §6): each shard is re-dressed as a figure of his own, in his own colours, with pieces from the
// costume kit (data/sprites/remixKit.js). Their tint, the hollow in the chest and the faces stay (the fights are read from them), so the
// punches are as readable as ever; what changes is who they look like. Each is `remix:` in the shard's sprite file.
import * as K from '../../remixKit.js';

// a colour family from an array of 3-4 shades: F('top', [[hi], [mid], [sh], [dk]]) -> { topHi, top, topSh, topDk }
const F = (name, c, names = ['Hi', '', 'Sh', 'Dk']) => Object.fromEntries(c.map((v, i) => [name + names[i], v]));
const G = (c) => F('glove', c, ['Hi', '', 'Dk']);
const hair = (c) => F('hair', c, ['Hi', '', 'Dk']);
const skin = (c) => F('skin', c);
const top = (c) => F('top', c);
const trim = (c) => F('trim', c, ['Hi', '', 'Sh']);
const boot = (c) => F('boot', c, ['Hi', '', 'Dk']);
const sh = (c) => F('sh', c, ['Hi', '', 'Dk']);
const lying = (ctx) => ctx.pose.lying;

export const TD = {
  // the runner: a hooded cloak of wind, a scarf streaming behind, feathered ankles
  dodgeShard: {
    swap: { A: { ...G([[30, 31, 31], [21, 28, 31], [9, 15, 24]]) }, B: { ...top([[24, 30, 31], [15, 24, 27], [8, 15, 19], [3, 7, 11]]), ...sh([[10, 18, 22], [5, 11, 15], [2, 5, 8]]), ...boot([[31, 31, 31], [24, 28, 31], [12, 16, 24]]), ...trim([[31, 31, 31], [25, 29, 31], [13, 17, 26]]) } },
    back(ctx) { if (!lying(ctx)) K.scarf(ctx, { ramp: 'trim', tails: true, len: 56 }); K.cape(ctx, { ramp: 'top', inner: 'trim', len: 44, flare: 18, hem: 'tatter' }); },
    head(ctx, H) { K.hood(ctx, H, { ramp: 'top', drape: 18 }); },
    front(ctx) { K.ankleWings(ctx, { ramp: 'trim', n: 4, len: 16 }); K.bracers(ctx, { ramp: 'top', from: 0.3, to: 0.62, wide: 1.2 }); },
  },
  // the wall: a bronze tower shield, a crested helm with cheek guards, bronze plate over the bone
  blockShard: {
    swap: { A: { ...skin([[27, 27, 29], [21, 21, 24], [13, 13, 17], [6, 6, 9]]), ...G([[26, 22, 17], [16, 13, 10], [7, 6, 5]]) }, B: { ...top([[24, 18, 10], [16, 11, 6], [9, 6, 3], [4, 3, 1]]), ...trim([[31, 27, 14], [26, 19, 6], [14, 9, 2]]), ...sh([[10, 8, 7], [5, 4, 4], [2, 2, 2]]), ...boot([[14, 11, 9], [7, 5, 4], [3, 2, 2]]) } },
    head(ctx, H) { K.helm(ctx, H, { ramp: 'top', cover: 0.55, crest: 'fin', crestRamp: 'trim', cheeks: true, rim: 'trim' }); },
    torso(ctx) { if (!lying(ctx)) K.pauldrons(ctx, { ramp: 'trim', style: 'spiked', size: 5, tip: 'top' }); },
    back(ctx) { if (!lying(ctx)) K.cape(ctx, { ramp: 'trim', inner: 'top', len: 30, flare: 14, hem: 'straight' }); },
    front(ctx) { if (!lying(ctx)) K.shield(ctx, { ramp: 'trim', side: 'L', kind: 'tower', w: 26, h: 54, emblemShape: 'cross', emblemRamp: 'top' }); K.greaves(ctx, { ramp: 'top', knee: true }); },
  },
  // the dancer: a plum veil, a long split skirt, ribbons from both wrists
  duckShard: {
    body: { size: [1.1, 1.0], shoulders: 1.2 },
    back(ctx) { if (!lying(ctx)) K.cape(ctx, { ramp: 'top', inner: 'trim', len: 56, flare: 22, hem: 'scallop' }); },
    swap: { B: { ...top([[22, 12, 26], [14, 6, 19], [8, 3, 12], [3, 1, 6]]), ...sh([[12, 5, 15], [7, 2, 9], [3, 1, 4]]), ...trim([[31, 26, 24], [28, 17, 16], [16, 7, 8]]), ...boot([[28, 20, 20], [22, 12, 14], [12, 5, 7]]) }, A: { ...G([[31, 27, 25], [27, 17, 17], [15, 7, 8]]) } },
    head(ctx, H) { K.hood(ctx, H, { ramp: 'top', drape: 22 }); K.band(ctx, H, { ramp: 'trim', y: -5, h: 2 }); },
    torso(ctx) { if (!lying(ctx)) { K.skirt(ctx, { ramp: 'top', kind: 'strips', len: 40, n: 7 }); K.sash(ctx, { ramp: 'trim', dir: -1, wide: 2.2, knot: false }); } },
    front(ctx) { K.chains(ctx, { ramp: 'trim', len: 6 }); },
  },
  // the fencer: a wide navy hat with a white plume, a short cape, a silver sash
  counterShard: {
    swap: { A: { ...skin([[31, 30, 28], [28, 26, 24], [19, 17, 16], [10, 9, 9]]), ...G([[31, 31, 31], [26, 27, 30], [14, 15, 21]]) }, B: { ...top([[10, 14, 26], [5, 8, 19], [2, 4, 11], [1, 2, 5]]), ...trim([[31, 31, 31], [26, 28, 31], [14, 16, 24]]), ...sh([[31, 31, 31], [25, 26, 29], [13, 14, 19]]), ...boot([[8, 10, 18], [4, 5, 11], [2, 2, 5]]) } },
    back(ctx) { if (!lying(ctx)) K.cape(ctx, { ramp: 'top', inner: 'trim', len: 22, flare: 4, hem: 'scallop' }); },
    head(ctx, H) { K.hat(ctx, H, { kind: 'wide', ramp: 'top' }); K.plume(ctx, H, { ramp: 'trim', len: 14, dir: 1, from: [Math.round(H.x + H.rx), Math.round(H.y - H.ry) - 1] }); },
    torso(ctx) { if (!lying(ctx)) K.sash(ctx, { ramp: 'trim', dir: 1, wide: 2.4, knot: true }); },
    front(ctx) { K.bracers(ctx, { ramp: 'trim', from: 0.2, to: 0.45, wide: 1.4 }); },
  },
  // the watcher: white and gold robes, a tall mitre with an eye on it, a high collar
  sightShard: {
    body: { size: [1.08, 1.0], shoulders: 1.18 },
    back(ctx) { if (!lying(ctx)) { const [hx, hy] = ctx.J.head; K.ring(ctx, { ramp: 'trim', cx: hx, cy: hy - 4, rx: 26, ry: 26, thick: 3, half: 'back' }); K.cape(ctx, { ramp: 'top', inner: 'trim', len: 40, flare: 16, hem: 'scallop' }); } },
    swap: { B: { ...top([[31, 31, 30], [28, 27, 23], [19, 17, 13], [9, 8, 6]]), ...trim([[31, 30, 16], [29, 23, 6], [17, 11, 2]]), ...sh([[26, 25, 21], [17, 16, 13], [8, 7, 6]]), ...boot([[28, 26, 20], [20, 18, 12], [10, 9, 6]]) }, A: { ...G([[31, 31, 22], [30, 25, 8], [20, 14, 3]]) } },
    head(ctx, H) { K.mitre(ctx, H, { ramp: 'top', trim: 'trim', h: 28, emblemShape: 'eye', emblemRamp: 'trim' }); },
    torso(ctx) { if (!lying(ctx)) { K.skirt(ctx, { ramp: 'top', kind: 'tabard', len: 30 }); K.collar(ctx, { ramp: 'top', style: 'high', size: 0.9 }); } },
    front(ctx) { K.bracers(ctx, { ramp: 'trim', from: 0.22, to: 0.5, wide: 1.6 }); },
  },
  // the listener: great brass ear-trumpets either side of the skull, copper rags, bells at the belt
  soundShard: {
    swap: { B: { ...top([[24, 14, 8], [17, 9, 5], [10, 5, 3], [4, 2, 1]]), ...trim([[31, 28, 14], [27, 20, 5], [15, 10, 2]]), ...sh([[16, 9, 6], [9, 5, 3], [4, 2, 1]]), ...boot([[22, 13, 8], [13, 7, 4], [6, 3, 2]]) }, A: { ...G([[31, 28, 14], [27, 20, 5], [15, 10, 2]]) } },
    head(ctx, H) { K.horns(ctx, H, { ramp: 'trim', len: 16, out: 19, y: 5, thick: 5.5 }); },
    back(ctx) { if (!lying(ctx)) K.cape(ctx, { ramp: 'top', inner: 'trim', len: 34, flare: 12, hem: 'tatter' }); },
    torso(ctx) { if (!lying(ctx)) { K.skirt(ctx, { ramp: 'top', kind: 'strips', len: 30, n: 5 }); K.pauldrons(ctx, { ramp: 'trim', style: 'fan', size: 2 }); K.studs(ctx, { ramp: 'trim', pts: [[ctx.J.waist[0] - 8, ctx.J.waist[1] + 14], [ctx.J.waist[0], ctx.J.waist[1] + 15], [ctx.J.waist[0] + 8, ctx.J.waist[1] + 14]] }); K.bandolier(ctx, { ramp: 'top', dir: 1, studs: 'trim', n: 4 }); } },
    front(ctx) { K.rings(ctx, { ramp: 'trim', where: 0.35 }); },
  },
  // the drummer: a crimson drum major's uniform, a tall shako with a white plume, gold epaulettes and a sash, a drum at the hip
  rhythmShard: {
    body: { size: [1.1, 1.14], shoulders: 1.2 },
    back(ctx) { if (!lying(ctx)) K.cape(ctx, { ramp: 'top', inner: 'trim', len: 34, flare: 12, hem: 'scallop' }); },
    swap: { A: { ...skin([[31, 29, 28], [28, 25, 24], [20, 16, 16], [11, 8, 8]]), ...G([[31, 31, 31], [24, 24, 26], [12, 12, 16]]) }, B: { ...top([[27, 6, 10], [19, 2, 6], [10, 1, 3], [4, 0, 1]]), ...trim([[31, 30, 16], [29, 23, 6], [17, 11, 2]]), ...sh([[30, 30, 30], [24, 24, 26], [12, 12, 16]]), ...boot([[28, 28, 30], [20, 20, 24], [9, 9, 13]]) } },
    head(ctx, H) { K.hat(ctx, H, { kind: 'fez', ramp: 'top', h: 17, band: 'trim' }); K.plume(ctx, H, { ramp: 'glove', len: 9, dir: 1, from: [Math.round(H.x + 1), Math.round(H.y - H.ry) - 16] }); },
    torso(ctx) { if (!lying(ctx)) { K.sash(ctx, { ramp: 'trim', dir: -1, wide: 2.6, knot: false }); K.pauldrons(ctx, { ramp: 'trim', style: 'fan', size: 5 }); K.skirt(ctx, { ramp: 'top', kind: 'strips', len: 28, n: 6 }); K.drum(ctx, { ramp: 'top', rim: 'trim', side: 1 }); } },
  },
  // the scribe: an ink-blue gown to the ankle, a flat scholar's cap with a tassel, a bandolier of scrolls
  memoryShard: {
    body: { size: [1.08, 1.06], shoulders: 1.15 },
    back(ctx) { if (!lying(ctx)) { K.pack(ctx, { ramp: 'trim', w: 30, h: 46, top: 18 }); K.cape(ctx, { ramp: 'top', inner: 'trim', len: 36, flare: 12, hem: 'straight' }); } },
    swap: { A: { ...G([[31, 29, 22], [27, 23, 15], [16, 13, 8]]) }, B: { ...top([[6, 12, 20], [3, 7, 13], [1, 3, 7], [0, 1, 3]]), ...trim([[31, 29, 22], [27, 23, 15], [16, 13, 8]]), ...sh([[5, 9, 15], [2, 5, 9], [1, 2, 4]]), ...boot([[8, 14, 22], [4, 8, 14], [2, 3, 7]]) } },
    head(ctx, H) {
      const x = Math.round(H.x + H.look[0] * 0.3), ty = Math.round(H.y - H.ry) + 1;
      ctx.cv.part(ctx.mask().rect(x - H.rx - 4, ty - 2, H.rx * 2 + 8, 3), { ramp: ctx.ramps.top, bevel: 1, inner: 'line', shadow: false });
      ctx.cv.part(ctx.mask().rect(x - H.rx + 1, ty - 6, H.rx * 2 - 2, 5), { ramp: ctx.ramps.top, bevel: 2, inner: 'line', shadow: false });
      ctx.cv.line(x + H.rx + 3, ty - 1, x + H.rx + 4, ty + 8, (X, Y) => ctx.cv.px(X, Y, ctx.c('trim')));
    },
    torso(ctx) { if (!lying(ctx)) { K.skirt(ctx, { ramp: 'top', kind: 'strips', len: 34, n: 6 }); K.pauldrons(ctx, { ramp: 'top', style: 'plate', size: 4 }); K.bandolier(ctx, { ramp: 'trim', dir: 1, studs: null }); K.collar(ctx, { ramp: 'top', style: 'high', size: 0.8 }); } },
    front(ctx) { K.bracers(ctx, { ramp: 'trim', from: 0.22, to: 0.48, wide: 1.8 }); },
  },
  // the copy: the negative of a boxer. A black figure drawn in white outline, the Void's own copy of the Hollow costume, with stars in him
  echoShard: {
    swap: {
      A: { outline: [29, 30, 31], ...skin([[9, 9, 14], [4, 4, 8], [2, 2, 4], [1, 1, 2]]), ...hair([[31, 31, 31], [28, 28, 31], [18, 18, 26]]), ...G([[6, 6, 10], [2, 2, 5], [1, 1, 2]]) },
      B: { ...top([[28, 28, 31], [22, 22, 28], [12, 12, 19], [5, 5, 10]]), ...trim([[31, 31, 31], [26, 26, 30], [14, 14, 22]]), ...sh([[6, 6, 10], [2, 2, 5], [0, 0, 2]]), ...boot([[6, 6, 10], [2, 2, 5], [0, 0, 2]]) },
    },
    // (and shards of the mirror he was cut from, standing out behind his shoulders, and a torn half-cape)
    back(ctx) { if (!lying(ctx)) { K.spikes(ctx, { ramp: 'trim', n: 9, len: 17, spread: 1.1 }); K.cape(ctx, { ramp: 'top', inner: 'trim', len: 26, flare: 5, hem: 'tatter' }); } },
    torso(ctx) { if (!lying(ctx)) K.speckle(ctx, { color: 'tintHi', n: 26, region: 'torso', seed: 9 }); },
    front(ctx) { K.bracers(ctx, { ramp: 'top', from: 0.28, to: 0.55, wide: 1.2 }); },
  },
  // the gambler: a jester's cap with three bells, a harlequin chest, two-colour legs
  chaosShard: {
    swap: { A: { ...G([[31, 27, 12], [29, 19, 3], [17, 9, 1]]) }, B: { ...top([[31, 22, 28], [24, 8, 20], [13, 3, 11], [5, 1, 4]]), ...sh([[10, 29, 28], [3, 20, 21], [1, 10, 12]]), ...trim([[31, 31, 18], [30, 26, 5], [18, 13, 1]]), ...boot([[10, 29, 28], [3, 20, 21], [1, 10, 12]]) } },
    body: { size: [1.1, 1.0], shoulders: 1.15 },
    back(ctx) { if (!lying(ctx)) K.cape(ctx, { ramp: 'shorts', inner: 'top', len: 30, flare: 18, hem: 'scallop' }); },
    head(ctx, H) { K.jester(ctx, H, { ramps: ['top', 'shorts', 'top'], bell: 'trim', droop: 1.5 }); K.collar(ctx, { ramp: 'trim', style: 'ruff', size: 1.9 }); },
    torso(ctx) {
      if (lying(ctx)) return;
      const { cv, J, D, c } = ctx, ch = J.chest, tm = ctx.torsoMask;
      for (let Y = Math.round(ch[1] - 6); Y < J.waist[1] - 1; Y++) for (let X = Math.round(ch[0] - D.chestW); X <= ch[0] + D.chestW; X++) if (tm.in(X, Y) && (((X + 40) >> 2) + ((Y + 40) >> 2)) % 2 === 0) cv.px(X, Y, c((X + Y) % 3 === 0 ? 'shHi' : 'sh'));
    },
    front(ctx) { K.greaves(ctx, { ramp: 'shorts', knee: false, from: 0.1, to: 0.9 }); K.skirt(ctx, { ramp: 'trim', kind: 'strips', len: 12, n: 7 }); K.bracers(ctx, { ramp: 'top', from: 0.1, to: 0.6, wide: 3.4 }); },
  },
  // the clockmaker: a clock face turning behind his head, a brass-banded top hat, a burgundy tailcoat, gear shoulders
  timeShard: {
    swap: { A: { ...G([[31, 29, 15], [28, 22, 5], [16, 11, 2]]) }, B: { ...top([[20, 6, 10], [13, 2, 6], [7, 1, 3], [3, 0, 1]]), ...trim([[31, 28, 14], [27, 20, 5], [15, 10, 2]]), ...sh([[8, 3, 5], [4, 1, 2], [2, 0, 1]]), ...boot([[18, 6, 8], [9, 2, 4], [4, 1, 2]]) } },
    back(ctx) { if (!lying(ctx)) K.clockFace(ctx, { ramp: 'trim', face: 'shorts', r: 21, hands: 'trim' }); },
    head(ctx, H) { K.hat(ctx, H, { kind: 'top', ramp: 'top', band: 'trim', h: 14 }); },
    torso(ctx) { if (!lying(ctx)) { K.skirt(ctx, { ramp: 'top', kind: 'strips', len: 24, n: 4 }); K.pauldrons(ctx, { ramp: 'trim', style: 'plate', size: 2 }); } },
    front(ctx) { K.rings(ctx, { ramp: 'trim', where: 0.4 }); },
  },
  // the last: a black cloak lined in ember, swept bone horns, a crown of thorns, spiked bone pauldrons
  willShard: {
    swap: { A: { ...skin([[22, 20, 20], [15, 13, 13], [9, 8, 8], [4, 3, 3]]), ...G([[22, 20, 20], [12, 10, 10], [5, 4, 4]]) }, B: { ...top([[8, 6, 8], [3, 2, 4], [1, 1, 2], [0, 0, 1]]), ...trim([[30, 29, 26], [24, 22, 18], [12, 11, 9]]), ...sh([[8, 6, 8], [3, 2, 4], [1, 1, 2]]), ...boot([[10, 8, 10], [4, 3, 5], [1, 1, 2]]) } },
    back(ctx) { if (!lying(ctx)) K.cape(ctx, { ramp: 'top', inner: 'shorts', len: 40, flare: 12, hem: 'tatter', collar: true }); },
    head(ctx, H) { K.horns(ctx, H, { ramp: 'trim', len: 17, out: 10, y: 6, thick: 4 }); },
    torso(ctx) { if (!lying(ctx)) K.pauldrons(ctx, { ramp: 'trim', style: 'spiked', size: 3, tip: 'trim' }); },
    front(ctx) { K.bracers(ctx, { ramp: 'trim', from: 0.2, to: 0.52, wide: 2.2 }); },
  },
};
