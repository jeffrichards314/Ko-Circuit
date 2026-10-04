// "Ring Lights" — title theme (original). C major fanfare, 8-bar loop.

export default {
  id: 'title',
  tempo: 120,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.4, sustain: 0.65 }, vibrato: true,
      mml: `o4 l8 v11
        g4. >c8 e4 g4< | >f4. e8 d4 c4< | >d4. c8< b4 g4 | >c2< g4 r4 |
        a4. b8 >c4 e4< | >f4 e8 d8 c4< a4 | b4 >c8 d8 e4 d4< | g2 r2 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.1, sustain: 0.3 },
      mml: `o4 l8 v6
        [c e g e]2 | [c f a f]2 | [d g b g]2 | [c e g e]2 |
        [c e a e]2 | [c f a f]2 | [d g b g]2 | [d g b g]2 |`,
    },
    tri: {
      env: { decay: 0.6, sustain: 0.9 },
      mml: `l4 v15
        o3 c c c c | o2 f f f f | o2 g g g g | o3 c c c c |
        o2 a a a a | o2 f f f f | o2 g g g g | o2 g g g8 a8 b4 |`,
    },
    noise: {
      mml: `l8 v8 [k h h h s h h h]8`,
    },
  },
};
