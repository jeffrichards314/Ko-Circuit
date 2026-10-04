// #25 The Baron — Continental Circuit champion. En garde.
// A fencer who boxes. He fights side-on from long range: his rear glove held
// high behind him, his lead glove out like a blade. His thrusts come from
// distance and fast. Worse, he PARRIES: throw a punch while he's on guard and
// he knocks it aside with a CLINK and fires a riposte straight back, instantly.
// The riposte can be slipped or ducked, and a clean slip of it earns a star on
// the first punch back. So don't jab at him. Counter him while he thrusts,
// punish him when a thrust misses, and make him pay after a riposte.
// The Fleche is his running lunge, a one-hit knockdown: slip it. Counter it on
// the glint and the Baron goes down.

export default {
  id: 'baron',
  name: 'THE BARON',
  short: 'BARON',
  nickname: 'THE DUELLIST',
  circuit: 'continental',
  rank: 0,
  isChampion: true,
  card: {
    age: 49,
    weight: 164,
    record: '44-1 20KO',
    hometown: 'CHATEAU DE LA GARDE',
    quote: 'YOU MAY TOUCH ME ONCE, PERHAPS. I WILL TOUCH YOU THRICE.',
  },
  lines: {
    win: 'TOUCHE. AND TOUCHE. AND TOUCHE.',
    lose: 'A... HIT... A VERY PALPABLE... HIT...',
  },

  build: 'lean',
  palette: 'baron',
  spriteLayers: 'baron',

  stats: {
    health: 210,
    damageMult: 1.3,
    stunResistance: 4,
    heartDrainOnBlock: 2,
    starLossChance: 0.5,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 48,
    hitstun: 12,
    betweenRoundHeal: 0.22,
  },

  anims: {
    idle: { frames: ['enGarde1', 'enGarde2'], rate: 20 },
    block: ['parryR'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['bow'],
    victory: ['salute'],
  },

  moves: {
    // the long straight: lead glove drawn back, then a full-length thrust
    thrust: {
      name: 'THRUST',
      windupFrames: 16, activeFrames: 6, recoveryFrames: 24,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 12],
      starWindow: null,
      sfx: { tell: 'engarde', swing: 'whiff' },
      animation: { windup: ['thrustTell'], active: ['thrust'], recovery: ['thrust', 'enGarde1'] },
    },
    // the double: thrust, recover a half-step, thrust again
    double1: {
      name: 'DOUBLE',
      windupFrames: 16, activeFrames: 6, recoveryFrames: 6,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 12],
      starWindow: null,
      cancels: 1,
      sfx: { tell: 'engarde', swing: 'whiff' },
      animation: { windup: ['thrustTell'], active: ['thrust'], recovery: ['thrust'] },
    },
    double2: {
      name: 'DOUBLE (2)',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 30,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { swing: 'whiff' },
      animation: { windup: ['thrustTell'], active: ['thrust'], recovery: ['thrust', 'enGarde1'] },
    },
    // the cut-over: the rear glove comes over the top
    coupe: {
      name: 'COUPE',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 28,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 14],
      starWindow: null,
      sfx: { tell: 'whip', swing: 'swingHeavy' },
      animation: { windup: ['coupeTell'], active: ['hook'], recovery: ['hookTell', 'enGarde1'] },
    },
    // low line: a thrust to the body
    basse: {
      name: 'LIGNE BASSE',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 26,
      damage: 14,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [4, 14],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'enGarde1'] },
    },
    // the answer to a parried punch: instant, but it can be slipped or ducked
    riposte: {
      name: 'RIPOSTE',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 34,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      punishStar: ['dodged', 'ducked'],
      sfx: { swing: 'whiff' },
      animation: { windup: ['thrustTell'], active: ['thrust'], recovery: ['thrust', 'enGarde1'] },
    },
    // the running lunge: a one-hit knockdown
    fleche: {
      name: 'FLECHE',
      knockdown: true,
      windupFrames: 30, activeFrames: 8, recoveryFrames: 46,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [6, 24],
      starWindow: [8, 16],
      kdWindow: [18, 21],  // perfect hit
      noFake: true,
      sfx: { tell: 'engarde', swing: 'swingHeavy' },
      animation: { windup: ['salute', 'flecheTell'], windupRate: 15, active: ['fleche'], recovery: ['fleche', 'enGarde1'] },
    },
  },

  patterns: [
    {
      id: 'premiere', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 56 }, { move: 'thrust' }, { idle: 44 }, { move: 'coupe' }, { idle: 44 }, { move: 'basse' },
        { idle: 44 }, { move: 'double1' }, { move: 'double2' }, { idle: 44 }, { move: 'fleche' }, { idle: 50 }, { taunt: 56 },
      ],
    },
    {
      id: 'seconde', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'double1' }, { move: 'double2' }, { idle: 40 }, { move: 'basse' }, { idle: 40 },
        { move: 'thrust' }, { idle: 36 }, { move: 'coupe' }, { idle: 50 }, { taunt: 56 },
      ],
    },
    {
      id: 'tierce', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'thrust' }, { idle: 24 }, { move: 'double1' }, { move: 'double2' }, { idle: 30 },
        { move: 'fleche' }, { idle: 34 }, { move: 'coupe' }, { idle: 24 }, { move: 'basse' }, { idle: 30 }, { move: 'thrust' },
        { idle: 40 }, { taunt: 44 },
      ],
    },
    {
      id: 'quarte', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'coupe' }, { idle: 26 }, { move: 'fleche' }, { idle: 30 }, { move: 'double1' }, { move: 'double2' },
        { idle: 26 }, { move: 'basse' }, { idle: 36 }, { taunt: 44 },
      ],
    },
    {
      id: 'derniere', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 26 }, { move: 'fleche' }, { idle: 24 }, { move: 'double1' }, { move: 'double2' }, { idle: 20 },
        { move: 'coupe' }, { idle: 18 }, { move: 'thrust' }, { idle: 20 }, { move: 'basse' }, { idle: 22 }, { move: 'fleche' },
        { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { move: 'fleche', golden: 'recovery', window: [32, 37], hit: 'star', from: 'ranThrough', taunt: 42, shout: 'EN GARDE!', times: [1, 2] },

  getUpTable: [
    { upAt: [6, 8], health: 0.6 },
    { upAt: [8, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // A champion (K4): 3 exploits, 2 anti-strategies, 2 scripted moments.
  exploits: [
    {
      id: 'leaningIn', type: 'stunTrigger', name: 'LEANING IN',
      trigger: { state: 'windup', move: 'basse', counter: true, height: 'high', side: 'R' },
      effect: { stun: 110, hits: 9, say: 'HE OVERREACHED!' },
      hint: { kind: 'visual', text: 'ON THE LOW LINE HIS HEAD DROPS INTO RANGE.' },
      scout: 'A RIGHT-HAND HEAD COUNTER ON THE LIGNE BASSE: STUNNED FOR 9 HITS.',
    },
    {
      id: 'doubleCut', type: 'patternBreak', name: 'CUT THE DOUBLE',
      trigger: { state: 'windup', move: 'double1', counter: true },
      effect: { cancelMoves: ['double2'], star: true, say: 'THE SECOND THRUST NEVER COMES!' },
      hint: { kind: 'audio', text: 'THE DOUBLE IS TWO THRUSTS, ONE RIGHT AFTER THE OTHER.' },
      scout: 'COUNTER THE FIRST THRUST OF THE DOUBLE: NO SECOND THRUST, AND A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'touche', type: 'comboRepeat', name: 'TOUCHE!', gap: 45, counter: ['riposte'], say: 'TOUCHE!',
      scout: 'REPEAT A COMBO AND HE READS IT, PARRIES THE SECOND AND RIPOSTES AT ONCE.',
    },
    {
      id: 'readsFootwork', type: 'dodgeBias', name: 'READS YOUR FOOTWORK', moves: ['coupe'], min: 5, share: 0.75, say: 'HE READ YOUR FEET!',
      scout: 'SLIP TO THE SAME SIDE OVER AND OVER AND THE COUPE COMES FROM THAT SIDE. WATCH WHICH GLOVE HE COCKS.',
    },
  ],
  scriptedMoments: [
    {
      id: 'enGardeMoment', name: 'EN GARDE!', when: { left: 60 }, say: 'EN GARDE!',
      steps: [{ idle: 20 }, { move: 'thrust' }, { idle: 16 }, { move: 'double1' }, { move: 'double2' }, { idle: 24 }, { move: 'fleche' }],
    },
    {
      id: 'dernier', name: 'DERNIERE TOUCHE', when: { health: 0.3 }, say: 'THE LAST TOUCH!',
      steps: [{ move: 'basse' }, { idle: 12 }, { move: 'coupe' }, { idle: 12 }, { move: 'double1' }, { move: 'double2' }],
    },
  ],
  special: [{ type: 'parry', move: 'riposte', states: ['idle', 'block', 'taunt'], poseL: 'parryL', poseR: 'parryR' }],
  // Title Defense remix: the second duel.
  titleDefense: {
    nickname: 'THE RETURN MATCH',
    quote: 'A GENTLEMAN ALWAYS GRANTS A RETURN MATCH. EN GARDE.',
    lines: { win: 'TOUCHE. AND TOUCHE AGAIN.', lose: 'I YIELD... WITH HONOUR...' },
    tell: 0.8,
    costume: { B: { jacket: [6, 6, 9], jacketSh: [3, 3, 5], jacketDk: [1, 1, 3] } },
    moves: {
      // new: binding the blade: a left uppercut (slip it)
      prise: {
        name: 'PRISE DE FER',
        windupFrames: 18, activeFrames: 8, recoveryFrames: 32,
        damage: 16,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [4, 14],
        starWindow: [4, 8],
        punishStar: ['dodged'],
        sfx: { tell: 'spurs', swing: 'swingHeavy' },
        animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'enGarde1'] },
      },
      // new: a low cut from his right, sweeping across: duck
      croise: {
        name: 'CROISE',
        windupFrames: 20, activeFrames: 10, recoveryFrames: 30,
        damage: 15,
        avoidBy: ['duck'],
        counterWindow: [4, 16],
        starWindow: null,
        sfx: { tell: 'glass', swing: 'swingHeavy' },
        animation: { windup: ['sweepLTell'], active: ['sweepL1', 'sweepL2'], recovery: ['sweepL2', 'enGarde1'] },
      },
    },
    patterns: [
      {
        id: 'reprise', weight: 3,
        when: { rounds: [1], health: [0.5, 1] },
        steps: [
          { idle: 50 }, { move: 'thrust' }, { idle: 40 }, { move: 'prise' }, { idle: 40 }, { move: 'croise' },
          { idle: 44 }, { move: 'double1' }, { move: 'double2' }, { idle: 40 }, { move: 'fleche' }, { idle: 50 }, { taunt: 56 },
        ],
      },
      {
        id: 'contreTemps', weight: 3,
        when: { rounds: [2, 3], health: [0.5, 1] },
        steps: [
          { idle: 36 }, { move: 'croise' }, { idle: 30 }, { move: 'coupe' }, { idle: 26 }, { move: 'prise' },
          { idle: 26 }, { move: 'basse' }, { idle: 26 }, { move: 'fleche' }, { idle: 34 }, { taunt: 44 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE CONTINENTAL CHAMPION, A FENCER IN BOXING GLOVES. PUNCH INTO HIS GUARD AND HE PARRIES AND RIPOSTES.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER GET PARRIED.', check: 'noCue', cue: '!parry' } },
  music: 'baronEntrance',
};
