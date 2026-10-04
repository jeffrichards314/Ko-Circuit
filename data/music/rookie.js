// "Rec Center Rumble" — Rookie Circuit fight theme (original).
// Bright G major, bouncy octave bass: an easy-going first circuit.
// Form: A (8 bars, G C G D | G C D G), B (8 bars, Em C G D | Em C Am-D D), loop.

export default {
  id: 'rookieFight',
  tempo: 152,
  channels: {
    p1: {
      duty: 1, env: { decay: 0.3, sustain: 0.6 }, vibrato: true,
      mml: `o4 l8 v11
        g4 b8 >d8< r8 b8 >d8 e8< | >e4 d8 c8< b8 a8 g8 e8 | d4 g8 b8 r8 a8 g8 e8 | f+4 a8 >d8< r8 >c8< b8 a8 |
        g4 b8 >d8< r8 b8 >d8 g8< | >e8 g8 e8 c8< a8 >c8< e4 | d8 f+8 a8 >c8< b8 a8 f+8 a8 | g4 d8 g8 g4 r4 |
        b4 >e8< b8 >g4 e8< b8 | >c4< g8 >c8 e4 c8< g8 | b4 >d8< b8 >g8 f+8 e8 d8< | f+2 a4 >d4< |
        >e8 f+8 g8 e8< b4 >e4< | >c8 d8 e8 c8< g4 >c4< | a8 >c8 e8 c8 d8 c8< a8 f+8 | d8 f+8 a8 >d8< a4 r4 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.08, sustain: 0.2 },
      mml: `o4 l8 v7
        [r b]4 | [r >c<]4 | [r b]4 | [r a]4 |
        [r b]4 | [r >c<]4 | [r a]4 | [r b]4 |
        [r g]4 | [r >c<]4 | [r b]4 | [r a]4 |
        [r g]4 | [r >c<]4 | [r >c<]2 [r a]2 | [r a]4 |`,
    },
    tri: {
      env: { decay: 0.5, sustain: 0.9 },
      mml: `l8 v15
        o2[g>g<]4 | o3[c>c<]4 | o2[g>g<]4 | o2[d>d<]4 |
        o2[g>g<]4 | o3[c>c<]4 | o2[d>d<]4 | o2 g>g<g>g< d e f+ g |
        o2[e>e<]4 | o3[c>c<]4 | o2[g>g<]4 | o2[d>d<]4 |
        o2[e>e<]4 | o3[c>c<]4 | o2[a>a<]2 o2[d>d<]2 | o2 d>d<d>d< d e f+ a |`,
    },
    noise: {
      mml: `l8 v12
        [k h s h k k s h]7 | k h s h s16 s16 s8 s16 s16 x8 |
        [k h s h k k s h]7 | k h s h s16 s16 s8 s16 s16 x8 |`,
    },
  },
};
