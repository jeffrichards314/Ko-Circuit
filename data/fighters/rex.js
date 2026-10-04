// #21 Ringmaster Rex — Carnival Circuit champion. "LIGHTS!"
// He throws an arm up to the rafters and calls in a spotlight: for six seconds
// a blinding white glare washes over one half of the screen (left or right, at
// random). Half of him disappears into it. Read the half you can see, and
// LISTEN: every one of his punches has its own sound.
//   whip crack   Cane Jab          (slip, block or duck)
//   drum roll    Lion Tamer hook   (slip or duck)
//   thud         Roll Up, to the body (block)
//   fanfare      Big Top overhead  (slip)
//   chime        Encore: two hooks, one from each side
//   ding         Grand Finale uppercut (slip) - his perfect-hit move
// Punch him during the call and the spotlight never comes.

export default {
  id: 'rex',
  name: 'RINGMASTER REX',
  short: 'REX',
  nickname: 'THE SHOWMAN',
  circuit: 'carnival',
  rank: 0,
  isChampion: true,
  card: {
    age: 50,
    weight: 191,
    record: '35-2 24KO',
    hometown: 'CENTER RING',
    quote: 'LADIES AND GENTLEMEN! BOYS AND GIRLS! TONIGHT, A DISAPPEARING ACT!',
  },
  lines: {
    win: 'AND THAT, LADIES AND GENTLEMEN, IS SHOWBUSINESS!',
    lose: 'THE SHOW... MUST... GO ON...',
  },

  build: 'medium',
  palette: 'rex',
  spriteLayers: 'rex',

  stats: {
    health: 190,
    damageMult: 1.25,
    stunResistance: 4,
    heartDrainOnBlock: 2,
    starLossChance: 0.45,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 50,
    hitstun: 13,
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
    taunt: ['presents'],
    victory: ['bravo'],
    bow: ['hitLow'],   // the final bow (his scripted moment)
  },

  moves: {
    callLights: {
      name: 'LIGHTS!',
      feint: true,
      windupFrames: 24, activeFrames: 0, recoveryFrames: 16,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 23],
      starWindow: [3, 12],
      sfx: { tell: 'whistle' },
      animation: { windup: ['callLights'], active: ['callLights'], recovery: ['callLights', 'idle1'] },
    },
    caneJab: {
      name: 'CANE JAB',
      windupFrames: 14, activeFrames: 6, recoveryFrames: 22,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 11],
      starWindow: null,
      sfx: { tell: 'whip', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    lionTamer: {
      name: 'LION TAMER',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 26,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 13],
      starWindow: null,
      sfx: { tell: 'drumroll', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    rollUp: {
      name: 'ROLL UP',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 26,
      damage: 15,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [4, 13],
      starWindow: null,
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    bigTop: {
      name: 'BIG TOP',
      windupFrames: 20, activeFrames: 10, recoveryFrames: 40,
      damage: 19,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 17],
      starWindow: [6, 13],
      sfx: { tell: 'fanfare', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 5, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    encore1: {
      name: 'ENCORE',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 6,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 13],
      starWindow: null,
      sfx: { tell: 'chime', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    encore2: {
      name: 'ENCORE (2)',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 32,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    grandFinale: {
      name: 'GRAND FINALE',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 44,
      damage: 22,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 19],
      starWindow: [6, 14],
      kdWindow: [15, 18],  // perfect hit
      sfx: { tell: 'ding', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'overture', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'caneJab' }, { idle: 40 }, { move: 'callLights' }, { idle: 30 },
        { move: 'lionTamer' }, { idle: 36 }, { move: 'rollUp' }, { idle: 36 }, { move: 'bigTop' }, { idle: 40 },
        { move: 'encore1' }, { move: 'encore2' }, { idle: 40 }, { move: 'grandFinale' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'centerRing', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'callLights' }, { idle: 24 }, { move: 'rollUp' }, { idle: 30 }, { move: 'caneJab' },
        { idle: 30 }, { move: 'grandFinale' }, { idle: 40 }, { move: 'lionTamer' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'mainAct', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'callLights' }, { idle: 16 }, { move: 'encore1' }, { move: 'encore2' }, { idle: 24 },
        { move: 'caneJab' }, { idle: 16 }, { move: 'rollUp' }, { idle: 24 }, { move: 'bigTop' }, { idle: 30 },
        { move: 'grandFinale' }, { idle: 30 }, { move: 'lionTamer' }, { idle: 36 }, { taunt: 44 },
      ],
    },
    {
      id: 'showStopper', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'grandFinale' }, { idle: 24 }, { move: 'callLights' }, { idle: 16 }, { move: 'lionTamer' },
        { idle: 20 }, { move: 'rollUp' }, { idle: 16 }, { move: 'caneJab' }, { idle: 30 }, { move: 'encore1' }, { move: 'encore2' },
        { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'finalBow', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 24 }, { move: 'callLights' }, { idle: 12 }, { move: 'bigTop' }, { idle: 20 }, { move: 'encore1' }, { move: 'encore2' },
        { idle: 16 }, { move: 'grandFinale' }, { idle: 20 }, { move: 'callLights' }, { idle: 12 }, { move: 'rollUp' },
        { idle: 14 }, { move: 'caneJab' }, { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'grandFinale', golden: 'windup', taunt: 44, shout: 'THE GRAND FINALE!', times: [1, 2] },

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
      id: 'ownSpotlight', type: 'environment', name: 'HIS OWN SPOTLIGHT',
      trigger: { state: ['idle', 'windup', 'recovery', 'block'], height: 'high', since: { event: 'spotOn', frames: [0, 24] }, clean: 20 },
      effect: { stun: 80, hits: 6, say: 'BLINDED BY HIS OWN LIGHT!' },
      hint: { kind: 'visual', text: 'THE SPOTLIGHT BLINDS HIM TOO AS IT COMES ON.' },
      scout: 'A HEAD SHOT IN THE FIRST MOMENT THE SPOTLIGHT COMES ON: STUNNED FOR 6 HITS.',
    },
    {
      id: 'noEncore', type: 'patternBreak', name: 'NO ENCORE',
      trigger: { state: 'windup', move: 'encore1', counter: true },
      effect: { cancelMoves: ['encore2'], star: true, say: 'NO ENCORE!' },
      hint: { kind: 'audio', text: 'A CHIME MEANS TWO HOOKS.' },
      scout: 'COUNTER THE FIRST ENCORE HOOK: NO SECOND HOOK, AND A STAR.',
    },
    {
      id: 'finalBow', type: 'instantKd', name: 'THE FINAL BOW',
      trigger: { state: 'open', open: 'bow', star: true },
      effect: { knockdown: true, say: 'CURTAIN!' },
      hint: { kind: 'trainer', text: 'HE TAKES A BOW WITH 20 SECONDS LEFT.', hidden: true },
      scout: 'AT 0:20 IN EVERY ROUND HE TAKES A BOW: A STAR PUNCH THAT LANDS DURING IT IS AN INSTANT KNOCKDOWN.',
    },
  ],
  antiStrategies: [
    {
      id: 'encore', type: 'comboRepeat', name: 'ENCORE!', gap: 45, counter: ['encore1', 'encore2'], say: 'ENCORE!',
      scout: 'REPEAT A COMBO AND THE CROWD CALLS FOR AN ENCORE: HE CATCHES IT AND THROWS TWO HOOKS BACK.',
    },
    {
      id: 'showGoesOn', type: 'getUpMash', name: 'THE SHOW MUST GO ON', response: 'moves', moves: ['callLights'], say: 'THE SHOW MUST GO ON!',
      scout: 'WHEN YOU MASH BACK UP AFTER A KNOCKDOWN, HE CALLS THE SPOTLIGHT STRAIGHT AWAY.',
    },
  ],
  scriptedMoments: [
    { id: 'finalAct', name: 'THE FINAL ACT', when: { left: 20 }, say: 'REX TAKES A BOW...', steps: [{ open: 40, anim: 'bow', id: 'bow', comboLimit: 4 }] },
    { id: 'threeRings', name: 'THREE-RING CIRCUS', when: { health: 0.5 }, say: 'THE THREE-RING CIRCUS!', steps: [{ move: 'callLights' }, { idle: 20 }, { move: 'bigTop' }, { idle: 24 }, { move: 'bigTop' }] },
  ],
  special: [{ type: 'spotlight', trigger: 'callLights', frames: 360 }],
  // Title Defense remix: the farewell tour.
  titleDefense: {
    nickname: 'THE FAREWELL TOUR',
    quote: 'LADIES AND GENTLEMEN... ONE NIGHT ONLY... AGAIN!',
    lines: { win: 'AND THAT, FOLKS, IS SHOW BUSINESS!', lose: 'THE SHOW... MUST... GO... OFF...' },
    tell: 0.8,
    costume: { B: { coatHi: [10, 26, 12], coat: [4, 17, 7], coatDk: [2, 9, 4] } },
    moves: {
      // new: a leaping left uppercut (slip it)
      lionLeap: {
        name: 'LION\'S LEAP',
        windupFrames: 16, activeFrames: 8, recoveryFrames: 32,
        damage: 16,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [4, 13],
        starWindow: [6, 10],
        punishStar: ['dodged'],
        sfx: { tell: 'roar', swing: 'swingHeavy' },
        animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
      },
      // new: the ring of fire: a sweep all the way across (duck it)
      ringOfFire: {
        name: 'RING OF FIRE',
        windupFrames: 18, activeFrames: 10, recoveryFrames: 30,
        damage: 15,
        avoidBy: ['duck'],
        counterWindow: [4, 15],
        starWindow: null,
        sfx: { tell: 'whoosh', swing: 'swingHeavy' },
        animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'encoreTour', weight: 3,
        when: { rounds: [1], health: [0.5, 1] },
        steps: [
          { idle: 46 }, { move: 'caneJab' }, { idle: 36 }, { move: 'lionLeap' }, { idle: 36 }, { move: 'callLights' },
          { idle: 28 }, { move: 'ringOfFire' }, { idle: 40 }, { move: 'rollUp' }, { idle: 36 }, { move: 'grandFinale' },
          { idle: 46 }, { taunt: 56 },
        ],
      },
      {
        id: 'lastNight', weight: 3,
        when: { rounds: [2, 3] },
        steps: [
          { idle: 32 }, { move: 'callLights' }, { idle: 16 }, { move: 'ringOfFire' }, { idle: 30 }, { move: 'encore1' }, { move: 'encore2' },
          { idle: 24 }, { move: 'lionLeap' }, { idle: 24 }, { move: 'bigTop' }, { idle: 28 }, { move: 'grandFinale' },
          { idle: 34 }, { taunt: 40 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE RINGMASTER AND CARNIVAL CHAMPION. HE CALLS FOR THE SPOTLIGHTS, AND THEY NEVER POINT AT HIM.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'FINISH HIM WITH A STAR PUNCH.', check: 'starFinish' } },
  music: 'rexEntrance',
};
