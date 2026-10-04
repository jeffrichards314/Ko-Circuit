// #37 The Mirror — Legends Circuit champion. A silver figure with no face of
// his own. He remembers the last five things YOU did (the strip under the clock
// fills up with them: punches by hand and height, slips, blocks, ducks, stars).
// When he taps the glass (REWIND), he plays them back at you in order, each as
// its mirror image:
//   your LEFT head jab   comes back from the LEFT side at your head: slip right, or duck.
//   your RIGHT head jab  comes back from the right: slip left, or duck.
//   your body jabs       come back low from the same side: slip away, or block.
//   your slips, blocks and ducks come back as harmless slips, blocks and ducks.
//   your STAR PUNCH      comes back as a one-hit knockdown. Slip it.
// Once he's played it, the memory is wiped: what you do next is what comes back
// next. Feed him slips and he has nothing. Counter any reflection and the rest
// of the replay shatters. Counter the REWIND tap itself and there's no replay at
// all (early: a star; on the glint: he goes down, perfect hit).
// Shatter is his own one-hit knockdown overhead.

const shot = (name, tell, act, avoid, low) => ({
  name, reflected: true, noFake: true,
  windupFrames: 10, activeFrames: 6, recoveryFrames: 16,
  damage: 15,
  height: low ? 'low' : 'high',
  avoidBy: avoid,
  counterWindow: [2, 8],
  starWindow: null,
  sfx: { tell: 'glass', swing: 'whiff' },
  animation: { windup: [tell], active: [act], recovery: [tell, 'idle1'] },
});
// a reflected slip / block / duck: he just does it back (harmless)
const echo = (name, pose) => ({
  name, reflected: true, noFake: true, feint: true, call: true,
  windupFrames: 16, activeFrames: 0, recoveryFrames: 8,
  damage: 0,
  avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
  counterWindow: null, starWindow: null,
  sfx: { tell: 'whoosh' },
  animation: { windup: [pose], active: [pose], recovery: [pose, 'idle1'] },
});

export default {
  id: 'mirror',
  name: 'THE MIRROR',
  short: 'MIRROR',
  nickname: 'MIRROR IMAGE',
  circuit: 'legends',
  rank: 0,
  isChampion: true,
  card: {
    age: '??',
    weight: '??',
    record: '??-0 ??KO',
    hometown: 'BEHIND THE GLASS',
    quote: 'EVERYTHING YOU THROW AT ME COMES BACK TO YOU.',
  },
  lines: {
    win: 'YOU LOST TO THE ONLY OPPONENT WHO KNOWS YOU. YOU.',
    lose: 'SEVEN... YEARS... BAD LUCK...',
  },

  build: 'medium',
  palette: 'mirror',
  spriteLayers: 'mirror',

  stats: {
    health: 250,
    damageMult: 1.55,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.55,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 46,
    hitstun: 12,
    betweenRoundHeal: 0.22,
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
    taunt: { frames: ['glassPalm1', 'glassPalm2'], rate: 20 },
    victory: ['victory'],
  },

  moves: {
    silverJab: {
      name: 'SILVER JAB',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 20,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 6],
      starWindow: [2, 3],
      sfx: { tell: 'chime', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    silverHook: {
      name: 'SILVER HOOK',
      windupFrames: 10, activeFrames: 7, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 8],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // one-hit knockdown: he brings both fists down like breaking glass
    shatter: {
      name: 'SHATTER',
      knockdown: true,
      windupFrames: 18, activeFrames: 10, recoveryFrames: 44,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 15],
      starWindow: [3, 6],
      noFake: true,
      sfx: { tell: 'creakBig', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // tap tap on the glass: the replay starts when it's done (perfect-hit moment)
    rewind: {
      name: 'REWIND',
      feint: true, call: true, noFake: true,
      windupFrames: 24, activeFrames: 0, recoveryFrames: 8,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 21],
      starWindow: [3, 7],
      kdWindow: [13, 16],
      sfx: { tell: 'rewind' },
      animation: { windup: ['rewindTell1', 'rewindTell2'], windupRate: 6, active: ['rewindTell2'], recovery: ['rewindTell2', 'idle1'] },
    },
    // your moves, reflected
    mJabL: shot('YOUR LEFT', 'jabTell', 'jab', ['dodgeR', 'duck']),
    mJabR: shot('YOUR RIGHT', 'jabRTell', 'jabR', ['dodgeL', 'duck']),
    mBodyL: shot('YOUR LEFT (BODY)', 'bodyTell', 'body', ['dodgeR', 'block'], true),
    mBodyR: shot('YOUR RIGHT (BODY)', 'bodyRTell', 'bodyR', ['dodgeL', 'block'], true),
    mStar: {
      name: 'YOUR STAR PUNCH',
      reflected: true, noFake: true, knockdown: true,
      windupFrames: 18, activeFrames: 8, recoveryFrames: 36,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 14],
      starWindow: [3, 6],
      sfx: { tell: 'starWind', swing: 'swingHeavy' },
      animation: { windup: ['starTell'], active: ['upper'], recovery: ['upper', 'overheadRecover', 'idle1'] },
    },
    mSlipL: echo('YOUR SLIP', 'slipL'),
    mSlipR: echo('YOUR SLIP', 'slipR'),
    mGuard: echo('YOUR BLOCK', 'block'),
    mDuck: echo('YOUR DUCK', 'duckM'),
  },

  patterns: [
    {
      id: 'reflection', weight: 3, fixed: true,
      steps: [
        { idle: 30 }, { move: 'silverJab' }, { idle: 24 }, { move: 'silverHook' }, { idle: 26 },
        { move: 'rewind' }, { idle: 22 }, { taunt: 40 },
      ],
    },
    {
      id: 'brokenGlass', weight: 2, fixed: true,
      steps: [
        { idle: 26 }, { move: 'silverHook' }, { idle: 20 }, { move: 'silverJab' }, { idle: 18 }, { move: 'shatter' },
        { idle: 24 }, { move: 'rewind' }, { idle: 22 }, { taunt: 36 },
      ],
    },
    {
      id: 'hallOfMirrors', weight: 1, fixed: true,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 22 }, { move: 'rewind' }, { idle: 18 }, { move: 'shatter' }, { idle: 22 }, { move: 'silverJab' },
        { idle: 18 }, { move: 'rewind' }, { idle: 24 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'rewind', golden: 'windup', taunt: 38, shout: 'REWIND!', times: [1, 2] },
  // more supers (super.js): each armored from its first frame to its last attack, each with one golden moment
  supers: [
    { hit: 'body', move: 'shatter', inline: true, golden: 'windup', window: [9, 12] },
  ],

  getUpTable: [
    { upAt: [9, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.25, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // A champion (K4): 3 exploits, 2 anti-strategies, 2 scripted moments.
  exploits: [
    {
      id: 'copycat', type: 'bait', name: 'COPYCAT',
      trigger: { on: 'blockStreak', n: 5 },
      effect: { script: [{ move: 'mGuard' }, { move: 'mGuard' }, { move: 'mGuard' }, { open: 80, anim: 'stunned', id: 'copy', comboLimit: 6, star: [0, 40] }], say: 'HE COPIES YOUR GUARD!' },
      hint: { kind: 'visual', text: 'HE REMEMBERS BLOCKS TOO: THEY SHOW UP IN THE STRIP UNDER THE CLOCK.' },
      scout: 'BLOCK FIVE TIMES IN A ROW WITH NOTHING ELSE BETWEEN: HE COPIES THE BLOCKS, THEN STANDS OPEN FOR 6 HITS.',
    },
    {
      id: 'crackedGlass', type: 'quirk', name: 'CRACKED GLASS',
      trigger: { on: 'resolved', move: 'shatter', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 8, star: [0, 30] }, say: 'THE GLASS CRACKS!', sfx: 'glass' },
      hint: { kind: 'audio', text: 'THE SHATTER OVERHEAD MAKES THE SOUND OF GLASS.' },
      scout: 'SLIP THE SHATTER OVERHEAD: THE GLASS CRACKS AND HE\'S OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'blankSlate', type: 'quirk', name: 'BLANK SLATE', limit: 2,
      trigger: { on: 'getUp' },
      effect: { open: { frames: 70, anim: 'stunned', comboLimit: 5, star: [0, 34] }, say: 'THE MEMORY IS WIPED!' },
      hint: { kind: 'trainer', text: 'WHEN HE GETS UP, THE STRIP UNDER THE CLOCK IS EMPTY.', hidden: true },
      scout: 'WHEN HE GETS UP FROM A KNOCKDOWN, HIS MEMORY IS WIPED AND HE\'S OPEN FOR 5 HITS (TWICE A FIGHT).',
    },
  ],
  antiStrategies: [
    {
      id: 'brokenGlass', type: 'rushing', name: 'BROKEN GLASS', span: 150, count: 2, counter: ['silverHook'], say: 'BROKEN GLASS!',
      scout: 'PUNCH INTO HIS GLASS WHEN HE ISN\'T OPEN TWICE IN A ROW AND IT SHATTERS BACK: A SILVER HOOK AT ONCE.',
    },
    {
      id: 'rewindMash', type: 'getUpMash', name: 'REWIND', response: 'moves', moves: ['rewind'], say: 'REWIND!',
      scout: 'WHEN YOU MASH BACK UP AFTER A KNOCKDOWN, HE TAPS THE GLASS AT ONCE: A REPLAY OF YOUR LAST FIVE MOVES.',
    },
  ],
  scriptedMoments: [
    { id: 'fullReplay', name: 'FULL REPLAY', when: { left: 75 }, say: 'HE TAPS THE GLASS...', steps: [{ idle: 20 }, { move: 'rewind' }] },
    {
      id: 'shatterPoint', name: 'SHATTER POINT', when: { health: 0.3 }, say: 'THE GLASS IS BREAKING!',
      steps: [{ idle: 14 }, { move: 'shatter' }, { idle: 24 }, { move: 'silverHook' }, { idle: 14 }, { move: 'silverJab' }, { idle: 14 }, { move: 'shatter' }],
    },
  ],
  special: [{
    type: 'reflect', call: 'rewind', size: 5,
    map: { jabLhigh: 'mJabL', jabRhigh: 'mJabR', jabLlow: 'mBodyL', jabRlow: 'mBodyR', dodgeL: 'mSlipL', dodgeR: 'mSlipR', block: 'mGuard', duck: 'mDuck', star: 'mStar' },
  }],
  // Title Defense remix: the cracked mirror.
  titleDefense: {
    nickname: 'THE CRACKED GLASS',
    quote: 'YOU BROKE ME. NOW THERE ARE TWO OF EVERYTHING YOU DO.',
    lines: { win: 'SEVEN YEARS BAD LUCK. STARTING NOW.', lose: 'SHATTERED... AGAIN...' },
    tell: 0.85,
    costume: { B: { shard: [31, 16, 26], shardDk: [20, 6, 16] } },
    moves: {
      // new: a silver uppercut (slip it, punish for a star)
      silverUpper: {
        name: 'SILVER UPPERCUT',
        windupFrames: 10, activeFrames: 7, recoveryFrames: 34,
        damage: 18,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [2, 8],
        starWindow: [2, 4],
        punishStar: ['dodged'],
        sfx: { tell: 'ding', swing: 'swingHeavy' },
        animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
      },
      // new: the cracked hook, from his left (slip right or duck)
      crackedHook: {
        name: 'CRACKED HOOK',
        windupFrames: 10, activeFrames: 7, recoveryFrames: 24,
        damage: 16,
        avoidBy: ['dodgeR', 'duck'],
        counterWindow: [2, 8],
        starWindow: null,
        sfx: { tell: 'crackle', swing: 'swingHeavy' },
        animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'kaleidoscope', weight: 3, fixed: true,
        steps: [
          { idle: 28 }, { move: 'crackedHook' }, { idle: 22 }, { move: 'silverUpper' }, { idle: 24 }, { move: 'rewind' },
          { idle: 22 }, { move: 'silverJab' }, { idle: 22 }, { move: 'shatter' }, { idle: 24 }, { taunt: 36 },
        ],
      },
      {
        id: 'splinters', weight: 2, fixed: true,
        steps: [
          { idle: 24 }, { move: 'silverUpper' }, { idle: 20 }, { move: 'silverHook' }, { idle: 20 }, { move: 'crackedHook' },
          { idle: 22 }, { move: 'rewind' }, { idle: 24 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE LEGENDS CHAMPION. SILVER, SILENT, AND EVERYTHING YOU DO, HE DOES BACK.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER USE THE SAME PUNCH TWICE IN A ROW.', check: 'noRepeat' } },
  music: 'mirrorEntrance',
};
