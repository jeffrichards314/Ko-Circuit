// #63 The Old Guard — Pantheon III's champion, the Hall of Heroes. The ghost of the first
// champion, in a top hat and a belt older than the sport. He remembers every era in this hall,
// and each round he fights in another:
//   round 1  1890s   sepia: a bare-knuckle brawler (Tom's jabs and haymaker)
//   round 2  1920s   silent film: a showman (a cane, a twirl that means nothing, a bow)
//   round 3  1950s   television: a slugger (his hook, his belly, and a BEAR HUG)
// Under a third of his health he fights all three at once.
// His super is the FIRST CHAMPION: he holds the belt up, and then he brings all of ninety
// years down on you, a knockdown: slip it. Counter it on the glint and the belt is yours.
// Pantheon III difficulty: 5-frame tells, shuffled and adaptive, hearts 12; a champion in three phases.

const W = 6;
const bow = { open: 46, anim: 'bow', id: 'bow', comboLimit: 5, star: [0, 20], limit: 3 };

export default {
  id: 'oldguard',
  name: 'THE OLD GUARD',
  short: 'OLD GUARD',
  nickname: 'THE FIRST CHAMPION',
  circuit: 'p3',
  rank: 0,
  isChampion: true,
  card: { age: 130, weight: 224, record: '1-0 1KO', hometown: 'THE FIRST RING', quote: 'I WAS HERE FIRST. I\'LL BE HERE LAST.' },
  lines: { win: 'THE BELT STAYS WITH ME.', lose: 'AT LAST... SOMEONE... WORTHY...' },

  build: 'heavy',
  palette: 'oldguard',
  spriteLayers: 'oldguard',

  stats: {
    health: 420, damageMult: 1.95, stunResistance: 6, heartDrainOnBlock: 3, starLossChance: 0.6,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 46, hitstun: 12, betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['stand1', 'stand2'], rate: 18 },
    block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
    taunt: ['crest'], victory: ['victory'],
    bow: ['winded1'],
    hold: { frames: ['holding'], rate: 30 },
  },

  moves: {
    // --- 1890s: the brawler ---
    jab: {
      name: 'STRAIGHT LEFT',
      windupFrames: W, activeFrames: 5, recoveryFrames: 22, damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1], starWindow: null,
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    cross: {
      name: 'RIGHT CROSS',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24, damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [2, W], starWindow: [2, 4],
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    haymaker: {
      name: 'BARE-KNUCKLE HAYMAKER',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 36, damage: 20,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 13], starWindow: [4, 7], punishStar: ['dodged'],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // --- 1920s: the showman ---
    poke: {
      name: 'CANE POKE',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 22, damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [2, W], starWindow: [2, 4],
      sfx: { tell: 'whip', swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    flourish: {
      name: 'FLOURISH', feint: true, noFake: true,
      windupFrames: 14, activeFrames: 0, recoveryFrames: 24, damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 12], starWindow: [2, 5],
      sfx: { tell: 'baton' },
      animation: { windup: ['crest'], active: ['crest'], recovery: ['crest', 'idle1'] },
    },
    // --- 1950s: the slugger ---
    hook: {
      name: 'CHAMPION\'S HOOK',
      windupFrames: W + 3, activeFrames: 8, recoveryFrames: 28, damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [3, W + 2], starWindow: [3, 6],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    body: {
      name: 'BELT-LINE BLOW', height: 'low',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 14,
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [3, W], starWindow: null, punishStar: ['dodged'],
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    clinch: {
      name: 'OLD-TIMER\'S HUG', clinch: true, noFake: true,
      windupFrames: 12, activeFrames: 8, recoveryFrames: 34, damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [3, 9], starWindow: [3, 6], punishStar: ['dodged', 'ducked'],
      sfx: { tell: 'roar', swing: 'crunch' },
      openAfter: { when: ['hit'], open: 156, anim: 'hold', id: 'hold', comboLimit: 0 },
      animation: { windup: ['hugTell'], active: ['hug'], recovery: ['hug', 'idle1'] },
    },
    firstChampion: {
      name: 'THE FIRST CHAMPION', knockdown: true, noFake: true,
      windupFrames: 22, activeFrames: 10, recoveryFrames: 50, damage: 34,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [5, 19], starWindow: [5, 8], kdWindow: [12, 15], punishStar: ['dodged'],
      sfx: { tell: 'fanfare', swing: 'swingHeavy' },
      animation: { windup: ['crest'], active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    // the brawler
    { id: 'brawl', weight: 3, set: 'brawl', steps: [
      { idle: 26 }, { move: 'jab' }, { idle: 16 }, { move: 'jab' }, { idle: 18 }, { move: 'cross' }, { idle: 34 },
      { move: 'haymaker' }, { idle: 40 }, { move: 'jab' }, { idle: 18 }, { move: 'cross' }, { idle: 46 } ] },
    // the showman
    { id: 'show', weight: 3, set: 'show', steps: [
      { idle: 26 }, { move: 'poke' }, { idle: 18 }, { move: 'flourish' }, { idle: 20 }, { move: 'poke' }, { idle: 28 }, bow,
      { idle: 28 }, { move: 'flourish' }, { idle: 20 }, { move: 'jab' }, { idle: 24 }, { move: 'poke' }, { idle: 44 } ] },
    // the slugger
    { id: 'slug', weight: 3, set: 'slug', steps: [
      { idle: 28 }, { move: 'hook' }, { idle: 26 }, { move: 'body' }, { idle: 28 }, { move: 'clinch' }, { idle: 48 },
      { move: 'hook' }, { idle: 24 }, { move: 'body' }, { idle: 30 }, { move: 'jab' }, { idle: 46 } ] },
    // every era at once
    { id: 'echoes', weight: 1, script: 'echoes', steps: [
      { idle: 22 }, { move: 'haymaker' }, { idle: 30 }, { move: 'flourish' }, { idle: 18 }, { move: 'poke' }, { idle: 22 }, { move: 'clinch' }, { idle: 44 },
      { move: 'hook' }, { idle: 22 }, { move: 'cross' }, { idle: 40 } ] },
  ],

  super: { hit: 'head', move: 'firstChampion', golden: 'windup', window: [12, 15], taunt: 52, shout: 'THE FIRST CHAMPION!', times: [1, 2] },

  getUpTable: [ { upAt: [9, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null } ],


  // a champion: 3 exploits, 2 anti-strategies, 2 moments
  exploits: [
    {
      id: 'bareKnuckles', type: 'stunTrigger', name: 'BARE KNUCKLES',
      trigger: { state: 'windup', move: 'haymaker', counter: true, frames: [9, 13] },
      effect: { stun: 108, hits: 7, star: true, say: 'A BROKEN KNUCKLE!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'THE OLD BONES CRACK IN THE WINDUP OF THE HAYMAKER.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE BARE-KNUCKLE HAYMAKER: STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'oldBones', type: 'quirk', name: 'OLD BONES',
      trigger: { on: 'getUp' },
      effect: { open: { frames: 64, anim: 'stunned', comboLimit: 5, star: [0, 28] }, say: 'HIS OLD BONES CREAK!', sfx: 'creak' },
      hint: { kind: 'visual', text: 'A MAN THAT OLD DOESN\'T GET UP FAST.', hidden: true },
      scout: 'WHEN HE GETS UP AFTER A KNOCKDOWN HE\'S OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'firstOfMany', type: 'bait', name: 'FIRST OF MANY', limit: 2,
      trigger: { on: 'passive', frames: 300 },
      effect: { script: [{ open: 62, anim: 'taunt', id: 'preen', comboLimit: 4, star: [0, 26] }], say: 'HE ADMIRES HIS BELT!' },
      hint: { kind: 'quote', text: 'I WAS HERE FIRST.', hidden: true },
      scout: 'STAND STILL FOR 5 SECONDS AND HE STOPS TO ADMIRE HIS BELT: OPEN FOR 4 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'guardsHisMedals', type: 'starHoard', name: 'GUARDS THE GOLD', hold: 420, moves: ['jab', 'cross', 'poke', 'hook', 'body'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT PUNCH TAKES ONE, EVEN BLOCKED.',
    },
    {
      id: 'stillStanding', type: 'getUpMash', name: 'STILL STANDING', response: 'harder', punches: 3, mult: 1.3, say: 'STILL STANDING!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 30% HARDER.',
    },
  ],
  scriptedMoments: [
    { id: 'rollCall', name: 'ROLL CALL', when: { left: 90 }, say: 'ROLL CALL!', steps: [{ idle: 20 }, { move: 'jab' }, { idle: 16 }, { move: 'flourish' }, { idle: 20 }, { move: 'poke' }, { idle: 24 }, { move: 'hook' }] },
    { id: 'everyEra', name: 'EVERY ERA AT ONCE', when: { health: 0.35 }, say: 'EVERY ERA AT ONCE!', patterns: 'echoes', steps: [{ idle: 18 }] },
  ],
  special: [
    {
      type: 'phases',
      phases: [
        { from: 1, set: 'brawl', name: '1890S: BRAWLER', color: [28, 22, 12], shout: null, note: 'HE FIGHTS LIKE 1890.' },
        { from: 2, set: 'show', name: '1920S: SHOWMAN', color: [26, 26, 30], palette: 'oldguard.film', shout: 'THE ROARING TWENTIES!', note: 'NOW HE\'S A SHOWMAN: A CANE, A TWIRL THAT MEANS NOTHING, A BOW.' },
        { from: 3, set: 'slug', name: '1950S: SLUGGER', color: [26, 26, 26], palette: 'oldguard.tv', shout: 'BROADCAST LIVE!', note: 'NOW A SLUGGER: HOOKS, THE BELLY, AND THE BEAR HUG.' },
      ],
    },
    { type: 'clinch', timeout: 140, every: 26, damage: 4, heart: 1, letGo: { open: 58, anim: 'stunned', comboLimit: 5, star: [0, 26] } },
    { type: 'era', eras: [{ from: 1, look: 'sepia' }, { from: 2, look: 'film', dust: [28, 28, 30], dustDk: [5, 5, 8] }, { from: 3, look: 'tv', dust: [28, 28, 28], dustDk: [4, 4, 4] }] },
  ],
  titleDefense: null,
  gallery: 'THE GHOST OF THE FIRST CHAMPION. HE FIGHTS IN A DIFFERENT ERA OF THE HALL EACH ROUND.',
  medals: { signature: { text: 'NEVER GET CAUGHT IN HIS BEAR HUG.', check: 'noCue', cue: '!clinch' } },
  music: 'oldGuardEntrance',
};
