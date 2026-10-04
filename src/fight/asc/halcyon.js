// Halcyon's gimmicks (spec §18 A6, Phase B): the Undefeated has three forms, health-based (the `phases`
// modifier picks his pattern set, palette and badge from the fight's phase; Fight.phaseBreak brings him back at full health).
//   halcyon   the light of the round itself:
//     NOON  he is blinding: a bloom of white over him swallows his body, and every windup starts with a flash. His tells
//           show only as his SHADOW on the canvas (a dark copy of his pose, small, at the left of the ring).
//     DUSK  slow, and every hit of his knocks you down. A body shot into his slow windup slows him further:
//           +cfg.slow frames each (at most cfg.max), and he says so.
//   (Dawn needs nothing: it is only fast combos)

import { drawTextBig, callout } from '../../engine/font.js';
import { c32 } from '../../engine/palette.js';
import { badge, IN_RING, bayer } from '../ascension.js';

const formOf = (fight) => fight.formOverride || fight.stage || fight.round || 1; // (ZERO's true form wears one form at a time: `formOverride`)

export const HALCYON_MODIFIERS = {
  halcyon: {
    init(ai) { ai.mods.flashT = 0; ai.mods.slowT = 0; },
    moveStart(ai, cfg, m) { if (formOf(ai.fight) === 2 && !m.feint && !m.call) ai.mods.flashT = 6; },
    update(ai, cfg) { const M = ai.mods; if (M.flashT > 0) M.flashT--; if (M.slowT > 0) M.slowT--; },
    // DUSK: a body shot into a slow windup drags it out
    onPlayerPunch(ai, cfg, p, r) {
      if (formOf(ai.fight) !== 3 || ai.punch.state !== 'windup' || !ai.move || p.high || p.star || r.result === 'hit' || r.result === 'whiff') return;
      const m = ai.move, used = m.slowed || 0, add = Math.max(0, Math.min(cfg.slow, cfg.max - used));
      if (!add) return;
      m.slowed = used + add; m.windupFrames += add;
      for (const k of ['counterWindow', 'starWindow']) if (m[k]) m[k] = [m[k][0], m[k][1] + add];
      if (m.kdWindow) m.kdWindow = [m.kdWindow[0] + add, m.kdWindow[1] + add];
      ai.mods.slowT = 50;
      ai.fight.sfx('groan'); ai.fight.event('slowed');
      if (ai.know) ai.know.custom('weighedDown');
      return { result: 'blocked', absorbed: true, slowed: true };
    },
    // NOON: his body is bleached away; the shadow on the canvas is the tell
    renderOpp(ai, cfg, frame, fight) {
      if (formOf(fight) !== 2 || !IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const v = ai.view();
      if (v.hidden) return;
      const x0 = fight.OPP_X + v.dx - 56, x1 = fight.OPP_X + v.dx + 56, y0 = fight.OPP_Y + v.dy - 158, y1 = fight.OPP_Y + v.dy + 2;
      const white = c32(31, 31, 31);
      const dens = ai.state === 'windup' || ai.state === 'active' ? 0.9 : 0.72;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (bayer(x, y) < dens && ((x + y) & 1) === 0) frame.px(x, y, white);
      // the shadow: a dark copy of his pose, small, cast on the canvas to the left of the ring
      const pal = fight.oppPalette('halcyon.shade');
      frame.blit(fight.oppSprites.get(v.pose), 46, fight.OPP_Y + 24, pal, { layer: 2, scale: 0.62 });
    },
    postScene(ai, cfg, frame, fight) {
      if (formOf(fight) !== 2 || ai.mods.flashT <= 0 || fight.phase !== 'fight') return;
      const w = c32(31, 31, 31), k = ai.mods.flashT >= 4 ? 0.85 : 0.4;
      for (let y = 44; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < k) frame.px(x, y, w);
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      if (fight.phase === 'fight' && ai.mods.slowT > 20 && (ai.mods.slowT >> 2) & 1) callout(frame, 'SLOWED!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
    },
  },
};
void badge;
