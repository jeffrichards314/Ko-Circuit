// #10 Pidge — Metro Circuit. The head-bob is a metronome.
// He bobs on a steady beat (head pecks down ON the beat, comes up on the
// OFF-beat) and every punch lands exactly on an off-beat, when his head is up.
// The tells are long and plain; the trick is timing your defense to the rhythm,
// not to the windup. Counter windows sit just before the punch, as always.
// Perfect hit: his cooing strut (the taunt), on exactly the right frames.

export default {
  id: 'pidge',
  name: 'PIDGE',
  short: 'PIDGE',
  nickname: 'THE BOB',
  circuit: 'metro',
  rank: 2,
  isChampion: false,
  card: {
    age: 27,
    weight: 139,
    record: '17-4 6KO',
    hometown: 'CENTRAL PARK BENCH 9',
    quote: 'COO. COO. ...SORRY. HABIT.',
  },
  lines: {
    win: 'THE BIRDS TAUGHT ME THAT ONE.',
    lose: 'SHOO. SHOO...',
  },

  build: 'lean',
  palette: 'pidge',
  spriteLayers: 'pidge',

  stats: {
    health: 140,
    damageMult: 1.15,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.35,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'none',
    stunFrames: 52,
    hitstun: 12,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['bob1', 'bob2'], rate: 14 },   // one bob = 28 frames = one beat
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['coo', 'strut'], rate: 14 },
    victory: ['coo'],
  },

  // windupFrames here are nominal: onBeat stretches each one to the next off-beat
  // at least `minWindup` frames away, and slides the windows with it.
  moves: {
    // his super: the Flock. Arms out like wings, a flurry of flaps, then down he comes
    flock: {
      name: 'THE FLOCK',
      windupFrames: 28, activeFrames: 10, recoveryFrames: 42,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [8, 25],
      starWindow: [10, 18],
      sfx: { tell: 'coo', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 4, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    peck: {
      name: 'PECK',
      onBeat: true,
      windupFrames: 22, activeFrames: 6, recoveryFrames: 20,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [8, 19],
      starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    peckQuick: {
      name: 'PECK (2)',
      onBeat: true, minWindup: 8,
      windupFrames: 18, activeFrames: 6, recoveryFrames: 22,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    wing: {
      name: 'WING HOOK',
      onBeat: true,
      windupFrames: 22, activeFrames: 8, recoveryFrames: 26,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [8, 19],
      starWindow: null,
      sfx: { tell: 'coo', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    crumbs: {
      name: 'BREADCRUMBS',
      onBeat: true,
      windupFrames: 22, activeFrames: 8, recoveryFrames: 24,
      damage: 11,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [8, 19],
      starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    flap: {
      name: 'FLAP ATTACK',
      onBeat: true,
      windupFrames: 26, activeFrames: 10, recoveryFrames: 38,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [8, 23],
      starWindow: [12, 21],
      sfx: { tell: 'coo', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 7, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'park', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 56 }, { move: 'peck' }, { idle: 56 }, { move: 'wing' }, { idle: 56 },
        { move: 'peck' }, { move: 'peckQuick' }, { idle: 56 }, { move: 'crumbs' }, { idle: 56 },
        { move: 'flap' }, { idle: 28 }, { taunt: 56 },
      ],
    },
    {
      id: 'feeding', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 56 }, { move: 'crumbs' }, { idle: 28 }, { move: 'peck' }, { move: 'peckQuick' },
        { idle: 56 }, { move: 'flap' }, { idle: 56 }, { move: 'wing' }, { idle: 28 }, { taunt: 56 },
      ],
    },
    {
      id: 'rushHourFlock', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 28 }, { move: 'peck' }, { move: 'peckQuick' }, { idle: 28 }, { move: 'wing' },
        { idle: 28 }, { move: 'crumbs' }, { move: 'peckQuick' }, { idle: 28 }, { move: 'flap' },
        { idle: 28 }, { move: 'peck' }, { move: 'peckQuick' }, { move: 'peckQuick' }, { idle: 28 }, { taunt: 56 },
      ],
    },
    {
      id: 'scatter', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 28 }, { move: 'wing' }, { idle: 14 }, { move: 'peck' }, { move: 'peckQuick' }, { move: 'peckQuick' },
        { idle: 28 }, { move: 'flap' }, { idle: 28 }, { move: 'crumbs' }, { idle: 14 }, { move: 'wing' },
        { idle: 28 }, { taunt: 56 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'flock', golden: 'taunt', window: [16, 19], taunt: 46, shout: 'COO COO!', times: [1, 2] },

  getUpTable: [
    { upAt: [3, 6], health: 0.6 },
    { upAt: [6, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.4, health: 0.35 },
    { upAt: null },
  ],



  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'lostTheBeat', type: 'stunTrigger', name: 'LOST THE BEAT',
      trigger: { state: 'idle', test: 'bobDown', lands: true, clean: 30 },
      effect: { open: { frames: 70, anim: 'stunned', comboLimit: 4 }, say: 'HE LOST THE BEAT!', sfx: 'coo' },
      hint: { kind: 'visual', text: 'HIS HEAD DIPS ON EVERY BEAT.' },
      scout: 'A PUNCH THAT LANDS ON HIS DOWN-BOB WHILE HE WAITS KNOCKS HIM OFF THE BEAT: 4 FREE HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'followsYou', type: 'dodgeBias', name: 'FOLLOWS YOU', moves: ['wing'],
      scout: 'SLIP THE SAME WAY EVERY TIME AND HIS WING HOOK COMES FROM THAT SIDE. WATCH WHICH WING HE CHAMBERS.',
    },
  ],
  special: [{ type: 'onBeat', period: 28, phase: 0.5, minWindup: 18, bob: 1 }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'RAISED ON A ROOFTOP WITH THE PIGEONS. HIS HEAD NEVER STOPS BOBBING AND HIS PUNCHES COME ON THE OFF-BEAT.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'COUNTER THE FLOCK.', check: 'counterMove', move: 'flock' } },
  music: 'pidgeWalkup', // his walk-up jingle (data/music/walkups.js)
};
