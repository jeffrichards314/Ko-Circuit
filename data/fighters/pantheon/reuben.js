// #61 Rocksteady Reuben — Pantheon III, the Hall of Heroes. A 1950s slugger, in black and
// white with the grain of an old television. Big, slow, heavy, and he CLINCHES: his arms
// spread wide (a wide-open tell) and close round you, and a block can't stop a bear hug,
// only a slip or a duck can. Caught, you're held: no dodging, no punching, no blocking, and
// he squeezes you a little more every half second until you MASH A / B and break free
// (or he tires of it). Break clean and he's left wide open for it.
// His super is the SUNDAY PUNCH: a haymaker off the ropes, a knockdown: slip it. Counter it
// on the glint and it's the last punch of his career.
// Pantheon III difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

const W = 6;

export default {
  id: 'reuben',
  name: 'ROCKSTEADY REUBEN',
  short: 'REUBEN',
  nickname: 'THE SLAB',
  circuit: 'p3',
  rank: 2,
  isChampion: false,
  card: { age: 39, weight: 261, record: '61-2 58KO', hometown: 'THE TV SET, 1954', quote: 'STAY WHERE THE CAMERA CAN SEE YOU, KID.' },
  lines: { win: 'AND THE CROWD GOES WILD.', lose: 'TURN... THE SET... OFF...' },

  build: 'heavy',
  palette: 'reuben',
  altPalette: 'reuben.color', // (greys can't be hue-turned: a hand-made one, Phase F)
  spriteLayers: 'reuben',

  stats: {
    health: 320, damageMult: 1.9, stunResistance: 6, heartDrainOnBlock: 3, starLossChance: 0.6,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 46, hitstun: 12, betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 20 },
    block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
    taunt: ['taunt'], victory: ['victory'],
    hold: { frames: ['holding'], rate: 30 },
  },

  moves: {
    jab: {
      name: 'JACKHAMMER JAB',
      windupFrames: W, activeFrames: 5, recoveryFrames: 22, damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1], starWindow: null,
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    hook: {
      name: 'WRECKING HOOK',
      windupFrames: W + 3, activeFrames: 8, recoveryFrames: 28, damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [3, W + 2], starWindow: [3, 6],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    body: {
      name: 'BREADBASKET', height: 'low',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 14,
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [3, W], starWindow: null, punishStar: ['dodged'],
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    // the clinch: arms spread wide, then round you. A block doesn't stop it. Landed, it holds you.
    clinch: {
      name: 'BEAR HUG', clinch: true, noFake: true,
      windupFrames: 12, activeFrames: 8, recoveryFrames: 34, damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [3, 9], starWindow: [3, 6], punishStar: ['dodged', 'ducked'],
      sfx: { tell: 'roar', swing: 'crunch' },
      openAfter: { when: ['hit'], open: 156, anim: 'hold', id: 'hold', comboLimit: 0 },
      animation: { windup: ['hugTell'], active: ['hug'], recovery: ['hug', 'idle1'] },
    },
    sundayPunch: {
      name: 'SUNDAY PUNCH', knockdown: true, noFake: true,
      windupFrames: 22, activeFrames: 10, recoveryFrames: 48, damage: 32,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [5, 19], starWindow: [5, 8], kdWindow: [12, 15], punishStar: ['dodged'],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 9, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    { id: 'roundOne', weight: 3, when: { rounds: [1] }, steps: [
      { idle: 34 }, { move: 'jab' }, { idle: 26 }, { move: 'hook' }, { idle: 32 }, { move: 'clinch' }, { idle: 50 },
      { move: 'body' }, { idle: 28 }, { move: 'jab' }, { idle: 22 }, { move: 'hook' }, { idle: 54 } ] },
    { id: 'slugfest', weight: 3, steps: [
      { idle: 28 }, { move: 'body' }, { idle: 24 }, { move: 'hook' }, { idle: 30 }, { move: 'jab' }, { idle: 22 }, { move: 'jab' }, { idle: 44 },
      { move: 'clinch' }, { idle: 46 }, { move: 'hook' }, { idle: 30 }, { move: 'body' }, { idle: 50 } ] },
    { id: 'lateRounds', weight: 2, when: { rounds: [2, 3] }, steps: [
      { idle: 26 }, { move: 'clinch' }, { idle: 44 }, { move: 'hook' }, { idle: 24 }, { move: 'hook' }, { idle: 30 },
      { move: 'jab' }, { idle: 20 }, { move: 'body' }, { idle: 40 }, { move: 'clinch' }, { idle: 50 } ] },
  ],

  super: { hit: 'body', move: 'sundayPunch', golden: 'windup', window: [12, 15], taunt: 50, shout: 'SUNDAY PUNCH!', times: [1, 2] },

  getUpTable: [ { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], health: 0.5 }, { upAt: [9, 9], stayDown: 0.3, health: 0.45 }, { upAt: null } ],


  exploits: [
    {
      id: 'cheapGrab', type: 'stunTrigger', name: 'CHEAP GRAB',
      trigger: { state: 'windup', move: 'clinch', counter: true, frames: [4, 9] },
      effect: { stun: 112, hits: 7, star: true, say: 'YOU STUFFED THE GRAB!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'WITH BOTH ARMS SPREAD WIDE, HIS CHIN IS UNDEFENDED.' },
      scout: 'A COUNTER ON THE CLINCH\'S WINDUP (ARMS SPREAD WIDE): STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'ropeADope', type: 'quirk', name: 'GRABBED THE AIR',
      trigger: { on: 'resolved', move: 'clinch', result: 'ducked' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 7, star: [0, 34] }, say: 'HE GRABBED THE AIR!', sfx: 'pant' },
      hint: { kind: 'visual', text: 'DUCK UNDER HIS ARMS AND HE HAS NOTHING TO HOLD.', hidden: true },
      scout: 'DUCK THE BEAR HUG: HE GRABS THE AIR AND IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'bearHugsTurtles', type: 'turtling', name: 'BEAR HUGS TURTLES', response: 'move', move: 'clinch', share: 0.4, span: 480, cooldown: 600, say: 'NOTHING STOPS A HUG!',
      scout: 'KEEP YOUR GUARD UP TOO LONG AND HE THROWS A BEAR HUG: A BLOCK CAN\'T STOP IT, ONLY A SLIP OR A DUCK.',
    },
  ],
  scriptedMoments: [
    { id: 'lateInTheFight', name: 'LATE IN THE FIGHT', when: { health: 0.4 }, say: 'LATE IN THE FIGHT!', steps: [{ idle: 20 }, { move: 'clinch' }, { idle: 46 }, { move: 'hook' }] },
  ],
  special: [
    { type: 'clinch', timeout: 140, every: 26, damage: 4, heart: 1, letGo: { open: 58, anim: 'stunned', comboLimit: 5, star: [0, 26] } },
    { type: 'era', look: 'tv', label: '1950S', color: [26, 26, 26], dust: [28, 28, 28], dustDk: [4, 4, 4] },
  ],
  titleDefense: null,
  gallery: 'A SLUGGER FROM THE ERA OF BLACK-AND-WHITE TELEVISION. HE CLINCHES: MASH TO BREAK FREE.',
  medals: { signature: { text: 'BREAK FREE OF HIS CLINCH TWICE.', check: 'cueCount', cue: '!clinchBreak', n: 2 } },
  music: 'reubenWalkup',
};
