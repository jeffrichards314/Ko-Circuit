// How each opponent goes down. Every fighter has a knockdown STYLE: the poses he falls in (anims.knockdown: hit, falling, landing), the one he lies in
// while the count runs (anims.down, two frames: he breathes / twitches) and the one he gets up through (anims.getup). The poses are in the shared
// library (data/sprites/builds/poses.js); a `lie*` pose is laid on the floor when it is drawn (src/engine/figure.js turnSprite).
//   plank    flat out on his back, arms at his sides         flung    one arm thrown back over his head, a leg bent, head to the right
//   sprawl   spread-eagled, arms flung back past his head     timber   fell as he stood, guard still up
//   daze     sat down hard, legs out, head lolling            slump    sat down, chin on his chest, gloves in his lap
//   prop     propped back on his gloves, head on one shoulder fold     on both knees, folded over, head hanging
//   knee     one knee down, one glove holding him up
const GETUP_LIE = { frames: ['propUp', 'getup'], rate: 14 };
const GETUP_SIT = { frames: ['propUp', 'getup'], rate: 12 };
const GETUP_KNEEL = { frames: ['beatKneel1', 'getup'], rate: 14 };

export const KD_STYLES = {
  plank: { knockdown: ['kd1', 'kd2', 'lieA3'], down: { frames: ['lieA', 'lieA2'], rate: 36 }, getup: GETUP_LIE },
  flung: { knockdown: ['kd1', 'kd2', 'lieB3'], down: { frames: ['lieB', 'lieB2'], rate: 36 }, getup: GETUP_LIE },
  sprawl: { knockdown: ['kd1', 'kd2', 'lieC3'], down: { frames: ['lieC', 'lieC2'], rate: 36 }, getup: GETUP_LIE },
  timber: { knockdown: ['kd1', 'kd2', 'lieT3'], down: { frames: ['lieT', 'lieT2'], rate: 36 }, getup: GETUP_LIE },
  daze: { knockdown: ['kd1', 'kd2', 'sitA3'], down: { frames: ['sitA', 'sitA2'], rate: 30 }, getup: GETUP_SIT },
  slump: { knockdown: ['kd1', 'kd2', 'sitB3'], down: { frames: ['sitB', 'sitB2'], rate: 30 }, getup: GETUP_SIT },
  prop: { knockdown: ['kd1', 'kd2', 'sitC3'], down: { frames: ['sitC', 'sitC2'], rate: 30 }, getup: GETUP_SIT },
  fold: { knockdown: ['kd1', 'kneelB', 'kneelA3'], down: { frames: ['kneelA', 'kneelA2'], rate: 30 }, getup: GETUP_KNEEL },
  knee: { knockdown: ['kd1', 'kd2', 'kneelB3'], down: { frames: ['kneelB', 'kneelB2'], rate: 30 }, getup: GETUP_KNEEL },
};

// Which styles suit which build (a giant does not curl up; a lean fighter folds), cycled through each circuit so neighbours differ.
const POOL = {
  heavy: ['plank', 'daze', 'timber', 'prop', 'flung', 'slump'],
  giant: ['plank', 'timber', 'daze', 'prop', 'plank', 'timber'],
  medium: ['flung', 'daze', 'sprawl', 'knee', 'plank', 'prop', 'slump', 'fold'],
  lean: ['sprawl', 'fold', 'flung', 'knee', 'slump', 'prop', 'daze', 'plank'],
};
// By hand: the ones whose fall is part of who they are.
export const KD_OWN = {
  origin: 'plank', originTrue: 'plank', barney: 'daze', kid: 'sprawl', monk: 'slump', goliath: 'timber', jax: 'plank', zero: 'plank', zeroTrue: 'plank', halcyon: 'prop', vorgath: 'timber',
  dash1: 'knee', dash2: 'knee', dash3: 'knee', dash4: 'knee', dash5: 'knee', dash6: 'knee', dash7: 'knee', dash8: 'knee', dash9: 'knee',
};

// id -> style name, for every fighter in a circuit (build = 'medium' | 'lean' | 'heavy' | 'giant' of his sprite layers)
export function assignStyles(circuits, buildOf) {
  const out = {};
  let n = 0;
  for (const C of Object.values(circuits)) {
    n++;
    (C.fighters || []).forEach((id, i) => {
      const pool = POOL[buildOf(id)] || POOL.medium;
      let k = (n * 3 + i) % pool.length;
      // (never the same fall as the one before him in the hall)
      const prev = (C.fighters || [])[i - 1];
      if (prev && out[prev] === pool[k]) k = (k + 1) % pool.length;
      out[id] = KD_OWN[id] || pool[k];
    });
  }
  return out;
}

export function withKnockdown(d, style) {
  const S = KD_STYLES[style];
  if (!S || !d.anims) return d;
  return { ...d, knockdownStyle: style, anims: { ...d.anims, knockdown: S.knockdown, down: S.down, getup: S.getup } };
}
