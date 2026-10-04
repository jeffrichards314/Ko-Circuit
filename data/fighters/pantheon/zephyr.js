// #55 Zephyr Kade — Pantheon II, the Cloud Terrace. He floats, and how high he hangs
// tells you where the punch is going: he rises for an OVERHAND at your head (slip it
// or duck under it), he sinks for a LOW DRIVE at your body (slip it or block it). A
// gust jab comes from where he is. Watch his height, not his hands.
// His super is the GALE DIVE: he climbs out of reach, taunts, then dives at your head,
// a knockdown: slip it. Hit him on the glint as he swoops back in and he drops.
// Pantheon II difficulty: 6-frame tells, shuffled and adaptive, hearts 12.

const W = 7;

export default {
  id: 'zephyr',
  name: 'ZEPHYR KADE',
  short: 'ZEPHYR',
  nickname: 'THE WIND RIDER',
  circuit: 'p2',
  rank: 3,
  isChampion: false,
  card: { age: 24, weight: 138, record: '33-1 24KO', hometown: 'THE CLOUD TERRACE', quote: 'YOU CAN\'T HIT WHAT NEVER TOUCHES THE GROUND.' },
  lines: { win: 'GONE WITH THE WIND.', lose: 'I... TOUCHED... THE GROUND...' },

  build: 'lean',
  palette: 'zephyr',
  spriteLayers: 'zephyr',

  stats: {
    health: 280, damageMult: 1.8, stunResistance: 3, heartDrainOnBlock: 3, starLossChance: 0.55,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'low', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 12 },
    block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
    taunt: ['soar'], victory: ['victory'],
    winded: { frames: ['winded1', 'winded2'], rate: 12 },
  },

  moves: {
    // he rises: an overhand at your head
    overhand: {
      name: 'HIGH OVERHAND', hover: 'high',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [3, W], starWindow: [3, 5], punishStar: ['ducked'],
      sfx: { tell: 'gust', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // he sinks: a drive at your body
    lowDrive: {
      name: 'LOW DRIVE', hover: 'low', height: 'low',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24, damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [3, W - 1], starWindow: null, punishStar: ['dodged'],
      sfx: { tell: 'whoosh', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // level with you: a quick gust jab
    gustJab: {
      name: 'GUST JAB',
      windupFrames: W, activeFrames: 6, recoveryFrames: 20, damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1], starWindow: null,
      sfx: { tell: 'whoosh', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    // the super: out of reach, then down on your head. A knockdown.
    galeDive: {
      name: 'GALE DIVE', hover: 'high', knockdown: true, noFake: true,
      windupFrames: 20, activeFrames: 10, recoveryFrames: 46, damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 16], starWindow: [2, 7], kdWindow: [8, 11], punishStar: ['dodged'],
      sfx: { tell: 'gust', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 8, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    { id: 'breeze', weight: 3, when: { rounds: [1] }, steps: [
      { idle: 32 }, { move: 'gustJab' }, { idle: 26 }, { move: 'overhand' }, { idle: 30 }, { move: 'lowDrive' }, { idle: 44 },
      { move: 'gustJab' }, { idle: 22 }, { move: 'overhand' }, { idle: 34 }, { move: 'lowDrive' }, { idle: 52 } ] },
    { id: 'crosswind', weight: 3, steps: [
      { idle: 26 }, { move: 'lowDrive' }, { idle: 22 }, { move: 'lowDrive' }, { idle: 26 }, { move: 'overhand' }, { idle: 42 },
      { move: 'gustJab' }, { idle: 20 }, { move: 'gustJab' }, { idle: 30 }, { move: 'overhand' }, { idle: 48 } ] },
    { id: 'updraft', weight: 2, when: { rounds: [2, 3] }, steps: [
      { idle: 24 }, { move: 'overhand' }, { idle: 20 }, { move: 'overhand' }, { idle: 28 }, { move: 'lowDrive' }, { idle: 40 },
      { move: 'lowDrive' }, { idle: 22 }, { move: 'gustJab' }, { idle: 26 }, { move: 'overhand' }, { idle: 44 } ] },
  ],

  super: { hit: 'body', move: 'galeDive', golden: 'advance', window: [3, 7], taunt: 46, shout: 'GALE DIVE!', times: [1, 2] },

  getUpTable: [ { upAt: [9, 9], health: 0.5 }, { upAt: [9, 9], health: 0.45 }, { upAt: [9, 9], stayDown: 0.3, health: 0.4 }, { upAt: null } ],


  exploits: [
    {
      id: 'caughtMidAir', type: 'stunTrigger', name: 'CAUGHT MID-AIR',
      trigger: { state: 'windup', move: 'overhand', counter: true, height: 'low', frames: [4, 8] },
      effect: { stun: 96, hits: 6, say: 'KNOCKED OUT OF THE AIR!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'HIGH IN THE AIR, HIS BELLY IS BARE.' },
      scout: 'A BODY COUNTER ON THE HIGH OVERHAND\'S WINDUP KNOCKS HIM OUT OF THE AIR: STUNNED FOR 6 HITS.',
    },
    {
      id: 'downToEarth', type: 'quirk', name: 'DOWN TO EARTH',
      trigger: { on: 'resolved', move: 'overhand', result: 'ducked' },
      effect: { open: { frames: 80, anim: 'winded', comboLimit: 6, star: [0, 34] }, say: 'HE OVERSHOOTS AND LANDS!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'DUCK UNDER THE OVERHAND AND HE HAS NOTHING TO LAND ON BUT THE CANVAS.', hidden: true },
      scout: 'DUCK THE HIGH OVERHAND: HE OVERSHOOTS AND LANDS WINDED, OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'outOfReach', type: 'zoneBias', name: 'OUT OF REACH', streak: 4, zone: 'head', frames: 480, raise: 'HE FLOATS UP OUT OF REACH!', say: 'OUT OF REACH!',
      scout: 'HIT HIS HEAD FOUR TIMES IN A ROW AND HE FLOATS UP OUT OF REACH: HEAD SHOTS FLY UNDER HIM (BODY SHOTS AND COUNTERS STILL LAND).',
    },
  ],
  scriptedMoments: [
    { id: 'thermals', name: 'THERMALS', when: { left: 75 }, say: 'THERMALS!', steps: [{ idle: 20 }, { move: 'overhand' }, { idle: 30 }, { move: 'lowDrive' }, { idle: 30 }, { move: 'overhand' }] },
  ],
  special: [{ type: 'hover', rise: 18, sink: 8, bob: 2, period: 14, ease: 6, settle: 12 }],
  titleDefense: null,
  gallery: 'A WIND RIDER OF THE CLOUD TERRACE. HOW HIGH HE HANGS TELLS YOU WHERE THE PUNCH IS GOING.',
  medals: { signature: { text: 'DUCK THE HIGH OVERHAND TWICE.', check: 'moveResult', move: 'overhand', result: 'ducked', n: 2 } },
  music: 'zephyrWalkup',
};
