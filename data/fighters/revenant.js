// #48 Revenant Rourke — Nightmare Circuit. Old Man Rourke never stayed down in
// his life, and death didn't change his mind. Same old fox, same old tricks
// (his moves are Rourke's own, pulled from his file, a step quicker), in a
// grave-pale hide with cold light where his eyes used to be.
// He still plays possum: when he staggers, look at his face. If he's winking,
// DON'T touch him. Wait for SNAP BACK and counter it (on the glint, he drops).
// If you bite: slip right, slip left, slip the uppercut.
// And you can't keep him down. He's up at the count of ONE, three times
// (the headstones under the clock). Every time he rises he's faster.
// Only the fourth knockdown keeps him in the ground.

import rourke from './rourke.js';

// Rourke's moves, a step quicker (counter / star / perfect windows move with the windup)
const quicker = (m, d) => {
  if (!d) return { ...m };
  const w = m.windupFrames - d;
  const sh = (win) => { if (!win) return win; const lo = Math.max(2, win[0]); return [lo, Math.max(lo, Math.min(w - 1, win[1] - d))]; };
  return { ...m, windupFrames: w, counterWindow: sh(m.counterWindow), starWindow: sh(m.starWindow), kdWindow: m.kdWindow && [m.kdWindow[0] - d, m.kdWindow[1] - d] };
};
const NAMES = {
  oldJab: 'GRAVE JAB', liverHook: 'COLD LIVER HOOK', hook: 'BONEYARD HOOK', haymaker: 'LAST RITES',
  snapBack: 'SNAP BACK', snapA: 'SNAP (2)', snapB: 'SNAP (3)', snapC: 'SNAP UPPERCUT',
  trapA: 'GOTCHA HOOK', trapB: 'GOTCHA HOOK (2)', trapC: 'GOTCHA UPPERCUT',
};
const FASTER = { oldJab: 2, liverHook: 2, hook: 2, haymaker: 3, snapBack: 3 };
const moves = Object.fromEntries(Object.entries(rourke.moves).map(([k, m]) => [k, { ...quicker(m, FASTER[k] || 0), name: NAMES[k] || m.name }]));
moves.haymaker.sfx = { tell: 'toll', swing: 'swingHeavy' };

export default {
  ...rourke,
  id: 'revenant',
  name: 'REVENANT ROURKE',
  short: 'REVENANT',
  nickname: 'THE OLD GHOST',
  circuit: 'nightmare',
  rank: 2,
  isChampion: false,
  card: {
    age: '61+',
    weight: 181,
    record: '88-20 61KO',
    hometown: 'THE OLD DOCKS GRAVEYARD',
    quote: 'TOLD YOU, SONNY. I NEVER STAY DOWN.',
  },
  lines: {
    win: 'SEE YOU ON THE OTHER SIDE. I\'LL SAVE YOU A STOOL.',
    lose: 'NOT... FAKING... THIS TIME EITHER...',
  },

  palette: 'revenant',
  spriteLayers: 'rourke',

  stats: {
    ...rourke.stats,
    health: 240,
    damageMult: 1.7,
    starLossChance: 0.6,
  },

  moves,

  // up at the count of one, three times; the fourth time he stays down
  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'snapBack', then: ['snapA', 'snapB', 'snapC'], keep: true, golden: 'advance', window: [3, 6], taunt: 36, shout: 'STILL NOT DEAD!', times: [1, 2] },
  // more supers (super.js): each armored from its first frame to its last attack, each with one golden moment
  supers: [
    { hit: 'body', move: 'haymaker', inline: true, golden: 'windup', window: [8, 11] },
  ],

  getUpTable: [
    { upAt: [1, 1], health: 0.55 },
    { upAt: [1, 1], health: 0.5 },
    { upAt: [1, 1], health: 0.45 },
    { upAt: null },
  ],


  special: [
    ...rourke.special,
    { type: 'undying', rises: 3, scales: [1, 0.92, 0.84, 0.76], minWindup: 6 },
  ],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // his own knowledge layer (the possum tricks are Rourke's, but the ghost's own names and texts)
  exploits: [
    {
      id: 'blownForReal', type: 'stunTrigger', name: 'DEAD TIRED',
      trigger: { state: 'open', open: 'winded', height: 'low' },
      effect: { stun: 104, hits: 7, say: 'EVEN GHOSTS GET WINDED!', sfx: 'oof' },
      hint: { kind: 'audio', text: 'THE REAL BREATHER HAS THE PANTING. THE POSSUM ONLY GROANS.' },
      scout: 'A BODY SHOT WHILE HE\'S REALLY WINDED STUNS HIM FOR 7 HITS.',
    },
    {
      id: 'gotchaBackfire', type: 'quirk', name: 'GOTCHA... NOT',
      trigger: { on: 'resolved', move: 'trapC', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 7, star: [0, 36] }, say: 'HAUNTED HIMSELF!', sfx: 'thud' },
      hint: { kind: 'quote', text: 'TOLD YOU, SONNY. I NEVER STAY DOWN.' },
      scout: 'SLIP THE LAST PUNCH OF HIS POSSUM TRAP: THE GHOST IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'lastRitesMissed', type: 'quirk', name: 'THE BELL TOLLS FOR HIM',
      trigger: { on: 'resolved', move: 'haymaker', result: 'dodged' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 6, star: [0, 30] }, say: 'THE BELL TOLLS FOR HIM!', sfx: 'toll' },
      hint: { kind: 'audio', text: 'THE BELL TOLLS ONCE FOR LAST RITES, THEN IT GOES QUIET.', hidden: true },
      scout: 'SLIP LAST RITES (THE HAYMAKER): HE\'S OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'oldMansPatience', type: 'earlyDodge', name: 'THE GHOST\'S PATIENCE', response: 'hold', moves: ['haymaker'], say: 'HE WAITS ON IT!',
      scout: 'SLIP LAST RITES TOO EARLY AND THE GHOST HOLDS IT UNTIL YOUR SLIP RUNS OUT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'lastRitesRound', name: 'LAST RITES ROUND', when: { left: 60 }, say: 'THE BELL TOLLS!',
      steps: [{ idle: 20 }, { move: 'oldJab' }, { idle: 14 }, { move: 'hook' }, { idle: 14 }, { move: 'haymaker' }],
    },
    {
      id: 'graveyardShift', name: 'GRAVEYARD SHIFT', when: { health: 0.3 }, say: 'THE GRAVEYARD SHIFT!',
      steps: [{ idle: 18 }, { move: 'oldJab' }, { idle: 12 }, { move: 'hook' }, { idle: 12 }, { move: 'liverHook' }],
    },
  ],
  gallery: 'OLD MAN ROURKE CAME BACK. HE GETS UP AT THE COUNT OF ONE, AGAIN AND AGAIN.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'PUT HIM DOWN 3 TIMES IN ONE ROUND.', check: 'byTKO' } },
  music: 'revenantWalkup', // his walk-up jingle (data/music/walkups.js)
};
