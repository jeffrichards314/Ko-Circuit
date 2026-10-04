// #59 "Iron" Tom Hadley — Pantheon III, the Hall of Heroes. An 1890s bare-knuckle
// brawler, in sepia. He stands upright with his fists up in front of him and he NEVER
// dodges (he never learned how): every punch that lands on him lands. What he has
// instead is speed: little fast jabs, one after another, chipping you down, and a
// haymaker when he's had enough.
// His super is the IRON FIST: he steps back, rolls his shoulders, then throws everything
// into one punch, a knockdown: slip it, and hit him on the glint as he recovers.
// Pantheon III difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

const W = 6;

export default {
  id: 'tom',
  name: '"IRON" TOM HADLEY',
  short: 'TOM',
  nickname: 'BARE KNUCKLES',
  circuit: 'p3',
  rank: 4,
  isChampion: false,
  card: { age: 34, weight: 168, record: '112-9 96KO', hometown: 'THE OLD DOCKS, 1893', quote: 'GLOVES ARE FOR MEN WHO EXPECT TO LOSE.' },
  lines: { win: 'THAT\'S HOW IT WAS DONE.', lose: 'NOT... IN MY DAY...' },

  build: 'medium',
  palette: 'tom',
  spriteLayers: 'tom',

  stats: {
    health: 300, damageMult: 1.85, stunResistance: 4, heartDrainOnBlock: 3, starLossChance: 0.55,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['stand1', 'stand2'], rate: 14 },
    block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
    taunt: ['squareUp'], victory: ['victory'],
    roll: { frames: ['squareUp', 'stand1'], rate: 12 },
  },

  moves: {
    jab: {
      name: 'STRAIGHT LEFT',
      windupFrames: W, activeFrames: 5, recoveryFrames: 20, damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1], starWindow: null,
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    cross: {
      name: 'RIGHT CROSS',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 22, damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [2, W], starWindow: [2, 4],
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    hook: {
      name: 'DOCKSIDE HOOK',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 14,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [3, W + 1], starWindow: [3, 5],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    bodyBlow: {
      name: 'KIDNEY PUNCH', height: 'low',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24, damage: 12,
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [3, W - 1], starWindow: null, punishStar: ['dodged'],
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    haymaker: {
      name: 'HAYMAKER',
      windupFrames: 13, activeFrames: 8, recoveryFrames: 34, damage: 19,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 12], starWindow: [4, 7], punishStar: ['dodged'],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    ironFist: {
      name: 'IRON FIST', knockdown: true, noFake: true,
      windupFrames: 19, activeFrames: 10, recoveryFrames: 48, damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 16], starWindow: [4, 7], punishStar: ['dodged'],
      sfx: { tell: 'crash', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 8, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    { id: 'chip', weight: 3, when: { rounds: [1] }, steps: [
      { idle: 28 }, { move: 'jab' }, { idle: 16 }, { move: 'jab' }, { idle: 16 }, { move: 'cross' }, { idle: 30 },
      { move: 'hook' }, { idle: 24 }, { move: 'bodyBlow' }, { idle: 30 }, { move: 'jab' }, { idle: 16 }, { move: 'cross' }, { idle: 46 } ] },
    { id: 'rush', weight: 3, steps: [
      { idle: 24 }, { move: 'jab' }, { idle: 14 }, { move: 'jab' }, { idle: 14 }, { move: 'jab' }, { idle: 30 },
      { move: 'bodyBlow' }, { idle: 22 }, { move: 'hook' }, { idle: 26 }, { move: 'cross' }, { idle: 16 }, { move: 'jab' }, { idle: 44 } ] },
    { id: 'wallop', weight: 2, when: { rounds: [2, 3] }, steps: [
      { idle: 26 }, { move: 'cross' }, { idle: 16 }, { move: 'jab' }, { idle: 20 }, { move: 'haymaker' }, { idle: 36 },
      { move: 'bodyBlow' }, { idle: 20 }, { move: 'jab' }, { idle: 14 }, { move: 'hook' }, { idle: 40 } ] },
  ],

  super: { hit: 'head', move: 'ironFist', golden: 'recovery', window: [16, 20], taunt: 44, shout: 'IRON FIST!', times: [1, 2] },

  getUpTable: [ { upAt: [9, 9], health: 0.5 }, { upAt: [9, 9], health: 0.45 }, { upAt: [9, 9], stayDown: 0.3, health: 0.4 }, { upAt: null } ],


  exploits: [
    {
      id: 'brokenKnuckle', type: 'stunTrigger', name: 'BROKEN KNUCKLE',
      trigger: { state: 'windup', move: 'haymaker', counter: true, frames: [8, 12] },
      effect: { stun: 104, hits: 7, star: true, say: 'A BROKEN KNUCKLE!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'HIS KNUCKLES CRACK AS HE WINDS UP THE HAYMAKER.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE HAYMAKER\'S WINDUP: A BROKEN KNUCKLE, STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'showingOff', type: 'bait', name: 'SHOWING OFF', limit: 2,
      trigger: { on: 'passive', frames: 240 },
      effect: { script: [{ open: 58, anim: 'roll', id: 'roll', comboLimit: 4, star: [0, 26] }], say: 'HE ROLLS HIS SHOULDERS!' },
      hint: { kind: 'quote', text: 'GLOVES ARE FOR MEN WHO EXPECT TO LOSE.', hidden: true },
      scout: 'STAND STILL FOR 4 SECONDS AND HE STOPS TO ROLL HIS SHOULDERS: OPEN FOR 4 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'oldSchool', type: 'jabSpam', name: 'OLD SCHOOL', streak: 4, counter: ['hook'], say: 'OLD SCHOOL!',
      scout: 'KEEP JABBING AND HE CATCHES THE 4TH AND ANSWERS WITH A DOCKSIDE HOOK: SLIP LEFT OR DUCK.',
    },
  ],
  scriptedMoments: [
    { id: 'bellRings', name: 'THE BELL RINGS', when: { left: 60 }, say: 'THE BELL RINGS!', steps: [{ idle: 16 }, { move: 'jab' }, { idle: 14 }, { move: 'jab' }, { idle: 14 }, { move: 'jab' }, { idle: 14 }, { move: 'cross' }] },
  ],
  special: [{ type: 'era', look: 'sepia', label: '1890S', color: [28, 22, 12] }],
  titleDefense: null,
  gallery: 'A BARE-KNUCKLE BRAWLER FROM THE 1890S. UPRIGHT, FAST, AND HE NEVER DODGES.',
  medals: { signature: { text: 'BREAK HIS KNUCKLE TWICE.', check: 'cueCount', cue: '!exploit:brokenKnuckle', n: 2 } },
  music: 'tomWalkup',
};
