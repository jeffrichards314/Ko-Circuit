// "Night Shift Skyline": Metro Circuit fight theme (original).
// E minor at 164 bpm: a syncopated octave-jumping bass under a street-funk lead,
// offbeat pulse stabs and a busier kit. Bigger city, faster pulse than Minor.
// Form: A (Em G C B | Em Am C B), B (Am Em C D | Am Em Am B), loop.

export default {
  id: 'metroFight',
  tempo: 164,
  channels: {
    p1: {
      duty: 1, env: { decay: 0.24, sustain: 0.5 }, vibrato: true,
      mml: `o4 l8 v11
        e4 g8 b8 r8 a8 g8 e8 | d8 e8 g8 a8 b4 g4 | >c4< b8 a8 g8 a8 b8 >d8< | b2 a4 f+4 |
        e4 g8 b8 r8 >e8 d8< b8 | a8 g8 e8 g8 a4 b4 | >c8 d8 e8 d8 c4< b4 | b4 d+8 f+8 b4 r4 |
        a4 >c8 e8 a4 g4< | e8 d8 e8 g8 b4 g4 | >c4 e8 c8< b8 a8 g8 e8 | f+4 a8 >c8 d4 c4< |
        a8 >c8 e8 a8 g8 e8 c8< a8 | b8 a8 g8 f+8 e4 g4 | a8 g8 f+8 g8 a4 b4 | b8 >d+8 f+8 b8 a8 f+8 d+8< b8 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.07, sustain: 0.2 },
      mml: `o4 l8 v7
        [r g]4 | [r b]4 | [r >e<]4 | [r d+]4 |
        [r g]4 | [r a]4 | [r >e<]4 | [r d+]4 |
        [r a]4 | [r g]4 | [r >e<]4 | [r f+]4 |
        [r a]4 | [r g]4 | [r a]4 | [r d+]4 |`,
    },
    tri: {
      env: { decay: 0.4, sustain: 0.85 },
      mml: `l8 v15
        o2 e8 e8 >e8< e8 r8 e8 >e8< e8 | o2 g8 g8 >g8< g8 r8 g8 >g8< g8 | o3 c8 c8 >c8< c8 r8 c8 >c8< c8 | o2 b8 b8 >b8< b8 r8 b8 >b8< b8 |
        o2 e8 e8 >e8< e8 r8 e8 >e8< e8 | o2 a8 a8 >a8< a8 r8 a8 >a8< a8 | o3 c8 c8 >c8< c8 r8 c8 >c8< c8 | o2 b8 b8 >b8< b8 r8 b8 >b8< b8 |
        o2 a8 a8 >a8< a8 r8 a8 >a8< a8 | o2 e8 e8 >e8< e8 r8 e8 >e8< e8 | o3 c8 c8 >c8< c8 r8 c8 >c8< c8 | o3 d8 d8 >d8< d8 r8 d8 >d8< d8 |
        o2 a8 a8 >a8< a8 r8 a8 >a8< a8 | o2 e8 e8 >e8< e8 r8 e8 >e8< e8 | o2 a8 a8 >a8< a8 r8 a8 >a8< a8 | o2 b8 b8 >b8< b8 r8 b8 >b8< b8 |`,
    },
    noise: {
      mml: `l8 v12
        [k h s k h k s h]7 | k h s h s16 s16 s16 s16 x4 |
        [k h s k h k s h]7 | k s s s s16 s16 s16 s16 x4 |`,
    },
  },
};

// Mayor McBride's entrance: a brassy civic march (non-looping).
export const mcbrideEntrance = {
  id: 'mcbrideEntrance',
  tempo: 116,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.4, sustain: 0.7 }, vibrato: true, mml: 'o4 l8 v12 c8. c16 e8. g16 >c4< g4 | a8. a16 f8. a16 >c2< | g8 e8 c8 e8 d4 g4 | c2 r2' },
    p2: { duty: 1, env: { decay: 0.4, sustain: 0.6 }, mml: 'o4 l8 v8 e8. e16 g8. >c16 e4 c4< | f8. f16 c8. f16 a2 | e8 c8 < g8 > c8 < b4 > d4 | e2 r2' },
    tri: { mml: 'o3 l4 v15 c g c g | f c f f | c e g g | c2 r2' },
    noise: { mml: 'l8 v11 k8 r8 s8 r8 k8 k8 s8 r8 | k8 r8 s8 r8 k8 k8 s8 s8 | k8 h8 s8 h8 k8 h8 s8 s16 s16 | x2 r2' },
  },
};
