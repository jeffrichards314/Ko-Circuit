// ORIGIN and ORIGIN TRUE FORM (2026-10-04), built from one place (data/fighters/origin/origin.js and originTrue.js call buildOrigin(false | true)).
//
// ORIGIN (the Gauntlet's): FOUR PHASES, each at full health (the last a thin bar), KO only in the last:
//   1 THE FIRST PUNCH   his first arts, the Belt Halo, and the First Punch (a long slow windup: the whole screen slows)
//   2 EVERY ARENA       twelve styles, one after another: the arena flickers into a past arena and he fights in that champion's style
//   3 THE MEDLEY        signature supers of three worlds chained into one combo; and Rewind
//   4 THE BEGINNING     everything at full speed on a gold screen, a thin bar
// ORIGIN TRUE FORM (the Title Defense's): SIX PHASES, tighter tells, longer patterns, and four attacks only he has (afterimages, the ring of fire, collision, and
// the first arena rewound, which is the First Punch, Every Arena and Rewind in one):
//   1 THE FIRST PUNCH  2 EVERY ARENA (two arenas at once: styles clash)  3 THE BELT HALO (the ring of fire)  4 THE MEDLEY (four worlds)  5 REWIND (and
//   collisions)  6 THE BEGINNING, FULLY
// Knowledge (K): data/fighters/origin/knowledge.js; the corner's words (Dash): data/hints/origin.js.
import { stats, anims } from '../void/_void.js';
import {
  ALL_MOVES, TRUE_MOVES, REWIND_CHAIN, AFTERIMAGE_CHAIN, FIRE_RING_CHAIN, COLLISION_CHAIN, styleChain, longSteps, SIG, MEDLEY_WORLDS,
} from './_kit.js';
import { STYLES } from './styles.js';
import { originKnowledge } from './knowledge.js';

const REST = { open: 48, anim: 'flicker', star: [2, 14], comboLimit: 4, id: 'rest' };

export function buildOrigin(T) {
  const moves = { ...ALL_MOVES(), ...(T ? TRUE_MOVES() : {}) };
  const slow = (a) => (moves[a] && moves[a].recoveryFrames >= 26 ? 10 : 0);
  const KIT = [['jab', 3], ['cross', 3], ['hook', 3], ['hookL', 3], ['body', 2], ['bodyR', 2], ['upper', 2], ['sweep', 1], ['stride', 1]];
  const gap = T ? [8, 14] : [10, 18];
  const patterns = [];
  const seq = (id, seg, seed, pool, count, g = gap, o = {}) => patterns.push({ id, seg, weight: o.weight || 3, fixed: true, steps: longSteps({ seed, moves: pool, count, gaps: g, first: 28, last: 36, after: slow, rest: { every: 7, steps: [{ idle: 22 }, { ...REST }] } }) });
  const N = (a, b) => (T ? b : a);

  // ------------------------------------------------------------------------------------------------------ phase 1: the first arts and the halo
  [[1, 7101], [2, 7117], [3, 7129]].forEach(([n, seed]) => seq(`first${n}`, 'first', seed, KIT, N(40, 52)));
  const HALO_POOL = [...KIT, ['halo_L', 3], ['halo_R', 3]];
  [[1, 7201], [2, 7213]].forEach(([n, seed]) => seq(`halo${n}`, 'halo', seed, HALO_POOL, N(36, 48), [12, 20]));

  // ------------------------------------------------------------------------------------------------------ phase 2: every arena
  // a style: the arena flickers into the champion's, two of his own blows twice over, then his echo and his signature
  for (const S of STYLES) {
    const [a, b] = [`st_${S.id}_1`, `st_${S.id}_2`];
    patterns.push({
      id: `style_${S.id}`, seg: `st_${S.id}`, weight: 3, fixed: true,
      steps: [{ idle: 30 }, { move: `flick_${S.id}` }, { idle: 10 }, { move: a }, { idle: 12 }, { move: b }, { idle: 16 }, { move: 'jab' }, { idle: 20 }, { move: a }, { idle: 12 }, { move: b }, { idle: 20 },
        { move: `echo_${S.id}` }, { move: `sig_${S.id}` }, { idle: 24 }, { move: b }, { idle: 14 }, { move: a }, { idle: 24 }, { ...REST }, { idle: 20 }],
    });
  }
  // (the true form: two styles in one arena, clashing: the first's blows and the second's, interleaved, each side's echo and signature at the end)
  const PAIRS = [['gus', 'brody'], ['mcbride', 'midnight'], ['rex', 'baron'], ['maestro', 'avalanche'], ['mirror', 'karver'], ['warden', 'eclipse']];
  for (const [x, y] of PAIRS) {
    patterns.push({
      id: `clash_${x}_${y}`, seg: `cl_${x}`, weight: 3, fixed: true,
      steps: [{ idle: 26 }, { move: `flick_${x}` }, { idle: 8 }, { move: `st_${x}_1` }, { idle: 10 }, { move: `st_${y}_1` }, { idle: 10 }, { move: `st_${x}_2` }, { idle: 10 }, { move: `st_${y}_2` }, { idle: 16 },
        { move: `flick_${y}` }, { idle: 8 }, { move: `st_${y}_1` }, { idle: 10 }, { move: `st_${x}_2` }, { idle: 12 }, { move: `echo_${x}` }, { move: `sig_${x}` }, { idle: 16 }, { move: `echo_${y}` }, { move: `sig_${y}` }, { idle: 26 }, { ...REST }, { idle: 18 }],
    });
  }

  // ------------------------------------------------------------------------------------------------------ phase 3 (ORIGIN) / 4 and 5 (true form): the medley and the rewind
  const med = (id, seg, worlds, extra = []) => patterns.push({
    id, seg, weight: 3, fixed: true,
    steps: [{ idle: 30 }, ...worlds.flatMap(([w, c]) => (w === 'void' ? [{ move: 'tr_void' }, { move: `vecho_${c}` }, { move: `vsig_${c}` }, { idle: 12 }] : [{ move: `tr_${w}` }, { move: `echo_${c}` }, { move: `sig_${c}` }, { idle: 12 }])), { move: 'md_fin' }, { idle: 20 }, ...extra, { ...REST }, { idle: 20 }],
  });
  const MED = [
    [['road', 'gus'], ['warp', 'mirror'], ['pantheon', 'aurora']], [['pantheon', 'hale'], ['underworld', 'moros'], ['road', 'rex']], [['warp', 'eclipse'], ['road', 'avalanche'], ['underworld', 'crucible']],
    [['underworld', 'soot'], ['warp', 'karver'], ['pantheon', 'prism']],
  ];
  const MEDT = [...MED.map((m, i) => [...m, ['void', ['dodge', 'duck', 'time', 'will'][i]]].slice(0, 4)), [['road', 'maestro'], ['pantheon', 'nebula'], ['underworld', 'jailer'], ['void', 'chaos']]];
  const medSeg = (n) => (T ? 'medley' : n % 2 ? 'medleyA' : 'medleyB');
  (T ? MEDT : MED).forEach((m, i) => med(`medley${i + 1}`, medSeg(i), m));
  // the rewind chain thrown from his patterns too (a kept super: every throw is the super): kit blows around it
  const rwSteps = (a) => [{ idle: 28 }, { move: 'rw_go' }, ...REWIND_CHAIN.map((id) => ({ move: id })), { idle: a }, { ...REST }, { idle: 20 }];
  patterns.push({ id: 'rewind1', seg: T ? 'rewind' : 'rewindA', weight: 3, fixed: true, steps: rwSteps(30) });
  patterns.push({ id: 'rewind2', seg: T ? 'rewind' : 'rewindA', weight: 2, fixed: true, steps: [{ idle: 24 }, { move: 'jab' }, { idle: 14 }, { move: 'hook' }, { idle: 20 }, ...rwSteps(24).slice(1)] });
  if (!T) seq('rewindKit', 'rewindA', 7301, KIT, 28);

  // ------------------------------------------------------------------------------------------------------ the belt halo (true form: phase 3)
  if (T) {
    [[1, 7401], [2, 7413], [3, 7429]].forEach(([n, seed]) => seq(`haloT${n}`, 'haloT', seed, [...KIT, ['halo_L', 4], ['halo_R', 4], ['rf_low', 2], ['rf_rise', 2], ['rf_squeeze', 1]], 52, [9, 16]));
  }

  // ------------------------------------------------------------------------------------------------------ the last phase: everything at full speed
  const FINAL_POOL = [...KIT, ['halo_L', 2], ['halo_R', 2], ['stride', 1]];
  [[1, 7501], [2, 7513], [3, 7529]].forEach(([n, seed], k) => {
    const base = longSteps({ seed, moves: FINAL_POOL, count: N(72, 86), gaps: N([8, 14], [7, 12]), first: 24, last: 36, after: slow, rest: { every: 6, steps: [{ idle: 20 }, { ...REST, open: 42 }] } });
    // a style's echo and signature go in at the middle and at the end (the champions it is most about)
    const at = base.map((s, i) => (s.move ? i : -1)).filter((i) => i >= 0);
    const IDS = ['gus', 'maestro', 'eclipse', 'avalanche'];
    const mid = base.slice(0, at[Math.floor(at.length / 2)]), tail = base.slice(at[Math.floor(at.length / 2)]);
    patterns.push({ id: `final${n}`, seg: 'final', weight: 3, fixed: true, steps: [...mid, { idle: 28 }, { move: `echo_${IDS[k]}` }, { move: `sig_${IDS[k]}` }, { idle: 30 }, ...tail, { idle: 28 }, { move: `echo_${IDS[k + 1]}` }, { move: `sig_${IDS[k + 1]}` }, { idle: 40 }] });
  });

  // ------------------------------------------------------------------------------------------------------ the segments
  const seg = (s, name, o = {}) => ({ seg: s, name, ...o });
  const styleSegs = STYLES.map((S) => seg(`st_${S.id}`, `STYLE: ${S.id.toUpperCase()}`, { style: S.id }));
  const clashSegs = PAIRS.map(([x, y]) => seg(`cl_${x}`, `CLASH: ${x.toUpperCase()} AND ${y.toUpperCase()}`, { style: x }));
  const ROUNDS = T
    ? [null, { segs: [seg('first', 'THE FIRST PUNCH')] }, { segs: clashSegs }, { segs: [seg('haloT', 'THE BELT HALO')] }, { segs: [seg('medley', 'THE MEDLEY')] }, { segs: [seg('rewind', 'REWIND')] }, { segs: [seg('final', null)], pace: 1.3 }]
    : [null, { segs: [seg('first', 'THE FIRST PUNCH'), seg('halo', 'THE BELT HALO')] }, { segs: styleSegs }, { segs: [seg('medleyA', 'THE MEDLEY'), seg('rewindA', 'REWIND'), seg('medleyB', 'THE MEDLEY')] }, { segs: [seg('final', null)], pace: 1.2 }];

  // ------------------------------------------------------------------------------------------------------ his supers
  const supers = [
    { move: 'fp', golden: 'windup', window: [37, 38], hit: 'head', name: 'THE FIRST PUNCH', stun: T ? 320 : 360, taunt: 64, shout: 'THE FIRST PUNCH', times: [1, 2],
      scout: 'THE FIRST PUNCH: THE WHOLE SCREEN SLOWS. A HEAD SHOT ON THE GLINT, A MOMENT TWO FRAMES WIDE NEAR THE END OF THE WINDUP, STUNS HIM FOR A LONG TIME.' },
    { move: 'ea_go', then: [...styleChain('gus'), ...styleChain('mirror'), ...styleChain('eclipse'), 'ea_fin'], on: 'ea_fin', golden: 'windup', window: [15, 16], hit: 'body', name: 'EVERY ARENA', taunt: 50, shout: 'EVERY ARENA',
      scout: 'EVERY ARENA: THE ARENA FLICKERS INTO THREE (FOUR, IN THE TRUE FORM) OF THE OLD ONES AND HE FIGHTS IN EACH CHAMPION\'S STYLE. WHEN THE FLICKER STOPS ON THE FIRST ARENA, A BODY SHOT ON THE GLINT LEAVES HIM WIDE OPEN.' },
    { move: 'md_go', then: ['tr_road', 'echo_gus', 'sig_gus', 'tr_warp', 'echo_mirror', 'sig_mirror', 'tr_pantheon', 'echo_aurora', 'sig_aurora', 'md_fin'], on: 'md_fin', golden: 'windup', window: [15, 16], hit: 'head', name: 'THE MEDLEY', taunt: 48, shout: 'THE MEDLEY', keep: true,
      scout: 'THE MEDLEY: THE SIGNATURE SUPERS OF THREE DIFFERENT WORLDS, ONE AFTER ANOTHER, A NEW TRANSITION BETWEEN EACH. A HEAD SHOT ON THE GLINT IN THE LAST WINDUP, WHEN THEY ARE ALL SPENT, LEAVES HIM WIDE OPEN.' },
    { move: 'rw_go', then: [...REWIND_CHAIN], on: 'rw_fin', golden: 'recovery', after: 'dodged', window: [5, 6], hit: 'body', flag: 'rewindClean', name: 'REWIND', taunt: 46, shout: 'REWIND', keep: true,
      scout: 'REWIND: IF A BLOW OF THE SEQUENCE LANDS, TIME RUNS BACK AND IT REPLAYS FASTER. SLIP THE WHOLE RUN CLEAN, THEN A BODY SHOT ON THE GLINT IN THE RECOVERY OF ITS LAST BLOW BREAKS THE REWIND AND LEAVES HIM WIDE OPEN.' },
    { move: 'hf_L', then: ['hf_R', 'hf_R', 'hf_L', 'hf_R', 'hf_fin'], on: 'hf_fin', golden: 'windup', window: [9, 10], hit: 'head', name: 'THE WHOLE HALO', taunt: 48, shout: 'THE WHOLE HALO',
      scout: 'THE WHOLE HALO: BELTS FALL FROM THE SIDES, THE ONE THAT GLOWS FIRST SHOWS THE SAFE SIDE, AND THE LAST COMES DOWN ON BOTH. A HEAD SHOT ON THE GLINT IN ITS WINDUP LEAVES HIM WIDE OPEN.' },
  ];
  if (T) {
    supers.push(
      { move: 'af_go', then: [...AFTERIMAGE_CHAIN], on: 'af_fin', golden: 'windup', window: [17, 18], hit: 'head', name: 'THE AFTERIMAGES', taunt: 46, shout: 'AFTERIMAGES',
        scout: 'AFTERIMAGES: EACH BLOW IS THROWN AGAIN BY HIS AFTERIMAGE FROM THE OTHER SIDE. A HEAD SHOT ON THE GLINT IN THE LAST WINDUP, THE SHADOW OF THE FIRST, LEAVES HIM WIDE OPEN.' },
      { move: 'rf_go', then: [...FIRE_RING_CHAIN], on: 'rf_fin', golden: 'windup', window: [9, 10], hit: 'body', name: 'THE RING OF FIRE', taunt: 46, shout: 'THE RING OF FIRE',
        scout: 'THE RING OF FIRE: THE HALO BURNS AND CLOSES: LOW, HIGH, TIGHT. A BODY SHOT ON THE GLINT WHEN THE FIRE CLOSES LEAVES HIM WIDE OPEN.' },
      { move: 'co_go', then: [...COLLISION_CHAIN], on: 'co_fin', golden: 'windup', window: [17, 18], hit: 'head', name: 'COLLISION', taunt: 46, shout: 'COLLISION',
        scout: 'COLLISION: TWO ARENAS MEET IN THE MIDDLE AND THE SHRAPNEL FLIES TO ONE SIDE. A HEAD SHOT ON THE GLINT WHEN THE WORLD COMES DOWN LEAVES HIM WIDE OPEN.' },
      { move: 'fa_go', then: ['fa_punch', 'flick_gus', 'st_gus_1', 'st_gus_2', 'echo_gus', 'sig_gus', 'rw_1', 'rw_3', 'rw_5', 'fa_fin'], on: 'fa_fin', golden: 'recovery', after: 'dodged', window: [5, 6], hit: 'head', flag: 'rewindClean', name: 'THE FIRST ARENA, REWOUND', taunt: 56, shout: 'THE BEGINNING, REWOUND', times: [1, 1],
        scout: 'THE FIRST ARENA, REWOUND: THE FIRST PUNCH, THREE ARENAS AND THE REWIND IN ONE. ANY BLOW THAT LANDS RUNS ALL OF IT BACK, QUICKER. SLIP THE WHOLE RUN CLEAN, THEN A HEAD SHOT ON THE GLINT IN THE RECOVERY OF THE LAST SECOND BREAKS IT.' },
    );
  }

  const K = originKnowledge(T);
  return {
    id: T ? 'originTrue' : 'origin',
    name: T ? 'ORIGIN' : 'ORIGIN',
    short: 'ORIGIN',
    nickname: T ? 'THE FIRST AND THE LAST' : 'THE FIRST FIGHTER',
    circuit: T ? 'originTrue' : 'origin',
    rank: 0,
    isChampion: true,
    card: { age: 0, weight: 0, record: '1-0 1KO', hometown: 'THE BEGINNING', quote: T ? 'YOU HAVE SEEN WHERE EVERY PUNCH WENT. NOW SEE WHERE IT CAME FROM.' : 'I THREW THE FIRST PUNCH. THEN EVERYONE ELSE LEARNED HOW.' },
    lines: { win: T ? 'AND THEN IT ENDS WHERE IT STARTED.' : 'THE FIRST PUNCH, AGAIN.', lose: T ? 'THE FIRST... TO FALL... AND THE LAST...' : 'THERE IS ONE MORE OF ME...' },

    build: 'medium',
    palette: T ? 'originTrue' : 'origin',
    spriteLayers: T ? 'originTrue' : 'origin',
    rounds: T ? 6 : 4,
    roundMusic: T ? ['originTrueI', 'originTrueII', 'originTrueIII', 'originTrueIV', 'originTrueV', 'originTrueVI'] : ['originI', 'originII', 'originIII', 'originIV'],

    stats: stats({ health: T ? 520 : 640, damageMult: T ? 2.7 : 2.5, stunResistance: 8, starLossChance: 0.7, stunFrames: 84, hitstun: 12, comboLimit: 3, betweenRoundHeal: 0.2, idleGuard: 'high' }),
    anims: {
      idle: { frames: ['idle1', 'idle2'], rate: 16 }, block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'], stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
      knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'], taunt: ['nought'], victory: ['victory'], flicker: { frames: ['undone1', 'undone2'], rate: 6 },
    },
    guardCounter: 'jab',

    moves,
    patterns,
    phases: T
      ? [
        { name: 'THE FIRST PUNCH', scout: 'HIS FIRST ARTS, THE FIRST PUNCH (THE WHOLE SCREEN SLOWS) AND A HALO OF EVERY BELT IN THE GAME.' },
        { name: 'EVERY ARENA', scout: 'THE ARENAS FLICKER IN PAIRS: TWO CHAMPIONS\' STYLES CLASH IN ONE RING.' },
        { name: 'THE BELT HALO', scout: 'THE HALO BURNS. BELTS FALL FROM THE SIDES, THE FIRE RING CLOSES.' },
        { name: 'THE MEDLEY', scout: 'FOUR WORLDS\' SIGNATURES IN ONE COMBO, THE VOID\'S THE LAST.' },
        { name: 'REWIND', scout: 'TIME RUNS BACK WHEN A BLOW LANDS. THE ARENAS COLLIDE.' },
        { name: 'THE BEGINNING, FULLY', scout: 'EVERYTHING AT FULL SPEED, AND THE FIRST ARENA, REWOUND: THE FIRST PUNCH, EVERY ARENA AND REWIND IN ONE. ONLY NOW CAN HE BE KNOCKED OUT.' },
      ]
      : [
        { name: 'THE FIRST PUNCH', scout: 'HIS FIRST ARTS, THE BELT HALO AND THE FIRST PUNCH, WHERE THE WHOLE SCREEN SLOWS.' },
        { name: 'EVERY ARENA', scout: 'THE ARENA FLICKERS INTO A PAST ONE EVERY FEW SECONDS AND HE FIGHTS IN THAT CHAMPION\'S STYLE.' },
        { name: 'THE MEDLEY', scout: 'THE SIGNATURES OF THREE WORLDS IN ONE COMBO, AND REWIND: A HIT RUNS TIME BACK.' },
        { name: 'THE BEGINNING', scout: 'ALL OF IT AT FULL SPEED, A THIN HEALTH BAR. ONLY NOW CAN HE BE KNOCKED OUT.' },
      ],
    super: supers[0],
    supers: supers.slice(1),

    getUpTable: [{ upAt: [9, 9], health: 0.45 }, { upAt: [9, 9], stayDown: 0.65, health: 0.35 }, { upAt: null }],
    modFlags: ['rewindClean'],
    exploits: K.exploits,
    antiStrategies: K.antiStrategies,
    scriptedMoments: K.scriptedMoments,
    special: [
      { type: 'originSeg', rounds: ROUNDS, finalHealth: T ? 300 : 340 },
      {
        type: 'origin', trueForm: !!T, first: 'fp', slowmo: 0.3, styles: T ? 4 : 3, worlds: T ? 4 : 3,
        mix: T
          ? { 1: [['fp', 3], ['hf_L', 1]], 2: [['ea_go', 3], ['fp', 1]], 3: [['hf_L', 2], ['rf_go', 3], ['af_go', 2]], 4: [['md_go', 3], ['af_go', 1], ['fp', 1]], 5: [['rw_go', 3], ['co_go', 3], ['md_go', 1]], 6: [['fa_go', 3], ['fp', 1], ['ea_go', 1], ['md_go', 1], ['rw_go', 1], ['co_go', 1], ['rf_go', 1], ['af_go', 1]] }
          : { 1: [['fp', 3], ['hf_L', 2]], 2: [['ea_go', 3], ['fp', 1]], 3: [['md_go', 3], ['rw_go', 3], ['fp', 1]], 4: [['fp', 2], ['ea_go', 2], ['md_go', 2], ['rw_go', 2], ['hf_L', 1]] },
      },
    ],
    titleDefense: null,
    gallery: T
      ? 'THE FIRST FIGHTER, ALL OF HIM: THE LIGHT TURNED WHITE-GOLD, THE HALO A RING OF FIRE, THE ARENAS COLLIDING. SIX PHASES, AND FOUR ATTACKS THE FIRST HAS NEVER SHOWN: AFTERIMAGES, THE RING OF FIRE, COLLISION AND THE FIRST ARENA, REWOUND.'
      : 'THE FIRST FIGHTER THERE EVER WAS. HE THREW THE FIRST PUNCH, AND ZERO WAS ONLY HIS SHADOW. A TOWERING FIGURE OF SHIFTING LIGHT WITH A HALO OF EVERY BELT IN THE GAME, FOUR PHASES: THE FIRST PUNCH, EVERY ARENA, THE MEDLEY, THE BEGINNING.',
    medals: { signature: { text: T ? 'LAND THE GOLDEN MOMENT OF THE FIRST PUNCH.' : 'LAND THE GOLDEN MOMENT OF THE FIRST PUNCH.', check: 'cueCount', cue: '!golden:fp', n: 1 }, speed: T ? 1500 : 1200 },
    music: T ? 'originTrueEntrance' : 'originEntrance',
    fightMusic: T ? 'originTrueI' : 'originI',
    secret: true,
  };
}
void SIG; void MEDLEY_WORLDS;
