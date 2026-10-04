// #24 Doc Sutures — Continental Circuit. Thirty years as a cutman. Now he's the patient.
// He knows every trick for closing a cut, and once per fight, in his corner, he
// uses all of them: the first time he walks back to his stool below 80% health
// he stitches himself up to FULL. The med-kit badge by the clock shows whether
// he still has it. Make him use it early, or knock him out before he gets there.
// In the fight he stops to slap on a bandage (a little heal): hit him while he
// does it to rip it off (star). The In-and-Out is a hook to the body and an
// uppercut straight after: slip the first one, not block it, or the uppercut
// catches you still covering. His Anaesthetic is a one-hit knockdown: slip it.
// Perfect hit: counter the Anaesthetic on the glint.

export default {
  id: 'sutures',
  name: 'DOC SUTURES',
  short: 'DOC',
  nickname: 'THE CUTMAN',
  circuit: 'continental',
  rank: 1,
  isChampion: false,
  card: {
    age: 58,
    weight: 181,
    record: '31-7 15KO',
    hometown: 'THE CORNER STOOL',
    quote: 'HOLD STILL. THIS WILL ONLY HURT A LOT.',
  },
  lines: {
    win: 'TAKE TWO OF THESE AND CALL ME IN THE MORNING.',
    lose: 'DOCTOR... DOWN... NEED A DOCTOR...',
  },

  build: 'medium',
  palette: 'sutures',
  spriteLayers: 'sutures',

  stats: {
    health: 190,
    damageMult: 1.3,
    stunResistance: 3,
    heartDrainOnBlock: 2,
    starLossChance: 0.45,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 48,
    hitstun: 13,
    betweenRoundHeal: 0.15,
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
    taunt: ['snapGlove'],
    victory: { frames: ['victory', 'snapGlove'], rate: 40 }, // arms up, then his taunt pose (§2: its own frame)
    patch: { frames: ['patch1', 'patch2'], rate: 10 },
  },

  moves: {
    probe: {
      name: 'PROBE',
      windupFrames: 16, activeFrames: 6, recoveryFrames: 22,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 12],
      starWindow: null,
      sfx: { tell: 'tick', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    incision: {
      name: 'INCISION',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 26,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 14],
      starWindow: null,
      sfx: { tell: 'stitch', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // the in-and-out: to the body, then the uppercut. Slip the first one.
    inOut1: {
      name: 'IN-AND-OUT',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 4,
      damage: 13,
      height: 'low',
      avoidBy: ['block', 'dodgeL', 'dodgeR'],
      counterWindow: [4, 14],
      starWindow: null,
      cancels: 1,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['body'] },
    },
    inOut2: {
      name: 'IN-AND-OUT (2)',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 34,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null,
      noFake: true,
      punishStar: ['dodged'],
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    lancet: {
      name: 'LANCET',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 24,
      damage: 14,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [4, 14],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    // one-hit knockdown: he snaps his glove like a surgeon before a big one
    anaesthetic: {
      name: 'ANAESTHETIC',
      knockdown: true,
      windupFrames: 30, activeFrames: 10, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [6, 24],
      starWindow: [8, 16],
      kdWindow: [18, 21],  // perfect hit
      noFake: true,
      sfx: { tell: 'snap', swing: 'swingHeavy' },
      animation: { windup: ['scrubTell', 'overheadTell1', 'overheadTell2'], windupRate: 10, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'checkup', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'probe' }, { idle: 40 }, { move: 'incision' }, { idle: 40 }, { move: 'lancet' },
        { idle: 40 }, { move: 'inOut1' }, { move: 'inOut2' }, { idle: 40 }, { move: 'anaesthetic' }, { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'bedside', weight: 2,
      when: { rounds: [1], health: [0, 0.8] },
      steps: [
        { idle: 40 }, { open: 60, anim: 'patch', heal: 0.08, interrupt: true, star: [0, 40], id: 'patch', limit: 4, sfx: 'stitch' },
        { idle: 36 }, { move: 'incision' }, { idle: 36 }, { move: 'probe' }, { idle: 40 }, { move: 'anaesthetic' }, { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'surgery', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 34 }, { move: 'lancet' }, { idle: 24 }, { move: 'inOut1' }, { move: 'inOut2' }, { idle: 30 },
        { move: 'anaesthetic' }, { idle: 30 }, { move: 'probe' }, { idle: 20 }, { move: 'incision' }, { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'triage', weight: 2,
      when: { rounds: [2, 3], health: [0, 0.8] },
      steps: [
        { idle: 30 }, { move: 'incision' }, { idle: 26 },
        { open: 54, anim: 'patch', heal: 0.08, interrupt: true, star: [0, 34], id: 'patch', limit: 4, sfx: 'stitch' },
        { idle: 30 }, { move: 'inOut1' }, { move: 'inOut2' }, { idle: 26 }, { move: 'lancet' }, { idle: 20 }, { move: 'anaesthetic' },
        { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'codeBlue', weight: 1,
      when: { health: [0, 0.4] },
      steps: [
        { idle: 24 }, { move: 'anaesthetic' }, { idle: 24 }, { move: 'inOut1' }, { move: 'inOut2' }, { idle: 20 },
        { open: 50, anim: 'patch', heal: 0.08, interrupt: true, star: [0, 30], id: 'patch', limit: 4, sfx: 'stitch' },
        { idle: 24 }, { move: 'probe' }, { idle: 16 }, { move: 'incision' }, { idle: 20 }, { move: 'anaesthetic' }, { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'anaesthetic', golden: 'recovery', window: [12, 15], taunt: 42, shout: 'SAY AHH!', times: [1, 2] },

  getUpTable: [
    { upAt: [5, 8], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'medKitSpill', type: 'quirk', name: 'MED KIT SPILL',
      trigger: { state: 'open', open: 'patch', star: true },
      effect: { keep: true, mod: { stitched: 1 }, say: 'THE MED KIT SPILLS!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'THE MED KIT SITS OPEN AT HIS FEET WHILE HE BANDAGES.' },
      scout: 'A STAR PUNCH WHILE HE BANDAGES SPILLS HIS MED KIT: NO FULL-HEALTH STITCH-UP FOR THE REST OF THE FIGHT.',
    },
    {
      id: 'slippedLancet', type: 'patternBreak', name: 'SLIPPED LANCET',
      trigger: { on: 'resolved', move: 'lancet', result: 'blocked' },
      effect: { open: { frames: 60, anim: 'stunned', comboLimit: 3 }, say: 'HIS HAND SLIPPED!', sfx: 'oof' },
      hint: { kind: 'trainer', text: 'THE LANCET GOES LOW, AND BLOCKING IT IS THE ANSWER.' },
      scout: 'BLOCK THE LANCET: HIS HAND SLIPS AND HE\'S OPEN FOR 3 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'padsUp', type: 'zoneBias', name: 'PADS UP', streak: 4, frames: 420, say: 'HE PADS UP!',
      scout: 'FOUR PUNCHES IN A ROW TO THE SAME PLACE AND HE PADS IT UP: THOSE PUNCHES BOUNCE OFF FOR 7 SECONDS.',
    },
  ],
  scriptedMoments: [
    {
      id: 'codeBlueRound', name: 'CODE BLUE', when: { health: 0.35 }, say: 'CODE BLUE!',
      steps: [
        { move: 'lancet' }, { idle: 20 }, { move: 'inOut1' }, { move: 'inOut2' }, { idle: 30 },
        { open: 50, anim: 'patch', heal: 0.08, interrupt: true, star: [0, 30], id: 'patch', limit: 4, sfx: 'stitch' },
      ],
    },
  ],
  special: [{ type: 'cutman', below: 0.8, note: 'DOC STITCHED UP: FULL HP!' }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'AN EX-CUTMAN WHO STITCHED UP CHAMPIONS FOR THIRTY YEARS. NOW HE STITCHES UP HIMSELF.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER LET HIM FINISH STITCHING HIMSELF UP.', check: 'noOpenDone', id: 'patch' } },
  music: 'suturesWalkup', // his walk-up jingle (data/music/walkups.js)
};
