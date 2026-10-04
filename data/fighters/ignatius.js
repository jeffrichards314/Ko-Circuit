// #35 Iron Jaw Ignatius — Legends Circuit. Nobody has ever put him down with a
// fist. Jabs, hooks, counters: they all hurt him, but none of them can take his
// last point of health. The badge under the clock says IRON JAW. Wear him down
// until it says ROCKED! (35% health or less), and then a Star Punch drops him.
// That makes stars everything: he gives them up when you counter his Sledge,
// his Rivet Jab and the Iron Curtain early, and he's stingy about knocking them
// loose. When he sticks his jaw out ("RIGHT HERE, PAL!") you can tee off on him
// for free, and a Star Punch timed to the glint drops him no matter his health
// (perfect hit: the glint is timed for a Star Punch, not a jab).
// The Iron Curtain is his one-hit knockdown: both fists come down together.

export default {
  id: 'ignatius',
  name: 'IRON JAW IGNATIUS',
  short: 'IGNATIUS',
  nickname: 'THE ANVIL',
  circuit: 'legends',
  rank: 2,
  isChampion: false,
  card: {
    age: 39,
    weight: 262,
    record: '71-3 55KO',
    hometown: 'FOUNDRY ROW',
    quote: 'GO AHEAD. HIT ME. I\'LL WAIT.',
  },
  lines: {
    win: 'SEE? NOT A SCRATCH. WELL. A SCRATCH.',
    lose: 'THE JAW... HELD. THE LEGS... DIDN\'T.',
  },

  build: 'heavy',
  palette: 'ignatius',
  spriteLayers: 'ignatius',
  kdStar: true,

  stats: {
    health: 250,
    damageMult: 1.5,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.25,
    comboLimit: 3,
    stunComboLimit: 7,
    idleHitLimit: 1,
    idleGuard: 'low',
    stunFrames: 50,
    hitstun: 12,
    betweenRoundHeal: 0.18,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 28 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 18 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['jawOut1', 'jawOut2'], rate: 10 },
    victory: ['flex'],
  },

  moves: {
    rivetJab: {
      name: 'RIVET JAB',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 22,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 6],
      starWindow: [2, 3],
      sfx: { tell: 'clang', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    sledge: {
      name: 'SLEDGE',
      windupFrames: 10, activeFrames: 7, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 8],
      starWindow: [2, 4],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    anvil: {
      name: 'ANVIL',
      windupFrames: 9, activeFrames: 7, recoveryFrames: 22,
      damage: 15,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    girder: {
      name: 'GIRDER',
      windupFrames: 10, activeFrames: 7, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [2, 8],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    // one-hit knockdown
    ironCurtain: {
      name: 'IRON CURTAIN',
      knockdown: true,
      windupFrames: 18, activeFrames: 10, recoveryFrames: 46,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 15],
      starWindow: [3, 7],
      noFake: true,
      sfx: { tell: 'creakBig', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'foundry', weight: 3,
      steps: [
        { idle: 28 }, { move: 'rivetJab' }, { idle: 22 }, { move: 'sledge' }, { idle: 22 }, { move: 'anvil' },
        { idle: 22 }, { move: 'girder' }, { idle: 26 }, { taunt: 62 },
      ],
    },
    {
      id: 'curtain', weight: 2,
      steps: [
        { idle: 26 }, { move: 'anvil' }, { idle: 20 }, { move: 'ironCurtain' }, { idle: 24 }, { move: 'sledge' },
        { idle: 20 }, { move: 'rivetJab' }, { idle: 26 }, { taunt: 62 },
      ],
    },
    {
      id: 'smelter', weight: 2,
      when: { health: [0, 0.6] },
      steps: [
        { idle: 22 }, { move: 'girder' }, { idle: 18 }, { move: 'ironCurtain' }, { idle: 20 }, { move: 'rivetJab' },
        { idle: 18 }, { move: 'sledge' }, { idle: 20 }, { move: 'ironCurtain' }, { idle: 24 }, { taunt: 62 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'star', move: 'ironCurtain', golden: 'taunt', window: [36, 39], taunt: 48, shout: 'HIT ME!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'chinOnTheAnvil', type: 'stunTrigger', name: 'CHIN ON THE ANVIL',
      trigger: { state: 'windup', move: 'anvil', counter: true, height: 'high' },
      effect: { stun: 100, hits: 8, say: 'RIGHT ON THE CHIN!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'ON THE ANVIL HE LEADS WITH HIS CHIN.' },
      scout: 'A HEAD COUNTER ON THE ANVIL RINGS HIS BELL: STUNNED FOR 8 HITS.',
    },
    {
      id: 'curtainCaught', type: 'quirk', name: 'CURTAIN CAUGHT',
      trigger: { on: 'resolved', move: 'ironCurtain', result: 'dodged' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 7, star: [0, 30] }, say: 'THE CURTAIN CAUGHT ON HIS BELT!', sfx: 'clang' },
      hint: { kind: 'audio', text: 'THE IRON CURTAIN COMES DOWN LIKE A DROPPED GIRDER.' },
      scout: 'SLIP THE IRON CURTAIN: BOTH FISTS STICK IN THE CANVAS AND HE\'S OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'starTax', type: 'starHoard', name: 'STAR TAX', hold: 360, moves: ['sledge', 'rivetJab', 'girder'], say: 'STAR TAXED!',
      scout: 'SIT ON THREE STARS FOR 6 SECONDS AND HIS SLEDGE, RIVET JAB OR GIRDER TAKES ONE OFF YOU, EVEN BLOCKED.',
    },
  ],
  scriptedMoments: [
    {
      id: 'foundryWhistle', name: 'FOUNDRY WHISTLE', when: { left: 75 }, say: 'THE FOUNDRY WHISTLE BLOWS!',
      steps: [{ idle: 20 }, { move: 'sledge' }, { idle: 14 }, { move: 'girder' }, { idle: 14 }, { move: 'ironCurtain' }],
    },
  ],
  special: [{ type: 'ironJaw', rocked: 0.35 }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A JAW OF IRON. NOTHING PUTS HIM DOWN BUT A STAR PUNCH, AND EVEN THAT HAS TO BE EARNED.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { speed: 285, signature: { text: 'PUT HIM DOWN TWICE.', check: 'kdCount', n: 2 } },
  music: 'ignatiusWalkup', // his walk-up jingle (data/music/walkups.js)
};
