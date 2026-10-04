// #72 Reflection — Pantheon VI, the Mirror Sanctum. YOU, in the glass. He wears your skin, your hair
// and hair colour, your trunks, gloves and shoes, and he fights with your hands: a left and a right, each to the
// head or the body, and a Star Punch at the end. Nothing else. No gimmick to solve: he is exactly what
// you are, and he doesn't get tired. The mirror shows him left for right, so a left jab
// comes from his left glove: the pose tells you the side.
// His super is his STAR PUNCH: the star you always keep for the end. A knockdown: slip it. Counter it on the
// glint and it's your own star you were hit with.
// He is YOU, so he dodges too: a punch thrown at him while he stands in his stance finds only a slide to the side
// (the `evasive` gimmick, hittable everywhere else: his tells, his recoveries, his openings and stuns all still land).
// Pantheon VI difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;

export default {
  id: 'reflection',
  name: 'REFLECTION',
  short: 'REFLECTION',
  nickname: 'YOU',
  circuit: 'p6',
  rank: 3,
  isChampion: false,
  mirrorPlayer: true, // fightState dresses him in the player's colours and hair (data/reflection.js)
  card: {
    age: 0,
    weight: 0,
    record: 'SAME AS YOURS',
    hometown: 'THE OTHER SIDE OF THE GLASS',
    quote: 'YOU KNOW EVERY MOVE I HAVE. YOU LEARNED THEM FROM YOURSELF.',
  },
  lines: { win: 'YOU BEAT YOURSELF.', lose: 'I... WAS... YOU...' },

  build: 'medium',
  palette: 'reflection',
  spriteLayers: 'reflection.spiky',

  stats: stats({ health: 310, damageMult: 2.05, stunFrames: 44 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 16 } }),

  moves: {
    jabLH: mv('jab', W, { name: 'LEFT JAB, HEAD', damage: 13 }),
    jabRH: mv('jabR', W, { name: 'RIGHT JAB, HEAD', damage: 15 }),
    jabLB: mv('body', W, { name: 'LEFT JAB, BODY', damage: 15 }),
    jabRB: mv('bodyR', W, { name: 'RIGHT JAB, BODY', damage: 16 }),
    // the one you save: his Star Punch
    starPunch: superMove('STAR PUNCH', { sfx: { tell: 'starWind', swing: 'starPunch' }, kdWindow: [10, 13] }),
  },

  patterns: [
    { id: 'onesAndTwos', weight: 3, when: { rounds: [1] }, steps: steps('i26 jabLH i8 jabRH i26 jabLB i8 jabRB i34 jabRH i10 jabLH i8 jabLB i40') },
    { id: 'bodyWork', weight: 3, steps: steps('i24 jabRB i8 jabLB i10 jabRH i30 jabLH i8 jabRH i8 jabRB i38') },
    { id: 'youAtYourBest', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 jabLH i6 jabRH i6 jabLB i22 jabRB i8 jabLH i26 jabRH i8 jabRB i8 jabLB i36') },
  ],

  super: { hit: 'Rhead', move: 'starPunch', golden: 'windup', window: [10, 13], taunt: 44, shout: 'STAR PUNCH!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'crossedHands', type: 'stunTrigger', name: 'CROSSED HANDS',
      trigger: { state: 'recovery', move: 'jabLH', after: 'dodged', side: 'R', height: 'high', frames: [6, 20] },
      effect: { stun: 92, hits: 6, star: true, say: 'LEFT IS RIGHT!', sfx: 'glass' },
      hint: { kind: 'quote', text: 'LEFT IS RIGHT IN A MIRROR.' },
      scout: 'SLIP HIS LEFT HEAD JAB AND HIT BACK WITH A RIGHT-HAND HEAD SHOT: HE CROSSES HIS HANDS: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'admiresHimself', type: 'bait', name: 'ADMIRES HIMSELF', limit: 2,
      trigger: { on: 'passive', frames: 300 },
      effect: { script: [{ open: 64, anim: 'taunt', id: 'admire', comboLimit: 4, star: [0, 26] }], say: 'HE ADMIRES HIMSELF!' },
      hint: { kind: 'visual', text: 'HE LOOKS AT YOU. YOU LOOK AT HIM. WHO BLINKS?', hidden: true },
      scout: 'STAND STILL FOR 5 SECONDS AND HE STOPS TO ADMIRE HIS OWN REFLECTION: OPEN FOR 4 HITS, THE FIRST A STAR.',
    },
    {
      id: 'crackedStar', type: 'quirk', name: 'THE STAR CRACKS THE GLASS',
      trigger: { on: 'resolved', move: 'starPunch', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 7, star: [0, 38] }, say: 'THE GLASS CRACKS!', sfx: 'glass' },
      hint: { kind: 'visual', text: 'A STAR PUNCH THAT MISSES SHOULD TAKE HALF THE MIRROR WITH IT.', hidden: true },
      scout: 'SLIP HIS STAR PUNCH: IT SHATTERS THE GLASS AROUND HIM AND HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'yourOwnCombo', type: 'comboRepeat', name: 'YOUR OWN COMBO', gap: 40, delay: 14, counter: ['jabLH', 'jabRH', 'jabLB'], say: 'YOUR OWN COMBO!',
      scout: 'THROW THE SAME TWO-PUNCH COMBO TWICE IN A ROW AND HE HAS SEEN IT: HE CATCHES THE SECOND AND ANSWERS WITH A THREE-PUNCH COMBO OF HIS OWN.',
    },
    {
      id: 'sameHeart', type: 'starHoard', name: 'THE SAME HEART', hold: 420, moves: ['jabLH', 'jabRH', 'jabLB', 'jabRB'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT PUNCH TAKES ONE, EVEN BLOCKED.',
    },
  ],
  scriptedMoments: [
    {
      id: 'everyMove', name: 'EVERY MOVE YOU MADE', when: { left: 75 }, say: 'EVERY MOVE YOU MADE!',
      steps: [{ idle: 18 }, { move: 'jabLH' }, { idle: 8 }, { move: 'jabRH' }, { idle: 8 }, { move: 'jabLB' }, { idle: 8 }, { move: 'jabRB' }],
    },
  ],
  // (he slips what is thrown at his stance, like you; every opening he leaves is hittable as before)
  special: [{ type: 'evasive', hittable: ['windup', 'active', 'recovery', 'open', 'hit', 'stunned', 'taunt', 'backstep', 'advance', 'kd', 'down', 'getup'], frames: 14, after: 6, poseL: 'idle2', poseR: 'idle2' }],
  titleDefense: null,
  gallery: 'YOU, IN THE GLASS: YOUR COLOURS, YOUR HAIR, YOUR MOVES. HE HAS NOTHING ELSE.',
  medals: { signature: { text: 'WIN WITHOUT USING A STAR PUNCH.', check: 'noStarPunch' } },
  music: 'reflectionWalkup',
};
