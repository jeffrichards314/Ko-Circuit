// #4 Gus Grill — Rookie Circuit champion. The Rookie final exam.
// Mixes everything the circuit taught: slip the Spatula Flip, block the Grill
// Press, duck or slip the two-hook Order Up. When he's hurt he pulls a burger
// from his apron and eats it to heal (sizzle tell). Hit him while he's chewing:
// it earns a star, stops the healing and makes him choke (stunned).

export default {
  id: 'gus',
  name: 'GUS GRILL',
  short: 'GUS',
  nickname: 'SHORT ORDER',
  circuit: 'rookie',
  rank: 0,
  isChampion: true,
  card: {
    age: 39,
    weight: 262,
    record: '18-3 11KO',
    hometown: 'THE FOOD TRUCK',
    quote: 'ORDER UP! ONE KNUCKLE SANDWICH, EXTRA CRISPY.',
  },
  lines: {
    win: 'COME BACK HUNGRY, KID. KITCHEN\'S ALWAYS OPEN.',
    lose: 'I SHOULDA HAD THE SALAD...',
  },

  build: 'heavy',
  palette: 'gus',
  spriteLayers: 'gus',

  stats: {
    health: 130,
    damageMult: 1.1,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.4,
    comboLimit: 3,
    stunComboLimit: 5,
    idleHitLimit: 2,
    idleGuard: 'high',
    stunFrames: 54,
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
    taunt: { frames: ['belly', 'idle1'], rate: 20 },
    victory: ['flex'],
    // 154 frames: reach into the pocket, then bite / chew
    eat: { frames: ['eatReach', 'eatReach', 'eat1', 'eat2', 'eat1', 'eat2', 'eat1', 'eat2', 'eat1', 'eat2', 'eat2'], rate: 14 },
  },

  moves: {
    shortOrder: {
      name: 'SHORT ORDER',
      windupFrames: 28, activeFrames: 8, recoveryFrames: 22,
      damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [12, 25],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    spatulaFlip: {
      name: 'SPATULA FLIP',
      windupFrames: 36, activeFrames: 8, recoveryFrames: 40,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [12, 33],
      starWindow: [18, 30],
      kdWindow: [26, 29],  // perfect hit: a counter on exactly these frames drops him
      sfx: { tell: 'sizzle', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    grillPress: {
      name: 'GRILL PRESS',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 24,
      damage: 10,
      avoidBy: ['block', 'duck'],
      counterWindow: [12, 27],
      starWindow: null,
      sfx: { tell: 'whistle', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    orderUp1: {
      name: 'ORDER UP!',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 6,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [12, 27],
      starWindow: null,
      sfx: { tell: 'bikeBell', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hook'] },
    },
    orderUp2: {
      name: 'ORDER UP! (2)',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 36,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null,
      starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL', 'idle1'] },
    },
  },

  // Fixed loops. `snack` comes first so it takes over once he's hurt; the
  // burger is limited to two per fight, after which the step is skipped.
  patterns: [
    {
      id: 'snack', weight: 1,
      when: { health: [0, 0.55] },
      steps: [
        { idle: 50 },
        { open: 154, anim: 'eat', id: 'burger', limit: 2, heal: 0.3, star: [0, 154], interrupt: true, stunOnInterrupt: 50, sfx: 'sizzle', sfxLoop: 'chomp', sfxEvery: 28 },
        { idle: 40 }, { move: 'spatulaFlip' }, { idle: 40 }, { move: 'grillPress' },
        { idle: 22 }, { move: 'shortOrder' }, { idle: 40 }, { move: 'orderUp1' }, { move: 'orderUp2' },
        { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'lunchRush', weight: 1,
      when: { rounds: [1], health: [0.55, 1] },
      steps: [
        { idle: 70 }, { move: 'shortOrder' }, { idle: 50 }, { move: 'grillPress' },
        { idle: 50 }, { move: 'spatulaFlip' }, { idle: 60 },
        { move: 'orderUp1' }, { move: 'orderUp2' }, { idle: 60 }, { taunt: 60 },
      ],
    },
    {
      id: 'dinnerRush', weight: 1,
      when: { rounds: [2, 3], health: [0.55, 1] },
      steps: [
        { idle: 50 }, { move: 'grillPress' }, { idle: 24 }, { move: 'shortOrder' },
        { idle: 40 }, { move: 'orderUp1' }, { move: 'orderUp2' }, { idle: 40 },
        { move: 'spatulaFlip' }, { idle: 30 }, { move: 'grillPress' }, { idle: 20 }, { move: 'grillPress' },
        { idle: 50 }, { taunt: 50 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'spatulaFlip', golden: 'taunt', window: [18, 21], taunt: 48, shout: 'ORDER UP!', times: [1, 2] },

  getUpTable: [
    { upAt: [6, 8], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.35, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'wrongPipe', type: 'stunTrigger', name: 'DOWN THE WRONG PIPE',
      trigger: { state: 'open', open: 'eat', height: 'low' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 6, sfx: 'oof' }, flag: 'noOpen:eat', until: 'round', say: 'HE\'S CHOKING!' },
      hint: { kind: 'trainer', text: 'HIT HIM IN THE BELLY WHILE HE CHEWS.' },
      scout: 'A BODY SHOT WHILE HE EATS MAKES HIM CHOKE: 6 FREE HITS, AND NO MORE EATING THIS ROUND.',
    },
  ],
  // the Rookie champion's one mild anti-strategy
  antiStrategies: [
    {
      id: 'sneakSnack', type: 'passivity', name: 'SNEAKS A SNACK', mild: true,
      response: 'snack', frames: 360, limit: 1, say: 'SNACK BREAK!',
      step: { open: 60, anim: 'eat', id: 'snack', heal: 0.06, star: [0, 60], interrupt: true, stunOnInterrupt: 40, sfx: 'sizzle', sfxLoop: 'chomp', sfxEvery: 28 },
      scout: 'STAND AROUND FOR 6 SECONDS AND HE SNEAKS A QUICK BITE (ONCE A ROUND). HIT HIM MID-BITE!',
    },
  ],
  special: [],
  // Title Defense remix (see data/fighters/titleDefense.js): the lunch rush.
  titleDefense: {
    nickname: 'DOUBLE SHIFT',
    quote: 'KITCHEN\'S OPEN LATE TONIGHT, CHAMP. TWO NEW SPECIALS.',
    lines: { win: 'SEND IT BACK? SORRY, NO REFUNDS.', lose: 'EIGHTY-SIX THE BELT... WE\'RE ALL OUT...' },
    tell: 0.72,
    costume: { B: { apronHi: [14, 26, 31], apron: [5, 16, 28], apronSh: [2, 8, 17] } },
    moves: {
      // new: a left uppercut off a bite of the burger (slip it)
      hotPlate: {
        name: 'HOT PLATE',
        windupFrames: 30, activeFrames: 8, recoveryFrames: 32,
        damage: 12,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [12, 27],
        starWindow: [16, 24],
        punishStar: ['dodged'],
        sfx: { tell: 'chomp', swing: 'swingHeavy' },
        animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
      },
      // new: a low sweep across the fryer: only a duck gets under it
      deepFry: {
        name: 'DEEP FRYER',
        windupFrames: 32, activeFrames: 10, recoveryFrames: 34,
        damage: 12,
        avoidBy: ['duck'],
        counterWindow: [12, 29],
        starWindow: null,
        sfx: { tell: 'creak', swing: 'swingHeavy' },
        animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'bluePlate', weight: 1,
        when: { rounds: [1], health: [0.55, 1] },
        steps: [
          { idle: 60 }, { move: 'shortOrder' }, { idle: 44 }, { move: 'hotPlate' }, { idle: 50 }, { move: 'grillPress' },
          { idle: 44 }, { move: 'deepFry' }, { idle: 56 }, { move: 'spatulaFlip' }, { idle: 50 },
          { move: 'orderUp1' }, { move: 'orderUp2' }, { idle: 56 }, { taunt: 56 },
        ],
      },
      {
        id: 'lateShift', weight: 1,
        when: { rounds: [2, 3], health: [0.55, 1] },
        steps: [
          { idle: 44 }, { move: 'deepFry' }, { idle: 40 }, { move: 'orderUp1' }, { move: 'orderUp2' }, { idle: 36 },
          { move: 'hotPlate' }, { idle: 30 }, { move: 'grillPress' }, { idle: 24 }, { move: 'shortOrder' },
          { idle: 36 }, { move: 'spatulaFlip' }, { idle: 44 }, { taunt: 48 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'RUNS THE BEST FOOD TRUCK IN TOWN AND THE ROOKIE BELT. KEEPS A BURGER IN HIS APRON FOR EMERGENCIES.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER LET HIM FINISH HIS BURGER.', check: 'noOpenDone', id: 'burger' } },
  music: 'gusEntrance',
};
