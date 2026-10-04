// #58 Cirrus Crown — Pantheon II's champion, the Cloud Terrace. The king of the weather,
// and it changes with every round:
//   round 1  CLEAR      a plain fight
//   round 2  FOG        banks of fog drift over him: the tells are faint (his sounds still work)
//   round 3  LIGHTNING  he's a dark silhouette, and only the bolts show him: the tell is a flash
// His super is the STORM FIST: the whole sky in one hook, a knockdown: slip it, and punch
// him on the glint in its recovery.
// Pantheon II difficulty: 6-frame tells, shuffled and adaptive, hearts 12.

const W = 7;

export default {
  id: 'cirrus',
  name: 'CIRRUS CROWN',
  short: 'CIRRUS',
  nickname: 'THE WEATHER KING',
  circuit: 'p2',
  rank: 0,
  isChampion: true,
  card: { age: 61, weight: 172, record: '44-0 38KO', hometown: 'THE CLOUD TERRACE', quote: 'IT\'S A LOVELY DAY. FOR NOW.' },
  lines: { win: 'A CHANGE IN THE WEATHER.', lose: 'THE CLOUDS... PART...' },

  build: 'medium',
  palette: 'cirrus',
  spriteLayers: 'cirrus',

  stats: {
    health: 360, damageMult: 1.9, stunResistance: 5, heartDrainOnBlock: 3, starLossChance: 0.6,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 20 },
    block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
    taunt: ['decree'], victory: ['victory'],
  },

  moves: {
    jab: {
      name: 'CIRRUS JAB',
      windupFrames: W, activeFrames: 6, recoveryFrames: 20, damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1], starWindow: null,
      sfx: { tell: 'whoosh', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    hook: {
      name: 'SQUALL HOOK',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 14,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [3, W], starWindow: [3, 5],
      sfx: { tell: 'rumble', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    body: {
      name: 'DEW BLOW', height: 'low',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24, damage: 12,
      avoidBy: ['block', 'dodgeL'],
      counterWindow: [3, W - 1], starWindow: null, punishStar: ['dodged'],
      sfx: { tell: 'whoosh', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    upper: {
      name: 'THUNDERHEAD',
      windupFrames: W + 3, activeFrames: 7, recoveryFrames: 32, damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, W + 1], starWindow: [3, 6], punishStar: ['dodged'],
      sfx: { tell: 'thunder', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    stormFist: {
      name: 'STORM FIST', knockdown: true, noFake: true,
      windupFrames: 20, activeFrames: 10, recoveryFrames: 48, damage: 32,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 17], starWindow: [4, 7], punishStar: ['dodged'],
      sfx: { tell: 'thunder', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 8, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    { id: 'clear', weight: 3, when: { rounds: [1] }, steps: [
      { idle: 32 }, { move: 'jab' }, { idle: 26 }, { move: 'hook' }, { idle: 30 }, { move: 'body' }, { idle: 42 },
      { move: 'upper' }, { idle: 34 }, { move: 'jab' }, { idle: 22 }, { move: 'hook' }, { idle: 50 } ] },
    { id: 'fogbank', weight: 3, when: { rounds: [2] }, steps: [
      { idle: 30 }, { move: 'body' }, { idle: 24 }, { move: 'jab' }, { idle: 24 }, { move: 'upper' }, { idle: 40 },
      { move: 'hook' }, { idle: 28 }, { move: 'body' }, { idle: 26 }, { move: 'jab' }, { idle: 48 } ] },
    { id: 'thunderhead', weight: 3, when: { rounds: [3] }, steps: [
      { idle: 30 }, { move: 'hook' }, { idle: 30 }, { move: 'jab' }, { idle: 22 }, { move: 'jab' }, { idle: 40 },
      { move: 'upper' }, { idle: 32 }, { move: 'body' }, { idle: 26 }, { move: 'hook' }, { idle: 46 } ] },
    { id: 'eye', weight: 1, script: 'eye', steps: [
      { idle: 22 }, { move: 'upper' }, { idle: 24 }, { move: 'hook' }, { idle: 22 }, { move: 'jab' }, { idle: 34 }, { move: 'body' }, { idle: 40 } ] },
  ],

  super: { hit: 'body', move: 'stormFist', golden: 'recovery', window: [17, 21], taunt: 46, shout: 'STORM FIST!', times: [1, 2] },

  getUpTable: [ { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], health: 0.5 }, { upAt: [9, 9], stayDown: 0.3, health: 0.45 }, { upAt: null } ],


  exploits: [
    {
      id: 'clearSkies', type: 'stunTrigger', name: 'CLEAR SKIES',
      trigger: { state: 'windup', move: 'upper', counter: true, frames: [5, 9] },
      effect: { stun: 104, hits: 7, say: 'THE SKY CLEARS!', sfx: 'thud' },
      hint: { kind: 'trainer', text: 'THE THUNDERHEAD BUILDS FOR A MOMENT BEFORE IT BREAKS.' },
      scout: 'A COUNTER ON THE PEAK OF THE THUNDERHEAD\'S WINDUP: STUNNED FOR 7 HITS.',
    },
    {
      id: 'rainCheck', type: 'quirk', name: 'RAIN CHECK',
      trigger: { on: 'resolved', move: 'stormFist', result: 'dodged', dir: 'R' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 8, star: [0, 36] }, say: 'THE WEATHER BREAKS!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'SLIP THE STORM FIST TO THE RIGHT AND HIS OWN SKY FALLS ON HIM.', hidden: true },
      scout: 'SLIP RIGHT OF THE STORM FIST: THE WEATHER BREAKS ON HIM AND HE\'S OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'struckByLightning', type: 'instantKd', name: 'STRUCK BY LIGHTNING', limit: 1,
      trigger: { state: 'windup', move: ['jab', 'hook', 'body', 'upper'], star: true, test: 'stormFlash', frames: [1, 4] },
      effect: { knockdown: true, say: 'STRUCK BY HIS OWN LIGHTNING!', sfx: 'thunder' },
      hint: { kind: 'visual', text: 'HE IS ONLY LIT IN THE FLASH: THAT IS ALSO WHEN HE\'S EXPOSED.', hidden: true },
      scout: 'IN ROUND 3, A STAR PUNCH THAT LANDS IN THE FLASH OF LIGHTNING THAT SHOWS HIM DROPS HIM AT ONCE (ONCE PER FIGHT).',
    },
  ],
  antiStrategies: [
    {
      id: 'waitsForTheStorm', type: 'earlyDodge', name: 'WAITS FOR THE STORM', response: 'hold', moves: ['hook', 'upper'], say: 'HELD IT!',
      scout: 'SLIP EARLY AND HE HOLDS THE HOOK OR THE THUNDERHEAD UNTIL YOUR SLIP RUNS OUT.',
    },
    {
      id: 'risesInTheStorm', type: 'getUpMash', name: 'RISES IN THE STORM', response: 'harder', punches: 3, mult: 1.3, say: 'THE STORM BREAKS!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 30% HARDER.',
    },
  ],
  scriptedMoments: [
    { id: 'frontMovingIn', name: 'FRONT MOVING IN', when: { left: 75 }, say: 'A FRONT MOVES IN!', steps: [{ idle: 20 }, { move: 'upper' }, { idle: 30 }, { move: 'hook' }, { idle: 30 }, { move: 'upper' }] },
    { id: 'eyeOfTheStorm', name: 'EYE OF THE STORM', when: { health: 0.3 }, say: 'THE EYE OF THE STORM!', patterns: 'eye', steps: [{ idle: 18 }] },
  ],
  special: [{
    type: 'weather', order: ['clear', 'fog', 'lightning'], density: 0.6, fog: [26, 27, 29], dark: 'cirrus.dark',
    names: {
      clear: { label: 'CLEAR', color: [26, 26, 30], shout: 'CLEAR SKIES!' },
      fog: { label: 'FOG', color: [24, 26, 30], shout: 'FOG ROLLS IN!' },
      lightning: { label: 'LIGHTNING', color: [31, 30, 14], shout: 'LIGHTNING!' },
    },
  }],
  titleDefense: null,
  gallery: 'THE KING OF THE WEATHER. IT CHANGES EVERY ROUND: CLEAR, FOG, LIGHTNING.',
  medals: { signature: { text: 'A STAR PUNCH IN THE FLASH OF HIS OWN LIGHTNING.', check: 'cueCount', cue: '!exploit:struckByLightning', n: 1 } },
  music: 'cirrusEntrance',
};
