// #29 Maestro Vale — World Circuit champion. The fight is his symphony.
// He conducts his own tempo: every 30 seconds the music of his punches speeds
// up (the marking under the clock goes ANDANTE, MODERATO, ALLEGRO, VIVACE,
// PRESTO, PRESTISSIMO). Windups, recoveries and even the pauses between his
// moves get shorter. Each round starts one tempo faster than the last.
// Knock him down early, while the music is slow.
// His Crescendo is three punches that each come faster than the one before:
// slip, slip, slip. Fortissimo is his finale, both gloves raised like he's
// cueing the whole orchestra: a one-hit knockdown. Slip it, or counter it on the
// glint and bring the curtain down on him.

export default {
  id: 'maestro',
  name: 'MAESTRO VALE',
  short: 'MAESTRO',
  nickname: 'THE CONDUCTOR',
  circuit: 'world',
  rank: 0,
  isChampion: true,
  card: {
    age: 52,
    weight: 158,
    record: '41-2 29KO',
    hometown: 'THE GRAND OPERA HOUSE',
    quote: 'KEEP UP, IF YOU CAN. THE TEMPO ONLY RISES.',
  },
  lines: {
    win: 'BRAVO. BRAVISSIMO. NOW, THE CODA: YOU, ON THE FLOOR.',
    lose: 'THE... FINAL... REST...',
  },

  build: 'lean',
  palette: 'maestro',
  spriteLayers: 'maestro',

  stats: {
    health: 220,
    damageMult: 1.4,
    stunResistance: 4,
    heartDrainOnBlock: 2,
    starLossChance: 0.5,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 46,
    hitstun: 12,
    betweenRoundHeal: 0.22,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 20 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['conduct1', 'conduct2'], rate: 10 },
    victory: ['bow'],
  },

  moves: {
    staccato: {
      name: 'STACCATO',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 22,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 9],
      starWindow: null,
      sfx: { tell: 'baton', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    legato: {
      name: 'LEGATO',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 26,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [3, 11],
      starWindow: null,
      sfx: { tell: 'baton', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    pizzicato: {
      name: 'PIZZICATO',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 24,
      damage: 14,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [3, 11],
      starWindow: null,
      sfx: { tell: 'tick', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // Crescendo: three punches, each faster than the last
    cresc1: {
      name: 'CRESCENDO',
      windupFrames: 14, activeFrames: 6, recoveryFrames: 4,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 11],
      starWindow: [3, 5],
      cancels: 2,
      sfx: { tell: 'cymbal', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jab'] },
    },
    cresc2: {
      name: 'CRESCENDO (2)',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 4,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabR'] },
    },
    cresc3: {
      name: 'CRESCENDO (3)',
      windupFrames: 10, activeFrames: 8, recoveryFrames: 34,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null,
      noFake: true,
      punishStar: ['dodged'],
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // the finale: a one-hit knockdown
    fortissimo: {
      name: 'FORTISSIMO',
      knockdown: true,
      windupFrames: 24, activeFrames: 10, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 20],
      starWindow: [5, 11],
      kdWindow: [14, 17],  // perfect hit
      noFake: true,
      sfx: { tell: 'cymbal', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 8, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'overture', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'staccato' }, { idle: 40 }, { move: 'legato' }, { idle: 40 }, { move: 'pizzicato' },
        { idle: 40 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' }, { idle: 44 }, { move: 'fortissimo' },
        { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'adagio', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 56 }, { move: 'legato' }, { idle: 36 }, { move: 'staccato' }, { idle: 30 }, { move: 'staccato' },
        { idle: 40 }, { move: 'pizzicato' }, { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'scherzo', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' }, { idle: 30 }, { move: 'pizzicato' },
        { idle: 24 }, { move: 'fortissimo' }, { idle: 30 }, { move: 'staccato' }, { idle: 20 }, { move: 'legato' },
        { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'rondo', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 34 }, { move: 'legato' }, { idle: 24 }, { move: 'pizzicato' }, { idle: 24 }, { move: 'staccato' },
        { idle: 24 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' }, { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'finale', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 26 }, { move: 'fortissimo' }, { idle: 24 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' },
        { idle: 20 }, { move: 'legato' }, { idle: 16 }, { move: 'pizzicato' }, { idle: 20 }, { move: 'fortissimo' },
        { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { move: 'fortissimo', golden: 'recovery', window: [32, 37], hit: 'star', from: 'curtainCall', taunt: 40, shout: 'FORTISSIMO!', times: [1, 2] },

  getUpTable: [
    { upAt: [7, 9], health: 0.6 },
    { upAt: [8, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.25, health: 0.45 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // A champion (K4): 3 exploits, 2 anti-strategies, 2 scripted moments.
  exploits: [
    {
      id: 'cutOff', type: 'patternBreak', name: 'CUT OFF',
      trigger: { state: 'windup', move: 'cresc1', counter: true },
      effect: { cancelMoves: ['cresc2', 'cresc3'], stun: 90, hits: 8, say: 'CUT OFF MID-PHRASE!', sfx: 'cymbal' },
      hint: { kind: 'audio', text: 'THE CRESCENDO ALWAYS STARTS SOFT.' },
      scout: 'COUNTER THE FIRST PUNCH OF THE CRESCENDO: NO SECOND OR THIRD, AND 8 FREE HITS.',
    },
    {
      id: 'pluckedAir', type: 'quirk', name: 'PLUCKED AIR',
      trigger: { on: 'resolved', move: 'pizzicato', result: 'blocked' },
      effect: { open: { frames: 60, anim: 'stunned', comboLimit: 4 }, say: 'HE PLUCKS AIR!', sfx: 'baton' },
      hint: { kind: 'trainer', text: 'PIZZICATO MEANS PLUCKED: BLOCK IT.' },
      scout: 'BLOCK THE PIZZICATO: HE LOSES HIS PLACE AND IS OPEN FOR 4 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'daCapo', type: 'comboRepeat', name: 'DA CAPO', gap: 45, counter: ['cresc1', 'cresc2', 'cresc3'], say: 'DA CAPO!',
      scout: 'REPEAT A COMBO AND HE CALLS DA CAPO: FROM THE TOP, A FULL CRESCENDO BACK AT YOU.',
    },
    {
      id: 'rubato', type: 'earlyDodge', name: 'RUBATO', response: 'hold', moves: ['legato'], say: 'RUBATO!',
      scout: 'SLIP THE LEGATO TOO EARLY AND HE HOLDS THE NOTE UNTIL YOUR SLIP RUNS OUT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'doubleCrescendo', name: 'DOUBLE CRESCENDO', when: { left: 90 }, say: 'ENCORE, MAESTRO!',
      steps: [{ idle: 20 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' }, { idle: 30 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' }],
    },
    { id: 'finalMovement', name: 'FINAL MOVEMENT', when: { health: 0.35 }, say: 'THE FINAL MOVEMENT!', steps: [{ idle: 20 }, { move: 'fortissimo' }] },
  ],
  special: [{
    type: 'tempo', every: 24, minWindup: 9, roundStep: 1, // every 24 real seconds (a minute on the clock)
    scales: [1, 0.92, 0.85, 0.79, 0.74, 0.7],
    names: ['ANDANTE', 'MODERATO', 'ALLEGRO', 'VIVACE', 'PRESTO', 'PRESTISSIMO'],
  }],
  // Title Defense remix: the encore.
  titleDefense: {
    nickname: 'DA CAPO',
    quote: 'FROM THE TOP. AND THIS TIME, CON FUOCO.',
    lines: { win: 'BRAVISSIMO. FOR ME.', lose: 'THE... FINAL... MOVEMENT...' },
    tell: 0.85,
    costume: { B: { coatHi: [26, 26, 28], coat: [20, 20, 23], coatDk: [11, 11, 14], satinHi: [30, 24, 12], satin: [24, 16, 5] } },
    moves: {
      // new: the accent: a right uppercut on the downbeat (slip it, punish for a star)
      sforzando: {
        name: 'SFORZANDO',
        windupFrames: 14, activeFrames: 8, recoveryFrames: 34,
        damage: 17,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [3, 11],
        starWindow: [3, 6],
        punishStar: ['dodged'],
        sfx: { tell: 'ding', swing: 'swingHeavy' },
        animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
      },
      // new: tremolo, two hooks: from his left, then his right. Slip right, slip left.
      trem1: {
        name: 'TREMOLO',
        windupFrames: 14, activeFrames: 6, recoveryFrames: 4,
        damage: 13,
        avoidBy: ['dodgeR'],
        counterWindow: [3, 11],
        starWindow: null,
        cancels: 1,
        sfx: { tell: 'glass', swing: 'whiff' },
        animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
      },
      trem2: {
        name: 'TREMOLO (2)',
        windupFrames: 12, activeFrames: 6, recoveryFrames: 32,
        damage: 14,
        avoidBy: ['dodgeL'],
        counterWindow: null,
        starWindow: null,
        noFake: true,
        punishStar: ['dodged'],
        sfx: { swing: 'swingHeavy' },
        animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'daCapo', weight: 3,
        when: { rounds: [1], health: [0.5, 1] },
        steps: [
          { idle: 46 }, { move: 'staccato' }, { idle: 36 }, { move: 'sforzando' }, { idle: 36 }, { move: 'trem1' }, { move: 'trem2' },
          { idle: 36 }, { move: 'pizzicato' }, { idle: 36 }, { move: 'fortissimo' }, { idle: 46 }, { taunt: 48 },
        ],
      },
      {
        id: 'conFuoco', weight: 3,
        when: { rounds: [2, 3] },
        steps: [
          { idle: 32 }, { move: 'trem1' }, { move: 'trem2' }, { idle: 26 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' },
          { idle: 26 }, { move: 'sforzando' }, { idle: 24 }, { move: 'fortissimo' }, { idle: 34 }, { taunt: 40 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE WORLD CHAMPION CONDUCTS HIS FIGHTS. EVERY TWENTY-FOUR SECONDS THE TEMPO GOES UP.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'PUT HIM DOWN IN ROUND 1, BEFORE THE TEMPO CLIMBS.', check: 'kdInRound', round: 1 } },
  music: 'maestroEntrance',
};
