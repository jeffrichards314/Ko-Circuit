// #26 Lumberjack Lars — World Circuit. "TIMBERRRR!"
// When he throws both arms up and bellows TIMBER, three chops follow, and each
// needs a DIFFERENT defense:
//   1. the CHOP: his right glove cocked out on your right. Slip LEFT, away from it.
//   2. the LOW CHOP: his other glove drops to your belly. BLOCK it.
//   3. the FELLING SWING: a huge flat swing at head height. DUCK it.
// It flows: slip, tap DOWN to cover as you come back, then DOWN again to duck.
// Counter the TIMBER call itself and the chain never comes (a star if you're
// early; hit it on the glint and HE comes down). The Splitting Maul is a
// one-hit knockdown overhead: slip it. At this level some tells are FAKES: the
// same windup, cut short. They never hurt you, so defend them anyway.

export default {
  id: 'lars',
  name: 'LUMBERJACK LARS',
  short: 'LARS',
  nickname: 'THE TALL TIMBER',
  circuit: 'world',
  rank: 3,
  isChampion: false,
  card: {
    age: 38,
    weight: 271,
    record: '33-6 28KO',
    hometown: 'THE NORTH WOODS',
    quote: 'I FELL TREES TALLER THAN YOU BEFORE BREAKFAST.',
  },
  lines: {
    win: 'TIMBER! HA! STACK HIM WITH THE REST OF THE LOGS!',
    lose: 'I... AM... FELLED...',
  },

  build: 'heavy',
  palette: 'lars',
  spriteLayers: 'lars',

  stats: {
    health: 220,
    damageMult: 1.4,
    stunResistance: 5,
    heartDrainOnBlock: 2,
    starLossChance: 0.5,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 48,
    hitstun: 13,
    betweenRoundHeal: 0.22,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 28 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 18 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['spitGloves1', 'spitGloves2'], rate: 14 },
    victory: ['flex'],
  },

  moves: {
    axeHandle: {
      name: 'AXE HANDLE',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 22,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 9],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    logRoll: {
      name: 'LOG ROLL',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 24,
      damage: 15,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [3, 11],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    branch: {
      name: 'BRANCH HOOK',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 26,
      damage: 16,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [3, 11],
      starWindow: null,
      sfx: { tell: 'creakBig', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    // TIMBER! The call is his perfect-hit moment. Counter it and the chain is off.
    timberCall: {
      name: 'TIMBER!',
      feint: true, call: true,
      windupFrames: 24, activeFrames: 0, recoveryFrames: 4,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 21],
      starWindow: [3, 6],
      kdWindow: [14, 17],
      cancels: 3,
      sfx: { tell: 'timber' },
      animation: { windup: ['timberCall1', 'timberCall2'], windupRate: 6, active: ['timberCall2'], recovery: ['timberCall2'] },
    },
    timber1: {
      name: 'CHOP',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 4,
      damage: 16,
      avoidBy: ['dodgeL'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { tell: 'chop', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hook'] },
    },
    timber2: {
      name: 'LOW CHOP',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 4,
      damage: 16,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { tell: 'chop', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyR'] },
    },
    timber3: {
      name: 'FELLING SWING',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 44,
      damage: 20,
      avoidBy: ['duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      punishStar: ['ducked'],
      sfx: { tell: 'creakBig', swing: 'swingHeavy' },
      animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'overheadRecover', 'idle1'] },
    },
    // one-hit knockdown: both gloves overhead like a splitting maul
    maul: {
      name: 'SPLITTING MAUL',
      knockdown: true,
      windupFrames: 22, activeFrames: 10, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 18],
      starWindow: null,
      noFake: true,
      sfx: { tell: 'creakBig', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'dawnShift', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'axeHandle' }, { idle: 40 }, { move: 'logRoll' }, { idle: 40 },
        { move: 'timberCall' }, { move: 'timber1' }, { move: 'timber2' }, { move: 'timber3' },
        { idle: 40 }, { move: 'branch' }, { idle: 44 }, { taunt: 50 },
      ],
    },
    {
      id: 'clearCut', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 46 }, { move: 'branch' }, { idle: 36 }, { move: 'maul' }, { idle: 40 }, { move: 'axeHandle' },
        { idle: 36 }, { move: 'logRoll' }, { idle: 46 }, { taunt: 50 },
      ],
    },
    {
      id: 'loggingRun', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 34 }, { move: 'axeHandle' }, { idle: 22 }, { move: 'timberCall' }, { move: 'timber1' }, { move: 'timber2' }, { move: 'timber3' },
        { idle: 30 }, { move: 'logRoll' }, { idle: 22 }, { move: 'maul' }, { idle: 30 }, { move: 'branch' }, { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'deadfall', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'maul' }, { idle: 26 }, { move: 'branch' }, { idle: 20 }, { move: 'axeHandle' }, { idle: 24 },
        { move: 'timberCall' }, { move: 'timber1' }, { move: 'timber2' }, { move: 'timber3' }, { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'lastTree', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 24 }, { move: 'timberCall' }, { move: 'timber1' }, { move: 'timber2' }, { move: 'timber3' }, { idle: 24 },
        { move: 'maul' }, { idle: 20 }, { move: 'logRoll' }, { idle: 16 }, { move: 'branch' }, { idle: 20 },
        { move: 'timberCall' }, { move: 'timber1' }, { move: 'timber2' }, { move: 'timber3' }, { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'timberCall', name: 'TIMBER CHOP', then: ['timber1', 'timber2', 'timber3'], golden: 'windup', taunt: 42, shout: 'TIMBERRR!', times: [1, 2] },
  // more supers (super.js): each armored from its first frame to its last attack, each with one golden moment
  supers: [
    { hit: 'body', move: 'maul', inline: true, golden: 'windup', window: [12, 15] },
  ],

  getUpTable: [
    { upAt: [6, 8], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'stuckInTheStump', type: 'environment', name: 'STUCK IN THE STUMP',
      trigger: { on: 'resolved', move: 'timber3', result: 'ducked' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 6 }, say: 'THE AXE IS STUCK IN THE STUMP!', sfx: 'crunch' },
      hint: { kind: 'visual', text: 'THE FELLING SWING COMES DOWN ON AN OLD TREE STUMP.' },
      scout: 'DUCK THE FELLING SWING: IT STICKS IN THE STUMP AND HE\'S OPEN FOR 6 HITS.',
    },
    {
      id: 'splinter', type: 'guardBreak', name: 'SPLINTERED HANDLE',
      trigger: { state: 'windup', move: 'axeHandle', counter: true, count: 2 },
      effect: { stun: 95, hits: 8, say: 'THE HANDLE SPLINTERS!', sfx: 'crunch' },
      hint: { kind: 'trainer', text: 'AN AXE HANDLE TAKES ONLY SO MANY HITS.' },
      scout: 'EVERY SECOND COUNTER ON THE AXE HANDLE SPLINTERS IT: STUNNED FOR 8 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'thickBark', type: 'jabSpam', name: 'THICK BARK', streak: 3, counter: 'branch', say: 'BOUNCED OFF THE BARK!',
      scout: 'THREE JABS IN A ROW AND THE THIRD BOUNCES OFF HIS BARK: THEN HE SWINGS A BRANCH HOOK BACK.',
    },
  ],
  scriptedMoments: [
    {
      id: 'timberRound', name: 'TIMBER!', when: { left: 90 }, say: 'TIMBERRR!',
      steps: [{ idle: 20 }, { move: 'timberCall' }, { move: 'timber1' }, { move: 'timber2' }, { move: 'timber3' }],
    },
  ],
  special: [],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A LUMBERJACK FROM THE NORTH WOODS. WHEN HE YELLS TIMBER, THREE CHOPS FOLLOW, EACH ONE DIFFERENT.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'COUNTER THE TIMBER CALL.', check: 'counterMove', move: 'timberCall' } },
  music: 'larsWalkup', // his walk-up jingle (data/music/walkups.js)
};
