// "Sleep Paralysis": Nightmare Circuit fight theme (original).
// C minor at 184 bpm, and it keeps slipping off its own key: the harmony
// lurches down a half step (Cm to B, Ab to G) and the lead leans on tritones.
// A thin, wavering lead over a restless sixteenth-note pulse that never
// resolves, a bass that walks down chromatically, and a kick that sometimes
// comes in a beat early, like a heart skipping.
// Form (16 bars): Cm B Cm B | Ab G Cm Cm | Fm E Cm Ab | Db G Cm G, loop.

export default {
  id: 'nightmareFight',
  tempo: 184,
  channels: {
    p1: {
      duty: 0, env: { decay: 0.3, sustain: 0.6 }, vibrato: true,
      mml: `v12
        o5 c4 e-4 f+2 | o5 f4 e-8 d8 d+2 | o5 c4 e-4 g4 f+4 | o5 f+2 d+2 |
        o5 e-4 c8 o4 a-8 b2 | o4 b4 o5 d4 f4 d4 | o5 e-2 c4 o4 g4 | o4 f+8 g8 a-8 g8 c2 |
        o5 f4 a-4 o6 c4 o5 b4 | o5 g+4 e4 b2 | o5 c4 d8 e-8 f+4 g4 | o5 a-2 e-2 |
        o5 d-4 f4 a-4 g4 | o5 f4 d4 o4 b2 | o5 c8 o4 b8 o5 c8 e-8 f+4 e-4 | o5 d2 o4 b2 |`,
    },
    p2: {
      duty: 1, env: { decay: 0.03, sustain: 0.2 },
      mml: `l16 v5
        o4 [c16 e-16 g16 e-16]4 | o3 [b16 >d+16 f+16 d+16<]4 | o4 [c16 e-16 g16 e-16]4 | o3 [b16 >d+16 f+16 d+16<]4 |
        o3 [a-16 >c16 e-16 c16<]4 | o3 [g16 b16 >d16 b16<]4 | o4 [c16 e-16 g16 e-16]4 | o4 [c16 e-16 g16 e-16]4 |
        o3 [f16 a-16 >c16 a-16<]4 | o3 [e16 g+16 b16 g+16]4 | o4 [c16 e-16 g16 e-16]4 | o3 [a-16 >c16 e-16 c16<]4 |
        o3 [d-16 f16 a-16 f16]4 | o3 [g16 b16 >d16 b16<]4 | o4 [c16 e-16 g16 e-16]4 | o3 [g16 b16 >d16 f16<]4 |`,
    },
    tri: {
      env: { decay: 0.14, sustain: 0.55 },
      mml: `v15
        o2 c4 c4 c8 c8 c4 | o1 b4 b4 b8 b8 b4 | o2 c4 c4 c8 c8 c4 | o1 b4 b4 b-4 a4 |
        o1 a-4 a-4 a-8 a-8 a-4 | o1 g4 g4 g8 g8 g4 | o2 c4 c4 o1 b4 b-4 | o1 a4 a-4 g4 g4 |
        o1 f4 f4 f8 f8 f4 | o1 e4 e4 e8 e8 e4 | o2 c4 c4 c8 c8 c4 | o1 a-4 a-4 a-8 a-8 a-4 |
        o1 d-4 d-4 d-8 d-8 d-4 | o1 g4 g4 g8 g8 g4 | o2 c4 o1 b4 b-4 a4 | o1 a-4 g4 g4 g4 |`,
    },
    noise: {
      mml: `v11
        x8 h8 s8 h8 k8 h8 s8 h8 | [k8 h8 s8 h8 k8 h8 s8 k8]3 | k8 h8 s8 h8 k8 h8 s8 h8 | [k8 h8 s8 h8 k8 h8 s8 k8]2 | k16 k16 s8 s8 s8 s16 s16 s16 s16 x4 |
        x8 h8 s8 h8 k8 h8 s8 h8 | [k8 h8 s8 h8 k8 h8 s8 k8]3 | k8 h8 s8 h8 k8 h8 s8 h8 | [k8 h8 s8 h8 k8 h8 s8 k8]2 | s8 s8 s16 s16 s16 s16 s8 s8 x4 |`,
    },
  },
};

// Eclipse's entrance: a drone rising as the moon crosses the sun, then a
// bright chord that turns dark on the last note (non-looping).
export const eclipseEntrance = {
  id: 'eclipseEntrance',
  tempo: 96,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.6, sustain: 0.8 }, vibrato: true, mml: 'o4 l4 v10 c d e- f | g a- b >c | e2 e-2 | c1' },
    p2: { duty: 0, env: { decay: 0.6, sustain: 0.7 }, mml: 'o4 l2 v6 g a- | b >d | g2 g2 | e-1' },
    tri: { mml: 'o2 l1 v15 c | c | c | c' },
    noise: { mml: 'l4 v10 r1 | r1 | r2 x2 | x1' },
  },
};
