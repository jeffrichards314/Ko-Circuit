// #17 The Strongman — Carnival Circuit. Flexes to power up.
// Every so often he stops and hits a double-biceps pose. If he holds it to the
// end he glows red-hot and his NEXT punch hits twice as hard. Hit him during
// the flex and the pose collapses: the charge is gone, he's stunned, and the
// first hit earns a star. Carnival tells are short (14 frames); the flex is
// the gift.
// Perfect hit: The Big Lift uppercut, on exactly the right frames.

export default {
  id: 'strongman',
  name: 'THE STRONGMAN',
  short: 'STRONGMAN',
  nickname: 'THE MIGHTY',
  circuit: 'carnival',
  rank: 4,
  isChampion: false,
  card: {
    age: 39,
    weight: 290,
    record: '26-8 22KO',
    hometown: 'TENT NUMBER 3',
    quote: 'I LIFT THE PIANO. THEN I LIFT THE MAN PLAYING IT.',
  },
  lines: {
    win: 'TOO LIGHT! NEXT!',
    lose: 'I HAVE... PULLED... EVERYTHING.',
  },

  build: 'heavy',
  palette: 'strongman',
  spriteLayers: 'strongman',

  stats: {
    health: 190,
    damageMult: 1.25,
    stunResistance: 4,
    heartDrainOnBlock: 2,
    starLossChance: 0.45,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 50,
    hitstun: 14,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 30 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 18 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['twirl'],
    victory: { frames: ['flex1', 'flex2'], rate: 20 },
    flex: { frames: ['flex1', 'flex2'], rate: 16 },
  },

  moves: {
    dumbbell: {
      name: 'DUMBBELL JAB',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 22,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 11],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    curl: {
      name: 'BICEP CURL',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 28,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 13],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    kettlebell: {
      name: 'KETTLEBELL',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 28,
      damage: 15,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [4, 13],
      starWindow: null,
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    press: {
      name: 'BARBELL PRESS',
      windupFrames: 20, activeFrames: 10, recoveryFrames: 40,
      damage: 19,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 17],
      starWindow: [6, 13],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 5, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    bigLift: {
      name: 'THE BIG LIFT',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 44,
      damage: 21,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 19],
      starWindow: [6, 14],
      kdWindow: [15, 18],  // perfect hit
      sfx: { tell: 'powerUp', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  // the flex is an `open` step (id 'flex'): the charge modifier watches it
  patterns: [
    {
      id: 'warmUp', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'dumbbell' }, { idle: 40 },
        { open: 70, anim: 'flex', id: 'flex', interrupt: true, stunOnInterrupt: 44, star: [0, 34], sfx: 'powerUp' },
        { idle: 16 }, { move: 'press' }, { idle: 40 }, { move: 'kettlebell' }, { idle: 36 }, { move: 'curl' },
        { idle: 40 }, { move: 'bigLift' }, { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'showOff', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'curl' }, { idle: 30 },
        { open: 70, anim: 'flex', id: 'flex', interrupt: true, stunOnInterrupt: 44, star: [0, 34], sfx: 'powerUp' },
        { idle: 16 }, { move: 'bigLift' }, { idle: 40 }, { move: 'dumbbell' }, { idle: 30 }, { move: 'kettlebell' },
        { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'heavySet', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'kettlebell' }, { idle: 20 }, { move: 'dumbbell' }, { idle: 24 },
        { open: 60, anim: 'flex', id: 'flex', interrupt: true, stunOnInterrupt: 40, star: [0, 28], sfx: 'powerUp' },
        { idle: 12 }, { move: 'curl' }, { idle: 30 }, { move: 'press' }, { idle: 30 }, { move: 'bigLift' },
        { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'maxOut', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 30 },
        { open: 56, anim: 'flex', id: 'flex', interrupt: true, stunOnInterrupt: 40, star: [0, 26], sfx: 'powerUp' },
        { idle: 10 }, { move: 'press' }, { idle: 24 }, { move: 'dumbbell' }, { idle: 12 }, { move: 'kettlebell' },
        { idle: 20 },
        { open: 56, anim: 'flex', id: 'flex', interrupt: true, stunOnInterrupt: 40, star: [0, 26], sfx: 'powerUp' },
        { idle: 10 }, { move: 'bigLift' }, { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'bigLift', golden: 'windup', taunt: 44, shout: 'THE BIG LIFT!', times: [1, 2] },
  // more supers (super.js): each armored from its first frame to its last attack, each with one golden moment
  supers: [
    { key: 'flex', name: 'THE FLEX', inline: true, armorOpen: 'flex', golden: 'open', open: 'flex', window: [24, 31], hit: 'body', from: 'pulledMuscle' },
  ],

  getUpTable: [
    { upAt: [5, 7], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      // (2026-10-02: the flex became a super, so Pulled a Muscle is its golden moment and Backfire went: a new exploit keeps K4's count)
      id: 'droppedKettlebell', type: 'quirk', name: 'DROPPED THE KETTLEBELL',
      trigger: { on: 'resolved', move: 'kettlebell', result: 'blocked' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 5, star: [0, 34] }, say: 'HE DROPPED IT!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'THE KETTLEBELL THUDS WHEN IT HITS SOMETHING SOLID.' },
      scout: 'BLOCK THE KETTLEBELL: IT BOUNCES OFF YOUR GLOVES, HE DROPS IT AND IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'flexesThrough', type: 'jabSpam', name: 'FLEXES THROUGH JABS', streak: 3, counter: 'curl', say: 'BOUNCED OFF THE MUSCLE!',
      scout: 'THREE JABS IN A ROW AND HE FLEXES THE THIRD ONE OFF, THEN CURLS ONE INTO YOUR JAW.',
    },
  ],
  scriptedMoments: [
    {
      id: 'personalBest', name: 'PERSONAL BEST', when: { health: 0.45 }, say: 'GOING FOR A PERSONAL BEST!',
      steps: [
        { open: 56, anim: 'flex', id: 'flex', interrupt: true, stunOnInterrupt: 40, star: [0, 26], sfx: 'powerUp' }, { idle: 10 }, { move: 'press' }, { idle: 20 },
        { open: 56, anim: 'flex', id: 'flex', interrupt: true, stunOnInterrupt: 40, star: [0, 26], sfx: 'powerUp' }, { idle: 10 }, { move: 'press' },
      ],
    },
  ],
  stateTriggers: [
    { id: 'seesRed', name: 'SEES RED', on: 'hitStreak', n: 5, do: { enrage: 300, speed: 0.9, recovery: 1.5 }, say: 'HE SEES RED!' },
  ],
  special: [{ type: 'charge', step: 'flex', mult: 2, palette: 'strongman.power' }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE CARNIVAL\'S STRONGEST MAN. EVERY FLEX MAKES THE NEXT PUNCH BIGGER, SO DON\'T LET HIM FINISH ONE.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER LET A FLEX FINISH.', check: 'noOpenDone', id: 'flex' } },
  music: 'strongmanWalkup', // his walk-up jingle (data/music/walkups.js)
};
