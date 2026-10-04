// The player, seen from behind (about 32x56 standing). Uses the same figure
// composer as the opponents with a back-view build: arms mostly sit behind the
// body (they punch away from the camera), the head layer draws hair and ears.
// Palette swaps: player (default), playerPink (exhausted), playerGold (ZERO unlock).

const FEET = { knL: [-6, -12], knR: [6, -12], ftL: [-7, 0], ftR: [7, 0] };
const BENT = { knL: [-7, -11], knR: [7, -11], ftL: [-8, 0], ftR: [8, 0] };
const BACK = { L: 'back', R: 'back' };

const POSES = {
  idle1: {
    hip: [0, -23], waist: [0, -28], chest: [0, -37], neck: [0, -45],
    head: { at: [0, -50] },
    shL: [-10, -43], shR: [10, -43],
    elL: [-14, -33], elR: [14, -33],
    fiL: [-11, -46], fiR: [11, -46],
    ...FEET, armZ: BACK,
    gloveL: { view: 'back', angle: 8 }, gloveR: { view: 'back', angle: -8 },
  },
  idle2: { extends: 'idle1', shift: [0, 1], ...FEET, fiL: [-11, -45], fiR: [11, -45] },

  // jabs: L/R are the player's own hands (back view, so the same as the viewer's)
  jabL_high: {
    extends: 'idle1', shift: [-1, -1], ...FEET,
    shL: [-9, -45], elL: [-9, -58], fiL: [-4, -71],
    gloveL: { angle: 12, size: 0.9 },
    head: { at: [1, -50] },
  },
  jabR_high: {
    extends: 'idle1', shift: [1, -1], ...FEET,
    shR: [9, -45], elR: [9, -58], fiR: [4, -71],
    gloveR: { angle: -12, size: 0.9 },
    head: { at: [-1, -50] },
  },
  jabL_low: {
    extends: 'idle1', shift: [-1, 0], ...BENT,
    shL: [-9, -43], elL: [-10, -50], fiL: [-5, -58],
    gloveL: { angle: 20, size: 0.9 },
    head: { at: [1, -49] },
  },
  jabR_low: {
    extends: 'idle1', shift: [1, 0], ...BENT,
    shR: [9, -43], elR: [10, -50], fiR: [5, -58],
    gloveR: { angle: -20, size: 0.9 },
    head: { at: [-1, -49] },
  },

  // jab windups: the first two frames of a jab, the glove cocked back and the
  // shoulder turning into it (the punch still lands on PT.JAB_IMPACT)
  jabL_wind: {
    extends: 'idle1', shift: [-1, 0], ...FEET,
    shL: [-11, -42], elL: [-17, -36], fiL: [-15, -43],
    gloveL: { view: 'back', angle: -6, size: 1.05 },
    head: { at: [1, -50] },
  },
  jabR_wind: {
    extends: 'idle1', shift: [1, 0], ...FEET,
    shR: [11, -42], elR: [17, -36], fiR: [15, -43],
    gloveR: { view: 'back', angle: 6, size: 1.05 },
    head: { at: [-1, -50] },
  },

  dodgeL: {
    extends: 'idle1', shift: [-6, 3],
    knL: [-9, -10], knR: [5, -12], ftL: [-10, 0], ftR: [6, 0],
    hip: [-3, -21], head: { at: [-10, -44] }, neck: [-8, -40],
    shL: [-15, -37], shR: [4, -41], chest: [-4, -33],
    elL: [-19, -27], elR: [8, -30], fiL: [-17, -40], fiR: [2, -42],
  },
  dodgeR: {
    extends: 'idle1', shift: [6, 3],
    knR: [9, -10], knL: [-5, -12], ftR: [10, 0], ftL: [-6, 0],
    hip: [3, -21], head: { at: [10, -44] }, neck: [8, -40],
    shR: [15, -37], shL: [-4, -41], chest: [4, -33],
    elR: [19, -27], elL: [-8, -30], fiR: [17, -40], fiL: [-2, -42],
  },
  block: {
    extends: 'idle1', shift: [0, 1], ...FEET,
    elL: [-11, -34], elR: [11, -34],
    fiL: [-5, -51], fiR: [5, -51],
    gloveL: { angle: 4 }, gloveR: { angle: -4 },
  },
  duck: {
    extends: 'idle1', shift: [0, 9],
    knL: [-9, -9], knR: [9, -9], ftL: [-8, 0], ftR: [8, 0],
    hip: [0, -16], head: { at: [0, -38] },
    elL: [-14, -24], elR: [14, -24], fiL: [-8, -36], fiR: [8, -36],
  },
  starWind: {
    extends: 'idle1', shift: [1, 5], ...BENT,
    hip: [0, -19], head: { at: [-1, -45] },
    shR: [11, -38], elR: [15, -26], fiR: [10, -20], gloveR: { angle: 160 },
    fiL: [-9, -42],
  },
  star: {
    extends: 'idle1', shift: [1, -3],
    knL: [-6, -13], knR: [6, -13], ftL: [-6, 0], ftR: [7, -1],
    shR: [9, -48], elR: [7, -64], fiR: [3, -80], gloveR: { angle: -5, size: 1 },
    head: { at: [-2, -51] },
    armZ: { L: 'back', R: 'back' },
  },
  hit: {
    extends: 'idle1', shift: [0, 3], ...BENT,
    head: { at: [0, -46] },
    elL: [-17, -33], elR: [17, -33], fiL: [-17, -45], fiR: [17, -45],
    gloveL: { angle: -25 }, gloveR: { angle: 25 },
  },
  tired: {
    extends: 'idle1', shift: [0, 3], ...BENT,
    head: { at: [0, -45] },
    elL: [-13, -28], elR: [13, -28], fiL: [-9, -25], fiR: [9, -25],
    gloveL: { angle: 170 }, gloveR: { angle: -170 },
  },
  tired2: { extends: 'tired', shift: [0, 1], ...BENT },
  fall: {
    extends: 'hit', shift: [0, 8],
    knL: [-9, -8], knR: [9, -8], ftL: [-9, 0], ftR: [9, 0],
    head: { at: [2, -36] },
    elL: [-19, -26], elR: [19, -24], fiL: [-22, -34], fiR: [21, -30],
  },
  // lying on his back, head toward the camera
  down: {
    hip: [0, -32], waist: [0, -27], chest: [0, -19], neck: [0, -12],
    head: { at: [0, -7] },
    shL: [-10, -15], shR: [10, -15],
    elL: [-18, -9], elR: [18, -9], fiL: [-24, -4], fiR: [24, -4],
    knL: [-6, -38], knR: [6, -38], ftL: [-6, -44], ftR: [6, -44],
    gloveL: { view: 'back', angle: -80 }, gloveR: { view: 'back', angle: 80 },
    armZ: BACK, hipSpread: 3.5,
  },
  getup: {
    extends: 'idle1', shift: [0, 11],
    knL: [-7, -3], ftL: [-6, 0], knR: [7, -12], ftR: [8, 0],
    hip: [0, -15], head: { at: [0, -40] },
    elL: [-13, -20], elR: [13, -22], fiL: [-11, -12], fiR: [9, -14],
    gloveL: { angle: 180 }, gloveR: { angle: 170 },
  },
  victory: {
    extends: 'idle1', ...FEET,
    elL: [-16, -56], elR: [16, -56], fiL: [-12, -69], fiR: [12, -69],
    gloveL: { angle: 15 }, gloveR: { angle: -15 },
    armZ: { L: 'front', R: 'front' },
  },
};

export const playerBuild = {
  id: 'playerBack',
  canvas: { w: 72, h: 100, ax: 36, ay: 96 },
  scale: [1, 1],
  dims: {
    head: [5.6, 6.6],
    neck: 3.4,
    deltoid: 4,
    chestW: 10.5,
    waistW: 7.5,
    belly: 0,
    hipSpread: 4.2,
    upperArm: [3.6, 3],
    forearm: [3, 2.6],
    glove: [4.2, 5],
    thigh: [4, 3.2],
    shin: [3.1, 2.5],
    ankle: 3,
    boot: [3, 2],
    sockHeight: 0.3,
    shortsLen: 0.42,
  },
  poses: POSES,
};

export const playerLayers = {
  id: 'player',
  torsoMaterial: 'skin',
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'outline'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'white', 'skinHi'],
    shorts: ['trunksHi', 'trunks', 'trunksDk'],
    shirt: ['shirtHi', 'shirt', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    sock: ['white', 'white', 'skinHi'],
    boot: ['shoeHi', 'shoe', 'shoeDk'],
    band: ['white', 'white', 'trunksHi'],
    accent: ['accentHi', 'accent', 'accentDk'],
  },

  head(ctx, H) {
    const { cv, ramps } = ctx;
    const x = H.x, y = H.y;
    const ears = ctx.mask().ellipse(x - H.rx + 0.3, y + 1, 1.6, 2.2).ellipse(x + H.rx - 0.3, y + 1, 1.6, 2.2);
    cv.part(ears, { ramp: ramps.skin, bevel: 1 });
    const hm = ctx.mask().ellipse(x, y, H.rx, H.ry);
    cv.part(hm, { ramp: ramps.skin, bevel: 4 });
    (BACK_HAIR[ctx.layers.hairStyle] || BACK_HAIR.spiky)(ctx, x, y, H, hm);
    const P = ctx.layers.pieces || [];
    // amateur headgear: a padded crown and the strap round the back of the head
    if (P.includes('headgear')) {
      const hg = ctx.mask().ellipse(x, y - 2, H.rx + 0.8, H.ry - 1.5).cut(ctx.mask().rect(x - 10, y + 1, 20, 10));
      cv.part(hg, { ramp: ramps.accent, bevel: 2, inner: 'line' });
      cv.part(ctx.mask().rect(x - H.rx, y + 1, H.rx * 2, 2), { ramp: ramps.accent, bevel: 1, inner: 'line', shadow: false });
    }
    // a laurel: a thin gold band round the back of the head (the Pantheon)
    if (P.includes('laurel')) {
      cv.part(ctx.mask().rect(x - H.rx, y - 3, H.rx * 2, 2).clip(hm), { ramp: ramps.accent, bevel: 1, inner: 'line', shadow: false });
      for (const s of [-1, 1]) cv.px(x + s * (H.rx - 1), y - 4, ctx.c('accentHi'));
    }
    // ORIGIN's costume: a halo of light over the head (a ring of gold, with a white point at each side)
    if (P.includes('halo')) { for (let a = 0; a < 40; a++) { const q = (a / 40) * Math.PI * 2, X = Math.round(x + Math.cos(q) * (H.rx + 3)), Y = Math.round(y - H.ry + 3 + Math.sin(q) * 3); cv.px(X, Y, ctx.c(a % 10 === 0 ? 'accentHi' : 'accent')); } }
    // a hood, down, bunched behind the neck
    if (P.includes('hood')) cv.part(ctx.mask().ellipse(x, y + H.ry - 0.5, H.rx + 1, 3), { ramp: ramps.shirt, bevel: 2, inner: 'line' });
  },

  torso(ctx) {
    const { cv, J, D, ramps } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    // tank top: racer back leaves the shoulder blades and traps bare
    const tank = ctx.torsoMask.copy().clip(ctx.mask().poly([
      [n[0] - 3, n[1] + 1], [n[0] + 3, n[1] + 1],
      [ch[0] + D.chestW - 3, ch[1] - 2], [w[0] + D.waistW + 3, w[1] + 2],
      [w[0] - D.waistW - 3, w[1] + 2], [ch[0] - D.chestW + 3, ch[1] - 2],
    ]));
    cv.part(tank, { ramp: ramps.shirt, bevel: 3, inner: 'line' });
    ctx.tankMask = tank;
    // spine crease
    cv.line(n[0], n[1] + 3, w[0], w[1] - 1, (X, Y) => cv.shade(X, Y, -1));
    // shoulder-blade shading on the bare skin
    for (const s of [-1, 1]) {
      cv.shade(ch[0] + s * 7, ch[1] - 3, 1);
      cv.shade(ch[0] + s * 8, ch[1] - 2, 1);
    }
    // waistband + side stripes on the trunks
    const band = ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 2, D.waistW * 2 + 2, 2).clip(ctx.shortsMask);
    const P = ctx.layers.pieces || [];
    cv.part(band, { ramp: P.includes('trim') || P.includes('belt') ? ramps.accent : ramps.band, bevel: 1, inner: 'line', shadow: false });
    costumePieces(ctx, P);
  },
};

// Costume pieces (§16, data/costumes.js) drawn over the torso and trunks.
const COSTUME_PIECES = {
  nightgym: ['headgear'], roadwork: ['hood', 'stripes'], contender: ['piping', 'patch'], bigtop: ['striped'],
  worldbeater: ['trim', 'sheen'], stormchaser: ['bolt'], showdown: ['crest', 'trim'], voidwalker: ['piping', 'sheen'], undisputed: ['belt', 'trim'],
  ascendant: ['trim', 'sheen', 'laurel'], sunborn: ['crest', 'trim', 'laurel'], ashen: ['piping', 'patch'], emberforged: ['embers', 'piping'], hollow: ['hollow'], origin: ['belt', 'trim', 'sheen', 'laurel', 'halo'],
};
function costumePieces(ctx, P) {
  if (!P.length) return;
  const { cv, J, D, ramps, c, pose } = ctx;
  const w = J.waist, h = J.hip, sm = ctx.shortsMask;
  const px = (X, Y, k) => { if (sm.in(X, Y)) cv.px(X, Y, c(k)); };
  // side stripes / piping down both legs of the trunks
  if (P.includes('stripes') || P.includes('piping')) for (const s of [-1, 1]) {
    const x0 = Math.round(h[0] + s * (D.hipSpread + D.thigh[0] - 0.5));
    for (let Y = Math.round(w[1]); Y < h[1] + 8; Y++) { px(x0, Y, 'accent'); if (P.includes('stripes')) px(x0 - s, Y, 'accentHi'); }
  }
  // a sponsor patch on one leg
  if (P.includes('patch')) cv.part(ctx.mask().rect(Math.round(h[0] - D.hipSpread - 2), Math.round(h[1] + 1), 4, 3).clip(sm), { ramp: ramps.accent, bevel: 1, inner: 'line', shadow: false });
  // a satin sheen
  if (P.includes('sheen')) for (let Y = Math.round(w[1]); Y < h[1] + 6; Y += 2) { px(Math.round(h[0] - 2), Y, 'trunksHi'); px(Math.round(h[0] + 3), Y + 1, 'trunksHi'); }
  // a lightning bolt down the back of the trunks
  if (P.includes('bolt') && !pose.lying) { const bx = Math.round(h[0] + 3), by = Math.round(w[1] + 1); for (const [dx, dy] of [[1, 0], [0, 1], [-1, 2], [0, 2], [1, 2], [0, 3], [-1, 4], [-2, 5]]) px(bx + dx, by + dy, 'accentHi'); }
  // the crest: a little shield on the back of the waistband
  if (P.includes('crest')) cv.part(ctx.mask().poly([[w[0] - 3, w[1] - 1], [w[0] + 3, w[1] - 1], [w[0] + 3, w[1] + 2], [w[0], w[1] + 4], [w[0] - 3, w[1] + 2]]), { ramp: ramps.accent, bevel: 1, inner: 'line', shadow: false });
  // the championship belt: a wide gold strap and its plate at the back
  if (P.includes('belt')) {
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 4), { ramp: ['trunksHi', 'trunks', 'trunksDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(w[0], w[1] - 1, 4, 3), { ramp: ramps.accent, bevel: 2, inner: 'line', shadow: false });
  }
  // embers: scattered sparks on the trunks and a glowing seam down the spine (the Underworld)
  if (P.includes('embers')) {
    for (const [dx, dy] of [[-4, 1], [-1, 3], [3, 0], [4, 4], [-3, 6], [1, 7], [-5, 9], [2, 10]]) px(Math.round(h[0] + dx), Math.round(w[1] + dy), (dx + dy) & 1 ? 'accentHi' : 'accent');
    if (!pose.lying) for (let Y = Math.round(J.neck[1] + 4); Y < w[1] - 1; Y += 3) if (ctx.tankMask && ctx.tankMask.in(Math.round(J.neck[0]), Y)) cv.px(Math.round(J.neck[0]), Y, c('accent'));
  }
  // the hollow: a ring cut in the back of the trunks, rim burning white (the Void)
  if (P.includes('hollow')) {
    const cx = Math.round(w[0]), cy = Math.round(w[1] + 3);
    for (const [dx, dy] of [[-2, -1], [-1, -2], [0, -2], [1, -2], [2, -1], [2, 0], [2, 1], [1, 2], [0, 2], [-1, 2], [-2, 1], [-2, 0]]) px(cx + dx, cy + dy, 'accentHi');
    if (ctx.tankMask) { const nx = Math.round(J.neck[0]), ny = Math.round(J.neck[1] + 6); for (const [dx, dy] of [[-1, 0], [0, -1], [1, 0], [0, 1]]) if (ctx.tankMask.in(nx + dx, ny + dy)) cv.px(nx + dx, ny + dy, c('accentHi')); }
  }
  // a striped tank top (the big top)
  if (P.includes('striped')) {
    const n = J.neck, ch = J.chest;
    for (let Y = Math.round(n[1] + 3); Y < w[1]; Y += 3) for (let X = Math.round(ch[0] - D.chestW); X <= ch[0] + D.chestW; X++) if (ctx.tankMask && ctx.tankMask.in(X, Y)) cv.px(X, Y, c('accent'));
  }
}

// Hair styles seen from behind (customization §7). Each paints over the skull mask.
const BACK_HAIR = {
  spiky(ctx, x, y, H) {
    const hair = ctx.mask().ellipse(x, y - 1, H.rx + 0.4, H.ry - 0.2);
    hair.cut(ctx.mask().rect(x - 10, y + 4, 20, 10));
    hair.poly([[x - 5, y - 4], [x - 7, y - 9], [x - 2, y - 6]]);
    hair.poly([[x - 2, y - 6], [x - 1, y - 10], [x + 2, y - 6]]);
    hair.poly([[x + 1, y - 6], [x + 5, y - 9], [x + 4, y - 3]]);
    hair.poly([[x + 4, y - 3], [x + 8, y - 4], [x + 5, y + 1]]);
    hair.poly([[x - 4, y + 3], [x - 2, y + 6], [x, y + 3]]);
    hair.poly([[x, y + 3], [x + 2, y + 6], [x + 4, y + 3]]);
    ctx.cv.part(hair, { ramp: ctx.ramps.hair, bevel: 3, inner: 'line' });
    ctx.cv.shade(x - 2, y - 3, -1); ctx.cv.shade(x - 3, y - 2, -1); ctx.cv.shade(x + 1, y - 4, -1);
  },
  buzz(ctx, x, y, H, hm) {
    const hair = ctx.mask().ellipse(x, y - 0.6, H.rx + 0.1, H.ry - 0.3).cut(ctx.mask().rect(x - 10, y + 3, 20, 10)).clip(hm);
    ctx.cv.part(hair, { ramp: ctx.ramps.hair, bevel: 3, inner: 'soft', outline: false });
    for (let j = -7; j <= 3; j++) for (let i = -6; i <= 6; i++) if (hair.in(Math.round(x + i), Math.round(y + j)) && (i + j) % 2 === 0) ctx.cv.shade(x + i, y + j, -1);
  },
  afro(ctx, x, y, H) {
    const hair = ctx.mask().ellipse(x, y - 2.5, H.rx + 3.4, H.ry + 1.6);
    hair.cut(ctx.mask().rect(x - 12, y + 4, 24, 10));
    ctx.cv.part(hair, { ramp: ctx.ramps.hair, bevel: 5, inner: 'line' });
    for (const [i, j] of [[-5, -6], [-2, -8], [2, -7], [5, -5], [-6, -1], [6, 0], [-3, -3], [1, -3], [3, 1], [-1, 0]]) ctx.cv.shade(x + i, y + j, -1);
  },
  mohawk(ctx, x, y, H, hm) {
    for (let j = -6; j <= 3; j++) for (let i = -5; i <= 5; i++) if (hm.in(Math.round(x + i), Math.round(y + j)) && Math.abs(i) > 1 && (i + j) % 2 === 0) ctx.cv.shade(x + i, y + j, 1);
    const hair = ctx.mask().rect(x - 1.5, y - 7, 3, 12);
    hair.poly([[x - 1.5, y - 6], [x, y - 11], [x + 1.5, y - 6]]).poly([[x - 1.5, y - 2], [x - 1, y - 8], [x + 1.5, y - 2]]);
    ctx.cv.part(hair, { ramp: ctx.ramps.hair, bevel: 1, inner: 'line' });
  },
  ponytail(ctx, x, y, H) {
    const hair = ctx.mask().ellipse(x, y - 1, H.rx + 0.4, H.ry - 0.3).cut(ctx.mask().rect(x - 10, y + 3, 20, 10));
    ctx.cv.part(hair, { ramp: ctx.ramps.hair, bevel: 3, inner: 'line' });
    const tail = ctx.mask().capsule(x, y + 1, x + 0.5, y + 11, 1.8, 1.2);
    ctx.cv.part(tail, { ramp: ctx.ramps.hair, bevel: 1, inner: 'line' });
    ctx.cv.px(x - 1, y + 2, ctx.c('white')); ctx.cv.px(x, y + 2, ctx.c('white')); ctx.cv.px(x + 1, y + 2, ctx.c('white'));
    for (let j = -5; j <= 1; j += 2) ctx.cv.shade(x, y + j, 1);
  },
  slick(ctx, x, y, H) {
    const hair = ctx.mask().ellipse(x, y - 0.5, H.rx + 0.5, H.ry).cut(ctx.mask().rect(x - 10, y + 5, 20, 10));
    ctx.cv.part(hair, { ramp: ctx.ramps.hair, bevel: 4, inner: 'line' });
    for (const i of [-3, 0, 3]) ctx.cv.line(x + i, y - 6, x + i * 0.8, y + 3, (X, Y) => ctx.cv.shade(X, Y, 1));
    ctx.cv.shade(x - 2, y - 4, -1); ctx.cv.shade(x + 1, y - 5, -1);
  },
};

export const HAIR_STYLES = ['spiky', 'buzz', 'afro', 'mohawk', 'ponytail', 'slick'];
export const playerLayersFor = (hairStyle, costume = 'none') => ({ ...playerLayers, hairStyle, pieces: COSTUME_PIECES[costume] || [] });

export const PLAYER_ANIMS = {
  idle: ['idle1', 'idle2'],
  jabL_high: ['jabL_wind', 'jabL_high'], jabR_high: ['jabR_wind', 'jabR_high'],
  jabL_low: ['jabL_wind', 'jabL_low'], jabR_low: ['jabR_wind', 'jabR_low'],
  dodgeL: ['dodgeL'], dodgeR: ['dodgeR'],
  block: ['block'], duck: ['duck'],
  star: ['starWind', 'star'],
  hit: ['hit'], tired: ['tired', 'tired2'],
  knockdown: ['hit', 'fall', 'down'], getup: ['getup'],
  victory: ['victory'],
};
