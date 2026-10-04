// #2 Kid Kilowatt — Rookie Circuit. Teaches punishing fatigue.
// A static-crackle crouch (+ buzz) starts a 4-jab burst; block or dodge it and
// he's bent over gasping for 2 seconds, wide open. The first punch into the
// gasp earns a star. Outside the gasp he bounces around with his guard up, so
// jabbing him while he's fresh just gets blocked.

export default {
  id: 'kid',
  name: 'KID KILOWATT',
  short: 'KID',
  nickname: 'LIVE WIRE',
  circuit: 'rookie',
  rank: 2,
  isChampion: false,
  card: {
    age: 16,
    weight: 128,
    record: '9-5 6KO',
    hometown: 'VOLTAGE CITY',
    quote: 'I HAD SIX SODAS. I CAN SEE SOUNDS.',
  },
  lines: {
    win: 'THAT WAS RAD. CAN WE GO AGAIN? CAN WE?',
    lose: 'TOO FAST! TOO FURIOUS! TOO... TIRED...',
  },

  build: 'lean',
  palette: 'kid',
  spriteLayers: 'kid',

  stats: {
    health: 100,
    damageMult: 0.9,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.3,
    comboLimit: 1,        // fresh, he covers up after one punch
    stunComboLimit: 4,
    idleHitLimit: 0,      // bouncing with his guard up: idle jabs are blocked
    idleGuard: 'none',
    stunFrames: 50,
    hitstun: 12,
    betweenRoundHeal: 0.25,
  },

  anims: {
    idle: { frames: ['idle1', 'hop', 'idle1', 'idle2'], rate: 7 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 12 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['taunt', 'hop'], rate: 8 },
    victory: { frames: ['flex', 'hop'], rate: 10 },
    gasp: { frames: ['gasp1', 'gasp2'], rate: 16 },
  },

  moves: {
    // the burst opener: the only readable part, so it gets the full Rookie tell
    burst1: {
      name: 'SHOCK BURST',
      windupFrames: 30, activeFrames: 6, recoveryFrames: 4,
      damage: 5,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [12, 27],
      starWindow: null,
      sfx: { tell: 'zap', swing: 'whiff' },
      animation: { windup: ['zap1', 'zap2'], windupRate: 4, active: ['jab'], recovery: ['jab'] },
    },
    burst2: {
      name: 'BURST 2',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 4,
      damage: 5,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabR'] },
    },
    burst3: {
      name: 'BURST 3',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 4,
      damage: 5,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jab'] },
    },
    burst4: {
      name: 'BURST 4',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 6,
      damage: 6,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabR'] },
    },
    zapJab: {
      name: 'ZAP JAB',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 20,
      damage: 7,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [12, 27],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    sparkUpper: {
      name: 'SPARK PLUG',
      windupFrames: 34, activeFrames: 8, recoveryFrames: 34,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [12, 31],
      starWindow: null,
      kdWindow: [24, 27],  // perfect hit: a counter on exactly these frames drops him
      sfx: { tell: 'zap', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  // Every pattern is built around burst -> gasp. The gasp is the lesson.
  patterns: [
    {
      id: 'sugarRush', weight: 1,
      when: { rounds: [1], health: [0.4, 1] },
      steps: [
        { idle: 70 }, { move: 'zapJab' }, { idle: 50 },
        { move: 'burst1' }, { move: 'burst2' }, { move: 'burst3' }, { move: 'burst4' },
        { open: 120, anim: 'gasp', star: [0, 45], comboLimit: 8, sfxLoop: 'pant', sfxEvery: 32 },
        { idle: 40 }, { move: 'sparkUpper' }, { idle: 60 }, { taunt: 50 },
      ],
    },
    {
      id: 'secondWind', weight: 1,
      when: { rounds: [2, 3], health: [0.4, 1] },
      steps: [
        { idle: 50 }, { move: 'burst1' }, { move: 'burst2' }, { move: 'burst3' }, { move: 'burst4' },
        { open: 110, anim: 'gasp', star: [0, 40], comboLimit: 8, sfxLoop: 'pant', sfxEvery: 32 },
        { idle: 36 }, { move: 'zapJab' }, { idle: 30 }, { move: 'sparkUpper' }, { idle: 40 },
        { move: 'zapJab' }, { idle: 50 }, { taunt: 40 },
      ],
    },
    {
      id: 'crashing', weight: 1,
      when: { health: [0, 0.4] },
      steps: [
        { idle: 40 }, { move: 'burst1' }, { move: 'burst2' }, { move: 'burst3' }, { move: 'burst4' },
        { open: 130, anim: 'gasp', star: [0, 45], comboLimit: 8, sfxLoop: 'pant', sfxEvery: 32 },
        { idle: 30 }, { move: 'sparkUpper' }, { idle: 30 },
        { move: 'burst1' }, { move: 'burst2' }, { move: 'burst3' }, { move: 'burst4' },
        { open: 130, anim: 'gasp', star: [0, 45], comboLimit: 8, sfxLoop: 'pant', sfxEvery: 32 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'sparkUpper', golden: 'recovery', window: [8, 11], taunt: 48, shout: 'SUGAR RUSH!', times: [1, 2] },

  getUpTable: [
    { upAt: [3, 5], health: 0.6 },
    { upAt: [5, 8], health: 0.45 },
    { upAt: [8, 9], stayDown: 0.4, health: 0.3 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'outOfGas', type: 'stunTrigger', name: 'OUT OF GAS',
      trigger: { state: 'open', open: 'gasp', height: 'low', lands: true },
      effect: { keep: true, extendOpen: 24, max: 72, sfx: 'pant' },
      hint: { kind: 'trainer', text: 'GUT SHOTS WHILE HE GASPS.' },
      scout: 'BODY SHOTS WHILE HE GASPS KEEP HIM GASPING LONGER (UP TO 3 MORE SHOTS).',
    },
  ],
  // K6's example gives the Kid an anti-strategy (K4 says Rookie fighters have none): a mild one
  antiStrategies: [
    {
      id: 'sparkDelay', type: 'earlyDodge', name: 'DELAYED FOURTH JAB', mild: true, override: 'K6',
      response: 'hold', moves: ['burst4'], say: 'GOTCHA!',
      scout: 'DODGE BEFORE HIS 4TH JAB AND HE HOLDS IT UNTIL YOU COME BACK OUT OF THE SLIP.',
    },
  ],
  special: [],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'SIXTEEN, SUGAR-FUELED AND FAST. HE THROWS FOUR PUNCHES IN A BREATH, THEN HAS TO FIND ANOTHER BREATH.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER RUN OUT OF HEARTS.', check: 'noPink' } },
  music: 'kidWalkup', // his walk-up jingle (data/music/walkups.js)
};
