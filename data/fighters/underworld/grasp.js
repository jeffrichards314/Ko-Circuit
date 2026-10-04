// #106 Grasp — Underworld VI. What the hands belong to. WATCH THE FLOOR: every so often the canvas cracks in pale lines under one
// spot (left of you, right of you, or right beneath you: a HAND badge says which), and a moment later a hand shoots up through
// it. Slip AWAY from the hand (for one under you, either way). One that lands holds you, a clinch: mash A and B until it lets go.
// His own punches never come at the same time as a hand. His STAMP (the long call: the ring shakes) sends a burst of three.
// His super is the GRAVE GRIP: slip it; hit him on the glint as he steps back in.
// Underworld difficulty: 5-frame tells for a giant (3-frame circuit), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';

const W = 5;
const hand = (name, avoidBy) => ({
  name, windupFrames: 24, activeFrames: 6, recoveryFrames: 20, damage: 6, height: 'low', avoidBy, counterWindow: null, starWindow: null, noFake: true, strike: true,
  sfx: { tell: 'crackFloor', swing: 'crunch' }, animation: { windup: ['idle1'], active: ['idle1'], recovery: ['idle1'] },
});

export default {
  id: 'grasp',
  name: 'GRASP',
  short: 'GRASP',
  nickname: 'THE HAND BENEATH',
  circuit: 'u6',
  rank: 1,
  isChampion: false,
  card: { age: 4000, weight: 340, record: '999-0 999KO', hometown: 'THE GROUND BELOW', quote: 'YOU\'LL COME TO ME EVENTUALLY. EVERYONE DOES.' },
  lines: { win: 'DOWN YOU GO.', lose: 'LET... GO...' },

  build: 'giant',
  palette: 'grasp',
  spriteLayers: 'grasp',

  stats: stats({ health: 470, damageMult: 2.15, stunResistance: 8, starLossChance: 0.65, stunFrames: 54, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 } }),

  moves: {
    reach: mv('jab', W, { name: 'REACH', sfx: { tell: 'creak' } }),
    reachR: mv('jabR', W, { name: 'REACH (R)', sfx: { tell: 'creak' } }),
    stompR: mv('bodyR', W, { name: 'STOMP (R)', sfx: { tell: 'rumble' } }),
    backhand: mv('hook', W, { name: 'BACKHAND', windupFrames: 8, counterWindow: [3, 7], starWindow: [3, 6], damage: 15, sfx: { tell: 'creak', swing: 'swingHeavy' } }),
    stomp: mv('body', W, { name: 'STOMP', sfx: { tell: 'rumble' } }),
    slam: mv('haymaker', W, { name: 'GRAVE SLAM', windupFrames: 16, counterWindow: [4, 14], starWindow: [4, 7], sfx: { tell: 'rumble', swing: 'crash' } }),
    // the stamp: a call. Left alone, it sends a burst of hands up round you.
    summon: {
      name: 'THE STAMP', feint: true, call: true, summon: true, noFake: true,
      windupFrames: 22, activeFrames: 0, recoveryFrames: 14, damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'], counterWindow: [4, 18], starWindow: [4, 8], cancels: 1,
      sfx: { tell: 'rumble' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 10, active: ['overheadTell2'], recovery: ['overheadTell2'] },
    },
    // the hands themselves (the `hands` modifier throws them): the slip that gets you away from each
    handL: hand('HAND FROM THE LEFT', ['dodgeR']),
    handR: hand('HAND FROM THE RIGHT', ['dodgeL']),
    handM: hand('HAND BENEATH YOU', ['dodgeL', 'dodgeR']),
    graveGrip: superMove('GRAVE GRIP', { windupFrames: 20, counterWindow: [3, 17], starWindow: [3, 8], sfx: { tell: 'rumble', swing: 'crash' } }),
  },

  patterns: [
    { id: 'upward', weight: 3, when: { rounds: [1] }, steps: steps('i34 reach i34 stomp i32 backhand i38 slam i46 reachR i32 backhand i56') },
    { id: 'undertow', weight: 3, steps: steps('i28 stompR i26 backhand i30 reach i36 slam i34 stomp i28 backhand i50') },
    { id: 'buried', weight: 2, when: { health: [0, 0.5] }, steps: steps('i24 backhand i22 stomp i22 slam i26 reach i22 backhand i24 stomp i38') },
  ],

  super: { hit: 'body', move: 'graveGrip', golden: 'advance', window: [3, 6], taunt: 46, shout: 'GRAVE GRIP!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'cutOff', type: 'starTrigger', name: 'CUT OFF AT THE WRIST',
      trigger: { star: true, test: 'handUp', state: ['idle', 'block', 'recovery'] },
      effect: { stun: 110, hits: 7, say: 'CUT OFF AT THE WRIST!', sfx: 'crunch' },
      hint: { kind: 'visual', text: 'WHEN THE CANVAS CRACKS, THE HAND IS ONLY FINGERS FOR A MOMENT. A STAR PUNCH CAN FIND THE WRIST.', hidden: true },
      scout: 'LAND A STAR PUNCH ON GRASP WHILE THE CANVAS IS CRACKING UNDER A HAND: THE HAND IS CUT OFF, AND HE IS STUNNED FOR 7 HITS.',
    },
    {
      id: 'reachedTooFar', type: 'stunTrigger', name: 'HE REACHED TOO FAR',
      trigger: { state: 'windup', move: 'slam', counter: true, frames: [10, 13], clean: 26 },
      effect: { stun: 108, hits: 7, star: true, say: 'HE REACHED TOO FAR!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'AT THE TOP OF THE GRAVE SLAM HIS FINGERS SPREAD AND HE OVERBALANCES.' },
      scout: 'A COUNTER ON THE MIDDLE FRAMES OF HIS GRAVE SLAM: STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'clawsTurtle', type: 'turtling', name: 'CLAWS AT THE TURTLE', response: 'drain', span: 420, share: 0.4, every: 42, say: 'THE HANDS CLAW YOUR GUARD!',
      scout: 'BLOCK TOO MUCH AND THE HANDS CLAW AT YOUR GUARD: YOU LOSE A HEART EVERY SECOND YOU KEEP IT UP.',
    },
  ],
  scriptedMoments: [
    { id: 'groundOpens', name: 'THE GROUND OPENS', when: { left: 75 }, say: 'THE GROUND OPENS!', steps: [{ idle: 24 }, { move: 'summon' }, { idle: 30 }, { move: 'backhand' }] },
  ],
  special: [{
    type: 'hands', tell: 24, gap: [170, 260], first: 230, spread: 34, tellSfx: 'crackFloor', burst: 3, timeout: 150, every: 30, damage: 3, heart: 1,
    strikes: [{ id: 'handL', side: -1 }, { id: 'handR', side: 1 }, { id: 'handM', side: 0 }],
  }],
  titleDefense: null,
  gallery: 'WHAT THE HANDS BELONG TO. THE CANVAS CRACKS UNDER A SPOT AND A HAND SHOOTS UP: WATCH THE FLOOR.',
  medals: { signature: { text: 'CUT OFF A HAND WITH A STAR PUNCH.', check: 'cueCount', cue: '!exploit:cutOff', n: 1 } },
  music: 'graspWalkup',
};
