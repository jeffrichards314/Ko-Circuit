// #18 Pockets the Clown — Carnival Circuit. The horn lies. Sometimes.
// Every windup comes with a squeak of his horn, and every windup looks the
// same. Real ones: he squeezes the BULB HORN on his belt (it flattens) and it
// goes HONK-HONK, low and fat. Fakes: his hand stays off the horn and you hear a
// thin squeaky-toy SQUEAK from his pocket, and no punch comes. Punch a fake for
// a free counter.
// Perfect hit: his juggling act (the taunt), on exactly the right frames.

export default {
  id: 'pockets',
  name: 'POCKETS THE CLOWN',
  short: 'POCKETS',
  nickname: 'THE GIGGLE',
  circuit: 'carnival',
  rank: 3,
  isChampion: false,
  card: {
    age: 47,
    weight: 177,
    record: '18-18 9KO',
    hometown: 'A VERY SMALL CAR',
    quote: 'HONK HONK. ...OR IS IT?',
  },
  lines: {
    win: 'PIE\'S ON YOU! HONK!',
    lose: 'NOBODY EVER LAUGHS AT THE SAD CLOWN...',
  },

  build: 'medium',
  palette: 'pockets',
  spriteLayers: 'pockets',

  stats: {
    health: 170,
    damageMult: 1.2,
    stunResistance: 2,
    heartDrainOnBlock: 2,
    starLossChance: 0.4,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'none',
    stunFrames: 50,
    hitstun: 13,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 18 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['juggle1', 'juggle2'], rate: 10 },
    victory: { frames: ['victory', 'juggle1'], rate: 40 }, // arms up, then his taunt pose (§2: its own frame)
  },

  moves: {
    // his super: the Pie Cannon. Pies in both hands, a big wind-up, then the whole tray
    pieCannon: {
      name: 'PIE CANNON',
      windupFrames: 22, activeFrames: 10, recoveryFrames: 44,
      damage: 20,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 19],
      starWindow: [6, 14],
      noFake: true,
      sfx: { tell: 'honk', swing: 'splash' },
      animation: { windup: ['hookTellH', 'overheadTellH1', 'overheadTellH2'], windupRate: 7, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // --- the real thing: horn squeezed, HONK-HONK ---
    seltzer: {
      name: 'SELTZER JAB',
      windupFrames: 14, activeFrames: 6, recoveryFrames: 22,
      damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 11],
      starWindow: null,
      sfx: { tell: 'honk', swing: 'whiff' },
      animation: { windup: ['jabTellH'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    chicken: {
      name: 'RUBBER CHICKEN',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 26,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 13],
      starWindow: null,
      sfx: { tell: 'honk', swing: 'swingHeavy' },
      animation: { windup: ['hookTellH'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    bigShoe: {
      name: 'BIG SHOE',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 26,
      damage: 14,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [4, 13],
      starWindow: null,
      sfx: { tell: 'honk', swing: 'whiff' },
      animation: { windup: ['bodyTellH'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    pie: {
      name: 'PIE IN THE SKY',
      windupFrames: 20, activeFrames: 10, recoveryFrames: 40,
      damage: 18,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 17],
      starWindow: [6, 13],
      sfx: { tell: 'honk', swing: 'swingHeavy' },
      animation: { windup: ['overheadTellH1', 'overheadTellH2'], windupRate: 5, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // --- the fakes: hand off the horn, a thin SQUEAK, nothing comes ---
    fakeSeltzer: {
      name: 'SQUEAK (JAB)',
      feint: true,
      windupFrames: 14, activeFrames: 0, recoveryFrames: 8,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 13],
      starWindow: null,
      sfx: { tell: 'squeak' },
      animation: { windup: ['jabTell'], active: ['jabTell'], recovery: ['idle1'] },
    },
    fakeChicken: {
      name: 'SQUEAK (HOOK)',
      feint: true,
      windupFrames: 16, activeFrames: 0, recoveryFrames: 8,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 15],
      starWindow: [3, 9],
      sfx: { tell: 'squeak' },
      animation: { windup: ['hookTell'], active: ['hookTell'], recovery: ['idle1'] },
    },
    fakePie: {
      name: 'SQUEAK (PIE)',
      feint: true,
      windupFrames: 20, activeFrames: 0, recoveryFrames: 10,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 19],
      starWindow: [3, 12],
      sfx: { tell: 'squeak' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 5, active: ['overheadTell2'], recovery: ['idle1'] },
    },
  },

  patterns: [
    {
      id: 'warmUpAct', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'seltzer' }, { idle: 40 }, { move: 'fakeChicken' }, { idle: 20 }, { move: 'chicken' },
        { idle: 40 }, { move: 'bigShoe' }, { idle: 40 }, { move: 'fakePie' }, { idle: 30 }, { move: 'pie' },
        { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'slapstick', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'fakeSeltzer' }, { idle: 16 }, { move: 'seltzer' }, { idle: 36 }, { move: 'bigShoe' },
        { idle: 40 }, { move: 'pie' }, { idle: 40 }, { move: 'fakeChicken' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'bigTopFinale', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'fakeSeltzer' }, { move: 'chicken' }, { idle: 24 }, { move: 'fakePie' }, { move: 'bigShoe' },
        { idle: 30 }, { move: 'seltzer' }, { idle: 16 }, { move: 'fakeChicken' }, { idle: 12 }, { move: 'pie' },
        { idle: 36 }, { taunt: 44 },
      ],
    },
    {
      id: 'pratfall', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'pie' }, { idle: 24 }, { move: 'fakeSeltzer' }, { move: 'fakeChicken' }, { move: 'seltzer' },
        { idle: 24 }, { move: 'bigShoe' }, { idle: 20 }, { move: 'chicken' }, { idle: 36 }, { taunt: 44 },
      ],
    },
    {
      id: 'sadClown', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 24 }, { move: 'fakePie' }, { move: 'pie' }, { idle: 20 }, { move: 'fakeSeltzer' }, { move: 'seltzer' },
        { idle: 16 }, { move: 'fakeChicken' }, { move: 'chicken' }, { idle: 20 }, { move: 'bigShoe' },
        { idle: 30 }, { taunt: 40 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'pieCannon', golden: 'taunt', window: [14, 17], taunt: 42, shout: 'PIE TIME!', times: [1, 2] },

  getUpTable: [
    { upAt: [4, 7], health: 0.6 },
    { upAt: [6, 9], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.4, health: 0.35 },
    { upAt: null },
  ],



  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'pieFace', type: 'stunTrigger', name: 'PIE IN HIS OWN FACE',
      trigger: { on: 'resolved', move: 'pie', result: 'ducked' },
      effect: { open: { frames: 80, anim: 'stunned', comboLimit: 5 }, say: 'PIE IN HIS OWN FACE!', sfx: 'splash' },
      hint: { kind: 'trainer', text: 'WHAT GOES UP MUST COME DOWN.' },
      scout: 'DUCK THE PIE IN THE SKY AND IT LANDS IN HIS OWN FACE: 5 FREE HITS.',
    },
    {
      id: 'stuckHorn', type: 'stunTrigger', name: 'STUCK HORN',
      trigger: { state: 'windup', move: ['seltzer', 'chicken', 'bigShoe', 'pie'], frames: [4, 6], counter: true, clean: 20 },
      effect: { open: { frames: 70, anim: 'hitHigh', comboLimit: 4 }, say: 'HIS HORN IS STUCK!', sfx: 'honk' },
      hint: { kind: 'audio', text: 'HIT HIM ON THE HONK ITSELF.' },
      scout: 'A COUNTER RIGHT ON THE HONK OF A REAL PUNCH JAMS HIS HORN: 4 FREE HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'seltzerSurprise', type: 'rushing', name: 'SELTZER SURPRISE', count: 2, span: 150, counter: 'seltzer', say: 'SPRITZ!',
      scout: 'SWING AT HIM WHEN HE ISN\'T OPEN AND HE SPRITZES YOU WITH A QUICK SELTZER JAB.',
    },
  ],
  scriptedMoments: [
    {
      id: 'clownCar', name: 'CLOWN CAR', when: { left: 60 }, say: 'HONK! HONK! HONK!',
      steps: [{ move: 'fakeSeltzer' }, { idle: 10 }, { move: 'fakeChicken' }, { idle: 10 }, { move: 'fakePie' }, { idle: 16 }, { move: 'pie' }],
    },
  ],
  special: [],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A SAD CLOWN WITH A HORN FOR EVERY OCCASION. SOME HONKS MEAN A PUNCH. SOME ARE JUST JOKES.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'COUNTER THE PIE CANNON.', check: 'counterMove', move: 'pieCannon' } },
  music: 'pocketsWalkup', // his walk-up jingle (data/music/walkups.js)
};
