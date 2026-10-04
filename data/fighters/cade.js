// #44 Crowbar Cade — Underground Circuit. A dockside enforcer who learned to box
// in the back of a warehouse, where nobody rings a bell and nobody counts.
// He fights dirty, and he fights when you're not ready:
//   AT THE BELL   all through the round intro he's creeping in with his right
//                 hand cocked. The instant the fight starts he throws it: be
//                 holding a block (or slip it). Counter it for a star.
//   ON THE COUNT  knock him down and don't relax. He doesn't wait for the ref:
//                 he scrambles up mid-count with a grin and throws a cheap shot
//                 before you know the count has stopped. Block it.
// In between: a thumb to the eye (anything works), an elbow from your left
// (slip left or duck), a low blow (block only), and a HEADBUTT (slip either
// way or duck). After his rabbit-punch rush he's gassed: hit him.
// THE CROWBAR (both fists raised, a clang of iron) is his one-hit knockdown:
// slip it, or counter it on the glint and he goes down (perfect hit).

export default {
  id: 'cade',
  name: 'CROWBAR CADE',
  short: 'CADE',
  nickname: 'THE CROWBAR',
  circuit: 'underground',
  rank: 2,
  isChampion: false,
  card: {
    age: 34,
    weight: 238,
    record: '44-9 40KO',
    hometown: 'PIER 13',
    quote: 'RULES? DOWN HERE THE BELL\'S JUST A SUGGESTION.',
  },
  lines: {
    win: 'SHOULDA KEPT YOUR HANDS UP, PAL.',
    lose: 'I... WASN\'T... READY...',
  },

  build: 'heavy',
  palette: 'cade',
  spriteLayers: 'cade',

  stats: {
    health: 260,
    damageMult: 1.6,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.55,
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
    taunt: { frames: ['knuckles1', 'knuckles2'], rate: 10 },
    victory: ['victory'],
    winded: { frames: ['winded1', 'winded2'], rate: 16 },
  },

  moves: {
    // the cheap shot at the bell: he's been creeping in with it all intro
    bellShot: {
      name: 'AT THE BELL',
      windupFrames: 14, activeFrames: 6, recoveryFrames: 26,
      damage: 17,
      avoidBy: ['block', 'duck', 'dodgeL', 'dodgeR'],
      counterWindow: [3, 11],
      starWindow: [3, 6],
      noFake: true,
      sfx: { tell: 'heh', swing: 'swingHeavy' },
      animation: { windup: ['sucker'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // up off the canvas before the count is done
    cheapShot: {
      name: 'CHEAP SHOT',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 28,
      damage: 17,
      avoidBy: ['block', 'duck', 'dodgeL', 'dodgeR'],
      counterWindow: [3, 9],
      starWindow: [3, 5],
      noFake: true,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['sucker'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    thumb: {
      name: 'THUMB IN THE EYE',
      windupFrames: 7, activeFrames: 5, recoveryFrames: 20,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    elbow: {
      name: 'ELBOW',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'snort', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    lowBlow: {
      name: 'LOW BLOW',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 24,
      damage: 16,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'heh', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    headbutt: {
      name: 'HEADBUTT',
      windupFrames: 9, activeFrames: 6, recoveryFrames: 30,
      damage: 18,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [2, 7],
      starWindow: [2, 4],
      punishStar: ['dodged', 'ducked'],
      sfx: { tell: 'snort', swing: 'swingHeavy' },
      animation: { windup: ['butTell'], active: ['butt'], recovery: ['butt', 'idle1'] },
    },
    // the rabbit-punch rush
    rabbit1: {
      name: 'RABBIT PUNCH',
      windupFrames: 8, activeFrames: 5, recoveryFrames: 3,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null, noFake: true,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    rabbit2: {
      name: 'RABBIT PUNCH (2)',
      windupFrames: 8, activeFrames: 5, recoveryFrames: 3,
      damage: 14,
      avoidBy: ['dodgeL'],
      counterWindow: null, starWindow: null, noFake: true,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hook'] },
    },
    rabbit3: {
      name: 'RABBIT PUNCH (3)',
      windupFrames: 8, activeFrames: 5, recoveryFrames: 20,
      damage: 15,
      avoidBy: ['dodgeR'],
      counterWindow: null, starWindow: null, noFake: true,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL', 'idle1'] },
    },
    // one-hit knockdown: both fists up like a crowbar coming down
    crowbar: {
      name: 'THE CROWBAR',
      knockdown: true,
      windupFrames: 16, activeFrames: 10, recoveryFrames: 44,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 13],
      starWindow: [3, 5],
      kdWindow: [8, 11],
      noFake: true,
      sfx: { tell: 'crowbar', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 5, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'brawl', weight: 3,
      steps: [
        { idle: 24 }, { move: 'thumb' }, { idle: 20 }, { move: 'elbow' }, { idle: 24 }, { move: 'lowBlow' },
        { idle: 24 }, { move: 'thumb' }, { idle: 22 }, { move: 'headbutt' }, { idle: 26 }, { taunt: 30 },
      ],
    },
    {
      id: 'wrecker', weight: 2,
      steps: [
        { idle: 22 }, { move: 'elbow' }, { idle: 20 }, { move: 'crowbar' }, { idle: 24 }, { move: 'lowBlow' },
        { idle: 24 }, { move: 'thumb' }, { idle: 28 },
      ],
    },
    {
      id: 'rabbit', weight: 2, fixed: true,
      steps: [
        { idle: 24 }, { move: 'thumb' }, { idle: 20 },
        { move: 'rabbit1' }, { move: 'rabbit2' }, { move: 'rabbit3' },
        { idle: 16 },
        { open: 50, anim: 'winded', star: [2, 16], interrupt: true, stunOnInterrupt: 30, sfxLoop: 'pant', sfxEvery: 20 },
        { idle: 18 },
      ],
    },
  ],

  // he never stays down for the whole count: up mid-count and swinging
  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'crowbar', golden: 'open', open: 'winded', window: [10, 13], taunt: 36, shout: 'THE CROWBAR!', times: [1, 2] },

  getUpTable: [
    { upAt: [3, 4], health: 0.55, sneak: 'cheapShot', sneakAt: 14 },
    { upAt: [3, 5], health: 0.5, sneak: 'cheapShot', sneakAt: 14 },
    { upAt: [4, 6], stayDown: 0.25, health: 0.4, sneak: 'cheapShot', sneakAt: 14 },
    { upAt: null },
  ],


  special: [{ type: 'dirty', bell: 'bellShot', creepPose: 'sucker', creepAt: 30, bellMsg: 'CHEAP SHOT AT THE BELL!', sneakMsg: 'HE\'S UP BEFORE THE COUNT!', sneakSfx: 'heh' }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  exploits: [
    {
      id: 'sucker', type: 'patternBreak', name: 'SUCKER PUNCHED',
      trigger: { state: 'windup', move: 'bellShot', counter: true, frames: [4, 9] },
      effect: { stun: 96, hits: 6, star: true, say: 'BEAT HIM TO IT!', sfx: 'oof' },
      hint: { kind: 'visual', text: 'HE CREEPS IN ALL INTRO WITH HIS RIGHT HAND COCKED.' },
      scout: 'COUNTER HIS SHOT AT THE BELL: STUNNED FOR 6 HITS AND YOU GET A STAR.',
    },
    {
      id: 'lowBlowBack', type: 'stunTrigger', name: 'BELOW THE BELT',
      trigger: { state: 'windup', move: 'lowBlow', counter: true, height: 'high', frames: [3, 6] },
      effect: { stun: 88, hits: 5, say: 'GOT HIM AT HIS OWN GAME!', sfx: 'crunch' },
      hint: { kind: 'trainer', text: 'HE DROPS HIS GUARD WHEN HE GOES LOW.' },
      scout: 'A HEAD COUNTER ON THE LOW BLOW STUNS HIM FOR 5 HITS.',
    },
    {
      id: 'crowbarBent', type: 'quirk', name: 'BENT CROWBAR',
      trigger: { on: 'resolved', move: 'crowbar', result: 'dodged' },
      effect: { open: { frames: 90, anim: 'winded', comboLimit: 7, star: [0, 36] }, say: 'HE THREW OUT HIS BACK!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'THE CLANG RINGS OUT WHEN THE CROWBAR MISSES.', hidden: true },
      scout: 'SLIP THE CROWBAR: HE\'S WINDED AND OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'kickWhenUp', type: 'getUpMash', name: 'KICKS YOU WHEN YOU\'RE UP', response: 'moves', moves: ['lowBlow'], say: 'DIRTY!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HE\'S ALREADY THROWING A LOW BLOW. BLOCK IT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'noRules', name: 'NO RULES', when: { left: 60 }, say: 'NO RULES DOWN HERE!',
      steps: [{ idle: 18 }, { move: 'thumb' }, { idle: 12 }, { move: 'elbow' }, { idle: 12 }, { move: 'headbutt' }],
    },
  ],
  gallery: 'FIGHTS DIRTY AND PROUD OF IT. HE SWINGS AT THE BELL AND DURING THE COUNT, SO STAY GUARDED.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER GET CAUGHT BY THE BELL SHOT.', check: 'neverHitBy', move: 'bellShot' } },
  music: 'cadeWalkup', // his walk-up jingle (data/music/walkups.js)
};
