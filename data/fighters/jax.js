// DREAM FIGHT — "Thunder" Jax Crane. The undisputed champion of the world.
// The whole first round (72 real seconds) is the storm (the THUNDER bar under the
// clock): every Thunder Uppercut is a one-hit knockdown with a 6-frame tell,
// far too fast to react to. You survive it by knowing him. While he's fresh he
// fights in three fixed routines, and each one opens with a different punch:
//   opens with the JAB   jab, jab, then the uppercut.
//   opens with the HOOK  hook, body, uppercut, jab.
//   opens with the BODY  body, uppercut, hook, uppercut.
// Learn the rhythm and be slipping before the uppercut starts. Slip one and
// your first punch back is a star. (Counter one on its very first frames and
// HE goes down: a perfect hit for someone who knows exactly when it's coming.)
// After the storm he tires for good: slower tells, but he shuffles everything,
// and he stops to gasp for air (hit him!). His uppercut still hurts, and Last
// Thunder (both fists over his head) is a one-hit knockdown: slip it, or
// counter it on the glint.

export default {
  id: 'jax',
  name: '"THUNDER" JAX CRANE',
  short: 'JAX',
  nickname: 'THUNDER',
  circuit: 'dream',
  rank: 0,
  isChampion: true,
  card: {
    age: 30,
    weight: 186,
    record: '60-0 58KO',
    hometown: 'THE TOP OF THE WORLD',
    quote: 'ONE ROUND. THAT\'S ALL ANYONE HAS EVER LASTED.',
  },
  lines: {
    win: 'ONE ROUND. LIKE ALL THE REST.',
    lose: 'SO THAT\'S... WHAT THE CANVAS... LOOKS LIKE...',
  },

  build: 'medium',
  palette: 'jax',
  spriteLayers: 'jax',

  stats: {
    health: 320,
    damageMult: 1.8,
    stunResistance: 6,
    heartDrainOnBlock: 3,
    starLossChance: 0.6,
    comboLimit: 2,
    stunComboLimit: 5,
    idleHitLimit: 0,
    idleGuard: 'high',
    stunFrames: 42,
    hitstun: 11,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 14 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['skyPoint1', 'skyPoint2'], rate: 10 },
    victory: ['victory'],
    winded: { frames: ['winded1', 'winded2'], rate: 14 },
  },

  moves: {
    // --- fresh (the storm) ---
    fJab: {
      name: 'JAB',
      windupFrames: 8, activeFrames: 5, recoveryFrames: 18,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'crackle', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    fHook: {
      name: 'HOOK',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 20,
      damage: 17,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'crackle', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    fBody: {
      name: 'BODY',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 20,
      damage: 16,
      height: 'low',
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'crackle', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // the storm's uppercut: 6 frames, one-hit knockdown
    thunderUpper: {
      name: 'THUNDER UPPERCUT',
      knockdown: true,
      windupFrames: 6, activeFrames: 7, recoveryFrames: 40,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 5],
      starWindow: null,
      kdWindow: [4, 5],
      punishStar: ['dodged'],
      noFake: true,
      sfx: { tell: 'thunder', swing: 'swingHeavy' },
      animation: { windup: ['thunderTell'], active: ['upper'], recovery: ['upper', 'overheadRecover', 'idle1'] },
    },
    // --- tired ---
    tJab: {
      name: 'JAB',
      windupFrames: 10, activeFrames: 5, recoveryFrames: 22,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 8],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    tHook: {
      name: 'HOOK',
      windupFrames: 11, activeFrames: 6, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    tHookL: {
      name: 'HOOK',
      windupFrames: 11, activeFrames: 6, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    tBody: {
      name: 'BODY',
      windupFrames: 11, activeFrames: 6, recoveryFrames: 22,
      damage: 15,
      height: 'low',
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    tUpper: {
      name: 'UPPERCUT',
      windupFrames: 10, activeFrames: 7, recoveryFrames: 36,
      damage: 24,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 8],
      starWindow: [2, 4],
      punishStar: ['dodged'],
      sfx: { tell: 'crackle', swing: 'swingHeavy' },
      animation: { windup: ['thunderTell'], active: ['upper'], recovery: ['upper', 'overheadRecover', 'idle1'] },
    },
    // one-hit knockdown: both fists over his head
    lastThunder: {
      name: 'LAST THUNDER',
      knockdown: true,
      windupFrames: 18, activeFrames: 10, recoveryFrames: 46,
      damage: 32,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 14],
      starWindow: [3, 5],
      kdWindow: [9, 12],
      noFake: true,
      sfx: { tell: 'thunder', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    // the storm: three fixed routines, each with its own opener
    {
      id: 'stormJab', set: 'fresh', weight: 1, fixed: true,
      steps: [
        { idle: 30 }, { move: 'fJab' }, { idle: 20 }, { move: 'fJab' }, { idle: 14 }, { move: 'thunderUpper' },
        { idle: 26 }, { taunt: 30 },
      ],
    },
    {
      id: 'stormHook', set: 'fresh', weight: 1, fixed: true,
      steps: [
        { idle: 28 }, { move: 'fHook' }, { idle: 18 }, { move: 'fBody' }, { idle: 16 }, { move: 'thunderUpper' },
        { idle: 24 }, { move: 'fJab' }, { idle: 30 },
      ],
    },
    {
      id: 'stormBody', set: 'fresh', weight: 1, fixed: true,
      steps: [
        { idle: 28 }, { move: 'fBody' }, { idle: 14 }, { move: 'thunderUpper' }, { idle: 20 }, { move: 'fHook' },
        { idle: 16 }, { move: 'thunderUpper' }, { idle: 30 }, { taunt: 28 },
      ],
    },
    // tired: slower, shuffled, with a breather
    {
      id: 'aftershock', set: 'tired', weight: 3, shuffle: true,
      steps: [
        { idle: 26 }, { move: 'tJab' }, { idle: 22 }, { move: 'tHook' }, { idle: 22 }, { move: 'tBody' },
        { idle: 22 }, { move: 'tUpper' }, { idle: 20 },
        { open: 54, anim: 'winded', star: [2, 18], interrupt: true, stunOnInterrupt: 30, sfxLoop: 'pant', sfxEvery: 20 },
        { idle: 18 },
      ],
    },
    {
      id: 'lastLight', set: 'tired', weight: 2, shuffle: true,
      steps: [
        { idle: 24 }, { move: 'tHookL' }, { idle: 20 }, { move: 'lastThunder' }, { idle: 24 }, { move: 'tJab' },
        { idle: 20 }, { move: 'tUpper' }, { idle: 26 }, { taunt: 30 },
      ],
    },

    // --- PHASE 2: knocked down for the first time in years, he gets back up ANGRY (spec §4 "Boss phases"). Red in the face,
    // a lower, hunched stance, the crowd on its feet. Faster and meaner: storm punches and tired punches mixed into new
    // strings, shorter waits, shorter recoveries (the `enraged` modifier). He still gasps for air, once a string.
    {
      id: 'thunderstruck', weight: 2, fixed: true, when: { phase: [2] },
      steps: [
        { idle: 22 }, { move: 'fJab' }, { idle: 12 }, { move: 'fJab' }, { idle: 12 }, { move: 'fHook' }, { idle: 14 }, { move: 'thunderUpper' },
        { idle: 22 }, { move: 'tBody' }, { idle: 18 },
      ],
    },
    {
      id: 'redLine', weight: 2, fixed: true, when: { phase: [2] },
      steps: [
        { idle: 20 }, { move: 'fBody' }, { idle: 12 }, { move: 'tHookL' }, { idle: 12 }, { move: 'tHook' }, { idle: 14 }, { move: 'tUpper' },
        { idle: 16 }, { open: 40, anim: 'winded', star: [2, 14], interrupt: true, stunOnInterrupt: 26, sfxLoop: 'pant', sfxEvery: 20 }, { idle: 16 },
      ],
    },
    {
      id: 'noMercy', weight: 1, when: { phase: [2] }, shuffle: true,
      steps: [
        { idle: 18 }, { move: 'tJab' }, { idle: 14 }, { move: 'fHook' }, { idle: 14 }, { move: 'tBody' }, { idle: 14 }, { move: 'thunderUpper' },
        { idle: 20 }, { move: 'tHookL' }, { idle: 22 },
      ],
    },
  ],

  // his two phases (spec §4): the scouting report's entries for them, and the HUD's pips under his health bar
  phases: [
    { name: 'THE CHAMPION', scout: 'THE STORM ROUND, THEN THE TIRED CHAMPION WHO STOPS TO GASP. EMPTY HIS HEALTH BAR ONCE AND HE GETS BACK UP.' },
    { name: 'THE CHAMPION, ANGRY', scout: 'RED-FACED AND HUNCHED: STORM PUNCHES MIXED INTO NEW STRINGS, SHORTER WAITS, SHORTER RECOVERIES. HE STILL GASPS ONCE A STRING. ONLY NOW CAN HE BE KNOCKED OUT.' },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'lastThunder', golden: 'windup', taunt: 36, shout: 'LAST THUNDER!', times: [1, 2] },
  // more supers (super.js): each armored from its first frame to its last attack, each with one golden moment
  supers: [
    { move: 'thunderUpper', inline: true, golden: 'windup', window: [3, 5], hit: 'head', flag: 'winded', from: 'caughtBreathing' },
  ],

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // A boss (K4): 3 exploits, 2 anti-strategies, 2 scripted moments.
  exploits: [
    {
      id: 'windKnockedOut', type: 'stunTrigger', name: 'KNOCK THE WIND OUT',
      trigger: { state: 'open', open: 'winded', height: 'low' },
      effect: { stun: 110, hits: 9, say: 'THE CHAMPION\'S WINDED!', sfx: 'oof' },
      hint: { kind: 'audio', text: 'WHEN HE GASPS, THE WHOLE GYM HEARS IT.' },
      scout: 'A BODY SHOT WHILE HE GASPS FOR AIR KNOCKS THE WIND OUT OF HIM: STUNNED FOR 9 HITS.',
    },
    {
      id: 'soreLoser', type: 'quirk', name: 'SORE LOSER', limit: 2,
      trigger: { on: 'getUp' },
      effect: { open: { frames: 60, anim: 'stunned', comboLimit: 4, star: [0, 30] }, say: 'THE CHAMPION NEEDS A MOMENT!' },
      // (hidden: his old hidden exploit, HIS BREATH GIVES HIM AWAY, is now his THUNDER UPPERCUT's golden moment, spec §4)
      hint: { kind: 'trainer', text: 'NOBODY HAS PUT HIM DOWN IN YEARS. HE DOESN\'T KNOW WHAT TO DO ON THE WAY UP.', hidden: true },
      scout: 'WHEN HE GETS UP FROM A KNOCKDOWN HE\'S OPEN FOR 4 HITS, THE FIRST A STAR (TWICE A FIGHT).',
    },
  ],
  antiStrategies: [
    {
      id: 'thiefOfStars', type: 'starHoard', name: 'THIEF OF STARS', hold: 420, moves: ['fJab', 'tJab', 'fHook', 'tHook', 'tUpper', 'thunderUpper'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND THE CHAMPION\'S NEXT PUNCH TAKES ONE OFF YOU, EVEN BLOCKED.',
    },
    {
      id: 'championsPride', type: 'passivity', name: 'CHAMPION\'S PRIDE', response: 'buff', frames: 240, gain: 1 / 600, decay: 1 / 240, dmg: 0.3, rec: 0.2, meter: 'PRIDE', say: 'HIS PRIDE SWELLS!',
      scout: 'STAND AROUND WAITING AND HIS PRIDE METER FILLS: HIS PUNCHES HIT UP TO 30% HARDER AND RECOVER QUICKER. THROW A PUNCH AND IT DRAINS.',
    },
  ],
  scriptedMoments: [
    {
      id: 'catchBreath', name: 'CATCHES HIS BREATH', when: { left: 90, round: 1 }, flag: 'winded', say: 'JAX STOPS TO CATCH HIS BREATH...',
      steps: [{ open: 54, anim: 'winded', star: [2, 18], interrupt: true, stunOnInterrupt: 30, sfxLoop: 'pant', sfxEvery: 20, id: 'winded' }],
    },
    {
      id: 'lastStand', name: 'THE CHAMPION\'S LAST STAND', when: { health: 0.3 }, say: 'THE CHAMPION DIGS DEEP!',
      steps: [{ idle: 16 }, { move: 'tUpper' }, { idle: 14 }, { move: 'tHook' }, { idle: 14 }, { move: 'lastThunder' }],
    },
  ],
  special: [
    { type: 'thunder', fresh: 72 }, // real seconds: the whole of round 1
    // phase 2: angry (src/fight/opponentAI.js enraged), on the same tells, a little quicker on his feet
    { type: 'phaseGate', phases: [2], inner: { type: 'enraged', palette: 'jax.angry', stance: ['block', 'idle2'], crouch: 2, pace: 0.7, recovery: 0.7, flashes: true } },
    { type: 'phaseGate', phases: [2], inner: { type: 'speedScale', scale: 0.92, recovery: 1 } },
  ],
  // Title Defense: the rematch. The storm still lasts all of round 1, the storm
  // uppercut still has its 6-frame tell (kept), and the storm has a fourth
  // routine: it opens with the LEFT hook.
  titleDefense: {
    nickname: 'THUNDER RETURNS',
    quote: 'YOU TOOK MY BELT. I\'VE HAD A YEAR TO THINK ABOUT THAT.',
    record: '60-1 58KO',
    lines: { win: 'ONE ROUND. I TOLD YOU.', lose: 'TWICE... NOBODY\'S EVER... TWICE...' },
    tell: 0.9,
    keep: ['thunderUpper', 'fJab', 'fHook', 'fBody', 'fHookL'],
    costume: { B: { trunkHi: [31, 12, 12], trunk: [23, 3, 6], trunkDk: [12, 1, 3], bootHi: [31, 12, 12], boot: [22, 3, 6], bootDk: [11, 1, 3] } },
    moves: {
      // new (the storm): a left hook
      fHookL: {
        name: 'HOOK',
        windupFrames: 8, activeFrames: 6, recoveryFrames: 20,
        damage: 17,
        avoidBy: ['dodgeR', 'duck'],
        counterWindow: [2, 6],
        starWindow: null,
        sfx: { tell: 'crackle', swing: 'swingHeavy' },
        animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
      },
      // new (tired): the thunderclap, a low sweep (duck it)
      thunderClap: {
        name: 'THUNDERCLAP',
        windupFrames: 12, activeFrames: 9, recoveryFrames: 30,
        damage: 20,
        avoidBy: ['duck'],
        counterWindow: [2, 9],
        starWindow: null,
        sfx: { tell: 'gust', swing: 'swingHeavy' },
        animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'stormHookL', weight: 1, set: 'fresh', fixed: true,
        steps: [
          { idle: 28 }, { move: 'fHookL' }, { idle: 18 }, { move: 'fJab' }, { idle: 16 }, { move: 'thunderUpper' },
          { idle: 24 }, { move: 'fBody' }, { idle: 30 },
        ],
      },
      {
        id: 'rolling', weight: 3, set: 'tired',
        steps: [
          { idle: 24 }, { move: 'thunderClap' }, { idle: 22 }, { move: 'tHookL' }, { idle: 20 }, { move: 'tUpper' },
          { idle: 20 }, { open: 54, anim: 'winded', star: [2, 18], interrupt: true, stunOnInterrupt: 30, sfxLoop: 'pant', sfxEvery: 20 },
          { idle: 18 }, { move: 'lastThunder' }, { idle: 26 }, { taunt: 30 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'UNDISPUTED CHAMPION OF THE WORLD. SIXTY FIGHTS, SIXTY WINS, AND NOBODY HAS LASTED A ROUND.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'KNOCK JAX DOWN IN ROUND 1.', check: 'kdInRound', round: 1 } },
  music: 'jaxEntrance',
};
