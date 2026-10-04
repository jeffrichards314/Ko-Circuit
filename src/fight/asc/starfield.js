// Pantheon IV's gimmicks (spec §18 A6, Phase B): the Starfield.
//
//   constellation  Polaris        stars connect into the shape of his next punch
//   comet          Comet Kira     she charges in from off-screen along a comet's streak
//   orbit          Orbit          two star-fists circle him; he punches when one crosses in front
//   gas            Nebula         a body of gas: her tells are only colour shifts inside her

import { drawTextBig, drawText, textWidth, callout } from '../../engine/font.js';
import { c32 } from '../../engine/palette.js';
import { panel } from '../hud.js';
import { badge, IN_RING, bayer, nextMoveId, ASCENSION_MODIFIERS } from '../ascension.js';

const shift = (m, d) => { for (const k of ['counterWindow', 'starWindow', 'kdWindow']) if (m[k]) m[k] = [m[k][0] + d, m[k][1] + d]; return m; };
const star = (frame, x, y, hi, lo, big = false) => {
  frame.px(x, y, hi); frame.px(x - 1, y, lo); frame.px(x + 1, y, lo); frame.px(x, y - 1, lo); frame.px(x, y + 1, lo);
  if (big) { frame.px(x - 2, y, lo); frame.px(x + 2, y, lo); frame.px(x, y - 2, lo); frame.px(x, y + 2, lo); frame.px(x - 1, y - 1, hi); frame.px(x + 1, y + 1, hi); frame.px(x + 1, y - 1, hi); frame.px(x - 1, y + 1, hi); }
};
const dots = (frame, x0, y0, x1, y1, col, every = 2) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i += every) frame.px(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), col);
};
const disc = (frame, cx, cy, r, col) => { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); frame.rect(cx - w, cy + y, w * 2 + 1, 1, col); } };

export const STARFIELD_MODIFIERS = {
  // Polaris. A move with `shape: 'name'` is announced in the sky first: cfg.pre frames (added
  // in front of its windup, the counter windows shifted with it) in which the stars of
  // cfg.shapes[name] light one by one and join up into the outline of the punch. Then his own
  // tell (the move's windup) plays as usual and the punch follows. He holds his stance while
  // the shape draws. cfg: pre, at (the centre of the sky over him), shapes, col.
  constellation: {
    modifyMove(ai, cfg, m) {
      if (!m.shape || !cfg.shapes[m.shape] || m.feint) return m;
      const d = cfg.pre, out = shift({ ...m }, d);
      out.windupFrames = m.windupFrames + d; out.preFrames = d; out.sfxScheduled = true;
      return out;
    },
    moveStart(ai, cfg, m) { if (m.preFrames) ai.mods.castT = 0; },
    update(ai, cfg) {
      const M = ai.mods, m = ai.move;
      if (M.newsT > 0) M.newsT--;
      if (ai.state === 'windup' && m && m.preFrames) {
        if (ai.moveT === 0 || ai.moveT === m.preFrames) {
          if (ai.moveT === m.preFrames && m.sfx && m.sfx.tell) ai.fight.sfx(m.sfx.tell);
        }
        if (ai.moveT > 0 && ai.moveT < m.preFrames && ai.moveT % Math.max(3, Math.floor(m.preFrames / cfg.shapes[m.shape].length)) === 0) ai.fight.sfx(cfg.tick || 'tick');
      }
    },
    view(ai, cfg, v) {
      const m = ai.move;
      if (ai.state === 'windup' && m && m.preFrames && ai.moveT < m.preFrames) return { ...v, pose: (ai.fight.clock >> 4) & 1 ? 'idle2' : 'idle1' };
      return v;
    },
    renderOpp(ai, cfg, frame, fight) {
      const m = ai.move;
      if (fight.phase !== 'fight' || !m || !m.shape || !cfg.shapes[m.shape] || !['windup', 'active'].includes(ai.state)) return;
      const pts = cfg.shapes[m.shape], v = ai.view(), pre = m.preFrames || 0;
      const ox = fight.OPP_X + v.dx + cfg.at[0], oy = fight.OPP_Y + v.dy + cfg.at[1];
      const hi = c32(...(cfg.col || [31, 31, 22])), lo = c32(...(cfg.dim || [16, 20, 31])), line = c32(...(cfg.line || [22, 26, 31]));
      // how much of the shape is drawn: the stars come on one by one, the last a few frames before his tell
      const t = ai.state === 'windup' ? ai.moveT : m.windupFrames + ai.moveT;
      const k = pre ? Math.min(1, t / Math.max(1, pre - 4)) : 1;
      const lit = Math.min(pts.length, Math.floor(k * pts.length + 0.001));
      const done = lit >= pts.length;
      const fade = ai.state === 'active' && ai.moveT > 5;
      if (fade) return;
      for (let i = 0; i < lit; i++) {
        const [x, y] = pts[i];
        if (i > 0) { const [px, py] = pts[i - 1]; dots(frame, ox + px, oy + py, ox + x, oy + y, done && (fight.clock >> 1) & 1 ? hi : line); }
        const tw = ((fight.clock >> 2) + i) & 3;
        star(frame, ox + x, oy + y, hi, tw === 0 ? hi : lo, done || i === lit - 1);
      }
      // closing a shape (a ring) joins the last star to the first
      if (cfg.closed && cfg.closed.includes(m.shape) && done) dots(frame, ox + pts[pts.length - 1][0], oy + pts[pts.length - 1][1], ox + pts[0][0], oy + pts[0][1], line);
    },
    render(ai, cfg, frame, fight) {
      const m = ai.move;
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      if (ai.state === 'windup' && m && m.shape && m.preFrames && ai.moveT < m.preFrames) badge(frame, cfg.label || 'CONSTELLATION', c32(...(cfg.col || [31, 31, 22])));
    },
  },

  // Comet Kira. Like Dash's lunge (a move with `lunge: -1 | 1` takes her off the screen, she flies in from that
  // side: slip the OTHER way) but the tell is a comet: a bright head and a long tail burning across the
  // sky from that edge, closing on the ring as she gathers.
  comet: {
    view(ai, cfg, v) { return ASCENSION_MODIFIERS.lunge.view(ai, cfg, v); },
    renderOpp(ai, cfg, frame, fight) {
      const m = ai.move;
      if (fight.phase !== 'fight' || ai.state !== 'windup' || !m || !m.lunge) return;
      const k = Math.min(1, (ai.moveT + 1) / m.windupFrames), left = m.lunge < 0, t = fight.clock;
      const hi = c32(...(cfg.hi || [31, 31, 30])), mid = c32(...(cfg.mid || [16, 29, 31])), lo = c32(...(cfg.lo || [6, 16, 28]));
      // the head drifts in from the edge along a slanting line; the tail streams back to the edge
      const hx = left ? 8 + Math.round(k * 46) : 247 - Math.round(k * 46), hy = 92 + Math.round(k * 30) + Math.round(Math.sin(t / 3) * 2);
      const tx = left ? -6 : 262, ty = hy - 34;
      const n = 46;
      for (let i = 0; i < n; i++) {
        const u = i / n, x = Math.round(hx + (tx - hx) * u), y = Math.round(hy + (ty - hy) * u + Math.sin(u * 12 + t / 2) * 1.5);
        const w = Math.max(1, 5 - Math.floor(u * 6));
        if (((i + (t >> 1)) & 3) !== 3) for (let j = 0; j < w; j++) frame.px(x, y + j - (w >> 1), u < 0.25 ? mid : lo);
      }
      disc(frame, hx, hy, 4, mid); disc(frame, hx, hy, 3, hi);
      frame.px(hx - 1, hy - 1, c32(31, 31, 31));
      // an arrow toward the middle, the way she's coming
      const ax = left ? 20 : 235;
      for (let i = 0; i < 5; i++) { frame.px(ax + (left ? i : -i), 124 + i, fight.COL.white); frame.px(ax + (left ? i : -i), 132 - i, fight.COL.white); }
    },
  },

  // Orbit. Two star-fists circle him on a tilted ring (cfg.period frames a lap, half a lap between
  // one crossing in front of him and the next). A move with `orb: true` waits for a crossing: it
  // starts the frame an orb passes in front of his chest, and THAT orb is the fist: it drops to his
  // glove for the windup and flies at you for the punch (`hand: 'L' | 'R'`). Whenever both orbs
  // are on the same side of him (a conjunction) he's off balance: an exploit lives there.
  //   cfg: period, rx, ry, at, col
  orbit: {
    init(ai) { ai.mods.ph = 0; ai.mods.fist = -1; ai.mods.back = 0; },
    roundStart(ai) { ai.mods.fist = -1; },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight, half = cfg.period / 2;
      M.ph += 1;
      if (M.crossFlash > 0) M.crossFlash--;
      if (M.ph % half === 0) M.crossFlash = 6;
      // return of the fist orb once the punch is over
      if (M.fist >= 0 && !(ai.move && ['windup', 'active', 'recovery'].includes(ai.state))) { M.fist = -1; M.back = 14; }
      if (M.back > 0) M.back--;
      if (f.phase !== 'fight' || !['idle', 'block'].includes(ai.state) || ai.forced.length || ai.superTaunt || ai.wait > 1) return;
      const id = nextMoveId(ai), m = id && ai.d.moves[id];
      if (!m || !m.orb) { M.holding = false; return; }
      // hold the punch until an orb is in front of him
      if (M.ph % half !== 0) { ai.wait = 2; M.holding = true; } else if (M.holding) { ai.wait = 1; M.holding = false; }
    },
    moveStart(ai, cfg, m) {
      const M = ai.mods, half = cfg.period / 2;
      if (!m.orb) return;
      // the orb that is in front of him right now (0 or 1)
      M.fist = Math.round(M.ph / half) & 1;
      M.hand = m.hand || 'R';
      ai.fight.sfx('chime');
    },
    // conjunction: both orbs within a quarter lap of each other on the same side (only true at two moments a lap)
    aligned(ai, cfg) { const q = ((ai.mods.ph % cfg.period) + cfg.period) % cfg.period; return q < 4 || Math.abs(q - cfg.period / 2) < 4; },
    renderOpp(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods, v = ai.view();
      if (v.hidden) return;
      const hi = c32(...(cfg.hi || [31, 31, 22])), mid = c32(...(cfg.col || [30, 24, 6])), lo = c32(...(cfg.lo || [20, 12, 2]));
      const cx = fight.OPP_X + v.dx + cfg.at[0], cy = fight.OPP_Y + v.dy + cfg.at[1];
      for (let i = 0; i < 2; i++) {
        const a = ((M.ph / cfg.period) + i / 2) * Math.PI * 2, depth = Math.sin(a);
        let x = cx + Math.cos(a) * cfg.rx, y = cy + depth * cfg.ry - 4;
        let r = depth > 0 ? 5 : 3;
        if (M.fist === i && ['windup', 'active', 'recovery'].includes(ai.state) && ai.move) {
          const m = ai.move, s = M.hand === 'L' ? -1 : 1;
          // from the front of his chest to the glove, then out at the player
          const k = ai.state === 'windup' ? Math.min(1, (ai.moveT + 1) / Math.max(1, m.windupFrames)) : 1;
          const gx = fight.OPP_X + v.dx + s * 26, gy = fight.OPP_Y + v.dy - 82 + (ai.state === 'active' ? 30 : 0);
          x = Math.round(cx + (gx - cx) * k); y = Math.round(cy - 4 + (gy - (cy - 4)) * k); r = ai.state === 'active' ? 9 : 5 + Math.round(k * 3);
        }
        if (depth < 0 && Math.abs(x - fight.OPP_X - v.dx) < 20 && !(M.fist === i)) continue; // (behind his body)
        // the trail
        for (let j = 1; j <= 5; j++) { const a2 = a - j * 0.09, x2 = cx + Math.cos(a2) * cfg.rx, y2 = cy + Math.sin(a2) * cfg.ry - 4; if (M.fist !== i) frame.px(Math.round(x2), Math.round(y2), lo); }
        disc(frame, Math.round(x), Math.round(y), r, lo); disc(frame, Math.round(x), Math.round(y), Math.max(1, r - 1), mid); disc(frame, Math.round(x - 1), Math.round(y - 1), Math.max(1, r - 3), hi);
        if (r >= 5 && (fight.clock >> 2 & 1)) { frame.px(Math.round(x) + r + 1, Math.round(y), hi); frame.px(Math.round(x) - r - 1, Math.round(y), hi); }
      }
      if (M.crossFlash > 3) for (let i = -4; i <= 4; i++) frame.px(cx + i, cy - 10, hi);
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      if (ai.mods.holding) badge(frame, 'ORBITING', fight.COL.yellow);
    },
  },

  // Nebula. A body of gas: she's see-through (dithered) and her stance never changes. Her tells
  // happen inside her: a move with `hue: 'hot' | 'cold' | 'gold' | 'green'` turns her into
  // that colour for the windup (palette cfg.hues[hue]) while she holds her stance, and a glow
  // over the side it comes from (`side: 'L' | 'R'`). hot: head punches. cold: body blows.
  // green: sweeps (duck). gold: her super.
  gas: {
    view(ai, cfg, v) {
      const m = ai.move, f = ai.fight;
      let out = v;
      if (ai.state === 'windup' && m && m.hue) out = { ...v, pose: (f.clock >> 4) & 1 ? 'idle2' : 'idle1' };
      const solid = ai.state === 'windup' && m && m.hue;
      if (!IN_RING.includes(f.phase) && f.phase !== 'ko') return out;
      return solid || ['kd', 'down', 'getup'].includes(ai.state) ? out : { ...out, ghost: true };
    },
    palette(ai, cfg) {
      const m = ai.move;
      if (ai.state === 'windup' && m && m.hue) return cfg.hues[m.hue] || null;
      if (ai.state === 'active' && m && m.hue && ai.moveT < 3) return cfg.hues[m.hue] || null;
      return null;
    },
    renderOpp(ai, cfg, frame, fight) {
      const m = ai.move;
      if (fight.phase !== 'fight' || ai.state !== 'windup' || !m || !m.hue || !m.side) return;
      const v = ai.view(), col = c32(...(cfg.glow[m.hue] || [31, 31, 31])), s = m.side === 'L' ? -1 : 1;
      const x0 = fight.OPP_X + v.dx + (s < 0 ? -50 : 4), x1 = x0 + 46;
      for (let y = fight.OPP_Y + v.dy - 124; y < fight.OPP_Y + v.dy - 4; y++) for (let x = x0; x < x1; x++) if (bayer(x, y) < 0.18 + 0.1 * Math.sin((fight.clock + y) / 5) && ((x + y) & 1)) frame.px(x, y, col);
    },
  },
};
void drawText; void drawTextBig; void textWidth; void panel;
