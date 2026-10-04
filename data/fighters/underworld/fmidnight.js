// #96 Fallen Midnight — Underworld IV. Count Midnight fought by the light going out and coming back. In the
// Hall of the Fallen it does not come back. The lights go out at the bell and stay out for the whole fight: the ring, the crowd
// and the Count himself are black, and all you have are his eyes and the sounds he makes. Every punch has its own tell sound as well
// as its own look of the eyes:
//   eyes slide LEFT / a whisper      the Nightfall jab (anything works)
//   eyes slide RIGHT / a moan        the Bat Wing hook (slip left or duck)
//   eyes drop DOWN / a scrape        the Grave Digger to the body (block it, or slip left)
//   eyes flare WIDE / a wail         the Midnight Strike, an uppercut (slip it)
//   left, then right                 Fang Fury: two hooks, one from each side
// He never comes back into the light, so the exploits that used to need it are gone; the dark is what he has now.
// His super is DEAD OF NIGHT: slip it, then hit him in its recovery, on the glint (which shows in the dark too).
// Underworld difficulty: 3-frame tells (a lean fighter), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps, GETUP } from '../pantheon/_kit.js';
import midnight from '../midnight.js';

const W = 3;

export default {
  id: 'fmidnight',
  name: 'FALLEN MIDNIGHT',
  short: 'MIDNIGHT',
  nickname: 'THE NIGHT WITHOUT END',
  circuit: 'u4',
  rank: 2,
  isChampion: false,
  card: { age: '???', weight: 158, record: '31-0 27KO', hometown: 'THE DARK MANOR', quote: 'I NEVER FIGHT BEFORE MIDNIGHT. NOW IT IS ALWAYS MIDNIGHT. YOU ARE WELCOME.' },
  lines: { win: 'SLEEP WELL. AH-HA-HA-HA.', lose: 'THE SUN... IT DOES NOT RISE...' },

  build: 'lean',
  palette: 'fmidnight',
  spriteLayers: 'midnight',

  stats: stats({ health: 340, damageMult: 2.0, stunResistance: 5, starLossChance: 0.6, stunFrames: 48, hitstun: 11 }),
  anims: { ...anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 } }), taunt: midnight.anims.taunt, victory: midnight.anims.victory },
  guardCounter: 'strike', // (punch into his guard twice and he answers with the uppercut: a 3-frame jab would come before you could slip it)

  moves: {
    nightfall: mv('jab', W, { name: 'NIGHTFALL', eyes: [-4, 0, 0], sfx: { tell: 'whisper', swing: 'whiff' } }),
    batWing: mv('hook', W, { name: 'BAT WING', eyes: [4, 0, 0], sfx: { tell: 'moan', swing: 'swingHeavy' } }),
    grave: mv('body', W, { name: 'GRAVE DIGGER', eyes: [0, 3, 0], sfx: { tell: 'scratch', swing: 'whiff' } }),
    strike: mv('upper', W, { name: 'MIDNIGHT STRIKE', eyes: [0, -2, 1], sfx: { tell: 'wail', swing: 'swingHeavy' } }),
    fang1: mv('hookL', W, { name: 'FANG FURY', windupFrames: 6, recoveryFrames: 6, counterWindow: [3, 5], starWindow: null, punishStar: null, eyes: [-4, 0, 0], noFake: true, sfx: { tell: 'moan', swing: 'swingHeavy' } }),
    fang2: mv('hook', W, { name: 'FANG FURY (2)', windupFrames: 14, recoveryFrames: 30, counterWindow: null, starWindow: null, eyes: [4, 0, 0], noFake: true, sfx: { swing: 'swingHeavy' } }),
    deadOfNight: superMove('DEAD OF NIGHT', { windupFrames: 18, counterWindow: [5, 15], starWindow: [5, 8], eyes: [0, -3, 1], sfx: { tell: 'wail', swing: 'crash' } }),
  },

  patterns: [
    { id: 'dusk', weight: 3, when: { rounds: [1] }, steps: steps('i36 nightfall i34 grave i30 batWing i34 strike i40 nightfall i30 fang1 fang2 i44') },
    { id: 'witching', weight: 3, steps: steps('i30 grave i28 strike i26 nightfall i26 fang1 fang2 i32 batWing i34 strike i40') },
    { id: 'blackest', weight: 2, when: { health: [0, 0.5] }, steps: steps('i24 fang1 fang2 i24 strike i20 grave i22 nightfall i22 batWing i26 strike i34') },
  ],

  super: { hit: 'head', move: 'deadOfNight', golden: 'recovery', window: [9, 12], taunt: 44, shout: 'DEAD OF NIGHT!', times: [1, 2] },

  getUpTable: GETUP, // (Phase F: the Pantheon's and the upper Underworld's table; these had the Storm circuit's 6-8)


  exploits: [
    {
      id: 'graveMistake', type: 'quirk', name: 'A GRAVE MISTAKE',
      trigger: { on: 'resolved', move: 'grave', result: 'dodged' },
      effect: { open: { frames: 86, anim: 'stunned', comboLimit: 5, star: [0, 32] }, say: 'HE FALLS IN HIS OWN GRAVE!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'THE SCRAPE OF A SHOVEL COMES BEFORE THE GRAVE DIGGER. SLIP LEFT OF IT AND HE FOLLOWS THE SHOVEL DOWN.' },
      scout: 'SLIP LEFT OF THE GRAVE DIGGER (THE SCRAPING BODY SHOT) INSTEAD OF BLOCKING IT: HE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'starLight', type: 'starTrigger', name: 'A STAR LIGHTS THE ROOM',
      trigger: { star: true, state: ['idle', 'block', 'recovery'] },
      effect: { stun: 100, hits: 6, say: 'HE CAN\'T SEE!', sfx: 'flashbulb' },
      hint: { kind: 'quote', text: '"I CAN SEE EVERYTHING IN THE DARK. EXCEPT WHAT SHINES."' },
      scout: 'LAND A STAR PUNCH ON HIM IN THE DARK: THE FLASH BLINDS HIM AND HE IS STUNNED FOR 6 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'seesYourStars', type: 'starHoard', name: 'SEES YOUR STARS', hold: 360, moves: ['nightfall', 'batWing', 'strike'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 6 SECONDS AND HIS NEXT JAB, HOOK OR UPPERCUT TAKES ONE, EVEN BLOCKED. SPEND THEM.',
    },
  ],
  scriptedMoments: [
    { id: 'darkDeepens', name: 'THE DARK DEEPENS', when: { health: 0.4 }, say: 'THE DARK DEEPENS...', steps: [{ idle: 20 }, { move: 'fang1' }, { move: 'fang2' }, { idle: 28 }, { move: 'strike' }] },
  ],
  special: [{ type: 'blackout', dark: [0, 0, 2], eyeHi: [31, 26, 26], eyeLo: [27, 3, 6] }],
  titleDefense: null,
  gallery: 'THE MAJOR CHAMPION, FALLEN. THE LIGHTS GO OUT AT THE BELL AND NEVER COME BACK: WATCH HIS EYES AND LISTEN.',
  medals: { signature: { text: 'LIGHT THE ROOM: LAND A STAR PUNCH ON HIM.', check: 'cueCount', cue: '!exploit:starLight', n: 1 } },
  music: 'fmidnightWalkup',
};
