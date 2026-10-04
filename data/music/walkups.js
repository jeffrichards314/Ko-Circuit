// Walk-up jingles (original): the few bars a fighter walks out to on his intro
// card, like the Punch-Out character stings. Champions keep their longer
// entrance themes (in each circuit's music file) and DJ Drop walks out to his own
// track; everyone else has one here, named `<id>Walkup` (see data/fighters/index.js).
// Every one is three bars (12 beats; the waltzes 4 bars of 3), every channel the
// same length (tools/audio-audit.mjs checks).

const P1 = (duty, decay = 0.3, sustain = 0.6) => ({ duty, env: { decay, sustain } });

function walkup(id, tempo, [p1, p2, tri, noise], { d1 = 1, d2 = 0, v1 = 11, v2 = 7, env1, env2 } = {}) {
  const ch = {
    p1: { ...P1(d1, ...(env1 || [])), mml: `v${v1} ${p1}` },
    p2: { ...P1(d2, ...(env2 || [0.2, 0.4])), mml: `v${v2} ${p2}` },
    tri: { mml: `v15 ${tri}` },
  };
  if (noise) ch.noise = { mml: noise };
  return { id: id + 'Walkup', tempo, loop: false, channels: ch };
}

export const WALKUPS = [
  // Rookie
  walkup('barney', 110, [ // a lazy mop-bucket shuffle
    'o4 l8 c e g e a4 g4 | f8 e8 d8 e8 c2 | g4. e8 c2',
    'o3 l8 e g >c< g f4 e4 | d8 c8 <b8> c8 e2 | e4. c8 e2',
    'o3 l4 c g f c | g <g> c2 | g c2.',
    'l8 v8 [k h s h]4 k4 s4 k4 r4',
  ]),
  walkup('kid', 176, [ // a sugar rush
    'o5 l16 e g+ b >e< b g+ e g+ b >e< b g+ e4 | f+16 a16 >c+16< a16 f+8 a8 b4 >e4< | e8 r8 e8 r8 >e4< r4',
    'o4 l8 b >e< b >e< b >e< g+4 | a >c+< a >c+< b4 g+4 | g+8 r8 g+8 r8 b4 r4',
    'o3 l8 [e e >e< e]2 | a a >a< a b b >b< b | e4 e4 e4 r4',
    'l8 v9 [k h s h]4 k8 k8 s8 s8 x4 r4',
  ], { d1: 2 }),
  walkup('mort', 132, [ // bike bell, on his rounds
    'o5 l8 g4 b8 >d8< g4 d4 | e8 f+8 g8 a8 b4 g4 | >d8. <b16 g4 d4 r4',
    'o4 l4 b >d< b g | c e d <b> | g2 d4 r4',
    'o3 l4 g d g d | c c d d | g2 <g4> r4',
    'l8 v8 [k h s h]4 k4 s4 x4 r4',
  ]),
  // Minor
  walkup('rocco', 120, [ // hard-hat clank
    'o4 l8 d d r d f4 d4 | a8 a8 r8 a8 g4 f4 | d4 r8 d8 d2',
    'o3 l8 a a r a >c4< a4 | >e8 e8 r8 e8 d4 c4< | a4 r8 a8 a2',
    'o2 l4 d d d d | f f g a | d d d2',
    'l8 v10 [k r s r]4 k k s r x4 r4',
  ], { d1: 2, d2: 2 }),
  walkup('gambini', 100, [ // the magician's mystery
    'o5 l8 e f e d+ e4 a4 | c16 d16 e16 f16 g8 a8 g4 e4 | a2. r4',
    'o4 l4 a >c< a e | f e d e | a2. r4',
    'o3 l2 a e | f e | a2. r4',
    'l4 v6 h r h r | h r h8 h8 h4 | x2. r4',
  ], { d1: 0, env1: [0.5, 0.7] }),
  walkup('knox', 112, [ // a stately lecture-hall march
    'o5 l8 f a >c< a f4 c4 | d8 e8 f8 g8 a4 f4 | c4 e4 f2',
    'o4 l8 a >c f c< a4 a4 | b-8 >c8 d8 e8 f4 c4< | a4 >c4< a2',
    'o3 l4 f c f c | b- a g c | f c f2',
    'l8 v6 [k h h h]4 k4 h4 x4 r4',
  ]),
  // Metro
  walkup('ray', 144, [ // rush-hour horns
    'o5 l8 b- r b- r f4 r4 | g8 a8 b-8 >c8 d4 <b-4 | f8 f8 f8 r8 b-4 r4',
    'o4 l8 d r d r c4 r4 | e-8 f8 g8 a8 b-4 f4 | d8 d8 d8 r8 f4 r4',
    'o2 l4 b- f b- f | e- f g f | b- f b- r',
    'l8 v8 [k h s h]4 s16 s16 s16 s16 k4 x4 r4',
  ], { d1: 2 }),
  walkup('pidge', 126, [ // head-bobbing coo
    'o5 l8 d r f+ r a4 f+4 | g8 f+8 e8 f+8 d4 r4 | a8 f+8 d2.',
    'o4 l8 f+ r a r >d4< a4 | b8 a8 g8 a8 f+4 r4 | >d8< a8 f+2.',
    'o3 l4 d a d a | g a d r | d2. r4',
    'l8 v7 [k r h r]4 k8 h8 k8 h8 x4 r4',
  ]),
  walkup('sam', 138, [ // squeaky-clean scales, forty floors up
    'o5 l8 g b >d< b g4 r4 | a8 >c8 e8 c8< a4 r4 | b8 >d8 g4< g4 r4',
    'o4 l8 d g b g d4 r4 | e8 a8 >c8< a8 e4 r4 | g8 b8 >d4< d4 r4',
    'o3 l4 g d g d | a e a e | g d g r',
    'l16 v7 [h h h h k8 s8]4 k4 s4 x4 r4',
  ], { d1: 0 }),
  // Major
  walkup('anchor', 150, [ // a sailor's hornpipe
    'o5 l16 d8 f+ a >d8< a f+ d8 f+ a d8 r8 | e8 g b >e8< b g e8 a >c+ e8 r8< | d4 a4 >d4< r4',
    'o4 l8 f+ a f+ a f+ a f+ r | g b g b a >c+< a r | f+4 a4 f+4 r4',
    'o3 l4 d a d a | e b a e | d a d r',
    'l8 v9 [k h s h]4 k4 s4 x4 r4',
  ]),
  walkup('gemini', 132, [ // one twin, then the other a beat behind
    'o5 l8 e g b g e4 d+4 | e8 f+8 g8 a8 b4 e4 | b8 g8 e2 r4',
    'o4 r4 e8 g8 b8 g8 e4 | d+4 e8 f+8 g8 a8 b4 | e4 b8 g8 e4 r4',
    'o3 l4 e b e b | c d e b | e b e r',
    'l8 v8 [k h s h]4 k4 s4 x4 r4',
  ], { d2: 1, v2: 9 }),
  // Carnival
  walkup('strongman', 104, [ // oompah under the big top
    'o4 l4 b- >d f d< | e-8 f8 g8 a8 b-2 | f4 >d4 b-2<',
    'o3 l4 r f r f | r g r f | r f d2',
    'o2 l4 b- r f r | e- r f r | b- f b-2',
    'l4 v10 k s k s | k s k s | k8 k8 s4 x2',
  ], { d1: 2 }),
  walkup('pockets', 160, [ // calliope and a bicycle horn
    'o5 l8 c e g >c< b g e g | f a >c< a g4 e4 | c8 c8 r8 c8 >c4< r4',
    'o4 l4 e g e g | f a e g | e8 e8 r8 e8 g4 r4',
    'o3 l4 c g c g | f c g c | c g c r',
    'l8 v8 [k h s h]4 k8 k8 s8 s8 x4 r4',
  ], { d1: 3 }),
  walkup('tess', 144, [ // a tightrope waltz
    'o5 l4 a2 >c+ | e2 d | c+2 <b | a2.',
    'o4 l4 r c+ e | r e f+ | r e d | c+2.',
    'o3 l4 a r r | a r r | e r r | a r r',
    'l4 v6 k h h k h h k h h x2.',
  ], { d1: 0, env1: [0.4, 0.7] }),
  walkup('jinx', 168, [ // chromatic carousel
    'o5 l8 c c+ d d+ e f f+ g | a- g f+ f e d+ d c+ | c4 >c4< c4 r4',
    'o4 l4 a a- g f+ | f e d+ d | a4 >a4< a4 r4',
    'o3 l4 f c f c | d- c d- c | f c f r',
    'l8 v8 [k h s h]4 s16 s16 s16 s16 k4 x4 r4',
  ], { d1: 2 }),
  // Continental
  walkup('rusty', 140, [ // country, on the interstate
    'o5 l8 d d b4 a8 g8 e4 | g8 g8 >d4< b8 a8 g4 | d8 e8 g4 g2',
    'o4 l8 b b >d4< >c8< b8 g4 | b8 b8 >f+4< >d8 c8< b4 | b8 >c8 d4< b2',
    'o2 l4 g d g d | g d g d | c d g2',
    'l8 v8 [k h s h]4 k8 k8 s4 x4 r4',
  ]),
  walkup('tia', 150, [ // a whirl of wind
    'o5 l16 a e c e a e c e b e c+ e b e c+ e | >c< a e a >c< a e a >d< a f a >d< a f a | e8 a8 >e4< a2',
    'o4 l4 a a e e | f f d d | e c a2',
    'o3 l2 a e | f d | e a',
    'l16 v6 [h h h h]8 k4 s4 x4 r4',
  ], { d1: 0 }),
  walkup('sutures', 120, [ // the monitor beeps
    'o6 l8 c r r r c r r r | c r r r c r e r | c2 r2',
    'o4 l4 e e f f | g g a g | e2 r2',
    'o3 l4 c r c r | c r g r | c2 r2',
    'l8 v9 k k r r k k r r | k k r r k k r r | x2 r2',
  ], { d1: 3, env1: [0.1, 0.2] }),
  // World
  walkup('lars', 116, [ // a logging-camp reel
    'o5 l8 d d e f+ g4 f+4 | e8 d8 c8 <a8> d2 | a4 f+4 d2',
    'o4 l8 f+ f+ g a b4 a4 | g8 f+8 e8 c8 f+2 | f+4 d4 <a2>',
    'o3 l4 d a d a | c c d2 | d a d2',
    'l4 v9 k h k h | k h k h | k8 k8 k4 x2',
  ]),
  walkup('hank', 160, [ // the storm spinning up
    'o5 l16 e f+ g a b a g f+ e f+ g a b a g f+ | e g b >e< b g e g c e g >c< g e c e | b4 e4 e2',
    'o4 l4 e e b b | c c e e | d+ b e2',
    'o3 l2 e b | c a | b e',
    'l16 v7 [k h s h]4 [s s s s]4 k4 x4 x2',
  ], { d1: 2 }),
  walkup('glacier', 72, [ // slow, cold, almost nothing
    'o5 l2 a f | e d | a1',
    'o4 l2 d d | c+ a | d1',
    'o2 l1 d | a | d',
    'l1 v5 r r x',
  ], { d1: 0, env1: [0.8, 0.8] }),
  // Storm
  walkup('bolt', 184, [ // crackling arpeggios
    'o5 l16 b >d f+ b< b >d f+ b< a >c+ e a< a >c+ e a< | g b >d g< g b >d g< f+ a+ >c+ f+< f+ a+ >c+ f+< | b8 r8 b8 r8 >b4< r4',
    'o4 l8 b b b b a a a a | g g g g f+ f+ f+ f+ | b r b r b4 r4',
    'o3 l8 b b b b a a a a | g g g g f+ f+ f+ f+ | b4 b4 b4 r4',
    'l16 v8 [k h h h s h h h]4 k4 s4 x4 r4',
  ], { d1: 3 }),
  walkup('downpour', 90, [ // grey skies
    'o5 l4 g e- c e- | f d <b> d | c2 r2',
    'o4 l8 [c r]4 | [<b> r]4 | c2 r2',
    'o3 l2 c a- | g g | c r',
    'l16 v5 [h r h h]8 x2 r2',
  ], { d1: 0 }),
  walkup('cole', 168, [ // round and round
    'o5 l16 f a >c f< c a f a f a >c f< c a f a | g b- >d g< d b- g b- a >c e a< e c a >c< | f4 >f4< f2',
    'o4 l4 a a a a | b- b- >c c< | a >c< a2',
    'o3 l4 f c f c | g d a e | f c f2',
    'l8 v8 [k h s h]4 k8 s8 k8 s8 x2',
  ], { d1: 2 }),
  // Legends
  walkup('rourke', 96, [ // an old man's blues
    'o5 l8 e g a b- b4 a4 | g8 e8 d8 e8 <b4> e4 | e2. r4',
    'o4 l4 g+ g+ a a | g e d e | e2. r4',
    'o2 l8 e g+ b >c+< d c+ <b g+> | a >c+ e f+< a g+ e c+ | e2. r4',
    'l8 v6 [k r h k s r h r]2 k4 s4 x4 r4',
  ], { d1: 0 }),
  walkup('ignatius', 108, [ // an iron march
    'o4 l4 g g b- g | >d2 c4 <b-4 | g2 g2',
    'o4 l4 d d g d | f2 e-4 d4 | d2 d2',
    'o2 l4 g d g d | b- f g d | g2 g2',
    'l4 v11 k s k s | k s k s | k8 k8 k4 x2',
  ], { d1: 2, d2: 2 }),
  walkup('duchess', 120, [ // a court minuet
    'o5 l4 d f+ a | >d2< a | b a g | f+2.',
    'o4 l4 a >d f+ | a2 f+ | g f+ e | d2.<',
    'o3 l4 d r r | f+ r r | g r a | d2.',
    'l4 v6 k h h k h h k h h x2.',
  ], { d1: 0 }),
  // Grand Prix
  walkup('nova', 192, [ // off the blocks
    'o5 l16 a b >c+ e< a b >c+ e< a b >c+ e< a b >c+ e< | b >c+ e f+< b >c+ e f+< b >c+ e f+< b >c+ e f+< | >a4< a4 a2',
    'o4 l8 e e e e e e e e | f+ f+ f+ f+ f+ f+ f+ f+ | e4 c+4 e2',
    'o3 l8 a a a a a a a a | d d d d e e e e | a4 e4 a2',
    'l16 v8 [k h s h]8 k4 s4 x2',
  ], { d1: 2 }),
  walkup('goliath', 112, [ // a parade-ground march
    'o4 l8 g4. g8 >c4 e4 | g4. e8 d4 c4 | <g4. g8 >c2',
    'o4 l8 e4. e8 g4 >c4< | e4. c8 <b4> g4 | e4. e8 g2',
    'o2 l4 c g c g | c g g g | c g c2',
    'l16 v10 [s s s8 s8 s8]4 k4 s4 x2',
  ], { d1: 2 }),
  walkup('quinn', 108, [ // a whistle across the prairie
    'o6 l8 e4. b8 e2 | d8 c8 <b8 a8 b2> | e4. <b8 >e2',
    'o4 l4 r e r e | r d r d | r e e2',
    'o3 l4 e b e b | d a d a | e b e2',
    'l8 v6 [k r h h]4 k8 r8 h8 h8 x2',
  ], { d1: 0, env1: [0.6, 0.8], v1: 9 }),
  walkup('monk', 80, [ // one breath
    'o5 l4 d e f+ a | b2 a2 | f+1',
    'o4 l2 a b | >d< f+ | a1',
    'o3 l1 d | e | d',
    'l2 v4 r r r r x1',
  ], { d1: 0, env1: [0.8, 0.8], v1: 9 }),
  // Underground
  walkup('static', 140, [ // a bad signal
    'o5 l16 c c c r c+ c+ r r d d d d r r c r | c c c r c+ c+ r r d+ d+ d+ d+ r r d r | c8 r8 c16 c16 c16 r16 c2',
    'o4 l8 f+ r f+ r g r g r | f+ r f+ r a r a r | f+4 r4 f+2',
    'o3 l4 c r c+ r | c r d r | c r c2',
    'l16 v7 [h h r h k r h h]4 x4 r4 x4 r4',
  ], { d1: 3 }),
  walkup('cade', 124, [ // a dirty riff
    'o4 l8 e e g e a4 g4 | e8 e8 b-8 a8 g4 e4 | e4 r8 e8 e2',
    'o3 l8 b b >d< b >e4 d4< | b8 b8 >f8 e8 d4< b4 | b4 r8 b8 b2',
    'o2 l8 e e e e e e e e | e e e e e e e e | e4 r8 e8 e2',
    'l8 v10 [k k s r]4 k8 k8 s4 x2',
  ], { d1: 2, d2: 2 }),
  walkup('null', 120, [ // nothing at all, then one note
    'o5 l1 r r c',
    'l1 r r r',
    'l1 r r r',
    null,
  ], { d1: 0, v1: 5, env1: [0.9, 0.9] }),
  // Nightmare
  walkup('hollow', 88, [ // a draught from nowhere
    'o5 l16 [a b-]8 [f g]8 d2 r2',
    'o4 l2 d d | c+ c+ | d r',
    'o3 l1 d | a | d',
    'l1 v4 r r x',
  ], { d1: 0, v1: 8 }),
  walkup('revenant', 84, [ // the old blues, from the other side
    'o5 l8 e g a b- b4 a4 | g8 e8 d8 e8 <b4> e4 | e1',
    'o4 l2 g g | e d | e1',
    'o2 l1 e | a | e',
    'l1 v4 r r x',
  ], { d1: 0, v1: 8, env1: [0.7, 0.7] }),
  walkup('frenzy', 200, [ // no brakes
    'o5 l16 c d- c d- e- d c d- c d- e- e f e e- d | c e- f+ a >c< a f+ e- c e- f+ a >c< a f+ e- | c8 c8 c8 c8 >c4< r4',
    'o4 l8 a- a- a- a- a- a- a- a- | f+ f+ f+ f+ a a a a | a-8 a-8 a-8 a-8 a-4 r4',
    'o3 l8 c c c c c c c c | c c c c d- d- d- d- | c4 c4 c4 r4',
    'l16 v9 [k s k s]8 x4 x4 r2',
  ], { d1: 2, d2: 2 }),
];

export const WALKUP_SONGS = Object.fromEntries(WALKUPS.map((s) => [s.id, s]));
