// Pantheon V's gimmicks (spec §18 A6, Phase B): the Thunder Forge.
//
//   tally   Anvil          every third punch of his you block breaks your guard
//   shock   Spark          a hit of his charges you: his next hit does double damage
//   forge   Forgemaster Hale   his fists heat from red to orange to white-hot; counters cool them
//   (Bellows' inhale is only poses: a longer windup shows a bigger belly and means a bigger blow)

import { drawTextBig, drawText, textWidth, callout } from '../../engine/font.js';
import { c32 } from '../../engine/palette.js';
import { badge, IN_RING, bayer } from '../ascension.js';

export const FORGE_MODIFIERS = {
  // Anvil. Every cfg.n-th punch of his that you BLOCK (in a row: the count fades after cfg.fade
  // frames without one) breaks your guard for cfg.frames: blocking stops nothing (the player's
  // guardBroken). Slipping and ducking are never taxed. The count shows under the clock.
  tally: {
    init(ai) { ai.mods.blocks = 0; ai.mods.lastBlock = -9999; },
    roundStart(ai) { ai.mods.blocks = 0; },
    onKnockdown(ai) { ai.mods.blocks = 0; },
    moveResolved(ai, cfg, m, r) {
      const M = ai.mods, f = ai.fight;
      if (r !== 'blocked' || m.echo || !m.damage) return;
      if (f.clock - M.lastBlock > cfg.fade) M.blocks = 0;
      M.lastBlock = f.clock;
      if (++M.blocks >= cfg.n) {
        M.blocks = 0; M.brokenT = 60;
        f.defenseCost({ guardBreak: cfg.frames, say: 'GUARD BROKEN!' });
        f.event('guardBreak');
        f.shake = 8;
      }
    },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.brokenT > 0) M.brokenT--;
      if (f.phase === 'fight' && M.blocks && f.clock - M.lastBlock > cfg.fade) M.blocks = 0;
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods;
      if (M.blocks > 0) badge(frame, `BLOCKED ${M.blocks}/${cfg.n}`, M.blocks >= cfg.n - 1 ? fight.COL.red : fight.COL.yellow);
    },
  },

  // Spark. When one of his punches lands you're CHARGED: he crackles white-yellow (the `hot`
  // palette) and his next punch, landed or not, does double damage; it stays charged until one
  // of them lands (or cfg.frames run out). Slipping his doubled punch keeps the charge.
  shock: {
    init(ai) { ai.mods.charged = 0; },
    roundStart(ai) { ai.mods.charged = 0; },
    onKnockdown(ai) { ai.mods.charged = 0; },
    moveStart(ai, cfg, m) {
      if (ai.mods.charged > 0 && m.damage && !m.feint && !m.call && !m.doubled) { m.damage = Math.round(m.damage * cfg.mult); m.doubled = true; m.name = m.name + ' (x2)'; }
    },
    moveResolved(ai, cfg, m, r) {
      const M = ai.mods;
      if (r !== 'hit') return;
      if (m.doubled) { M.charged = 0; M.spentT = 30; ai.fight.sfx('zap'); return; }
      M.charged = cfg.frames; M.chargeT = 40; ai.fight.sfx('charge'); ai.fight.event('charged');
    },
    update(ai, cfg) {
      const M = ai.mods, K = ai.know;
      // an exploit that grounds him takes the charge away (cfg.dischargeOn: its id)
      if (K && cfg.dischargeOn && K.fired[cfg.dischargeOn] !== M.seenGround) { M.seenGround = K.fired[cfg.dischargeOn]; M.charged = 0; }
      if (M.charged > 0 && ai.fight.phase === 'fight') M.charged--; if (M.chargeT > 0) M.chargeT--; if (M.spentT > 0) M.spentT--;
    },
    palette(ai, cfg) { return ai.mods.charged > 0 && (ai.fight.clock >> 2) & 1 ? cfg.hot : null; },
    renderOpp(ai, cfg, frame, fight) {
      if (!(ai.mods.charged > 0) || !IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const v = ai.view(), t = fight.clock, col = c32(...(cfg.arc || [24, 30, 31]));
      // arcs jumping off him
      for (let i = 0; i < 4; i++) {
        const s = ((i + 1) * 40503 + (t >> 1) * 9973) >>> 0, x0 = fight.OPP_X + v.dx - 30 + (s % 60), y0 = fight.OPP_Y + v.dy - 120 + ((s >> 8) % 110);
        let x = x0, y = y0;
        for (let k = 0; k < 6; k++) { frame.px(x, y, col); x += ((s >> (k + 3)) & 1) ? 2 : -2; y += 1 + ((s >> k) & 1); }
      }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods;
      if (M.charged > 0) badge(frame, 'CHARGED: NEXT HIT x2', (fight.clock >> 3) & 1 ? fight.COL.yellow : fight.COL.white);
      if (fight.phase === 'fight' && M.chargeT > 0 && (M.chargeT >> 2) & 1) callout(frame, 'CHARGED!', 128, 56, fight.COL.yellow, fight.COL.black, 1);
    },
  },

  // Forgemaster Hale. His hands run at a heat, stage 1 (red) to 3 (white-hot): it climbs a stage every
  // cfg.rate real seconds, and each stage adds damage (cfg.dmg) and speed (his recoveries shrink by
  // cfg.rec, and he waits less between punches; never his tell). A counter you land cools him a stage.
  // The whole glove and cuff are recoloured for the stage (`hale.h1`-`h3`).
  forge: {
    init(ai, cfg) { ai.mods.stage = cfg.start || 1; ai.mods.heatT = 0; },
    roundStart(ai, cfg) { ai.mods.stage = Math.max(cfg.start || 1, ai.mods.stage - 1); ai.mods.heatT = 0; },
    modifyMove(ai, cfg, m) {
      const s = ai.mods.stage - 1;
      if (!s || m.feint || m.call || !m.damage || m.knockdown) return m;
      return { ...m, damage: Math.round(m.damage * (1 + cfg.dmg * s)), recoveryFrames: Math.max(14, Math.round(m.recoveryFrames * (1 - cfg.rec * s))) };
    },
    onPlayerPunch(ai, cfg, p, r) {
      const M = ai.mods;
      if (r.result === 'hit' && r.counter && M.stage > (cfg.start || 1)) { M.stage--; M.heatT = 0; M.coolT = 50; ai.fight.sfx('sizzle'); ai.fight.event('cooled'); }
    },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.coolT > 0) M.coolT--;
      if (f.phase !== 'fight') return;
      if (++M.heatT >= cfg.rate * 60 && M.stage < cfg.max) { M.stage++; M.heatT = 0; M.heatUp = 50; f.sfx('heat'); f.event('heated'); }
      if (M.heatUp > 0) M.heatUp--;
      // between punches he waits less as he heats
      if (ai.state === 'idle' && ai.wait > 2 && M.stage >= 2 && f.clock % (M.stage === 2 ? 8 : 4) === 0 && !ai.superTaunt) ai.wait--;
    },
    palette(ai, cfg) { return 'hale.h' + Math.min(3, Math.max(1, ai.mods.stage)); },
    renderOpp(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods, v = ai.view();
      if (v.hidden || M.stage < 2) return;
      const t = fight.clock, hi = c32(...(M.stage >= 3 ? [31, 31, 24] : [31, 22, 6])), lo = c32(...(M.stage >= 3 ? [31, 24, 8] : [30, 10, 2]));
      // heat shimmer and sparks off the fists
      for (let i = 0; i < 3 + M.stage * 2; i++) {
        const s = ((i + 1) * 40503 + (t >> 1) * 7919) >>> 0, x = fight.OPP_X + v.dx - 50 + (s % 100), y = fight.OPP_Y + v.dy - 112 + ((s >> 8) % 60);
        frame.px(x, y - ((t >> 1) % 6), i & 1 ? hi : lo);
      }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods, N = cfg.names[M.stage - 1];
      badge(frame, N.label, c32(...N.color));
      if (fight.phase === 'fight' && M.coolT > 20 && (M.coolT >> 2) & 1) callout(frame, 'COOLED!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
      else if (fight.phase === 'fight' && M.heatUp > 20 && (M.heatUp >> 2) & 1) callout(frame, N.shout, 128, 56, c32(...N.color), fight.COL.black, 1);
    },
  },
};
void bayer; void drawText; void textWidth;
