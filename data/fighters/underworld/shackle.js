// #90 Shackle — Underworld III, the Chain Pits. A prisoner the size of a cell, chained to a post by one ankle,
// and he doesn't mind: the chain is a weapon. His YANK sends the chain low across the floor; duck it (a
// dodge or a block won't stop a chain) or it wraps you and REELS YOU IN to the middle: you can't dodge,
// block or punch until you mash A / B and break free. Break free and he's slack, open, gasping. The rest
// of him is plain iron.
// His super is the BREAK THE POST: he tears the post out of the floor. A knockdown: slip it. Counter it on
// the glint and the post comes down on him.
// Underworld difficulty: 6-frame tells (a heavy man's; the circuit's 4), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 6;
const iron = { tell: 'chainRattle' };

export default {
  id: 'shackle',
  name: 'SHACKLE',
  short: 'SHACKLE',
  nickname: 'THE CHAINED',
  circuit: 'u3',
  rank: 4,
  isChampion: false,
  card: {
    age: 44,
    weight: 281,
    record: '1-0 1KO',
    hometown: 'THE FIRST CELL',
    quote: 'THEY CHAINED ME TO THE POST. THE POST IS STILL HERE. SO AM I.',
  },
  lines: { win: 'THE CHAIN REACHES FURTHER THAN YOU THINK.', lose: 'THE POST... THE POST GAVE...' },

  build: 'heavy',
  palette: 'shackle',
  spriteLayers: 'shackle',

  stats: stats({ health: 360, damageMult: 2.1, stunResistance: 6, stunFrames: 46, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 }, hold: { frames: ['holding'], rate: 30 } }),

  moves: {
    chainJab: mv('jab', W, { name: 'CHAIN JAB', sfx: iron }),
    chainCross: mv('jabR', W, { name: 'CHAIN CROSS', sfx: iron }),
    chainHook: mv('hook', W, { name: 'CHAIN HOOK', sfx: iron }),
    chainHookL: mv('hookL', W, { name: 'CHAIN HOOK (L)', sfx: iron }),
    stomp: mv('bodyR', W, { name: 'POST STOMP', sfx: { tell: 'grunt' } }),
    swing: mv('haymaker', W, { name: 'CHAIN SWING', windupFrames: 16, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'chainRattle', swing: 'swingHeavy' } }),
    // the yank: the chain along the floor. A clinch: landed, it reels you in (duck it)
    yank: {
      name: 'YANK', clinch: true, noFake: true,
      windupFrames: 11, activeFrames: 8, recoveryFrames: 30, damage: 6,
      avoidBy: ['duck'], counterWindow: [3, 9], starWindow: [3, 6], punishStar: ['ducked'],
      sfx: { tell: 'chainRattle', swing: 'chainSnap' },
      openAfter: { when: ['hit'], open: 150, anim: 'hold', id: 'hold', comboLimit: 0 },
      animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
    },
    // the super
    breakThePost: superMove('BREAK THE POST', { windupFrames: 24, kdWindow: [13, 16], counterWindow: [5, 21], sfx: { tell: 'chainRattle', swing: 'crash' } }),
  },

  patterns: [
    { id: 'slack', weight: 3, when: { rounds: [1] }, steps: steps('i30 chainJab i18 chainHook i22 yank i40 stomp i24 chainCross i18 chainHookL i44') },
    { id: 'taut', weight: 3, steps: steps('i26 chainCross i16 chainJab i20 swing i36 yank i38 chainHookL i18 stomp i44') },
    { id: 'links', weight: 2, when: { rounds: [2, 3] }, steps: steps('i22 yank i36 chainHook i14 chainHookL i26 swing i30 chainJab i14 chainCross i18 stomp i42') },
  ],

  super: { hit: 'head', move: 'breakThePost', golden: 'windup', window: [13, 16], taunt: 50, shout: 'BREAK THE POST!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'slackChain', type: 'quirk', name: 'THE CHAIN GOES SLACK',
      trigger: { on: 'resolved', move: 'yank', result: 'ducked' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 6, star: [0, 30] }, say: 'THE CHAIN GOES SLACK!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'A YANK THAT MISSES SNAPS THE CHAIN BACK AT HIM.' },
      scout: 'DUCK HIS YANK: THE CHAIN SNAPS BACK AND HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'postRattler', type: 'stunTrigger', name: 'THE POST RATTLES',
      trigger: { state: 'windup', move: 'swing', counter: true, frames: [11, 14] },
      effect: { stun: 100, hits: 6, star: true, say: 'THE POST RATTLES!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'THE POST CREAKS AT THE END OF THE CHAIN SWING\'S BACKSWING.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE CHAIN SWING RATTLES THE POST AND STUNS HIM FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'reelsInTurtles', type: 'turtling', name: 'REELS IN TURTLES', response: 'move', move: 'yank', share: 0.4, span: 480, cooldown: 600, say: 'THE CHAIN FINDS YOU!',
      scout: 'BLOCK TOO MUCH AND HE THROWS A YANK AT YOU: A BLOCK DOES NOTHING AGAINST A CHAIN. DUCK IT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'taut', name: 'TAUT', when: { left: 70 }, say: 'TAUT!',
      steps: [{ idle: 18 }, { move: 'chainJab' }, { idle: 16 }, { move: 'chainHook' }, { idle: 20 }, { move: 'yank' }, { idle: 38 }, { move: 'swing' }],
    },
  ],
  special: [{ type: 'yank', timeout: 150, every: 30, damage: 3, heart: 1, power: 1, decay: 1, letGo: { open: 62, anim: 'stunned', comboLimit: 5, star: [0, 26] }, post: [-92, -78], ankle: [-15, -5], hand: [18, -60], slack: 8 }],
  titleDefense: null,
  gallery: 'A PRISONER CHAINED TO A POST BY ONE ANKLE. HIS YANK REELS YOU IN: DUCK IT, OR MASH FREE.',
  medals: { signature: { text: 'DUCK HIS YANK THREE TIMES.', check: 'moveResult', move: 'yank', result: 'ducked', n: 3 } },
  music: 'shackleWalkup',
};
