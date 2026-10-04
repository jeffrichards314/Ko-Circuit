// Builders for the Ascension's fighters (Phase B on): the ordinary punches every fighter shares
// (a jab, a hook, a body blow...) with the poses, defenses and windows the earlier fighters use,
// so a fighter's own file only says what makes him different. `W` is his ordinary tell for the
// circuit (the circuit's window, or a frame or two over for a heavy man); every window is
// anchored to it. Any field can be overridden with `o` (`sfx` merges).
//
//   mv('jab' | 'jabR' | 'hook' | 'hookL' | 'body' | 'bodyR' | 'upper' | 'haymaker' | 'sweep', W, o)
//   stats(o), anims(o), GETUP, standard get-up tables
//
// Which pose is which side: jabTell / jab is the LEFT jab, jabRTell / jabR the right; hookTell / hook
// is slipped LEFT (or ducked), hookLTell / hookL slipped RIGHT; bodyTell / body is slipped LEFT (or
// blocked), bodyRTell / bodyR slipped RIGHT; upperTell / upper and the overhead go either way.

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'];
const r = (n) => Math.max(2, Math.round(n));

const KINDS = {
  jab: (W) => ({ name: 'JAB', windupFrames: W, activeFrames: 6, recoveryFrames: 22, damage: 9, avoidBy: ALL4, counterWindow: [2, W - 1], starWindow: null,
    sfx: { tell: 'grunt', swing: 'whiff' }, animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] } }),
  jabR: (W) => ({ name: 'CROSS', windupFrames: W, activeFrames: 6, recoveryFrames: 22, damage: 10, avoidBy: ALL4, counterWindow: [2, W - 1], starWindow: [2, 3],
    sfx: { tell: 'grunt', swing: 'whiff' }, animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] } }),
  hook: (W) => ({ name: 'HOOK', windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 13, avoidBy: ['dodgeL', 'duck'], counterWindow: [3, W], starWindow: [3, 5],
    sfx: { tell: 'grunt', swing: 'swingHeavy' }, animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] } }),
  hookL: (W) => ({ name: 'LEFT HOOK', windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 13, avoidBy: ['dodgeR', 'duck'], counterWindow: [3, W], starWindow: [3, 5],
    sfx: { tell: 'grunt', swing: 'swingHeavy' }, animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] } }),
  body: (W) => ({ name: 'BODY BLOW', windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24, damage: 12, height: 'low', avoidBy: ['block', 'dodgeL'], counterWindow: [3, W], starWindow: null, punishStar: ['dodged'],
    sfx: { tell: 'grunt', swing: 'whiff' }, animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] } }),
  bodyR: (W) => ({ name: 'RIGHT BODY BLOW', windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24, damage: 12, height: 'low', avoidBy: ['block', 'dodgeR'], counterWindow: [3, W], starWindow: null, punishStar: ['dodged'],
    sfx: { tell: 'grunt', swing: 'whiff' }, animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] } }),
  upper: (W) => ({ name: 'UPPERCUT', windupFrames: W + 3, activeFrames: 8, recoveryFrames: 30, damage: 16, avoidBy: ['dodgeL', 'dodgeR'], counterWindow: [3, W + 1], starWindow: [3, 5], punishStar: ['dodged'],
    sfx: { tell: 'grunt', swing: 'swingHeavy' }, animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] } }),
  haymaker: () => ({ name: 'HAYMAKER', windupFrames: 14, activeFrames: 8, recoveryFrames: 36, damage: 20, avoidBy: ['dodgeL', 'dodgeR'], counterWindow: [4, 13], starWindow: [4, 7], punishStar: ['dodged'],
    sfx: { tell: 'grunt', swing: 'swingHeavy' }, animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] } }),
  sweep: (W) => ({ name: 'SWEEP', windupFrames: W + 4, activeFrames: 8, recoveryFrames: 40, damage: 15, avoidBy: ['duck'], counterWindow: [3, W + 2], starWindow: null, punishStar: ['ducked'],
    sfx: { tell: 'whoosh', swing: 'swingHeavy' }, animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] } }),
};

export function mv(kind, W, o = {}) {
  const base = KINDS[kind](W);
  const { sfx, animation, ...rest } = o;
  return { ...base, ...rest, sfx: { ...base.sfx, ...(sfx || {}) }, animation: animation ? { ...base.animation, ...animation } : base.animation };
}

// A super (a one-hit knockdown): the golden chance itself comes from the fighter's `super` block.
export function superMove(name, o = {}) {
  return {
    name, knockdown: true, noFake: true,
    windupFrames: 20, activeFrames: 10, recoveryFrames: 46, damage: 30,
    avoidBy: ['dodgeL', 'dodgeR'],
    counterWindow: [5, 17], starWindow: [5, 8], kdWindow: [10, 13], punishStar: ['dodged'],
    sfx: { tell: 'fanfare', swing: 'swingHeavy' },
    animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 8, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    ...o,
  };
}

export const stats = (o) => ({
  health: 300, damageMult: 1.9, stunResistance: 5, heartDrainOnBlock: 3, starLossChance: 0.55,
  comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  ...o,
});

export const anims = (o = {}) => ({
  idle: { frames: ['idle1', 'idle2'], rate: 18 },
  block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
  stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
  knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
  taunt: ['taunt'], victory: ['victory'],
  ...o,
});

export const GETUP = [
  { upAt: [9, 9], health: 0.5 },
  { upAt: [9, 9], health: 0.45 },
  { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
  { upAt: null },
];

// A pattern step list from a compact string: 'i26 jab i20 hook i40' (i = idle, t = taunt)
export const steps = (s) => s.trim().split(/\s+/).map((w) => (/^i\d+$/.test(w) ? { idle: +w.slice(1) } : /^t\d+$/.test(w) ? { taunt: +w.slice(1) } : { move: w }));

export { ALL4, r };
