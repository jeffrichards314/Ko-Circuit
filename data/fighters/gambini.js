// #6 The Great Gambini — Minor Circuit. Feints and the smoke-flash teleport.
// Real tricks sparkle on the glove and chime; feints are the same windup with
// no sparkle and no sound. Punch a feint and it's a free counter. Swing at him
// while he's just standing there and he vanishes in a puff of smoke, so the
// only openings are counters, feints, the recovery after a real trick, and his bow.

export default {
  id: 'gambini',
  name: 'THE GREAT GAMBINI',
  short: 'GAMBINI',
  nickname: 'THE MAGNIFICENT',
  circuit: 'minor',
  rank: 2,
  isChampion: false,
  card: {
    age: 44,
    weight: 151,
    record: '12-7 4KO',
    hometown: 'THE GRAND THEATRE',
    quote: 'PICK A CARD. ANY CARD. NOW WATCH IT DISAPPEAR... WITH YOUR TEETH.',
  },
  lines: {
    win: 'AND FOR MY NEXT TRICK... YOU VANISH!',
    lose: 'BUT... I SAWED YOU IN HALF!',
  },

  build: 'lean',
  palette: 'gambini',
  spriteLayers: 'gambini',

  stats: {
    health: 145,
    damageMult: 1.1,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.35,
    comboLimit: 3,
    stunComboLimit: 5,
    idleHitLimit: 1,
    idleGuard: 'none',
    stunFrames: 50,
    hitstun: 13,
    betweenRoundHeal: 0.2,
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
    taunt: ['bow'],
    victory: ['tada'],
  },

  moves: {
    // his super: the Grand Illusion. A tip of the hat, two passes of the wand, then the uppercut
    grandIllusion: {
      name: 'GRAND ILLUSION',
      windupFrames: 32, activeFrames: 8, recoveryFrames: 40,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [10, 29],
      starWindow: [12, 20],
      sfx: { tell: 'poof', swing: 'swingHeavy' },
      animation: { windup: ['hatTrickTell', 'abraTell1', 'abraTell2', 'abraTell1'], windupRate: 8, active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    presto: {
      name: 'PRESTO JAB',
      windupFrames: 26, activeFrames: 8, recoveryFrames: 24,
      damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [10, 23],
      starWindow: null,
      sfx: { tell: 'chime', swing: 'whiff' },
      animation: { windup: ['prestoTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    hatTrick: {
      name: 'HAT TRICK',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 30,
      damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [10, 27],
      starWindow: null,
      sfx: { tell: 'chime', swing: 'swingHeavy' },
      animation: { windup: ['hatTrickTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    abracadabra: {
      name: 'ABRACADABRA',
      windupFrames: 34, activeFrames: 8, recoveryFrames: 40,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [10, 31],
      starWindow: [14, 28],
      sfx: { tell: 'chime', swing: 'swingHeavy' },
      animation: { windup: ['abraTell1', 'abraTell2'], windupRate: 4, active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    // quick follow-ups after a feint (still sparkle + chime)
    prestoQuick: {
      name: 'PRESTO (QUICK)',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 26,
      damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [8, 17],
      starWindow: null,
      sfx: { tell: 'chime', swing: 'whiff' },
      animation: { windup: ['prestoTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    // his answer to a player who keeps swinging at him (the rushing anti-strategy): a jab
    // out of the smoke that snaps straight back, so slipping it buys you nothing but safety
    smokeJab: {
      name: 'PRESTO (FROM THE SMOKE)',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 2,
      damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [8, 17],
      starWindow: null,
      noFake: true,
      sfx: { tell: 'chime', swing: 'whiff' },
      animation: { windup: ['prestoTell'], active: ['jab'], recovery: ['idle1'] },
    },
    hatTrickQuick: {
      name: 'HAT TRICK (QUICK)',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 30,
      damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [8, 19],
      starWindow: null,
      sfx: { tell: 'chime', swing: 'swingHeavy' },
      animation: { windup: ['hatTrickTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // feints: the plain tell, no sparkle, no chime. Punch it for a free counter.
    feintJab: {
      name: 'FEINT (JAB)',
      feint: true,
      windupFrames: 26, activeFrames: 0, recoveryFrames: 8,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 25],
      starWindow: null,
      animation: { windup: ['jabTell'], active: ['jabTell'], recovery: ['idle1'] },
    },
    feintHook: {
      name: 'FEINT (HOOK)',
      feint: true,
      windupFrames: 30, activeFrames: 0, recoveryFrames: 8,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 29],
      starWindow: null,
      animation: { windup: ['hookTell'], active: ['hookTell'], recovery: ['idle1'] },
    },
  },

  patterns: [
    {
      id: 'openingAct', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 60 }, { move: 'presto' }, { idle: 50 }, { move: 'feintHook' }, { move: 'hatTrickQuick' },
        { idle: 50 }, { move: 'abracadabra' }, { idle: 50 }, { move: 'feintJab' }, { move: 'prestoQuick' },
        { idle: 60 }, { taunt: 60 },
      ],
    },
    {
      id: 'mainEvent', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 44 }, { move: 'feintJab' }, { move: 'feintHook' }, { move: 'hatTrickQuick' }, { idle: 36 },
        { move: 'abracadabra' }, { idle: 40 }, { move: 'presto' }, { idle: 30 }, { move: 'feintHook' },
        { move: 'prestoQuick' }, { idle: 40 }, { move: 'hatTrick' }, { idle: 50 }, { taunt: 44 },
      ],
    },
    {
      id: 'grandFinale', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 36 }, { move: 'feintHook' }, { move: 'abracadabra' }, { idle: 30 }, { move: 'feintJab' },
        { move: 'feintJab' }, { move: 'prestoQuick' }, { idle: 30 }, { move: 'hatTrick' }, { idle: 24 },
        { move: 'feintHook' }, { move: 'hatTrickQuick' }, { idle: 50 }, { taunt: 40 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'grandIllusion', golden: 'taunt', window: [12, 17], taunt: 48, shout: 'THE GRAND ILLUSION!', times: [1, 2] },

  getUpTable: [
    { upAt: [4, 6], health: 0.6 },
    { upAt: [6, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.5, health: 0.35 },
    { upAt: null },
  ],


  // perfect hit: one punch on exactly these frames of his taunt drops him

  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'nowYouSeeMe', type: 'bait', name: 'NOW YOU SEE ME',
      trigger: { state: 'vanish', frames: [24, 36], test: 'tpSide', clean: 24 },
      effect: { stun: 70, hits: 4, say: 'CAUGHT MID-TRICK!', sfx: 'poof' },
      hint: { kind: 'visual', text: 'THE SMOKE PUFFS UP ON THE SIDE HE COMES BACK FROM.' },
      scout: 'PUNCH WITH THE HAND ON THE SIDE HE REAPPEARS FROM, AS HE SLIDES BACK IN: STUNNED, 4 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'backFromSmoke', type: 'rushing', name: 'BACK FROM THE SMOKE', count: 3, span: 180, counter: 'smokeJab', say: 'PRESTO!',
      scout: 'KEEP SWINGING WHEN HE ISN\'T OPEN AND HE COMES OUT OF THE SMOKE WITH A QUICK JAB.',
    },
  ],
  special: [{ type: 'teleport', states: ['idle'], frames: 36, after: 12 }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A STAGE MAGICIAN WHO WENT PRO. HALF HIS PUNCHES ARE TRICKS, AND HE\'S GONE BEFORE YOU LAND ONE.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER MAKE HIM VANISH IN A PUFF OF SMOKE.', check: 'noCue', cue: '!teleport' } },
  music: 'gambiniWalkup', // his walk-up jingle (data/music/walkups.js)
};
