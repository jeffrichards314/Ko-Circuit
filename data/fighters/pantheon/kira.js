// #65 Comet Kira — Pantheon IV, the Starfield. A racer who fights at the speed of light. Between
// quick jabs and hooks she disappears: a COMET burns in from one edge of the sky, head first, tail
// streaming back to the edge, and then she is on you, from the side it came from. The comet's tail
// shows her side: a comet in from the LEFT comes from the left: slip RIGHT. From the RIGHT: slip LEFT.
// Slip it and she flies straight past and tumbles.
// Her super is the BLAZING TRAIL: a bigger comet, the same rule, and a knockdown. Slip it and punch
// her on the tumble and she goes down instead.
// Pantheon IV difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 6;
const comet = (side, o = {}) => ({
  name: side < 0 ? 'COMET FROM THE LEFT' : 'COMET FROM THE RIGHT',
  lunge: side, noFake: true,
  windupFrames: 24, activeFrames: 6, recoveryFrames: 32,
  damage: 17,
  avoidBy: [side < 0 ? 'dodgeR' : 'dodgeL'],
  counterWindow: null, starWindow: null,
  punishStar: ['dodged'],
  sfx: { tell: 'glowUp', swing: 'swingHeavy' },
  animation: side < 0
    ? { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL', 'idle1'] }
    : { windup: ['hookTell'], active: ['hook'], recovery: ['hook', 'idle1'] },
  ...o,
});

export default {
  id: 'kira',
  name: 'COMET KIRA',
  short: 'KIRA',
  nickname: 'THE SHOOTING STAR',
  circuit: 'p4',
  rank: 2,
  isChampion: false,
  card: {
    age: 22,
    weight: 128,
    record: '33-1 26KO',
    hometown: 'THE OUTER RIM',
    quote: 'BLINK AND YOU MISS ME. DON\'T BLINK. I\'LL STILL HIT YOU.',
  },
  lines: { win: 'TOO SLOW. ALWAYS TOO SLOW.', lose: 'I... BURNED OUT...' },

  build: 'lean',
  palette: 'kira',
  spriteLayers: 'kira',

  stats: stats({ health: 290, damageMult: 1.9, stunFrames: 42 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 10 } }),

  moves: {
    jab: mv('jab', W, { recoveryFrames: 18, damage: 8 }),
    jabR: mv('jabR', W, { recoveryFrames: 18, damage: 9 }),
    hook: mv('hook', W),
    hookL: mv('hookL', W),
    body: mv('body', W),
    bodyR: mv('bodyR', W),
    cometL: comet(-1),
    cometR: comet(1),
    // the super: the same comet, bigger. Slip it and she tumbles.
    blazeL: comet(-1, { name: 'BLAZING TRAIL', knockdown: true, windupFrames: 28, recoveryFrames: 46, damage: 30, punishStar: null, counterWindow: null }),
    blazeR: comet(1, { name: 'BLAZING TRAIL', knockdown: true, windupFrames: 28, recoveryFrames: 46, damage: 30, punishStar: null, counterWindow: null }),
  },

  patterns: [
    { id: 'sprint', weight: 3, when: { rounds: [1] }, steps: steps('i26 cometL i24 jab i16 jabR i30 cometR i28 hookL i20 body i40') },
    { id: 'orbital', weight: 3, steps: steps('i24 hook i14 bodyR i26 cometR i22 cometL i34 jab i16 hook i44') },
    { id: 'flyby', weight: 2, steps: steps('i22 jabR i14 cometL i26 hookL i16 bodyR i28 cometR i22 jab i40') },
    { id: 'tailwind', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 cometR i22 hook i14 jab i26 cometL i18 bodyR i16 hookL i36') },
  ],

  super: { hit: 'body', moves: ['blazeL', 'blazeR'], golden: 'recovery', window: [16, 20], taunt: 46, shout: 'BLAZING TRAIL!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'tailSpin', type: 'quirk', name: 'TAIL SPIN',
      trigger: { on: 'resolved', move: 'cometL', result: 'dodged', dir: 'R' },
      effect: { open: { frames: 92, anim: 'stunned', comboLimit: 6, star: [0, 32] }, say: 'SHE TUMBLES!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'THE COMET FROM THE LEFT ENDS IN A WILD TUMBLE: HER OWN TAIL CATCHES HER.', hidden: true },
      scout: 'SLIP A COMET THAT COMES FROM THE LEFT: SHE TUMBLES IN HER OWN TAIL AND IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'blindSpot', type: 'stunTrigger', name: 'BLIND SPOT',
      trigger: { state: 'windup', move: 'bodyR', side: 'L', height: 'low', frames: [3, 7], clean: 30 },
      effect: { stun: 84, hits: 5, star: true, say: 'BLIND SPOT!', sfx: 'thud' },
      hint: { kind: 'trainer', text: 'SHE LEANS SO FAR INTO A BODY BLOW THAT HER LEFT SIDE IS BARE.' },
      scout: 'A LEFT-HAND BODY SHOT ON THE FIRST FRAMES OF HER RIGHT BODY BLOW\'S WINDUP FOLDS HER: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'tailFollows', type: 'dodgeBias', name: 'THE TAIL FOLLOWS YOU', moves: ['jab', 'jabR'], min: 6, share: 0.75, say: 'SHE READS YOUR SIDE!',
      scout: 'SLIP TO THE SAME SIDE AGAIN AND AGAIN AND HER JABS COME FROM THAT SIDE: SLIP THE OTHER WAY.',
    },
  ],
  scriptedMoments: [
    {
      id: 'photoFinish', name: 'PHOTO FINISH', when: { health: 0.35 }, say: 'PHOTO FINISH!',
      steps: [{ idle: 16 }, { move: 'cometL' }, { idle: 20 }, { move: 'cometR' }, { idle: 20 }, { move: 'cometL' }],
    },
  ],
  special: [
    { type: 'comet', dist: 160, inFrames: 8, side: 30, back: 14, hi: [31, 31, 30], mid: [16, 29, 31], lo: [6, 16, 28] },
  ],
  titleDefense: null,
  gallery: 'A RACER WHO FIGHTS AT THE SPEED OF LIGHT. THE COMET\'S TAIL SHOWS WHICH SIDE SHE\'S COMING FROM.',
  medals: { signature: { text: 'SLIP THREE COMETS FROM THE RIGHT.', check: 'moveResult', move: 'cometR', result: 'dodged', n: 3 } },
  music: 'kiraWalkup',
};
