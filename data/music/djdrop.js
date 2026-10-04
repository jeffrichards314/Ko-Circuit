// "Drop Zone": DJ Drop's entrance track, and the music he fights to (original).
// F minor house at 150 bpm: four-on-the-floor kit, an octave-bouncing bass,
// a 16th-note arpeggio, then a hook. At 150 bpm one beat is exactly 24 frames.
// The loop is 16 whole bars, so the beat grid never slips when it repeats:
// DJ Drop's punches are locked to this grid (onBeat reads the audio clock).
// Form: Fm Db Eb C x4 (arpeggio x2, hook x2).

export default {
  id: 'djDropTrack',
  tempo: 150,
  channels: {
    p1: {
      duty: 0, env: { decay: 0.12, sustain: 0.35 },
      mml: `o4 l16 v10
        [f a- >c f<]4 | [d- f a- >d-<]4 | [e- g b- >e-<]4 | [c e g >c<]4 |
        [f a- >c f<]4 | [d- f a- >d-<]4 | [e- g b- >e-<]4 | [c e g >c<]4 |
        l8 v11 >c4< a-8 >c8 f4 e-8 c8< | d-4 f8 a-8 >d-4 c8< a-8 | b-4 g8 e-8 g8 b-8 >e-8 d8< | >c2 e4 g4< |
        >f4 e-8 c8< a-4 >c4< | d-8 f8 a-8 >d-8 f4 d-4< | e-8 g8 b-8 >e-8 g8 e-8 d8 e-8< | >c4 d8 e8 g4< r4 |`,
    },
    p2: {
      duty: 2, env: { decay: 0.06, sustain: 0.2 },
      mml: `o4 l8 v7
        [r a-]4 | [r f]4 | [r g]4 | [r e]4 |
        [r a-]4 | [r f]4 | [r g]4 | [r e]4 |
        [r a-]4 | [r f]4 | [r g]4 | [r e]4 |
        [r a-]4 | [r f]4 | [r g]4 | [r e]4 |`,
    },
    tri: {
      env: { decay: 0.3, sustain: 0.8 },
      mml: `l8 v15
        o2 [f >f<]4 | o2 [d- >d-<]4 | o2 [e- >e-<]4 | o3 [c >c<]4 |
        o2 [f >f<]4 | o2 [d- >d-<]4 | o2 [e- >e-<]4 | o3 [c >c<]4 |
        o2 [f >f<]4 | o2 [d- >d-<]4 | o2 [e- >e-<]4 | o3 [c >c<]4 |
        o2 [f >f<]4 | o2 [d- >d-<]4 | o2 [e- >e-<]4 | o3 [c >c<]4 |`,
    },
    noise: {
      mml: `l8 v13
        [k h s h k h s h]7 | k h s h s16 s16 s16 s16 x4 |
        [k h s h k h s h]7 | k s k s s16 s16 s16 s16 x4 |`,
    },
  },
};
