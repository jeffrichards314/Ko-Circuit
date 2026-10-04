// #34 Old Man Rourke — Legends Circuit. Sixty-one years old and forty of them
// in the ring. He plays possum: out of nowhere he staggers like he's out on his
// feet, gloves low, knees wobbling... but look at his face. He's WINKING.
// A real daze (after your counter) has both eyes rolling; the possum has one
// eye shut and a crooked grin, and he lets out a theatrical "OOF" going into it.
//   Punch the possum and he's gone: GOTCHA, SONNY. The punch bounces (hearts)
//   and he snaps straight back with a full-speed trap combo: slip right, slip
//   left, slip the uppercut. Slip that last one and he's wide open (a star).
//   Leave the possum alone and he snaps back anyway: SNAP BACK is a straight
//   right that opens a three-punch combo. Counter SNAP BACK and the combo never
//   comes; counter it on the glint and it's the old man who goes down (perfect hit).
// After a combo the old man really does need a breather (bent over, gloves on
// his knees): that one's real, hit him. The Haymaker of '68 is his one-hit knockdown.

const combo = (name, tell, act, avoid, windup, last) => ({
  name, windupFrames: windup, activeFrames: 5, recoveryFrames: last ? 40 : 3,
  damage: last ? 18 : 14,
  avoidBy: avoid,
  counterWindow: null, starWindow: null, noFake: true,
  punishStar: last ? ['dodged'] : undefined,
  sfx: { tell: last ? 'grunt' : undefined, swing: last ? 'swingHeavy' : 'whiff' },
  animation: { windup: [tell], active: [act], recovery: last ? [tell, 'overheadRecover', 'idle1'] : [act] },
});

export default {
  id: 'rourke',
  name: 'OLD MAN ROURKE',
  short: 'ROURKE',
  nickname: 'THE OLD FOX',
  circuit: 'legends',
  rank: 3,
  isChampion: false,
  card: {
    age: 61,
    weight: 181,
    record: '88-19 61KO',
    hometown: 'THE OLD DOCKS GYM',
    quote: 'I WAS FAKING IT BEFORE YOUR FATHER WAS BORN, SONNY.',
  },
  lines: {
    win: 'OLDEST TRICK IN THE BOOK. I WROTE THE BOOK.',
    lose: 'NOT... FAKING... THIS TIME...',
  },

  build: 'medium',
  palette: 'rourke',
  spriteLayers: 'rourke',

  stats: {
    health: 230,
    damageMult: 1.5,
    stunResistance: 4,
    heartDrainOnBlock: 3,
    starLossChance: 0.5,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 46,
    hitstun: 12,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 26 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['beckon1', 'beckon2'], rate: 12 },
    victory: ['victory'],
    possum: { frames: ['possum1', 'possum2'], rate: 16 },
    winded: { frames: ['winded1', 'winded2'], rate: 18 },
  },

  moves: {
    oldJab: {
      name: 'OLD-SCHOOL JAB',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 20,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    liverHook: {
      name: 'LIVER HOOK',
      windupFrames: 9, activeFrames: 7, recoveryFrames: 22,
      damage: 15,
      height: 'low',
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    hook: {
      name: 'BACK-ALLEY HOOK',
      windupFrames: 10, activeFrames: 7, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 8],
      starWindow: [2, 3],
      sfx: { tell: 'creak', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // one-hit knockdown: the punch that won him the title in '68
    haymaker: {
      name: 'HAYMAKER OF \'68',
      knockdown: true,
      windupFrames: 18, activeFrames: 10, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 14],
      starWindow: [3, 5],
      noFake: true,
      sfx: { tell: 'creakBig', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // he waited out the possum: SNAP BACK (the perfect-hit moment) + the combo
    snapBack: {
      name: 'SNAP BACK',
      windupFrames: 14, activeFrames: 6, recoveryFrames: 3,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 11],
      starWindow: [3, 5],
      kdWindow: [8, 11],
      cancels: 3,
      noFake: true,
      sfx: { tell: 'snort', swing: 'whiff' },
      animation: { windup: ['snapTell'], active: ['jabR'], recovery: ['jabR'] },
    },
    snapA: combo('SNAP (2)', 'jabTell', 'jab', ['dodgeL', 'dodgeR'], 8),
    snapB: combo('SNAP (3)', 'hookTell', 'hook', ['dodgeL'], 8),
    snapC: combo('SNAP UPPERCUT', 'upperTell', 'upper', ['dodgeL', 'dodgeR'], 10, true),
    // you punched the possum: GOTCHA
    trapA: combo('GOTCHA HOOK', 'hookLTell', 'hookL', ['dodgeR'], 12),
    trapB: combo('GOTCHA HOOK (2)', 'hookTell', 'hook', ['dodgeL'], 8),
    trapC: combo('GOTCHA UPPERCUT', 'upperTell', 'upper', ['dodgeL', 'dodgeR'], 10, true),
  },

  patterns: [
    {
      id: 'lesson', weight: 3,
      when: { health: [0.45, 1] },
      steps: [
        { idle: 28 }, { move: 'oldJab' }, { idle: 22 }, { move: 'liverHook' }, { idle: 22 }, { move: 'hook' },
        { idle: 22 }, { move: 'oldJab' }, { idle: 30 }, { taunt: 40 },
      ],
    },
    {
      id: 'possum', weight: 3, fixed: true,
      when: { health: [0.45, 1] },
      steps: [
        { idle: 26 }, { move: 'oldJab' }, { idle: 22 },
        { open: 72, anim: 'possum', id: 'possum', trap: true, sfx: 'oof' },
        { move: 'snapBack' }, { move: 'snapA' }, { move: 'snapB' }, { move: 'snapC' },
        { idle: 16 }, { open: 44, anim: 'winded', star: [2, 14], interrupt: true, stunOnInterrupt: 30, sfxLoop: 'pant', sfxEvery: 22 },
        { idle: 20 },
      ],
    },
    {
      id: 'sixtyEight', weight: 2,
      when: { health: [0.45, 1] },
      steps: [
        { idle: 26 }, { move: 'hook' }, { idle: 20 }, { move: 'haymaker' }, { idle: 24 }, { move: 'liverHook' },
        { idle: 20 }, { move: 'oldJab' }, { idle: 30 }, { taunt: 40 },
      ],
    },
    {
      id: 'oldFox', weight: 1, fixed: true,
      when: { health: [0, 0.45] },
      steps: [
        { idle: 20 }, { open: 60, anim: 'possum', id: 'possum', trap: true, sfx: 'oof' },
        { move: 'snapBack' }, { move: 'snapA' }, { move: 'snapB' }, { move: 'snapC' },
        { idle: 18 }, { move: 'haymaker' }, { idle: 22 }, { move: 'liverHook' }, { idle: 18 },
        { open: 56, anim: 'possum', id: 'possum', trap: true, sfx: 'oof' },
        { move: 'snapBack' }, { move: 'snapA' }, { move: 'snapB' }, { move: 'snapC' },
        { idle: 14 }, { open: 40, anim: 'winded', star: [2, 12], interrupt: true, stunOnInterrupt: 28, sfxLoop: 'pant', sfxEvery: 22 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'snapBack', then: ['snapA', 'snapB', 'snapC'], keep: true, golden: 'windup', taunt: 38, shout: 'NOT DEAD YET!', times: [1, 2] },
  // more supers (super.js): each armored from its first frame to its last attack, each with one golden moment
  supers: [
    { hit: 'head', move: 'haymaker', inline: true, golden: 'windup', window: [10, 13] },
  ],

  getUpTable: [
    { upAt: [8, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'blownForReal', type: 'stunTrigger', name: 'BLOWN FOR REAL',
      trigger: { state: 'open', open: 'winded', height: 'low' },
      effect: { stun: 104, hits: 7, say: 'THE OLD MAN\'S BLOWN!', sfx: 'oof' },
      hint: { kind: 'audio', text: 'THE REAL BREATHER HAS THE PANTING. THE POSSUM ONLY GROANS.' },
      scout: 'A BODY SHOT WHILE HE\'S REALLY WINDED KNOCKS THE WIND OUT OF HIM: STUNNED FOR 7 HITS.',
    },
    {
      id: 'gotchaBackfire', type: 'quirk', name: 'GOTCHA BACKFIRES',
      trigger: { on: 'resolved', move: 'trapC', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 8, star: [0, 40] }, say: 'GOTCHA... NOT!', sfx: 'thud' },
      hint: { kind: 'quote', text: 'GOTCHA, SONNY!' },
      scout: 'SLIP THE LAST PUNCH OF HIS POSSUM TRAP: THE OLD FOX IS OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'oldMansPatience', type: 'earlyDodge', name: 'THE OLD MAN\'S PATIENCE', response: 'hold', moves: ['haymaker'], say: 'HE WAITS ON IT!',
      scout: 'SLIP THE HAYMAKER OF \'68 TOO EARLY AND THE OLD MAN HOLDS IT UNTIL YOUR SLIP RUNS OUT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'sixtyEightMoment', name: 'THE HAYMAKER ROUND', when: { left: 60 }, say: 'HERE COMES \'68!',
      steps: [{ idle: 20 }, { move: 'oldJab' }, { idle: 14 }, { move: 'hook' }, { idle: 14 }, { move: 'haymaker' }],
    },
  ],
  special: [{ type: 'possum', step: 'possum', trap: ['trapA', 'trapB', 'trapC'] }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE OLDEST MAN IN THE HALL OF FAME. HE PLAYS HURT, AND HE\'S LYING EVERY TIME.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER FALL FOR THE POSSUM.', check: 'noCue', cue: '!possumTrap' } },
  music: 'rourkeWalkup', // his walk-up jingle (data/music/walkups.js)
};
