// #19 Tightrope Tess — Carnival Circuit. She dodges almost everything.
// Swing at her and she sways out of the way (and it costs you hearts, like a
// block). Even mid-attack she just leans away from your glove: no counters.
// The only time she can be hit is when she LANDS from her flip: she crouches,
// swings her arms back, somersaults over and drops onto you (slip it), then
// lands wobbling with her arms out. That's your window. First hit = star.
// Perfect hit: her one-foot balancing act (the taunt) wobbles at exactly one
// moment. That's the only other time she can be touched.

export default {
  id: 'tess',
  name: 'TIGHTROPE TESS',
  short: 'TESS',
  nickname: 'THE HIGH WIRE',
  circuit: 'carnival',
  rank: 2,
  isChampion: false,
  card: {
    age: 24,
    weight: 118,
    record: '23-2 5KO',
    hometown: '60 FEET UP',
    quote: 'I WALK A WIRE THE WIDTH OF YOUR THUMB. YOUR PUNCHES ARE WIDER.',
  },
  lines: {
    win: 'TA-DAA! MIND THE NET ON THE WAY DOWN.',
    lose: 'NO NET... NO NET...',
  },

  build: 'lean',
  palette: 'tess',
  spriteLayers: 'tess',

  stats: {
    health: 140,
    damageMult: 1.15,
    stunResistance: 0,
    heartDrainOnBlock: 2,
    starLossChance: 0.35,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'none',
    stunFrames: 40,
    hitstun: 12,
    betweenRoundHeal: 0.15,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 14 },
    block: ['swayL'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['balance'],
    victory: ['curtsy'],
    landing: { frames: ['land1', 'land2'], rate: 8 },
  },

  // No counter windows: she's never there to be countered.
  moves: {
    // her super: the High Dive. Up the ladder (a long tuck), then she dives in from above
    highDive: {
      name: 'HIGH DIVE',
      windupFrames: 26, activeFrames: 10, recoveryFrames: 6,
      damage: 20,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null,
      sfx: { tell: 'drumroll', swing: 'whoosh' },
      animation: { windup: ['flipTell', 'tuck', 'flipTell', 'tuck'], windupRate: 7, active: ['flipStrike'], recovery: ['land1'] },
    },
    jab: {
      name: 'HIGH-WIRE JAB',
      windupFrames: 14, activeFrames: 6, recoveryFrames: 20,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    jab2: {
      name: 'HIGH-WIRE JAB (2)',
      windupFrames: 10, activeFrames: 6, recoveryFrames: 22,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    pirouette: {
      name: 'PIROUETTE',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 24,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { tell: 'whoosh', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    lowSwing: {
      name: 'TRAPEZE',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 24,
      damage: 13,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    // the flip: crouch, tuck, drop onto you. Always followed by the landing (open step).
    flip: {
      name: 'SOMERSAULT',
      windupFrames: 18, activeFrames: 10, recoveryFrames: 6,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null,
      sfx: { tell: 'whoosh', swing: 'swingHeavy' },
      animation: { windup: ['flipTell', 'tuck'], windupRate: 12, active: ['flipStrike'], recovery: ['land1'] },
    },
  },

  patterns: [
    {
      id: 'firstAct', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'jab' }, { idle: 30 }, { move: 'pirouette' }, { idle: 30 },
        { move: 'flip' }, { open: 64, anim: 'landing', star: [0, 26], comboLimit: 6 },
        { idle: 30 }, { move: 'lowSwing' }, { idle: 30 }, { move: 'jab' }, { move: 'jab2' }, { idle: 30 },
        { move: 'flip' }, { open: 64, anim: 'landing', star: [0, 26], comboLimit: 6 },
        { idle: 40 }, { taunt: 60 },
      ],
    },
    {
      id: 'wireWalk', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'lowSwing' }, { idle: 24 }, { move: 'flip' }, { open: 64, anim: 'landing', star: [0, 26], comboLimit: 6 },
        { idle: 30 }, { move: 'pirouette' }, { idle: 20 }, { move: 'jab' }, { move: 'jab2' }, { idle: 40 }, { taunt: 60 },
      ],
    },
    {
      id: 'secondAct', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'jab' }, { move: 'jab2' }, { idle: 20 }, { move: 'pirouette' }, { idle: 20 },
        { move: 'lowSwing' }, { idle: 20 }, { move: 'flip' }, { open: 56, anim: 'landing', star: [0, 22], comboLimit: 6 },
        { idle: 24 }, { move: 'pirouette' }, { idle: 16 }, { move: 'flip' }, { open: 56, anim: 'landing', star: [0, 22], comboLimit: 6 },
        { idle: 30 }, { taunt: 44 },
      ],
    },
    {
      id: 'noNet', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 24 }, { move: 'flip' }, { open: 52, anim: 'landing', star: [0, 20], comboLimit: 6 },
        { idle: 20 }, { move: 'jab' }, { move: 'jab2' }, { idle: 16 }, { move: 'lowSwing' }, { idle: 16 },
        { move: 'pirouette' }, { idle: 20 }, { move: 'flip' }, { open: 52, anim: 'landing', star: [0, 20], comboLimit: 6 },
        { idle: 30 }, { taunt: 40 },
      ],
    },
  ],

  // her super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'highDive', golden: 'taunt', window: [18, 21], taunt: 42, shout: 'HIGH DIVE!', times: [1, 2] },

  getUpTable: [
    { upAt: [3, 6], health: 0.6 },
    { upAt: [6, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.4, health: 0.35 },
    { upAt: null },
  ],



  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'offTheWire', type: 'stunTrigger', name: 'OFF THE WIRE',
      trigger: { state: 'open', open: 'landing', frames: [0, 8], height: 'low' },
      effect: { open: { frames: 96, anim: 'landing', comboLimit: 9 }, say: 'SHE FELL OFF THE WIRE!' },
      hint: { kind: 'trainer', text: 'HIT THE LANDING THE INSTANT SHE TOUCHES DOWN.' },
      scout: 'A BODY SHOT IN THE FIRST FRAMES OF HER LANDING KNOCKS HER OFF BALANCE: 9 HITS.',
    },
    {
      id: 'showboat', type: 'bait', name: 'SHOWBOAT',
      trigger: { on: 'passive', frames: 180 },
      effect: { script: [{ move: 'flip' }, { open: 64, anim: 'landing', star: [0, 26], comboLimit: 6 }], say: 'SHE CAN\'T RESIST SHOWING OFF!' },
      hint: { kind: 'trainer', text: 'STAND STILL AND SHE GETS BORED.' },
      scout: 'DON\'T PUNCH FOR 3 SECONDS AND SHE SHOWS OFF WITH A FLIP (AND A LANDING TO HIT).',
    },
  ],
  antiStrategies: [
    {
      id: 'walksTheWire', type: 'dodgeBias', name: 'WALKS THE WIRE TO YOU', moves: ['pirouette'],
      scout: 'SLIP THE SAME WAY EVERY TIME AND HER PIROUETTE SPINS OUT TO THAT SIDE.',
    },
  ],
  scriptedMoments: [
    {
      id: 'highWireAct', name: 'THE HIGH WIRE ACT', when: { left: 90 }, say: 'THE HIGH WIRE ACT!',
      steps: [
        { move: 'flip' }, { open: 44, anim: 'landing', star: [0, 18], comboLimit: 4 },
        { move: 'flip' }, { open: 44, anim: 'landing', comboLimit: 4 },
        { move: 'flip' }, { open: 60, anim: 'landing', comboLimit: 6 },
      ],
    },
  ],
  special: [{ type: 'evasive', hittable: ['open'], frames: 16, after: 8, poseL: 'swayL', poseR: 'swayR' }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE HIGH-WIRE STAR. SHE FLIPS AWAY FROM EVERYTHING AND CAN ONLY BE HIT WHEN SHE LANDS.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { speed: 285, signature: { text: 'NEVER MISS: NOT ONE PUNCH SHE FLIPS AWAY FROM.', check: 'noWhiff' } }, // (speed 4:45 since 2026-10-01: the bot's 90th percentile is 3:52)
  music: 'tessWalkup', // his walk-up jingle (data/music/walkups.js)
};
