// #103 Gatekeeper Nox — Underworld VI's first, the Abyss Gate. The keeper of the throne's doorway, and he is the door. His guard
// is a PORTCULLIS: while it is down, EVERY punch bounces off the bars (and costs you hearts like a block): counters and
// Star Punches too. It only rises after you slip or duck THREE of his attacks IN A ROW (a GATE SHUT n/3 badge counts them; a hit or a
// block starts you over). Then it stays up for two and a half seconds, and slams. Go to work while it is up.
// Every one of his attacks can be slipped or ducked: a gate is opened by the man who isn't afraid to stand in front of it.
// His super is the GATE SLAM: slip it, and hit him on the glint at the top of its windup.
// Underworld difficulty: 5-frame tells for a heavy (3-frame circuit), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';

const W = 5;
const iron = { tell: 'keys' };

const SETTLE = { open: 44, anim: 'stunned', comboLimit: 3, id: 'settle', sfx: 'clang' };

export default {
  id: 'nox',
  name: 'GATEKEEPER NOX',
  short: 'NOX',
  nickname: 'KEEPER OF THE GATE',
  circuit: 'u6',
  rank: 4,
  isChampion: false,
  card: { age: 900, weight: 310, record: '400-0 0KO', hometown: 'THE GATE, ITSELF', quote: 'NOTHING HAS EVER GONE PAST ME. NOTHING HAS EVER TRIED TWICE.' },
  lines: { win: 'THE GATE IS SHUT.', lose: 'THE GATE... IS... OPEN...' },

  build: 'heavy',
  palette: 'nox',
  spriteLayers: 'nox',

  stats: stats({ health: 360, damageMult: 2.15, stunResistance: 8, starLossChance: 0.65, stunFrames: 52, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 28 } }),

  moves: {
    keyJab: mv('jab', W, { name: 'KEY JAB', sfx: iron }),
    bolt: mv('hook', W, { name: 'BOLT HOOK', sfx: { tell: 'keys', swing: 'swingHeavy' } }),
    boltL: mv('hookL', W, { name: 'BOLT HOOK (L)', sfx: { tell: 'keys', swing: 'swingHeavy' } }),
    latch: mv('body', W, { name: 'LATCH BLOW', sfx: iron }),
    hammer: mv('upper', W, { name: 'GATE HAMMER', windupFrames: 9, counterWindow: [3, 7], starWindow: [3, 6], damage: 16, punishStar: ['dodged'], sfx: { tell: 'gate', swing: 'swingHeavy' } }),
    bar: mv('sweep', W, { name: 'THE BAR', sfx: { tell: 'gate', swing: 'swingHeavy' } }),
    gateSlam: superMove('GATE SLAM', { windupFrames: 22, counterWindow: [5, 19], starWindow: [5, 9], kdWindow: [12, 15], sfx: { tell: 'gate', swing: 'crash' } }),
  },

  // (clock update 2026-10-03: the gate settles after the bar, an opening for three hits: the gate itself, his gimmick, is untouched)
  patterns: [
    { id: 'lock', weight: 3, when: { rounds: [1] }, steps: [...steps('i32 keyJab i30 bolt i30 latch i38 hammer i44 keyJab i28 boltL i30 bar i30'), SETTLE, ...steps('i26')] },
    { id: 'bolts', weight: 3, steps: [...steps('i26 boltL i26 keyJab i28 latch i34 hammer i34 bolt i28 bar i24'), SETTLE, ...steps('i26 keyJab i40')] },
    { id: 'deadbolt', weight: 2, when: { health: [0, 0.5] }, steps: [...steps('i22 bolt i22 boltL i22 latch i28 hammer i22 keyJab i22 bar i20'), SETTLE, ...steps('i16')] },
  ],

  super: { hit: 'head', move: 'gateSlam', golden: 'windup', window: [12, 15], taunt: 50, shout: 'GATE SLAM!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'caughtInGate', type: 'stunTrigger', name: 'CAUGHT IN THE GATE',
      trigger: { since: { event: 'gateShut', frames: [0, 10] }, state: ['idle', 'block', 'recovery', 'windup'] },
      effect: { stun: 98, hits: 6, star: true, say: 'CAUGHT IN THE GATE!', sfx: 'clang' },
      hint: { kind: 'audio', text: 'THE GATE SLAMS WITH A BOOM. THE FIRST HALF-SECOND AFTER IT, NOX IS STILL SETTLING BEHIND IT.' },
      scout: 'HIT HIM IN THE FIRST 10 FRAMES AFTER THE GATE SLAMS SHUT (THE BOOM), EVEN THOUGH THE BARS ARE DOWN: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'deadboltSlipped', type: 'quirk', name: 'THE DEADBOLT SLIPS',
      trigger: { on: 'resolved', move: 'hammer', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 6, star: [0, 36] }, say: 'THE DEADBOLT SLIPS!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'THE GATE HAMMER SWINGS THE WHOLE OF HIM AFTER IT, AND THE BARS RATTLE WHEN IT MISSES.', hidden: true },
      scout: 'SLIP HIS GATE HAMMER (THE UPPERCUT): HE IS OPEN FOR 6 HITS, THE FIRST A STAR, EVEN WITH THE GATE DOWN.',
    },
  ],
  antiStrategies: [
    {
      id: 'knowsYourFeet', type: 'dodgeBias', name: 'KNOWS YOUR FEET', moves: ['hammer'], min: 5, share: 0.75, say: 'HE KNOWS YOUR FEET!',
      scout: 'SLIP THE SAME WAY OVER AND OVER AND THE GATE HAMMER COMES FROM THAT SIDE. WATCH WHICH GLOVE HE COCKS.',
    },
  ],
  scriptedMoments: [
    { id: 'gateHolds', name: 'THE GATE HOLDS', when: { left: 75 }, say: 'THE GATE HOLDS!', steps: [{ idle: 20 }, { move: 'keyJab' }, { idle: 26 }, { move: 'bolt' }, { idle: 26 }, { move: 'boltL' }, { idle: 32 }, { move: 'hammer' }] },
  ],
  special: [{ type: 'gate', need: 3, open: 150 }],
  titleDefense: null,
  gallery: 'THE KEEPER OF THE ABYSS GATE. HIS GUARD ONLY OPENS WHEN YOU HAVE SLIPPED THREE OF HIS ATTACKS IN A ROW.',
  medals: { speed: 450, signature: { text: 'OPEN THE GATE THREE TIMES.', check: 'cueCount', cue: '!gateOpen', n: 3 } }, // (speed 7:30: the bot's 90th percentile is 6:05, too close to U6's 6:45)
  music: 'noxWalkup',
};
