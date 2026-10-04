// #33 Avalanche — Storm Circuit champion. It starts with one snowflake.
// Blocking him doesn't save you: every punch of his you block still knocks
// hearts out of you. Every punch of his that LANDS packs the snowball (the
// SNOW pips by the clock); at three, the mountain comes down: a rumbling roar
// and a five-punch Avalanche rush that can only be slipped, one after another,
// and the fifth leaves him wide open (the first shot back is a star). A
// knockdown, either way, or a new round, melts the snowball.
// Whiteout is his one-hit knockdown overhead: slip it, or counter it on the
// glint and bury him.

const rush = (n, side, last) => ({
  name: `AVALANCHE ${n}`,
  rush: true, noFake: true,
  windupFrames: n === 1 ? 14 : 10, activeFrames: 5, recoveryFrames: last ? 50 : 3,
  damage: 14,
  avoidBy: ['dodgeL', 'dodgeR'],
  counterWindow: null, starWindow: null,
  punishStar: last ? ['dodged'] : undefined,
  sfx: { swing: 'swingHeavy' },
  animation: side === 'R'
    ? { windup: ['hookTell'], active: ['hook'], recovery: last ? ['hookTell', 'overheadRecover', 'idle1'] : ['hook'] }
    : { windup: ['hookLTell'], active: ['hookL'], recovery: last ? ['hookLTell', 'overheadRecover', 'idle1'] : ['hookL'] },
});

export default {
  id: 'avalanche',
  name: 'AVALANCHE',
  short: 'AVALANCHE',
  nickname: 'THE MOUNTAIN',
  circuit: 'storm',
  rank: 0,
  isChampion: true,
  card: {
    age: 45,
    weight: 297,
    record: '46-2 40KO',
    hometown: 'THE HIGH PASS',
    quote: 'ONE LITTLE PUNCH. THEN ANOTHER. THEN THE WHOLE MOUNTAIN.',
  },
  lines: {
    win: 'BURIED. DIG YOURSELF OUT IN THE SPRING.',
    lose: 'THE... THAW... CAME EARLY...',
  },

  build: 'heavy',
  palette: 'avalanche',
  spriteLayers: 'avalanche',

  stats: {
    health: 240,
    damageMult: 1.5,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.6,
    comboLimit: 2,
    stunComboLimit: 5,
    idleHitLimit: 0,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.25,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 24 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['beatChest1', 'beatChest2'], rate: 8 },
    victory: ['flex'],
  },

  moves: {
    flurryJab: {
      name: 'FLURRY',
      windupFrames: 10, activeFrames: 6, recoveryFrames: 22,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { tell: 'crunch', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    drift: {
      name: 'SNOWDRIFT',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 26,
      damage: 17,
      avoidBy: ['dodgeL', 'dodgeR', 'duck', 'block'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    packed: {
      name: 'PACKED SNOW',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 24,
      damage: 16,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'crunch', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    cornice1: {
      name: 'CORNICE',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 4,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [2, 9],
      starWindow: null,
      cancels: 1,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    cornice2: {
      name: 'CORNICE (2)',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 32,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // the one-hit knockdown
    whiteout: {
      name: 'WHITEOUT',
      knockdown: true,
      windupFrames: 20, activeFrames: 10, recoveryFrames: 46,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 16],
      starWindow: [3, 5],
      kdWindow: [10, 13],  // perfect hit
      noFake: true,
      sfx: { tell: 'gust', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 7, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // the snowball's roar before the rush (queued by the avalanche modifier)
    rumble: {
      name: 'RUMBLE',
      feint: true, call: true, noFake: true,
      windupFrames: 30, activeFrames: 0, recoveryFrames: 4,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { tell: 'roar' },
      animation: { windup: ['beatChest1', 'beatChest2'], windupRate: 5, active: ['beatChest2'], recovery: ['crouchTell'] },
    },
    rush1: rush(1, 'R'), rush2: rush(2, 'L'), rush3: rush(3, 'R'), rush4: rush(4, 'L'), rush5: rush(5, 'R', true),
  },

  patterns: [
    {
      id: 'firstFlakes', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 44 }, { move: 'flurryJab' }, { idle: 34 }, { move: 'drift' }, { idle: 34 }, { move: 'packed' },
        { idle: 34 }, { move: 'cornice1' }, { move: 'cornice2' }, { idle: 34 }, { move: 'whiteout' }, { idle: 44 }, { taunt: 44 },
      ],
    },
    {
      id: 'snowfall', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'packed' }, { idle: 28 }, { move: 'flurryJab' }, { idle: 24 }, { move: 'drift' },
        { idle: 28 }, { move: 'flurryJab' }, { idle: 40 }, { taunt: 44 },
      ],
    },
    {
      id: 'blizzard', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 28 }, { move: 'drift' }, { idle: 18 }, { move: 'cornice1' }, { move: 'cornice2' }, { idle: 22 },
        { move: 'whiteout' }, { idle: 24 }, { move: 'packed' }, { idle: 16 }, { move: 'flurryJab' }, { idle: 30 }, { taunt: 36 },
      ],
    },
    {
      id: 'squall', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 26 }, { move: 'flurryJab' }, { idle: 14 }, { move: 'packed' }, { idle: 14 }, { move: 'drift' }, { idle: 18 },
        { move: 'flurryJab' }, { idle: 18 }, { move: 'cornice1' }, { move: 'cornice2' }, { idle: 30 }, { taunt: 36 },
      ],
    },
    {
      id: 'landslide', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 20 }, { move: 'whiteout' }, { idle: 20 }, { move: 'cornice1' }, { move: 'cornice2' }, { idle: 14 },
        { move: 'drift' }, { idle: 14 }, { move: 'packed' }, { idle: 16 }, { move: 'whiteout' }, { idle: 26 }, { taunt: 30 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'whiteout', golden: 'recovery', window: [12, 15], taunt: 40, shout: 'WHITEOUT!', times: [1, 2] },
  // more supers (super.js): each armored from its first frame to its last attack, each with one golden moment
  supers: [
    { key: 'avalancheRush', name: 'THE AVALANCHE', inline: true, move: 'rumble', then: ['rush1', 'rush2', 'rush3', 'rush4', 'rush5'], on: 'rush1', golden: 'windup', window: [0, 7], hit: 'star', from: 'avalancheStop' },
  ],

  getUpTable: [
    { upAt: [8, 9], health: 0.6 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.2, health: 0.45 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // A champion (K4): 3 exploits, 2 anti-strategies, 2 scripted moments.
  exploits: [
    {
      id: 'meltingPoint', type: 'quirk', name: 'MELTING POINT',
      trigger: { state: 'windup', move: 'packed', counter: true, height: 'low' },
      effect: { keep: true, mod: { snow: -3 }, say: 'THE SNOWBALL MELTS!', sfx: 'ice' },
      hint: { kind: 'visual', text: 'THE PACKED SNOW IS WET AND HEAVY: THE SNOW PIPS DIM WHEN YOU CATCH IT.' },
      scout: 'A BODY-SHOT COUNTER ON THE PACKED SNOW MELTS THE WHOLE SNOWBALL: ALL THE SNOW PIPS RESET.',
    },
    {
      id: 'spentAtTheBottom', type: 'quirk', name: 'SPENT AT THE BOTTOM',
      trigger: { on: 'resolved', move: 'rush5', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 8, star: [0, 40] }, say: 'THE AVALANCHE IS SPENT!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'THE FIFTH PUNCH IS THE LAST OF THE RUMBLE.', hidden: true },
      scout: 'SLIP THE FIFTH AND LAST PUNCH OF THE AVALANCHE: HE\'S SPENT AND OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'snowedUnder', type: 'getUpMash', name: 'SNOWED UNDER', response: 'harder', mult: 1.3, punches: 3, say: 'BURIED!',
      scout: 'MASH BACK UP AFTER HE DROPS YOU AND HIS NEXT THREE PUNCHES HIT HARDER.',
    },
    {
      id: 'driftLine', type: 'dodgeBias', name: 'THE DRIFT LINE', moves: ['drift'], min: 5, share: 0.75, say: 'THE SNOW DRIFTS YOUR WAY!',
      scout: 'SLIP TO THE SAME SIDE OVER AND OVER AND THE SNOWDRIFT PILES UP ON THAT SIDE. WATCH WHICH GLOVE HE DRAWS BACK.',
    },
  ],
  scriptedMoments: [
    { id: 'whiteoutRound', name: 'WHITEOUT ROUND', when: { left: 60 }, say: 'THE WHITEOUT ROLLS IN!', steps: [{ idle: 20 }, { move: 'whiteout' }] },
    {
      id: 'landslide', name: 'LANDSLIDE', when: { health: 0.35 }, say: 'HE CALLS DOWN THE MOUNTAIN!',
      steps: [{ move: 'rumble' }, { move: 'rush1' }, { move: 'rush2' }, { move: 'rush3' }, { move: 'rush4' }, { move: 'rush5' }],
    },
  ],
  special: [{ type: 'avalanche', blockCost: 2, hits: 3, rush: ['rumble', 'rush1', 'rush2', 'rush3', 'rush4', 'rush5'] }],
  // Title Defense remix: the deep freeze.
  titleDefense: {
    nickname: 'THE DEEP FREEZE',
    quote: 'THE SNOW DOESN\'T MELT UP HERE. NEITHER DO I.',
    lines: { win: 'BURIED. SEE YOU IN THE SPRING.', lose: 'THE THAW... COMES FOR US ALL...' },
    tell: 0.85,
    costume: { B: { knitHi: [12, 20, 31], knit: [5, 11, 24], knitDk: [2, 5, 13], lace: [8, 16, 30] } },
    moves: {
      // new: a left uppercut like falling ice (slip it, punish for a star)
      iceFall: {
        name: 'ICEFALL',
        windupFrames: 12, activeFrames: 8, recoveryFrames: 34,
        damage: 18,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [2, 9],
        starWindow: [2, 4],
        punishStar: ['dodged'],
        sfx: { tell: 'ice', swing: 'swingHeavy' },
        animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
      },
      // new: the slide, a low sweep (duck it)
      snowSlide: {
        name: 'SNOW SLIDE',
        windupFrames: 14, activeFrames: 10, recoveryFrames: 30,
        damage: 17,
        avoidBy: ['duck'],
        counterWindow: [2, 11],
        starWindow: null,
        sfx: { tell: 'splash', swing: 'swingHeavy' },
        animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'deepFreeze', weight: 3,
        when: { rounds: [1], health: [0.5, 1] },
        steps: [
          { idle: 40 }, { move: 'flurryJab' }, { idle: 32 }, { move: 'iceFall' }, { idle: 32 }, { move: 'snowSlide' },
          { idle: 36 }, { move: 'cornice1' }, { move: 'cornice2' }, { idle: 32 }, { move: 'whiteout' }, { idle: 40 }, { taunt: 44 },
        ],
      },
      {
        id: 'permafrost', weight: 3,
        when: { rounds: [2, 3] },
        steps: [
          { idle: 28 }, { move: 'snowSlide' }, { idle: 26 }, { move: 'drift' }, { idle: 18 }, { move: 'iceFall' },
          { idle: 22 }, { move: 'packed' }, { idle: 18 }, { move: 'whiteout' }, { idle: 30 }, { taunt: 36 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE STORM CHAMPION. LET HIM LAND THREE AND HE SNOWBALLS INTO A FIVE-HIT RUSH.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER RUN OUT OF HEARTS.', check: 'noPink' } },
  music: 'avalancheEntrance',
};
