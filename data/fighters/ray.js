// #9 Rush Hour Ray — Metro Circuit. The traffic light on his head is the tell.
//   RED     he freezes like he's stuck at a crossing: wide open. First hit = star.
//   GREEN   a 3-hit rush. Each hit wants a different defense (dodge, dodge/block,
//           then duck or dodge the hook). Counter the first one early for a star.
//   YELLOW  a fake: he crouches like the rush is coming and it never does.
//           Punch him during it for a free counter.
// Everything else is plain commuter boxing; his Gridlock uppercut has the perfect-hit frames.

export default {
  id: 'ray',
  name: 'RUSH HOUR RAY',
  short: 'RAY',
  nickname: 'THE COMMUTER',
  circuit: 'metro',
  rank: 3,
  isChampion: false,
  card: {
    age: 41,
    weight: 168,
    record: '15-6 8KO',
    hometown: 'EXIT 14',
    quote: 'TWO HOURS EACH WAY. EVERY DAY. YOU THINK YOU CAN MAKE ME ANGRIER?',
  },
  lines: {
    win: 'IF I LEAVE NOW I MIGHT BEAT THE TRAFFIC.',
    lose: 'GREAT. NOW I\'M LATE AND CONCUSSED.',
  },

  build: 'medium',
  palette: 'ray',
  spriteLayers: 'ray',

  stats: {
    health: 150,
    damageMult: 1.15,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.35,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 54,
    hitstun: 13,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 24 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['watch'],
    victory: ['sighVictory'],
    frozen: { frames: ['frozen1', 'frozen2'], rate: 10 },
  },

  moves: {
    commute: {
      name: 'COMMUTE JAB',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 22,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [8, 19],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    honk: {
      name: 'ROAD RAGE',
      windupFrames: 24, activeFrames: 8, recoveryFrames: 28,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [8, 21],
      starWindow: null,
      sfx: { tell: 'carHorn', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // GREEN: the rush
    rush1: {
      name: 'GREEN LIGHT (1)',
      cue: 'green',
      windupFrames: 22, activeFrames: 6, recoveryFrames: 4,
      damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [8, 19],
      starWindow: [8, 13],
      sfx: { tell: 'signal', swing: 'whiff' },
      animation: { windup: ['crouchTell'], active: ['jab'], recovery: ['jab'] },
    },
    rush2: {
      name: 'GREEN LIGHT (2)',
      cue: 'green',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 4,
      damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabR'] },
    },
    rush3: {
      name: 'GREEN LIGHT (3)',
      cue: 'green',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 34,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // YELLOW: the same crouch, and nothing comes. Free counter.
    fakeOut: {
      name: 'YELLOW LIGHT',
      cue: 'yellow',
      feint: true,
      windupFrames: 22, activeFrames: 0, recoveryFrames: 8,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 21],
      starWindow: null,
      sfx: { tell: 'signal' },
      animation: { windup: ['crouchTell'], active: ['crouchTell'], recovery: ['idle1'] },
    },
    gridlock: {
      name: 'GRIDLOCK',
      windupFrames: 28, activeFrames: 8, recoveryFrames: 38,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [8, 25],
      starWindow: [12, 22],
      kdWindow: [21, 24],  // perfect hit
      sfx: { tell: 'carHorn', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  // RED is an `open` step; the patterns string lights together like real traffic.
  patterns: [
    {
      id: 'morningCommute', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 60 }, { move: 'commute' }, { idle: 44 }, { move: 'fakeOut' },
        { open: 100, anim: 'frozen', cue: 'red', star: [0, 36], comboLimit: 8, sfx: 'signal' },
        { idle: 40 }, { move: 'rush1' }, { move: 'rush2' }, { move: 'rush3' }, { idle: 40 },
        { move: 'honk' }, { idle: 50 }, { move: 'gridlock' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'lateAgain', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'rush1' }, { move: 'rush2' }, { move: 'rush3' }, { idle: 40 },
        { move: 'commute' }, { idle: 30 }, { move: 'fakeOut' }, { idle: 20 }, { move: 'honk' },
        { idle: 40 }, { open: 90, anim: 'frozen', cue: 'red', star: [0, 32], comboLimit: 8, sfx: 'signal' },
        { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'eveningRush', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'fakeOut' }, { move: 'rush1' }, { move: 'rush2' }, { move: 'rush3' },
        { idle: 30 }, { move: 'commute' }, { idle: 24 }, { move: 'fakeOut' },
        { open: 84, anim: 'frozen', cue: 'red', star: [0, 30], comboLimit: 7, sfx: 'signal' },
        { idle: 30 }, { move: 'gridlock' }, { idle: 36 }, { move: 'honk' }, { idle: 40 }, { taunt: 44 },
      ],
    },
    {
      id: 'detour', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'honk' }, { idle: 24 }, { move: 'rush1' }, { move: 'rush2' }, { move: 'rush3' },
        { idle: 30 }, { move: 'fakeOut' }, { idle: 12 }, { move: 'fakeOut' }, { move: 'commute' },
        { idle: 36 }, { open: 84, anim: 'frozen', cue: 'red', star: [0, 30], comboLimit: 7, sfx: 'signal' },
        { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'roadRage', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 30 }, { move: 'rush1' }, { move: 'rush2' }, { move: 'rush3' }, { idle: 20 },
        { move: 'fakeOut' }, { move: 'rush1' }, { move: 'rush2' }, { move: 'rush3' }, { idle: 30 },
        { move: 'gridlock' }, { idle: 24 }, { move: 'honk' }, { idle: 30 },
        { open: 80, anim: 'frozen', cue: 'red', star: [0, 28], comboLimit: 7, sfx: 'signal' },
        { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'gridlock', golden: 'windup', taunt: 46, shout: 'RUSH HOUR!', times: [1, 2] },

  getUpTable: [
    { upAt: [4, 7], health: 0.6 },
    { upAt: [6, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.4, health: 0.35 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'jammedRed', type: 'patternBreak', name: 'STUCK ON RED',
      trigger: { state: 'windup', move: 'fakeOut', counter: true },
      effect: { cancelMoves: ['rush1', 'rush2', 'rush3'], open: { frames: 80, anim: 'frozen', comboLimit: 7, cue: 'red' }, say: 'THE LIGHT JAMMED ON RED!', sfx: 'signal' },
      hint: { kind: 'visual', text: 'THE YELLOW LAMP BLINKS: HE\'S BLUFFING.' },
      scout: 'COUNTER THE YELLOW LIGHT: IT JAMS ON RED (7 FREE HITS) AND THE GREEN RUSH NEVER COMES.',
    },
    {
      id: 'lateForWork', type: 'quirk', name: 'LATE FOR WORK',
      trigger: { state: 'open', open: 'watch', first: true },
      effect: { keep: true, star: true, say: 'LATE AGAIN!' },
      hint: { kind: 'trainer', text: 'WITH 30 SECONDS LEFT HE CHECKS HIS WATCH.' },
      scout: 'AT 0:30 IN EVERY ROUND HE CHECKS HIS WATCH: THE FIRST HIT EARNS A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'yellowToGreen', type: 'earlyDodge', name: 'YELLOW TURNS GREEN', response: 'convert', moves: ['fakeOut'], into: ['rush1', 'rush2', 'rush3'], say: 'GREEN LIGHT!',
      scout: 'DODGE HIS YELLOW LIGHT BEFORE IT\'S DONE AND IT TURNS GREEN: THE RUSH CATCHES YOU COMING BACK.',
    },
  ],
  scriptedMoments: [
    { id: 'checksWatch', name: 'CHECKS HIS WATCH', when: { left: 30 }, say: 'RAY CHECKS HIS WATCH...', steps: [{ open: 60, anim: 'frozen', id: 'watch', comboLimit: 5 }] },
  ],
  special: [{
    type: 'cueLamp', palettes: { red: 'ray.red', yellow: 'ray.yellow', green: 'ray.green' }, blink: ['yellow'],
    lamps: { red: [-1, -29], yellow: [-1, -24], green: [-1, -19] }, glow: { red: [31, 10, 8], yellow: [31, 28, 10], green: [12, 31, 14] },
  }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A COMMUTER WHO BRINGS HIS OWN TRAFFIC LIGHT. RED, HE STOPS. GREEN, HE GOES. YELLOW, WHO KNOWS?', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'LAND 8 COUNTERS.', check: 'counters', n: 8 } },
  music: 'rayWalkup', // his walk-up jingle (data/music/walkups.js)
};
