// #30 Bolt Brennan — Storm Circuit. Lightning never strikes the same way twice.
// A flash of lightning and a crack of thunder come before every strike... but
// the strike can land anywhere from a fifth of a second to a full second after
// the flash. Don't punch on the flash, don't slip on the flash. Watch his
// SHOULDER: until he's really throwing, he stands crackling, gloves low. When
// the shoulder drops into the tell, you have the last few frames to react.
// Counters only work once the shoulder moves. Bolt From The Blue is his
// uppercut, a one-hit knockdown: slip it. Counter it on the glint and he's grounded.

export default {
  id: 'bolt',
  name: 'BOLT BRENNAN',
  short: 'BOLT',
  nickname: 'THE LIVE WIRE',
  circuit: 'storm',
  rank: 3,
  isChampion: false,
  card: {
    age: 25,
    weight: 149,
    record: '30-1 26KO',
    hometown: 'THE POWER STATION',
    quote: 'YOU\'LL SEE THE FLASH. YOU WON\'T SEE ME.',
  },
  lines: {
    win: 'ZAP! TEN THOUSAND VOLTS, NO CHARGE.',
    lose: 'SHORT... CIRCUIT...',
  },

  build: 'lean',
  palette: 'bolt',
  spriteLayers: 'bolt',

  stats: {
    health: 200,
    damageMult: 1.45,
    stunResistance: 3,
    heartDrainOnBlock: 3,
    starLossChance: 0.55,
    comboLimit: 2,
    stunComboLimit: 5,
    idleHitLimit: 0,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.22,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 10 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 10 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['crackle1', 'crackle2'], rate: 4 },
    victory: ['victory'],
  },

  // `bolt`: the flash comes first, the tell (windupFrames) only at the end
  moves: {
    zap: {
      name: 'ZAP',
      bolt: true,
      windupFrames: 10, activeFrames: 6, recoveryFrames: 22,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { tell: 'crackle', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    arc: {
      name: 'ARC',
      bolt: true,
      windupFrames: 12, activeFrames: 8, recoveryFrames: 26,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'crackle', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    ground: {
      name: 'GROUNDED',
      bolt: true,
      windupFrames: 12, activeFrames: 8, recoveryFrames: 24,
      damage: 15,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'crackle', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // forked lightning: a hook from each side
    fork1: {
      name: 'FORKED',
      bolt: true,
      windupFrames: 12, activeFrames: 8, recoveryFrames: 4,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [2, 9],
      starWindow: null,
      cancels: 1,
      sfx: { tell: 'crackle', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    fork2: {
      name: 'FORKED (2)',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 32,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // the one-hit knockdown
    blueBolt: {
      name: 'BOLT FROM THE BLUE',
      bolt: true,
      knockdown: true,
      windupFrames: 16, activeFrames: 8, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 13],
      starWindow: [2, 4],
      kdWindow: [8, 11],  // perfect hit (counted from the start of the real tell)
      noFake: true,
      sfx: { tell: 'crackle', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'heatLightning', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 44 }, { move: 'zap' }, { idle: 36 }, { move: 'arc' }, { idle: 36 }, { move: 'ground' },
        { idle: 36 }, { move: 'fork1' }, { move: 'fork2' }, { idle: 36 }, { move: 'blueBolt' }, { idle: 44 }, { taunt: 44 },
      ],
    },
    {
      id: 'sheetLightning', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'ground' }, { idle: 30 }, { move: 'zap' }, { idle: 24 }, { move: 'zap' },
        { idle: 30 }, { move: 'arc' }, { idle: 44 }, { taunt: 44 },
      ],
    },
    {
      id: 'strikeZone', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'arc' }, { idle: 20 }, { move: 'fork1' }, { move: 'fork2' }, { idle: 24 },
        { move: 'blueBolt' }, { idle: 26 }, { move: 'ground' }, { idle: 16 }, { move: 'zap' }, { idle: 30 }, { taunt: 36 },
      ],
    },
    {
      id: 'chainLightning', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 26 }, { move: 'zap' }, { idle: 14 }, { move: 'arc' }, { idle: 16 }, { move: 'ground' }, { idle: 16 },
        { move: 'zap' }, { idle: 20 }, { move: 'fork1' }, { move: 'fork2' }, { idle: 30 }, { taunt: 36 },
      ],
    },
    {
      id: 'overload', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 20 }, { move: 'blueBolt' }, { idle: 20 }, { move: 'fork1' }, { move: 'fork2' }, { idle: 16 },
        { move: 'arc' }, { idle: 14 }, { move: 'ground' }, { idle: 16 }, { move: 'blueBolt' }, { idle: 26 }, { taunt: 30 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'blueBolt', golden: 'windup', taunt: 40, shout: 'BLUE BOLT!', times: [1, 2] },

  getUpTable: [
    { upAt: [7, 9], health: 0.6 },
    { upAt: [8, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.25, health: 0.45 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'grounded', type: 'stunTrigger', name: 'GROUNDED',
      trigger: { state: 'windup', test: 'crackling', height: 'low', clean: 24 },
      effect: { stun: 90, hits: 7, say: 'GROUNDED!', sfx: 'zap' },
      hint: { kind: 'audio', text: 'WHILE HE CRACKLES, THE CHARGE IS ALL OVER HIM.' },
      scout: 'A BODY SHOT WHILE HE CRACKLES, BEFORE HIS SHOULDER DROPS, GROUNDS HIM: STUNNED FOR 7 HITS.',
    },
    {
      id: 'forkBreak', type: 'patternBreak', name: 'FORK IN THE ROAD',
      trigger: { state: 'windup', move: 'fork1', counter: true },
      effect: { cancelMoves: ['fork2'], stun: 80, hits: 6, say: 'THE FORK FIZZLES!', sfx: 'crackle' },
      hint: { kind: 'audio', text: 'THE FORK IS TWO HOOKS, ONE FROM EACH SIDE.' },
      scout: 'COUNTER THE FIRST HOOK OF THE FORK: NO SECOND HOOK, AND STUNNED FOR 6 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'staticDischarge', type: 'rushing', name: 'STATIC DISCHARGE', span: 150, count: 2, counter: ['arc'], say: 'STATIC DISCHARGE!',
      scout: 'PUNCH INTO HIM WHEN HE ISN\'T OPEN TWICE IN A ROW AND HE DISCHARGES AN ARC BACK AT YOU AT ONCE.',
    },
  ],
  scriptedMoments: [
    {
      id: 'lightningStorm', name: 'LIGHTNING STORM', when: { left: 60 }, say: 'THE STORM BREAKS!',
      steps: [{ idle: 20 }, { move: 'zap' }, { idle: 16 }, { move: 'zap' }, { idle: 16 }, { move: 'arc' }, { idle: 24 }, { move: 'blueBolt' }],
    },
  ],
  special: [{ type: 'lightning', delay: [12, 60], holdPose: 'crackle1', holdPose2: 'crackle2' }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'LIGHTNING FLASHES BEFORE HE STRIKES, BUT THE DELAY CHANGES. WATCH HIS SHOULDER, NOT THE SKY.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'COUNTER THE BLUE BOLT.', check: 'counterMove', move: 'blueBolt' } },
  music: 'boltWalkup', // his walk-up jingle (data/music/walkups.js)
};
