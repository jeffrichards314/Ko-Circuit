// #50 Eclipse — Nightmare Circuit champion. Half his mask is the sun, half is
// the moon, and his gloves don't match: the sun glove gold, the moon glove
// black and silver. Remember which side is which.
// TOTALITY: he raises both arms into a ring over his head and the drone rises.
// Off to the side of the ring the moon slides over the sun and the count runs
// down (ECLIPSE 4, 3, 2, 1). When it lands, the whole ring flips left to right,
// and LEFT and RIGHT on your controller flip with it. The punch you slipped
// with LEFT a second ago now needs RIGHT. (Check his gloves: the gold one has
// changed sides.) The badge under the clock says MIRRORED until the next
// TOTALITY puts everything back. Punch him while he calls it and it never
// happens (early: a star). Every round starts in DAYLIGHT.
//   jab (anything)  |  moonfall hook (slip left or duck)  |  sunset hook (slip
//   right or duck)  |  umbra body (block, or slip right)  |  dawn uppercut (slip,
//   punish for a star)
// CORONA (sun and moon fists crossed, then raised and brought down) is his
// one-hit knockdown: slip it, or counter it on the glint and he goes down
// (perfect hit).

export default {
  id: 'eclipse',
  name: 'ECLIPSE',
  short: 'ECLIPSE',
  nickname: 'TOTALITY',
  circuit: 'nightmare',
  rank: 0,
  isChampion: true,
  card: {
    age: 33,
    weight: 176,
    record: '58-1 50KO',
    hometown: 'THE DARK SIDE',
    quote: 'WHEN THE SUN GOES OUT, EVERYTHING YOU KNOW GOES BACKWARDS.',
  },
  lines: {
    win: 'THE LIGHT NEVER COMES BACK FOR SOME.',
    lose: 'SO... THIS IS... DAWN...',
  },

  build: 'medium',
  palette: 'eclipse',
  spriteLayers: 'eclipse',

  stats: {
    health: 300,
    damageMult: 1.75,
    stunResistance: 6,
    heartDrainOnBlock: 3,
    starLossChance: 0.6,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.2,
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
    taunt: { frames: ['orbit1', 'orbit2'], rate: 12 },
    victory: ['victory'],
  },

  moves: {
    eJab: {
      name: 'SUNBEAM',
      windupFrames: 6, activeFrames: 5, recoveryFrames: 20,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 4],
      starWindow: null,
      sfx: { tell: 'chime', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    eHook: {
      name: 'MOONFALL',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 22,
      damage: 17,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    eHookL: {
      name: 'SUNSET',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 22,
      damage: 17,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    eBody: {
      name: 'UMBRA',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 22,
      damage: 16,
      height: 'low',
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    eUpper: {
      name: 'DAWN',
      windupFrames: 8, activeFrames: 7, recoveryFrames: 34,
      damage: 19,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 6],
      starWindow: [2, 4],
      punishStar: ['dodged'],
      sfx: { tell: 'chime', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    // the warning, and the flip (the eclipse modifier does the rest)
    totality: {
      name: 'TOTALITY',
      feint: true, call: true, noFake: true,
      windupFrames: 48, activeFrames: 0, recoveryFrames: 10,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 44],
      starWindow: [3, 12],
      animation: { windup: ['totality1', 'totality2'], windupRate: 12, active: ['totality2'], recovery: ['totality2', 'idle1'] },
    },
    // CORONA: the one-hit knockdown (and ZERO's echo of him)
    corona: {
      name: 'CORONA',
      knockdown: true,
      windupFrames: 14, activeFrames: 10, recoveryFrames: 44,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 11],
      starWindow: [3, 5],
      kdWindow: [7, 10],
      noFake: true,
      sfx: { tell: 'corona', swing: 'swingHeavy' },
      animation: { windup: ['coronaTell1', 'coronaTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'orbit', weight: 3,
      steps: [
        { idle: 26 }, { move: 'eJab' }, { idle: 22 }, { move: 'eHook' }, { idle: 22 }, { move: 'eBody' },
        { idle: 22 }, { move: 'eHookL' }, { idle: 22 }, { move: 'eUpper' }, { idle: 28 }, { taunt: 30 },
      ],
    },
    {
      // after the flip he gives you a beat to find your feet
      id: 'totality', weight: 3, fixed: true,
      steps: [
        { idle: 24 }, { move: 'totality' }, { idle: 40 }, { move: 'eJab' }, { idle: 22 }, { move: 'eHookL' },
        { idle: 22 }, { move: 'eHook' }, { idle: 28 },
      ],
    },
    {
      id: 'corona', weight: 2,
      steps: [
        { idle: 24 }, { move: 'eHookL' }, { idle: 20 }, { move: 'corona' }, { idle: 26 }, { move: 'eBody' },
        { idle: 22 }, { move: 'eJab' }, { idle: 26 }, { taunt: 30 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { move: 'corona', golden: 'recovery', window: [32, 37], hit: 'star', from: 'totalCorona', taunt: 34, shout: 'TOTAL ECLIPSE!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.25, health: 0.4 },
    { upAt: null },
  ],


  special: [{ type: 'eclipse', call: 'totality', tick: 12, flash: 18 }],
  // Title Defense remix: the annular eclipse.
  titleDefense: {
    nickname: 'THE RING OF FIRE',
    quote: 'EVERY ECLIPSE ENDS. THIS ONE ENDS WITH YOU.',
    lines: { win: 'DARKNESS, AT NOON.', lose: 'THE LIGHT... RETURNS...' },
    tell: 0.85,
    costume: { B: { trunkHi: [30, 14, 6], trunk: [22, 6, 2], trunkDk: [11, 3, 1] } },
    moves: {
      // new: the penumbra, a low sweep (duck it: no side to slip, flipped or not)
      penumbra: {
        name: 'PENUMBRA',
        windupFrames: 7, activeFrames: 9, recoveryFrames: 28,
        damage: 17,
        avoidBy: ['duck'],
        counterWindow: [2, 5],
        starWindow: null,
        sfx: { tell: 'whisper', swing: 'swingHeavy' },
        animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
      },
      // new: a left uppercut (slip it, punish for a star)
      antumbra: {
        name: 'ANTUMBRA',
        windupFrames: 8, activeFrames: 7, recoveryFrames: 34,
        damage: 19,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [2, 6],
        starWindow: [2, 4],
        punishStar: ['dodged'],
        sfx: { tell: 'glass', swing: 'swingHeavy' },
        animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'annular', weight: 3,
        steps: [
          { idle: 24 }, { move: 'eJab' }, { idle: 20 }, { move: 'penumbra' }, { idle: 22 }, { move: 'antumbra' },
          { idle: 20 }, { move: 'eHookL' }, { idle: 20 }, { move: 'corona' }, { idle: 26 }, { taunt: 30 },
        ],
      },
      {
        id: 'totality2', weight: 2, fixed: true,
        steps: [
          { idle: 24 }, { move: 'totality' }, { idle: 40 }, { move: 'penumbra' }, { idle: 22 }, { move: 'antumbra' },
          { idle: 22 }, { move: 'eBody' }, { idle: 28 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  exploits: [
    {
      id: 'umbraOpen', type: 'stunTrigger', name: 'INTO THE SHADOW',
      trigger: { state: 'windup', move: 'eBody', counter: true, height: 'low', frames: [3, 5] },
      effect: { stun: 108, hits: 8, say: 'INTO THE SHADOW!', sfx: 'glass' },
      hint: { kind: 'visual', text: 'HIS BODY SHOT LEAVES THE MOON SIDE OF HIS MASK OPEN.' },
      scout: 'A BODY COUNTER ON THE UMBRA STUNS HIM FOR 8 HITS.',
    },
    {
      id: 'moonfallMisses', type: 'patternBreak', name: 'MOONFALL MISSES',
      trigger: { state: 'windup', move: 'eHook', counter: true, height: 'high', frames: [2, 5] },
      effect: { cancel: 2, star: true, say: 'SNUFFED OUT!' },
      hint: { kind: 'audio', text: 'THE MOONFALL GRUNT COMES BEFORE HIS NEXT SHOT: CUT IT OFF.' },
      scout: 'COUNTER HIS MOONFALL HOOK: HIS NEXT PUNCH IS CANCELLED AND YOU GET A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'moonEatsLight', type: 'starHoard', name: 'THE MOON EATS THE LIGHT', hold: 420, moves: ['eJab', 'eHook', 'eHookL', 'eUpper'], say: 'ECLIPSED!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT SUNBEAM, MOONFALL, SUNSET OR DAWN TAKES ONE, EVEN BLOCKED.',
    },
    {
      id: 'cycleRepeats', type: 'comboRepeat', name: 'THE CYCLE REPEATS', gap: 45, delay: 14, counter: ['eJab', 'eHookL'], say: 'THE CYCLE REPEATS!',
      scout: 'REPEAT A COMBO AND HE HAS SEEN THIS SKY BEFORE: HE PARRIES THE SECOND AND ANSWERS WITH A JAB AND A SUNSET.',
    },
  ],
  scriptedMoments: [
    {
      id: 'fullEclipse', name: 'FULL ECLIPSE', when: { left: 90 }, say: 'TOTALITY!',
      steps: [{ idle: 20 }, { move: 'totality' }, { idle: 40 }, { move: 'eJab' }, { idle: 14 }, { move: 'eHookL' }],
    },
    {
      id: 'eclipseEnds', name: 'THE CORONA RISES', when: { health: 0.35 }, say: 'THE CORONA RISES!',
      steps: [{ idle: 20 }, { move: 'eHook' }, { idle: 14 }, { move: 'eHookL' }, { idle: 16 }, { move: 'corona' }],
    },
  ],
  gallery: 'THE NIGHTMARE CHAMPION FLIPS THE WHOLE WORLD MID-ROUND, AND YOUR CONTROLS WITH IT.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'DROP HIM WITH A PERFECT HIT.', check: 'kdBy', by: 'perfect' } },
  music: 'eclipseEntrance',
};
