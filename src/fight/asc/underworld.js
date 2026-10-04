// The Underworld's gimmicks (spec §18 A6, Phase C: circuits U1-U3). One file for the zone; merged in
// asc/index.js. Same hooks as every modifier (see the top of opponentAI.js).
//
// Underworld I: Ferryman's Shore
//   wet       Drowned Mae     the canvas is wet: every punch of yours that misses makes you slip
//   toll      Toll            takes a star at every bell (hearts if you have none)
//   rhythms   Moros           three masks bob at three rhythms; only one of them tells you a punch is coming
// Underworld II: Ashen Fields
//   ash       Cinder          falling ash veils his body (never his gloves) and gusts clear it now and then
//   burn      Scorch          his burning gloves set you alight: damage over time until you slip a punch
//   firewall  Queen Soot      a wall of fire closes one side of the ring: you can only slip the other way
//   (Kiln's hardening is the anti-strategy `zoneBias`: knowledge only)
// Underworld III: Chain Pits
//   yank      Shackle, Dash in Chains   a chain that reels you to the middle: mash to break free
//   rattle    Link            his chain rattles before his lash: the audio tell comes first, and he stays out of reach
//   arms      Gaoler Brisk    a lock on one of your arms: A or B does nothing for a while
//   bones     Rattle          his bone-rattle tell is sometimes a fake
//   chained   The Jailer      chains hold you to one side: you can only slip the other way (a Star Punch breaks them)

import { drawTextBig, drawText, textWidth, callout } from '../../engine/font.js';
import { c32 } from '../../engine/palette.js';
import { badge, box, IN_RING, bayer, ASCENSION_MODIFIERS } from '../ascension.js';
import { panel } from '../hud.js';

const inFight = (fight) => IN_RING.includes(fight.phase) && fight.phase !== 'intro';
const shout = (frame, fight, text, col, t, y = 56) => { if (fight.phase === 'fight' && t > 0 && (t >> 2) & 1) callout(frame, text, 128, y, col, fight.COL.black, 1); };
const rnd = (seed) => { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

// a fake of a real move: the same tell, cut short at 60%, then a shrug (the circuit fakes' shape: opponentAI makeFake)
function fakeOf(m, rest = 30) {
  const w = Math.max(6, Math.round(m.windupFrames * 0.6)), hold = m.animation.windupHold || 0;
  return {
    ...m, name: m.name + ' (FAKE)', feint: true, fake: true,
    windupFrames: w, activeFrames: 0, recoveryFrames: rest,
    counterWindow: [2, w - 1], starWindow: null, kdWindow: null, knockdown: false, cancels: 0, openAfter: null,
    animation: { ...m.animation, windupHold: Math.min(hold, w - 2), recovery: ['idle1'] },
    sfx: m.sfx && m.sfx.tell ? { tell: m.sfx.tell } : {},
  };
}

export const UNDERWORLD_MODIFIERS = {
  // ------------------------------------------------------------------ Underworld I --

  // Drowned Mae. The canvas is wet: a punch of yours that does not land (his guard, thin air) makes you
  // slip and stagger for cfg.frames: no dodge, no block, no punch until your feet are back. A punch that
  // lands, a counter, a Star Punch that hits: no slip. (Punches thrown while he backs off don't count.)
  wet: {
    init(ai) { ai.mods.slipT = 0; },
    roundStart(ai) { ai.mods.slipT = 0; },
    onPlayerPunch(ai, cfg, p, r) {
      const f = ai.fight;
      if (f.phase !== 'fight' || r.result === 'hit' || r.far) return;
      f.player.stumble(cfg.frames);
      ai.mods.slipT = 40; ai.mods.puddleT = 30; ai.mods.puddleX = p.side === 'L' ? -1 : 1;
      f.sfx('splash'); f.event('slipped');
    },
    update(ai) { const M = ai.mods; if (M.slipT > 0) M.slipT--; if (M.puddleT > 0) M.puddleT--; },
    renderOpp(ai, cfg, frame, fight) {
      if (!inFight(fight)) return;
      const t = fight.clock, hi = c32(...(cfg.hi || [20, 27, 31])), lo = c32(...(cfg.lo || [8, 15, 24]));
      // puddles on the canvas, ripples spreading in them
      for (const [px, py, pr] of cfg.puddles) {
        const k = ((t + px * 3) % 90) / 90;
        for (const rr of [pr * 0.35 + k * pr * 0.5, pr * 0.2 + ((k + 0.5) % 1) * pr * 0.55]) {
          for (let a = 0; a < 18; a++) { const th = (a / 18) * Math.PI * 2; frame.px(Math.round(px + Math.cos(th) * rr * 1.5), Math.round(py + Math.sin(th) * rr * 0.4), a & 1 ? hi : lo); }
        }
      }
      // where you slipped: a splash
      const M = ai.mods;
      if (M.puddleT > 0) {
        const sx = 128 + (M.puddleX || 1) * 10, sy = 214;
        for (let i = 0; i < 8; i++) { const th = (i / 8) * Math.PI; const k = 1 - M.puddleT / 30; frame.px(Math.round(sx + Math.cos(th) * (4 + k * 10)), Math.round(sy - Math.sin(th) * (2 + k * 12)), i & 1 ? hi : lo); }
      }
    },
    render(ai, cfg, frame, fight) {
      if (!inFight(fight)) return;
      badge(frame, 'WET CANVAS', fight.COL.cyan);
      shout(frame, fight, 'YOU SLIPPED!', fight.COL.cyan, ai.mods.slipT);
    },
  },

  // Toll. At every bell he takes his toll: a star if you have one, else cfg.hearts hearts. (You start
  // every round with the stars you earned in the last one, so the first bell is always the hearts.)
  toll: {
    init(ai) { ai.mods.tollT = 0; ai.mods.tollWhat = null; },
    fightStart(ai, cfg) {
      const f = ai.fight, P = f.player, M = ai.mods;
      if (P.stars > 0) {
        P.stars--; f.sfx('starLost'); f.effects.push({ kind: 'lostStar', x: 20, y: 26, t: 0, life: 40 });
        M.tollWhat = 'STAR'; f.event('tolledStar');
      } else { f.loseHearts(cfg.hearts); f.sfx('heartOut'); M.tollWhat = 'HEARTS'; }
      M.tollT = 80; f.event('tolled');
    },
    update(ai) { if (ai.mods.tollT > 0) ai.mods.tollT--; },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (fight.phase === 'fight' && M.tollT > 0 && (M.tollT >> 2) & 1) callout(frame, M.tollWhat === 'STAR' ? 'TOLL: -1 STAR' : `TOLL: -${cfg.hearts} HEARTS`, 128, 70, fight.COL.yellow, fight.COL.black, 1);
    },
  },

  // Moros. Three masks float over his shoulders and bob at three rhythms (cfg.masks: x, y, period, kind).
  // Every windup he starts, real or feint, dips ONE of them (a hard jerk down, the eyes flaring): a real
  // punch dips the true mask, a feint dips a false one. The true mask is a different one each round
  // (cfg.real, by round). Feints are `feint` moves of his own: they never hurt and give the player the same
  // shrug a fake does. A counter on a false mask's windup cracks it (his exploit).
  rhythms: {
    init(ai) { ai.mods.dip = null; ai.mods.lastFalse = -1; },
    roundStart(ai) { ai.mods.dip = null; },
    moveStart(ai, cfg, m) {
      if (m.call) return;
      const M = ai.mods, real = realMask(ai, cfg);
      let idx = real;
      if (m.feint) { // a false mask: never the same one twice running
        const others = [0, 1, 2].filter((i) => i !== real && i !== M.lastFalse);
        idx = others[Math.floor(Math.random() * others.length)];
        M.lastFalse = idx;
      }
      M.dip = { idx, t: 0, real: idx === real };
      ai.fight.sfx(cfg.sfx || 'maskClack');
    },
    update(ai) { const D = ai.mods.dip; if (D) { D.t++; if (D.t > 40) ai.mods.dip = null; } },
    renderOpp(ai, cfg, frame, fight) {
      if (!inFight(fight) || fight.phase === 'oppDown') return;
      const v = ai.view();
      if (v.hidden) return;
      const t = fight.clock, D = ai.mods.dip, real = realMask(ai, cfg);
      cfg.masks.forEach((mk, i) => {
        let bob = Math.round(Math.sin((t / mk.period) * Math.PI * 2) * 3);
        let flare = false;
        if (D && D.idx === i) { const k = Math.min(1, D.t / 6); bob = Math.round(k * 12 * (D.t < 24 ? 1 : 1 - (D.t - 24) / 16)); flare = D.t < 26; }
        const x = fight.OPP_X + v.dx + mk.x, y = fight.OPP_Y + v.dy + mk.y + bob;
        drawMask(frame, x, y, mk.kind, flare, i === real && cfg.tell);
      });
    },
  },

  // ------------------------------------------------------------------ Underworld II --

  // Cinder. Ash falls on the ring and hangs round him in a haze: a dithered veil over his box that thickens
  // toward the middle of him (cfg.density at its densest, never enough to lose the shape of a windup). Every
  // cfg.gustEvery frames a gust clears it for cfg.gustLen. Flakes fall over the whole ring. His crackle (a sound
  // on every windup) is the tell that never gets veiled.
  ash: {
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods;
      if (f.phase === 'fight') M.gust = (f.clock % cfg.gustEvery) < cfg.gustLen;
      if (M.gust && !M.gustSaid && f.phase === 'fight') { M.gustSaid = true; M.gustT = 40; f.sfx('gust'); }
      if (!M.gust) M.gustSaid = false;
      if (M.gustT > 0) M.gustT--;
    },
    renderOpp(ai, cfg, frame, fight) {
      if (!inFight(fight) || fight.phase === 'oppDown') return;
      const v = ai.view();
      if (v.hidden) return;
      const b = box(fight, v), t = fight.clock, M = ai.mods, col = c32(...(cfg.col || [12, 11, 11])), lite = c32(...(cfg.lite || [20, 19, 18]));
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, hw = (b.x1 - b.x0) / 2, hh = (b.y1 - b.y0) / 2;
      // a move flagged `clear` thins the haze in the second half of its windup (Cinder's pyre)
      const lifting = ai.state === 'windup' && ai.move && ai.move.clear && ai.moveT * 2 >= ai.move.windupFrames;
      const base = cfg.density * (M.gust ? 0.15 : lifting ? 0.12 : 1);
      for (let y = b.y0; y < b.y1; y++) for (let x = b.x0; x < b.x1; x++) {
        const d = ((x - cx) / hw) ** 2 + ((y - cy) / hh) ** 2;
        if (d > 1) continue;
        // patchy, thickest round the middle of him, drifting: a cloud, not a disc
        const cloud = 0.62 + 0.38 * Math.sin((x + t * 0.5) * 0.11 + y * 0.07) * Math.sin((y - t * 0.35) * 0.13 - x * 0.05);
        const dens = base * (1 - d) ** 0.9 * cloud;
        if (bayer(x + (t >> 1), y - (t >> 2)) < dens) frame.px(x, y, ((x + y + (t >> 3)) & 7) === 0 ? lite : col);
      }
    },
    postScene(ai, cfg, frame, fight) {
      if (!inFight(fight) || fight.phase === 'intro') return;
      const t = fight.clock, col = c32(...(cfg.flake || [17, 16, 15])), ember = c32(28, 12, 3), r = rnd(9);
      for (let i = 0; i < cfg.flakes; i++) {
        const sx = r() * 256, sp = 0.25 + r() * 0.6, dr = (r() - 0.3) * 0.4;
        const y = 46 + ((r() * 200 + t * sp) % 178), x = ((sx + Math.sin((t + i * 13) / 40) * 6 + t * dr) % 256 + 256) % 256;
        frame.px(Math.round(x), Math.round(y), i % 7 === 0 ? ember : col);
        if (i % 5 === 0) frame.px(Math.round(x) + 1, Math.round(y), col);
      }
    },
    render(ai, cfg, frame, fight) {
      if (!inFight(fight)) return;
      badge(frame, ai.mods.gust ? 'THE ASH CLEARS' : 'ASH FALLING', ai.mods.gust ? fight.COL.yellow : fight.COL.grey);
    },
  },

  // Scorch. His gloves burn: a punch of his that lands (or that you block) sets you alight. You take cfg.dmg
  // damage every cfg.every frames, at most cfg.cap in all, until you slip or duck one of his punches (then
  // you're out) or the round ends. It never takes your last point of health, or your last heart.
  burn: {
    init(ai) { ai.mods.burning = false; ai.mods.burnT = 0; ai.mods.burnDealt = 0; },
    roundStart(ai) { douse(ai, false); },
    onKnockdown(ai) { douse(ai, false); },
    moveResolved(ai, cfg, m, r) {
      const f = ai.fight, M = ai.mods;
      if (m.echo || m.fake || !m.damage || m.cool) return;
      if (r === 'hit' || r === 'blocked') {
        if (!M.burning) { M.burning = true; M.burnT = 0; M.burnDealt = 0; M.igniteT = 50; f.sfx('ignite'); f.event('ignited'); }
      } else if ((r === 'dodged' || r === 'ducked') && M.burning) douse(ai, true);
    },
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods, P = f.player;
      if (M.igniteT > 0) M.igniteT--;
      if (M.doused > 0) M.doused--;
      if (!M.burning) return;
      if (f.phase !== 'fight') { if (['between', 'roundEnd', 'ko'].includes(f.phase)) douse(ai, false); return; }
      if (M.burnDealt >= cfg.cap || P.state === 'down' || P.state === 'getup') return;
      if (++M.burnT % cfg.every === 0) {
        f.sfx('burn'); f.effects.push({ kind: 'spark', x: 128 + (Math.random() < 0.5 ? -8 : 8), y: 170, t: 0, life: 8 });
        M.burnDealt += cfg.dmg;
        if (!f.opts.invincible && !f.opts.infiniteHealth) P.health = Math.max(1, P.health - cfg.dmg);
        if (cfg.hearts && M.burnT % (cfg.every * 3) === 0) f.loseHearts(cfg.hearts);
      }
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods, t = fight.clock;
      if (M.burning && inFight(fight)) {
        // flames licking up the fighter's own body, and the badge
        const hi = c32(31, 28, 10), mid = c32(30, 14, 3), lo = c32(20, 5, 2);
        for (let i = 0; i < 22; i++) {
          const s = ((i + 1) * 40503 + (t >> 1) * 9973) >>> 0, x = 128 - 16 + (s % 33), h = 5 + ((s >> 8) % 12), y0 = 216 - ((s >> 4) % 70);
          for (let j = 0; j < h; j++) frame.px(x + (((s >> 3) + j) & 1) - 1, y0 - j, j < h * 0.35 ? hi : j < h * 0.7 ? mid : lo);
        }
        badge(frame, M.burnDealt >= cfg.cap ? 'SMOLDERING' : 'BURNING!', (t >> 3) & 1 ? fight.COL.orange : fight.COL.yellow);
      }
      if (fight.phase === 'fight' && M.igniteT > 0 && (M.igniteT >> 2) & 1) callout(frame, 'YOU\'RE ON FIRE!', 128, 56, fight.COL.orange, fight.COL.black, 1);
      else if (fight.phase === 'fight' && M.doused > 0 && (M.doused >> 2) & 1) callout(frame, 'DOUSED!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
    },
  },

  // Kiln's glaze: the zone his `zoneBias` anti-strategy (cfg.anti) has hardened shows as a bright,
  // hot-white glaze over his head or his body, with a badge. It's knowledge only: the punches that bounce
  // are the anti-strategy's; this just lets you see it.
  glaze: {
    renderOpp(ai, cfg, frame, fight) {
      const G = glazeOf(ai, cfg);
      if (!G || !inFight(fight) || fight.phase === 'oppDown') return;
      const v = ai.view(), b = box(fight, v), t = fight.clock;
      const y0 = G.zone === 'head' ? b.y0 + 4 : b.y0 + 62, y1 = G.zone === 'head' ? b.y0 + 62 : b.y1 - 40;
      const hot = c32(31, 30, 22), glow = c32(30, 16, 4);
      for (let y = y0; y < y1; y++) for (let x = b.x0 + 14; x < b.x1 - 14; x++) if (bayer(x, y + (t >> 3)) < 0.22) frame.px(x, y, ((x * 3 + y + (t >> 2)) & 5) === 0 ? hot : glow);
    },
    render(ai, cfg, frame, fight) {
      const G = glazeOf(ai, cfg);
      if (G && inFight(fight)) badge(frame, G.zone === 'head' ? 'HEAD HARDENED' : 'BODY HARDENED', fight.COL.orange);
    },
  },

  // Queen Soot. A wall of fire closes off one side of the ring for cfg.hold frames: you can't slip toward it (a
  // clink and nothing), the other way is free. It comes every cfg.every frames (the first after cfg.first),
  // on alternating sides from a random start, and cracks glow on that side for cfg.warn frames first. Her
  // punches all have a defense that isn't the burning side (a hook can be ducked, an uppercut slipped the
  // other way). A Star Punch that lands while it burns puts it out (her exploit `cfg.exploit`: "snuffed out").
  firewall: {
    init(ai, cfg) { const M = ai.mods; M.wall = 0; M.warn = 0; M.wallT = 0; M.next = cfg.first; M.side = Math.random() < 0.5 ? -1 : 1; },
    roundStart(ai, cfg) { const M = ai.mods; M.wall = 0; M.warn = 0; M.wallT = 0; M.next = cfg.first; ai.fight.player.noDodge = 0; },
    onKnockdown(ai) { snuff(ai, false); },
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods, P = f.player;
      if (f.phase !== 'fight') { if (M.wall || M.warn) { M.wall = 0; M.warn = 0; M.next = cfg.first; } P.noDodge = 0; return; }
      if (M.wall) {
        M.wallT--;
        P.noDodge = M.wall;
        const fired = (ai.know && ai.know.fired[cfg.exploit]) || 0; // the exploit that puts it out: a Star Punch while it burns
        if (fired > (M.snuffN || 0)) { M.snuffN = fired; snuff(ai, true); }
        else if (M.wallT <= 0) snuff(ai, false);
      } else if (M.warn) {
        if (--M.warn <= 0) { M.wall = M.side; M.wallT = cfg.hold; P.noDodge = M.wall; f.sfx('flame'); f.event('wall'); f.shake = 6; }
      } else if (--M.next <= 0) { M.side = -M.side; M.warn = cfg.warn; f.sfx('crackle'); }
      if (M.snuffT > 0) M.snuffT--;
    },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods, t = fight.clock;
      if (!inFight(fight) || fight.phase === 'intro') return;
      const side = M.wall || (M.warn ? M.side : 0);
      if (!side) return;
      const hi = c32(31, 30, 14), mid = c32(31, 17, 3), lo = c32(22, 6, 2), dk = c32(9, 2, 2);
      const x0 = side < 0 ? 0 : 256 - 40, warn = !M.wall;
      if (warn) {
        // cracks in the floor glowing on that side, sparks jumping
        for (let i = 0; i < 26; i++) { const s = ((i + 1) * 40503) >>> 0, x = x0 + 4 + (s % 26), y = 130 + ((s >> 8) % 88); if ((t + i * 3) % 12 < 7) { frame.px(x, y, mid); frame.px(x + 1, y, lo); } }
        return;
      }
      for (let x = 0; x < 40; x++) {
        const X = x0 + x, edge = side < 0 ? 1 - x / 40 : x / 40; // the fire is tallest against the ring's edge
        const n = Math.sin((X + t * 0.7) * 0.31) + Math.sin((X * 1.7 - t * 0.53)) * 0.6;
        const h = Math.round((100 + 70 * edge) * (0.7 + 0.2 * n));
        for (let y = 222; y > 222 - h; y--) {
          const k = (222 - y) / h;
          if (bayer(X + (t >> 1), y) < (1 - k * 0.8) * (0.5 + 0.5 * edge)) frame.px(X, y, k < 0.25 ? hi : k < 0.55 ? mid : k < 0.85 ? lo : dk);
        }
      }
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!inFight(fight) || fight.phase === 'intro') return;
      if (M.wall) {
        badge(frame, M.wall < 0 ? 'FIRE WALL: LEFT' : 'FIRE WALL: RIGHT', (fight.clock >> 3) & 1 ? fight.COL.orange : fight.COL.yellow);
        // a chevron pointing the free way
        const x = M.wall < 0 ? 44 : 211, dir = M.wall < 0 ? 1 : -1;
        for (let i = 0; i < 5; i++) { frame.px(x + dir * i, 128 - 4 + i, fight.COL.white); frame.px(x + dir * i, 128 + 4 - i, fight.COL.white); }
      } else if (M.warn) badge(frame, 'THE GROUND CRACKS...', (fight.clock >> 2) & 1 ? fight.COL.red : fight.COL.orange);
      else if (M.snuffT > 0) badge(frame, 'SNUFFED!', fight.COL.cyan);
      if (fight.phase === 'fight' && M.snuffT > 20 && (M.snuffT >> 2) & 1) callout(frame, 'SNUFFED OUT!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
    },
  },

  // ------------------------------------------------------------------ Underworld III --

  // Shackle's chain and Dash's chain hook: a clinch (Reuben's: the move's `clinch: true`) that reels you in. The
  // same rules: no dodge, block or punch until you mash A / B free (or he lets go); a squeeze now and then; break
  // free and he's open (`letGo`). On top: the chain itself, drawn from his post to his ankle all the time (cfg.post:
  // where it's fixed, cfg.ankle: where it ends on him), and from his glove to you while you're held.
  yank: {
    ...ASCENSION_MODIFIERS.clinch,
    renderOpp(ai, cfg, frame, fight) {
      if (!inFight(fight) || fight.phase === 'intro' || fight.phase === 'oppDown') return;
      const v = ai.view();
      if (v.hidden) return;
      const t = fight.clock;
      if (cfg.post) drawChain(frame, fight.OPP_X + cfg.post[0], fight.OPP_Y + cfg.post[1], fight.OPP_X + v.dx + cfg.ankle[0], fight.OPP_Y + v.dy + cfg.ankle[1], t, cfg.slack ?? 6);
      const P = fight.player;
      if (P.state === 'held' && P.held) drawChain(frame, fight.OPP_X + v.dx + (cfg.hand ? cfg.hand[0] : 20), fight.OPP_Y + v.dy + (cfg.hand ? cfg.hand[1] : -70), 128, 192, t, 3, 1);
    },
  },

  // Link. He lashes from out of reach: while he waits, his chain out to his side, every punch of yours at him
  // just whiffs on the air (a counter into a lash's windup, a punch after you slip a lash, or an opening still
  // work). Each move's tell is a run of chain rattle FIRST (its sound is the pitch of the lash: high for the head, low
  // for the body) and the pose only in the last few frames (the move data: idle for the first frames of the windup).
  rattle: {
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result === 'hit' || r.result === 'whiff') return;
      if (!['idle', 'block'].includes(ai.punch.state) || ai.punch.stunned || p.star) return;
      return { result: 'whiff', far: true, reach: true };
    },
    view(ai, cfg, v) {
      if (['idle', 'block'].includes(ai.state)) return { ...v, dy: v.dy - (cfg.back || 6), lift: (v.lift || 0) + (cfg.back || 6) };
      return v;
    },
    render(ai, cfg, frame, fight) {
      if (!inFight(fight)) return;
      const m = ai.move;
      if (fight.phase === 'fight' && ai.state === 'windup' && m && m.rattle && ai.moveT < (m.quiet || 6)) {
        // the rattle, shown: a little run of sound marks either side of the screen (for anyone playing with the sound off)
        const y = m.note === 'low' ? 150 : 112, col = m.note === 'low' ? fight.COL.orange : fight.COL.cyan;
        for (const x of [8, 240]) for (let i = 0; i < 3; i++) frame.rect(x + (i & 1), y + i * 4, 4, 2, col);
      }
    },
  },

  // Gaoler Brisk. A move with `lock: true` that lands puts a lock on one of your arms for cfg.frames: the A
  // button (right hand) or B (left) does nothing. It's a grab: slip it or duck it (a block can't stop a hand
  // on your wrist). The other arm still works (and so do dodges, blocks, ducks and Star Punches).
  arms: {
    init(ai) { ai.mods.lockedT = 0; },
    roundStart(ai) { const P = ai.fight.player; P.lock = null; P.lockT = 0; },
    onKnockdown(ai) { const P = ai.fight.player; P.lock = null; P.lockT = 0; },
    moveResolved(ai, cfg, m, r) {
      if (!m.lock || r !== 'hit') return;
      const f = ai.fight, P = f.player;
      P.lock = Math.random() < 0.5 ? 'a' : 'b'; P.lockT = cfg.frames; ai.mods.lockedT = 70;
      f.sfx('lockClick'); f.event('locked'); f.shake = 5;
    },
    update(ai) {
      const M = ai.mods, f = ai.fight;
      if (M.lockedT > 0) M.lockedT--;
      if (!['fight', 'oppDown', 'playerDown'].includes(f.phase) && f.player.lock) { f.player.lock = null; f.player.lockT = 0; }
    },
    renderOpp(ai, cfg, frame, fight) {
      const P = fight.player;
      if (!P.lock || !inFight(fight) || fight.phase === 'intro') return;
      // a manacle on the locked arm: A is the viewer's right glove, B the left
      const x = 128 + (P.lock === 'a' ? 22 : -22), y = 176, t = fight.clock;
      drawChain(frame, x, y - 6, x + (P.lock === 'a' ? 8 : -8), 44, t, 2, 1);
      const iron = c32(14, 15, 19), hi = c32(24, 25, 28), dk = c32(4, 4, 7);
      frame.rect(x - 5, y - 3, 11, 7, dk); frame.rect(x - 4, y - 2, 9, 5, iron); frame.rect(x - 4, y - 2, 9, 1, hi); frame.rect(x - 1, y, 3, 2, dk);
    },
    render(ai, cfg, frame, fight) {
      const P = fight.player;
      if (!inFight(fight)) return;
      if (P.lock) badge(frame, `${P.lock.toUpperCase()} LOCKED  ${Math.ceil(P.lockT / 24)}`, (fight.clock >> 3) & 1 ? fight.COL.red : fight.COL.yellow);
      if (fight.phase === 'fight' && ai.mods.lockedT > 0 && (ai.mods.lockedT >> 2) & 1) callout(frame, `${P.lock ? P.lock.toUpperCase() : ''} ARM LOCKED!`, 128, 56, fight.COL.red, fight.COL.black, 1);
    },
  },

  // Rattle. Every move of his with `rattle: true` is a chance: with probability cfg.p the bone-rattle is a fake
  // (the circuits' fake: the same tell, cut short at 60%, then a shrug). A real punch ends on a CLACK (its
  // swing sound); a fake never does. Fakes never hurt (a shrug is an opening).
  bones: {
    modifyMove(ai, cfg, m) {
      if (!m.rattle || m.feint || m.call || m.noFake || ai.fight.phase !== 'fight' || Math.random() >= cfg.p) return m;
      return fakeOf(m, cfg.rest || 30);
    },
  },

  // The Jailer. His `call` move (cfg.call) throws chains: when it finishes, the shackle closes on one arm and for
  // cfg.frames you can't slip toward that side. Chains break after cfg.frames, when he's knocked down, or when
  // a STAR PUNCH lands on him (the exploit "broken chains", fired by hand). His moves each have a defense that
  // isn't the chained side. Counter the call itself and the chains never close.
  chained: {
    init(ai) { const M = ai.mods; M.chain = 0; M.chainT = 0; M.chainSide = Math.random() < 0.5 ? -1 : 1; },
    roundStart(ai) { unchain(ai, false); },
    onKnockdown(ai) { unchain(ai, false); },
    onPlayerPunch(ai, cfg, p, r) {
      if (p.star && r.result === 'hit' && ai.mods.chain) { ai.mods.breakNext = true; }
    },
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods, P = f.player;
      if (M.breakNext) { M.breakNext = false; unchain(ai, true); return; }
      if (M.news > 0) M.news--;
      if (f.phase !== 'fight') { if (M.chain) unchain(ai, false); return; }
      if (ai.moveId === cfg.call && ai.state === 'recovery' && ai.moveResult === 'feint' && M.called !== ai.move) {
        M.called = ai.move; M.chainSide = -M.chainSide; M.chain = M.chainSide; M.chainT = cfg.frames; M.news = 80;
        f.sfx('chainSnap'); f.event('chained'); f.shake = 6;
      }
      if (M.chain) {
        P.noDodge = M.chain;
        if (--M.chainT <= 0) unchain(ai, false);
      }
    },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!M.chain || !inFight(fight) || fight.phase === 'intro') return;
      // a chain from the ceiling to a shackle on the chained arm
      const x = 128 + M.chain * 30, y = 178, t = fight.clock;
      drawChain(frame, x + M.chain * 10, 44, x, y - 6, t, 2, 1);
      const iron = c32(14, 15, 19), hi = c32(26, 27, 30), dk = c32(4, 4, 7);
      frame.rect(x - 6, y - 3, 13, 8, dk); frame.rect(x - 5, y - 2, 11, 6, iron); frame.rect(x - 5, y - 2, 11, 1, hi); frame.rect(x - 1, y, 3, 2, dk);
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!inFight(fight)) return;
      if (M.chain) badge(frame, M.chain < 0 ? 'CHAINED: LEFT' : 'CHAINED: RIGHT', (fight.clock >> 3) & 1 ? fight.COL.red : fight.COL.yellow);
      if (fight.phase === 'fight' && M.news > 0 && (M.news >> 2) & 1) callout(frame, M.chain ? 'YOU\'RE CHAINED!' : 'CHAINS BROKEN!', 128, 56, M.chain ? fight.COL.red : fight.COL.green, fight.COL.black, 1);
    },
  },
};

// --- helpers ---------------------------------------------------------------------------------------

// put the burn out (a successful dodge, or the round ended): `slip` says why
function douse(ai, slip) {
  const M = ai.mods;
  if (M.burning && slip) { M.doused = 40; ai.fight.sfx('hiss'); ai.fight.event('doused'); }
  M.burning = false; M.burnT = 0; M.burnDealt = 0; M.igniteT = 0;
}
// Kiln's hardened zone, if the anti-strategy has one up
function glazeOf(ai, cfg) {
  const st = ai.know && ai.know.st[cfg.anti];
  return st && st.guard && ai.fight.clock <= st.guard.until ? st.guard : null;
}
// the fire wall goes out
function snuff(ai, byExploit) {
  const M = ai.mods, P = ai.fight.player;
  const was = M.wall;
  M.wall = 0; M.warn = 0; M.wallT = 0; M.next = ai.d.special.find((s) => s.type === 'firewall').every; P.noDodge = 0;
  if (was && byExploit) { M.snuffT = 60; ai.fight.sfx('hiss'); }
}
// the chains open (or break: a Star Punch, and an exploit)
function unchain(ai, broke) {
  const M = ai.mods, P = ai.fight.player, was = M.chain;
  M.chain = 0; M.chainT = 0; P.noDodge = 0;
  if (was && broke) { M.news = 70; ai.fight.sfx('chainBreak'); ai.fight.shake = 8; ai.fight.event('chainBreak'); if (ai.know) ai.know.custom('brokenChains'); }
}
// a hanging chain from (x0, y0) to (x1, y1): links alternate flat and edge-on, sagging by `sag`
function drawChain(frame, x0, y0, x1, y1, t, sag = 4, sway = 0) {
  const n = Math.max(6, Math.round(Math.hypot(x1 - x0, y1 - y0) / 4)), a = c32(22, 23, 27), b = c32(9, 9, 13), dk = c32(2, 2, 4);
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = Math.round(x0 + (x1 - x0) * u + Math.sin(u * 6 + t * 0.15) * sway), y = Math.round(y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag);
    if (i & 1) { frame.rect(x - 1, y, 3, 2, dk); frame.px(x, y, a); } else { frame.rect(x, y - 1, 2, 3, dk); frame.px(x, y, b); frame.px(x, y - 1, a); }
  }
}

// Moros's true mask this round
function realMask(ai, cfg) { const r = (ai.fight.stage || ai.fight.round || 1) - 1; return cfg.real[((r % cfg.real.length) + cfg.real.length) % cfg.real.length]; }

// A floating mask, 11 x 13: a pale oval with eye slits, a mouth and a painted mark (weep / grin / rage)
const MASK_COL = { weep: [[24, 28, 31], [14, 19, 27], [6, 9, 17]], grin: [[30, 29, 25], [22, 21, 17], [11, 10, 8]], rage: [[26, 12, 10], [16, 5, 5], [8, 2, 3]] };
function drawMask(frame, x, y, kind, flare, marked) {
  const [hi, mid, dk] = MASK_COL[kind].map((c) => c32(...c)), ink = c32(2, 1, 4), glow = flare ? c32(31, 8, 4) : c32(28, 26, 12);
  for (let j = -6; j <= 6; j++) {
    const w = Math.round(Math.sqrt(Math.max(0, 1 - (j / 6.6) ** 2)) * 5.4);
    frame.rect(x - w - 1, y + j, w * 2 + 3, 1, ink);
    frame.rect(x - w, y + j, w * 2 + 1, 1, j < -2 ? hi : j < 3 ? mid : dk);
  }
  // eye slits (glowing when it dips) and the mark
  for (const s of [-1, 1]) { frame.rect(x + s * 3 - 1, y - 2, 3, 2, ink); frame.px(x + s * 3, y - 2, glow); if (flare) frame.px(x + s * 3, y - 3, glow); }
  if (kind === 'weep') { frame.px(x - 3, y, glow); frame.px(x - 3, y + 1, hi); frame.px(x - 3, y + 2, hi); frame.px(x + 3, y, ink); frame.rect(x - 2, y + 4, 5, 1, ink); }
  else if (kind === 'grin') { frame.rect(x - 4, y + 3, 9, 1, ink); for (const dx of [-3, -1, 1, 3]) frame.px(x + dx, y + 4, ink); }
  else { for (let i = 0; i < 3; i++) { frame.px(x - 5 + i, y - 4 - (i >> 1), ink); frame.px(x + 5 - i, y - 4 - (i >> 1), ink); } frame.rect(x - 3, y + 4, 7, 1, ink); }
  if (marked) { frame.px(x, y - 8, glow); frame.px(x - 1, y - 9, glow); frame.px(x + 1, y - 9, glow); }
}

export { fakeOf, rnd, shout, inFight, bayer, drawText, textWidth, panel };
