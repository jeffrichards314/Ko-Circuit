// #53 Brother Ember — Pantheon I, the Gate of Dawn. The lamp keeper. Before every
// attack his lantern gutters and dims to a coal (a hiss, and the glow drops): that's
// the tell. And the ring's own light follows the fight: it starts dim, and every
// punch you land brightens it (a counter more), fading again if you go quiet. In the
// dark his body is hard to read; a player who keeps hitting him sees him best.
// Being aggressive is the answer, but not a masher's aggression: swinging into his
// guard doesn't light the ring, only punches that land do.
// His super is FLASHFIRE: he hoists the lantern and taunts up close, then lets the
// flame loose. A knockdown: slip it. Hit him while he holds the lantern up and he
// drops (the golden chance is the taunt itself).
// Pantheon I difficulty: 6-frame tells, shuffled and adaptive, hearts 12.

const W = 7;
const dim = { cue: 'dim' };

export default {
  id: 'ember',
  name: 'BROTHER EMBER',
  short: 'EMBER',
  nickname: 'THE LAMP KEEPER',
  circuit: 'p1',
  rank: 1,
  isChampion: false,
  card: {
    age: 44,
    weight: 218,
    record: '28-1 17KO',
    hometown: 'THE GATE OF DAWN',
    quote: 'A LAMP\'S ONLY AS BRIGHT AS THE HAND THAT FEEDS IT, FRIEND.',
  },
  lines: {
    win: 'THE LAMP STAYS LIT.',
    lose: 'THE... LIGHT... WENT OUT...',
  },

  build: 'medium',
  palette: 'ember',
  spriteLayers: 'ember',

  stats: {
    health: 270,
    damageMult: 1.75,
    stunResistance: 4,
    heartDrainOnBlock: 3,
    starLossChance: 0.55,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 11,
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
    taunt: ['raise'],
    victory: ['victory'],
  },

  moves: {
    wickJab: {
      name: 'WICK JAB', ...dim,
      windupFrames: W, activeFrames: 6, recoveryFrames: 20,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1],
      starWindow: null,
      sfx: { tell: 'wick', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    emberHook: {
      name: 'EMBER HOOK', ...dim,
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26,
      damage: 13,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [3, W],
      starWindow: [3, 5],
      sfx: { tell: 'wick', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    candleStab: {
      name: 'CANDLE STAB', ...dim,
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24,
      damage: 12,
      height: 'low',
      avoidBy: ['block', 'dodgeL'],
      counterWindow: [3, W - 1],
      starWindow: null,
      punishStar: ['dodged'],
      sfx: { tell: 'wick', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // the lantern swung by its chain, as a flail
    lanternSwing: {
      name: 'LANTERN SWING', ...dim,
      windupFrames: 13, activeFrames: 9, recoveryFrames: 34,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 11],
      starWindow: [4, 8],
      punishStar: ['dodged'],
      sfx: { tell: 'wick', swing: 'swingHeavy' },
      animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'overheadRecover', 'idle1'] },
    },
    // the super: he lets the flame loose. A knockdown.
    flashfire: {
      name: 'FLASHFIRE', ...dim,
      knockdown: true, noFake: true,
      windupFrames: 18, activeFrames: 10, recoveryFrames: 46, damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 15],
      starWindow: [4, 7],
      punishStar: ['dodged'],
      sfx: { tell: 'bashGlow', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 7, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'vigil', weight: 3, when: { rounds: [1] },
      steps: [
        { idle: 32 }, { move: 'wickJab' }, { idle: 24 }, { move: 'emberHook' }, { idle: 28 }, { move: 'lanternSwing' },
        { idle: 46 }, { move: 'wickJab' }, { idle: 22 }, { move: 'candleStab' }, { idle: 30 }, { move: 'emberHook' },
        { idle: 26 }, { move: 'lanternSwing' }, { idle: 52 },
      ],
    },
    {
      id: 'nightWatch', weight: 3,
      steps: [
        { idle: 26 }, { move: 'candleStab' }, { idle: 20 }, { move: 'wickJab' }, { idle: 20 }, { move: 'wickJab' },
        { idle: 40 }, { move: 'lanternSwing' }, { idle: 44 }, { move: 'emberHook' }, { idle: 24 }, { move: 'candleStab' },
        { idle: 22 }, { move: 'emberHook' }, { idle: 50 },
      ],
    },
    {
      id: 'lastLight', weight: 2, when: { rounds: [2, 3] },
      steps: [
        { idle: 24 }, { move: 'lanternSwing' }, { idle: 30 }, { move: 'wickJab' }, { idle: 18 }, { move: 'emberHook' },
        { idle: 22 }, { move: 'candleStab' }, { idle: 40 }, { move: 'lanternSwing' }, { idle: 26 }, { move: 'wickJab' },
        { idle: 40 },
      ],
    },
  ],

  // his super: he hoists the lantern and taunts up close, then lets the flame loose (super.js)
  super: { hit: 'head', move: 'flashfire', golden: 'taunt', window: [18, 34], taunt: 52, shout: 'FLASHFIRE!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (spec §17) ---
  exploits: [
    {
      id: 'spentOil', type: 'stunTrigger', name: 'SPENT OIL',
      trigger: { state: 'windup', move: 'lanternSwing', counter: true, frames: [8, 12] },
      effect: { stun: 90, hits: 6, say: 'THE LANTERN SWINGS HIM ROUND!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'THE LANTERN PEAKS AT THE TOP OF THE SWING, AND IT TAKES HIM WITH IT.' },
      scout: 'A COUNTER LATE IN THE LANTERN SWING\'S WINDUP: THE LANTERN SWINGS HIM ROUND, STUNNED FOR 6 HITS.',
    },
    {
      id: 'dazzled', type: 'instantKd', name: 'DAZZLED', limit: 1,
      trigger: { state: ['idle', 'block', 'recovery'], star: true, test: 'lightFull' },
      effect: { knockdown: true, say: 'DAZZLED BY HIS OWN LIGHT!', sfx: 'flashbulb' },
      hint: { kind: 'visual', text: 'AT FULL LIGHT THE WHOLE RING BLAZES. HE CAN\'T LOOK AT IT.', hidden: true },
      scout: 'A STAR PUNCH WHEN THE LIGHT METER IS FULL DAZZLES HIM: AN INSTANT KNOCKDOWN (ONCE PER FIGHT).',
    },
  ],
  antiStrategies: [
    {
      id: 'trimTheWick', type: 'passivity', name: 'TRIMS THE WICK', response: 'snack', frames: 300, limit: 1, say: 'TRIMMING THE WICK...',
      step: { open: 52, anim: 'taunt', id: 'trim', heal: 0.03, star: [0, 50], interrupt: true, stunOnInterrupt: 30 },
      scout: 'STAND AROUND WAITING FOR A COUNTER AND HE STOPS TO TRIM HIS WICK: HE HEALS A LITTLE, BUT HE\'S OPEN. HIT HIM AND THE FIRST PUNCH IS A STAR.',
    },
  ],
  scriptedMoments: [
    {
      id: 'theVigil', name: 'THE VIGIL', when: { left: 60 }, say: 'THE VIGIL!',
      steps: [{ idle: 20 }, { move: 'lanternSwing' }, { idle: 30 }, { move: 'lanternSwing' }],
    },
  ],
  special: [
    { type: 'cueLamp', palettes: { dim: 'ember.dim' } },
    { type: 'lantern', base: 0.3, gain: 0.09, decay: 0.0004, min: 0.12, dark: 0.72, night: [0, 1, 6], lamp: [20, -44] },
  ],
  titleDefense: null,
  gallery: 'THE LAMP KEEPER OF THE GATE OF DAWN. HIS LANTERN IS HIS TELL, AND THE RING BRIGHTENS FOR A BOXER WHO KEEPS HITTING.', // bio for the fighter gallery (§16)
  medals: { signature: { text: 'DAZZLE HIM: A STAR PUNCH AT FULL LIGHT.', check: 'cueCount', cue: '!exploit:dazzled', n: 1 } },
  music: 'emberWalkup', // his walk-up jingle (data/music/walkups.js)
};
