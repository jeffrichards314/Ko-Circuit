// #49 Frenzy — Nightmare Circuit. Broke out of somewhere with the straitjacket
// buckles still hanging off him, and he has never once calmed down since.
// Every punch you land stokes him (the HEAT meter under the clock): each point
// of heat makes his windups, his recoveries and the gaps between his punches
// shorter. At full heat he's close to half again as fast. Leave him alone and he
// cools off a point every few seconds; knock him down and he loses half of it.
// So be patient. Don't pepper him: wait for the big openings (the star after a
// slipped uppercut, the gasping after his RABID rush, a Star Punch) and make
// every hit count.
//   left glove cocked     SNAP (anything works)
//   right hand wound      HOOK from your left: slip left or duck
//   left hand wound       HOOK from your right: slip right or duck
//   dipping low           BODY: block, or slip left
//   crouched, fist down   UPPERCUT: slip it, first punch back is a star
//   both fists up high    BERSERK, the one-hit knockdown: slip it, or counter
//                         it on the glint and he goes down (perfect hit)
//   RABID                 slip, slip right, slip left, then he's gasping: hit him

const rabid = (name, tell, act, avoid, windup, last) => ({
  name, windupFrames: windup, activeFrames: 5, recoveryFrames: last ? 20 : 3,
  damage: last ? 17 : 15,
  avoidBy: avoid,
  counterWindow: null, starWindow: null, noFake: true,
  sfx: { tell: 'grunt', swing: last ? 'swingHeavy' : 'whiff' },
  animation: { windup: [tell], active: [act], recovery: last ? [act, 'idle1'] : [act] },
});

export default {
  id: 'frenzy',
  name: 'FRENZY',
  short: 'FRENZY',
  nickname: 'THE LIVE WIRE',
  circuit: 'nightmare',
  rank: 1,
  isChampion: false,
  card: {
    age: 27,
    weight: 158,
    record: '39-6 39KO',
    hometown: 'WARD 9',
    quote: 'HIT ME! HIT ME AGAIN! HAHAHAHA!',
  },
  lines: {
    win: 'AGAIN! AGAIN! GET UP AND DO IT AGAIN!',
    lose: 'SO... QUIET... NOW...',
  },

  build: 'lean',
  palette: 'frenzy',
  spriteLayers: 'frenzy',

  stats: {
    health: 250,
    damageMult: 1.7,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.6,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 6 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 10 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['cackle1', 'cackle2'], rate: 5 },
    victory: ['victory'],
    winded: { frames: ['winded1', 'winded2'], rate: 10 },
  },

  moves: {
    fJab: {
      name: 'SNAP',
      windupFrames: 6, activeFrames: 5, recoveryFrames: 22,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 4],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    fHook: {
      name: 'LIVE WIRE',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'snort', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    fHookL: {
      name: 'LIVE WIRE',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'snort', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    fBody: {
      name: 'GUT CHECK',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 24,
      damage: 15,
      height: 'low',
      avoidBy: ['block', 'dodgeL'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    fUpper: {
      name: 'UNHINGED',
      windupFrames: 8, activeFrames: 7, recoveryFrames: 36,
      damage: 19,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 6],
      starWindow: [2, 4],
      punishStar: ['dodged'],
      sfx: { tell: 'shriek', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    // one-hit knockdown
    berserk: {
      name: 'BERSERK',
      knockdown: true,
      windupFrames: 16, activeFrames: 10, recoveryFrames: 46,
      damage: 29,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 13],
      starWindow: [3, 5],
      kdWindow: [8, 11],
      noFake: true,
      sfx: { tell: 'roar', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 4, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    rab1: rabid('RABID', 'jabTell', 'jab', ['dodgeL', 'dodgeR'], 8),
    rab2: rabid('RABID (2)', 'hookLTell', 'hookL', ['dodgeR'], 7),
    rab3: rabid('RABID (3)', 'hookTell', 'hook', ['dodgeL'], 7, true),
  },

  patterns: [
    {
      id: 'stalk', weight: 3,
      steps: [
        { idle: 28 }, { move: 'fJab' }, { idle: 24 }, { move: 'fHook' }, { idle: 24 }, { move: 'fBody' },
        { idle: 24 }, { move: 'fHookL' }, { idle: 24 }, { move: 'fUpper' }, { idle: 28 }, { taunt: 30 },
      ],
    },
    {
      id: 'rabid', weight: 2, fixed: true,
      steps: [
        { idle: 26 }, { move: 'fJab' }, { idle: 20 }, { move: 'rab1' }, { move: 'rab2' }, { move: 'rab3' },
        { idle: 12 },
        { open: 50, anim: 'winded', star: [2, 16], interrupt: true, stunOnInterrupt: 30, sfxLoop: 'pant', sfxEvery: 14 },
        { idle: 20 },
      ],
    },
    {
      id: 'berserk', weight: 2,
      steps: [
        { idle: 26 }, { move: 'fHookL' }, { idle: 22 }, { move: 'berserk' }, { idle: 26 }, { move: 'fBody' },
        { idle: 24 }, { move: 'fJab' }, { idle: 28 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'berserk', golden: 'open', open: 'winded', window: [10, 13], taunt: 34, shout: 'BERSERK!', times: [1, 2] },

  getUpTable: [
    { upAt: [8, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  special: [{ type: 'frenzy', max: 8, minScale: 0.6, minWindup: 4, cool: 150, palette: 'frenzy.hot' }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  exploits: [
    {
      id: 'burnedOut', type: 'quirk', name: 'BURNED OUT',
      trigger: { on: 'resolved', move: 'berserk', result: 'dodged' },
      effect: { open: { frames: 90, anim: 'winded', comboLimit: 7, star: [0, 36] }, say: 'BURNED OUT!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'THE ROAR CRACKS AND DIES WHEN HE MISSES.' },
      scout: 'SLIP BERSERK: HE\'S BURNED OUT AND OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'crossedWires', type: 'patternBreak', name: 'CROSSED WIRES',
      trigger: { state: 'windup', move: 'fHookL', counter: true, height: 'high', frames: [3, 5] },
      effect: { cancel: 2, star: true, say: 'WIRES CROSSED!' },
      hint: { kind: 'trainer', text: 'HIS HOOK FROM YOUR RIGHT OFTEN LEADS INTO A BIG SHOT.' },
      scout: 'COUNTER HIS HOOK FROM YOUR RIGHT: HIS NEXT PUNCH IS CANCELLED AND YOU GET A STAR.',
    },
    {
      id: 'theCalm', type: 'bait', name: 'THE CALM', limit: 2,
      trigger: { on: 'passive', frames: 300 },
      effect: { script: [{ open: 64, anim: 'winded', id: 'calm', comboLimit: 3, star: [0, 20] }], say: 'HE\'S COMING DOWN!' },
      hint: { kind: 'quote', text: 'SO... QUIET...', hidden: true },
      scout: 'STAND STILL FOR 5 SECONDS AND HE STOPS TO CATCH HIS BREATH, OPEN FOR 3 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'kickedWhileDown', type: 'getUpMash', name: 'SMELLS WEAKNESS', response: 'harder', punches: 3, mult: 1.25, say: 'HE SMELLS WEAKNESS!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 25% HARDER.',
    },
  ],
  scriptedMoments: [
    {
      id: 'feverPitch', name: 'FEVER PITCH', when: { left: 60 }, say: 'FEVER PITCH!',
      steps: [{ idle: 18 }, { move: 'fJab' }, { idle: 10 }, { move: 'fHook' }, { idle: 10 }, { move: 'fHookL' }, { idle: 10 }, { move: 'fUpper' }],
    },
  ],
  gallery: 'EVERY PUNCH YOU LAND MAKES HIM FASTER. THE PATIENT WIN THIS ONE.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'WIN LANDING 60 PUNCHES OR FEWER.', check: 'maxLanded', n: 60 } },
  music: 'frenzyWalkup', // his walk-up jingle (data/music/walkups.js)
};
