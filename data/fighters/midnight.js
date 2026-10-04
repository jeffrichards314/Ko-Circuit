// #16 Count Midnight — Major Circuit champion. Lights out.
// He raises a glove and SNAPS: the arena goes black for eight seconds and all
// you can see are his glowing eyes. The eyes give every move away:
//   eyes slide LEFT    the Nightfall jab (slip it, block it, anything)
//   eyes slide RIGHT   the Bat Wing hook (slip or duck)
//   eyes drop DOWN     the Grave Digger to the body (block)
//   eyes flare WIDE    the Midnight Strike uppercut (slip it)
//   left, then right   Fang Fury: two hooks, one from each side
// Punch him DURING the snap and the lights stay on. When anyone goes down,
// the house lights come back up.
// Perfect hit: the Midnight Strike, on exactly the right frames (the glint shows in the dark too).

export default {
  id: 'midnight',
  name: 'COUNT MIDNIGHT',
  short: 'MIDNIGHT',
  nickname: 'THE NIGHT OWL',
  circuit: 'major',
  rank: 0,
  isChampion: true,
  card: {
    age: '???',
    weight: 158,
    record: '31-0 27KO',
    hometown: 'THE OLD MANOR',
    quote: 'I NEVER FIGHT BEFORE MIDNIGHT. AND IT IS ALWAYS MIDNIGHT.',
  },
  lines: {
    win: 'SLEEP WELL. AH-HA-HA-HA!',
    lose: 'THE SUN... IT RISES...',
  },

  build: 'lean',
  palette: 'midnight',
  spriteLayers: 'midnight',

  stats: {
    health: 180,
    damageMult: 1.25,
    stunResistance: 4,
    heartDrainOnBlock: 2,
    starLossChance: 0.45,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 54,
    hitstun: 13,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 28 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['fold'],
    victory: ['laugh'],
  },

  // eyes: [dx, dy, wide] of his glowing eyes in the dark during the windup
  moves: {
    snap: {
      name: 'LIGHTS OUT',
      feint: true,
      windupFrames: 30, activeFrames: 0, recoveryFrames: 20,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 29],
      starWindow: [4, 16],
      eyes: [0, 0, 1],
      sfx: { tell: 'snap' },
      animation: { windup: ['snapTell'], active: ['snapTell'], recovery: ['snapTell', 'idle1'] },
    },
    nightfall: {
      name: 'NIGHTFALL',
      windupFrames: 20, activeFrames: 6, recoveryFrames: 22,
      damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [6, 17],
      starWindow: null,
      eyes: [-4, 0, 0],
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    batWing: {
      name: 'BAT WING',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 26,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [6, 17],
      starWindow: null,
      eyes: [4, 0, 0],
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    graveDigger: {
      name: 'GRAVE DIGGER',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 26,
      damage: 13,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [6, 17],
      starWindow: null,
      eyes: [0, 3, 0],
      sfx: { swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    fang1: {
      name: 'FANG FURY',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 6,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [6, 17],
      starWindow: null,
      eyes: [-4, 0, 0],
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    fang2: {
      name: 'FANG FURY (2)',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 30,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      eyes: [4, 0, 0],
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    midnightStrike: {
      name: 'MIDNIGHT STRIKE',
      windupFrames: 28, activeFrames: 8, recoveryFrames: 42,
      damage: 20,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [6, 25],
      starWindow: [10, 20],
      kdWindow: [21, 24],  // perfect hit
      eyes: [0, -2, 1],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'dusk', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 60 }, { move: 'nightfall' }, { idle: 50 }, { move: 'snap' }, { idle: 40 },
        { move: 'batWing' }, { idle: 50 }, { move: 'graveDigger' }, { idle: 50 }, { move: 'midnightStrike' },
        { idle: 60 }, { move: 'nightfall' }, { idle: 50 }, { move: 'fang1' }, { move: 'fang2' }, { idle: 60 }, { taunt: 60 },
      ],
    },
    {
      id: 'witchingHour', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'graveDigger' }, { idle: 40 }, { move: 'snap' }, { idle: 30 },
        { move: 'fang1' }, { move: 'fang2' }, { idle: 50 }, { move: 'midnightStrike' }, { idle: 50 },
        { move: 'nightfall' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'deepNight', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'snap' }, { idle: 24 }, { move: 'nightfall' }, { idle: 30 }, { move: 'batWing' },
        { idle: 30 }, { move: 'graveDigger' }, { idle: 24 }, { move: 'fang1' }, { move: 'fang2' }, { idle: 30 },
        { move: 'midnightStrike' }, { idle: 40 }, { move: 'nightfall' }, { idle: 30 }, { taunt: 44 },
      ],
    },
    {
      id: 'eclipse', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'midnightStrike' }, { idle: 30 }, { move: 'snap' }, { idle: 20 },
        { move: 'graveDigger' }, { idle: 20 }, { move: 'batWing' }, { idle: 24 }, { move: 'nightfall' },
        { idle: 30 }, { move: 'fang1' }, { move: 'fang2' }, { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'dawnApproaches', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 30 }, { move: 'snap' }, { idle: 16 }, { move: 'fang1' }, { move: 'fang2' }, { idle: 20 },
        { move: 'midnightStrike' }, { idle: 24 }, { move: 'graveDigger' }, { idle: 14 }, { move: 'nightfall' },
        { idle: 24 }, { move: 'batWing' }, { idle: 30 }, { move: 'midnightStrike' }, { idle: 36 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'midnightStrike', golden: 'recovery', window: [10, 13], taunt: 44, shout: 'THE WITCHING HOUR!', times: [1, 2] },

  getUpTable: [
    { upAt: [6, 8], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // A champion (K4): 3 exploits, 2 anti-strategies, 2 scripted moments.
  exploits: [
    {
      id: 'lightsUp', type: 'stunTrigger', name: 'BLINDED BY THE LIGHT',
      trigger: { state: ['idle', 'windup', 'recovery', 'block', 'open'], since: { event: 'lightsOn', frames: [0, 8] }, clean: 20 },
      effect: { stun: 90, hits: 7, say: 'BLINDED BY THE LIGHT!' },
      hint: { kind: 'visual', text: 'THE LIGHTS FLICKER JUST BEFORE THEY COME BACK.' },
      scout: 'HIT HIM THE MOMENT THE LIGHTS COME BACK ON: STUNNED FOR 7 HITS.',
    },
    {
      id: 'spunAround', type: 'stunTrigger', name: 'SPUN AROUND',
      trigger: { on: 'resolved', move: 'batWing', result: 'ducked' },
      effect: { open: { frames: 60, anim: 'stunned', comboLimit: 4 }, say: 'SPUN RIGHT AROUND!', sfx: 'whoosh' },
      hint: { kind: 'trainer', text: 'DUCK THE BAT WING.' },
      scout: 'DUCK THE BAT WING AND HE SPINS PAST YOU: 4 FREE HITS.',
    },
    {
      id: 'twelveChimes', type: 'quirk', name: 'THE CLOCK STRIKES TWELVE',
      trigger: { state: 'open', open: 'chime', first: true },
      effect: { keep: true, star: true, say: 'MIDNIGHT!' },
      hint: { kind: 'audio', text: 'A CLOCK TOLLS WITH 12 SECONDS LEFT.' },
      scout: 'AT 0:12 IN EVERY ROUND HE STOPS TO COUNT THE CHIMES: THE FIRST HIT EARNS A STAR, 7 IN ALL.',
    },
  ],
  antiStrategies: [
    {
      id: 'waitsInDark', type: 'earlyDodge', name: 'WAITS IN THE DARK', response: 'hold', dark: true, moves: ['nightfall', 'batWing', 'fang1', 'fang2'],
      scout: 'IN THE DARK, DODGE TOO EARLY AND HE HOLDS HIS PUNCH UNTIL YOU COME BACK. WAIT FOR HIS EYES.',
    },
    {
      id: 'eyesFollow', type: 'dodgeBias', name: 'HIS EYES FOLLOW YOU', moves: ['batWing'], light: true,
      scout: 'SLIP THE SAME WAY EVERY TIME AND HIS BAT WING COMES FROM THAT SIDE (ONLY WITH THE LIGHTS ON).',
    },
  ],
  scriptedMoments: [
    { id: 'strikesTwelve', name: 'THE CLOCK STRIKES TWELVE', when: { left: 12 }, say: 'THE CLOCK STRIKES TWELVE...', steps: [{ open: 72, anim: 'idle', id: 'chime', comboLimit: 7, sfx: 'toll' }] },
    { id: 'bloodMoon', name: 'BLOOD MOON', when: { health: 0.35 }, say: 'THE NIGHT GROWS DARKER...', steps: [{ move: 'snap' }] },
  ],
  special: [{ type: 'lightsOut', trigger: 'snap', frames: 480, fade: 14, eyeHi: [31, 26, 26], eyeLo: [27, 3, 6] }],
  // Title Defense remix: the blood moon.
  titleDefense: {
    nickname: 'THE BLOOD MOON',
    quote: 'THE NIGHT IS LONGER THIS TIME OF YEAR.',
    lines: { win: 'SLEEP WELL. FOREVER.', lose: 'THE DAWN... AGAIN...' },
    tell: 0.8,
    costume: { B: { violetHi: [30, 8, 10], violet: [21, 3, 6], violetDk: [11, 1, 3] } },
    moves: {
      // new: a left uppercut out of the dark: eyes rise (slip it)
      bloodMoon: {
        name: 'BLOOD MOON',
        windupFrames: 22, activeFrames: 8, recoveryFrames: 34,
        damage: 15,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [6, 19],
        starWindow: [8, 14],
        punishStar: ['dodged'],
        eyes: [-2, -2, 0],
        sfx: { swing: 'swingHeavy' },
        animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
      },
      // new: a right to the body: eyes drop to the right (block, or slip left)
      coffinNail: {
        name: 'COFFIN NAIL',
        windupFrames: 20, activeFrames: 8, recoveryFrames: 26,
        damage: 13,
        height: 'low',
        avoidBy: ['block', 'dodgeL'],
        counterWindow: [6, 17],
        starWindow: null,
        eyes: [3, 3, 0],
        sfx: { swing: 'whiff' },
        animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'moonrise', weight: 3,
        when: { rounds: [1], health: [0.5, 1] },
        steps: [
          { idle: 56 }, { move: 'nightfall' }, { idle: 44 }, { move: 'snap' }, { idle: 36 }, { move: 'coffinNail' },
          { idle: 44 }, { move: 'bloodMoon' }, { idle: 44 }, { move: 'batWing' }, { idle: 44 }, { move: 'midnightStrike' },
          { idle: 50 }, { taunt: 56 },
        ],
      },
      {
        id: 'nightTerror', weight: 3,
        when: { rounds: [2, 3], health: [0.5, 1] },
        steps: [
          { idle: 36 }, { move: 'snap' }, { idle: 22 }, { move: 'bloodMoon' }, { idle: 28 }, { move: 'coffinNail' },
          { idle: 24 }, { move: 'fang1' }, { move: 'fang2' }, { idle: 28 }, { move: 'graveDigger' }, { idle: 24 },
          { move: 'midnightStrike' }, { idle: 36 }, { taunt: 40 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE MAJOR CHAMPION NEVER FIGHTS BEFORE DARK. WHEN THE LIGHTS GO OUT, WATCH HIS EYES.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'EVERY KNOCKDOWN FROM A COUNTER.', check: 'kdOnly', by: 'counter' } },
  music: 'midnightEntrance',
};
