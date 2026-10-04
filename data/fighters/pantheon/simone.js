// #62 Sugarfoot Simone — Pantheon III, the Hall of Heroes. A 1970s disco dancer, all orange
// and mustard and brown. When she's had enough she COVERS UP on the ropes: a wall of
// gloves, and it looks like an opening. It isn't: punching it costs you extra hearts (the
// ropes are hers), and then she EXPLODES: four quick punches, each needing a different
// defense (slip right, block, duck, slip left). Leave her alone and she explodes anyway.
// The way to play it is to back off, take the four, and punish the spin that ends it.
// Her super is the SHOWSTOPPER: she struts, points at the ceiling, and it comes
// down on your head. A knockdown: slip it. Hit her while she's showing off and it's all over.
// Pantheon III difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

const W = 6;
const cover = { open: 72, anim: 'cover', id: 'cover', trap: true, limit: 3 };

export default {
  id: 'simone',
  name: 'SUGARFOOT SIMONE',
  short: 'SIMONE',
  nickname: 'THE DISCO QUEEN',
  circuit: 'p3',
  rank: 1,
  isChampion: false,
  card: { age: 30, weight: 141, record: '52-3 30KO', hometown: 'THE DISCO, 1977', quote: 'DON\'T STOP. DON\'T EVER STOP. THAT\'S THE WHOLE TRICK.' },
  lines: { win: 'BOOGIE OUT, HONEY.', lose: 'THE MUSIC... STOPPED...' },

  build: 'lean',
  palette: 'simone',
  spriteLayers: 'simone',

  stats: {
    health: 290, damageMult: 1.85, stunResistance: 3, heartDrainOnBlock: 3, starLossChance: 0.55,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 10 },
    block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
    taunt: ['boogie'], victory: ['victory'],
    cover: { frames: ['cover1', 'cover2'], rate: 12 },
  },

  moves: {
    jab: {
      name: 'HIP JAB',
      windupFrames: W, activeFrames: 5, recoveryFrames: 20, damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1], starWindow: null,
      sfx: { tell: 'snap', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    hook: {
      name: 'DISCO HOOK',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 13,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [3, W + 1], starWindow: [3, 5],
      sfx: { tell: 'whip', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    discoBody: {
      name: 'HUSTLE BLOW', height: 'low',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24, damage: 12,
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [3, W - 1], starWindow: null, punishStar: ['dodged'],
      sfx: { tell: 'snap', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    spin: {
      name: 'SPIN BACKFIST',
      windupFrames: 10, activeFrames: 8, recoveryFrames: 32, damage: 15,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 8], starWindow: [4, 6], punishStar: ['dodged'],
      sfx: { tell: 'spin', swing: 'swingHeavy' },
      animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'overheadRecover', 'idle1'] },
    },
    // the explosion: four in a row, a different defense for each
    burst1: {
      name: 'BURST: HOOK', noFake: true,
      windupFrames: W, activeFrames: 6, recoveryFrames: 11, damage: 10,
      avoidBy: ['dodgeR'], counterWindow: null, starWindow: null,
      sfx: { tell: 'snap', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    burst2: {
      name: 'BURST: JAB', noFake: true,
      windupFrames: W, activeFrames: 6, recoveryFrames: 11, damage: 10,
      avoidBy: ['block'], counterWindow: null, starWindow: null,
      sfx: { tell: 'snap', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jab'] },
    },
    burst3: {
      name: 'BURST: SWEEP', noFake: true,
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 11, damage: 11,
      avoidBy: ['duck'], counterWindow: null, starWindow: null,
      sfx: { tell: 'whoosh', swing: 'swingHeavy' },
      animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2'] },
    },
    burst4: {
      name: 'BURST: SPIN', noFake: true,
      windupFrames: W + 1, activeFrames: 8, recoveryFrames: 42, damage: 14,
      avoidBy: ['dodgeL'], counterWindow: null, starWindow: null, punishStar: ['dodged'],
      sfx: { tell: 'spin', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hook', 'winded1', 'idle1'] },
    },
    showstopper: {
      name: 'SHOWSTOPPER', knockdown: true, noFake: true,
      windupFrames: 20, activeFrames: 10, recoveryFrames: 46, damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 17], starWindow: [4, 7], punishStar: ['dodged'],
      sfx: { tell: 'fanfare', swing: 'swingHeavy' },
      animation: { windup: ['boogie'], active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    { id: 'hustle', weight: 3, when: { rounds: [1] }, steps: [
      { idle: 28 }, { move: 'jab' }, { idle: 18 }, { move: 'hook' }, { idle: 26 }, cover, { idle: 40 },
      { move: 'discoBody' }, { idle: 26 }, { move: 'spin' }, { idle: 44 }, { move: 'jab' }, { idle: 20 }, { move: 'hook' }, { idle: 50 } ] },
    { id: 'saturdayNight', weight: 3, steps: [
      { idle: 24 }, { move: 'discoBody' }, { idle: 20 }, { move: 'jab' }, { idle: 20 }, { move: 'jab' }, { idle: 28 },
      cover, { idle: 40 }, { move: 'spin' }, { idle: 26 }, { move: 'hook' }, { idle: 24 }, { move: 'discoBody' }, { idle: 48 } ] },
    { id: 'lastDance', weight: 2, when: { rounds: [2, 3] }, steps: [
      { idle: 24 }, { move: 'spin' }, { idle: 24 }, { move: 'hook' }, { idle: 22 }, { move: 'jab' }, { idle: 26 },
      cover, { idle: 36 }, { move: 'jab' }, { idle: 18 }, { move: 'discoBody' }, { idle: 22 }, cover, { idle: 46 } ] },
    { id: 'finale', weight: 1, script: 'finale', steps: [
      { idle: 22 }, { move: 'spin' }, { idle: 22 }, { move: 'hook' }, { idle: 20 }, { move: 'discoBody' }, { idle: 26 }, cover, { idle: 34 } ] },
  ],

  super: { hit: 'body', move: 'showstopper', golden: 'taunt', window: [16, 34], taunt: 52, shout: 'SHOWSTOPPER!', times: [1, 2] },

  getUpTable: [ { upAt: [9, 9], health: 0.5 }, { upAt: [9, 9], health: 0.45 }, { upAt: [9, 9], stayDown: 0.3, health: 0.4 }, { upAt: null } ],


  exploits: [
    {
      id: 'missedStep', type: 'stunTrigger', name: 'MISSED STEP',
      trigger: { state: 'windup', move: 'spin', counter: true, frames: [5, 9] },
      effect: { stun: 100, hits: 6, star: true, say: 'SHE MISSED A STEP!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'IN THE MIDDLE OF THE SPIN SHE HAS HER BACK TO YOU. NOT FOR LONG.' },
      scout: 'A COUNTER ON THE LAST FRAMES OF THE SPIN BACKFIST\'S WINDUP: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'outOfRhythm', type: 'quirk', name: 'OUT OF RHYTHM',
      trigger: { on: 'resolved', move: 'burst3', result: 'ducked' },
      effect: { open: { frames: 78, anim: 'stunned', comboLimit: 6, star: [0, 32] }, say: 'SHE LOSES THE BEAT!', sfx: 'tired' },
      hint: { kind: 'audio', text: 'THE THIRD PUNCH OF THE BURST FALLS OFF THE BEAT.', hidden: true },
      scout: 'DUCK THE THIRD PUNCH OF HER BURST: SHE LOSES THE BEAT AND IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'ownTheRopes', type: 'rushing', name: 'THE ROPES ARE HERS', span: 150, count: 2, counter: ['discoBody'], delay: 12, say: 'THE ROPES ARE HERS!',
      scout: 'PUNCH AT HER WHEN SHE ISN\'T OPEN, AGAIN AND AGAIN, AND SHE ANSWERS AT ONCE WITH A HUSTLE BLOW.',
    },
  ],
  scriptedMoments: [
    { id: 'lastDanceMoment', name: 'THE LAST DANCE', when: { health: 0.35 }, say: 'THE LAST DANCE!', patterns: 'finale', steps: [{ idle: 18 }] },
  ],
  special: [
    { type: 'rope', step: 'cover', drain: 2, burst: ['burst1', 'burst2', 'burst3', 'burst4'], sfx: 'fanfare' },
    { type: 'era', look: 'disco', label: '1970S', color: [31, 24, 8], dust: [31, 28, 12], dustDk: [22, 8, 4] },
  ],
  titleDefense: null,
  gallery: 'A DISCO DANCER FROM THE SEVENTIES. WHEN SHE COVERS UP, DON\'T PUNCH: SHE EXPLODES.',
  medals: { signature: { text: 'NEVER PUNCH HER GUARD: LEAVE THE COVER ALONE.', check: 'noCue', cue: '!ropeBait' } },
  music: 'simoneWalkup',
};
