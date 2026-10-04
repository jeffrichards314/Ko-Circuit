// #13 DJ Drop — Major Circuit. The tell is AUDIO, and it's in the music.
// He fights to his own entrance track, and every punch lands exactly on a beat
// of it. One beat before each punch he drops a sound into the mix, and the
// sound tells you which punch:
//   SCRATCH  a straight jab: slip it either way (or block or duck)
//   WOBBLE   the bass drop to the body: block it
//   AIRHORN  a big hook: slip or duck it (a double blast: two hooks, beat after beat)
//   REWIND   THE DROP, his uppercut: slip it. Hit him right ON the rewind for
//            the perfect knockdown.
// Until half a beat out he just nods along with a glove on his headphones, so
// your eyes get the move very late; your ears get it a full beat early.
// The beat is read from the audio clock itself (see onBeat in opponentAI.js),
// so the sounds and the punches can't drift away from the music.

export default {
  id: 'djdrop',
  name: 'DJ DROP',
  short: 'DROP',
  nickname: 'THE BEAT',
  circuit: 'major',
  rank: 3,
  isChampion: false,
  card: {
    age: 29,
    weight: 172,
    record: '22-5 13KO',
    hometown: 'THE BASEMENT',
    quote: 'YOU HEAR THAT? THAT\'S YOUR COUNTDOWN.',
  },
  lines: {
    win: 'AND THAT\'S HOW YOU DROP IT!',
    lose: 'SOMEBODY PULLED THE PLUG ON ME...',
  },

  build: 'medium',
  palette: 'djdrop',
  spriteLayers: 'djdrop',
  fightMusic: 'djDropTrack',   // his entrance track plays for the whole fight

  stats: {
    health: 160,
    damageMult: 1.2,
    stunResistance: 0,
    heartDrainOnBlock: 2,
    starLossChance: 0.4,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 52,
    hitstun: 13,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 12 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 12 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['scratch1', 'scratch2'], rate: 6 },
    victory: ['raiseRoof'],
  },

  // windupFrames / windows are nominal (a 24-frame windup = one beat at 150 bpm);
  // onBeat stretches the windup to the beat and keeps the windows on the punch.
  moves: {
    scratchJab: {
      name: 'SCRATCH',
      onBeat: true,
      windupFrames: 24, activeFrames: 6, recoveryFrames: 20,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [6, 21],
      starWindow: null,
      sfx: { tell: 'scratch', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    bassDrop: {
      name: 'BASS DROP',
      onBeat: true,
      windupFrames: 24, activeFrames: 8, recoveryFrames: 24,
      damage: 12,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [6, 21],
      starWindow: null,
      sfx: { tell: 'wobble', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    airhorn: {
      name: 'AIRHORN',
      onBeat: true,
      windupFrames: 24, activeFrames: 8, recoveryFrames: 26,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [6, 21],
      starWindow: [8, 16],
      sfx: { tell: 'airhorn', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // AIRHORN x2: a double blast means two hooks, beat after beat
    airhornX: {
      name: 'DOUBLE AIRHORN',
      onBeat: true,
      windupFrames: 24, activeFrames: 8, recoveryFrames: 4,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [6, 21],
      starWindow: null,
      sfx: { tell: 'airhornDouble', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hook'] },
    },
    airhorn2: {
      name: 'AIRHORN (2)',
      onBeat: true, minWindup: 8,
      windupFrames: 14, activeFrames: 8, recoveryFrames: 30,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    theDrop: {
      name: 'THE DROP',
      onBeat: true, kdOnCue: true,
      windupFrames: 24, activeFrames: 8, recoveryFrames: 40,
      damage: 20,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [0, 21],
      starWindow: [4, 16],
      sfx: { tell: 'rewind', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'warmUp', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 48 }, { move: 'scratchJab' }, { idle: 48 }, { move: 'bassDrop' }, { idle: 48 },
        { move: 'airhorn' }, { idle: 48 }, { move: 'scratchJab' }, { idle: 24 }, { move: 'theDrop' },
        { idle: 48 }, { taunt: 72 },
      ],
    },
    {
      id: 'b2b', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 48 }, { move: 'bassDrop' }, { idle: 24 }, { move: 'airhornX' }, { move: 'airhorn2' },
        { idle: 48 }, { move: 'scratchJab' }, { idle: 48 }, { move: 'theDrop' }, { idle: 48 }, { taunt: 72 },
      ],
    },
    {
      id: 'peakTime', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 24 }, { move: 'scratchJab' }, { move: 'bassDrop' }, { idle: 24 }, { move: 'airhornX' }, { move: 'airhorn2' },
        { idle: 24 }, { move: 'theDrop' }, { idle: 24 }, { move: 'bassDrop' }, { move: 'scratchJab' },
        { idle: 48 }, { taunt: 48 },
      ],
    },
    {
      id: 'remix', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 24 }, { move: 'theDrop' }, { idle: 24 }, { move: 'scratchJab' }, { move: 'scratchJab' },
        { idle: 24 }, { move: 'bassDrop' }, { move: 'airhornX' }, { move: 'airhorn2' }, { idle: 48 }, { taunt: 48 },
      ],
    },
    {
      id: 'lastCall', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 24 }, { move: 'airhornX' }, { move: 'airhorn2' }, { idle: 12 }, { move: 'bassDrop' }, { move: 'scratchJab' },
        { idle: 24 }, { move: 'theDrop' }, { idle: 12 }, { move: 'scratchJab' }, { move: 'bassDrop' },
        { idle: 24 }, { move: 'theDrop' }, { idle: 48 }, { taunt: 48 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'theDrop', golden: 'windup', taunt: 44, shout: 'DROP THE BASS!', times: [1, 2] },

  getUpTable: [
    { upAt: [4, 7], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.35, health: 0.35 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'needleSkip', type: 'stunTrigger', name: 'NEEDLE SKIP',
      trigger: { state: 'windup', test: 'onCue', clean: 30 },
      effect: { open: { frames: 72, anim: 'stunned', comboLimit: 4 }, say: 'THE RECORD SKIPPED!', sfx: 'scratch' },
      hint: { kind: 'audio', text: 'HIT HIM ON THE SOUND HE DROPS.' },
      scout: 'A PUNCH THAT LANDS ON HIS CUE SOUND (A BEAT BEFORE HIS PUNCH) SKIPS THE RECORD: 4 FREE HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'scratchesBack', type: 'rushing', name: 'SCRATCHES BACK', count: 2, span: 150, counter: ['airhornX', 'airhorn2'], say: 'OFF THE BEAT!',
      scout: 'PUNCH AT HIS GUARD TWICE IN A ROW AND HE ANSWERS WITH A DOUBLE AIRHORN, ON THE BEAT.',
    },
  ],
  special: [{ type: 'onBeat', song: 'djDropTrack', tempo: 150, minWindup: 34, cueBeats: 1, lateTell: 12, holdPose: 'cueUp', bob: 1 }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A CLUB DJ WHO FIGHTS TO HIS OWN TRACK. LISTEN TO THE BEAT AND YOU\'LL HEAR EVERY PUNCH COMING.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'COUNTER THE DROP.', check: 'counterMove', move: 'theDrop' } },
  music: 'djDropTrack',
};
