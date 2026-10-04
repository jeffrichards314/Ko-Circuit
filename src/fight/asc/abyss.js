// The lower Underworld's gimmicks (spec §18 A6, Phase D: circuits U4-U6, Dash #8 and Vorgath). One file for the
// zone; merged in asc/index.js. Same hooks as every modifier (see the top of opponentAI.js).
//
// Underworld IV: Hall of the Fallen (Tempo and Adapt are the World and Grand Prix champions' own modifiers, rerun tighter)
//   counterback  Fallen Brody       every counter you land is answered: when his stun runs out he fires the Backlash
//   blackout     Fallen Midnight    the lights go out at the bell and stay out: only his eyes (and his sounds) show
//   thief        Fallen Karver, Vorgath   a move flagged `steal` takes a star when it lands
// Underworld V: The Furnace
//   furnace      (the circuit)      a heat meter that climbs all round and drains your hearts when it's high
//   coal         Stoker             his shovel call feeds the furnace: the meter jumps
//   brandMark    Brand              the iron's straight marks you: the next hit you take while marked is a critical
//   molten       Slag               hitting him costs hearts, unless he has just thrown a punch (then he has cooled)
//   overheat     Crucible           the meter maxing out overheats him: the screen whites out, silhouettes only
// Underworld VI: Abyss Gate
//   gate         Nox                his guard is a portcullis that only rises after you slip three of his attacks in a row
//   shadow       Umbra              his shadow attacks by itself: a dark copy of him on the canvas, a tell, a strike
//   hands        Grasp              hands reach up through the canvas at your feet: watch the floor
//   reversed     Lament             his cries are backwards: a loud one is a fake, a quiet one is real
// Vorgath, and Dash's step into the dark
//   gloom        Vorgath            near-darkness (eyes and crown), a piece of the floor gone each phase, the crumbling
//   shadowstep   Dash #8            a punch that would land makes him step into shadow, and he comes back from the other side

import { drawTextBig, drawText, textWidth, callout } from '../../engine/font.js';
import { c32 } from '../../engine/palette.js';
import { badge, box, IN_RING, bayer, nextMoveId, ASCENSION_MODIFIERS } from '../ascension.js';
import { panel } from '../hud.js';
import { fakeOf, shout, inFight } from './underworld.js';

const formOf = (fight) => fight.formOverride || fight.stage || fight.round || 1; // (ZERO's true form wears one form at a time: `formOverride`)
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const loseStar = (f, n = 1) => {
  const P = f.player; let took = 0;
  while (n-- > 0 && P.stars > 0) { P.stars--; took++; f.effects.push({ kind: 'lostStar', x: 20 + took * 10, y: 26, t: 0, life: 40 }); }
  if (took) f.sfx('starLost');
  return took;
};

// keep his own punches clear of every strike still to land (impacts closer than `gap` frames can't both be defended:
// a slip needs 13 frames to chain): his next pattern step, a queued answer and a guard counter all wait
function holdClear(ai, f, ats, gap = 15) {
  const clash = (id) => {
    const nm = id && ai.d.moves[id];
    if (!nm || nm.call) return 0;
    const impact = f.clock + 1 + nm.windupFrames;
    let d = 0;
    for (const at of ats) if (Math.abs(impact - at) < gap) d = Math.max(d, at + gap - impact + 1);
    return d;
  };
  if (ai.wait <= 1) ai.wait = Math.max(ai.wait, clash(nextMoveId(ai)));
  const K = ai.know;
  if (K && K.pending && K.pending.delay <= 0 && !ai.forced.length) K.pending.delay = Math.max(K.pending.delay, clash(K.pending.moves[0]));
  if (ai.guardQ && ai.guardQ.delay <= 1) ai.guardQ.delay = Math.max(ai.guardQ.delay, clash(ai.guardQ.id));
}
// is one of his own punches close enough to a strike time to spoil it?
function busy(ai, f, at, gap = 15) {
  if (ai.state === 'active') return true;
  if (ai.state === 'windup' && ai.move) return Math.abs(f.clock + (ai.move.windupFrames - ai.moveT) - at) < gap;
  if (ai.superTaunt || ['backstep', 'advance'].includes(ai.state)) return true; // his super is coming: after it
  return false;
}

// Attacks that come from somewhere other than his gloves (Umbra's shadow, Grasp's hands): scheduled by the modifier itself, with a
// tell of cfg.tell frames, resolved through Fight.opponentAttack like his own punches, and read by the perfect-play bot through
// `threats`. `pick(ai, cfg, M)` -> { id, side } picks the next; `draw(...)` is the modifier's own picture.
function strikes(kind) {
  return {
    init(ai, cfg) { const M = ai.mods; M.strikes = []; M.sNext = cfg.first ?? 240; M.sN = 0; M.sLast = -999; },
    roundStart(ai, cfg) { const M = ai.mods; M.strikes = []; M.sNext = cfg.first ?? 240; },
    onKnockdown(ai) { ai.mods.strikes = []; },
    moveResolved(ai) { ai.mods.lastOwn = ai.fight.clock; },
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods;
      if (M.newsT > 0) M.newsT--;
      if (f.phase !== 'fight') { M.strikes = []; return; }
      const pend = M.strikes.filter((s) => s.state !== 'done');
      // his own next punch keeps clear of a strike still to land AND of one that has just landed (a slip needs 13 frames before the next)
      const near = M.strikes.filter((s) => s.state !== 'done' || f.clock - s.at < 16);
      if (near.length && ['idle', 'block'].includes(ai.state) && !ai.superTaunt) holdClear(ai, f, near.map((s) => s.at));
      for (const s of M.strikes) {
        if (s.state === 'tell' && f.clock >= s.at) {
          s.state = 'done'; s.doneAt = f.clock;
          const em = strikeMove(ai, cfg, s);
          const res = f.opponentAttack(em);
          f.sfx(em.sfx && em.sfx.swing ? em.sfx.swing : 'whiff');
          M.sLast = f.clock;
          ai.hook('moveResolved', em, res);
          if (kind === 'hands') handsLanded(ai, cfg, res);
        }
      }
      M.strikes = M.strikes.filter((s) => s.state !== 'done' || f.clock - s.doneAt < 20);
      if (--M.sNext <= 0) {
        M.sNext = 0;
        // only from his stance, with nothing else of his coming and no strike already on its way
        if (!pend.length && ['idle', 'block'].includes(ai.state) && !ai.superTaunt && ai.state !== 'open' && !ai.forced.length) {
          const pk = pickOf(cfg, M), at = f.clock + cfg.tell;
          if (pk && !busy(ai, f, at) && f.clock - (M.lastOwn ?? -99) > 12) {
            M.strikes.push({ id: pk.id, side: pk.side, at, born: f.clock, state: 'tell' });
            M.sN++;
            holdClear(ai, f, [at]); // (his own next step may start this very frame: keep it clear of the new one too)
            f.sfx(cfg.tellSfx);
            M.sNext = rand(cfg.gap[0], cfg.gap[1]);
          } else M.sNext = 8;
        } else M.sNext = 8;
      }
    },
    threats(ai, cfg) {
      const f = ai.fight;
      return ai.mods.strikes.filter((s) => s.state === 'tell' && s.at > f.clock).map((s) => ({ move: strikeMove(ai, cfg, s), left: s.at - f.clock, tellT: f.clock - s.born }));
    },
  };
}
// the next strike: one of cfg.strikes ({ id, side }) at random, never the same twice running
function pickOf(cfg, M) {
  const L = cfg.strikes.filter((x) => x.id !== M.sLastId);
  const pk = L[Math.floor(Math.random() * L.length)];
  if (pk) M.sLastId = pk.id;
  return pk;
}
function strikeMove(ai, cfg, s) {
  const m = ai.d.moves[s.id];
  return { ...m, id: s.id, windupFrames: cfg.tell, counterWindow: null, starWindow: null, kdWindow: null, strike: true };
}
// a hand that lands: the player is held (a clinch) until he mashes free
function handsLanded(ai, cfg, res) {
  const f = ai.fight, P = f.player;
  if (res !== 'hit' || P.state !== 'hit') return;
  const M = f.circuit.mash;
  P.hold({ power: M.power * (cfg.power ?? 1), decay: M.decay * (cfg.decay ?? 1), timeout: cfg.timeout, every: cfg.every, damage: cfg.damage, heart: cfg.heart ?? 1 });
  f.sfx('crunch'); f.event('clinch'); ai.mods.holdT = 1;
}

// the eyes of a dark fighter: [dx, dy, wide] from the move, glowing on the head
function drawEyes(frame, fight, ai, cfg) {
  const v = ai.view();
  if (v.hidden) return;
  const h = fight.oppHead(v);
  let [dx, dy, wide] = [h.look[0], h.look[1], 0];
  if (ai.state === 'windup' && ai.move && ai.move.eyes) [dx, dy, wide] = ai.move.eyes;
  if (['hit', 'stunned'].includes(ai.state)) wide = -1;
  const hi = c32(...cfg.eyeHi), lo = c32(...cfg.eyeLo);
  const x = Math.round(h.x + dx), y = Math.round(h.y + dy - 1);
  for (const s of [-1, 1]) {
    const ex = x + s * 5 - (s > 0 ? 2 : 0);
    if (wide < 0) { frame.rect(ex, y + 1, 3, 1, lo); continue; } // dazed: dim slits
    frame.rect(ex - 1, y - 1 - (wide > 0 ? 1 : 0), 5, 3 + (wide > 0 ? 2 : 0), lo);
    frame.rect(ex, y - (wide > 0 ? 1 : 0), 3, wide > 0 ? 3 : 1, hi);
  }
  return h;
}

const SHADOW = strikes('shadow'), HANDS = strikes('hands');

export const ABYSS_MODIFIERS = {
  // ------------------------------------------------------------------ Underworld IV --

  // Fallen Brody. A counter you land on him stuns him as ever, and hits as ever, but the wall answers: once his stun
  // has run out (or the flurry is spent and he has covered up) he fires cfg.move, the Backlash, a slow uppercut that can
  // be slipped or ducked. Slip it and he's open (his exploit); leave a counter unanswered by knocking him down. An exploit
  // flagged `cfg.unless` (the loose ball) turns it off for the round.
  counterback: {
    init(ai) { ai.mods.owe = false; },
    roundStart(ai) { ai.mods.owe = false; },
    onKnockdown(ai) { ai.mods.owe = false; },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result !== 'hit' || !r.counter || p.star || r.knockdown || ai.punch.state !== 'windup') return;
      if (cfg.unless && ai.know && ai.know.flag(cfg.unless)) return;
      ai.mods.owe = true;
    },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.sayT > 0) M.sayT--;
      if (f.phase !== 'fight') { M.owe = false; return; }
      if (M.owe && ['idle', 'block'].includes(ai.state) && !ai.forced.length && !ai.superTaunt) {
        M.owe = false; M.sayT = 60;
        f.sfx('grind'); f.event('counterBack');
        ai.beginMove(cfg.move, { forced: true });
      }
    },
    render(ai, cfg, frame, fight) {
      if (fight.phase === 'fight' && ai.mods.sayT > 0 && (ai.mods.sayT >> 2) & 1) callout(frame, 'COUNTER-COUNTER!', 128, 56, fight.COL.red, fight.COL.black, 1);
      if (fight.phase === 'fight' && ai.mods.owe) badge(frame, 'HE OWES YOU ONE...', fight.COL.orange);
    },
  },

  // Fallen Midnight. The lights go out at every bell and stay out: the ring, the crowd and he himself all black, and only his
  // eyes show, sliding toward the punch (the move's `eyes: [dx, dy, wide]`). Each punch has a sound of its own
  // as well (`sfx.tell`): in the dark that is the other half of the tell.
  blackout: {
    init(ai) { ai.mods.dark = false; ai.mods.darkT = 0; },
    roundStart(ai) { ai.mods.dark = false; },
    fightStart(ai, cfg) { ai.mods.dark = true; ai.mods.darkT = 0; ai.fight.sfx('lightsOff'); },
    update(ai) { const M = ai.mods; if (M.dark) M.darkT++; if (['between', 'roundEnd', 'ko'].includes(ai.fight.phase)) M.dark = false; },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!M.dark || !['fight', 'oppDown', 'playerDown'].includes(fight.phase)) return;
      if (M.darkT < 14 && (M.darkT >> 1) & 1) return; // the lights flicker out
      frame.rect(0, 0, 256, 224, c32(...(cfg.dark || [0, 0, 2])));
      drawEyes(frame, fight, ai, cfg);
    },
    render(ai, cfg, frame, fight) { if (ai.mods.dark && inFight(fight) && fight.phase !== 'intro') badge(frame, 'THE LIGHTS ARE OUT', fight.COL.grey); },
  },

  // A move flagged `steal` that lands takes cfg.take star(s) from you (`cfg.take: 3` takes them all); `cfg.blocked` makes a blocked
  // one steal too. The event 'starStolen' opens the window for Vorgath's exploit (a blow on the crown takes it back).
  thief: {
    init(ai) { ai.mods.thiefT = 0; },
    moveResolved(ai, cfg, m, r) {
      const f = ai.fight;
      if (!m.steal || m.fake || m.echo) return;
      if (r !== 'hit' && !(cfg.blocked && r === 'blocked')) return;
      if (loseStar(f, cfg.take ?? 1)) { ai.mods.thiefT = 80; f.event('starStolen'); ai.mods.stolenAt = f.clock; }
    },
    update(ai) { if (ai.mods.thiefT > 0) ai.mods.thiefT--; },
    render(ai, cfg, frame, fight) {
      if (fight.phase === 'fight' && ai.mods.thiefT > 0 && (ai.mods.thiefT >> 2) & 1) callout(frame, cfg.say || 'STAR STOLEN!', 128, 56, fight.COL.red, fight.COL.black, 1);
    },
  },

  // ------------------------------------------------------------------ Underworld V --

  // The Furnace itself (a circuit modifier: circuit.special). A heat meter (0..1, `ai.mods.heat`) climbs cfg.rate a frame, all
  // fight long; from cfg.from on it drains a heart every cfg.slow frames, down to every cfg.fast at full heat. Every slip
  // or duck of his punches cools it by cfg.cool, a counter by cfg.counter. It starts every round at cfg.start.
  furnace: {
    init(ai, cfg) { const M = ai.mods; M.heat = cfg.start; M.drainT = 0; },
    roundStart(ai, cfg) { const M = ai.mods; M.heat = cfg.start; M.drainT = 0; },
    moveResolved(ai, cfg, m, r) { if (!m.fake && !m.call && (r === 'dodged' || r === 'ducked')) ai.mods.heat = Math.max(0, ai.mods.heat - cfg.cool); },
    onPlayerPunch(ai, cfg, p, r) { if (r.result === 'hit' && r.counter) ai.mods.heat = Math.max(0, ai.mods.heat - cfg.counter); },
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods, P = f.player;
      if (M.burnT > 0) M.burnT--;
      if (f.phase !== 'fight') return;
      if (!(M.hotT > 0)) M.heat = Math.min(1, M.heat + cfg.rate);
      if (M.heat < cfg.from || P.pink || P.state === 'down' || P.state === 'getup' || P.state === 'held') return;
      const every = Math.round(cfg.slow - (cfg.slow - cfg.fast) * ((M.heat - cfg.from) / (1 - cfg.from)));
      if (++M.drainT >= every) {
        M.drainT = 0; f.loseHearts(1); f.sfx('heat'); M.burnT = 30;
        f.effects.push({ kind: 'spark', x: 128 + (Math.random() < 0.5 ? -10 : 10), y: 178, t: 0, life: 8 });
      }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      // a thermometer down the right edge
      const M = ai.mods, h = M.heat, x = 240, y0 = 58, H = 96;
      panel(frame, x - 21, y0 - 12, 33, H + 22); // (wide enough for its label)
      drawText(frame, 'HEAT', x - 19, y0 - 9, h >= 0.85 && (fight.clock >> 3) & 1 ? fight.COL.red : fight.COL.orange, { mono: false });
      frame.rect(x, y0, 8, H, fight.COL.barBack);
      const n = Math.round((H - 2) * h);
      for (let i = 0; i < n; i++) { const k = i / (H - 2); frame.rect(x + 1, y0 + H - 2 - i, 6, 1, k < 0.4 ? c32(31, 22, 6) : k < 0.75 ? c32(31, 13, 3) : c32(31, 5, 4)); }
      for (let i = 0; i < 4; i++) frame.rect(x - 1, y0 + Math.round((H - 2) * (1 - (i + 1) / 5)), 2, 1, fight.COL.white);
      if (M.heat >= cfg.from) frame.rect(x - 2, y0 + Math.round((H - 2) * (1 - cfg.from)), 12, 1, fight.COL.yellow);
      if (M.burnT > 0 && fight.phase === 'fight' && (M.burnT >> 2) & 1) callout(frame, 'THE HEAT BURNS!', 128, 56, fight.COL.orange, fight.COL.black, 1);
    },
  },

  // Stoker. A move of his flagged `stoke` is a call, a shovelful into the furnace: when it is not cut short the meter jumps by
  // cfg.boost. A counter into the windup (his exploit) spills it instead.
  coal: {
    init(ai) { ai.mods.stokeT = 0; },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.stokeT > 0) M.stokeT--;
      if (f.phase !== 'fight') return;
      if (ai.state === 'recovery' && ai.move && ai.move.stoke && ai.moveResult === 'feint' && M.stoked !== ai.move) {
        M.stoked = ai.move; M.heat = Math.min(1, (M.heat || 0) + cfg.boost); M.stokeT = 70;
        f.sfx('flame'); f.event('stoked'); f.shake = 4;
      }
    },
    renderOpp(ai, cfg, frame, fight) {
      // sparks flying off the shovel while he works
      const m = ai.move;
      if (!inFight(fight) || ai.state !== 'windup' || !m || !m.stoke) return;
      const v = ai.view(), t = fight.clock;
      for (let i = 0; i < 9; i++) { const s = ((i + 1) * 40503 + (t >> 1) * 9973) >>> 0; frame.px(fight.OPP_X + v.dx + 16 + (s % 26), fight.OPP_Y + v.dy - 86 + ((s >> 8) % 34), i & 1 ? c32(31, 26, 9) : c32(31, 12, 3)); }
    },
    render(ai, cfg, frame, fight) {
      if (fight.phase === 'fight' && ai.mods.stokeT > 0 && (ai.mods.stokeT >> 2) & 1) callout(frame, 'FRESH COAL!', 128, 56, fight.COL.orange, fight.COL.black, 1);
    },
  },

  // Brand. A move flagged `brand` that lands, or that you block, marks you for cfg.frames: the next punch of his that lands while
  // you are marked is a critical hit (cfg.mult). Slip or duck the iron itself and the mark cools off; a hit spends it.
  brandMark: {
    init(ai) { const M = ai.mods; M.marked = 0; M.markT = 0; M.critT = 0; M.coolT = 0; },
    roundStart(ai) { ai.mods.marked = 0; },
    onKnockdown(ai) { ai.mods.marked = 0; },
    modifyMove(ai, cfg, m) {
      if (!(ai.mods.marked > 0) || m.feint || m.call || !m.damage || m.strike) return m;
      return { ...m, damage: Math.round(m.damage * cfg.mult), crit: true, name: m.name + ' (CRIT)' };
    },
    moveResolved(ai, cfg, m, r) {
      const M = ai.mods, f = ai.fight;
      if (m.crit && r === 'hit') { M.marked = 0; M.critT = 60; f.sfx('crash'); f.shake = 10; f.event('crit'); return; }
      if (!m.brand || m.fake) return;
      if (r === 'hit' || r === 'blocked') { M.marked = cfg.frames; M.markT = 60; f.sfx('brandHiss'); f.event('branded'); }
      else if ((r === 'dodged' || r === 'ducked') && M.marked > 0) { M.marked = 0; M.coolT = 50; f.sfx('hiss'); }
    },
    update(ai) {
      const M = ai.mods;
      if (M.critT > 0) M.critT--;
      if (M.markT > 0) M.markT--;
      if (M.coolT > 0) M.coolT--;
      if (M.marked > 0 && ai.fight.phase === 'fight') M.marked--;
      else if (ai.fight.phase !== 'fight' && ai.fight.phase !== 'oppDown' && ai.fight.phase !== 'playerDown') M.marked = 0;
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!inFight(fight)) return;
      if (M.marked > 0) {
        badge(frame, 'BRANDED: NEXT HIT CRITS', (fight.clock >> 3) & 1 ? fight.COL.orange : fight.COL.red);
        // the brand, glowing on your chest
        const x = 121, y = 146, hot = c32(31, 24, 8), mid = c32(31, 11, 3), pulse = (fight.clock >> 3) & 1;
        frame.rect(x - 1, y - 1, 15, 15, c32(3, 1, 1)); frame.rect(x, y, 13, 13, pulse ? mid : c32(24, 7, 2));
        for (const [dx, dy] of [[3, 3], [4, 4], [5, 5], [6, 4], [7, 3], [5, 3], [5, 8], [6, 8]]) frame.px(x + dx, y + dy, hot);
      }
      if (fight.phase === 'fight' && M.markT > 40 && (M.markT >> 2) & 1) callout(frame, 'BRANDED!', 128, 56, fight.COL.orange, fight.COL.black, 1);
      else if (fight.phase === 'fight' && M.critT > 20 && (M.critT >> 2) & 1) callout(frame, 'CRITICAL HIT!', 128, 56, fight.COL.red, fight.COL.black, 1);
      else if (fight.phase === 'fight' && M.coolT > 20 && (M.coolT >> 2) & 1) callout(frame, 'MARK COOLED!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
    },
  },

  // Slag. He is molten: a punch of yours that touches him while he is hot (in his stance, guarding, taunting, or a punch thrown
  // too early into his windup) costs you cfg.hearts hearts. Right after he throws a punch he has cooled for cfg.cool frames
  // (his recovery), and stays cooled while he is hurt or open: a counter, a punish and an opening are free. `palette`: cooled,
  // the cracks go dull.
  molten: {
    init(ai) { ai.mods.coolT = 0; ai.mods.burnT = 0; },
    roundStart(ai) { ai.mods.coolT = 0; },
    moveResolved(ai, cfg, m) { if (!m.fake && !m.call) ai.mods.coolT = cfg.cool; },
    update(ai) {
      const M = ai.mods;
      if (M.burnT > 0) M.burnT--;
      if (M.coolT > 0) M.coolT--;
      if (ai.stun > 0 || ['hit', 'stunned', 'open', 'kd', 'down', 'getup'].includes(ai.state)) M.coolT = Math.max(M.coolT, 3);
    },
    onPlayerPunch(ai, cfg, p, r) {
      const M = ai.mods, f = ai.fight;
      if (r.result === 'whiff' || r.knockdown || r.counter || p.star || ai.punch.stunned || M.coolT > 0) return;
      if (!['idle', 'block', 'taunt', 'windup'].includes(ai.punch.state) || r.far) return;
      f.loseHearts(cfg.hearts); f.sfx('burn'); M.burnT = 34; f.event('scorched');
    },
    palette(ai) { return ai.mods.coolT > 0 ? 'slag.cool' : null; },
    render(ai, cfg, frame, fight) {
      if (!inFight(fight) || fight.phase === 'intro') return;
      const cool = ai.mods.coolT > 0;
      badge(frame, cool ? 'COOLED' : 'MOLTEN: DON\'T TOUCH', cool ? fight.COL.cyan : (fight.clock >> 3) & 1 ? fight.COL.orange : fight.COL.red);
      if (fight.phase === 'fight' && ai.mods.burnT > 18 && (ai.mods.burnT >> 2) & 1) callout(frame, 'YOU BURNED YOUR HAND!', 128, 56, fight.COL.orange, fight.COL.black, 1);
    },
  },

  // Crucible. When the furnace's meter reaches full he overheats for cfg.frames: the screen whites out and he is only a black
  // silhouette on it; his punches hit cfg.dmg harder. It ends with a hiss and the meter falls to cfg.after.
  overheat: {
    init(ai) { ai.mods.hotT = 0; },
    roundStart(ai) { ai.mods.hotT = 0; },
    onKnockdown(ai, cfg) { if (ai.mods.hotT > 0) { ai.mods.hotT = 0; ai.mods.heat = cfg.after; } },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (f.phase !== 'fight') { if (M.hotT > 0 && ['between', 'roundEnd', 'ko'].includes(f.phase)) M.hotT = 0; return; }
      if (M.hotT > 0) {
        if (--M.hotT === 0) { M.heat = cfg.after; f.sfx('hiss'); M.coolT = 50; }
      } else if ((M.heat || 0) >= 1) { M.hotT = cfg.frames; f.sfx('flame'); f.event('overheat'); f.shake = 10; M.warnT = 70; }
      if (M.warnT > 0) M.warnT--;
      if (M.coolT > 0) M.coolT--;
    },
    modifyMove(ai, cfg, m) { return ai.mods.hotT > 0 && !m.feint && !m.call && m.damage ? { ...m, damage: Math.round(m.damage * cfg.dmg), hot: true } : m; },
    palette(ai) { return ai.mods.hotT > 0 ? 'crucible.hot' : null; },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!(M.hotT > 0) || !['fight', 'oppDown', 'playerDown'].includes(fight.phase)) return;
      // the whiteout: everything but the fight's own HUD goes white; he is left a black cut-out of his pose
      const into = cfg.frames - M.hotT;
      const k = into < 10 ? into / 10 : M.hotT < 18 ? M.hotT / 18 : 1;
      const white = c32(31, 31, 30), pale = c32(31, 27, 20);
      for (let y = 44; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x + (fight.clock >> 2), y) < k) frame.px(x, y, (x + y) & 1 && y & 8 ? pale : white);
      const v = ai.view();
      if (!v.hidden && k > 0.5) frame.blit(fight.oppSprites.get(v.pose), fight.OPP_X + v.dx, fight.OPP_Y + v.dy, fight.oppPalette('default'), { layer: 2, solid: c32(3, 2, 3) });
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!inFight(fight)) return;
      if (M.hotT > 0) badge(frame, 'OVERHEAT!', (fight.clock >> 2) & 1 ? fight.COL.red : fight.COL.yellow);
      if (fight.phase === 'fight' && M.warnT > 30 && (M.warnT >> 2) & 1) callout(frame, 'CRUCIBLE OVERHEATS!', 128, 56, fight.COL.orange, fight.COL.black, 1);
    },
  },

  // ------------------------------------------------------------------ Underworld VI --

  // Nox. His guard is a portcullis: while it is down, EVERY punch bounces off it (costing hearts like a block), counters and
  // Star Punches included; only his exploits, an `open` step, a stun and a perfect hit go through. Slip or duck cfg.need of his
  // attacks in a row (a hit or a block starts you over) and it rises for cfg.open frames; then it slams shut and you begin again.
  gate: {
    init(ai) { const M = ai.mods; M.streak = 0; M.open = 0; M.slamT = 0; M.clangT = 0; M.riseT = 0; },
    roundStart(ai) { const M = ai.mods; M.streak = 0; M.open = 0; },
    // (a punch thrown in the last few frames of the open gate would land after it has slammed: pointless too)
    futile(ai) { return !(ai.mods.open > 6) && !['open', 'hit', 'stunned'].includes(ai.state) && !(ai.stun > 0); },
    onPlayerPunch(ai, cfg, p, r) {
      if (ai.mods.open > 0 || r.result === 'whiff' || r.knockdown || r.far) return;
      if (ai.punch.state === 'open' || ai.punch.stunned) return;
      ai.fight.sfx('clang'); ai.mods.clangT = 14;
      return { result: 'blocked', clang: true };
    },
    moveResolved(ai, cfg, m, r) {
      const M = ai.mods, f = ai.fight;
      if (m.fake || m.call) return;
      if (r === 'dodged' || r === 'ducked') {
        if (M.open > 0) return;
        M.streak++;
        if (M.streak >= cfg.need) { M.open = cfg.open; M.riseT = 60; M.streak = 0; f.sfx('gate'); f.event('gateOpen'); f.shake = 6; }
      } else M.streak = 0;
    },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.clangT > 0) M.clangT--;
      if (M.slamT > 0) M.slamT--;
      if (M.riseT > 0) M.riseT--;
      if (f.phase !== 'fight') { if (M.open > 0 && ['between', 'roundEnd', 'ko'].includes(f.phase)) M.open = 0; return; }
      if (M.open > 0 && --M.open === 0) { f.sfx('gate'); f.event('gateShut'); M.slamT = 50; M.streak = 0; f.shake = 8; }
    },
    onKnockdown(ai) { ai.mods.open = 0; ai.mods.streak = 0; },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!inFight(fight) || fight.phase === 'intro' || fight.phase === 'oppDown') return;
      const v = ai.view();
      if (v.hidden) return;
      const b = box(fight, v), x0 = b.x0 + 26, x1 = b.x1 - 26;
      // the portcullis over his body: bars lowered while it is shut, drawn up (only the tips) while it is open
      const lift = M.open > 0 ? (M.riseT > 0 ? 1 - M.riseT / 60 : 1) : M.slamT > 30 ? (M.slamT - 30) / 20 : 0;
      const yTop = b.y0 + 36, yBot = b.y1 - 6, drop = Math.round((yBot - yTop) * (1 - lift));
      if (drop < 4) return;
      const hi = c32(20, 20, 27), lo = c32(6, 6, 11);
      for (let x = x0; x <= x1; x += 6) { frame.rect(x, yTop, 2, drop, lo); frame.rect(x, yTop, 1, drop, hi); if (drop > 8) frame.px(x, yTop + drop, hi); }
      for (const dy of [0.33, 0.66]) frame.rect(x0, yTop + Math.round(drop * dy), x1 - x0 + 2, 1, lo);
      if (M.clangT > 8) for (const [dx, dy] of [[-8, 20], [10, 30], [0, 40], [-14, 36]]) frame.px(fight.OPP_X + v.dx + dx + (M.clangT & 1), yTop + dy, fight.COL.white);
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!inFight(fight) || fight.phase === 'intro') return;
      if (M.open > 0) badge(frame, 'GATE OPEN', fight.COL.green);
      else badge(frame, `GATE SHUT ${M.streak}/${cfg.need}`, M.streak >= cfg.need - 1 && (fight.clock >> 3) & 1 ? fight.COL.yellow : fight.COL.grey);
      if (fight.phase === 'fight' && M.riseT > 30 && (M.riseT >> 2) & 1) callout(frame, 'THE GATE OPENS!', 128, 56, fight.COL.green, fight.COL.black, 1);
      else if (fight.phase === 'fight' && M.slamT > 30 && (M.slamT >> 2) & 1) callout(frame, 'THE GATE SLAMS!', 128, 56, fight.COL.red, fight.COL.black, 1);
    },
  },

  // Umbra. His shadow (a dark copy of him at cfg.dx from the middle, on the left or the right of the ring) attacks on its own: it
  // raises its fist in the tell pose of the strike for cfg.tell frames (a low hum, and the cut-out lights up), then strikes: the
  // strike's own move (`cfg.strikes`, each from one side: slip away from it). A punch that lands on Umbra himself while his shadow
  // is winding up pins it to him: the strike never comes and he's stunned (`custom` exploit cfg.pin).
  shadow: {
    ...SHADOW,
    onPlayerPunch(ai, cfg, p, r) {
      const M = ai.mods, f = ai.fight;
      if (r.result !== 'hit' || r.knockdown) return;
      const s = M.strikes.find((x) => x.state === 'tell');
      if (!s || ai.punch.stunned) return;
      s.state = 'done'; s.doneAt = f.clock - 99; s.at = -9999; M.newsT = 80; f.sfx('glass'); f.event('shadowPinned');
      if (ai.know) ai.know.custom(cfg.pin);
    },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!inFight(fight) || fight.phase === 'intro') return;
      for (const s of M.strikes) {
        if (s.state !== 'tell') continue;
        const m = ai.d.moves[s.id], pose = m.animation.windup[m.animation.windup.length - 1];
        const x = fight.OPP_X + s.side * cfg.dx, k = (fight.clock - s.born) / cfg.tell;
        const hot = k > 0.35 && ((fight.clock >> 1) & 1);
        frame.blit(fight.oppSprites.get(pose), x, fight.OPP_Y + 2, fight.oppPalette(hot ? cfg.hot : cfg.ghost), { layer: 2, dither: hot ? 0 : 1 });
      }
      // at rest the shadow lies quiet on the canvas beside him: a low dark copy
      if (fight.phase === 'fight' && !M.strikes.some((s) => s.state === 'tell')) {
        const side = ((M.sN | 0) & 1) ? 1 : -1;
        frame.blit(fight.oppSprites.get('idle1'), fight.OPP_X + side * cfg.dx, fight.OPP_Y + 2, fight.oppPalette(cfg.ghost), { layer: 2, dither: 1, scale: 0.9 });
      }
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!inFight(fight) || fight.phase === 'intro') return;
      if (M.strikes.some((s) => s.state === 'tell')) badge(frame, 'HIS SHADOW STRIKES', (fight.clock >> 2) & 1 ? fight.COL.yellow : fight.COL.pink);
      if (fight.phase === 'fight' && M.newsT > 40 && (M.newsT >> 2) & 1) callout(frame, 'SHADOW PINNED!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
    },
  },

  // Grasp. Hands reach up through the canvas at your feet: the floor cracks in pale lines under the spot for cfg.tell frames, and then a hand
  // rises there (cfg.spots: left, right or the middle of you, each with the slip that gets you away: away from the hand). One that lands holds you
  // in a clinch until you mash free. His `summon` call (a stamp that shakes the ring) sends a burst of them.
  hands: {
    ...HANDS,
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods;
      // a summon that is not cut short (a counter into the stamp) sends a burst of them
      if (ai.state === 'recovery' && ai.move && ai.move.summon && ai.moveResult === 'feint' && M.summoned !== ai.move) {
        M.summoned = ai.move; M.burst = cfg.burst ?? 3; M.burstAt = f.clock + 8; f.sfx('rumble'); f.shake = 6;
      }
      if (M.burst > 0 && ai.state === 'hit') M.burst = 0;
      // the burst: the summoned hands come one after the other, each clear of the last and of him
      if (M.burst > 0 && f.phase === 'fight' && f.clock >= M.burstAt && ['idle', 'block'].includes(ai.state) && !M.strikes.some((s) => s.state !== 'done') && !ai.superTaunt) {
        const pk = pickOf(cfg, M), at = f.clock + cfg.tell;
        if (pk && !busy(ai, f, at)) { M.strikes.push({ id: pk.id, side: pk.side, at, born: f.clock, state: 'tell' }); M.burst--; M.sN++; holdClear(ai, f, [at]); f.sfx(cfg.tellSfx); M.burstAt = at + 30; }
      }
      HANDS.update.call(this, ai, cfg);
    },
    clinchBroken(ai, cfg, freed) { ai.mods.holdT = 0; if (freed) ai.mods.freeT = 70; },
    // a Star Punch that cuts a rising hand off (his exploit) cancels it
    afterKnowledge(ai, cfg, p, r) {
      const M = ai.mods;
      if (r.exploit && M.strikes.some((x) => x.state === 'tell')) { for (const x of M.strikes) if (x.state === 'tell') { x.state = 'done'; x.doneAt = ai.fight.clock - 99; x.at = -9999; } ai.fight.sfx('crunch'); M.newsT = 70; }
      return r;
    },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods, t = fight.clock;
      if (!inFight(fight) || fight.phase === 'intro') return;
      const skin = c32(20, 20, 19), mid = c32(13, 13, 13), dk = c32(6, 6, 7), nail = c32(26, 24, 18), crack = c32(27, 27, 25);
      for (const s of M.strikes) {
        const x = 128 + s.side * cfg.spread, y = 200;
        if (s.state === 'tell') {
          // pale cracks spreading out from the spot under a pale ring that closes in, dust jumping, fingertips at the top of the tell
          const k = Math.min(1, (t - s.born) / cfg.tell), rr = Math.round(18 - k * 8);
          for (let a = 0; a < 24; a++) { const th = (a / 24) * Math.PI * 2; frame.px(Math.round(x + Math.cos(th) * rr * 1.5), Math.round(y - 2 + Math.sin(th) * rr * 0.32), (a + (t >> 2)) & 1 ? crack : mid); }
          for (let i = 0; i < 7; i++) { const th = i * 0.9 + 0.3, len = Math.round(4 + k * 12); for (let d = 1; d <= len; d++) frame.px(Math.round(x + Math.cos(th) * d * 1.3), Math.round(y - 2 + Math.sin(th) * d * 0.4), d & 1 ? crack : dk); }
          if (k > 0.5 && (t & 1)) for (const dx of [-5, 0, 5]) frame.px(x + dx + ((t >> 1) % 3) - 1, y - 6 - Math.round((k - 0.5) * 16), skin);
          if (k > 0.6) for (const dx of [-3, 0, 3]) frame.rect(x + dx, y - 2 - Math.round((k - 0.6) * 24), 2, 3, mid); // fingertips at the top of the tell
        } else if (s.state === 'done' && t - s.doneAt < 12) {
          // the hand itself: an arm up out of the canvas, five fingers spread
          const up = Math.min(1, (t - s.doneAt) / 4), h = Math.round(46 * up);
          frame.rect(x - 4, y - h, 9, h, mid); frame.rect(x - 4, y - h, 3, h, skin); frame.rect(x + 3, y - h, 2, h, dk);
          for (let i = -2; i <= 2; i++) { frame.rect(x + i * 3 - 1, y - h - 9, 2, 10, i & 1 ? mid : skin); frame.px(x + i * 3 - 1, y - h - 10, nail); }
        }
      }
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!inFight(fight) || fight.phase === 'intro') return;
      ASCENSION_MODIFIERS.clinch.render(ai, cfg, frame, fight);
      if (fight.phase === 'fight' && M.newsT > 30 && (M.newsT >> 2) & 1) callout(frame, 'CUT OFF AT THE WRIST!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
      const s = M.strikes.find((x) => x.state === 'tell');
      if (s) badge(frame, s.side < 0 ? 'HAND: LEFT' : s.side > 0 ? 'HAND: RIGHT' : 'HAND: BELOW YOU', (fight.clock >> 2) & 1 ? fight.COL.yellow : fight.COL.white);
    },
  },

  // Lament. He cries out as a punch starts, and the cry is backwards: a quiet, low moan is the real punch and a loud shriek is a fake (cfg.p of
  // his punches: the circuit's fake, the same tell cut short at 60% and a shrug after it). Loud or quiet is in the move's tell sound
  // (`cryLoud` / `cryQuiet`), and shown as rings round his mouth for anyone playing without sound.
  reversed: {
    init(ai) { ai.mods.cryT = 0; ai.mods.cryLoud = false; },
    modifyMove(ai, cfg, m) {
      if (m.feint || m.call || ai.fight.phase !== 'fight') return m;
      const fake = !m.noFake && Math.random() < cfg.p;
      const out = fake ? fakeOf(m, cfg.rest || 30) : { ...m };
      out.sfx = { ...(out.sfx || {}), tell: fake ? 'cryLoud' : 'cryQuiet' };
      out.cry = fake ? 'loud' : 'quiet';
      return out;
    },
    moveStart(ai, cfg, m) { if (m.cry) { ai.mods.cryT = 26; ai.mods.cryLoud = m.cry === 'loud'; } },
    update(ai) { if (ai.mods.cryT > 0) ai.mods.cryT--; },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!(M.cryT > 0) || !inFight(fight) || ai.view().hidden) return;
      const h = fight.oppHead(ai.view()), x = Math.round(h.x + 26), y = Math.round(h.y + 6), k = 1 - M.cryT / 26;
      const col = M.cryLoud ? c32(31, 26, 8) : c32(14, 22, 31);
      const rings = M.cryLoud ? 3 : 1;
      for (let r = 0; r < rings; r++) {
        const rad = 4 + r * 5 + Math.round(k * 5);
        for (let a = -5; a <= 5; a++) { const th = a * 0.28; frame.px(Math.round(x + Math.cos(th) * rad), Math.round(y + Math.sin(th) * rad), col); }
      }
    },
    render(ai, cfg, frame, fight) {
      if (fight.phase === 'fight' && ai.mods.cryT > 8) badge(frame, ai.mods.cryLoud ? 'LOUD CRY: A FAKE' : 'QUIET CRY: REAL', ai.mods.cryLoud ? fight.COL.yellow : fight.COL.cyan);
    },
  },

  // ------------------------------------------------------------------ Vorgath, and Dash --

  // Vorgath. A boss in three phases (the circuit's `forms`), fought in near-darkness: the whole ring and he himself are black and only his
  // eyes (the move's `eyes: [dx, dy, wide]`) and the five rubies of his crown (`crown: 1 | 2`: the slow, heavy ones flare it) show. The floor
  // goes with each phase: in the second the left side of the ring has crumbled away (`P.noDodge = -1`, you can't slip that way) and in the
  // third both have (`2`: no slipping at all, only blocks and ducks). Every move of his is fitted to the floor when it starts: a slip that is
  // gone is taken out of its `avoidBy`, and one that would be left with nothing gets a duck (or a block for a body blow).
  gloom: {
    init(ai) { ai.mods.gloomT = 0; ai.mods.crumbleT = 0; },
    segOff(ai) { ai.fight.player.noDodge = 0; }, // (ZERO's true form wears the King's floor for a while, then gives it back)
    roundStart(ai) { ai.mods.crumbleT = 0; },
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods, P = f.player, ph = formOf(f);
      M.gloomT++;
      if (M.crumbleT > 0) M.crumbleT--;
      const floor = ph >= 3 ? 2 : ph === 2 ? -1 : 0;
      P.noDodge = ['fight', 'oppDown', 'playerDown'].includes(f.phase) ? floor : 0;
      if (f.phase === 'intro' && M.lastPhase !== ph) { M.lastPhase = ph; if (ph > 1) { M.crumbleT = 90; f.sfx('rumble'); f.shake = 10; f.event('crumble'); } }
    },
    modifyMove(ai, cfg, m) {
      const ph = formOf(ai.fight);
      if (ph < 2 || m.feint || m.call || !m.avoidBy || m.strike) return m;
      let av = m.avoidBy.filter((a) => (ph >= 3 ? !a.startsWith('dodge') : a !== 'dodgeL'));
      if (!av.some((a) => a === 'duck' || a === 'block' || a.startsWith('dodge'))) av = [...av, m.height === 'low' ? 'block' : 'duck'];
      return av.join() === m.avoidBy.join() ? m : { ...m, avoidBy: av, floorFix: true };
    },
    renderOpp(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown'].includes(fight.phase)) return;
      const ph = formOf(fight), t = fight.clock, M = ai.mods;
      // the dark: near total. A faint ghost of the ring stays (the checker keeps a few pixels of it), and his eyes and crown burn through
      const dens = cfg.dark ?? 0.94;
      for (let y = 30; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < dens && ((x * 7 + y * 3) & 15) !== 0) frame.px(x, y, c32(0, 0, 1));
      // the floor that has gone (on top of the dark, or it would not show): a strip of void along the edge, black, with a dull red glow at the break
      const void_ = c32(0, 0, 1), edge = c32(24, 4, 6), edge2 = c32(11, 1, 3);
      const strip = (x0, x1, dir) => {
        for (let y = 120; y < 224; y++) { const w = Math.round((x1 - x0) * (0.55 + 0.45 * ((y - 120) / 104))); const a = dir < 0 ? x0 : x1 - w, b = a + w; frame.rect(a, y, w, 1, void_); frame.px(dir < 0 ? b : a - 1, y, (y + (t >> 3)) % 5 ? edge2 : edge); if (!((y + (t >> 4)) % 7)) frame.px(dir < 0 ? b + 1 : a - 2, y, edge2); }
      };
      if (ph >= 2) strip(0, 64, -1);
      if (ph >= 3) strip(192, 256, 1);
      // rubble falling as the piece goes
      if (M.crumbleT > 0) for (let i = 0; i < 16; i++) { const s = ((i + 1) * 40503) >>> 0, side = ph >= 3 && i & 1 ? 1 : -1, x = side < 0 ? 4 + (s % 56) : 196 + (s % 56), y = 120 + ((s >> 8) % 60) + Math.round((90 - M.crumbleT) * 1.4); if (y < 224) { frame.rect(x, y, 3, 2, edge2); frame.px(x, y, edge); } }
      const v = ai.view();
      if (v.hidden) return;
      const h = drawEyes(frame, fight, ai, cfg);
      if (!h) return;
      // the crown: five rubies in a row above his head, dim; the move's `crown` makes them flare
      const m = ai.move, flare = ai.state === 'windup' && m && m.crown ? m.crown : 0, pulse = (t >> 2) & 1;
      for (let i = -2; i <= 2; i++) {
        const cx = Math.round(h.x + i * 6), cy = Math.round(h.y - 22 - (2 - Math.abs(i)) * 2 + 4);
        const bright = flare === 2 ? (pulse ? c32(31, 30, 26) : c32(31, 10, 12)) : flare === 1 ? c32(31, 9, 12) : c32(14, 2, 5);
        frame.rect(cx - 1, cy, 3, 3, bright); if (flare) frame.px(cx, cy - 1, c32(31, 24, 24));
      }
    },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const ph = formOf(fight), M = ai.mods, P = fight.player;
      const txt = ph >= 3 ? 'THE FLOOR IS GONE: BLOCK AND DUCK' : ph === 2 ? 'LEFT FLOOR GONE: SLIP RIGHT' : null;
      if (txt && fight.phase !== 'intro') badge(frame, txt, (fight.clock >> 4) & 1 ? fight.COL.red : fight.COL.orange);
      if (fight.phase === 'intro' && M.crumbleT > 0 && (M.crumbleT >> 3) & 1) callout(frame, ph >= 3 ? 'THE FLOOR CRUMBLES!' : 'THE FLOOR GIVES!', 128, 122, fight.COL.red, fight.COL.black, 2);
      void P;
    },
  },

  // Dash, the King's Champion. A punch that would land on him in his stance (or bounce off his guard) makes him step into shadow instead:
  // he vanishes for cfg.frames (nothing to hit), and comes back on the OTHER side of you from your punching hand: a punch with your left
  // glove sends him right, and he answers from there with cfg.left / cfg.right (a hook: slip away from him, or duck). Counters, punishes
  // and Star Punches go through as ever. It is on cooldown for cfg.grace frames at every bell (nothing to step away from yet) and for cfg.cooldown after each one. His exploit (Dark Reprise) is a counter on that reply.
  shadowstep: {
    init(ai, cfg) { ai.mods.stepCd = cfg.grace ?? 240; ai.mods.stepSide = 1; ai.mods.replySide = 0; },
    roundStart(ai, cfg) { ai.mods.stepCd = cfg.grace ?? 240; },
    onPlayerPunch(ai, cfg, p, r) {
      const M = ai.mods, f = ai.fight;
      if (M.stepCd > 0 || p.star || r.counter || r.knockdown || r.far || r.parried || r.read || r.anti || f.phase !== 'fight') return;
      if (!['idle', 'block'].includes(ai.punch.state) || ai.punch.stunned || ai.superTaunt) return;
      if (r.result !== 'hit' && r.result !== 'blocked') return;
      ai.state = 'vanish'; ai.t = 0; ai.move = null; ai.guardQ = null; ai.guardHits = 0;
      M.stepSide = p.side === 'L' ? 1 : -1; M.stepCd = cfg.cooldown;
      f.sfx('shadowStep'); f.event('shadowStep');
      return { result: 'whiff', teleport: true };
    },
    update(ai, cfg) {
      const M = ai.mods;
      if (M.stepCd > 0) M.stepCd--;
      if (M.replyT > 0) M.replyT--;
      if (ai.state === 'vanish' && ai.t >= cfg.frames) {
        ai.resume(0);
        M.replySide = M.stepSide; M.replyT = 26;
        ai.beginMove(M.stepSide > 0 ? cfg.right : cfg.left, { forced: true });
      }
    },
    view(ai, cfg, v) {
      const M = ai.mods;
      if (ai.state === 'vanish') {
        const F = cfg.frames, t = ai.t;
        return { pose: 'idle1', dx: 0, dy: 0, hidden: t >= 5 && t < F - 7 };
      }
      // he stands on the far side of you for his reply, and settles back to the middle
      if (M.replyT > 0 && ai.state !== 'idle') return { ...v, dx: v.dx + Math.round(M.replySide * 30 * (M.replyT / 26)) };
      return v;
    },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods, t = ai.t;
      if (ai.state !== 'vanish') return;
      // a black flash of his outline where he stood, then a shadow trailing to the side he's coming out on
      if (t < 4) frame.blit(fight.oppSprites.get('idle1'), fight.OPP_X, fight.OPP_Y, fight.UIPAL, { solid: c32(2, 1, 4) });
      const F = cfg.frames, back = F - t;
      if (back <= 12) frame.blit(fight.oppSprites.get('idle1'), fight.OPP_X + M.stepSide * 30, fight.OPP_Y, fight.oppPalette('dash8.ghost'), { layer: 2, dither: 1 });
      for (let i = 0; i < 10; i++) { const s = ((i + 1) * 40503 + t * 977) >>> 0; frame.px(fight.OPP_X + ((s % 41) - 20) + (t < 8 ? 0 : M.stepSide * Math.min(30, (t - 8) * 3)), fight.OPP_Y - 20 - ((s >> 8) % 96), i & 1 ? c32(8, 3, 14) : c32(3, 1, 6)); }
    },
    render(ai, cfg, frame, fight) {
      if (fight.phase === 'fight' && ai.state === 'vanish' && ai.t < 30 && (ai.t >> 2) & 1) callout(frame, 'SHADOW STEP!', 128, 56, fight.COL.pink, fight.COL.black, 1);
    },
  },
};
void bayer; void textWidth; void shout;
