// #84 Toll — Underworld I, Ferryman's Shore. Nobody crosses without paying, and he collects at the bell. At
// the start of every round he takes ONE STAR from you (the stars you carried out of the last round); if
// you have none he takes HEARTS instead. Round 1 you've never a star to give, so he always takes the hearts
// first. So spend your stars before the bell, or give him one and take it back. He doesn't fight fairly (he
// doesn't fight at all: he collects). Coins for a jab, a purse for a hook, and the COLLECTION.
// His super is the TOLL BOOTH: the gate comes down. A knockdown: slip it. Counter it on the glint and the
// gate drops on him instead.
// Underworld difficulty: 4-frame tells, adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 4;
const coin = { tell: 'coins' };

export default {
  id: 'toll',
  name: 'TOLL',
  short: 'TOLL',
  nickname: 'THE COLLECTOR',
  circuit: 'u1',
  rank: 1,
  isChampion: false,
  card: {
    age: 88,
    weight: 174,
    record: '400-0 0KO',
    hometown: 'THE FAR SIDE OF THE CROSSING',
    quote: 'EVERYONE PAYS. THE ONLY QUESTION IS WHAT WITH.',
  },
  lines: { win: 'PAID IN FULL. MOVE ALONG.', lose: 'THE... THE TOLL... IS WAIVED...' },

  build: 'medium',
  palette: 'toll',
  spriteLayers: 'toll',

  stats: stats({ health: 320, damageMult: 1.95, stunResistance: 5, stunFrames: 44, hitstun: 11 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 20 } }),

  moves: {
    coinJab: mv('jab', W, { name: 'COIN JAB', sfx: coin }),
    coinCross: mv('jabR', W, { name: 'COIN CROSS', sfx: coin }),
    purse: mv('hook', W, { name: 'PURSE SWING', sfx: coin }),
    purseL: mv('hookL', W, { name: 'PURSE SWING (L)', sfx: coin }),
    pocket: mv('bodyR', W, { name: 'POCKET SHOT', sfx: { tell: 'grunt' } }),
    price: mv('upper', W, { name: 'STRIKE PRICE', sfx: coin }),
    collect: mv('haymaker', W, { name: 'THE COLLECTION', windupFrames: 14, counterWindow: [4, 12], starWindow: [4, 7], sfx: { tell: 'coins', swing: 'swingHeavy' } }),
    // the super
    booth: superMove('TOLL BOOTH', { windupFrames: 20, kdWindow: [11, 14], counterWindow: [5, 17], sfx: { tell: 'gate', swing: 'crash' } }),
  },

  patterns: [
    { id: 'passThrough', weight: 3, when: { rounds: [1] }, steps: steps('i28 coinJab i16 purse i20 pocket i30 collect i36 coinCross i16 purseL i44') },
    { id: 'payUp', weight: 3, steps: steps('i24 coinCross i14 coinJab i18 price i30 pocket i20 collect i34 purse i14 purseL i42') },
    { id: 'lateFees', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 price i16 purse i14 purseL i26 collect i22 coinJab i12 coinCross i16 pocket i40') },
  ],

  super: { hit: 'head', move: 'booth', golden: 'windup', window: [11, 14], taunt: 46, shout: 'TOLL BOOTH!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'shortChange', type: 'stunTrigger', name: 'SHORT CHANGE',
      trigger: { state: 'windup', move: 'collect', counter: true, frames: [8, 12] },
      effect: { stun: 92, hits: 5, star: true, say: 'SHORT CHANGE!', sfx: 'coins' },
      hint: { kind: 'audio', text: 'A SHOWER OF COINS RATTLES DOWN HIS SLEEVE AT THE TOP OF THE COLLECTION.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE COLLECTION MAKES HIM DROP HIS TAKE: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'badCoin', type: 'quirk', name: 'A BAD COIN',
      trigger: { on: 'resolved', move: 'price', result: 'dodged' },
      effect: { open: { frames: 80, anim: 'stunned', comboLimit: 5, star: [0, 28] }, say: 'A BAD COIN!', sfx: 'coins' },
      hint: { kind: 'visual', text: 'IF THE STRIKE PRICE MISSES, HE STOPS TO CHECK THE COIN.', hidden: true },
      scout: 'SLIP HIS STRIKE PRICE UPPERCUT: HE STOPS TO CHECK THE COIN AND IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'raisesTheToll', type: 'starHoard', name: 'RAISES THE TOLL', moves: ['coinJab', 'coinCross', 'pocket'], hold: 420, say: 'THE TOLL GOES UP!',
      scout: 'SIT ON THREE STARS FOR SEVEN SECONDS AND HIS COIN JABS AND POCKET SHOT TAKE ONE, EVEN WHEN YOU BLOCK THEM.',
    },
  ],
  scriptedMoments: [
    {
      id: 'lastCall', name: 'LAST CALL', when: { left: 70 }, say: 'LAST CALL!',
      steps: [{ idle: 16 }, { move: 'coinJab' }, { idle: 14 }, { move: 'purse' }, { idle: 22 }, { move: 'price' }, { idle: 30 }, { move: 'collect' }],
    },
  ],
  special: [{ type: 'toll', hearts: 3 }],
  titleDefense: null,
  gallery: 'THE KEEPER OF THE CROSSING. HE TAKES A STAR AT EVERY BELL, OR HEARTS IF YOU HAVE NONE.',
  medals: { signature: { text: 'WIN WITHOUT LOSING A STAR TO HIS TOLL.', check: 'noCue', cue: '!tolledStar' } },
  music: 'tollWalkup',
};
