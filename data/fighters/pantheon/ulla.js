// #57 Updraft Ulla — Pantheon II, the Cloud Terrace. She calls the wind: her GALE (arms
// up, pennants flying, a rising howl) whips the terrace into a gale for a good while,
// and in a gale every dodge you make SLIDES: it takes longer to come back from, so
// your counters come later and your next dodge is late. The slip itself is just as
// good: time everything else a little later. Counter the call and the gale never rises.
// Her super is the UPDRAFT: a rising uppercut on a column of air, a knockdown: slip it,
// then hit her on the glint while she's still in the air.
// Pantheon II difficulty: 6-frame tells, shuffled and adaptive, hearts 12.

const W = 7;

export default {
  id: 'ulla',
  name: 'UPDRAFT ULLA',
  short: 'ULLA',
  nickname: 'THE GALE',
  circuit: 'p2',
  rank: 1,
  isChampion: false,
  card: { age: 29, weight: 156, record: '35-1 26KO', hometown: 'THE CLOUD TERRACE', quote: 'STAND STILL. LET THE WIND DO THE WORK.' },
  lines: { win: 'BLOWN AWAY.', lose: 'THE WIND... ABANDONED ME...' },

  build: 'medium',
  palette: 'ulla',
  spriteLayers: 'ulla',

  stats: {
    health: 290, damageMult: 1.8, stunResistance: 4, heartDrainOnBlock: 3, starLossChance: 0.55,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 16 },
    block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
    taunt: ['gale'], victory: ['victory'],
  },

  moves: {
    // a gust: not a punch at all. When the call finishes the gale rises.
    gale: {
      name: 'GALE', feint: true, call: true, noFake: true,
      windupFrames: 22, activeFrames: 0, recoveryFrames: 8, damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 18], starWindow: [3, 8], cancels: 1,
      sfx: { tell: 'gust' },
      animation: { windup: ['gale'], active: ['gale'], recovery: ['gale'] },
    },
    jab: {
      name: 'WIND JAB',
      windupFrames: W, activeFrames: 6, recoveryFrames: 20, damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1], starWindow: null,
      sfx: { tell: 'whoosh', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    hook: {
      name: 'CROSSWIND HOOK',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 14,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [3, W], starWindow: [3, 5],
      sfx: { tell: 'whoosh', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    windBody: {
      name: 'WIND BODY BLOW', height: 'low',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24, damage: 12,
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [3, W - 1], starWindow: null, punishStar: ['dodged'],
      sfx: { tell: 'whoosh', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    // the super: a column of air under a rising uppercut. A knockdown.
    updraft: {
      name: 'UPDRAFT', knockdown: true, noFake: true,
      windupFrames: 18, activeFrames: 10, recoveryFrames: 48, damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 15], starWindow: [4, 7], punishStar: ['dodged'],
      sfx: { tell: 'gust', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'winded1', 'idle1'] },
    },
  },

  // Everything after a gale is spaced for the slide: long enough gaps to come back and dodge again.
  patterns: [
    { id: 'breeze', weight: 3, when: { rounds: [1] }, steps: [
      { idle: 34 }, { move: 'jab' }, { idle: 30 }, { move: 'hook' }, { idle: 34 }, { move: 'gale' }, { idle: 46 },
      { move: 'windBody' }, { idle: 36 }, { move: 'jab' }, { idle: 32 }, { move: 'hook' }, { idle: 54 } ] },
    { id: 'gustFront', weight: 3, steps: [
      { idle: 30 }, { move: 'gale' }, { idle: 44 }, { move: 'jab' }, { idle: 32 }, { move: 'windBody' }, { idle: 34 },
      { move: 'hook' }, { idle: 36 }, { move: 'jab' }, { idle: 30 }, { move: 'windBody' }, { idle: 50 } ] },
    { id: 'squall', weight: 2, when: { rounds: [2, 3] }, steps: [
      { idle: 28 }, { move: 'hook' }, { idle: 30 }, { move: 'jab' }, { idle: 30 }, { move: 'gale' }, { idle: 42 },
      { move: 'hook' }, { idle: 34 }, { move: 'windBody' }, { idle: 32 }, { move: 'jab' }, { idle: 46 } ] },
  ],

  super: { hit: 'head', move: 'updraft', golden: 'recovery', window: [16, 20], taunt: 46, shout: 'UPDRAFT!', times: [1, 2] },

  getUpTable: [ { upAt: [9, 9], health: 0.5 }, { upAt: [9, 9], health: 0.45 }, { upAt: [9, 9], stayDown: 0.3, health: 0.4 }, { upAt: null } ],


  exploits: [
    {
      id: 'calmBeforeTheStorm', type: 'stunTrigger', name: 'CALM BEFORE THE STORM',
      trigger: { state: 'windup', move: 'gale', counter: true, frames: [14, 20] },
      effect: { stun: 100, hits: 7, star: true, say: 'THE WIND DIES!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'THE HOWL PEAKS JUST BEFORE THE GALE BREAKS: HER ARMS ARE UP AND OPEN.' },
      scout: 'A COUNTER ON THE LAST FRAMES OF HER GALE CALL: THE WIND DIES, STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'windbreaker', type: 'quirk', name: 'WINDBREAKER',
      trigger: { on: 'resolved', move: 'windBody', result: 'blocked' },
      effect: { open: { frames: 70, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'SHE\'S BLOWN BACK!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'A BLOCKED BODY BLOW BLOWS BACK ON HER.', hidden: true },
      scout: 'BLOCK HER WIND BODY BLOW: IT BLOWS BACK ON HER AND SHE\'S OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'carriedBack', type: 'comboRepeat', name: 'CARRIED BACK ON THE WIND', gap: 45, counter: ['hook'], say: 'THE WIND CARRIES IT BACK!',
      scout: 'THROW THE SAME COMBO TWICE IN A ROW AND THE WIND CARRIES THE SECOND ONE BACK AT YOU AS A CROSSWIND HOOK.',
    },
  ],
  scriptedMoments: [
    { id: 'galeWarning', name: 'GALE WARNING', when: { left: 75 }, say: 'GALE WARNING!', steps: [{ idle: 20 }, { move: 'gale' }, { idle: 46 }, { move: 'hook' }, { idle: 36 }, { move: 'jab' }] },
  ],
  special: [{ type: 'slide', call: 'gale', extra: 8, frames: 360, label: 'GALE', shout: 'YOUR DODGES SLIDE!', sfx: 'gust' }],
  titleDefense: null,
  gallery: 'WHEN SHE CALLS THE GALE, EVERY DODGE YOU MAKE SLIDES FARTHER AND TAKES LONGER TO RECOVER FROM.',
  medals: { signature: { text: 'CANCEL HER GALE TWICE.', check: 'counterMove', move: 'gale', n: 2 } },
  music: 'ullaWalkup',
};
