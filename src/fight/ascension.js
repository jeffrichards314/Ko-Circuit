// The Ascension's reusable modifiers (spec §18, §10: gimmicks are modifiers first, so the later
// zones' fighters can use them too). Registered into MODIFIERS by opponentAI.js.
// Each is a small object of the same optional hooks as the base ones (see the top of
// opponentAI.js), plus two the perfect-play bot reads (src/fight/bot.js):
//   futile(ai, cfg)    -> true when punching him is pointless right now (a raised shield)
//   threats(ai, cfg)   -> [{ move, left, tellT }] attacks of his that aren't his own windup
//                         (a light trail's echo): `left` frames until it lands, `tellT` how
//                         long its tell has shown
//
//   shield      Sentinel Oro    a shield that bounces every punch; his glowing bash, dodged, drops it
//   fanfare     Lark            each note of her trumpet floats up at the height of its punch
//   lantern     Brother Ember   a dark ring that brightens with every hit you land
//   afterglow   Aurora Vess     her attacks leave light trails that replay them as real attacks
//   hover       Zephyr Kade     he floats: how high he hangs shows the target of the punch
//   cloud       Nimbus          vapor: his stance passes punches through until he rains
//   slide       Updraft Ulla    a gale (or a slick canvas) makes every dodge slide farther
//   weather     Cirrus Crown    a new weather every round: clear, fog, lightning
//   era         Hall of Heroes  a film-grain look that matches a fighter's era
//   clinch      Rocksteady Reuben  a hold you have to mash out of
//   rope        Sugarfoot Simone   covering up on the ropes: punching her costs hearts, then she explodes
//   lunge       Dash Ascendant  he vanishes, a light streak shows the side, and he lunges in from it

import { drawTextBig, drawText, textWidth, callout } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { panel } from './hud.js';

const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
const IN_RING = ['fight', 'oppDown', 'playerDown', 'intro'];
const badge = (frame, label, col) => {
  const w = textWidth(label, false) + 8;
  panel(frame, 128 - (w >> 1), 31, w, 10);
  drawText(frame, label, 128 - (textWidth(label, false) >> 1), 33, col, { mono: false });
};
// the opponent's screen box, for effects that sit over him
const box = (fight, v) => ({ x0: fight.OPP_X + v.dx - 52, x1: fight.OPP_X + v.dx + 52, y0: fight.OPP_Y + v.dy - 132, y1: fight.OPP_Y + v.dy + 2 });
const unstunned = (ai) => !(ai.punch && ai.punch.stunned);

export const ASCENSION_MODIFIERS = {
  // ------------------------------------------------------------------ Pantheon I --

  // Sentinel Oro. A gilded shield: while it's up EVERY punch bounces off it (costing hearts like a
  // block, and drawing his guard counter), counters and punishes included. Only a perfect hit goes
  // through, and so does anything while he's in an `open` step, stunned or down. His bash (the
  // shield glows for the whole windup) can't be blocked, only slipped: slip it and the shield
  // clatters away for `down` frames; he gets it back with an `open` step (`retrieve`).
  //   cfg: bash (move id), glow (palette while it glows), down (frames), retrieve ({ open, anim })
  shield: {
    init(ai) { ai.mods.shield = true; ai.mods.downT = 0; },
    roundStart(ai) { ai.mods.shield = true; ai.mods.downT = 0; },
    futile(ai) { return shieldUp(ai); },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result === 'whiff' || r.knockdown || !shieldUp(ai)) return;
      ai.fight.sfx('clang'); ai.mods.clangT = 14;
      return { result: 'blocked', clang: true };
    },
    moveResolved(ai, cfg, m, r) {
      if (m.id !== cfg.bash || r !== 'dodged') return;
      ai.mods.shield = false; ai.mods.downT = cfg.down; ai.mods.dropT = 70;
      ai.fight.sfx('crash'); ai.fight.event('shieldDrop'); ai.fight.shake = 8;
    },
    update(ai, cfg) {
      const M = ai.mods;
      if (M.clangT > 0) M.clangT--;
      if (M.dropT > 0) M.dropT--;
      if (M.shield || ai.fight.phase !== 'fight') return;
      if (M.downT > 0) M.downT--;
      // time to pick it up again (between moves)
      if (M.downT <= 0 && ['idle', 'block'].includes(ai.state) && !ai.forced.length && !ai.superTaunt) {
        ai.startOpen({ interrupt: true, comboLimit: 3, ...cfg.retrieve, id: 'retrieve', open: cfg.retrieve.open || 44 });
      }
    },
    openDone(ai, cfg, step) { if (step.id === 'retrieve') { ai.mods.shield = true; ai.fight.sfx('clang'); } },
    openBroken(ai, cfg, step) { if (step.id === 'retrieve') { ai.mods.shield = true; ai.fight.sfx('clang'); } },
    onKnockdown(ai) { ai.mods.shield = true; ai.mods.downT = 0; }, // (he gets up with it)
    palette(ai, cfg) { return ai.state === 'windup' && ai.moveId === cfg.bash && shieldUp(ai) ? cfg.glow : null; },
    // without the shield he shows the `_ns` version of every pose (the sprite layers make them)
    view(ai, cfg, v) {
      if (hasShield(ai) || (cfg.keep || []).includes(v.pose)) return v;
      return { ...v, pose: v.pose[0] === '~' ? '~' + v.pose.slice(1) + '_ns' : v.pose + '_ns' };
    },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods, v = ai.view();
      if (v.hidden) return;
      // the shield lying on the canvas while he's without it
      if (!hasShield(ai) && !(ai.know && ai.know.flag('shieldBroken')) && !ai.mods.shield && !['down', 'kd'].includes(ai.state) && !(ai.state === 'open' && ai.openStep && ai.openStep.id === 'retrieve')) {
        const x = fight.OPP_X - 42, y = fight.OPP_Y - 2, gold = c32(29, 23, 5), hi = c32(31, 30, 17), sh = c32(21, 14, 3), dk = c32(12, 7, 1);
        for (let j = -4; j <= 4; j++) { const w = Math.round(Math.sqrt(1 - (j / 4.5) ** 2) * 15); frame.rect(x - w, y + j, w * 2, 1, j < -2 ? hi : j < 1 ? gold : j < 3 ? sh : dk); }
        frame.rect(x - 2, y - 1, 4, 2, c32(5, 19, 31));
      }
      // a shine on the shield while it bounces punches; sparks when it's glowing
      if (M.clangT > 8) for (const [dx, dy] of [[-6, -70], [8, -60], [0, -50], [-10, -56]]) frame.px(fight.OPP_X + v.dx + dx + ((M.clangT & 1) ? 1 : -1), fight.OPP_Y + v.dy + dy, fight.COL.white);
      if (ai.state === 'windup' && ai.moveId === cfg.bash && shieldUp(ai) && (ai.moveT >> 1) % 3 === 0) for (const [dx, dy] of [[-22, -84], [24, -50], [-30, -40], [12, -96]]) { frame.px(fight.OPP_X + v.dx + dx, fight.OPP_Y + v.dy + dy, c32(31, 30, 18)); frame.px(fight.OPP_X + v.dx + dx, fight.OPP_Y + v.dy + dy - 1, c32(31, 26, 8)); }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      const cracked = ai.know && ai.know.flag('shieldBroken');
      badge(frame, cracked ? 'SHIELD CRACKED' : ai.mods.shield ? 'SHIELD UP' : 'SHIELD DOWN', ai.mods.shield && !cracked ? fight.COL.grey : fight.COL.yellow);
      if (fight.phase === 'fight' && ai.mods.dropT > 0 && (ai.mods.dropT >> 2) & 1) callout(frame, 'SHIELD DROPPED!', 128, 56, fight.COL.yellow, fight.COL.black, 1);
    },
  },

  // Lark. Every move with `note: 'high' | 'low' | 'mid'` shows a note floating up over her at the
  // height of its punch during the windup (her trumpet plays the same pitch: `sfx.tell`).
  fanfare: {
    renderOpp(ai, cfg, frame, fight) {
      const m = ai.move;
      if (fight.phase !== 'fight' || ai.state !== 'windup' || !m || !m.note) return;
      const v = ai.view(), k = ai.moveT / m.windupFrames;
      const [nx, ny] = cfg.at || [24, -78];
      const y0 = m.note === 'high' ? ny - 34 : m.note === 'low' ? ny + 34 : ny;
      const x = fight.OPP_X + v.dx + nx + Math.round(k * 10), y = fight.OPP_Y + v.dy + y0 - Math.round(k * 6);
      const col = m.note === 'high' ? c32(31, 31, 20) : m.note === 'low' ? c32(31, 17, 6) : c32(31, 26, 10);
      drawNote(frame, x, y, col, fight.COL.black);
    },
  },

  // ------------------------------------------------------------------ Brother Ember --

  // A dark ring that brightens as you fight: `light` starts at cfg.base, every punch you land adds
  // cfg.gain, and it fades back at cfg.decay per frame (never under cfg.min). The darker it is the
  // more the ring is hidden (a dither of night over everything but a disc round his lantern), so a
  // player who keeps hitting him sees his tells better, one who hides in the dark sees them worst.
  lantern: {
    init(ai, cfg) { ai.mods.light = cfg.base; },
    roundStart(ai, cfg) { ai.mods.light = cfg.base; },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result === 'hit') { const M = ai.mods; M.light = Math.min(1, M.light + cfg.gain * (r.counter ? 1.5 : 1)); M.brightT = 24; }
    },
    update(ai, cfg) {
      const M = ai.mods;
      if (M.brightT > 0) M.brightT--;
      if (ai.fight.phase === 'fight') M.light = Math.max(cfg.min ?? 0.1, M.light - cfg.decay);
    },
    postScene(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      const M = ai.mods, dark = (1 - M.light) * cfg.dark;
      if (dark <= 0.02) return;
      const v = ai.view();
      const lx = fight.OPP_X + v.dx + cfg.lamp[0], ly = fight.OPP_Y + v.dy + cfg.lamp[1];
      const R = 16 + M.light * 46, night = c32(...cfg.night);
      for (let y = 44; y < 224; y++) for (let x = (y & 1) ? 0 : 0; x < 256; x++) {
        const d = Math.hypot(x - lx, (y - ly) * 1.15);
        const dens = dark * Math.min(1, Math.max(0, (d - R * 0.55) / (R * 0.6)));
        if (dens > 0 && bayer(x, y) < dens) frame.px(x, y, night);
      }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      const M = ai.mods, w = 66;
      panel(frame, 128 - (w >> 1), 31, w, 10);
      drawText(frame, 'LIGHT', 128 - (w >> 1) + 4, 33, M.light > 0.7 ? fight.COL.yellow : fight.COL.cyan, { mono: false });
      const bx = 128 - (w >> 1) + 4 + textWidth('LIGHT', false) + 3, bw = 128 + (w >> 1) - 3 - bx;
      frame.rect(bx, 33, bw, 6, fight.COL.barBack);
      frame.rect(bx + 1, 34, Math.round((bw - 2) * M.light), 4, M.light > 0.7 ? fight.COL.yellow : fight.COL.orange);
      frame.rect(bx + 1, 34, Math.round((bw - 2) * M.light), 1, fight.COL.white);
      if (fight.phase === 'fight' && M.brightT > 14 && (M.brightT >> 2) & 1) callout(frame, 'BRIGHTER!', 128, 56, fight.COL.yellow, fight.COL.black, 1);
    },
  },

  // ------------------------------------------------------------------ Aurora Vess --

  // Every move with `glow: true` leaves a light trail where she threw it. cfg.delay frames after it
  // landed (or missed), the trail brightens for cfg.tell frames (a chime) and replays the punch as
  // a second, real attack (same defenses, cfg.damage of the damage). The echo is a full attack of its
  // own: the perfect-play bot reads it through `threats`. A counter that stuns her snuffs the trails.
  //   cfg: delay, tell, damage, ghost (palette), max (trails at once)
  afterglow: {
    init(ai) { ai.mods.trails = []; },
    roundStart(ai) { ai.mods.trails = []; },
    onKnockdown(ai) { ai.mods.trails = []; },
    moveResolved(ai, cfg, m, r) {
      const M = ai.mods;
      M.lastImpact = ai.fight.clock; // (an echo never lands right on top of another punch: see `echoBusy`)
      if (!m.glow || m.echo || ai.fight.phase !== 'fight') return;
      // an exploit can gutter the next one (Aurora's Slant of Light)
      if (ai.know && ai.know.flags.noEchoNext) { ai.know.flags.noEchoNext = false; return; }
      const A = m.animation, t0 = ai.fight.clock;
      M.trails.push({
        at: t0 + cfg.delay, born: t0, move: m, side: (M.trailN = (M.trailN || 0) + 1) & 1 ? 1 : -1,
        tellPose: A.windup[A.windup.length - 1], hitPose: A.active[A.active.length - 1], chimed: false, state: 'trail',
      });
      if (M.trails.length > (cfg.max || 2)) M.trails.shift();
    },
    onPlayerPunch(ai, cfg, p, r) {
      // her trails fade when she's stunned by a counter (the light goes out with her balance)
      if (r.result === 'hit' && r.counter && ai.mods.trails.length) { ai.mods.trails = []; ai.mods.snuffT = 40; ai.fight.sfx('glass'); }
    },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.snuffT > 0) M.snuffT--;
      if (f.phase !== 'fight') { M.trails = []; return; }
      const pending = M.trails.filter((tr) => tr.state !== 'done');
      // 1) before he starts a punch of his own, keep its impact 14+ frames from every echo still to come
      //    (two impacts closer than that can't both be defended: the player needs 13 frames to chain)
      const clash = (id) => {
        const nm = id && ai.d.moves[id];
        if (!nm || nm.call) return 0;
        const impact = f.clock + 1 + nm.windupFrames;
        let d = 0;
        for (const tr of pending) if (Math.abs(impact - tr.at) < 14) d = Math.max(d, tr.at + 14 - impact + 1);
        return d;
      };
      // (a punch that follows straight on from his last one's recovery, too: on its last frame, idle him out of the clash)
      if (pending.length && ai.state === 'recovery' && ai.move && !ai.superTaunt) {
        const len = ai.moveResult === 'hit' ? Math.round(ai.move.recoveryFrames * 0.5) : ai.move.recoveryFrames;
        const d = ai.moveT + 1 >= len ? clash(nextMoveId(ai)) : 0;
        if (d > 0) { ai.state = 'idle'; ai.t = 0; ai.wait = d; }
      }
      if (pending.length && ['idle', 'block'].includes(ai.state) && !ai.superTaunt) {
        // his next pattern step (or a scripted or queued one) starts when the idle ends...
        if (ai.wait <= 1) ai.wait = Math.max(ai.wait, clash(nextMoveId(ai)));
        // ...but an anti-strategy's answer and a guard counter start on their own: hold those too
        const K = ai.know;
        if (K && K.pending && K.pending.delay <= 0 && !ai.forced.length) K.pending.delay = Math.max(K.pending.delay, clash(K.pending.moves[0]));
        if (ai.guardQ && ai.guardQ.delay <= 1) ai.guardQ.delay = Math.max(ai.guardQ.delay, clash(ai.guardQ.id));
      }
      for (const tr of M.trails) {
        // 2) while nobody has seen the echo coming, slide it clear of a punch that's already on its way
        if (tr.state !== 'done' && tr.at - f.clock > 26 && echoBusy(ai, f, M, tr)) tr.at++;
        if (!tr.chimed && f.clock >= tr.at - cfg.tell) { tr.chimed = true; tr.state = 'tell'; f.sfx('chime'); }
        if (f.clock >= tr.at && tr.state !== 'done') {
          tr.state = 'done'; tr.doneAt = f.clock;
          const em = echoOf(tr.move, cfg);
          const res = f.opponentAttack(em);
          f.sfx(tr.move.sfx && tr.move.sfx.swing ? tr.move.sfx.swing : 'whiff');
          ai.hook('moveResolved', em, res);
          if (res === 'dodged' || res === 'ducked') f.event('echoDodged');
        }
      }
      M.trails = M.trails.filter((tr) => tr.state !== 'done' || f.clock - tr.doneAt < 10);
    },
    threats(ai, cfg) {
      const f = ai.fight;
      return ai.mods.trails.filter((tr) => tr.state !== 'done' && tr.at > f.clock).map((tr) => ({ move: echoOf(tr.move, cfg), left: tr.at - f.clock, tellT: f.clock - (tr.at - cfg.tell) }));
    },
    renderOpp(ai, cfg, frame, fight) {
      const gp = fight.oppPalette(cfg.ghost);
      for (const tr of ai.mods.trails) {
        const age = fight.clock - tr.born;
        const x = fight.OPP_X + tr.side * cfg.dx;
        // the trail: a faint dithered copy of the punch; it brightens into the wind-up, then throws
        const pose = tr.state === 'done' ? tr.hitPose : tr.state === 'tell' ? tr.tellPose : tr.hitPose;
        if (tr.state === 'trail' && age < 6) continue; // (right on top of her at first)
        if (tr.state === 'tell' && ((fight.clock >> 1) & 1)) frame.blit(fight.oppSprites.get(pose), x, fight.OPP_Y, fight.oppPalette(cfg.hot || cfg.ghost), { layer: 2 });
        else frame.blit(fight.oppSprites.get(pose), x, fight.OPP_Y, gp, { layer: 2, dither: 1 });
      }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      const n = ai.mods.trails.filter((t) => t.state !== 'done').length;
      if (n) badge(frame, `TRAIL x${n}`, (fight.clock >> 3) & 1 ? fight.COL.yellow : fight.COL.cyan);
      if (fight.phase === 'fight' && ai.mods.snuffT > 20 && (ai.mods.snuffT >> 2) & 1) callout(frame, 'TRAIL SNUFFED!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
    },
  },

  // ------------------------------------------------------------------ Pantheon II --

  // Zephyr Kade floats. A move with `hover: 'high' | 'low'` lifts him (or sinks him) during its windup
  // and he throws it from there: high, an overhand at the head; low, a punch at the body. `bob`:
  // he never stands still in the air.
  hover: {
    view(ai, cfg, v) {
      const f = ai.fight, m = ai.move;
      let dy = v.dy + Math.round(Math.sin(f.clock / cfg.period) * cfg.bob);
      if (m && m.hover && ['windup', 'active', 'recovery'].includes(ai.state)) {
        const to = m.hover === 'high' ? -cfg.rise : m.hover === 'low' ? cfg.sink : 0;
        let k = 1;
        if (ai.state === 'windup') k = Math.min(1, (ai.moveT + 1) / cfg.ease);
        else if (ai.state === 'recovery') k = Math.max(0, 1 - ai.moveT / cfg.settle);
        dy += Math.round(to * k);
      }
      return { ...v, dy };
    },
  },

  // Nimbus. Vapor: while he's in his stance (`cfg.states`) and not raining, his head is far too
  // high to reach and body shots pass through him (they cost hearts: the cloud eats your glove).
  // His `rain` step (an open step with id cfg.step) crouches him: everything lands. Counters,
  // punishes, stuns, open steps and Star Punches all work as usual.
  cloud: {
    futile(ai, cfg) { return vaporNow(ai, cfg); },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result === 'whiff' || r.knockdown || p.star || !unstunned(ai)) return;
      if (!(cfg.states || ['idle', 'block', 'taunt']).includes(ai.punch.state)) return;
      const M = ai.mods;
      if (p.high) { M.tallT = 24; return { result: 'whiff', tooTall: true }; }
      M.passT = 24; ai.fight.sfx('whoosh');
      return { result: 'blocked', absorbed: true, vapor: true };
    },
    update(ai) { const M = ai.mods; if (M.tallT > 0) M.tallT--; if (M.passT > 0) M.passT--; if (M.rainT > 0) M.rainT--; },
    renderOpp(ai, cfg, frame, fight) {
      if (ai.state !== 'open' || !ai.openStep || ai.openStep.id !== cfg.step || fight.phase !== 'fight') return;
      const v = ai.view(), t = fight.clock, hi = c32(...(cfg.hi || [24, 27, 31])), lo = c32(...(cfg.lo || [13, 16, 22]));
      for (let i = 0; i < 26; i++) {
        const seed = (i * 2654435761) >>> 0, x0 = fight.OPP_X + v.dx - 34 + (seed % 68), sp = 4 + ((seed >> 8) % 3);
        const y = fight.OPP_Y + v.dy - 92 + ((seed >> 4) % 90 + t * sp) % 96;
        for (let j = 0; j < 4; j++) frame.px(x0 - (j >> 1), y + j, j < 2 ? hi : lo);
      }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      const M = ai.mods, raining = ai.state === 'open' && ai.openStep && ai.openStep.id === cfg.step;
      badge(frame, raining ? 'RAINING!' : 'VAPOR', raining ? fight.COL.cyan : fight.COL.grey);
      if (fight.phase !== 'fight') return;
      if (M.tallT > 0) callout(frame, 'TOO TALL!', 128, 70 - (M.tallT >> 3), fight.COL.white, fight.COL.black, 1);
      else if (M.passT > 0) callout(frame, 'PASSES THROUGH!', 128, 70 - (M.passT >> 3), fight.COL.white, fight.COL.black, 1);
    },
  },

  // Updraft Ulla's gale (and Barney Ascended's holy spill): every dodge you make runs `extra` frames
  // longer, with the slide to match (the slip itself is unchanged: it's the coming back that
  // takes longer, and your counter timing with it). It starts when her cfg.call move finishes and
  // lasts cfg.frames (or `until: 'round'`); a punch during the call cancels it.
  slide: {
    init(ai) { ai.mods.slideT = 0; ai.mods.slideOn = false; },
    roundStart(ai) { ai.mods.slideT = 0; ai.mods.slideOn = false; ai.fight.player.slide = 0; },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (f.phase !== 'fight') { f.player.slide = 0; return; }
      if (ai.moveId === cfg.call && ai.state === 'recovery' && ai.moveResult === 'feint' && M.called !== ai.move) {
        M.called = ai.move; M.slideOn = true; M.slideT = cfg.frames || 0; M.news = 80;
        f.sfx(cfg.sfx || 'gust'); f.event('gale');
      }
      if (M.slideOn && M.slideT > 0 && --M.slideT === 0 && cfg.until !== 'round') { M.slideOn = false; f.sfx('tick'); }
      if (M.news > 0) M.news--;
      f.player.slide = M.slideOn ? cfg.extra : 0;
    },
    onKnockdown(ai) { ai.fight.player.slide = 0; },
    renderOpp(ai, cfg, frame, fight) {
      if (!ai.mods.slideOn || !IN_RING.includes(fight.phase)) return;
      const t = fight.clock, col = c32(...(cfg.streak || [27, 29, 31])), dark = c32(...(cfg.streakDk || [16, 19, 26]));
      for (let i = 0; i < 16; i++) {
        const seed = (i * 2654435761) >>> 0, y = 60 + (seed % 150), len = 10 + ((seed >> 6) % 16), x = ((seed >> 3) % 300 + t * (3 + (i % 3))) % 320 - 32;
        for (let j = 0; j < len; j++) if (j % 5 !== 4) frame.px(x + j, y + (j >> 3), j > len - 4 ? dark : col);
      }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      if (ai.mods.slideOn) badge(frame, cfg.label || 'GALE', fight.COL.cyan);
      if (fight.phase === 'fight' && ai.mods.news > 0 && (ai.mods.news >> 2) & 1) callout(frame, cfg.shout || 'YOUR DODGES SLIDE!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
    },
  },

  // Cirrus Crown. The weather changes with the round: cfg.order (by round or Gauntlet stage).
  //   clear      nothing
  //   fog        banks of fog drift over him: the tells are faint (his sounds still work)
  //   lightning  he's a dark silhouette until a bolt lights him: the tell is a flash
  weather: {
    moveStart(ai, cfg) {
      if (weatherOf(ai, cfg) !== 'lightning' || ai.fight.phase !== 'fight') return;
      ai.mods.flashT = 7; ai.fight.sfx('thunder'); ai.fight.arena.reaction('lightning');
    },
    update(ai) { if (ai.mods.flashT > 0) ai.mods.flashT--; if (ai.mods.newsT > 0) ai.mods.newsT--; },
    roundStart(ai) { ai.mods.newsT = 0; },
    // in lightning he's a silhouette, lit only while a windup flickers
    palette(ai, cfg) {
      if (weatherOf(ai, cfg) !== 'lightning' || !IN_RING.includes(ai.fight.phase) || ai.fight.phase === 'intro') return null;
      if (ai.state === 'windup') return ai.moveT % 3 === 2 ? cfg.dark : null;
      if (ai.state === 'active' && ai.moveT < 5) return null;
      if (['hit', 'stunned', 'open', 'kd', 'down', 'getup'].includes(ai.state)) return null;
      return cfg.dark;
    },
    renderOpp(ai, cfg, frame, fight) {
      const W = weatherOf(ai, cfg);
      if (W !== 'fog' || !IN_RING.includes(fight.phase) || fight.phase === 'oppDown') return;
      const v = ai.view();
      if (v.hidden) return;
      const b = box(fight, v), t = fight.clock, col = c32(...(cfg.fog || [26, 27, 29]));
      for (let y = b.y0; y < b.y1; y++) for (let x = b.x0; x < b.x1; x++) {
        const n = 0.5 + 0.28 * Math.sin((x + t * 0.35) * 0.09 + y * 0.05) + 0.2 * Math.sin((x - t * 0.2) * 0.17 - y * 0.11);
        if (bayer(x, y) < cfg.density * n) frame.px(x, y, col);
      }
    },
    postScene(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (weatherOf(ai, cfg) === 'lightning' && M.flashT > 0 && fight.phase === 'fight') {
        const w = c32(31, 31, 31), k = M.flashT >= 5 ? 0.9 : 0.3;
        for (let y = 44; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < k) frame.px(x, y, w);
      }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      const W = weatherOf(ai, cfg), N = cfg.names[W];
      badge(frame, N.label, c32(...N.color));
      if (fight.phase === 'intro' && (fight.pt >> 3) & 1) callout(frame, N.shout, 128, 122, c32(...N.color), fight.COL.black, 2);
    },
  },

  // ------------------------------------------------------------------ Pantheon III --

  // The Hall of Heroes: a film-era look over the fighter, and only over him (grain, scratches,
  // scanlines, sparkle), never enough to hide a tell. cfg.eras: [{ from: round, look }] or cfg.look.
  //   sepia   dust and a shaky frame       film   flicker and vertical scratches
  //   tv      scanlines, a rolling bar     disco  glints and a shimmer
  era: {
    renderOpp(ai, cfg, frame, fight) {
      const look = eraLook(ai, cfg);
      if (!look || !IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const v = ai.view();
      if (v.hidden) return;
      const b = box(fight, v), t = fight.clock;
      const dust = c32(...(cfg.dust || [26, 22, 15])), dk = c32(...(cfg.dustDk || [6, 4, 3])), br = c32(31, 31, 31);
      if (look === 'sepia') {
        for (let i = 0; i < 9; i++) {
          const s = ((i + 1) * 40503 + (t >> 2) * 9973) >>> 0, x = b.x0 + (s % (b.x1 - b.x0)), y = b.y0 + ((s >> 8) % (b.y1 - b.y0));
          frame.px(x, y, i & 1 ? dust : dk);
        }
        if ((t % 90) < 3) { const x = b.x0 + ((t * 7) % (b.x1 - b.x0)); for (let y = b.y0; y < b.y1; y += 2) frame.px(x, y, dust); }
      } else if (look === 'film') {
        const fl = (t >> 1) % 7 === 0;
        for (let i = 0; i < 3; i++) { const x = b.x0 + (((i + 1) * 977 + (t >> 3) * 131) % (b.x1 - b.x0)); for (let y = b.y0; y < b.y1; y++) if (((y + i) & 3) && ((y * 5 + t) % 9 !== 0)) frame.px(x, y, fl ? br : dust); }
        for (let i = 0; i < 6; i++) { const s = ((i + 3) * 40503 + t * 9973) >>> 0; frame.px(b.x0 + (s % (b.x1 - b.x0)), b.y0 + ((s >> 8) % (b.y1 - b.y0)), dk); }
      } else if (look === 'tv') {
        const roll = (t * 2) % (b.y1 - b.y0 + 30) - 15;
        for (let y = b.y0; y < b.y1; y += 2) for (let x = b.x0; x < b.x1; x += 2) if (((x + (y >> 1)) & 3) === 0 && ((x * 7 + y * 13 + (t >> 1)) % 5 === 0)) frame.px(x, y, dk);
        for (let y = Math.max(b.y0, b.y0 + roll); y < Math.min(b.y1, b.y0 + roll + 5); y++) for (let x = b.x0; x < b.x1; x += 2) frame.px(x + (y & 1), y, dust);
        for (let i = 0; i < 12; i++) { const s = ((i + 1) * 40503 + t * 7919) >>> 0; frame.px(b.x0 + (s % (b.x1 - b.x0)), b.y0 + ((s >> 8) % (b.y1 - b.y0)), br); }
      } else if (look === 'disco') {
        for (let i = 0; i < 7; i++) {
          const s = ((i + 1) * 40503 + (t >> 3) * 2311) >>> 0, x = b.x0 + (s % (b.x1 - b.x0)), y = b.y0 + ((s >> 8) % (b.y1 - b.y0));
          if (((t >> 2) + i) % 4 === 0) { frame.px(x, y, br); frame.px(x - 1, y, dust); frame.px(x + 1, y, dust); frame.px(x, y - 1, dust); frame.px(x, y + 1, dust); }
        }
      }
    },
    palette(ai, cfg) { const E = eraEntry(ai, cfg); return E && E.palette || null; },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase)) return;
      const E = eraEntry(ai, cfg);
      if (E && E.label) badge(frame, E.label, c32(...(E.color || [28, 24, 16])));
      if (fight.phase === 'intro' && E && E.shout && cfg.eras && fight.round > 1 && (fight.pt >> 3) & 1) callout(frame, E.shout, 128, 122, c32(...(E.color || [28, 24, 16])), fight.COL.black, 2);
    },
  },

  // Rocksteady Reuben's hold. A move with `clinch: true` that lands grabs you: no dodge, no
  // block, no punch, until you mash A / B free (the circuit's get-up mash values, `power` and
  // `decay` scaled by cfg) or he lets go after `timeout` frames; he squeezes every `every` frames
  // for a little damage and a heart. Break free and he's open (his `letGo` step). A clinch is
  // slipped or ducked like any punch: a block can't stop a grab.
  clinch: {
    moveResolved(ai, cfg, m, r) {
      const f = ai.fight;
      if (!m.clinch || r !== 'hit' || f.player.state !== 'hit') return;
      const M = f.circuit.mash;
      f.player.hold({ power: M.power * (cfg.power ?? 1), decay: M.decay * (cfg.decay ?? 1), timeout: cfg.timeout, every: cfg.every, damage: cfg.damage, heart: cfg.heart ?? 1 });
      f.sfx('crunch'); f.event('clinch');
      ai.mods.holdT = 1;
    },
    clinchBroken(ai, cfg, freed) {
      const f = ai.fight;
      ai.mods.holdT = 0;
      if (ai.state !== 'open' && ai.state !== 'recovery') return;
      ai.openStep = null;
      if (freed) {
        ai.startOpen({ open: cfg.letGo.open || 56, anim: cfg.letGo.anim || 'stunned', id: 'letGo', comboLimit: cfg.letGo.comboLimit ?? 4, star: cfg.letGo.star || [0, 24] });
        f.sfx('thud'); ai.mods.freeT = 70;
      } else { ai.resume(24); f.sfx('snort'); }
    },
    update(ai, cfg) {
      const M = ai.mods;
      if (M.freeT > 0) M.freeT--;
      if (ai.fight.player.state !== 'held' && ai.state === 'open' && ai.openStep && ai.openStep.id === 'hold') { ai.openStep = null; ai.resume(20); } // (the fight ended it: a knockdown, the bell)
    },
    render(ai, cfg, frame, fight) {
      const P = fight.player;
      if (P.state === 'held' && P.held && fight.phase === 'fight') {
        panel(frame, 64, 128, 128, 30);
        // (the hold's meter keeps a steady label, like the get-up meter: an input prompt while you can't fight, not a tip; nothing flashes)
        drawText(frame, 'MASH ANY BUTTON', 128 - (textWidth('MASH ANY BUTTON') >> 1), 132, fight.COL.yellow);
        frame.rect(70, 144, 116, 8, fight.COL.barBack);
        frame.rect(71, 145, Math.round(114 * Math.min(1, P.held.mash / 100)), 6, fight.COL.cyan);
      }
      if (ai.mods.freeT > 0 && fight.phase === 'fight' && (ai.mods.freeT >> 2) & 1) callout(frame, 'BROKE FREE!', 128, 56, fight.COL.green, fight.COL.black, 1);
    },
  },

  // Sugarfoot Simone covering up on the ropes: an open step with id cfg.step looks like a wall of
  // gloves. Punch it and the punch bounces, and it costs cfg.drain hearts on top of the block (the
  // ropes are hers), and the burst comes early. Leave her be and she explodes anyway when the step
  // ends: cfg.burst, a flurry (moves queued). Her cover step is a `trap`: the bot doesn't touch it.
  rope: {
    onPlayerPunch(ai, cfg, p, r) {
      if (ai.punch.state !== 'open' || !ai.openStep || ai.openStep.id !== cfg.step || r.knockdown) return;
      const f = ai.fight;
      f.sfx('clang'); f.event('ropeBait'); f.loseHearts(cfg.drain);
      ai.mods.gotT = 50;
      ai.openStep = null; ai.state = 'idle'; ai.t = 0; ai.wait = cfg.gap || 34; ai.move = null; // her guard bounces the punch: give the player time to recover before the burst
      ai.forced.push(...cfg.burst);
      return { result: 'blocked', absorbed: true, rope: true };
    },
    openDone(ai, cfg, step) {
      if (step.id !== cfg.step) return;
      ai.forced.push(...cfg.burst); ai.mods.burstT = 50; ai.fight.sfx(cfg.sfx || 'fanfare');
    },
    update(ai) { const M = ai.mods; if (M.gotT > 0) M.gotT--; if (M.burstT > 0) M.burstT--; },
    render(ai, cfg, frame, fight) {
      if (fight.phase !== 'fight') return;
      const M = ai.mods;
      if (M.gotT > 0 && (M.gotT >> 2) & 1) callout(frame, 'HER ROPES! -HEARTS', 128, 56, fight.COL.pink, fight.COL.black, 1);
      else if (M.burstT > 0 && (M.burstT >> 2) & 1) callout(frame, 'SHE EXPLODES!', 128, 56, fight.COL.yellow, fight.COL.black, 1);
    },
  },

  // Divine Dash (Dash Ascendant): a move with `lunge: -1 | 1` takes him off the screen. During the
  // windup a streak of light burns on that edge of the screen (LEFT streak: he comes in from the
  // left: slip RIGHT); then he flashes in from that side, punches, and slides back to the middle.
  //   cfg: colours, `dist` (how far off-screen he starts), `inFrames` (how quickly he arrives)
  lunge: {
    view(ai, cfg, v) {
      const m = ai.move;
      if (!m || !m.lunge || !['windup', 'active', 'recovery'].includes(ai.state)) return v;
      // the streak is the tell: he's off the screen until the last `inFrames` of the windup, then flies in
      if (ai.state === 'windup') {
        const left = m.windupFrames - ai.moveT;
        return left > cfg.inFrames ? { ...v, hidden: true } : { ...v, dx: v.dx + Math.round(m.lunge * cfg.dist * (left / cfg.inFrames) ** 2) };
      }
      if (ai.state === 'active') return v;
      const len = ai.moveResult === 'hit' ? m.recoveryFrames * 0.5 : m.recoveryFrames, k = Math.max(0, 1 - ai.moveT / Math.max(1, Math.min(len, cfg.back)));
      return { ...v, dx: v.dx + Math.round(m.lunge * cfg.side * k) };
    },
    renderOpp(ai, cfg, frame, fight) {
      const m = ai.move;
      if (fight.phase !== 'fight' || ai.state !== 'windup' || !m || !m.lunge) return;
      const k = Math.min(1, (ai.moveT + 1) / m.windupFrames), left = m.lunge < 0;
      const hi = c32(...(cfg.hi || [31, 31, 24])), mid = c32(...(cfg.mid || [8, 28, 26])), lo = c32(...(cfg.lo || [3, 18, 18]));
      // a beam on the edge that widens as he gathers, flickering
      const w = 3 + Math.round(k * 10), t = fight.clock;
      for (let y = 56; y < 206; y++) {
        const edge = Math.abs(y - 130) / 75;
        for (let i = 0; i < w; i++) {
          const x = left ? i : 255 - i;
          const d = i / w;
          if (bayer(x, y) < (1 - edge * 0.85) * (1 - d * 0.7) * (0.65 + 0.35 * k)) frame.px(x, y, d < 0.3 ? hi : d < 0.65 ? mid : lo);
        }
      }
      if ((t >> 1) & 1) for (let y = 78; y < 184; y += 6) for (let i = 0; i < 6; i++) frame.px(left ? i * 3 + 14 : 241 - i * 3, y + (i & 1), hi);
    },
    render(ai, cfg, frame, fight) {
      const m = ai.move;
      if (fight.phase === 'fight' && ai.state === 'windup' && m && m.lunge && cfg.arrow) {
        // a chevron toward the middle, the way he's coming
        const left = m.lunge < 0, x = left ? 20 : 235;
        for (let i = 0; i < 5; i++) { frame.px(x + (left ? i : -i), 128 - 4 + i, fight.COL.white); frame.px(x + (left ? i : -i), 128 + 4 - i, fight.COL.white); }
      }
    },
  },
};

// --- helpers ------------------------------------------------------------------------

// Does Oro's shield stop a punch right now? (up, and he isn't in an open step, stunned or down)
// (he still carries it: not dropped by a slipped bash, not cracked by an exploit or the scripted moment)
function hasShield(ai) { return ai.mods.shield && !(ai.know && ai.know.flag('shieldBroken')); }
function shieldUp(ai) {
  if (!hasShield(ai)) return false;
  if (['open', 'kd', 'down', 'getup', 'stunned'].includes(ai.state)) return false;
  if (ai.state === 'hit' && ai.stun > 0) return false;
  return true;
}
// Nimbus's vapor now?
function vaporNow(ai, cfg) {
  if (ai.state === 'open' || ai.stun > 0 || ['stunned', 'kd', 'down', 'getup'].includes(ai.state)) return false;
  return (cfg.states || ['idle', 'block', 'taunt']).includes(ai.state);
}
// The move a trail throws: same defenses and tell, the damage scaled, its own id
function echoOf(m, cfg) {
  return { ...m, id: (m.id || 'glow') + '~', name: 'TRAIL: ' + m.name, echo: true, glow: false, damage: Math.round(m.damage * (cfg.damage ?? 0.85)), knockdown: false, feint: false, counterWindow: null, starWindow: null, kdWindow: null, punishStar: null, openAfter: null };
}
// The move he'll start when this step ends: a queued one, a scripted moment's step, an anti-strategy's
// answer, or the next step of his pattern (null: none, or the next step isn't a punch).
function nextMoveId(ai) {
  if (ai.forced.length) return ai.forced[0];
  const K = ai.know;
  if (K && K.script.length) return K.script[0].move || null;
  if (K && K.pending && K.pending.moves.length) return K.pending.moves[0];
  return ai.steps && ai.pattern && ai.stepIdx < ai.steps.length ? ai.steps[ai.stepIdx].move || null : null;
}
// Would echo `tr` (due at tr.at) land within 14 frames of one of his own punches that's already
// under way (a windup, a punch just thrown, or the super's run-up)?
function echoBusy(ai, f, M, tr) {
  if (tr.at - (M.lastImpact ?? -99) < 14) return true;
  if (ai.state === 'active') return true;
  if (ai.state === 'windup' && ai.move) return Math.abs(f.clock + (ai.move.windupFrames - ai.moveT) - tr.at) < 14;
  if (ai.superTaunt || ['backstep', 'advance'].includes(ai.state)) return true; // his super is coming: after it
  return false;
}
function weatherOf(ai, cfg) {
  const r = (ai.fight.stage || ai.fight.round || 1) - 1;
  return cfg.order[((r % cfg.order.length) + cfg.order.length) % cfg.order.length];
}
function eraEntry(ai, cfg) {
  if (!cfg.eras) return { look: cfg.look, label: cfg.label, color: cfg.color };
  const r = ai.fight.stage || ai.fight.round || 1;
  let E = cfg.eras[0];
  for (const x of cfg.eras) if (r >= x.from) E = x;
  return E;
}
function eraLook(ai, cfg) { const E = eraEntry(ai, cfg); return E && E.look; }

// An eighth note, 7 x 10
const NOTE = ['...####', '...#..#', '...#...', '...#...', '...#...', '.###...', '####...', '####...', '.##....'];
function drawNote(frame, x, y, col, ink) {
  NOTE.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') { frame.px(x + i - 3 + 1, y + j + 1, ink); } });
  NOTE.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') frame.px(x + i - 3, y + j, col); });
}

// shared with the Phase B modifiers (ascension2.js)
export { badge, box, IN_RING, bayer, nextMoveId, unstunned };
