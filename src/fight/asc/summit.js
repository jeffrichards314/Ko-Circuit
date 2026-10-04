// Pantheon VII's gimmicks (spec §18 A6, Phase B): the Summit.
//
//   dive       Valkyr    she drops from above the screen; her shadow on the canvas grows as she falls
//   scribe     The Scribe    every hit he lands he writes into his pattern pool: your mistakes compound
//   judge      Verity    hitting her while she bows is a foul; three fouls disqualify you
//   sigTint    Radiant Rho   he takes each champion's colour for their signature move
//   (Aldric's wing flare is only poses: the width of the flare is how many hits come)

import { drawTextBig, drawText, textWidth, callout } from '../../engine/font.js';
import { c32 } from '../../engine/palette.js';
import { panel } from '../hud.js';
import { badge, IN_RING } from '../ascension.js';

const ell = (frame, cx, cy, rx, ry, col) => { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y / (ry + 0.5)) ** 2)); frame.rect(cx - w, cy + y, w * 2, 1, col); } };

export const SUMMIT_MODIFIERS = {
  // Valkyr. A move with `dive: -1 | 0 | 1` takes her off the top of the screen: for the windup only her
  // SHADOW shows, a dark ellipse on the canvas that grows as she falls, offset to the side she'll land
  // on (dive -1: she lands to your left, so slip RIGHT; 1: slip LEFT; 0: straight down, either way).
  // The last cfg.inFrames of the windup she drops into view, punches, and steps back.
  //   cfg: inFrames, side (px of the shadow's offset), height (how high she starts), col
  dive: {
    view(ai, cfg, v) {
      const m = ai.move;
      if (!m || m.dive === undefined || !['windup', 'active', 'recovery'].includes(ai.state)) return v;
      const dx = m.dive * cfg.side;
      if (ai.state === 'windup') {
        const left = m.windupFrames - ai.moveT;
        if (left > cfg.inFrames) return { ...v, hidden: true };
        const k = left / cfg.inFrames;
        return { ...v, dx: v.dx + Math.round(dx * (1 - k * 0.2)), dy: v.dy - Math.round(cfg.height * k * k) };
      }
      if (ai.state === 'active') return { ...v, dx: v.dx + dx };
      const len = ai.moveResult === 'hit' ? m.recoveryFrames * 0.5 : m.recoveryFrames, k = Math.max(0, 1 - ai.moveT / Math.max(1, Math.min(len, cfg.back)));
      return { ...v, dx: v.dx + Math.round(dx * k) };
    },
    renderOpp(ai, cfg, frame, fight) {
      const m = ai.move;
      if (fight.phase !== 'fight' || ai.state !== 'windup' || !m || m.dive === undefined) return;
      const k = Math.min(1, (ai.moveT + 1) / m.windupFrames), dark = c32(...(cfg.col || [2, 2, 8])), mid = c32(...(cfg.mid || [6, 6, 16]));
      const cx = fight.OPP_X + m.dive * cfg.side, cy = fight.OPP_Y + 2, r = 6 + Math.round(k * k * 38);
      ell(frame, cx, cy, r + 3, Math.round((r + 3) * 0.28), mid);
      ell(frame, cx, cy, r, Math.round(r * 0.26), dark);
      if ((fight.clock >> 2) & 1) for (let i = -2; i <= 2; i++) frame.px(cx + i * 3, cy - 1, c32(31, 31, 31));
    },
  },

  // The Scribe. Every one of his punches that LANDS on you is written into his pool (cfg.max pages,
  // repeats allowed): from then on, at a break between his combos, he throws a page from it
  // (a chance that grows with the pages, at most once per cfg.gap frames). A perfect player never
  // gives him a page. The pages are shown under the clock.
  scribe: {
    init(ai) { ai.mods.pages = []; ai.mods.lastPage = -9999; },
    roundStart(ai) { ai.mods.pageT = 0; },
    moveResolved(ai, cfg, m, r) {
      const M = ai.mods;
      if (r !== 'hit' || !m.damage || m.echo || m.feint || m.call || m.knockdown || M.pages.length >= cfg.max) return;
      M.pages.push(m.id); M.wroteT = 50; M.wrote = m.name;
      ai.fight.sfx('scratch'); ai.fight.event('wrote');
    },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.wroteT > 0) M.wroteT--;
      const K = ai.know;
      // an exploit that tears up his book (cfg.eraseOn: its id)
      if (K && cfg.eraseOn && K.fired[cfg.eraseOn] !== M.seenErase) { M.seenErase = K.fired[cfg.eraseOn]; M.pages = []; }
      if (f.phase !== 'fight' || !M.pages.length) return;
      if (!['idle', 'block'].includes(ai.state) || ai.wait > 1 || ai.forced.length || ai.superTaunt || !ai.atBreak()) return;
      if (f.clock - M.lastPage < cfg.gap) return;
      if (Math.random() > cfg.base + cfg.per * M.pages.length) { M.lastPage = f.clock - cfg.gap + 60; return; }
      M.lastPage = f.clock;
      const id = M.pages[Math.floor(Math.random() * M.pages.length)];
      ai.forced.push(id);
      f.sfx('scratch');
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods;
      if (M.pages.length) badge(frame, `PAGES: ${M.pages.length}`, fight.COL.orange);
      if (fight.phase === 'fight' && M.wroteT > 20 && (M.wroteT >> 2) & 1) callout(frame, 'WRITTEN DOWN!', 128, 56, fight.COL.yellow, fight.COL.black, 1);
    },
  },

  // Verity. Her `bow` open step (cfg.step, a `trap` for the perfect-play bot) looks like an opening and
  // isn't: a punch into it is a FOUL (no damage, a whistle), and cfg.fouls fouls in a fight is a
  // disqualification: you lose. Fouls never fade. Her real openings are what she leaves after a punch.
  judge: {
    init(ai) { ai.mods.fouls = 0; },
    onPlayerPunch(ai, cfg, p, r) {
      if (ai.punch.state !== 'open' || !ai.openStep || ai.openStep.id !== cfg.step || r.knockdown) return;
      const f = ai.fight, M = ai.mods;
      M.fouls++; M.foulT = 90;
      f.sfx('whistle'); f.event('foul');
      f.shake = 4;
      if (M.fouls >= cfg.fouls && f.phase === 'fight') { M.dq = true; f.finish('DQ', 'opponent'); }
      return { result: 'whiff', foul: true };
    },
    update(ai) { if (ai.mods.foulT > 0) ai.mods.foulT--; },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      const M = ai.mods, bowing = ai.state === 'open' && ai.openStep && ai.openStep.id === cfg.step;
      badge(frame, `FOULS ${M.fouls}/${cfg.fouls}`, M.fouls >= cfg.fouls - 1 && M.fouls > 0 ? fight.COL.red : bowing ? fight.COL.yellow : fight.COL.white);
      if (fight.phase === 'fight' && M.foulT > 0 && (M.foulT >> 2) & 1) callout(frame, M.fouls >= cfg.fouls ? 'DISQUALIFIED!' : 'FOUL!', 128, 56, fight.COL.red, fight.COL.black, 2);
      void bowing; // (no tip in the fight, spec §4: the cornerman warns about her bow)
    },
  },

  // Radiant Rho. A move with `sig: '<champion>'` tints him that champion's colour (palette
  // cfg.palettes[sig]) for its windup and punch, and a badge names whose it is.
  sigTint: {
    palette(ai, cfg) { const m = ai.move; return m && m.sig && ['windup', 'active'].includes(ai.state) ? cfg.palettes[m.sig] : null; },
    moveStart(ai, cfg, m) { if (m.sig) { ai.mods.sigT = 60; ai.mods.sigName = cfg.names[m.sig]; } },
    update(ai) { if (ai.mods.sigT > 0) ai.mods.sigT--; },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods, m = ai.move;
      if (m && m.sig && ['windup', 'active'].includes(ai.state)) badge(frame, M.sigName, c32(...(cfg.colors[m.sig] || [31, 24, 8])));
    },
  },
};
void panel;
