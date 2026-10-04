// The two ending themes (original).
//
// "Undisputed" (endingMain): after Jax falls. D major at 132 bpm, a proud
// anthem for the credits: a lead that marches up in long notes, bright
// arpeggios, a walking bass, a snare roll into every fourth bar. It loops for
// as long as the credits roll.
// Form (16 bars): D A Bm G | D A G A | Bm F#m G D | Em A D D, loop.
//
// "Back to Zero" (endingTrue): after ZERO. The same melody, slowed down and
// moved to D minor's relative calm, then lifted back into D major for the last
// four bars: everything you fought, and the gold at the end of it.
// Form (16 bars): Bm G D A | Bm G Em F# | G A D Bm | G A D D, loop.

export const endingMain = {
  id: 'endingMain',
  tempo: 132,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.35, sustain: 0.7 }, vibrato: true,
      mml: `v12
        o5 d2 f+4 a4 | o5 a2. g8 f+8 | o5 f+4 e4 d4 f+4 | o5 g2 b2 |
        o5 a2 o6 d4 c+4 | o5 b4 a4 g4 e4 | o5 d4 e4 f+4 g4 | o5 a1 |
        o5 b2 a4 f+4 | o5 a2 f+4 c+4 | o5 d4 e4 f+4 g4 | o5 a2 f+2 |
        o5 g4 f+4 e4 d4 | o5 c+4 e4 a4 c+4 | o5 d1 | o5 d2 r2 |`,
    },
    p2: {
      duty: 1, env: { decay: 0.06, sustain: 0.3 },
      mml: `l8 v6
        o4 [d8 f+8 a8 f+8]2 | o3 [a8 >c+8 e8 c+8<]2 | o3 [b8 >d8 f+8 d8<]2 | o3 [g8 b8 >d8 b8<]2 |
        o4 [d8 f+8 a8 f+8]2 | o3 [a8 >c+8 e8 c+8<]2 | o3 [g8 b8 >d8 b8<]2 | o3 [a8 >c+8 e8 c+8<]2 |
        o3 [b8 >d8 f+8 d8<]2 | o3 [f+8 a8 >c+8 a8<]2 | o3 [g8 b8 >d8 b8<]2 | o4 [d8 f+8 a8 f+8]2 |
        o3 [e8 g8 b8 g8]2 | o3 [a8 >c+8 e8 c+8<]2 | o4 [d8 f+8 a8 f+8]2 | o4 [d8 f+8 a8 f+8]2 |`,
    },
    tri: {
      env: { decay: 0.2, sustain: 0.7 },
      mml: `l4 v15
        o2 d4 f+4 a4 f+4 | o2 a4 e4 c+4 e4 | o2 b4 f+4 d4 f+4 | o2 g4 d4 g4 b4 |
        o2 d4 f+4 a4 f+4 | o2 a4 e4 c+4 e4 | o2 g4 b4 d4 b4 | o2 a4 e4 a4 c+4 |
        o2 b4 f+4 d4 f+4 | o2 f+4 c+4 f+4 a4 | o2 g4 d4 g4 b4 | o2 d4 a4 f+4 a4 |
        o2 e4 g4 b4 g4 | o2 a4 c+4 e4 a4 | o2 d2 a2 | o2 d2 r2 |`,
    },
    noise: {
      mml: `v9
        [k4 h8 h8 s4 h8 h8]3 | k8 k8 s8 s8 s16 s16 s16 s16 x4 |
        [k4 h8 h8 s4 h8 h8]3 | k8 k8 s8 s8 s16 s16 s16 s16 x4 |
        [k4 h8 h8 s4 h8 h8]3 | k8 k8 s8 s8 s16 s16 s16 s16 x4 |
        [k4 h8 h8 s4 h8 h8]2 | x1 | r1 |`,
    },
  },
};

export const endingTrue = {
  id: 'endingTrue',
  tempo: 100,
  channels: {
    p1: {
      duty: 1, env: { decay: 0.5, sustain: 0.75 }, vibrato: true,
      mml: `v11
        o5 d2 f+4 b4 | o5 b2. a8 g8 | o5 f+4 e4 d4 f+4 | o5 e2 c+2 |
        o5 d2 g4 b4 | o5 b4 a4 g4 e4 | o5 e4 f+4 g4 b4 | o5 a+1 |
        o5 b2 o6 d4 c+4 | o5 b4 a4 g4 e4 | o5 f+4 g4 a4 b4 | o5 b2 a2 |
        o5 g4 f+4 e4 d4 | o5 c+4 e4 a4 c+4 | o5 d1 | o5 d1 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.3, sustain: 0.5 },
      mml: `l4 v5
        o4 f+2 d2 | o4 d2 g2 | o4 a2 f+2 | o4 e2 a2 |
        o4 f+2 d2 | o4 d2 g2 | o4 g2 b2 | o4 f+2 a+2 |
        o4 d2 g2 | o4 e2 c+2 | o4 d2 f+2 | o4 d2 f+2 |
        o4 b2 d2 | o4 c+2 e2 | o4 f+1 | o4 f+1 |`,
    },
    tri: {
      env: { decay: 0.4, sustain: 0.8 },
      mml: `l2 v14
        o2 b2 f+2 | o2 g2 d2 | o2 d2 a2 | o2 a2 e2 |
        o2 b2 f+2 | o2 g2 d2 | o2 e2 b2 | o2 f+2 c+2 |
        o2 g2 d2 | o2 a2 e2 | o2 d2 a2 | o2 b2 f+2 |
        o2 g2 d2 | o2 a2 e2 | o2 d1 | o2 d1 |`,
    },
  },
};
