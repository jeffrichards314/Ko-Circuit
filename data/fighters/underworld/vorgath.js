// VORGATH, KING BELOW — the boss under the Underworld (spec §18 A6). Three phases, health-based (spec §4: empty a phase's bar and the next begins), each one at full health; you
// fight him in near-darkness: the whole ring, and he himself, are black, and all that shows of him are his EYES (which slide, drop or
// flare toward the punch) and the five RUBIES of his crown (which flare for the slow, heavy blows). And a piece of the floor goes with every phase:
//   PHASE I   THE TITHE       the whole ring. Ordinary punches and THE TITHE, a hand held out: it steals every star you have (landed
//                             or blocked). A blow on his crown right after it takes the star back.
//   PHASE II  THE CRUMBLING   the left of the ring has fallen into the dark: you can't slip LEFT. His punches are fitted to what's
//                             left of the floor (a slip that's gone is taken out; one with nothing left gets a duck). The Crown Breaker joins.
//   PHASE III THE THRONE      the right has gone too: no slipping at all, only blocks and ducks. Every punch can be ducked or blocked.
// You win by knocking the last phase out (every phase first; the championship rounds follow round 3, §4). His super is DOMINION, in every phase. Counter it on the glint.
// Underworld difficulty: 5-frame tells for a giant (3-frame circuit), adaptive, 10 hearts, one life; three phases, each at full health.

import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';

const W = 5;
const rum = { tell: 'rumble' };
// a punch of his: the eyes it shows in the dark ([dx, dy, wide]) and the crown's flare (0 none, 1 bright, 2 white-hot)
const eye = (o, e, crown = 0) => ({ eyes: e, crown, ...o });

export default {
  id: 'vorgath',
  name: 'VORGATH',
  short: 'VORGATH',
  nickname: 'KING BELOW',
  circuit: 'vorgath',
  rank: 0,
  isChampion: true,
  card: { age: 10000, weight: 420, record: 'UNBEATEN', hometown: 'THE THRONE BELOW', quote: 'EVERY CHAMPION KNEELS HERE IN THE END. YOU HAVE ONLY BEEN EARLY.' },
  lines: { win: 'KNEEL.', lose: 'THE THRONE... IS EMPTY...' },

  build: 'giant',
  palette: 'vorgath',
  spriteLayers: 'vorgath',
  roundMusic: ['vorgathI', 'vorgathII', 'vorgathIII'],

  // full health every phase (spec §4 boss phases; between rounds he heals a little, like any boss)
  stats: stats({ health: 500, damageMult: 2.3, stunResistance: 9, starLossChance: 0.7, stunFrames: 54, hitstun: 12, betweenRoundHeal: 0.2 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 30 } }),
  guardCounter: 'haymaker', // (a slow answer to punches into his guard: in the last phase there is no slipping, and a ducked punch needs the room)

  moves: {
    jab: mv('jab', W, eye({ name: 'GRAVE JAB', sfx: rum }, [-4, 0, 0])),
    cross: mv('jabR', W, eye({ name: 'GRAVE CROSS', sfx: rum }, [4, 0, 0])),
    bodyR: mv('bodyR', W, eye({ name: 'THRONE BLOW (R)', sfx: rum }, [0, 3, 0])),
    hookL: mv('hookL', W, eye({ name: 'KING\'S HOOK (L)', sfx: { tell: 'rumble', swing: 'swingHeavy' } }, [-4, 1, 0])),
    hook: mv('hook', W, eye({ name: 'KING\'S HOOK', sfx: { tell: 'rumble', swing: 'swingHeavy' } }, [4, 1, 0])),
    body: mv('body', W, eye({ name: 'THRONE BLOW', sfx: rum }, [0, 3, 0])),
    upper: mv('upper', W, eye({ name: 'ROYAL UPPERCUT', windupFrames: 9, counterWindow: [3, 7], starWindow: [3, 6], sfx: { tell: 'rumble', swing: 'swingHeavy' } }, [0, -2, 1], 1)),
    sweep: mv('sweep', W, eye({ name: 'GRAVEYARD SWEEP', sfx: { tell: 'rumble', swing: 'swingHeavy' } }, [0, 4, 1], 1)),
    haymaker: mv('haymaker', W, eye({ name: 'CROWN BREAKER', windupFrames: 17, counterWindow: [4, 15], starWindow: [4, 8], sfx: { tell: 'rumble', swing: 'crash' } }, [0, -3, 1], 2)),
    // the signature: a hand held out. It takes every star you have, landed or blocked (the `thief` modifier), and a head shot on his crown right
    // afterwards takes one back (his exploit).
    tithe: mv('upper', W, eye({ name: 'THE TITHE', steal: true, windupFrames: 9, avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'], counterWindow: [3, 7], starWindow: [3, 6], punishStar: null, sfx: { tell: 'coins', swing: 'swingHeavy' } }, [0, -1, 1], 1)),
    // phase II's: two stamps, the floor shaking: a slow overhead that comes down on the crumbling ring
    crush: mv('haymaker', W, eye({ name: 'FLOOR BREAKER', windupFrames: 14, counterWindow: [4, 12], starWindow: [4, 7], damage: 18, sfx: { tell: 'rumble', swing: 'crash' } }, [0, -3, 1], 2)),
    dominion: superMove('DEATH\'S DOMINION', eye({ windupFrames: 24, counterWindow: [5, 21], starWindow: [5, 9], kdWindow: [13, 16], sfx: { tell: 'rumble', swing: 'crash' } }, [0, -3, 1], 2)),
  },

  patterns: [
    // --- phase I: the whole floor ---
    { id: 'tithe1', set: 'p1', weight: 3, steps: steps('i32 jab i32 hook i30 body i34 tithe i44 upper i40 hookL i32 cross i54') },
    { id: 'court1', set: 'p1', weight: 3, steps: steps('i28 bodyR i26 hookL i28 jab i34 upper i38 tithe i44 hook i30 body i50') },
    // --- phase II: the left is gone (his moves are fitted to it) ---
    { id: 'crumble1', set: 'p2', weight: 3, steps: steps('i28 hook i26 upper i28 tithe i32 haymaker i42 body i26 jab i28 crush i50') },
    { id: 'crumble2', set: 'p2', weight: 3, steps: steps('i26 cross i24 hookL i26 bodyR i30 crush i40 upper i26 tithe i30 hook i48') },
    // --- phase III: no floor to slip on (every move can be ducked or blocked) ---
    { id: 'throne1', set: 'p3', weight: 3, steps: steps('i26 sweep i30 upper i26 tithe i30 haymaker i40 jab i24 sweep i34 upper i48') },
    { id: 'throne2', set: 'p3', weight: 3, steps: steps('i24 upper i24 jab i24 sweep i30 crush i38 tithe i26 upper i28 haymaker i46') },
  ],

  // his three phases (spec §4 "Boss phases"): each lasts until its health bar is emptied, not a round; a piece of the floor goes with each
  phases: [
    { name: 'THE TITHE', scout: 'THE WHOLE RING. ORDINARY PUNCHES AND THE TITHE, A HAND HELD OUT THAT STEALS EVERY STAR YOU HOLD.' },
    { name: 'THE CRUMBLING', scout: 'THE LEFT OF THE RING HAS FALLEN INTO THE DARK: NO SLIPPING LEFT. HIS PUNCHES ARE FITTED TO WHAT IS LEFT.' },
    { name: 'THE THRONE', scout: 'THE RIGHT IS GONE TOO: NO SLIPPING AT ALL, ONLY BLOCKS AND DUCKS. ONLY NOW CAN HE BE KNOCKED OUT.' },
  ],
  super: { hit: 'head', move: 'dominion', golden: 'windup', window: [13, 16], taunt: 52, shout: 'DOMINION!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], stayDown: 0.5, health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'crownStrike', type: 'starTrigger', name: 'THE CROWN GIVES IT BACK',
      trigger: { height: 'high', since: { event: 'starStolen', frames: [0, 48] }, state: ['idle', 'block', 'recovery'] },
      effect: { star: true, say: 'THE CROWN GIVES IT BACK!', sfx: 'star' },
      hint: { kind: 'visual', text: 'THE RUBIES FLARE WHEN HE TAKES A STAR: THE STAR IS IN THE CROWN FOR A MOMENT.' },
      scout: 'HIT HIS HEAD IN THE FIRST SECOND AFTER THE TITHE TAKES A STAR: THE STAR COMES BACK TO YOU.',
    },
    {
      id: 'crackedCrown', type: 'stunTrigger', name: 'A CRACKED CROWN',
      trigger: { state: 'windup', move: 'haymaker', counter: true, frames: [10, 14], clean: 28 },
      effect: { stun: 122, hits: 8, star: true, say: 'THE CROWN CRACKS!', sfx: 'shatter' },
      hint: { kind: 'visual', text: 'AT THE TOP OF THE CROWN BREAKER ALL FIVE RUBIES BLAZE WHITE: THE CROWN IS TAKING THE WHOLE BLOW.' },
      scout: 'A COUNTER ON THE MIDDLE FRAMES OF THE CROWN BREAKER (THE RUBIES BLAZE WHITE): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'kingStumbles', type: 'quirk', name: 'THE KING STUMBLES',
      trigger: { on: 'resolved', move: ['haymaker', 'crush'], result: ['dodged', 'ducked'] },
      effect: { open: { frames: 110, anim: 'stunned', comboLimit: 8, star: [0, 42] }, say: 'THE KING STUMBLES!', sfx: 'crash' },
      hint: { kind: 'audio', text: 'A HEAVY BLOW THAT FINDS NOTHING HAS NOWHERE TO GO BUT DOWN.', hidden: true },
      scout: 'SLIP OR DUCK THE CROWN BREAKER OR THE FLOOR BREAKER (THE SLOW OVERHEADS): HE STUMBLES AND IS OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'collectsTithe', type: 'starHoard', name: 'THE COLLECTOR', hold: 450, moves: ['jab', 'hook', 'hookL', 'upper'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT JAB, HOOK OR UPPERCUT TAKES ONE, EVEN BLOCKED. SPEND THEM.',
    },
    {
      id: 'dominionGrows', type: 'passivity', name: 'DOMINION GROWS', response: 'buff', frames: 240, gain: 1 / 520, decay: 1 / 220, dmg: 0.3, rec: 0.15, meter: 'DOMINION', say: 'HIS DOMINION GROWS!',
      scout: 'STAND STILL AND HIS DOMINION FILLS: HIS PUNCHES HIT HARDER AND RECOVER FASTER (NEVER WITH A SHORTER TELL). ANY PUNCH OF YOURS DRAINS IT.',
    },
  ],
  scriptedMoments: [
    { id: 'titheDue', name: 'THE TITHE IS DUE', when: { left: 60, round: 1 }, say: 'THE TITHE IS DUE!', steps: [{ idle: 18 }, { move: 'jab' }, { idle: 28 }, { move: 'tithe' }, { idle: 36 }, { move: 'upper' }] },
    { id: 'floorGives', name: 'THE FLOOR GIVES', when: { left: 60, round: 2 }, say: 'THE FLOOR GIVES!', steps: [{ idle: 18 }, { move: 'crush' }, { idle: 34 }, { move: 'hook' }, { idle: 28 }, { move: 'haymaker' }] },
    { id: 'throneRoom', name: 'THE THRONE ROOM', when: { left: 60, round: 3 }, say: 'THE THRONE ROOM!', steps: [{ idle: 18 }, { move: 'sweep' }, { idle: 32 }, { move: 'upper' }, { idle: 32 }, { move: 'haymaker' }] },
  ],
  special: [
    {
      type: 'phases',
      phases: [
        { from: 1, set: 'p1', name: 'PHASE I: THE TITHE', color: [31, 12, 12], palette: 'vorgath', shout: null, note: 'PHASE I: THE TITHE STEALS YOUR STARS. HIS EYES AND THE CROWN ARE ALL YOU SEE.' },
        { from: 2, set: 'p2', name: 'PHASE II: THE CRUMBLING', color: [31, 8, 8], palette: 'vorgath.p2', shout: 'THE FLOOR GIVES!', note: 'PHASE II: THE LEFT OF THE RING HAS FALLEN AWAY. YOU CAN\'T SLIP LEFT.' },
        { from: 3, set: 'p3', name: 'PHASE III: THE THRONE', color: [31, 24, 8], palette: 'vorgath.p3', shout: 'NO GROUND LEFT!', note: 'PHASE III: THE RIGHT HAS GONE TOO. NO SLIPPING AT ALL: BLOCK AND DUCK.' },
      ],
    },
    { type: 'gloom', dark: 0.94, eyeHi: [31, 26, 22], eyeLo: [28, 4, 6] },
    { type: 'thief', take: 3, blocked: true, say: 'THE TITHE IS PAID!' },
  ],
  titleDefense: null,
  gallery: 'VORGATH, KING BELOW. HE FIGHTS IN NEAR-DARKNESS. THE FLOOR CRUMBLES EACH PHASE AND HIS TITHE STEALS STARS.',
  medals: { signature: { text: 'TAKE A STOLEN STAR BACK FROM HIS CROWN.', check: 'cueCount', cue: '!exploit:crownStrike', n: 1 } },
  music: 'vorgathEntrance',
};
