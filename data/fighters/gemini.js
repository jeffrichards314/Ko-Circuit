// #15 The Gemini Twins — Major Circuit. Two brothers, one fight.
// Between rounds they tag out, and which one comes out for the next round is
// random (it can be the same one again). The crimson one is CASTOR: power,
// hooks from both sides, a body shot, the Twin Turbine uppercut. The cobalt one
// is POLLUX: fast jabs, a feint, and the Double Take (a fake, then the real
// uppercut straight after). Same frames, different palette, different patterns:
// read the colour and you know the plan. Health carries over (they share a card).
// Perfect hits: Castor's Twin Turbine, and Pollux's real Double Take uppercut.

export default {
  id: 'gemini',
  name: 'THE GEMINI TWINS',
  short: 'GEMINI',
  nickname: 'DOUBLE TROUBLE',
  circuit: 'major',
  rank: 1,
  isChampion: false,
  card: {
    age: 26,
    weight: 175,
    record: '33-4 19KO',
    hometown: 'THE SAME HOSPITAL',
    quote: 'YOU BEAT ONE OF US? GREAT. NOW BEAT THE OTHER ONE.',
  },
  lines: {
    win: 'CASTOR SAYS HI. POLLUX SAYS BYE.',
    lose: 'IT WAS HIS FAULT. NO, HIS.',
  },

  build: 'medium',
  palette: 'gemini',
  spriteLayers: 'gemini',

  stats: {
    health: 170,
    damageMult: 1.2,
    stunResistance: 2,
    heartDrainOnBlock: 2,
    starLossChance: 0.4,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 52,
    hitstun: 13,
    betweenRoundHeal: 0.25,   // the fresh brother is a little fresher
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 20 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['twinSign'],
    victory: ['victory'],
  },

  moves: {
    // --- CASTOR (crimson) ---
    castorHook: {
      name: 'STAR HOOK',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 26,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [6, 17],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    castorHookL1: {
      name: 'MIRROR HOOKS',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 6,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [6, 17],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    castorHookR2: {
      name: 'MIRROR HOOKS (2)',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 30,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    castorBody: {
      name: 'GUT CHECK',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 26,
      damage: 13,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [6, 17],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    turbine: {
      name: 'TWIN TURBINE',
      windupFrames: 28, activeFrames: 8, recoveryFrames: 40,
      damage: 19,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [6, 25],
      starWindow: [10, 20],
      kdWindow: [21, 24],  // perfect hit
      sfx: { tell: 'whistle', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    // --- POLLUX (cobalt) ---
    polluxJab: {
      name: 'SPLIT JAB',
      windupFrames: 20, activeFrames: 6, recoveryFrames: 20,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [6, 17],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    polluxJab2: {
      name: 'SPLIT JAB (2)',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 22,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    polluxBody: {
      name: 'LOW ORBIT',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 24,
      damage: 12,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [6, 17],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    polluxFeint: {
      name: 'DOUBLE TAKE (FAKE)',
      feint: true,
      windupFrames: 20, activeFrames: 0, recoveryFrames: 4,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 19],
      starWindow: [4, 12],
      animation: { windup: ['upperLTell'], active: ['upperLTell'], recovery: ['idle1'] },
    },
    doubleTake: {
      name: 'DOUBLE TAKE',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 40,
      damage: 18,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [6, 17],
      starWindow: null,
      kdWindow: [14, 17],  // perfect hit on the REAL one
      sfx: { tell: 'whistle', swing: 'swingHeavy' },
      animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
    },
    polluxOverhead: {
      name: 'METEOR',
      windupFrames: 24, activeFrames: 10, recoveryFrames: 36,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [6, 21],
      starWindow: [8, 16],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  // `set` ties each pattern to one brother (the tagTeam modifier filters by it).
  patterns: [
    {
      id: 'castorPlan', set: 'castor', weight: 2,
      when: { health: [0.45, 1] },
      steps: [
        { idle: 50 }, { move: 'castorHook' }, { idle: 40 }, { move: 'castorBody' }, { idle: 36 },
        { move: 'castorHookL1' }, { move: 'castorHookR2' }, { idle: 40 }, { move: 'turbine' }, { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'castorPress', set: 'castor', weight: 1,
      when: { health: [0.45, 1] },
      steps: [
        { idle: 40 }, { move: 'castorHookL1' }, { move: 'castorHookR2' }, { idle: 24 }, { move: 'castorBody' },
        { idle: 20 }, { move: 'castorHook' }, { idle: 36 }, { move: 'turbine' }, { idle: 40 }, { taunt: 44 },
      ],
    },
    {
      id: 'castorLast', set: 'castor', weight: 1,
      when: { health: [0, 0.45] },
      steps: [
        { idle: 30 }, { move: 'turbine' }, { idle: 24 }, { move: 'castorHookL1' }, { move: 'castorHookR2' },
        { idle: 16 }, { move: 'castorBody' }, { idle: 24 }, { move: 'turbine' }, { idle: 36 }, { taunt: 36 },
      ],
    },
    {
      id: 'polluxPlan', set: 'pollux', weight: 2,
      when: { health: [0.45, 1] },
      steps: [
        { idle: 44 }, { move: 'polluxJab' }, { move: 'polluxJab2' }, { idle: 40 }, { move: 'polluxFeint' }, { move: 'doubleTake' },
        { idle: 40 }, { move: 'polluxBody' }, { idle: 36 }, { move: 'polluxOverhead' }, { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'polluxTricks', set: 'pollux', weight: 1,
      when: { health: [0.45, 1] },
      steps: [
        { idle: 36 }, { move: 'polluxFeint' }, { idle: 20 }, { move: 'polluxJab' }, { idle: 30 },
        { move: 'polluxFeint' }, { move: 'doubleTake' }, { idle: 30 }, { move: 'polluxBody' }, { idle: 16 },
        { move: 'polluxJab' }, { move: 'polluxJab2' }, { idle: 40 }, { taunt: 44 },
      ],
    },
    {
      id: 'polluxLast', set: 'pollux', weight: 1,
      when: { health: [0, 0.45] },
      steps: [
        { idle: 30 }, { move: 'polluxFeint' }, { move: 'doubleTake' }, { idle: 20 }, { move: 'polluxOverhead' },
        { idle: 20 }, { move: 'polluxJab' }, { move: 'polluxJab2' }, { idle: 16 }, { move: 'polluxBody' },
        { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', bySet: { castor: 'turbine', pollux: 'doubleTake' }, name: 'TURBINE OR THE DOUBLE TAKE', standIn: null, golden: 'windup', taunt: 44, shout: 'DOUBLE TROUBLE!', times: [1, 2] },

  getUpTable: [
    { upAt: [5, 7], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.35, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'coldBench', type: 'quirk', name: 'COLD OFF THE BENCH',
      trigger: { on: 'getUp' },
      effect: { tag: true, open: { frames: 80, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'HE TAGS IN COLD!', sfx: 'whistle' },
      hint: { kind: 'trainer', text: 'THE BROTHER ON THE BENCH ISN\'T WARMED UP.' },
      scout: 'KNOCK HIM DOWN AND THE OTHER TWIN TAGS IN COLD: OPEN FOR 5 HITS, THE FIRST ONE A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'comparingNotes', type: 'zoneBias', name: 'COMPARING NOTES', mode: 'round', share: 0.7, min: 6, say: 'HE KNOWS WHERE YOU\'RE AIMING!',
      scout: 'WORK ONE ZONE ALL ROUND AND THE NEXT TWIN COMES OUT GUARDING IT. MIX HEAD AND BODY.',
    },
  ],
  special: [{
    type: 'tagTeam',
    members: [
      { name: 'CASTOR', set: 'castor', palette: 'gemini', color: [31, 8, 8] },
      { name: 'POLLUX', set: 'pollux', palette: 'gemini.pollux', color: [10, 18, 31] },
    ],
  }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'TWIN BROTHERS, ONE BOXING LICENSE. THEY SWAP BETWEEN ROUNDS AND NEVER SAY WHICH ONE YOU\'RE FIGHTING.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'KNOCK THE TWINS DOWN 3 TIMES.', check: 'kdCount', n: 3 } },
  music: 'geminiWalkup', // his walk-up jingle (data/music/walkups.js)
};
