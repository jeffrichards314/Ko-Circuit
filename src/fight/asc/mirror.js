// Pantheon VI's gimmicks (spec §18 A6, Phase B): the Mirror Sanctum.
//
//   glass    Glass        shatters when hit hard, then re-forms: the re-forming is the only star window
//   callout  The Doubt    his words (LEFT! DUCK!) are sometimes lies: read his body
//   prism    Prism        splits into three copies of three colours; the real one matches the ring light
//   (Reflection is no modifier: the fight dresses him in your colours, data/reflection.js)

import { drawTextBig, drawText, textWidth, callout } from '../../engine/font.js';
import { c32 } from '../../engine/palette.js';
import { panel } from '../hud.js';
import { badge, IN_RING } from '../ascension.js';

const MOVING = ['windup', 'active', 'recovery'];

export const MIRROR_MODIFIERS = {
  // Glass. A counter, a Star Punch, or cfg.acc damage of ordinary hits inside cfg.span frames shatters
  // him: he bursts into shards (hidden, untouchable) for cfg.frames, then re-forms in a flash into an
  // `open` step (id 'reform') whose first cfg.reform.star frames are the only place a star comes from
  // (all his moves have their star windows stripped in his data).
  glass: {
    init(ai) { ai.mods.acc = 0; ai.mods.accAt = -9999; },
    roundStart(ai) { ai.mods.acc = 0; },
    onPlayerPunch(ai, cfg, p, r) {
      const M = ai.mods, f = ai.fight;
      if (r.result !== 'hit' || ai.state === 'shatter') return;
      if (f.clock - M.accAt > cfg.span) M.acc = 0;
      M.accAt = f.clock; M.acc += r.damage;
      if (r.counter || p.star || M.acc >= cfg.acc) { M.shatterNext = true; M.acc = 0; }
    },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.flashT > 0) M.flashT--;
      if (f.phase !== 'fight') return;
      if (M.shatterNext && ['hit', 'stunned'].includes(ai.state) && ai.t >= 3) {
        M.shatterNext = false;
        ai.state = 'shatter'; ai.t = 0; ai.move = null; ai.stun = 0; ai.combo = 0; ai.flurry = 0;
        M.shards = Array.from({ length: 22 }, (_, i) => ({ x: ((i * 37) % 60) - 30, y: -8 - ((i * 53) % 100), vx: (((i * 29) % 9) - 4) * 0.45, vy: -1.4 - ((i * 7) % 5) * 0.4 }));
        f.sfx('glass'); f.event('shatter'); f.shake = 6;
      } else if (M.shatterNext && !['hit', 'stunned', 'shatter'].includes(ai.state) && ai.t > 30) M.shatterNext = false;
      if (ai.state === 'shatter' && ai.t >= cfg.frames) {
        ai.startOpen({ open: cfg.reform.open, anim: 'stunned', id: 'reform', comboLimit: cfg.reform.hits, star: [0, cfg.reform.star], interrupt: false });
        M.flashT = 10; f.sfx('chime'); f.event('reform');
      }
    },
    view(ai, cfg, v) { return ai.state === 'shatter' ? { ...v, hidden: true } : v; },
    palette(ai) { return ai.state === 'open' && ai.openStep && ai.openStep.id === 'reform' && ai.t < 14 ? 'glass.crack' : null; },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods, hi = c32(31, 31, 31), mid = c32(16, 27, 31), lo = c32(6, 14, 26);
      if (ai.state === 'shatter' && M.shards) {
        const t = ai.t;
        for (const s of M.shards) {
          const x = fight.OPP_X + Math.round(s.x + s.vx * t), y = fight.OPP_Y + Math.round(s.y * 0.35 + (s.y * 0.55 * Math.min(1, t / 14)) + 0.06 * t * t * 0.1 * 6);
          const yy = Math.min(fight.OPP_Y - 1, y), col = (s.x & 1) ? mid : hi;
          frame.px(x, yy, col); frame.px(x + 1, yy, lo); frame.px(x, yy + 1, lo); if (!(s.x & 3)) frame.px(x - 1, yy - 1, hi);
        }
        // a flicker where he'll re-form
        if (t > cfg.frames - 10 && (t & 1)) for (let i = 0; i < 12; i++) frame.px(fight.OPP_X - 16 + ((i * 11) % 32), fight.OPP_Y - 20 - ((i * 23) % 90), hi);
      }
      if (M.flashT > 5) for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2; for (let d = 6; d < 40; d += 5) frame.px(fight.OPP_X + Math.round(Math.cos(a) * d), fight.OPP_Y - 60 + Math.round(Math.sin(a) * d * 1.5), hi); }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      if (ai.state === 'shatter') badge(frame, 'SHATTERED', fight.COL.cyan);
      else if (ai.state === 'open' && ai.openStep && ai.openStep.id === 'reform' && ai.t < cfg.reform.star) badge(frame, 'RE-FORMING: STAR!', fight.COL.yellow);
    },
  },

  // The Doubt. Every real punch gets a word in a box over his head at the start of its windup: the
  // defense that works (LEFT! RIGHT! DUCK! BLOCK!), or, cfg.lie of the time, one that doesn't. A punch
  // every defense stops shouts ANYTHING!. The box looks the same either way.
  callout: {
    moveStart(ai, cfg, m) {
      const M = ai.mods;
      M.word = null; M.lie = false;
      if (m.feint || m.call || !m.damage) return;
      const av = m.avoidBy, W = { dodgeL: 'LEFT!', dodgeR: 'RIGHT!', duck: 'DUCK!', block: 'BLOCK!' };
      const has = { 'LEFT!': av.includes('dodgeL'), 'RIGHT!': av.includes('dodgeR'), 'DUCK!': av.includes('duck'), 'BLOCK!': av.includes('block') };
      const truth = av.includes('dodgeL') ? 'LEFT!' : av.includes('dodgeR') ? 'RIGHT!' : av.includes('duck') ? 'DUCK!' : 'BLOCK!';
      const wrong = Object.keys(has).filter((w) => !has[w]);
      if (wrong.length === 0) { M.word = 'ANYTHING!'; return; }
      M.lie = Math.random() < cfg.lie;
      M.word = M.lie ? wrong[Math.floor(Math.random() * wrong.length)] : truth;
      if (M.lie) ai.fight.event('lie');
    },
    view(ai, cfg, v) { return v; },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (fight.phase !== 'fight' || !M.word || !MOVING.includes(ai.state)) return;
      if (ai.state === 'recovery' && ai.moveT > 4) return;
      const v = ai.view(), h = fight.oppHead(v);
      const w = textWidth(M.word, false) + 8, x = Math.round(h.x + 14), y = Math.round(h.y - 44);
      panel(frame, x - (w >> 1), y, w, 12);
      // the tail of the speech box
      for (let i = 0; i < 4; i++) frame.rect(x - 8 + i, y + 12 + i, 4 - i, 1, fight.COL.white);
      drawText(frame, M.word, x - (textWidth(M.word, false) >> 1), y + 2, ai.state === 'active' ? fight.COL.yellow : fight.COL.white, { mono: false });
    },
  },

  // Prism. From the start of a real punch's windup to the end of its recovery he is three: a red, a green and a
  // blue copy, spread across the ring (cfg.spread px apart), and only one is real. The real one
  // is the copy whose colour is the ring light (two lamps at the top corners and a bar of light) and it is
  // the one that throws the move; the other two mime other punches. The real one's body is where the hits land.
  prism: {
    init(ai) { ai.mods.real = null; ai.mods.slot = 0; },
    moveStart(ai, cfg, m) {
      const M = ai.mods;
      if (m.feint || m.call) { M.real = null; return; }
      const cols = ['r', 'g', 'b'].sort(() => Math.random() - 0.5);
      M.cols = cols;
      M.slot = [-1, 0, 1][Math.floor(Math.random() * 3)];
      M.real = cols[M.slot + 1];
      const pool = Object.values(ai.d.moves).filter((x) => x !== m && x.animation && !x.feint && !x.call && x.animation.windup && x.damage);
      M.mime = [-1, 0, 1].map((s) => (s === M.slot ? null : pool[Math.floor(Math.random() * pool.length)].animation));
      M.lightT = 0;
      ai.fight.sfx('chime');
    },
    view(ai, cfg, v) {
      const M = ai.mods;
      return M.real && MOVING.includes(ai.state) ? { ...v, dx: v.dx + M.slot * cfg.spread } : v;
    },
    palette(ai, cfg) { return ai.mods.real && MOVING.includes(ai.state) ? cfg.palettes[ai.mods.real] : null; },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (fight.phase !== 'fight' || !M.real || !MOVING.includes(ai.state) || !ai.move) return;
      const pick = (arr, t, rate = 6) => arr[Math.min(arr.length - 1, Math.floor(t / rate))];
      [-1, 0, 1].forEach((s, i) => {
        if (s === M.slot) return;
        const A = M.mime[i];
        if (!A) return;
        let pose;
        if (ai.state === 'windup') pose = A.windup[Math.min(A.windup.length - 1, Math.floor(ai.moveT / (A.windupRate || 6)))];
        else if (ai.state === 'active') pose = A.active[A.active.length - 1];
        else pose = pick(A.recovery, ai.moveT, 10);
        frame.blit(fight.oppSprites.get(pose), fight.OPP_X + s * cfg.spread, fight.OPP_Y + (ai.state === 'active' ? 3 : 0), fight.oppPalette(cfg.palettes[M.cols[i]]), { layer: 2 });
      });
    },
    postScene(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro' || !M.real || !MOVING.includes(ai.state)) return;
      const col = c32(...cfg.lights[M.real]), pulse = (fight.clock >> 2) & 1;
      // two lamps on the corner posts and a bar of light along the top rope
      for (const x of [12, 244]) { for (let y = -5; y <= 5; y++) { const w = Math.round(Math.sqrt(36 - y * y)); frame.rect(x - w, 52 + y, w * 2 + 1, 1, col); } if (pulse) frame.rect(x - 8, 46, 17, 1, col); }
      for (let x = 22; x < 234; x++) if ((x + fight.clock) % 3 !== 0) frame.px(x, 58, col);
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods;
      if (M.real && MOVING.includes(ai.state)) badge(frame, 'RING LIGHT: ' + ({ r: 'RED', g: 'GREEN', b: 'BLUE' })[M.real], c32(...cfg.lights[M.real]));
    },
  },
};
void drawTextBig;
