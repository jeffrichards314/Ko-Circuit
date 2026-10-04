// #3 Mort the Mailman — Rookie Circuit. Teaches blocking and ducking.
// Throws body blows only. His straight body shots (whistle tell, he dips a
// shoulder) are best BLOCKED, though a slip gets you out of the way too (a
// block-only version was a wall for a Rookie fighter). His "Special Delivery"
// (bike-bell tell, arm cocked way out wide) sweeps the whole ring at chest
// height: it breaks your guard and catches dodges, so you DUCK it. Punish the
// first punch after a successful duck for a star.

export default {
  id: 'mort',
  name: 'MORT THE MAILMAN',
  short: 'MORT',
  nickname: 'FIRST CLASS',
  circuit: 'rookie',
  rank: 1,
  isChampion: false,
  card: {
    age: 47,
    weight: 238,
    record: '14-8 5KO',
    hometown: 'ROUTE 9',
    quote: 'RAIN, SLEET OR SNOW... YOU\'RE GETTING THIS PACKAGE.',
  },
  lines: {
    win: 'DELIVERED. NO SIGNATURE REQUIRED.',
    lose: 'RETURN TO SENDER... OOF.',
  },

  build: 'heavy',
  palette: 'mort',
  spriteLayers: 'mort',

  stats: {
    health: 110,
    damageMult: 1.0,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.34,
    comboLimit: 4,
    stunComboLimit: 5,
    idleHitLimit: 2,
    idleGuard: 'high',
    stunFrames: 56,
    hitstun: 14,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 24 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 18 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['taunt'],
    victory: ['flex'],
  },

  moves: {
    bodyJab: {
      name: 'PARCEL POST',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 22,
      damage: 8,
      avoidBy: ['block', 'dodgeL', 'dodgeR'],
      counterWindow: [12, 27],
      starWindow: null,
      height: 'low',
      sfx: { tell: 'whistle', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    bodyJabR: {
      name: 'PARCEL POST (R)',
      windupFrames: 30, activeFrames: 8, recoveryFrames: 22,
      damage: 8,
      avoidBy: ['block', 'dodgeL', 'dodgeR'],
      counterWindow: [12, 27],
      starWindow: null,
      height: 'low',
      sfx: { tell: 'whistle', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    specialDelivery: {
      name: 'SPECIAL DELIVERY',
      windupFrames: 40, activeFrames: 10, recoveryFrames: 50,
      damage: 14,
      avoidBy: ['duck'],
      counterWindow: [14, 36],
      starWindow: null,
      kdWindow: [28, 31],  // perfect hit: a counter on exactly these frames drops him
      punishStar: ['ducked'],
      height: 'mid',
      sfx: { tell: 'bikeBell', swing: 'swingHeavy' },
      animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'firstClass', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 80 }, { move: 'bodyJab' }, { idle: 60 }, { move: 'bodyJabR' },
        { idle: 70 }, { move: 'specialDelivery' }, { idle: 60 },
        { move: 'bodyJab' }, { idle: 36 }, { move: 'bodyJabR' }, { idle: 60 }, { taunt: 60 },
      ],
    },
    {
      id: 'priority', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'bodyJab' }, { idle: 22 }, { move: 'bodyJab' },
        { idle: 45 }, { move: 'specialDelivery' }, { idle: 40 },
        { move: 'bodyJabR' }, { idle: 22 }, { move: 'bodyJabR' }, { idle: 30 },
        { move: 'specialDelivery' }, { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'overnight', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 40 }, { move: 'specialDelivery' }, { idle: 30 }, { move: 'bodyJab' },
        { idle: 14 }, { move: 'bodyJabR' }, { idle: 14 }, { move: 'bodyJab' },
        { idle: 30 }, { move: 'specialDelivery' }, { idle: 60 }, { taunt: 40 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'specialDelivery', golden: 'windup', taunt: 50, shout: 'SPECIAL DELIVERY!', times: [1, 2] },

  getUpTable: [
    { upAt: [5, 7], health: 0.6 },
    { upAt: [6, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.5, health: 0.35 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'returnToSender', type: 'stunTrigger', name: 'RETURN TO SENDER',
      trigger: { state: 'windup', move: ['bodyJab', 'bodyJabR'], height: 'high', counter: true },
      effect: { stun: 96, hits: 8, say: 'RETURN TO SENDER!', sfx: 'bikeBell' },
      hint: { kind: 'trainer', text: 'HIS FACE IS OPEN WHEN HE BENDS FOR A BODY BLOW.' },
      scout: 'A HEAD-SHOT COUNTER WHILE HE WINDS UP A BODY BLOW STUNS HIM FOR 8 HITS.',
    },
  ],
  antiStrategies: [],
  special: [],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'ROUTE 9\'S MAILMAN. HE HAS NEVER MISSED A DELIVERY, AND EVERY ONE GOES STRAIGHT TO THE BODY.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'DON\'T SLIP A SINGLE PUNCH: BLOCK AND DUCK ONLY.', check: 'never', defense: 'dodged' } },
  music: 'mortWalkup', // his walk-up jingle (data/music/walkups.js)
};
