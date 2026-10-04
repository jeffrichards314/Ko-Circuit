// #41 The Monk — Grand Prix. He NEVER attacks first. He stands in the ring with his palms together and his eyes
// closed, and everything he throws is an ANSWER to something you did, each action with its own reply (the
// `reactions` table, run by the `stillwater` modifier in src/fight/opponentAI.js):
//   a left / right punch to the head or the body that washes over him   PALM STRIKE / CRANE WING / ROOT STRIKE / TIGER CLAW
//   a punch thrown at him at FULL CALM (he sways out of it: it whiffs)   WILLOW: quick and strong
//   a punch that LANDS on him (an opening)                                WATER RETURNS: once he is back on his feet
//   a dodge to the left / to the right                                    CHASING WIND, aimed where you went
//   a block                                                               UNDER THE STONE: a low sweep your guard can't stop
//   a duck                                                                RISING CRANE: overhead, over your head
//   a Star Punch                                                          TIDAL PALM, or (when his super is due) STILL WATER
// While he's calm, punches just wash over him (a ripple, and it costs you hearts like a block): he's only open in
// the recovery after he answers, when you counter an answer that can be countered, or when he's stunned. While
// you throw nothing he MEDITATES: his health creeps back and his CALM fills, and the next answer he throws spends
// it (harder, quicker, shorter recovery). Standing still loads his next answer. Full calm: he floats, and a punch
// at him whiffs.
// His ONLY tell is his breath: before every answer he draws one (a different pose for each) and you hear it.
// His super is STILL WATER, the answer to a Star Punch once he has gathered himself: armored from the first
// frame; hit him on the glint as his eyes open and he is down. His exploit: hold your guard and he goes UNDER the
// stone, a slow low sweep with his head bowed: a head shot into the bow stuns him.

const breath = (name, windup, extra) => ({
  name, windupFrames: windup, activeFrames: 6, recoveryFrames: 36,
  damage: 15,
  sfx: { tell: 'breathIn', swing: 'whiff' },
  ...extra,
  animation: { windup: ['inhale1', extra.breath || 'inhale2'], windupRate: Math.ceil(windup / 2), active: [extra.act], recovery: [extra.act, 'meditate1'] },
});

export default {
  id: 'monk',
  name: 'THE MONK',
  short: 'MONK',
  nickname: 'STILL WATER',
  circuit: 'grandprix',
  rank: 1,
  isChampion: false,
  card: {
    age: 57,
    weight: 141,
    record: '60-0 12KO',
    hometown: 'THE HIGH MONASTERY',
    quote: 'THE RIVER DOES NOT FIGHT THE STONE. IT WAITS.',
  },
  lines: {
    win: 'BREATHE, MY FRIEND. NEXT TIME, BREATHE.',
    lose: 'AH. SO THIS IS WHAT IT FEELS LIKE.',
  },

  build: 'lean',
  palette: 'monk',
  spriteLayers: 'monk',

  stats: {
    health: 240,
    damageMult: 1.6,
    stunResistance: 5,
    heartDrainOnBlock: 1, // (every punch you bait him with washes over him: one heart each, not three, or baiting would run you dry)
    starLossChance: 0.5,
    comboLimit: 4,
    stunComboLimit: 6,
    idleHitLimit: 0,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.22,
    guardCounter: 0, // (he answers what you DO, never what bounces off him: see `reactions`)
  },

  anims: {
    idle: { frames: ['meditate1', 'meditate1', 'meditate2', 'meditate1'], rate: 30 },
    block: ['meditate1'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['bow'],
    victory: { frames: ['victory', 'bow'], rate: 40 }, // arms up, then his taunt pose (§2: its own frame)
    levitate: { frames: ['float1', 'float2'], rate: 24 },
  },

  moves: {
    // --- the answers to your punches (the ones you throw at his stillness are braced: no counters there) ---
    palm: breath('PALM STRIKE', 8, {
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'], counterWindow: null, starWindow: null, act: 'jab', punishStar: ['dodged'],
    }),
    crane: breath('CRANE WING', 9, {
      damage: 16, avoidBy: ['dodgeL', 'duck'], counterWindow: null, starWindow: null, act: 'hook', breath: 'inhaleR', recoveryFrames: 39, punishStar: ['dodged'],
    }),
    lowPalm: breath('ROOT STRIKE', 9, {
      height: 'low', avoidBy: ['block', 'dodgeR'], counterWindow: null, starWindow: null, act: 'body', breath: 'inhaleLow', punishStar: ['dodged'],
    }),
    tiger: breath('TIGER CLAW', 9, {
      damage: 16, height: 'low', avoidBy: ['block', 'dodgeL'], counterWindow: null, starWindow: null, act: 'body', breath: 'inhaleL', recoveryFrames: 39, punishStar: ['dodged'],
    }),
    // a punch into thin air: he is not there, and the air answers fast and hard (braced like the punches that bounce off him)
    willow: breath('WILLOW', 7, {
      damage: 17, avoidBy: ['dodgeL', 'dodgeR'], counterWindow: null, starWindow: null, act: 'jabR', breath: 'inhaleR', recoveryFrames: 34, punishStar: ['dodged'],
    }),
    // a punch that landed: once he's up, the water comes back (a quick light palm; punishing it does not bring it again)
    ripple: breath('WATER RETURNS', 7, {
      damage: 11, avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'], counterWindow: null, starWindow: null, act: 'jabR', recoveryFrames: 31, punishStar: ['dodged'],
    }),
    // --- the answers to your defense ---
    // you slipped left: the wind goes after you (slip the other way, or block it)
    chaseL: breath('CHASING WIND', 10, {
      avoidBy: ['dodgeR', 'block'], counterWindow: [2, 6], starWindow: [2, 3], act: 'hookL', breath: 'inhaleL', recoveryFrames: 39, punishStar: ['dodged'],
    }),
    chaseR: breath('CHASING WIND', 10, {
      avoidBy: ['dodgeL', 'block'], counterWindow: [2, 6], starWindow: [2, 3], act: 'hook', breath: 'inhaleR', recoveryFrames: 39, punishStar: ['dodged'],
    }),
    // you raised your guard: the river goes under the stone. Slow, low, and no guard stops it. His head is bowed.
    under: breath('UNDER THE STONE', 16, {
      damage: 17, height: 'low', avoidBy: ['dodgeL', 'dodgeR'], counterWindow: null, starWindow: null, act: 'body', breath: 'inhaleLow', recoveryFrames: 42, fixedTell: true, punishStar: ['dodged'],
    }),
    // you ducked: the crane rises over you (block it, or slip it)
    rising: breath('RISING CRANE', 11, {
      damage: 16, avoidBy: ['block', 'dodgeL', 'dodgeR'], counterWindow: [2, 6], starWindow: [2, 3], act: 'palmOut', breath: 'inhale2', recoveryFrames: 39, punishStar: ['dodged'],
    }),
    // you threw a Star Punch and it did not come to him (his super not due): the tide, heavy and slow
    tidal: breath('TIDAL PALM', 14, {
      damage: 21, avoidBy: ['dodgeL', 'dodgeR'], counterWindow: [3, 10], starWindow: [3, 5], act: 'palmOut', breath: 'inhale2', recoveryFrames: 48, punishStar: ['dodged'],
    }),
    // --- his super: the long breath. The answer to a Star Punch once he's gathered himself (see `super`). ---
    stillWater: {
      name: 'STILL WATER',
      knockdown: true,
      windupFrames: 20, activeFrames: 8, recoveryFrames: 64,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 16],
      starWindow: [4, 6],
      noFake: true,
      sfx: { tell: 'breathLong', swing: 'swingHeavy' },
      animation: { windup: ['inhale1', 'inhale2', 'inhale2', 'inhale2'], windupRate: 5, active: ['palmOut'], recovery: ['palmOut', 'overheadRecover', 'meditate1'] },
    },
  },

  // He only ever waits. (The pattern is the stance: everything else he does comes from `reactions`.)
  patterns: [
    { id: 'still', weight: 1, steps: [{ idle: 60 }] },
  ],

  // what he answers each thing you do with (the `stillwater` modifier; a Star Punch gets the super instead once it's due)
  reactions: {
    jabLhigh: 'palm', jabRhigh: 'crane', jabLlow: 'lowPalm', jabRlow: 'tiger',
    whiff: 'willow', landed: 'ripple',
    dodgeL: 'chaseL', dodgeR: 'chaseR', block: 'under', duck: 'rising',
    star: 'tidal',
  },

  // his super: the answer to a Star Punch once the planned mark has passed (data/difficulty.js SUPERS: one or two a round)
  super: {
    hit: 'head', move: 'stillWater', golden: 'windup', window: [11, 14], name: 'STILL WATER', shout: 'BREATHE.', times: [1, 2],
    scout: 'STILL WATER: A STAR PUNCH, ONCE HE HAS GATHERED HIMSELF, CALLS IT. HE IS ARMORED THROUGH IT: A HEAD SHOT ON THE GLINT AS HIS EYES OPEN DROPS HIM ON THE SPOT.',
  },

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'bowedHead', type: 'stunTrigger', name: 'BOWED HEAD',
      trigger: { state: 'windup', move: 'under', height: 'high', frames: [6, 14], clean: 18 },
      effect: { stun: 104, hits: 9, say: 'HIS HEAD IS BOWED!', sfx: 'oof' },
      hint: { kind: 'visual', text: 'WHEN THE WATER GOES UNDER THE STONE, HE BOWS HIS HEAD TO THE FLOOR.' },
      scout: 'HOLD YOUR GUARD AND HE GOES UNDER IT WITH A SLOW LOW SWEEP, HEAD BOWED: A HEAD SHOT INTO THE BOW STUNS HIM FOR 9 HITS.',
    },
    {
      id: 'stillWaterRipples', type: 'quirk', name: 'STILL WATER RIPPLES',
      trigger: { on: 'resolved', move: 'stillWater', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 8, star: [0, 40] }, say: 'THE STILL WATER RIPPLES!', sfx: 'om' },
      hint: { kind: 'audio', text: 'THE LONG BREATH BEFORE THE STILL WATER IS THE LAST THING HE DOES.' },
      scout: 'SLIP THE STILL WATER PALM STRIKE: HE\'S OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'meditates', type: 'passivity', name: 'MEDITATES WHILE YOU WAIT', response: 'calm', frames: 120, meter: 'CALM', say: 'HE GATHERS HIS CALM...',
      scout: 'STAND STILL AND HE MEDITATES: HIS HEALTH CREEPS BACK AND HIS CALM FILLS, SO THE NEXT ANSWER HE THROWS HITS HARDER AND COMES QUICKER. AT FULL CALM HE SWAYS OUT OF YOUR PUNCHES AND ANSWERS AT ONCE.',
    },
  ],
  scriptedMoments: [
    {
      id: 'deepBreath', name: 'THE DEEP BREATH', when: { left: 90 }, say: 'A DEEP BREATH...', mod: { calmSet: 1 },
      steps: [{ idle: 20 }],
    },
  ],
  special: [{
    type: 'stillwater',
    delay: { default: 8, landed: 16, star: 24, whiff: 6, dodgeL: 14, dodgeR: 14, block: 22, duck: 26 }, // frames from what you did to his breath (a slip, a guard, a duck and a Star Punch leave you free to answer his tell: you are out of them when he breathes in)
    quiet: 90, fill: 420, heal: 0.00005, // nothing thrown for 90 frames: he meditates; full calm in 7s; heals ~0.3% of his bar a second
    sway: 0.6, swayFrames: 14, settle: 24, // from 60% calm a punch at him whiffs; the water settles 24 frames after an answer
    power: 0.5, speed: 0.2, recover: 0.3, // full calm: +50% damage, 20% quicker tell, 30% shorter recovery
    breathe: 90, breatheHearts: 2, // out of hearts: left in peace, and two hearts come back every 1.5 s of his stillness (nothing you slip or guard is answered)
    ripple: [31, 24, 10],
  }],
  titleDefense: null,
  gallery: 'UNBEATEN IN SIXTY FIGHTS. HE NEVER THROWS FIRST: EVERYTHING YOU DO GETS AN ANSWER, SIGNALLED ONLY BY HIS BREATH.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'HIT HIM ON THE GLINT AS HIS EYES OPEN.', check: 'kdBy', by: 'perfect' } },
  music: 'monkWalkup', // his walk-up jingle (data/music/walkups.js)
};
