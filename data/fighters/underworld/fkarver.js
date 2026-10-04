// #98 Fallen Karver — Underworld IV's champion, the Hall of the Fallen. King Karver had no plan but you: he read your slips and
// your punches and answered them. In the Hall of the Fallen he reads TWICE AS FAST: two slips to the same side and his carve comes
// from the arm you can't slip; two punches at one height and he guards it. His mood still follows your hearts (PATIENT, HUNGRY,
// RUTHLESS), and it is the Underworld's crown now, so it takes a tithe: THE KING'S TITHE is an uppercut that steals a star
// when it lands.
//   He reads your slips. The Carve and the Scepter each have a twin from the other arm; a "!" over his crown
//   shows he changed hands. Mix your slips, or duck.
// His super is the GUILLOTINE: KNEEL. He shows off up close, arms wide; hit him on the glint while he does it and the crown comes off.
// Underworld difficulty: 5-frame tells for a heavy (3-frame circuit), adaptive, 10 hearts, one life; a champion.

import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';
import karver from '../karver.js';

const W = 5;
const gr = { tell: 'grunt', swing: 'swingHeavy' };
const carve = (name, kind, twin, av) => mv(kind, W, { name, twin, windupFrames: 8, counterWindow: [3, 7], starWindow: null, avoidBy: av, sfx: gr });

export default {
  id: 'fkarver',
  name: 'FALLEN KARVER',
  short: 'KARVER',
  nickname: 'THE DEAD KING',
  circuit: 'u4',
  rank: 0,
  isChampion: true,
  card: { age: 47, weight: 244, record: '77-5 60KO (AND YOU)', hometown: 'THE EMPTY THRONE', quote: 'I HAVE STUDIED A THOUSAND CHALLENGERS. I HAVE ALREADY STUDIED YOU TWICE.' },
  lines: { win: 'LONG LIVE THE KING. THERE IS NO OTHER.', lose: 'THE CROWN... IS... THE UNDERWORLD\'S...' },

  build: 'heavy',
  palette: 'fkarver',
  spriteLayers: 'fkarver',

  stats: stats({ health: 480, damageMult: 2.15, stunResistance: 7, starLossChance: 0.65, stunFrames: 52, hitstun: 12, guardCounter: 0 }),
  anims: { ...anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 } }), taunt: karver.anims.taunt, victory: karver.anims.victory },

  moves: {
    crown: mv('jab', W, { name: 'CROWN JAB', sfx: { tell: 'grunt' } }),
    crownR: mv('jabR', W, { name: 'CROWN CROSS', sfx: { tell: 'grunt' } }),
    burden: mv('bodyR', W, { name: 'BURDEN', avoidBy: ['block', 'dodgeR'], sfx: { tell: 'grunt' } }),
    carveL: carve('CARVE', 'hookL', 'carveR', ['dodgeR', 'duck']),
    carveR: carve('CARVE', 'hook', 'carveL', ['dodgeL', 'duck']),
    scepterL: mv('bodyR', W, { name: 'SCEPTER', twin: 'scepterR', windupFrames: 7, counterWindow: [3, 6], avoidBy: ['block', 'dodgeR'], sfx: { tell: 'grunt' } }),
    scepterR: mv('body', W, { name: 'SCEPTER', twin: 'scepterL', windupFrames: 7, counterWindow: [3, 6], avoidBy: ['block', 'dodgeL'], sfx: { tell: 'grunt' } }),
    decree: mv('haymaker', W, { name: 'DECREE', windupFrames: 15, counterWindow: [4, 13], starWindow: [4, 7], sfx: { tell: 'growl', swing: 'swingHeavy' } }),
    // the tithe: an uppercut that takes a star when it lands
    tithe: mv('upper', W, { name: 'THE KING\'S TITHE', steal: true, punishStar: ['dodged'], sfx: { tell: 'coins', swing: 'swingHeavy' } }),
    guillotine: superMove('GUILLOTINE', { windupFrames: 18, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'rumble', swing: 'crash' } }),
  },

  patterns: [
    { id: 'audience', weight: 3, when: { rounds: [1] }, aggro: [0, 1], steps: steps('i30 crown i26 carveL i30 scepterR i34 decree i40 crownR i28 carveR i46') },
    { id: 'summons', weight: 3, aggro: [0, 1, 2], steps: steps('i26 scepterL i24 carveR i28 tithe i36 burden i24 carveL i30 decree i44') },
    { id: 'decree', weight: 2, aggro: [1, 2], steps: steps('i22 carveL i22 carveR i24 scepterR i26 tithe i32 decree i24 crown i40') },
    { id: 'bloodlust', weight: 2, aggro: [2], steps: steps('i18 tithe i22 carveL i18 carveR i20 scepterL i22 decree i24 tithe i34') },
  ],

  super: { hit: 'body', move: 'guillotine', golden: 'taunt', window: [18, 24], taunt: 40, shout: 'KNEEL!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'heavyHead', type: 'stunTrigger', name: 'HEAVY IS THE HEAD',
      trigger: { state: 'windup', move: 'decree', counter: true, frames: [9, 12], clean: 26 },
      effect: { stun: 112, hits: 7, star: true, say: 'THE CROWN SLIPS!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'HIS CROWN TILTS AT THE TOP OF THE DECREE: THE WEIGHT OF IT PULLS HIM OFF BALANCE.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE DECREE (HIS CROWN TILTS): STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'titheRefused', type: 'quirk', name: 'THE TITHE IS REFUSED',
      trigger: { on: 'resolved', move: 'tithe', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 7, star: [0, 40] }, say: 'THE TITHE IS REFUSED!', sfx: 'coins' },
      hint: { kind: 'audio', text: 'COINS RATTLE IN HIS FIST BEFORE THE TITHE. A KING WHO IS REFUSED FALLS OVER HIS OWN HAND.' },
      scout: 'SLIP HIS TITHE (THE UPPERCUT WITH THE RATTLE OF COINS): HE OVERREACHES AND IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'misread', type: 'quirk', name: 'MISREAD',
      trigger: { on: 'resolved', move: ['carveL', 'carveR', 'scepterL', 'scepterR'], result: 'ducked' },
      effect: { open: { frames: 78, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'HE MISREAD YOU!', sfx: 'whoosh' },
      hint: { kind: 'trainer', text: 'HE READS YOUR SLIPS. HE DOES NOT READ A DUCK.', hidden: true },
      scout: 'DUCK ONE OF HIS CARVES OR SCEPTERS (AND NOT SLIP IT): HE HAS COMMITTED TO THE WRONG ARM AND IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'crownWeighs', type: 'passivity', name: 'THE CROWN WEIGHS', response: 'buff', frames: 260, gain: 1 / 480, decay: 1 / 200, dmg: 0.35, rec: 0.2, meter: 'DECREE', say: 'THE KING GROWS PROUD!',
      scout: 'STAND STILL AND HIS PRIDE FILLS: HIS PUNCHES HIT HARDER AND RECOVER FASTER (NEVER WITH A SHORTER TELL). ANY PUNCH OF YOURS DRAINS IT.',
    },
    {
      id: 'kingsDue', type: 'getUpMash', name: 'THE KING\'S DUE', response: 'moves', moves: ['tithe'], say: 'THE KING\'S DUE!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HE GOES STRAIGHT INTO THE TITHE.',
    },
  ],
  scriptedMoments: [
    { id: 'court', name: 'THE COURT CONVENES', when: { left: 100 }, say: 'THE COURT CONVENES!', steps: [{ idle: 20 }, { move: 'crown' }, { idle: 26 }, { move: 'carveL' }, { idle: 24 }, { move: 'scepterR' }, { idle: 28 }, { move: 'tithe' }] },
    { id: 'abdication', name: 'NO ABDICATION', when: { health: 0.3 }, say: 'THE KING WILL NOT KNEEL!', steps: [{ idle: 16 }, { move: 'decree' }, { idle: 26 }, { move: 'tithe' }, { idle: 20 }, { move: 'carveR' }, { idle: 20 }, { move: 'decree' }] },
  ],
  special: [
    {
      // reads twice as fast as the Grand Prix king: a habit after two slips (memory 4, not 8) and two punches
      type: 'adapt', memory: 4, minRead: 2, minGuard: 2, habit: 0.75, minRecovery: 14,
      levels: [
        { name: 'PATIENT', min: 0.67, gap: 1, recovery: 1, color: [18, 24, 31], shout: '' },
        { name: 'HUNGRY', min: 0.34, gap: 0.72, recovery: 0.85, color: [31, 24, 6], shout: 'THE KING GETS HUNGRY!' },
        { name: 'RUTHLESS', min: 0, gap: 0.55, recovery: 0.72, color: [31, 8, 8], shout: 'THE KING SMELLS BLOOD!' },
      ],
    },
    { type: 'thief', take: 1, say: 'THE KING TAKES HIS TITHE!' },
  ],
  titleDefense: null,
  gallery: 'THE GRAND PRIX CHAMPION, FALLEN. HE READS YOUR HABITS TWICE AS FAST, AND HIS TITHE TAKES A STAR.',
  medals: { signature: { text: 'DUCK THE KING TWICE: MAKE HIM MISREAD YOU.', check: 'cueCount', cue: '!exploit:misread', n: 2 } },
  music: 'fkarverEntrance',
};
