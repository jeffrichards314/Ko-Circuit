// #56 Nimbus — Pantheon II, the Cloud Terrace. A cloud giant. Standing there, he is
// vapor: his head is far too high to reach and body shots pass through him (and cost
// you hearts: the cloud eats your glove). Nothing he does not choose to let you hit
// lands, until he RAINS: he crouches and pours, and everything lands, head included.
// His counters still work, and so do the openings after you slip his punches.
// His super is the LIGHTNING BOLT: a bolt from the sky (both fists up), a knockdown:
// slip it. Counter it on the glint and the bolt strikes him instead.
// Pantheon II difficulty: 6-frame tells, shuffled and adaptive, hearts 12.

const W = 8;
const rain = { open: 84, anim: 'rain', id: 'rain', comboLimit: 9, star: [0, 32] };

export default {
  id: 'nimbus',
  name: 'NIMBUS',
  short: 'NIMBUS',
  nickname: 'THE STORM CLOUD',
  circuit: 'p2',
  rank: 2,
  isChampion: false,
  card: { age: 300, weight: 60, record: '18-0 15KO', hometown: 'THE CLOUD TERRACE', quote: 'PUNCH ME ALL YOU LIKE. IT\'S JUST WEATHER.' },
  lines: { win: 'A SPOT OF RAIN.', lose: 'CLEAR... SKIES...' },

  build: 'giant',
  palette: 'nimbus',
  spriteLayers: 'nimbus',

  stats: {
    health: 330, damageMult: 1.85, stunResistance: 5, heartDrainOnBlock: 3, starLossChance: 0.55,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 0, idleGuard: 'high', stunFrames: 46, hitstun: 12, betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 26 },
    block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
    taunt: ['victory'], victory: ['victory'],
    rain: { frames: ['rain'], rate: 20 },
  },

  moves: {
    slam: {
      name: 'CLOUD SLAM',
      windupFrames: W + 2, activeFrames: 8, recoveryFrames: 30, damage: 15,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, W], starWindow: [3, 5], punishStar: ['dodged'],
      sfx: { tell: 'rumble', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    sweep: {
      name: 'SQUALL SWEEP',
      windupFrames: W + 3, activeFrames: 9, recoveryFrames: 34, damage: 15,
      avoidBy: ['duck'],
      counterWindow: [3, W + 1], starWindow: null, punishStar: ['ducked'],
      sfx: { tell: 'whoosh', swing: 'swingHeavy' },
      animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'overheadRecover', 'idle1'] },
    },
    clap: {
      name: 'THUNDERCLAP',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 28, damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [3, W], starWindow: [3, 5],
      sfx: { tell: 'thunder', swing: 'swingHeavy' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    // the super: both fists to the sky, then a bolt. A knockdown.
    bolt: {
      name: 'LIGHTNING BOLT', knockdown: true, noFake: true,
      windupFrames: 22, activeFrames: 10, recoveryFrames: 48, damage: 32,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [5, 18], starWindow: [5, 8], kdWindow: [12, 15], punishStar: ['dodged'],
      sfx: { tell: 'thunder', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 9, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    { id: 'drizzle', weight: 3, when: { rounds: [1] }, steps: [
      { idle: 40 }, { move: 'slam' }, { idle: 32 }, { move: 'clap' }, { idle: 36 }, rain, { idle: 50 }, { move: 'sweep' }, { idle: 30 }, { move: 'slam' }, { idle: 56 } ] },
    { id: 'downpour', weight: 3, steps: [
      { idle: 34 }, { move: 'sweep' }, { idle: 28 }, { move: 'slam' }, { idle: 30 }, { move: 'clap' }, { idle: 44 }, rain, { idle: 48 }, { move: 'clap' }, { idle: 26 }, { move: 'sweep' }, { idle: 54 } ] },
    { id: 'squall', weight: 2, when: { rounds: [2, 3] }, steps: [
      { idle: 30 }, { move: 'slam' }, { idle: 22 }, { move: 'slam' }, { idle: 30 }, { move: 'sweep' }, { idle: 40 }, rain, { idle: 40 }, { move: 'clap' }, { idle: 22 }, { move: 'slam' }, { idle: 46 } ] },
  ],

  super: { hit: 'head', move: 'bolt', golden: 'windup', window: [12, 15], taunt: 50, shout: 'LIGHTNING!', times: [1, 2] },

  getUpTable: [ { upAt: [9, 9], health: 0.5 }, { upAt: [9, 9], health: 0.45 }, { upAt: [9, 9], stayDown: 0.3, health: 0.4 }, { upAt: null } ],


  exploits: [
    {
      id: 'wrungOut', type: 'stunTrigger', name: 'WRUNG OUT',
      trigger: { state: 'windup', move: 'clap', counter: true, height: 'high', frames: [6, 10] },
      effect: { stun: 100, hits: 7, say: 'WRUNG OUT!', sfx: 'splash' },
      hint: { kind: 'audio', text: 'THE THUNDERCLAP SQUEEZES THE RAIN OUT OF HIM.' },
      scout: 'A HEAD COUNTER LATE IN THE THUNDERCLAP\'S WINDUP: STUNNED FOR 7 HITS.',
    },
    {
      id: 'silverLining', type: 'quirk', name: 'SILVER LINING',
      trigger: { on: 'resolved', move: 'slam', result: 'dodged', dir: 'R' },
      effect: { open: { frames: 84, anim: 'rain', comboLimit: 8, star: [0, 30] }, say: 'HE POURS EARLY!', sfx: 'splash' },
      hint: { kind: 'visual', text: 'A SLAM THAT MISSES SPILLS HIM.', hidden: true },
      scout: 'SLIP RIGHT OF THE CLOUD SLAM: HE POURS EARLY AND IS SOLID FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'dampness', type: 'turtling', name: 'DAMP GUARD', response: 'drain', share: 0.4, span: 480, every: 46, say: 'YOUR GLOVES ARE SOAKED!',
      scout: 'KEEP YOUR GUARD UP TOO LONG AND YOUR GLOVES SOAK THROUGH: YOUR HEARTS DRAIN WHILE YOU BLOCK.',
    },
  ],
  scriptedMoments: [
    { id: 'cloudburst', name: 'CLOUDBURST', when: { left: 60 }, say: 'CLOUDBURST!', steps: [{ idle: 24 }, { open: 84, anim: 'rain', id: 'rain', comboLimit: 9, star: [0, 32] }] },
  ],
  special: [{ type: 'cloud', step: 'rain', hi: [24, 27, 31], lo: [13, 16, 22] }],
  titleDefense: null,
  gallery: 'A CLOUD THE SIZE OF A GIANT. HE\'S ONLY SOLID WHEN HE RAINS.',
  medals: { signature: { text: 'MAKE HIM RAIN EARLY TWICE.', check: 'cueCount', cue: '!exploit:silverLining', n: 2 } },
  music: 'nimbusWalkup',
};
