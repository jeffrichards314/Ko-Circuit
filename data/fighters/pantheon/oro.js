// #51 Sentinel Oro — Pantheon I, the Gate of Dawn. He guards the way up, and his
// gilded shield stops EVERY punch: it bounces them off (hearts and all) and answers
// mashing with a guard counter. He has to open himself. When the shield GLOWS, a shield
// bash is coming: it can't be blocked, only slipped, and slip it and the shield clatters
// to the canvas: for a good while he's an ordinary boxer with nothing in front of him,
// until he stoops to pick it up again (hit him while he does).
// His super is the SUN SMASH: he raises shield and gauntlet together and brings the sun
// down. A one-hit knockdown: slip it. Counter it on the glint and he goes down instead
// (the shield can't stop a perfect hit).
// Pantheon I difficulty: 6-frame tells, shuffled and adaptive, hearts 12.

const W = 7; // his ordinary tell (the circuit's 6f, a little over for a man in plate)
const r = (n) => Math.max(2, Math.round(n));

export default {
  id: 'oro',
  name: 'SENTINEL ORO',
  short: 'ORO',
  nickname: 'THE GATE',
  circuit: 'p1',
  rank: 3,
  isChampion: false,
  card: {
    age: 38,
    weight: 246,
    record: '31-0 24KO',
    hometown: 'THE GATE OF DAWN',
    quote: 'THE GATE IS SHUT. KNOCK IF YOU LIKE. I WON\'T ANSWER.',
  },
  lines: {
    win: 'THE GATE STAYS SHUT.',
    lose: 'THE GATE... IS... OPEN...',
  },

  build: 'heavy',
  palette: 'oro',
  spriteLayers: 'oro',

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
    idle: { frames: ['idle1', 'idle2'], rate: 20 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['taunt'],
    victory: ['victory'],
    retrieve: ['retrieve'],
  },

  moves: {
    jab: {
      name: 'GAUNTLET JAB',
      windupFrames: W, activeFrames: 6, recoveryFrames: 22,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1],
      starWindow: null,
      sfx: { tell: 'clang', swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    hook: {
      name: 'GILDED HOOK',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26,
      damage: 13,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [3, W],
      starWindow: [3, 5],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    body: {
      name: 'GREAVE BLOW',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24,
      damage: 12,
      height: 'low',
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [3, W - 1],
      starWindow: null,
      punishStar: ['dodged'],
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    // the shield bash: the whole armour glows for the windup. Can't be blocked, can't be countered
    // (he's behind the shield): slip it and the shield drops.
    shieldBash: {
      name: 'SHIELD BASH',
      windupFrames: 14, activeFrames: 7, recoveryFrames: 40,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { tell: 'chime', swing: 'swingHeavy' },
      openAfter: { when: ['dodged'], open: 44, anim: 'stunned', id: 'stagger', star: [0, 22], comboLimit: 5 },
      animation: { windup: ['bashTell'], active: ['bash'], recovery: ['bash', 'idle1'] },
    },
    // the super: shield and gauntlet up together, then the sun comes down
    sunSmash: {
      name: 'SUN SMASH',
      knockdown: true,
      windupFrames: 20, activeFrames: 10, recoveryFrames: 46,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [5, 17],
      starWindow: [5, 8],
      kdWindow: [10, 13],
      noFake: true,
      punishStar: ['dodged'],
      sfx: { tell: 'fanfare', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 8, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'ranks', weight: 3,
      when: { rounds: [1] },
      steps: [
        { idle: 34 }, { move: 'jab' }, { idle: 26 }, { move: 'hook' }, { idle: 30 }, { move: 'body' },
        { idle: 46 }, { move: 'shieldBash' }, { idle: 50 }, { move: 'jab' }, { idle: 24 }, { move: 'jab' },
        { idle: 40 }, { move: 'hook' }, { idle: 60 },
      ],
    },
    {
      id: 'phalanx', weight: 3,
      steps: [
        { idle: 28 }, { move: 'jab' }, { idle: 20 }, { move: 'jab' }, { idle: 26 }, { move: 'hook' },
        { idle: 44 }, { move: 'shieldBash' }, { idle: 48 }, { move: 'body' }, { idle: 24 }, { move: 'hook' },
        { idle: 36 }, { move: 'jab' }, { idle: 56 },
      ],
    },
    {
      id: 'gateShut', weight: 2,
      when: { rounds: [2, 3] },
      steps: [
        { idle: 26 }, { move: 'hook' }, { idle: 22 }, { move: 'body' }, { idle: 22 }, { move: 'jab' },
        { idle: 40 }, { move: 'shieldBash' }, { idle: 46 }, { move: 'hook' }, { idle: 24 }, { move: 'jab' },
        { idle: 22 }, { move: 'body' }, { idle: 44 }, { move: 'shieldBash' }, { idle: 56 },
      ],
    },
    // his shield cracked (under 30%): no more bash, just plate and fists
    {
      id: 'cracked', weight: 1, script: 'crack',
      steps: [
        { idle: 22 }, { move: 'jab' }, { idle: 16 }, { move: 'hook' }, { idle: 20 }, { move: 'body' },
        { idle: 22 }, { move: 'hook' }, { idle: 18 }, { move: 'jab' }, { idle: 40 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'sunSmash', golden: 'windup', window: [10, 13], taunt: 46, shout: 'SUN SMASH!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (spec §17): Pantheon I, the way in is a puzzle ---
  exploits: [
    {
      id: 'underTheShield', type: 'stunTrigger', name: 'UNDER THE SHIELD',
      trigger: { state: 'windup', move: 'shieldBash', side: 'L', height: 'low', frames: [3, 12], clean: 30 },
      effect: { stun: 84, hits: 5, star: true, say: 'BELLY EXPOSED!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'HE HEAVES THE SHIELD UP TO BASH: HIS BELLY IS BARE.' },
      scout: 'A LEFT-HAND BODY SHOT WHILE THE SHIELD GLOWS (THE BASH\'S WINDUP) DOUBLES HIM OVER: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'swingWide', type: 'quirk', name: 'THE GILDED HOOK SWINGS WIDE',
      trigger: { on: 'resolved', move: 'hook', result: 'dodged', dir: 'L' },
      effect: { open: { frames: 72, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'HIS ARM SWINGS WIDE!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'THE HOOK COMES FROM HIS UNSHIELDED SIDE: IT PULLS HIM OFF BALANCE.', hidden: true },
      scout: 'SLIP LEFT OF HIS GILDED HOOK: HE SWINGS WIDE AND IS OPEN FOR 5 HITS EVEN WITH THE SHIELD UP, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'shieldRush', type: 'jabSpam', name: 'SHIELD RUSH', streak: 4, counter: ['shieldBash'], say: 'SHIELD RUSH!',
      scout: 'KEEP JABBING INTO THE SHIELD AND HE PARRIES THE 4TH PUNCH AND ANSWERS WITH THE BASH: SLIP IT.',
    },
    {
      id: 'heldBash', type: 'earlyDodge', name: 'HELD BASH', response: 'hold', moves: ['shieldBash', 'hook'], say: 'HELD IT!',
      scout: 'SLIP EARLY AND HE HOLDS THE SHIELD BASH OR THE HOOK SO IT LANDS AS YOUR SLIP RUNS OUT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'changingTheGuard', name: 'CHANGING OF THE GUARD', when: { left: 60 }, say: 'CHANGING OF THE GUARD!',
      steps: [{ idle: 18 }, { move: 'shieldBash' }],
    },
    {
      id: 'shieldCracks', name: 'THE SHIELD CRACKS', when: { health: 0.3 }, say: 'THE SHIELD CRACKS!', flag: 'shieldBroken', patterns: 'crack',
      steps: [{ idle: 16 }],
    },
  ],
  special: [
    { type: 'shield', bash: 'shieldBash', glow: 'oro.glow', down: 420, keep: ['retrieve'], retrieve: { open: 44, anim: 'retrieve' } },
  ],
  titleDefense: null,
  gallery: 'THE GATE GUARD OF THE PANTHEON. HIS GILDED SHIELD STOPS EVERY PUNCH: THE ONLY WAY IN IS TO MAKE HIM DROP IT.', // bio for the fighter gallery (§16)
  medals: { signature: { text: 'DROP HIS SHIELD 3 TIMES.', check: 'cueCount', cue: '!shieldDrop', n: 3 } },
  music: 'oroWalkup', // his walk-up jingle (data/music/walkups.js)
};
