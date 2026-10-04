// #7 Professor Knox — Minor Circuit. Counters any combo you use twice in a row.
// Throw the same 2+ punch combination twice in a row and he parries the second
// one ("!"), adjusts his glasses and fires back a fast Rebuttal. Mix up hands,
// heights and rhythm. His own attacks are textbook, and he LOVES a pause to lecture.

export default {
  id: 'knox',
  name: 'PROFESSOR KNOX',
  short: 'KNOX',
  nickname: 'THE THEORIST',
  circuit: 'minor',
  rank: 1,
  isChampion: false,
  card: {
    age: 58,
    weight: 176,
    record: '21-9 7KO',
    hometown: 'IVY HALL',
    quote: 'I HAVE STUDIED YOUR TAPES. ALL SEVEN MINUTES OF THEM.',
  },
  lines: {
    win: 'AS PREDICTED. CLASS DISMISSED.',
    lose: 'FASCINATING. I SHALL NEED TO REVISE MY THEORY.',
  },

  build: 'medium',
  palette: 'knox',
  spriteLayers: 'knox',

  stats: {
    health: 140,
    damageMult: 1.15,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.35,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 56,
    hitstun: 13,
    betweenRoundHeal: 0.25,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 26 },
    block: ['ponder'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 18 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['lecture'],
    victory: { frames: ['victory', 'lecture'], rate: 40 }, // arms up, then his taunt pose (§2: its own frame)
    notes: ['ponder'], // pushing up his glasses to take notes (his exploit)
  },

  moves: {
    // his super: the Final Exam. He ponders the question, then marks you twice: head, then body
    finalExam: {
      name: 'FINAL EXAM',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 6,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [10, 27],
      starWindow: [12, 20],
      sfx: { tell: 'aha', swing: 'swingHeavy' },
      animation: { windup: ['ponder', 'hookTell'], windupRate: 15, active: ['hook'], recovery: ['hook'] },
    },
    finalExam2: {
      name: 'FINAL EXAM (2)',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 36,
      damage: 12,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    popQuiz: {
      name: 'POP QUIZ',
      windupFrames: 26, activeFrames: 8, recoveryFrames: 22,
      damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [10, 23],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    footnote: {
      name: 'FOOTNOTE',
      windupFrames: 26, activeFrames: 8, recoveryFrames: 24,
      damage: 9,
      avoidBy: ['block', 'duck'],
      counterWindow: [10, 23],
      starWindow: null,
      height: 'low',
      sfx: { tell: 'tick', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    thesis: {
      name: 'THESIS',
      windupFrames: 32, activeFrames: 8, recoveryFrames: 36,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [12, 29],
      starWindow: [14, 26],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    peerReview: {
      name: 'PEER REVIEW',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 34,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [10, 27],
      starWindow: null,
      sfx: { tell: 'tick', swing: 'swingHeavy' },
      animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
    },
    // fired back after he reads a repeated combo
    rebuttal: {
      name: 'REBUTTAL',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 26,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: null,
      starWindow: null,
      sfx: { tell: 'aha', swing: 'whiff' },
      animation: { windup: ['ponder', 'jabRTell'], windupRate: 10, active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'syllabus', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 60 }, { move: 'popQuiz' }, { idle: 50 }, { move: 'footnote' }, { idle: 50 },
        { move: 'thesis' }, { idle: 60 }, { move: 'peerReview' }, { idle: 40 }, { taunt: 70 },
      ],
    },
    {
      id: 'midterm', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 44 }, { move: 'popQuiz' }, { idle: 20 }, { move: 'popQuiz' }, { idle: 40 },
        { move: 'peerReview' }, { idle: 36 }, { move: 'footnote' }, { idle: 30 }, { move: 'thesis' },
        { idle: 40 }, { taunt: 60 },
      ],
    },
    {
      id: 'finals', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 36 }, { move: 'thesis' }, { idle: 30 }, { move: 'footnote' }, { idle: 20 },
        { move: 'popQuiz' }, { idle: 30 }, { move: 'peerReview' }, { idle: 24 }, { move: 'thesis' },
        { idle: 50 }, { taunt: 50 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'finalExam', then: ['finalExam2'], golden: 'taunt', window: [20, 24], taunt: 48, shout: 'FINAL EXAM!', times: [1, 2] },

  getUpTable: [
    { upAt: [5, 7], health: 0.6 },
    { upAt: [7, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.45, health: 0.4 },
    { upAt: null },
  ],


  // perfect hit: one punch on exactly these frames of his taunt drops him

  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'takingNotes', type: 'bait', name: 'TAKING NOTES',
      trigger: { on: 'resolved', move: 'rebuttal', result: ['dodged', 'blocked'] },
      effect: { open: { frames: 90, anim: 'notes', comboLimit: 3 }, say: 'HE\'S TAKING NOTES!', sfx: 'aha' },
      hint: { kind: 'trainer', text: 'HE STOPS TO WRITE DOWN WHAT HE LEARNED.' },
      scout: 'SLIP OR BLOCK HIS REBUTTAL AND HE STOPS TO TAKE NOTES: 3 FREE HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'readsCombos', type: 'comboRepeat', name: 'READS YOUR COMBOS', builtIn: 'read',
      scout: 'THROW THE SAME COMBO TWICE IN A ROW AND HE CATCHES THE SECOND ONE AND FIRES BACK A REBUTTAL.',
    },
  ],
  special: [{ type: 'comboReader', move: 'rebuttal', gap: 45 }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A RETIRED BOXING PROFESSOR. HE HAS STUDIED EVERY COMBO EVER THROWN, SO DON\'T THROW ONE TWICE.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER LET HIM READ A COMBO.', check: 'noCue', cue: '!read' } },
  music: 'knoxWalkup', // his walk-up jingle (data/music/walkups.js)
};
