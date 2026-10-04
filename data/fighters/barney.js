// #1 Barney Buckets — Rookie Circuit. Teaches dodging.
// Slow mop-swing haymaker with a big arms-up windup (+ a squeaky rubber-glove
// audio tell). Counter him during the windup to earn a star.

export default {
  id: 'barney',
  name: 'BARNEY BUCKETS',
  nickname: 'THE MOP',
  circuit: 'rookie',
  rank: 3,
  isChampion: false,
  card: {
    age: 52,
    weight: 191,
    record: '4-17 1KO',
    hometown: 'EAST END',
    quote: 'I MOP UP MESSES FOR A LIVING, KID.',
  },
  lines: {
    win: 'SWEPT YOU RIGHT OUT, KID!',
    lose: 'GUESS I\'LL GO GET THE BIG MOP...',
  },

  build: 'medium',
  palette: 'barney',
  spriteLayers: 'barney',

  stats: {
    health: 100,
    damageMult: 1.0,
    stunResistance: 0,      // frames shaved off counter-stun
    heartDrainOnBlock: 1,   // hearts the player loses when Barney blocks a punch
    starLossChance: 0.34,   // chance a hit on the player knocks a star loose
    comboLimit: 4,          // hits in a row before he covers up (punish windows)
    stunComboLimit: 5,      // hits in a row while stunned by a counter
    idleHitLimit: 2,        // free body jabs while he's idle before he covers up
    idleGuard: 'high',      // in idle he guards his head; the body is open
    stunFrames: 60,
    hitstun: 14,
    betweenRoundHeal: 0.2,
  },

  // Per-state animations (template pose names).
  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 22 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 18 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['taunt'],
    victory: ['victory'],
  },

  moves: {
    jab: {
      name: 'JAB',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 22,
      damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [14, 27],
      starWindow: null,
      height: 'high',
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    hook: {
      name: 'PUSH-BROOM HOOK',
      windupFrames: 34, activeFrames: 8, recoveryFrames: 30,
      damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [16, 31],
      starWindow: null,
      height: 'high',
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    mopSwing: {
      name: 'MOP SWING',
      windupFrames: 46, activeFrames: 10, recoveryFrames: 54,
      damage: 17,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [12, 42],
      starWindow: [18, 36],
      kdWindow: [30, 33],  // perfect hit: a counter on exactly these frames drops him
      height: 'high',
      sfx: { tell: 'squeak', swing: 'swingHeavy' },
      animation: {
        windup: ['overheadTell1', 'overheadTell2'], windupHold: 12, windupRate: 5,
        active: ['overhead1', 'overhead2'],
        recovery: ['overheadRecover'],
      },
    },
  },

  // Fixed loops (Rookie). A pattern is eligible when its `when` matches; the
  // executor stays on a pattern until it stops matching at a step boundary.
  patterns: [
    {
      id: 'warmup', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 80 }, { move: 'jab' }, { idle: 60 }, { move: 'jab' },
        { idle: 70 }, { move: 'mopSwing' }, { idle: 60 },
        { move: 'hook' }, { idle: 50 }, { taunt: 70 },
      ],
    },
    {
      id: 'sweeping', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 60 }, { move: 'mopSwing' }, { idle: 45 }, { move: 'jab' },
        { idle: 30 }, { move: 'hook' }, { idle: 50 }, { taunt: 60 },
        { idle: 40 }, { move: 'jab' }, { idle: 20 }, { move: 'jab' },
      ],
    },
    {
      id: 'desperate', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 50 }, { move: 'mopSwing' }, { idle: 30 }, { move: 'mopSwing' },
        { idle: 50 }, { move: 'jab' }, { idle: 16 }, { move: 'hook' },
        { idle: 60 }, { taunt: 50 },
      ],
    },
  ],

  // Per knockdown in the fight: when he gets up (count) and how much health.
  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { move: 'mopSwing', golden: 'windup', hit: 'Lbody', from: 'bucketSlip', taunt: 50, shout: 'MOP BUCKET!', times: [1, 2] },

  getUpTable: [
    { upAt: [4, 6], health: 0.65 },
    { upAt: [6, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.5, health: 0.35 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // Rookie: one exploit, generous and obvious (the bucket is drawn by his feet): it is the golden moment of his super now (`from: 'bucketSlip'` above).
  exploits: [],
  antiStrategies: [],
  props: [{ type: 'bucket', golden: 'mopSwing', dx: 36 }],
  special: [],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE NIGHT JANITOR AT THE REC CENTER. HE SWEPT UNDER THE RING FOR TWENTY YEARS BEFORE HE CLIMBED INTO IT.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'COUNTER THE MOP SWING.', check: 'counterMove', move: 'mopSwing' } },
  music: 'barneyWalkup', // his walk-up jingle (data/music/walkups.js)
};
