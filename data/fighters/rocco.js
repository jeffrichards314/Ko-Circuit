// #5 Rocco Rivets — Minor Circuit. The hard hat.
// His hard hat blocks every head shot (star punches included) with a CLANG,
// so only body shots work, until a counter stuns him and knocks the hat
// crooked. Then his head is open for the whole combo.

export default {
  id: 'rocco',
  name: 'ROCCO RIVETS',
  short: 'ROCCO',
  nickname: 'THE IRONWORKER',
  circuit: 'minor',
  rank: 3,
  isChampion: false,
  card: {
    age: 34,
    weight: 244,
    record: '16-6 12KO',
    hometown: 'GIRDER HEIGHTS',
    quote: 'HARD HAT AREA, PAL. THAT MEANS YOUR HEAD, NOT MINE.',
  },
  lines: {
    win: 'CLOCKING OUT. SEE YA ON THE NEXT SHIFT.',
    lose: 'SHOULDA READ THE SAFETY MANUAL...',
  },

  build: 'heavy',
  palette: 'rocco',
  spriteLayers: 'rocco',

  stats: {
    health: 140,
    damageMult: 1.15,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.35,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'none',     // the hat is his guard
    stunFrames: 60,
    hitstun: 14,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 22 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['taunt'],
    victory: ['flex'],
  },

  moves: {
    rivet1: {
      name: 'RIVET GUN',
      windupFrames: 26, activeFrames: 8, recoveryFrames: 4,
      damage: 7,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [10, 23],
      starWindow: null,
      sfx: { tell: 'wrench', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jab'] },
    },
    rivet2: {
      name: 'RIVET GUN (2)',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 22,
      damage: 7,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    jack1: {
      name: 'JACKHAMMER',
      windupFrames: 26, activeFrames: 6, recoveryFrames: 4,
      damage: 6,
      avoidBy: ['block'],
      counterWindow: [10, 23],
      starWindow: null,
      height: 'low',
      sfx: { tell: 'wrench', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['body'] },
    },
    jack2: {
      name: 'JACKHAMMER (2)',
      windupFrames: 10, activeFrames: 6, recoveryFrames: 4,
      damage: 6,
      avoidBy: ['block'],
      counterWindow: null, starWindow: null,
      height: 'low',
      sfx: { swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyR'] },
    },
    jack3: {
      name: 'JACKHAMMER (3)',
      windupFrames: 10, activeFrames: 6, recoveryFrames: 26,
      damage: 6,
      avoidBy: ['block'],
      counterWindow: null, starWindow: null,
      height: 'low',
      sfx: { swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    hotRivet: {
      name: 'HOT RIVET',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 36,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [10, 27],
      starWindow: null,
      sfx: { tell: 'sizzle', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    wreckingBall: {
      name: 'WRECKING BALL',
      windupFrames: 36, activeFrames: 10, recoveryFrames: 44,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [12, 33],
      starWindow: [16, 30],
      kdWindow: [26, 29],  // perfect hit: a counter on exactly these frames drops him
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'morningShift', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 60 }, { move: 'rivet1' }, { move: 'rivet2' }, { idle: 50 }, { move: 'hotRivet' },
        { idle: 50 }, { move: 'jack1' }, { move: 'jack2' }, { move: 'jack3' }, { idle: 50 },
        { move: 'wreckingBall' }, { idle: 60 }, { taunt: 50 },
      ],
    },
    {
      id: 'overtime', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 44 }, { move: 'jack1' }, { move: 'jack2' }, { move: 'jack3' }, { idle: 30 },
        { move: 'rivet1' }, { move: 'rivet2' }, { idle: 40 }, { move: 'wreckingBall' }, { idle: 36 },
        { move: 'hotRivet' }, { idle: 30 }, { move: 'rivet1' }, { move: 'rivet2' }, { idle: 50 }, { taunt: 40 },
      ],
    },
    {
      id: 'demolition', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 36 }, { move: 'wreckingBall' }, { idle: 30 }, { move: 'jack1' }, { move: 'jack2' }, { move: 'jack3' },
        { idle: 24 }, { move: 'hotRivet' }, { idle: 24 }, { move: 'wreckingBall' }, { idle: 50 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'wreckingBall', golden: 'windup', taunt: 48, shout: 'WRECKING BALL!', times: [1, 2] },

  getUpTable: [
    { upAt: [4, 6], health: 0.6 },
    { upAt: [6, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.4, health: 0.35 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'lidOff', type: 'guardBreak', name: 'LID OFF', limit: 1,
      trigger: { star: true, lands: true, notFlag: 'hatOff' },
      effect: { keep: true, flag: 'hatOff', say: 'THE HARD HAT\'S OFF!', sfx: 'clang' },
      hint: { kind: 'trainer', text: 'A STAR PUNCH TAKES THE HAT.' },
      scout: 'A STAR PUNCH KNOCKS HIS HARD HAT OFF FOR THE REST OF THE FIGHT: HEAD SHOTS LAND.',
    },
  ],
  antiStrategies: [
    {
      id: 'coversUp', type: 'zoneBias', name: 'COVERS THE BODY', zone: 'body', streak: 5, frames: 480, say: 'HE\'S COVERING UP!',
      scout: 'FIVE BODY SHOTS IN A ROW AND HE DROPS HIS GUARD LOW FOR 8 SECONDS. COUNTERS STILL GET THROUGH.',
    },
  ],
  flagPalettes: { hatOff: 'rocco.hatless' }, // the hat's gone: his auburn hair shows
  special: [{ type: 'hardHat', stars: true }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'AN IRONWORKER WHO NEVER TAKES OFF HIS HARD HAT. NOT FOR LUNCH, NOT FOR SLEEP, NOT FOR YOU.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER PUNCH THE HARD HAT.', check: 'noCue', cue: '!hatClang' } },
  music: 'roccoWalkup', // his walk-up jingle (data/music/walkups.js)
};
