// Rival fight IX, DASH UNBOUND (§18 A4, A5: the absolute final Dash fight). ZERO has filled Dash with the Void's power, and it has found
// everything Dash has ever been: he throws it ALL, on 3-frame tells, in the empty amateur gym where you both started, floating in the Void. The
// read, the flashbulb, the highlight reel, the grand finale, the divine dash, the reckless flurry, the chain hook, the shadow step: every
// gimmick of every fight. His patterns run longer than any Dash's before (30+ moves), and the Void gives him one thing of its own: he loses
// his footing on the frames after each shadow step. Win, and he is freed: he takes the Ferryman's place in your corner.
// Void difficulty: 3-frame tells, adaptive, 8 hearts, no spare life, KO only.
import dash8 from './dash8.js';
import { longSteps } from '../void/_void.js';

const K = dash8.moves;
const seq = (seed, ids) => longSteps({ seed, moves: ids, count: 30, gaps: [16, 30], rest: null, first: 24, last: 40, after: (a) => (['chainHook', 'flashbulb', 'finale3', 'divineL', 'divineR', 'shHook', 'shHookL'].includes(a) ? 14 : 0) });
// (the gimmick chains are in fixed patterns of their own, joined with his ordinary punches)
const plain = ['showJab', 'smartCross', 'cheapShot', 'knowItAll'];
const chain = (name, ids, gap = 22) => ids.flatMap((m, i) => [...(i ? [{ idle: gap }] : []), { move: m }]);
const P = (id, seed, when, ...blocks) => ({ id, weight: 3, fixed: true, when, steps: [{ idle: 22 }, ...blocks.flatMap((b, i) => [...(i ? [{ idle: 30 }] : []), ...b]), { idle: 40 }] });

export default {
  ...dash8,
  id: 'dash9',
  name: 'DASH MADDOX',
  short: 'DASH',
  nickname: 'UNBOUND',
  circuit: 'rival9',
  rival: 9,
  card: { age: 22, hometown: 'THE AMATEUR GYM, FLOATING', weight: 166, record: '48-0 43KO', quote: 'IT LET ME OUT OF EVERY CHAIN. I DON\'T KNOW WHAT I AM NOW. LET\'S FIND OUT.' },
  lines: { win: 'I WAS NEVER THE ONE TO STOP.', lose: 'I... THINK I... CAN FEEL MY HANDS...' },

  palette: 'dash9',
  spriteLayers: 'dash8',

  stats: { ...dash8.stats, health: 420, damageMult: 2.3 },

  patterns: [
    P('unbound1', 1, undefined, chain('a', ['showJab', 'chainHook', 'smartCross', 'divineL', 'knowItAll']), [{ move: 'recklessCall' }, { move: 'reck1' }, { move: 'reck2' }, { move: 'reck3' }, { move: 'reck4' }, { move: 'reck5' }, { ...dash8.patterns[0].steps.find((s) => s.open) }],
      chain('b', ['cheapShot', 'divineR', 'showJab', 'chainHook', 'smartCross', 'showJab', 'cheapShot', 'knowItAll', 'smartCross', 'showJab', 'cheapShot', 'smartCross'], 20)),
    P('unbound2', 2, undefined, chain('a', ['knowItAll', 'cheapShot', 'chainHook', 'showJab', 'smartCross']), [{ move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }], chain('b', ['smartCross', 'showJab', 'flashbulb', 'cheapShot', 'showJab', 'smartCross', 'knowItAll', 'showJab', 'cheapShot', 'smartCross', 'showJab', 'divineL', 'showJab', 'cheapShot', 'knowItAll', 'smartCross'], 20)),
    P('unbound3', 3, undefined, chain('a', ['divineR', 'showJab', 'smartCross', 'chainHook', 'cheapShot']), [{ move: 'finaleCall' }, { move: 'finale1' }, { move: 'finale2' }, { move: 'finale3' }], chain('b', ['showJab', 'cheapShot', 'flashbulb', 'smartCross', 'knowItAll', 'showJab', 'chainHook', 'showJab', 'smartCross', 'cheapShot', 'showJab', 'divineL', 'smartCross', 'showJab', 'cheapShot', 'knowItAll', 'smartCross'], 20)),
  ],

  // PHASE 2 (spec §18 A5: "Phase 2 adds Void-glitch tells"): the Void gets into his tells. While he winds up, the picture around him
  // tears (bands slide or turn to snow, like the Static's), so every tell is only partly there; each move keeps its own sound.
  special: [...(dash8.special || []), { type: 'phaseGate', phases: [2], inner: { type: 'glitch', bands: [9, 11, 13], ambient: 0.003 } }],
  phases: [
    { name: 'DASH, UNBOUND', scout: 'EVERY MOVE OF ALL NINE FIGHTS, IN 30-MOVE STRINGS. EMPTY HIS HEALTH BAR AND HE GETS BACK UP.' },
    { name: 'THE VOID IN HIM', scout: 'THE VOID GLITCHES HIS TELLS: THE PICTURE TEARS WHILE HE WINDS UP, SO LISTEN. EVERY MOVE KEEPS ITS OWN SOUND. ONLY NOW CAN HE BE KNOCKED OUT.' },
  ],

  gallery: 'DASH MADDOX, WITH THE VOID\'S POWER IN HIM. EVERY MOVE HE HAS EVER THROWN, IN THE EMPTY GYM WHERE YOU BOTH STARTED.',
  medals: { signature: { text: 'COUNTER HIS SHADOW HOOK.', check: 'cueCount', cue: '!exploit:darkReprise', n: 1 } },
  music: 'rivalUnbound',
};
void K; void seq; void plain;
