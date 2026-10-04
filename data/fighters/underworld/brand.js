// #100 Brand — Underworld V. A man with a branding iron, and a lifetime of marks to show for it. THE IRON is a straight that
// marks whoever it touches, hit or blocked: from then on (for ten seconds) the next punch of his that lands on you is a CRITICAL HIT.
// A BRANDED badge and a glowing brand on your chest show it. Slip or duck the iron and the mark cools off; take a hit and it's spent.
// Everything else he throws is ordinary. If you keep hitting the same spot he scars over it and it stops hurting him.
// His super is THE FINAL BRAND: he shows the iron up close (the taunt) before he swings. Hit him on the glint while he shows off.
// Underworld difficulty: 3-frame tells (a medium fighter), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps, GETUP } from '../pantheon/_kit.js';

const W = 3;
const hot = { tell: 'ember' };

export default {
  id: 'brand',
  name: 'BRAND',
  short: 'BRAND',
  nickname: 'THE MARKER',
  circuit: 'u5',
  rank: 2,
  isChampion: false,
  card: { age: 39, weight: 168, record: '58-11 40KO', hometown: 'THE CATTLE PENS', quote: 'EVERYONE WHO LEAVES THIS RING LEAVES WITH MY NAME ON THEM.' },
  lines: { win: 'THAT\'LL SCAR.', lose: 'MY OWN... MARK...' },

  build: 'medium',
  palette: 'brand',
  spriteLayers: 'brand',

  stats: stats({ health: 360, damageMult: 1.95, stunResistance: 5, starLossChance: 0.6, stunFrames: 48, hitstun: 11 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 18 } }),
  guardCounter: 'stamp',

  moves: {
    jab: mv('jab', W, { name: 'SCORCH JAB', sfx: hot }),
    hookL: mv('hookL', W, { name: 'SEARING HOOK', sfx: hot }),
    body: mv('body', W, { name: 'HOT COAL BLOW', sfx: hot }),
    // the iron: a straight with the brand on the end of it. Hit or blocked, it marks you.
    iron: mv('jabR', W, { name: 'BRANDING IRON', windupFrames: 7, counterWindow: [2, 6], starWindow: [2, 4], damage: 11, brand: true, noFake: true, sfx: { tell: 'brandHiss', swing: 'sizzle' } }),
    stamp: mv('upper', W, { name: 'STAMP', sfx: { tell: 'ember', swing: 'swingHeavy' } }),
    finalBrand: superMove('THE FINAL BRAND', { windupFrames: 18, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'brandHiss', swing: 'crash' } }),
  },

  patterns: [
    { id: 'firstMark', weight: 3, when: { rounds: [1] }, steps: steps('i34 jab i30 iron i36 body i30 hookL i34 stamp i40 jab i28 iron i48') },
    { id: 'secondMark', weight: 3, steps: steps('i28 hookL i26 iron i30 jab i26 body i30 stamp i34 iron i28 jab i44') },
    { id: 'branded', weight: 2, when: { health: [0, 0.5] }, steps: steps('i22 iron i22 stamp i20 body i22 hookL i22 iron i22 jab i32') },
  ],

  super: { hit: 'body', move: 'finalBrand', golden: 'taunt', window: [14, 20], taunt: 40, shout: 'THE FINAL BRAND!', times: [1, 2] },

  getUpTable: GETUP, // (Phase F: the Pantheon's and the upper Underworld's table; these had the Storm circuit's 6-8)


  exploits: [
    {
      id: 'coldIron', type: 'stunTrigger', name: 'COLD IRON',
      trigger: { state: 'windup', move: 'iron', counter: true, frames: [4, 6], clean: 20 },
      effect: { stun: 90, hits: 6, star: true, say: 'THE IRON GOES COLD!', sfx: 'hiss' },
      hint: { kind: 'audio', text: 'THE HISS OF THE IRON DIES AWAY IN THE LAST FRAMES OF ITS WINDUP: IT IS GOING COLD.' },
      scout: 'A COUNTER ON THE LAST FRAMES OF THE BRANDING IRON (AS THE HISS DIES): STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'brandedHimself', type: 'quirk', name: 'HE BRANDS HIMSELF',
      trigger: { on: 'resolved', move: 'iron', result: 'dodged' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 6, star: [0, 32] }, say: 'HE BRANDED HIMSELF!', sfx: 'sizzle' },
      hint: { kind: 'visual', text: 'A MISSED IRON SWINGS BACK ONTO HIS OWN SHOULDER.', hidden: true },
      scout: 'SLIP OR DUCK THE BRANDING IRON: HE BRANDS HIMSELF AND IS OPEN FOR 6 HITS, THE FIRST A STAR, AND ANY MARK ON YOU COOLS.',
    },
  ],
  antiStrategies: [
    {
      id: 'scarsOver', type: 'zoneBias', name: 'SCARS OVER', mode: 'streak', streak: 4, frames: 420, raise: 'THE SPOT SCARS OVER!', say: 'SCARRED!',
      scout: 'HIT THE SAME ZONE FOUR TIMES IN A ROW AND IT SCARS OVER FOR 7 SECONDS: PUNCHES THERE BOUNCE (COUNTERS AND STUNS STILL LAND). SWITCH ZONES.',
    },
  ],
  scriptedMoments: [
    { id: 'hotIron', name: 'THE IRON IS HOT', when: { left: 90 }, say: 'THE IRON IS HOT!', steps: [{ idle: 20 }, { move: 'iron' }, { idle: 40 }, { move: 'stamp' }, { idle: 34 }, { move: 'iron' }] },
  ],
  special: [{ type: 'brandMark', frames: 720, mult: 1.7 }],
  titleDefense: null,
  gallery: 'THE MARKER. THE IRON BRANDS YOU AND THE NEXT HIT IS A CRITICAL: SLIP IT, AND THE MARK COOLS.',
  medals: { signature: { text: 'FINISH THE FIGHT WITHOUT EVER BEING BRANDED.', check: 'noCue', cue: '!branded' } },
  music: 'brandWalkup',
};
