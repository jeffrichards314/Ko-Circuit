// Opponent AI executor + reusable modifier system.
//
// The executor runs a fighter's data file (§10): it picks patterns (gated by
// round and health phase), walks their steps (idle / move / taunt / block),
// plays moves as windup (the tell) -> active -> recovery, and decides how the
// player's punches land (counter windows, star windows, guard, combo limits).
//
// Modifiers are the `special` gimmicks. Each is a small object of optional hooks;
// fighters list them in data: special: [{ type: 'speedScale', scale: 0.8 }].
//   init(ai, cfg)                 once
//   roundStart(ai, cfg, round)
//   update(ai, cfg)               every frame
//   modifyMove(ai, cfg, move)     return an adjusted move (timings, avoidBy...)
//   onPlayerPunch(ai, cfg, p, r)  may change the punch result
//   mapInput(ai, cfg, action)     remap player input (screen flip, mirror...)
//   render(ai, cfg, frame, fight) draw overlays (lights out, rain...)
//   renderOpp(ai, cfg, frame, fight) draw right after the opponent (behind the player)
//   palette(ai, cfg)              return a palette name to draw the opponent with
//   view(ai, cfg, v)              adjust the pose/offset/visibility the opponent is drawn with
//   eligible(ai, cfg, pattern)    return false to rule a pattern out (prize wheel, tag team)
//   moveStart(ai, cfg, move)      a move's windup just began (after modifyMove)
//   openDone(ai, cfg, step)       an `open` step ran its full length
//   openBroken(ai, cfg, step)     an `open` step was cut short by a hit
//   onKnockdown(ai, cfg)          he just went down
//   moveResolved(ai, cfg, move, r) his punch just met the player: r = 'hit' | 'blocked' | 'dodged' | 'ducked'
//   betweenRounds(ai, cfg, round)  the corner break just started (after the normal between-round heal)
// Inside onPlayerPunch, ai.punch = { state, stunned } describes the opponent
// *before* the punch was resolved.
//
// Pattern steps: { idle: n } { taunt: n } { block: n } { move: id }
//   { open: n, anim, star: [a, b], heal, interrupt, stunOnInterrupt, comboLimit, limit, id, sfx, sfxLoop, sfxEvery }
//   An `open` step is a vulnerable state (gasping, eating...). Every punch lands;
//   the first hit inside `star` frames earns a star. With `interrupt` the first
//   hit ends it (and stops any healing); otherwise he flinches and stays open.
//   `limit` caps how many times per fight the step (by `id`) can happen.
// Move flags: feint (the windup never becomes a punch), punishStar (list of
//   defenses, e.g. ['ducked']: the first punch into that recovery earns a star),
//   kdWindow [a, b]: a counter that lands on exactly these windup frames is an
//   instant knockdown ("perfect hit"). Fighters may instead (or also) set
//   tauntKd [a, b]: frames into a taunt where one hit drops them.
//   Every fighter should have one of the two (design rule).
//   knockdown: true   the move is a one-hit knockdown if it lands (Major and up).
//   Modifier data on moves: cue (cueLamp), onBeat / minWindup / kdOnCue (onBeat),
//   eyes (lightsOut). Patterns may carry a `set` (tagTeam, prizeWheel).
// Phase 4 executor additions:
//   open steps may carry kd: [a, b] (a perfect hit on those frames of the open step).
//   cancels: n        on a move: counter him out of its windup and the next n
//                     pattern steps are skipped (the combo it started never comes).
//   openAfter: { when: ['dodged'], open, anim, star, id, ... }
//                     if the move's result is in `when`, he drops into that `open`
//                     step instead of recovering (Big Rig's crash into the ropes).
//   noFake: true      never turned into a circuit fake (see below).
//   call: true        (with feint) a windup that is not a punch at all: a shout, a spin, a roar.
//                     It looks nothing like one, so the perfect-play bot doesn't defend it.
//   Circuits with `fakes: p` (World, Storm: "weighted random plus fakes") turn a
//   real move into a fake with chance p: the same tell, cut short at 60%, then a
//   shrug. Fakes never hurt; he always idles FAKE_REST frames afterwards, so a
//   player who defended the fake is back in time for whatever comes next.
// Phase 5 executor additions:
//   takeover(ai, cfg)  hook: return true to freeze the fight (clock and player)
//                      while the modifier runs a scene of its own (Quinn's standoff).
//   ai.playerAction()  what the player started doing this frame, for modifiers
//                      that watch you (the Mirror, King Karver).
//   open steps: trap: true   it only LOOKS like an opening (Rourke playing possum,
//                      the Monk meditating); the perfect-play bot leaves it alone.
//   patterns: fixed: true    never shuffled, even on a shuffled circuit (Jax's
//                      memorisable opening loops); set: '...' for eligible hooks.
//   fighter: kdStar: true    his perfect hit only counts with a Star Punch, and
//                      the glint is timed for one (Iron Jaw Ignatius).
//   Randomness 'adaptive' (Grand Prix): patterns that have landed on you come back
//   more often. 'boss' (Jax): weighted, shuffled only where a pattern says so.
// Phase 6 executor additions:
//   fightStart(ai, cfg)  hook: the bell just started a round (Crowbar Cade swings at it).
//   sneak(ai, cfg)       hook: he got up mid-count to attack (get-up entry `sneak`).
//   postScene(ai, cfg, frame, fight)  hook: the ring scene is drawn, the HUD isn't yet
//                      (Eclipse flips the whole scene here).
//   view() may return ghost: true (drawn dithered: Hollow half-materialised).
//   Randomness 'all' (ZERO): adaptive weights, shuffled unless a pattern is fixed.
// Punch-Out rules (see onPlayerPunch): his guard stops everything but the openings;
//   flurries only start from counters, punishes (after a slip/duck), taunts and open
//   steps; punch early in a tell (or right before one) and that tell can't be
//   countered; keep hitting his gloves and he fires a guard counter. Fighter data:
//   stats.punishDaze (daze after a punish, fraction of stunFrames, default 0.55),
//   stats.guardCounter (override the circuit's count, 0 = never), guardCounter:
//   moveId (the move he answers with; null = none; default his quickest real punch).
// Phase 7:
//   stageChange(ai, cfg, stage)  hook: a one-round fight (the Gauntlet) moved into its
//                      next 60-second stage, which stands in for a new round
//                      (fight.stage; the Warden riots from stage 2).
//   bannerY(ai, cfg, y) -> y|null  where the ROUND / FIGHT! intro banner is drawn (default 92)
// Supers (data/fighters/super.js): once or twice a round, at a pattern-step boundary
//   that doesn't split a combo, he runs his super sequence: 'backstep' (out of reach:
//   punches whiff), a taunt (far away, or up close for a taunt golden moment),
//   'advance', then the super itself (never faked) and its follow-ups. A fighter with
//   several sequence supers takes them in turn. An inline super (Avalanche's rush) runs
//   wherever its first move is thrown. From the first frame of a super to the end of its
//   last attack he is ARMORED (`armor`): every punch clanks off and does nothing, except
//   the one that lands his golden moment (goldenHere: the taunt window, the golden move's
//   kdWindow, its recoveryKd after you defend it, or the opening a slipped super leaves),
//   which knocks him down, or (a big boss: fighter.goldenStun) stuns him wide open.
//   planSupers() picks the times at every round start (and Gauntlet stage); the
//   first time he drops under half health the next super comes early.

import { PUNCH_DAMAGE } from './scoring.js';
import { SMOKE } from '../../data/sprites/ui.js';
import { drawTextBig, drawText, textWidth, callout } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { panel } from './hud.js';
import { SUPER_BACK, SUPER_ADVANCE, SUPER_DEPTH, thenOf, chainsOf, hitOf, hitMatches, superKey, supersOf, keptSuper } from '../../data/fighters/super.js';
import { Knowledge, hasKnowledge } from './knowledge.js';
import { scaleMove } from '../../data/difficulty.js';
import { ASCENSION_MODIFIERS } from './ascension.js';
import { PHASE_B_MODIFIERS } from './asc/index.js';

// Offsets of the puffs in Gambini's smoke cloud: [dx, dy, frame delay].
const PUFFS = [[0, -100, 2], [-14, -80, 1], [14, -78, 0], [0, -60, 0], [-16, -44, 2], [16, -40, 1], [0, -22, 3], [-10, -8, 2], [12, -6, 3]];

// --- Still Water (the Monk) helpers -----------------------------------------------------------------------------------
// his super is due once the planned mark has passed (the same planSupers marks the other supers use), or at under half health
function stillWaterDue(ai) {
  if (!ai.sup || !ai.superPlan.length) return false;
  if (!ai.desperate && ai.healthFrac() < 0.5) { ai.desperate = true; ai.superPlan[0] = Math.min(ai.superPlan[0], ai.fight.realSeconds()); }
  return ai.fight.realSeconds() >= ai.superPlan[0];
}
// the super thrown as an answer: armor from the first frame (superThrow wires the chain), no step back and no taunt
function stillWaterSuper(ai) {
  const S = ai.seqSupers[ai.seqTurn++ % ai.seqSupers.length];
  ai.cur = S; ai.superPlan.shift();
  ai.armor = { S, chain: null, i: -1 };
  ai.superId = S.move;
  ai.move = null; ai.idleHits = 0; ai.superTaunt = false; ai.superFar = false;
  ai.superThrow();
}
// an answer with his calm spent in it: harder, quicker (floored), shorter recovery. A move with `fixedTell` keeps its tell.
function stillWaterCalmed(cfg, m, c) {
  if (!(c > 0.02)) return m;
  const k = m.fixedTell ? 1 : Math.max(1 - cfg.speed * c, 6 / m.windupFrames);
  const o = k < 1 ? scaleMove(m, k) : { ...m };
  return { ...o, damage: Math.round(m.damage * (1 + cfg.power * c)), recoveryFrames: Math.round(m.recoveryFrames * (1 - cfg.recover * c)), calm: c };
}

export const MODIFIERS = {
  // Practice / fight-lab aid: flash the opponent during every tell.
  tellHighlight: {
    palette(ai) {
      return ai.state === 'windup' && (ai.moveT >> 2) % 2 === 0 ? 'highlight' : null;
    },
  },
  // Scales windup and recovery (Title Defense remixes, Maestro's tempo, slow practice).
  speedScale: {
    modifyMove(ai, cfg, m) {
      const s = cfg.scale ?? 1;
      return {
        ...m,
        windupFrames: Math.max(3, Math.round(m.windupFrames * s)),
        recoveryFrames: Math.max(6, Math.round(m.recoveryFrames * (cfg.recovery ?? s))),
        counterWindow: m.counterWindow && m.counterWindow.map((v) => Math.round(v * s)),
        starWindow: m.starWindow && m.starWindow.map((v) => Math.round(v * s)),
      };
    },
  },
  // Mirrors left/right: patterns and the player's dodge directions. (Unused: Tempest Tia
  // switches with `stance`, and Eclipse's screen flip is the `eclipse` modifier.)
  mirror: {
    modifyMove(ai, cfg, m) {
      if (!ai.mods.mirrorOn) return m;
      const sw = { dodgeL: 'dodgeR', dodgeR: 'dodgeL' };
      return { ...m, avoidBy: m.avoidBy.map((a) => sw[a] || a) };
    },
    mapInput(ai, cfg, a) {
      if (!ai.mods.mirrorOn || !cfg.flipControls) return a;
      return a === 'left' ? 'right' : a === 'right' ? 'left' : a;
    },
    update(ai, cfg) { ai.mods.mirrorOn = !!cfg.on; },
  },

  // Head shots bounce off (Rocco's hard hat) until he's stunned by a counter.
  // cfg.stars: star punches count as head shots too (default true).
  hardHat: {
    onPlayerPunch(ai, cfg, p, r) {
      if (!p.high || r.result === 'whiff' || ai.punch.stunned) return;
      if (ai.know && ai.know.flag('hatOff')) return; // knocked off for good (Rocco's exploit)
      if (p.star && cfg.stars === false) return;
      if (r.result !== 'hit' && r.result !== 'blocked') return;
      ai.fight.sfx('clang'); ai.fight.event('hatClang');
      return { result: 'blocked', clang: true };
    },
  },

  // Smoke-flash teleport (Gambini): a punch that would land while he's in one
  // of cfg.states makes him vanish and reappear. Counters and stars still land.
  teleport: {
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result !== 'hit' || r.counter || p.star) return;
      if (!(cfg.states || ['idle']).includes(ai.punch.state)) return;
      ai.state = 'vanish'; ai.t = 0; ai.move = null;
      ai.mods.tpSide = ai.mods.tpSide === 1 ? -1 : 1;
      ai.fight.sfx('poof'); ai.fight.event('teleport');
      return { result: 'whiff', teleport: true };
    },
    update(ai, cfg) {
      if (ai.state === 'vanish' && ai.t >= (cfg.frames || 36)) ai.resume(cfg.after ?? 12);
    },
    view(ai, cfg, v) {
      if (ai.state !== 'vanish') return v;
      const F = cfg.frames || 36, t = ai.t;
      const back = F - t; // frames until he's fully back
      return { pose: 'idle1', dy: 0, hidden: t >= 6 && back > 8, dx: back <= 8 ? ai.mods.tpSide * back * 3 : 0 };
    },
    renderOpp(ai, cfg, frame, fight) {
      if (ai.state !== 'vanish') return;
      const F = cfg.frames || 36, t = ai.t, back = F - t;
      // a white flash of his silhouette, then a body-sized cloud where he stood
      if (t < 3) frame.blit(fight.oppSprites.get('idle1'), fight.OPP_X, fight.OPP_Y, fight.UIPAL, { solid: fight.COL.white });
      const cloud = (k, cx) => {
        if (k < 0) return;
        for (const [dx, dy, d] of PUFFS) {
          const f = Math.min(SMOKE.length - 1, (k + d) >> 2);
          frame.blit(SMOKE[f], fight.OPP_X + cx + dx, fight.OPP_Y + dy, fight.UIPAL);
        }
      };
      if (t < 18) cloud(t, 0);
      if (back <= 12) cloud(12 - back, ai.mods.tpSide * 6);
    },
  },

  // Reads repeated combos (Professor Knox): throw the same 2+ punch combo twice
  // in a row and he parries the second one and fires cfg.move straight back.
  // cfg.single (Dash Maddox's Know-It-All): the same single punch twice in a row
  // (same hand, same height, within cfg.gap frames) is enough.
  comboReader: {
    onPlayerPunch(ai, cfg, p, r) {
      const M = ai.mods, now = ai.fight.clock;
      if (cfg.single) {
        const key = p.star ? 'S' : p.side + (p.high ? 'H' : 'B');
        const again = key === M.lastKey && now - M.lastAt <= (cfg.gap || 45);
        M.lastKey = key; M.lastAt = now;
        if (!again || p.star || ai.punch.stunned || !['idle', 'recovery', 'block', 'hit', 'taunt'].includes(ai.punch.state)) return;
        M.lastKey = null;
        M.read = cfg.move; M.readT = 50;
        ai.fight.sfx('aha'); ai.fight.event('read');
        return { result: 'blocked', read: true };
      }
      if (!M.cur || now - M.lastAt > (cfg.gap || 45)) {
        if (M.cur) M.prev = M.cur.length >= 2 ? M.cur : null;
        M.cur = [];
      }
      M.lastAt = now;
      M.cur.push(p.star ? 'S' : p.side + (p.high ? 'H' : 'B'));
      if (p.star || ai.punch.stunned) return;
      if (!['idle', 'recovery', 'block', 'hit', 'taunt'].includes(ai.punch.state)) return;
      const i = M.cur.length - 1;
      if (i < 1 || !M.prev || i >= M.prev.length || !M.cur.every((k, n) => k === M.prev[n])) return;
      M.cur = []; M.prev = null;
      M.read = cfg.move; M.readT = 50;
      ai.fight.sfx('aha'); ai.fight.event('read');
      return { result: 'blocked', read: true };
    },
    update(ai) {
      const M = ai.mods;
      if (M.readT > 0) M.readT--;
      if (M.read && ['block', 'idle', 'hit', 'recovery', 'taunt'].includes(ai.state)) {
        const id = M.read; M.read = null; ai.beginMove(id);
      }
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!(M.readT > 0)) return;
      const y = fight.OPP_Y - 150 + (M.readT > 40 ? (M.readT - 40) : 0);
      callout(frame, '!', fight.OPP_X + 30, y, fight.COL.yellow, fight.COL.black, 3);
    },
  },

  // Only counters open him up (Brick Wall Brody): every other punch is absorbed
  // without a flinch until a counter stuns him. Star punches still land.
  unstaggerable: {
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result !== 'hit' || r.counter || p.star || ai.punch.stunned) return;
      if (ai.know && ai.know.flag('cracked')) return; // the wall has cracked (Brody's exploit)
      if (ai.punch.state === 'open' && ai.openStep && ai.openStep.exposed) return; // (a pattern's own opening, `exposed`: the wall is down for it)
      ai.fight.sfx('thud');
      return { result: 'blocked', absorbed: true };
    },
  },

  // ---------------------------------------------------------------- Phase 3 --

  // A signal lamp that lights up with the move (Rush Hour Ray's traffic light).
  // Moves and `open` steps carry `cue: 'red' | 'yellow' | 'green'`; the lit lamp
  // is a palette swap (cfg.palettes[cue]). Cues in cfg.blink flash.
  cueLamp: {
    palette(ai, cfg) {
      const cue = currentCue(ai);
      if (!cue || !cfg.palettes[cue]) return null;
      if ((cfg.blink || []).includes(cue) && (ai.fight.clock >> 3) & 1) return null;
      return cfg.palettes[cue];
    },
    // a glow ring around the lit lamp (cfg.lamps: offsets from the head centre, cfg.glow: colours)
    renderOpp(ai, cfg, frame, fight) {
      const cue = currentCue(ai);
      if (!cue || !cfg.lamps || !cfg.lamps[cue] || fight.phase !== 'fight') return;
      if ((cfg.blink || []).includes(cue) && (fight.clock >> 3) & 1) return;
      const v = ai.view();
      if (v.hidden) return;
      const h = fight.oppHead(v), [dx, dy] = cfg.lamps[cue];
      const x = Math.round(h.x + h.look[0] * 0.5 + dx), y = Math.round(h.y + dy);
      const col = c32(...cfg.glow[cue]);
      for (let a = 0; a < 16; a++) {
        if ((a + (fight.clock >> 2)) & 1) continue;
        const t = (a / 16) * Math.PI * 2;
        frame.px(Math.round(x + Math.cos(t) * 6), Math.round(y + Math.sin(t) * 5), col);
      }
    },
  },

  // Beat-locked punches (Pidge's head-bob, DJ Drop's entrance track).
  // Every move with `onBeat` has its windup stretched so the punch lands exactly
  // on a beat (+ cfg.phase: 0.5 = the off-beat). The tell windows stay anchored
  // to the punch. The beat comes from:
  //   cfg.period  frames per beat (a visual rhythm), or
  //   cfg.song    the song id playing: the beat is read off the AUDIO clock and
  //               re-checked every frame, so the punch stays locked to the music
  //               even if frames stutter or the game pauses. Without audio (or in
  //               slow-mo) it falls back to the frame clock.
  //   cfg.cueBeats   the move's sfx.tell is scheduled on the audio clock this many
  //               beats before impact (an audio tell that is part of the groove).
  //   cfg.lateTell   the move's own tell pose only shows for the last N frames;
  //               before that he holds cfg.holdPose (the audio is the real tell).
  //   cfg.bob     px the whole body nods on the beat (drawn on the same clock).
  // A move with `kdOnCue` gets its perfect-hit window on the cue beat.
  onBeat: {
    init(ai, cfg) {
      ai.mods.beat = { fpb: cfg.period || 3600 / (cfg.tempo || 120) };
    },
    modifyMove(ai, cfg, m) {
      if (!m.onBeat) return m;
      const B = beatNow(ai, cfg);
      const fpb = ai.mods.beat.fpb, ph = cfg.phase || 0;
      const min = (m.minWindup ?? cfg.minWindup ?? 18) / fpb;
      const land = Math.ceil(B.beats + min - ph) + ph;
      const windup = Math.round((land - B.beats) * fpb);
      const out = shiftWindows({ ...m, beatLand: land, beatSrc: B.src }, windup - m.windupFrames);
      out.windupFrames = windup;
      if (cfg.cueBeats && m.sfx && m.sfx.tell) {
        out.sfxScheduled = true;
        out.cueFrame = windup - Math.round(cfg.cueBeats * fpb);
        if (m.kdOnCue) out.kdWindow = [out.cueFrame, out.cueFrame + 3];
      }
      return out;
    },
    moveStart(ai, cfg, m) {
      if (!m.cueFrame && m.cueFrame !== 0) return;
      const A = ai.fight.audio;
      if (m.beatSrc === 'audio') {
        const t = (m.beatLand - cfg.cueBeats) * (ai.mods.beat.fpb / 60);
        A.sfxAt(m.sfx.tell, A.songAt(t));
        m.cuePlayed = true;
      }
    },
    update(ai, cfg) {
      const m = ai.move;
      if (ai.state !== 'windup' || !m || !m.onBeat) return;
      // frame-clock fallback: play the cue on its frame
      if (m.cueFrame !== undefined && !m.cuePlayed && ai.moveT >= m.cueFrame) { m.cuePlayed = true; ai.fight.sfx(m.sfx.tell); }
      if (m.beatSrc !== 'audio') return;
      const B = beatNow(ai, cfg);
      if (B.src !== 'audio') return;
      // re-lock the impact frame to the music (drift, dropped frames, pause)
      let left = Math.round((m.beatLand - B.beats) * ai.mods.beat.fpb);
      if (left < -2) {
        // The beat went by while the game was paused: land on a later one, and
        // re-cue it if there's still a beat of warning left. Only once: if the
        // game keeps falling behind the music (a throttled tab, a slow machine),
        // stop chasing the beat and let the windup run out on the frame clock.
        if (m.retargeted) { m.beatSrc = 'frames'; return; }
        m.retargeted = true;
        m.beatLand += Math.ceil(-left / ai.mods.beat.fpb) + 1;
        left = Math.round((m.beatLand - B.beats) * ai.mods.beat.fpb);
        if (m.cueFrame !== undefined && m.beatLand - cfg.cueBeats > B.beats) {
          ai.fight.audio.sfxAt(m.sfx.tell, ai.fight.audio.songAt((m.beatLand - cfg.cueBeats) * (ai.mods.beat.fpb / 60)));
        }
      }
      const want = ai.moveT + Math.max(0, left) + 1; // moveT ticks once more this frame before the check
      const d = want - m.windupFrames;
      if (d) { shiftWindows(m, d); m.windupFrames = want; if (m.cueFrame !== undefined) m.cueFrame += d; }
    },
    view(ai, cfg, v) {
      if (cfg.lateTell && ai.state === 'windup' && ai.move && ai.move.onBeat && ai.moveT < ai.move.windupFrames - cfg.lateTell) v = { ...v, pose: cfg.holdPose };
      if (cfg.bob && ['idle', 'windup', 'block', 'taunt'].includes(ai.state)) {
        const B = beatNow(ai, cfg);
        const f = B.beats - Math.floor(B.beats);
        if (f < 0.25) v = { ...v, dy: v.dy + cfg.bob };
      }
      return v;
    },
  },

  // Crowd-cheer meter (Mayor McBride). Fills over time (faster while he plays
  // to the crowd in an `open` step with id cfg.wave, and whenever he lands one).
  // Full: his punches hit cfg.mult harder and he glows (cfg.palette).
  // A knockdown resets it; hits on him while he's waving drain it (boos).
  crowdMeter: {
    init(ai) { ai.mods.cheer = 0; },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (f.phase !== 'fight') return;
      if (M.cheer < 1) {
        const waving = ai.state === 'open' && ai.openStep && ai.openStep.id === cfg.wave;
        M.cheer = Math.min(1, M.cheer + cfg.rate * (waving ? cfg.waveMult || 3 : 1));
        if (ai.move && ai.moveResult === 'hit' && M.counted !== ai.move) { M.counted = ai.move; M.cheer = Math.min(1, M.cheer + (cfg.onLand || 0.1)); }
        if (M.cheer >= 1) { f.sfx('crowd', true); f.sfx('fanfare'); f.event('crowdFull'); f.arena.reaction('star'); M.fullT = 0; }
      } else M.fullT = (M.fullT || 0) + 1;
    },
    modifyMove(ai, cfg, m) {
      return ai.mods.cheer >= 1 ? { ...m, damage: Math.round(m.damage * (cfg.mult || 1.5)) } : m;
    },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result === 'hit' && ai.punch.state === 'open' && ai.mods.cheer < 1) ai.mods.cheer = Math.max(0, ai.mods.cheer - (cfg.drainOnHit || 0.04));
    },
    onKnockdown(ai) { ai.mods.cheer = 0; ai.mods.fullT = 0; },
    palette(ai, cfg) {
      return ai.mods.cheer >= 1 && (ai.fight.clock >> 3) & 1 ? cfg.palette : null;
    },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const v = ai.mods.cheer, full = v >= 1;
      panel(frame, 108, 31, 78, 10);
      drawText(frame, 'CHEER', 111, 33, full && (fight.clock >> 2) & 1 ? fight.COL.yellow : fight.COL.cyan, { mono: false });
      const bx = 113 + textWidth('CHEER', false) + 3, bw = 183 - bx;
      frame.rect(bx, 33, bw, 6, fight.COL.barBack);
      frame.rect(bx + 1, 34, Math.round((bw - 2) * v), 4, full ? ((fight.clock >> 2) & 1 ? fight.COL.red : fight.COL.yellow) : fight.COL.orange);
      frame.rect(bx + 1, 34, Math.round((bw - 2) * v), 1, fight.COL.white);
      if (full && M_T(ai) < 90) callout(frame, 'THE CROWD LOVES HIM!', 128, 60, (fight.clock >> 3) & 1 ? fight.COL.yellow : fight.COL.white, fight.COL.black, 1);
    },
  },

  // Tag team (the Gemini Twins): one of cfg.members comes out each round, at
  // random. Each has his own palette and his own pattern `set`.
  tagTeam: {
    init(ai, cfg) { pickTwin(ai, cfg); },
    roundStart(ai, cfg) { pickTwin(ai, cfg); },
    // a Gauntlet stage: the other brother tags in as soon as this one is back in his stance
    stageChange(ai) { ai.mods.tagPending = true; },
    update(ai, cfg) {
      const M = ai.mods;
      if (M.tagT > 0) M.tagT--;
      if (!M.tagPending || ai.state !== 'idle' || ai.fight.phase !== 'fight') return;
      M.tagPending = false;
      const L = cfg.members.filter((m) => m !== M.twin);
      if (L.length) { M.twin = L[Math.floor(Math.random() * L.length)]; ai.pattern = null; }
      M.tagT = 90; ai.fight.sfx('crowd', true);
    },
    eligible(ai, cfg, p) { return !p.set || p.set === ai.mods.twin.set; },
    palette(ai) { return ai.mods.twin.palette; },
    render(ai, cfg, frame, fight) {
      if (fight.phase === 'fight' && ai.mods.tagT > 0 && (ai.mods.tagT >> 2) & 1) callout(frame, `${ai.mods.twin.name} TAGS IN!`, 128, 56, ai.mods.twin.color ? c32(...ai.mods.twin.color) : fight.COL.cyan, fight.COL.black, 1);
      if (fight.phase !== 'intro') return;
      callout(frame, `${ai.mods.twin.name} COMES OUT!`, 128, 122, ai.mods.twin.color ? c32(...ai.mods.twin.color) : fight.COL.cyan, fight.COL.black, 1);
    },
  },

  // Lights out (Count Midnight). When his cfg.trigger move (a finger snap)
  // finishes, the arena goes black for cfg.frames: only his glowing eyes show.
  // Each move's `eyes: [dx, dy, wide]` is how his eyes give it away.
  // Punch him during the snap and the lights stay on. Lights come back when
  // anyone goes down.
  lightsOut: {
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (f.phase !== 'fight') { if (M.dark > 0) { M.dark = 0; f.sfx('lightsOn'); } return; }
      if (ai.moveId === cfg.trigger && ai.state === 'recovery' && ai.moveResult === 'feint' && M.snapped !== ai.move) {
        M.snapped = ai.move; M.dark = cfg.frames; f.sfx('lightsOff');
      }
      if (M.dark > 0 && --M.dark === 0) { f.sfx('lightsOn'); f.event('lightsOn'); }
    },
    renderOpp(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!(M.dark > 0)) return;
      const F = cfg.fade || 14, into = cfg.frames - M.dark;
      if ((into < F || M.dark < F) && ((into < F ? into : M.dark) >> 1) & 1) return; // flicker
      frame.rect(0, 0, 256, 224, c32(...(cfg.dark || [1, 1, 3])));
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
    },
  },

  // Charge-up (the Strongman). An `open` step with id cfg.step is the flex:
  // if it runs its full length his next punch hits cfg.mult harder (and he
  // glows cfg.palette); hit him during it and the charge is lost.
  charge: {
    openDone(ai, cfg, step) { if (step.id === cfg.step) { ai.mods.charged = true; ai.fight.sfx('powerUp'); } },
    openBroken(ai, cfg, step) { if (step.id === cfg.step) ai.fight.sfx('deflate'); },
    modifyMove(ai, cfg, m) {
      if (!ai.mods.charged || m.feint) return m;
      ai.mods.charged = false;
      return { ...m, damage: Math.round(m.damage * (cfg.mult || 2)), charged: true };
    },
    palette(ai, cfg) {
      const on = ai.mods.charged || (ai.move && ai.move.charged && ['windup', 'active'].includes(ai.state));
      return on && (ai.fight.clock >> 2) & 1 ? cfg.palette : null;
    },
  },

  // Evasive (Tightrope Tess): she slips every punch except in cfg.hittable
  // states (the landing after her flip), when stunned, or a perfect hit.
  // Evaded punches cost hearts like blocks. Mid-attack she just leans away.
  evasive: {
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result === 'whiff' || r.knockdown || ai.punch.stunned) return;
      if ((cfg.hittable || ['open']).includes(ai.punch.state)) return;
      ai.fight.sfx('whiff');
      if (!['windup', 'active'].includes(ai.punch.state)) {
        ai.state = 'evade'; ai.t = 0; ai.move = null; ai.combo = 0;
        ai.mods.evadeSide = p.side === 'L' ? 1 : -1;
      }
      return { result: 'blocked', evaded: true, absorbed: true };
    },
    update(ai, cfg) { if (ai.state === 'evade' && ai.t >= (cfg.frames || 18)) ai.resume(cfg.after ?? 10); },
    view(ai, cfg, v) {
      if (ai.state !== 'evade') return v;
      const s = ai.mods.evadeSide, F = cfg.frames || 18, k = ai.t < 4 ? ai.t / 4 : ai.t > F - 5 ? (F - ai.t) / 5 : 1;
      return { ...v, pose: s < 0 ? cfg.poseL : cfg.poseR, dx: Math.round(s * 10 * k), dy: 0 };
    },
  },

  // Prize wheel (Jester Jinx): before every round a wheel spins and lands on a
  // slice; the slice's `set` picks the patterns he uses that round.
  prizeWheel: {
    init(ai, cfg) { spinWheel(ai, cfg); },
    roundStart(ai, cfg) { spinWheel(ai, cfg); },
    // a Gauntlet stage: the wheel lands on a new slice once he's back in his stance
    stageChange(ai) { ai.mods.spinPending = true; },
    update(ai, cfg) {
      const M = ai.mods;
      if (M.wheel.showT > 0) M.wheel.showT--;
      if (!M.spinPending || ai.state !== 'idle' || ai.fight.phase !== 'fight') return;
      M.spinPending = false;
      const was = M.wheel.pick;
      do spinWheel(ai, cfg); while (cfg.slices.length > 1 && M.wheel.pick === was);
      M.wheel.showT = 100; ai.fight.sfx('ding');
    },
    eligible(ai, cfg, p) { return !p.set || p.set === cfg.slices[ai.mods.wheel.pick].set; },
    render(ai, cfg, frame, fight) {
      const W = ai.mods.wheel, S = cfg.slices, n = S.length;
      const pick = S[W.pick];
      if (fight.phase === 'fight' && (W.showT > 0 || (fight.clockFrames > 180 * fight.FRAMES_PER_SEC - 100 && fight.round === W.round))) {
        callout(frame, pick.label, 128, 40, c32(...pick.color), fight.COL.black, 1);
        return;
      }
      if (fight.phase !== 'intro') return;
      const T = fight.pt, SPIN = 64;
      if (T === 2) fight.sfx('wheelStart');
      const e = Math.min(1, T / SPIN), ease = 1 - (1 - e) ** 3;
      const target = -((W.pick + 0.5) / n) * Math.PI * 2;          // pick under the pointer
      const ang = target - (1 - ease) * Math.PI * 2 * 4;
      if (T < SPIN && Math.floor(ang / (Math.PI * 2 / n)) !== W.lastSlice) { W.lastSlice = Math.floor(ang / (Math.PI * 2 / n)); fight.sfx('tick'); }
      if (T === SPIN) fight.sfx('ding');
      const cx = 128, cy = 62, R = 25;
      for (let y = -R - 1; y <= R + 1; y++) for (let x = -R - 1; x <= R + 1; x++) {
        const d = Math.hypot(x + 0.5, y + 0.5);
        if (d > R + 1) continue;
        if (d > R) { frame.px(cx + x, cy + y, fight.COL.black); continue; }
        if (d > R - 2) { frame.px(cx + x, cy + y, (Math.round(Math.atan2(y, x) * 8) & 1) ? fight.COL.yellow : fight.COL.white); continue; }
        let a = Math.atan2(x, -y) - ang;                               // 0 = straight up
        a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const k = Math.floor((a / (Math.PI * 2)) * n);
        const edge = Math.abs(a - ((k + 0.5) / n) * Math.PI * 2) > (Math.PI / n) - 0.06 && d > 4;
        frame.px(cx + x, cy + y, edge || d < 3 ? fight.COL.black : c32(...S[k].color));
      }
      frame.rect(cx - 1, cy - 1, 3, 3, fight.COL.yellow);
      // pointer
      for (let i = 0; i < 5; i++) frame.rect(cx - 4 + i, cy - R - 6 + i, 9 - i * 2, 1, i === 0 ? fight.COL.black : fight.COL.red);
      if (T >= SPIN) callout(frame, pick.label, 128, 118, (fight.clock >> 2) & 1 ? c32(...pick.color) : fight.COL.white, fight.COL.black, 2);
    },
  },

  // Spotlights (Ringmaster Rex). When his cfg.trigger call finishes, a blinding
  // spotlight washes over one half of the screen for cfg.frames (the side is
  // random). Read the other half, and listen: every move has its own sound.
  // Punch him during the call and it's cancelled. Lights reset when anyone goes down.
  spotlight: {
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (f.phase !== 'fight') { M.spot = 0; return; }
      if (ai.moveId === cfg.trigger && ai.state === 'recovery' && ai.moveResult === 'feint' && M.called !== ai.move) {
        M.called = ai.move; M.spot = cfg.frames; M.spotT = 0; M.side = Math.random() < 0.5 ? -1 : 1; f.sfx('spotOn'); f.event('spotOn');
      }
      if (M.spot > 0) { M.spot--; M.spotT++; }
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!(M.spot > 0)) return;
      const grow = Math.min(1, M.spotT / 10), fade = Math.min(1, M.spot / 12);
      const k = grow * fade;
      const hot = c32(31, 31, 26), warm = c32(31, 29, 17), rim = c32(28, 22, 8);
      const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      for (let y = 30; y < 214; y++) for (let x = 0; x < 256; x++) {
        const d = M.side < 0 ? 128 - x : x - 128;                    // depth into the lit half
        const dens = (Math.min(1, (d + 14) / 30)) * k;               // soft near the centre line
        if (dens <= 0) continue;
        const th = B[(y & 3) * 4 + (x & 3)] / 16;
        if (th < dens) frame.px(x, y, d > 40 ? hot : d > 10 ? warm : rim);
      }
    },
  },

  // ---------------------------------------------------------------- Phase 4 --

  // Stance switch (Tempest Tia). An `open` step with id cfg.step is the hop from
  // orthodox to southpaw (or back): when it ends, everything mirrors. Her poses
  // draw left/right mirrored, and every dodge side in her moves swaps with them.
  // She starts every round orthodox.
  stance: {
    init(ai) { ai.mods.mirrorOn = false; },
    roundStart(ai) { ai.mods.mirrorOn = false; ai.mods.switchT = 0; },
    openDone(ai, cfg, step) {
      if (step.id !== cfg.step) return;
      ai.mods.mirrorOn = !ai.mods.mirrorOn; ai.mods.switchT = 70;
      ai.fight.sfx('stance');
    },
    update(ai) { if (ai.mods.switchT > 0) ai.mods.switchT--; },
    modifyMove(ai, cfg, m) {
      if (!ai.mods.mirrorOn) return m;
      const sw = { dodgeL: 'dodgeR', dodgeR: 'dodgeL' };
      return { ...m, avoidBy: m.avoidBy.map((a) => sw[a] || a) };
    },
    view(ai, cfg, v) {
      return ai.mods.mirrorOn && v.pose[0] !== '~' ? { ...v, pose: '~' + v.pose, dx: -v.dx } : v;
    },
    render(ai, cfg, frame, fight) {
      const on = ai.mods.mirrorOn;
      if (!['fight', 'oppDown', 'playerDown'].includes(fight.phase)) return;
      // stance badge under the timer
      const label = on ? 'SOUTHPAW' : 'ORTHODOX', w = textWidth(label, false) + 8;
      panel(frame, 128 - (w >> 1), 31, w, 10);
      drawText(frame, label, 128 - (textWidth(label, false) >> 1), 33, on ? fight.COL.pink : fight.COL.cyan, { mono: false });
      if (ai.mods.switchT > 0 && (ai.mods.switchT >> 2) & 1) callout(frame, on ? 'SOUTHPAW!' : 'ORTHODOX!', 128, 56, on ? fight.COL.pink : fight.COL.cyan, fight.COL.black, 2);
    },
  },

  // Cutman (Doc Sutures). Once per fight, at the first corner break where he's
  // below cfg.below of his health, he stitches himself back up to full.
  // A one-round fight has no corner break, so there he does it at a new stage, the
  // next time he's back in his stance.
  cutman: {
    betweenRounds(ai, cfg) {
      if (ai.mods.stitched || ai.healthFrac() >= (cfg.below ?? 0.8)) return;
      ai.mods.stitched = true;
      ai.health = ai.maxHealth;
      ai.mods.cornerNote = cfg.note || 'STITCHED UP: FULL HP!'; // keep it under 30 characters (it's drawn in the mono font)
    },
    stageChange(ai, cfg) { if (!ai.mods.stitched && ai.healthFrac() < (cfg.below ?? 0.8)) ai.mods.stitchPending = true; },
    update(ai) {
      const M = ai.mods;
      if (M.stitchT > 0) M.stitchT--;
      if (!M.stitchPending || ai.state !== 'idle' || ai.fight.phase !== 'fight') return;
      M.stitchPending = false; M.stitched = true;
      ai.health = ai.maxHealth;
      M.stitchT = 90; ai.fight.sfx('stitch');
    },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      // his med kit: a red cross while the stitches are still unused
      panel(frame, 108, 31, 40, 10);
      const used = ai.mods.stitched;
      drawText(frame, 'KIT', 111, 33, used ? fight.COL.grey : fight.COL.white, { mono: false });
      const x = 134, y = 33, col = used ? fight.COL.grey : fight.COL.red;
      frame.rect(x + 2, y, 3, 7, col); frame.rect(x, y + 2, 7, 3, col);
      if (used) for (let i = 0; i < 7; i++) frame.px(x + i, y + 6 - i, fight.COL.black);
      if (fight.phase === 'fight' && ai.mods.stitchT > 0 && (ai.mods.stitchT >> 2) & 1) callout(frame, 'STITCHED UP!', 128, 56, fight.COL.red, fight.COL.black, 1);
    },
  },

  // Parry and riposte (The Baron). A punch thrown while he's on guard (cfg.states)
  // is parried with a CLINK and answered at once with cfg.move. Counters,
  // punishes, stuns and star punches still get through.
  parry: {
    onPlayerPunch(ai, cfg, p, r) {
      if (p.star || ai.punch.stunned || r.counter) return;
      if (!(cfg.states || ['idle', 'block', 'taunt']).includes(ai.punch.state)) return;
      if (r.result !== 'hit' && r.result !== 'blocked') return;
      ai.fight.sfx('parry'); ai.fight.event('parry');
      ai.mods.riposte = cfg.move; ai.mods.parryT = 12; ai.mods.parrySide = p.side;
      return { result: 'blocked', parried: true };
    },
    update(ai) {
      const M = ai.mods;
      if (M.parryT > 0) M.parryT--;
      if (M.riposte && ['idle', 'block', 'taunt'].includes(ai.state)) { const id = M.riposte; M.riposte = null; ai.beginMove(id, { forced: true }); }
    },
    view(ai, cfg, v) {
      return ai.mods.parryT > 0 && ai.state === 'windup' && ai.moveId === cfg.move ? { ...v, pose: ai.mods.parrySide === 'L' ? cfg.poseL : cfg.poseR } : v;
    },
  },

  // Hurricane flurries (Hurricane Hank). Moves flagged `flurry` come in a long
  // chain. Slip every one and you're fine; eat one and you're caught in the
  // storm: the chain keeps landing while you're stunned, and the move flagged
  // `flurryEnd` becomes a one-hit knockdown.
  hurricane: {
    moveResolved(ai, cfg, m, r) {
      if (!m.flurry) return;
      if (r === 'hit') { if (!ai.mods.caught) ai.mods.caughtT = 60; ai.mods.caught = true; }
      else ai.mods.caught = false;
    },
    modifyMove(ai, cfg, m) {
      if (!m.flurry) { ai.mods.caught = false; return m; }
      if (m.flurryEnd && ai.mods.caught && ai.fight.player.state === 'hit') return { ...m, knockdown: true, name: m.name + ' (EYE!)' };
      return m;
    },
    update(ai) { if (ai.mods.caughtT > 0) ai.mods.caughtT--; },
    render(ai, cfg, frame, fight) {
      void frame; void fight; // (no call-out: spec §4)
    },
  },

  // Ice armour (Glacier). Every punch bounces off (costing hearts like a block)
  // except counters inside his short counter windows, star punches, and punches
  // while he's stunned or in a cfg.hittable state. Each punch that bounces off
  // his guard is answered with cfg.move. His armour shows the window: the ice
  // flashes (cfg.flash palette) on exactly the frames to press.
  frozen: {
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result === 'whiff' || r.counter || r.knockdown || p.star || ai.punch.stunned) return;
      if ((cfg.hittable || []).includes(ai.punch.state)) return;
      ai.fight.sfx('ice');
      if (!['windup', 'active'].includes(ai.punch.state)) ai.mods.counterQ = cfg.move;
      return { result: 'blocked', absorbed: true };
    },
    update(ai) {
      const M = ai.mods;
      if (M.counterQ && ['idle', 'block', 'taunt', 'recovery'].includes(ai.state)) { const id = M.counterQ; M.counterQ = null; ai.beginMove(id, { forced: true }); }
    },
    palette(ai, cfg) {
      const m = ai.move, lead = cfg.lead ?? 4;
      if (ai.state !== 'windup' || !m || !m.counterWindow) return null;
      const f = ai.moveT + lead;
      return f >= m.counterWindow[0] && f <= m.counterWindow[1] ? cfg.flash : null;
    },
  },

  // Tempo (Maestro Vale). Every cfg.every real seconds the tempo steps up: his
  // windups, recoveries and the gaps between moves shrink to cfg.scales[step]
  // (never below cfg.minWindup). Each new round (Gauntlet stage) adds one step.
  tempo: {
    init(ai) { ai.mods.tempo = 0; ai.mods.acc = 0; },
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods;
      if (f.phase !== 'fight') return;
      const step = Math.min(cfg.scales.length - 1, Math.floor(f.realSeconds() / cfg.every) + (f.stage - 1) * (cfg.roundStep ?? 1));
      if (step !== M.tempo) { M.tempo = step; M.tempoT = 80; f.sfx('tempoUp'); f.event('tempoUp'); }
      if (M.tempoT > 0) M.tempoT--;
      // the gaps between his moves shrink with the tempo
      if (['idle', 'taunt', 'block'].includes(ai.state) && ai.wait > 1) {
        M.acc += 1 / cfg.scales[step] - 1;
        while (M.acc >= 1 && ai.wait > 1) { ai.wait--; M.acc--; }
      }
    },
    modifyMove(ai, cfg, m) {
      const s = cfg.scales[ai.mods.tempo || 0];
      if (s >= 1) return m;
      const w = Math.max(Math.min(m.windupFrames, cfg.minWindup ?? 9), Math.round(m.windupFrames * s));
      const k = w / m.windupFrames;
      const sc = (win) => win && [Math.max(1, Math.round(win[0] * k)), Math.max(1, Math.round(win[1] * k))];
      return {
        ...m, windupFrames: w,
        recoveryFrames: Math.max(8, Math.round(m.recoveryFrames * s)),
        counterWindow: sc(m.counterWindow), starWindow: sc(m.starWindow), kdWindow: m.kdWindow && fitKd(sc(m.kdWindow), w),
        animation: { ...m.animation, windupRate: m.animation.windupRate && Math.max(2, Math.round(m.animation.windupRate * k)), windupHold: m.animation.windupHold && Math.round(m.animation.windupHold * k) },
      };
    },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const M = ai.mods, name = cfg.names[M.tempo || 0];
      panel(frame, 96, 31, 64, 10);
      // a little metronome needle ticking at the current tempo
      const period = Math.round(60 * cfg.scales[M.tempo || 0]);
      const sw = Math.sin((fight.clock / period) * Math.PI);
      const hot = (M.tempo || 0) >= cfg.scales.length - 2;
      drawText(frame, name, 99, 33, hot ? fight.COL.red : fight.COL.yellow, { mono: false });
      const bx = 153, by = 39;
      for (let i = 0; i < 6; i++) frame.px(Math.round(bx + sw * i * 0.6), by - i, fight.COL.white);
      frame.rect(bx - 2, by, 5, 1, fight.COL.grey);
      if (M.tempoT > 0 && M.tempo > 0 && (M.tempoT >> 2) & 1) callout(frame, name + '!', 128, 56, fight.COL.yellow, fight.COL.black, 2);
    },
  },

  // Lightning (Bolt Brennan). A flash of lightning comes before every move
  // flagged `bolt`, but the strike lands a random cfg.delay [min, max] frames
  // later. He only drops his shoulder (the move's own tell pose) for its last
  // windupFrames; until then he holds cfg.holdPose. The flash is the lie; the
  // shoulder is the truth.
  lightning: {
    modifyMove(ai, cfg, m) {
      if (!m.bolt) return m;
      const lo = Math.max(cfg.delay[0], m.windupFrames);
      const d = lo + Math.floor(Math.random() * (cfg.delay[1] - lo + 1));
      const out = shiftWindows({ ...m, boltHold: d - m.windupFrames }, d - m.windupFrames);
      out.windupFrames = d;
      return out;
    },
    moveStart(ai, cfg, m) {
      if (!m.bolt) return;
      // the flash is the arena's own lightning (a fork in the sky, the crowd lit up)
      ai.fight.sfx('thunder');
      ai.fight.arena.reaction('lightning');
    },
    view(ai, cfg, v) {
      const m = ai.move;
      if (ai.state === 'windup' && m && m.bolt && ai.moveT < m.boltHold) return { ...v, pose: (ai.fight.clock >> 3) & 1 ? cfg.holdPose : cfg.holdPose2 || cfg.holdPose };
      return v;
    },
  },

  // Rain (Downpour). Streaks of rain fall in front of him, partly hiding his
  // tells; cfg.density[round - 1] streaks, heavier every round. Every move keeps
  // its own sound, so your ears still work.
  rain: {
    renderOpp(ai, cfg, frame, fight) {
      const n = cfg.density[Math.min(cfg.density.length - 1, (fight.stage || 1) - 1)];
      const t = fight.clock;
      const hi = c32(...(cfg.hi || [24, 27, 31])), lo = c32(...(cfg.lo || [13, 16, 22]));
      for (let i = 0; i < n; i++) {
        const seed = (i * 2654435761) >>> 0;
        const x0 = 20 + (seed % 216), sp = 5 + ((seed >> 8) % 4), len = 5 + ((seed >> 12) % 5);
        const y = ((seed >> 4) % 220 + t * sp) % 230 - 6;
        const x = x0 - Math.round(y * 0.25);
        for (let j = 0; j < len; j++) frame.px(((x - (j >> 2)) % 256 + 256) % 256, y + j, j < 2 ? hi : lo);
      }
    },
  },

  // Spin count (Cyclone Cole). A move with `spins: n` is a spinning windup: a
  // whoosh on every turn (cfg.rot frames each), and n hits follow.
  spinCount: {
    update(ai, cfg) {
      const m = ai.move;
      if (ai.state === 'windup' && m && m.spins && ai.moveT % cfg.rot === 1 && ai.moveT < m.spins * cfg.rot) ai.fight.sfx('spin');
    },
    render(ai, cfg, frame, fight) {
      // the turns counted off with little arrows over his head, as they happen
      const m = ai.move;
      if (ai.state !== 'windup' || !m || !m.spins || !cfg.arrows) return;
      const done = Math.min(m.spins, Math.floor(ai.moveT / cfg.rot) + 1);
      const h = fight.oppHead(ai.view());
      for (let i = 0; i < done; i++) {
        const x = Math.round(h.x - (done - 1) * 5 + i * 10), y = Math.round(h.y - 34);
        for (let k = 0; k < 5; k++) { frame.px(x - 2 + k, y, fight.COL.white); }
        frame.px(x + 2, y - 1, fight.COL.white); frame.px(x + 2, y + 1, fight.COL.white); frame.px(x + 3, y, fight.COL.white);
      }
    },
  },

  // The snowball (Avalanche). Blocking his punches still costs you cfg.blockCost
  // hearts. Every punch of his that lands packs the snowball; at cfg.hits he
  // rolls into cfg.rush, a string of punches that must be dodged. A knockdown
  // (either way) or a new round melts it back to nothing.
  avalanche: {
    init(ai) { ai.mods.snow = 0; },
    roundStart(ai) { ai.mods.snow = 0; },
    onKnockdown(ai) { ai.mods.snow = 0; },
    moveResolved(ai, cfg, m, r) {
      const f = ai.fight, M = ai.mods;
      if (r === 'blocked') { f.loseHearts(cfg.blockCost || 1); f.sfx('crunch'); }
      if (r === 'hit' && !m.rush && f.player.state !== 'down') {
        M.snow++;
        if (M.snow >= cfg.hits) { M.snow = 0; ai.forced.push(...cfg.rush); M.rushT = 90; f.sfx('rumble'); f.arena.reaction('star'); }
      }
      if (f.player.state === 'down') M.snow = 0;
    },
    update(ai) { if (ai.mods.rushT > 0) ai.mods.rushT--; },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      panel(frame, 104, 31, 48, 10);
      drawText(frame, 'SNOW', 107, 33, fight.COL.cyan, { mono: false });
      for (let i = 0; i < cfg.hits; i++) {
        const x = 132 + i * 6, on = i < ai.mods.snow;
        frame.rect(x, 34, 4, 4, on ? fight.COL.white : fight.COL.barBack);
        if (on) frame.px(x, 34, fight.COL.cyan);
      }
      if (ai.mods.rushT > 0 && (ai.mods.rushT >> 2) & 1) callout(frame, 'AVALANCHE!', 128, 56, fight.COL.white, fight.COL.black, 2);
    },
  },

  // ---------------------------------------------------------------- Phase 5 --

  // Playing possum (Old Man Rourke). An `open` step with id cfg.step is a fake
  // stagger: it looks like he's out on his feet, but he's winking. Punch into it
  // and he's gone (the punch bounces, costing hearts like a block) and he snaps
  // back with cfg.trap, a full-speed combo, at once. Leave him be and he snaps
  // back anyway (the next steps of his pattern). Star punches he just slips.
  possum: {
    onPlayerPunch(ai, cfg, p, r) {
      if (ai.punch.state !== 'open' || !ai.openStep || ai.openStep.id !== cfg.step || r.knockdown) return;
      const f = ai.fight;
      if (p.star) { f.sfx('whiff'); return { result: 'whiff' }; }
      f.sfx('gotcha'); f.event('possumTrap');
      ai.openStep = null; ai.state = 'idle'; ai.t = 0; ai.wait = 1; ai.move = null;
      ai.forced.push(...cfg.trap);
      ai.mods.gotchaT = 60;
      return { result: 'blocked', absorbed: true };
    },
    update(ai) { if (ai.mods.gotchaT > 0) ai.mods.gotchaT--; },
    render(ai, cfg, frame, fight) {
      if (ai.mods.gotchaT > 0 && fight.phase === 'fight' && (ai.mods.gotchaT >> 2) & 1) callout(frame, 'GOTCHA, SONNY!', 128, 56, fight.COL.yellow, fight.COL.black, 2);
    },
  },

  // Iron jaw (Iron Jaw Ignatius). Nothing but a Star Punch puts him down: every
  // other punch still hurts, but never below 1 HP. Once he's ROCKED (at or under
  // cfg.rocked of his health) a Star Punch drops him. His perfect hit (tauntKd +
  // the fighter's kdStar) is a Star Punch timed to the glint: down, whatever his health.
  ironJaw: {
    afterKnowledge(ai, cfg, p, r) { return r.exploit ? this.onPlayerPunch(ai, cfg, p, r) : r; },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result !== 'hit') return;
      const floor = Math.round(ai.maxHealth * cfg.rocked);
      if (p.star) {
        if (r.knockdown) return; // the perfect hit: the fight drops him (and calls it PERFECT)
        return ai.health - r.damage <= floor ? { ...r, damage: Math.max(r.damage, ai.health) } : undefined;
      }
      const out = { ...r, knockdown: false };
      if (ai.health - r.damage < 1) { out.damage = Math.max(0, ai.health - 1); ai.fight.sfx('clang'); ai.mods.jawT = 40; }
      return out;
    },
    update(ai) { if (ai.mods.jawT > 0) ai.mods.jawT--; },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const rocked = ai.health <= Math.round(ai.maxHealth * cfg.rocked);
      const label = rocked ? 'ROCKED!' : 'IRON JAW';
      const w = textWidth(label, false) + 8;
      panel(frame, 128 - (w >> 1), 31, w, 10);
      drawText(frame, label, 128 - (textWidth(label, false) >> 1), 33, rocked ? ((fight.clock >> 3) & 1 ? fight.COL.red : fight.COL.yellow) : fight.COL.grey, { mono: false });
      if (ai.mods.jawT > 0 && (ai.mods.jawT >> 2) & 1) callout(frame, 'ONLY A STAR!', 128, 56, fight.COL.white, fight.COL.black, 2);
    },
  },

  // Homage (Duchess Kane): each of her patterns borrows an old champion's
  // signature (`homage` on the pattern: the champion's name). When one starts,
  // she announces whose it is; the name stays under the clock while it runs.
  homage: {
    update(ai) {
      const M = ai.mods, p = ai.pattern;
      if (p !== M.hp) { M.hp = p; if (p && p.homage && ai.fight.phase === 'fight') { M.homT = 70; ai.fight.sfx('fanfare'); } }
      if (M.homT > 0) M.homT--;
    },
    render(ai, cfg, frame, fight) {
      const p = ai.pattern;
      if (!['fight', 'oppDown', 'playerDown'].includes(fight.phase) || !p || !p.homage) return;
      if (ai.move && ai.move.sig && ['windup', 'active'].includes(ai.state)) return; // (the borrowed signature's own badge has the spot: sigTint)
      const w = textWidth(p.homage, false) + 8;
      panel(frame, 128 - (w >> 1), 31, w, 10);
      drawText(frame, p.homage, 128 - (textWidth(p.homage, false) >> 1), 33, c32(...(p.color || [31, 24, 8])), { mono: false });
      if (ai.mods.homT > 0 && (ai.mods.homT >> 2) & 1) callout(frame, `A LA ${p.homage}!`, 128, 56, c32(...(p.color || [31, 24, 8])), fight.COL.black, 1);
    },
  },

  // The reflection (The Mirror). He remembers your last cfg.size actions
  // (punches by hand and height, slips, blocks, ducks, star punches). When his
  // cfg.call move (a tap on the glass) finishes, he plays them back at you in
  // order, each as its mirror image (cfg.map: your action -> his move): your
  // left hook comes back from the same side of the screen, your slips and
  // blocks come back as harmless slips and blocks, your Star Punch comes back as
  // a one-hit knockdown. The memory is wiped once it's played, so what you do
  // next is what comes back next. Counter a reflection and the rest of the
  // replay shatters. The memory is shown under the clock.
  reflect: {
    init(ai) { ai.mods.mem = []; },
    roundStart(ai) { ai.forced.length = 0; ai.mods.play = null; },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      const a = ai.playerAction();
      if (a && cfg.map[a.key]) {
        const last = M.mem[M.mem.length - 1];
        if (a.key === 'duck' && last && last.key === 'block' && f.clock - last.at <= 20) M.mem.pop(); // the 1st tap of a duck
        M.mem.push({ key: a.key, at: f.clock });
        if (M.mem.length > cfg.size) M.mem.shift();
      }
      if (ai.moveId === cfg.call && ai.state === 'recovery' && ai.moveResult === 'feint' && M.called !== ai.move) {
        M.called = ai.move;
        M.play = M.mem.map((e) => e.key); M.playIdx = -1;
        M.mem = [];
        ai.forced.push(...M.play.map((k) => cfg.map[k]));
        if (!M.play.length) { M.play = null; f.sfx('tired'); }
      }
      if (M.play && !ai.forced.length && !(ai.move && ai.move.reflected && ['windup', 'active', 'recovery'].includes(ai.state))) M.play = null;
      if (M.crackT > 0) M.crackT--;
    },
    moveStart(ai, cfg, m) { if (m.reflected && ai.mods.play) ai.mods.playIdx++; },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result !== 'hit' || !r.counter || ai.punch.state !== 'windup' || !ai.move || !ai.move.reflected || !ai.forced.length) return;
      ai.forced.length = 0; ai.mods.crackT = 50; ai.fight.sfx('shatter');
    },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const M = ai.mods, playing = !!M.play;
      const keys = playing ? M.play : M.mem.map((e) => e.key);
      const x0 = 128 - (cfg.size * 11 + 5) / 2;
      panel(frame, x0, 31, cfg.size * 11 + 5, 12);
      for (let i = 0; i < cfg.size; i++) {
        const x = x0 + 3 + i * 11, y = 33, k = keys[i];
        const now = playing && i === M.playIdx, done = playing && i < M.playIdx;
        frame.rect(x, y, 9, 8, now ? ((fight.clock >> 2) & 1 ? fight.COL.red : fight.COL.yellow) : fight.COL.barBack);
        if (k) memIcon(frame, k, x, y, done ? fight.COL.grey : now ? fight.COL.black : k === 'star' ? fight.COL.yellow : fight.COL.white);
      }
      if (M.crackT > 0 && (M.crackT >> 2) & 1) callout(frame, 'CRACKED!', 128, 56, fight.COL.cyan, fight.COL.black, 2);
    },
  },

  // Afterimages (Nova Reyes). A move with `dash: -1 | 1` has her dart to that
  // side of the screen during the windup (cfg.dist px) and strike from there,
  // leaving ghost copies of herself (the cfg.ghost palette, dithered) in her wake.
  afterimage: {
    init(ai) { ai.mods.trail = []; },
    update(ai) {
      const v = ai.view(), T = ai.mods.trail;
      T.push({ pose: v.pose, dx: v.dx, dy: v.dy, hidden: v.hidden });
      if (T.length > 12) T.shift();
    },
    view(ai, cfg, v) {
      const m = ai.move;
      if (!m || !m.dash || !['windup', 'active', 'recovery'].includes(ai.state)) return v;
      let k = 1;
      if (ai.state === 'windup') k = Math.min(1, (ai.moveT + 1) / (cfg.dashIn || 4));
      if (ai.state === 'recovery') {
        const len = ai.moveResult === 'hit' ? m.recoveryFrames * 0.5 : m.recoveryFrames;
        k = Math.max(0, 1 - ai.moveT / Math.max(1, Math.min(len, cfg.dashOut || 10)));
      }
      return { ...v, dx: v.dx + Math.round(m.dash * cfg.dist * k) };
    },
    renderOpp(ai, cfg, frame, fight) {
      const T = ai.mods.trail, cur = T[T.length - 1];
      if (!cur || cur.hidden || T.length < 9) return;
      const ghosts = [T[T.length - 9], T[T.length - 5]].filter((g) => Math.abs(g.dx - cur.dx) >= 6 && !g.hidden);
      if (!ghosts.length) return;
      const gp = fight.oppPalette(cfg.ghost);
      for (const g of ghosts) frame.blit(fight.oppSprites.get(g.pose), fight.OPP_X + g.dx, fight.OPP_Y + g.dy, gp, { layer: 2, dither: 1 });
      frame.blit(fight.oppSprites.get(cur.pose), fight.OPP_X + cur.dx, fight.OPP_Y + cur.dy, fight.oppPalette(ai.paletteOverride() || 'default'), { layer: 2 });
    },
  },

  // Reach (Goliath Gunn). Eight feet tall: head shots can't reach him (they
  // whiff, no hearts lost) unless he's down on one knee. Body damage fills his
  // KNEE meter (cfg.meter HP); when it's full he drops to one knee (the cfg.step
  // `open` step): head shots land, the first one is a star, and he has a perfect
  // hit in it. Star punches always reach.
  kneel: {
    init(ai) { ai.mods.knee = 0; },
    onPlayerPunch(ai, cfg, p, r) {
      const M = ai.mods, down = ai.punch.state === 'open' && ai.openStep && ai.openStep.id === cfg.step.id;
      if (down || p.star) return;
      if (p.high && r.result !== 'whiff') { M.reachT = 24; return { result: 'whiff', tooTall: true }; }
      if (r.result === 'hit' && !p.high) { M.knee += r.damage; if (M.knee >= cfg.meter) M.kneelQ = true; }
    },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.reachT > 0) M.reachT--;
      if (M.kneelT > 0) M.kneelT--;
      if (M.kneelQ && f.phase === 'fight' && ['idle', 'block', 'taunt'].includes(ai.state)) {
        M.kneelQ = false; M.knee = 0; M.kneelT = 80;
        ai.startOpen(cfg.step);
        f.sfx('thud'); f.event('kneel'); f.shake = 8; f.arena.reaction('star');
      }
    },
    onKnockdown(ai) { ai.mods.knee = 0; ai.mods.kneelQ = false; },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const M = ai.mods, v = Math.min(1, M.knee / cfg.meter);
      const down = ai.state === 'open' && ai.openStep && ai.openStep.id === cfg.step.id;
      panel(frame, 96, 31, 64, 10);
      drawText(frame, 'KNEE', 99, 33, down ? fight.COL.yellow : fight.COL.cyan, { mono: false });
      const bx = 99 + textWidth('KNEE', false) + 3, bw = 157 - bx;
      frame.rect(bx, 33, bw, 6, fight.COL.barBack);
      frame.rect(bx + 1, 34, Math.round((bw - 2) * (down ? 1 : v)), 4, down ? ((fight.clock >> 2) & 1 ? fight.COL.red : fight.COL.yellow) : fight.COL.orange);
      if (M.kneelT > 0 && (M.kneelT >> 2) & 1) callout(frame, 'HE\'S ON ONE KNEE!', 128, 56, fight.COL.yellow, fight.COL.black, 1);
      if (M.reachT > 0 && fight.phase === 'fight') callout(frame, 'TOO TALL!', 128, 70 - (M.reachT >> 3), fight.COL.white, fight.COL.black, 1);
    },
  },

  // The standoff (Quickdraw Quinn). When his cfg.trigger call finishes, the
  // fight freezes: the clock stops, and neither of you can move. After a random
  // cfg.wait [min, max] frames the bell rings DRAW! Press a punch first and your
  // glove lands for cfg.damage, a counter and a star, and he's stunned. Too slow
  // (he fires cfg.react[round - 1] frames after the bell) or too early (before
  // it) and he shoots first: cfg.shot, a heavy hit. Counter the call and the
  // standoff never happens.
  quickdraw: {
    takeover(ai) { return ai.state === 'standoff'; },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.drawT > 0) M.drawT--;
      if (ai.moveId === cfg.trigger && ai.state === 'recovery' && ai.moveResult === 'feint' && M.called !== ai.move && f.phase === 'fight') {
        M.called = ai.move;
        ai.state = 'standoff'; ai.t = 0; ai.move = null;
        const P = f.player;
        P.queued = null; if (!['down', 'getup'].includes(P.state)) P.set('idle');
        const [a, b] = cfg.wait;
        M.duel = { phase: 'stare', t: 0, at: a + Math.floor(Math.random() * (b - a + 1)), react: cfg.react[Math.min(cfg.react.length, f.stage) - 1] };
        f.sfx('howl');
        return;
      }
      if (ai.state !== 'standoff') return;
      const D = M.duel, I = f.input;
      D.t++;
      const shot = I.pressed('a') || I.pressed('b');
      if (D.phase === 'stare') {
        if (shot) return duelLost(ai, cfg, 'TOO EARLY!');
        if (D.t >= D.at) { D.phase = 'draw'; D.t = 0; f.sfx('drawBell'); }
      } else if (D.phase === 'draw') {
        if (shot) {
          D.phase = 'won'; D.time = D.t;
          ai.state = 'idle'; ai.t = 0; ai.wait = 40;
          M.duelWin = true; M.drawT = 60; M.drawMsg = 'FASTEST GLOVE!';
          const P = f.player; P.high = true; P.set('jab', 1);
        } else if (D.t >= D.react) duelLost(ai, cfg, 'TOO SLOW!');
      }
    },
    onPlayerPunch(ai, cfg, p, r) {
      if (!ai.mods.duelWin) return;
      ai.mods.duelWin = false;
      ai.stun = cfg.stun;
      return { result: 'hit', damage: cfg.damage, counter: true, star: true };
    },
    view(ai, cfg, v) {
      if (ai.state !== 'standoff') return v;
      const D = ai.mods.duel;
      const reaching = D.phase === 'draw' && D.t >= D.react - 6;
      return { ...v, pose: reaching ? cfg.reachPose : (ai.t >> 4) % 4 === 3 ? cfg.twitchPose : cfg.holdPose, dx: 0, dy: 0 };
    },
    render(ai, cfg, frame, fight) {
      const M = ai.mods, D = M.duel;
      if (ai.state === 'standoff') {
        // letterbox + a tumbleweed rolling through
        frame.rect(0, 196, 256, 28, fight.COL.black);
        const tx = ((ai.t * 2) % 320) - 32, ty = 184 - Math.abs(Math.sin(ai.t * 0.12)) * 10;
        tumbleweed(frame, tx, ty, ai.t);
        if (D.phase === 'stare') drawTextBig(frame, (ai.t >> 5) & 1 ? 'STEADY...' : 'READY...', 128, 208, fight.COL.grey, fight.COL.black, 1);
        else drawTextBig(frame, 'DRAW!', 128, 88, (fight.clock >> 1) & 1 ? fight.COL.yellow : fight.COL.red, fight.COL.black, 4);
        return;
      }
      if (M.drawT > 0 && fight.phase === 'fight' && (M.drawT >> 2) & 1) callout(frame, M.drawMsg, 128, 56, M.drawMsg === 'FASTEST GLOVE!' ? fight.COL.yellow : fight.COL.red, fight.COL.black, 2);
    },
  },

  // Still Water (The Monk). He NEVER attacks first: every punch he throws answers something you did (his
  // fighter data `reactions`: a map from your action to the move he answers it with, cfg.delay frames later):
  //   a punch that bounces off him   by hand and height (jabLhigh, jabRhigh, jabLlow, jabRlow)
  //   a punch at full calm           he sways out of it (it whiffs): `whiff`
  //   a punch that lands on him      `landed`: once he's back on his feet
  //   a dodge / a block / a duck     dodgeL, dodgeR, block, duck
  //   a Star Punch                   `star`: his reply, or (once his super is due, data/difficulty.js SUPERS: the
  //                                  planned marks) the super itself: armored, with its golden moment
  // His stance is meditation: punches wash over him (they cost you hearts like a block), only the openings he leaves
  // land (his recoveries, a counter, a stun). While you throw nothing for cfg.quiet frames he meditates: health
  // creeps back (cfg.heal of his bar a frame) and CALM fills (cfg.fill frames to full). The next counter he throws
  // spends it: cfg.power harder, cfg.speed quicker (never a sub-reaction tell: floored by the move's own number),
  // cfg.recover shorter recovery. Standing still is not safe: it loads his next answer. The glass-clear tell is his
  // breath (the inhale pose differs for every answer). A punch landed on him empties his calm.
  stillwater: {
    due: (ai) => stillWaterDue(ai), // (the perfect-play bot saves a star for the bait)
    answerSuper: (ai) => stillWaterSuper(ai), // (the golden-moment test starts his super the way he does: as the answer)
    init(ai) {
      ai.mods.sw = { q: null, restless: 0, calm: 0, settle: 0, prev: 'idle', swayT: 0, swayDir: 1, ripT: 0, hp: ai.health, landed: false, returned: false, breathe: 0 };
      ai.superDue = () => false; // (his super is an answer: it never comes by the clock)
    },
    roundStart(ai) { const W = ai.mods.sw; W.q = null; W.calm = 0; W.settle = 0; W.landed = false; W.returned = false; W.hp = ai.health; },
    onPlayerPunch(ai, cfg, p, r) {
      const W = ai.mods.sw, S = ai.punch.state;
      if (r.result === 'whiff' || r.knockdown || ai.punch.stunned || !(S === 'idle' || S === 'block')) return;
      const key = p.star ? 'star' : `jab${p.side}${p.high ? 'high' : 'low'}`;
      const canAnswer = !W.q && W.settle <= 0 && !ai.forced.length && !ai.armor;
      if (!p.star && W.calm >= cfg.sway) {
        // full calm: he isn't there. The punch finds air, and the air answers.
        W.swayT = cfg.swayFrames || 14; W.swayDir = p.side === 'L' ? 1 : -1;
        ai.fight.sfx('whiff');
        if (canAnswer) W.q = { key: 'whiff', age: 0, delay: cfg.delay.whiff ?? cfg.delay.default };
        return { result: 'blocked', evaded: true, absorbed: true };
      }
      ai.fight.sfx('om'); W.ripT = 18; W.returned = false; // (back to his stillness: the water may return again)
      if (canAnswer) W.q = { key, age: 0, delay: cfg.delay[key] ?? cfg.delay.default };
      return { result: 'blocked', absorbed: true };
    },
    update(ai, cfg) {
      const W = ai.mods.sw, f = ai.fight, S = ai.state;
      if (W.ripT > 0) W.ripT--;
      if (W.swayT > 0) W.swayT--;
      const calmState = S === 'idle' || S === 'block';
      if (f.phase !== 'fight') { W.prev = S; W.hp = ai.health; return; }
      if (ai.mods.calmSet != null) { W.calm = Math.max(W.calm, ai.mods.calmSet); ai.mods.calmSet = null; } // (a scripted moment: the deep breath)
      if (W.settle > 0) W.settle--;
      const attacking = (st) => st === 'windup' || st === 'active' || st === 'recovery';
      if (attacking(W.prev) && !attacking(S)) W.settle = cfg.settle; // the water settles before it answers again
      W.prev = S;
      // a punch landed on him: his calm is gone, and when he's on his feet again the water returns
      if (ai.health < W.hp - 0.5) { W.landed = !W.returned; W.calm = 0; W.q = null; } // (the water returns once: punishing the return does not bring it again)
      W.hp = ai.health;
      if (['kd', 'down', 'getup', 'victory'].includes(S)) W.landed = false;
      const B = f.behavior;
      // meditation: nothing thrown for a while
      if (calmState && !W.q && !ai.armor && B && B.passiveFrames() >= cfg.quiet) {
        W.calm = Math.min(1, W.calm + 1 / cfg.fill);
        ai.health = Math.min(ai.maxHealth, ai.health + ai.maxHealth * cfg.heal);
        W.hp = ai.health;
      }
      // an exhausted player (no hearts, can't punch) is left in peace: his stillness lets you breathe, and nothing you slip or guard is answered
      const P = f.player;
      if (P.pink && calmState && !W.q && ai.stun <= 0) {
        if (++W.breathe >= cfg.breathe) { W.breathe = 0; P.hearts = Math.min(f.maxHearts, P.hearts + cfg.breatheHearts); P.pink = false; f.sfx('heartBack'); }
      } else W.breathe = 0;
      const free = calmState && !P.pink && !W.q && W.settle <= 0 && !ai.forced.length && !ai.armor && ai.stun <= 0 && !ai.superTaunt;
      if (W.landed && calmState && ai.stun <= 0 && !W.q && !ai.forced.length) { W.landed = false; W.q = { key: 'landed', age: 0, delay: cfg.delay.landed ?? cfg.delay.default }; }
      // what you just did, besides punching (a punch is read as it lands: onPlayerPunch)
      const a = ai.playerAction();
      if (a && !a.punch && a.key) {
        if (W.q && W.q.key === 'block' && a.key === 'duck' && W.q.age < 10) W.q = { key: 'duck', age: 0, delay: cfg.delay.duck ?? cfg.delay.default }; // (a duck starts with a block's first tap)
        else if (free) W.q = { key: a.key, age: 0, delay: cfg.delay[a.key] ?? cfg.delay.default };
      }
      // the championship rounds: the water stops waiting (data/difficulty.js CHAMPIONSHIP pace). A player who gives him nothing to answer gets an
      // answer anyway, one of his own replies thrown unprovoked, every so often
      if (f.esc.c > 0 && free && !W.q) {
        if (++W.restless >= Math.round(150 * f.esc.pace)) {
          W.restless = 0;
          const keys = Object.keys(ai.d.reactions).filter((k) => k !== 'star' && k !== 'landed');
          const key = keys[Math.floor(Math.random() * keys.length)];
          W.q = { key, age: 0, delay: cfg.delay[key] ?? cfg.delay.default };
        }
      } else W.restless = 0;
      if (!W.q) return;
      const q = W.q;
      if (++q.age > 300) { W.q = null; return; }
      if (q.age >= q.delay && calmState && !ai.forced.length && ai.stun <= 0 && !ai.armor && !ai.superTaunt && f.phase === 'fight') {
        W.q = null;
        if (q.key === 'star' && stillWaterDue(ai) && ai.seqSupers.length) { stillWaterSuper(ai); return; }
        const id = ai.d.reactions[q.key];
        if (q.key === 'landed') W.returned = true;
        if (id) ai.beginMove(id); // (not `forced`: an overdue super must never take his answer's place)
      }
    },
    // the answer on its way (the perfect-play bot reads it like a windup; its tell is the breath that starts after the delay)
    threats(ai, cfg) {
      const W = ai.mods.sw;
      if (!W || !W.q || !(ai.state === 'idle' || ai.state === 'block')) return null;
      const q = W.q;
      let m = null;
      if (q.key === 'star' && stillWaterDue(ai) && ai.seqSupers.length) m = ai.d.moves[ai.seqSupers[0].move + '*'];
      else if (ai.d.reactions[q.key]) m = stillWaterCalmed(cfg, { id: ai.d.reactions[q.key], ...ai.d.moves[ai.d.reactions[q.key]] }, W.calm);
      if (!m) return null;
      return [{ move: m, left: Math.max(1, q.delay - q.age) + m.windupFrames - 1, tellT: Math.max(0, q.age - q.delay) }];
    },
    modifyMove(ai, cfg, m) {
      const W = ai.mods.sw;
      if (!W || m.super || m.fake || !Object.values(ai.d.reactions).includes(m.id)) return m;
      const c = W.calm; W.calm = 0; // (spent)
      return stillWaterCalmed(cfg, m, c);
    },
    // the calm halo, the sway, the float at full calm
    view(ai, cfg, v) {
      const W = ai.mods.sw;
      if (!W) return v;
      if (W.swayT > 0) {
        const F = cfg.swayFrames || 14, k = W.swayT > F - 4 ? (F - W.swayT) / 4 : W.swayT < 5 ? W.swayT / 5 : 1;
        return { ...v, dx: v.dx + Math.round(W.swayDir * 9 * k) };
      }
      const L = ai.d.anims.levitate;
      if (W.calm >= 0.999 && L && (ai.state === 'idle' || ai.state === 'block')) {
        const c = ai.fight.clock;
        return { ...v, pose: L.frames[Math.floor(c / L.rate) % L.frames.length], dy: v.dy - 6 - ((c >> 4) & 1) };
      }
      return v;
    },
    renderOpp(ai, cfg, frame, fight) {
      const W = ai.mods.sw;
      if (!W || !(W.ripT > 0 || W.calm > 0.25)) return;
      const v = ai.view(), h = fight.oppHead(v), col = c32(...(cfg.ripple || [31, 24, 10]));
      const ring = (r, skip) => {
        for (let a = 0; a < 40; a++) {
          if ((a + skip) & 1) continue;
          const t = (a / 40) * Math.PI * 2;
          frame.px(Math.round(h.x + Math.cos(t) * r * 1.3), Math.round(h.y + 40 + Math.sin(t) * r * 0.5), col);
        }
      };
      if (W.ripT > 0) ring(30 - W.ripT, W.ripT >> 1);
      // calm halo: one slow ring above a quarter, a second above three quarters
      if (W.calm > 0.25) ring(26 + ((fight.clock >> 3) % 3), fight.clock >> 4);
      if (W.calm > 0.75) ring(34 + ((fight.clock >> 3) % 3), (fight.clock >> 4) + 1);
    },
  },

  // The old king adapts (King Karver). He hunts you harder the fewer hearts you
  // have: cfg.levels by heart fraction, each with a name and a `gap` factor (the
  // pauses between his moves shrink) and `recovery` factor; patterns may be gated
  // by `aggro: [levels]`. He reads your habits: slip to one side most of the time
  // (cfg.habit of your last cfg.memory slips) and a move with a `twin` whose tell
  // uses the other arm comes instead (the one that side can't slip); throw most
  // of your punches at one height and he guards it while he's idle.
  adapt: {
    init(ai) { Object.assign(ai.mods, { slips: [], punches: [], level: 0, acc: 0 }); },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight, P = f.player;
      const a = ai.playerAction();
      if (a) {
        if (a.key === 'dodgeL' || a.key === 'dodgeR') { M.slips.push(a.key); if (M.slips.length > cfg.memory) M.slips.shift(); }
        if (a.punch) { M.punches.push(a.high ? 'high' : 'low'); if (M.punches.length > cfg.memory) M.punches.shift(); }
      }
      const hi = M.punches.filter((x) => x === 'high').length, n = M.punches.length;
      const ng = cfg.minGuard ?? 4; // (how many punches he needs to see before he calls a habit: the Fallen King needs half as many)
      M.guard = n >= ng && hi / n >= cfg.habit ? 'high' : n >= ng && (n - hi) / n >= cfg.habit ? 'low' : null;
      if (f.phase !== 'fight') return;
      const frac = P.pink ? 0 : P.hearts / f.circuit.hearts;
      let lv = cfg.levels.findIndex((L) => frac >= L.min);
      if (lv < 0) lv = cfg.levels.length - 1;
      if (lv > M.level) { M.levelT = 90; f.sfx('growl'); }
      M.level = lv;
      if (M.levelT > 0) M.levelT--;
      if (M.readT > 0) M.readT--;
      // the pauses between his moves shrink as he gets hungrier
      const g = cfg.levels[lv].gap;
      if (g < 1 && ['idle', 'taunt', 'block'].includes(ai.state) && ai.wait > 1) {
        M.acc += 1 / g - 1;
        while (M.acc >= 1 && ai.wait > 1) { ai.wait--; M.acc--; }
      }
    },
    eligible(ai, cfg, p) { return !p.aggro || p.aggro.includes(ai.mods.level); },
    modifyMove(ai, cfg, m) {
      const M = ai.mods;
      if (m.twin && M.slips.length >= (cfg.minRead ?? 4)) {
        const L = M.slips.filter((s) => s === 'dodgeL').length / M.slips.length;
        const fav = L >= cfg.habit ? 'dodgeL' : 1 - L >= cfg.habit ? 'dodgeR' : null;
        const tw = ai.d.moves[m.twin];
        if (fav && m.avoidBy.includes(fav) && !tw.avoidBy.includes(fav)) { M.readT = 45; ai.fight.sfx('aha'); m = { ...tw, id: m.twin, read: true }; }
      }
      const rec = cfg.levels[M.level].recovery ?? 1;
      return rec < 1 ? { ...m, recoveryFrames: Math.max(cfg.minRecovery || 14, Math.round(m.recoveryFrames * rec)) } : m;
    },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result !== 'hit' || p.star || ai.punch.state !== 'idle' || !ai.mods.guard) return;
      if ((p.high ? 'high' : 'low') !== ai.mods.guard) return;
      return { result: 'blocked', read: true };
    },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const M = ai.mods, L = cfg.levels[M.level];
      const w = textWidth(L.name, false) + 8;
      panel(frame, 128 - (w >> 1), 31, w, 10);
      drawText(frame, L.name, 128 - (textWidth(L.name, false) >> 1), 33, c32(...L.color), { mono: false });
      if (M.levelT > 0 && (M.levelT >> 2) & 1) callout(frame, L.shout, 128, 56, c32(...L.color), fight.COL.black, 1);
      if (M.readT > 0 && fight.phase === 'fight') {
        const h = fight.oppHead(ai.view());
        callout(frame, '!', Math.round(h.x + 22), Math.round(h.y - 30 + (M.readT > 35 ? M.readT - 35 : 0)), fight.COL.yellow, fight.COL.black, 3);
      }
    },
  },

  // Thunder (Jax Crane). For the first cfg.fresh real seconds of round 1 he's
  // fresh: only patterns with set 'fresh' (fixed, memorisable loops; his
  // uppercut is a 6-frame one-hit knockdown). After that he tires for good:
  // only set 'tired' (slower tells, shuffled). A THUNDER bar counts it down.
  thunder: {
    init(ai) { ai.mods.fresh = true; },
    phaseStart(ai) { ai.mods.fresh = false; }, // (knocked out of his first phase: the storm is over)
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods;
      if (M.tiredT > 0) M.tiredT--;
      if (!M.fresh || !['fight'].includes(f.phase)) return;
      if (f.round > 1 || f.realSeconds() >= cfg.fresh) { M.fresh = false; M.tiredT = 120; f.sfx('groan'); f.arena.reaction('star'); }
    },
    eligible(ai, cfg, p) { return !p.set || p.set === (ai.mods.fresh ? 'fresh' : 'tired'); },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const M = ai.mods;
      if (M.fresh) {
        const v = Math.max(0, cfg.fresh - fight.realSeconds()) / cfg.fresh;
        panel(frame, 84, 31, 88, 10);
        drawText(frame, 'THUNDER', 87, 33, (fight.clock >> 3) & 1 ? fight.COL.yellow : fight.COL.white, { mono: false });
        const bx = 87 + textWidth('THUNDER', false) + 3, bw = 169 - bx;
        frame.rect(bx, 33, bw, 6, fight.COL.barBack);
        frame.rect(bx + 1, 34, Math.round((bw - 2) * v), 4, fight.COL.cyan);
        frame.rect(bx + 1, 34, Math.round((bw - 2) * v), 1, fight.COL.white);
      } // (the storm ending is heard, the bar empties: no call-out, spec §4)
    },
  },

  // ---------------------------------------------------------------- Phase 6 --

  // Static. While he winds up, the picture around him tears: bands of rows slide
  // sideways or fill with snow, cfg.bands[round - 1] of them a frame, so every
  // tell is only partly visible. Each move keeps its own sound. Between tells the
  // picture hiccups now and then (cfg.ambient per frame), silently: only a sound
  // means a punch is coming.
  glitch: {
    update(ai, cfg) {
      const M = ai.mods;
      if (M.hic > 0) M.hic--;
      else if (ai.fight.phase === 'fight' && ai.state === 'idle' && Math.random() < (cfg.ambient || 0)) M.hic = 4;
    },
    renderOpp(ai, cfg, frame, fight) {
      if (fight.phase !== 'fight') return;
      const tell = ai.state === 'windup' && ai.move && !ai.move.call;
      if (!tell && !(ai.mods.hic > 0)) return;
      const n = tell ? cfg.bands[Math.min(cfg.bands.length, fight.stage || 1) - 1] : 2;
      tear(frame, fight.OPP_X - 64, fight.OPP_X + 64, fight.OPP_Y - 138, fight.OPP_Y + 3, n, fight.clock >> 1);
    },
  },

  // Dirty fighting (Crowbar Cade). He swings at the bell: all through the round
  // intro he creeps in with his hand cocked (cfg.creepPose), and the instant the
  // fight starts he throws cfg.bell. And he won't wait out a count: his get-up
  // table `sneak`s him up mid-count straight into a cheap shot. Stay guarded.
  dirty: {
    fightStart(ai, cfg) {
      if (!cfg.bell) return;
      ai.beginMove(cfg.bell, { forced: true });
      ai.mods.dirtyT = 60; ai.mods.dirtyMsg = cfg.bellMsg || 'AT THE BELL!';
    },
    sneak(ai, cfg) {
      ai.mods.dirtyT = 60; ai.mods.dirtyMsg = cfg.sneakMsg || 'UP ON THE COUNT!';
      ai.fight.sfx(cfg.sneakSfx || 'snort');
    },
    update(ai) { if (ai.mods.dirtyT > 0) ai.mods.dirtyT--; },
    view(ai, cfg, v) {
      const f = ai.fight;
      if (f.phase === 'intro' && cfg.bell && f.pt >= (cfg.creepAt ?? 36)) return { ...v, pose: cfg.creepPose, dx: 0, dy: 0 };
      return v;
    },
    // the round banner moves above his head once he starts creeping in
    bannerY(ai, cfg) { return cfg.bell && ai.fight.pt >= (cfg.creepAt ?? 36) ? 62 : null; },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (M.dirtyT > 0 && fight.phase === 'fight' && (M.dirtyT >> 2) & 1) callout(frame, M.dirtyMsg, 128, 56, fight.COL.red, fight.COL.black, 1);
    },
  },

  // Two phases (The Warden). cfg.phases: [{ from, set, name, color, palette, shout, note }].
  // The latest phase whose `from` round has come picks his pattern `set`, his
  // palette and the badge under the clock. A new phase is shouted in its round's
  // intro, and its `note` shows in the corner before it.
  phases: {
    eligible(ai, cfg, p) { return !p.set || p.set === phaseOf(ai, cfg).set; },
    palette(ai, cfg) { return phaseOf(ai, cfg).palette || null; },
    stageChange(ai, cfg, st) { if (cfg.phases.some((P) => P.from === st && P.shout)) ai.fight.sfx('crowd', true); },
    betweenRounds(ai, cfg, round) {
      const nx = cfg.phases.find((P) => P.from === round + 1);
      if (nx && nx.note) ai.mods.cornerNote = nx.note;
    },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const P = phaseOf(ai, cfg), col = c32(...P.color);
      badge(frame, fight, P.name, col);
      if (fight.phase === 'intro' && P.shout && P.from > 1 && fight.round === P.from && (fight.pt >> 3) & 1) callout(frame, P.shout, 128, 122, col, fight.COL.black, 2);
      // a one-round fight changes phase mid-round (see Fight.updateStage)
      if (fight.phase === 'fight' && fight.stageT > 0 && P.shout && P.from > 1 && fight.stage === P.from && (fight.stageT >> 3) & 1) callout(frame, P.shout, 128, 122, col, fight.COL.black, 2);
    },
  },

  // Invisible (Hollow). He only shows while he attacks: he fades in over the
  // first cfg.fadeIn frames of a windup, stays solid through the punch and
  // cfg.linger frames of the recovery, then fades out over cfg.fadeOut. Hurt,
  // down, taunting or open, he shows. Idle or guarding he's gone, and a punch
  // that meets his unseen guard lights him up for cfg.reveal frames.
  vanish: {
    onPlayerPunch(ai, cfg, p, r) { if (r.result === 'blocked') ai.mods.revealT = cfg.reveal ?? 14; },
    update(ai) { if (ai.mods.revealT > 0) ai.mods.revealT--; },
    view(ai, cfg, v) {
      const f = ai.fight, S = ai.state;
      if (f.phase === 'announce') return { ...v, ghost: true };
      if (f.phase === 'intro') return f.pt < 72 ? { ...v, ghost: true } : { ...v, ghost: true, hidden: f.pt >= 88 || !!((f.pt >> 1) & 1) };
      if (S === 'windup') return ai.moveT < (cfg.fadeIn ?? 4) ? { ...v, ghost: true } : v;
      if (S === 'recovery') {
        const L = cfg.linger ?? 6, F = cfg.fadeOut ?? 8;
        return ai.moveT < L ? v : ai.moveT < L + F ? { ...v, ghost: true } : { ...v, hidden: true };
      }
      if (S === 'idle' || S === 'block') return ai.mods.revealT > 0 ? { ...v, ghost: true } : { ...v, hidden: true };
      return v;
    },
  },

  // Undying (Revenant Rourke). His get-up table has him up at the count of one,
  // cfg.rises times; the headstones under the clock count them off. Every time
  // he rises he's quicker: cfg.scales[rises] (windups never under cfg.minWindup).
  undying: {
    init(ai) { ai.mods.rises = 0; },
    onKnockdown(ai) { ai.mods.rises++; ai.mods.pendingRise = true; ai.fight.sfx('toll'); },
    update(ai) {
      const M = ai.mods;
      if (M.pendingRise && ai.fight.phase === 'fight') { M.pendingRise = false; M.riseT = 70; ai.fight.sfx('rise'); }
      if (M.riseT > 0) M.riseT--;
    },
    modifyMove(ai, cfg, m) { return scaleTimings(m, cfg.scales[Math.min(ai.mods.rises, cfg.scales.length - 1)], cfg.minWindup); },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const M = ai.mods, n = cfg.rises;
      const w = 34 + n * 9;
      panel(frame, 128 - (w >> 1), 31, w, 11);
      const x0 = 128 - (w >> 1) + 3;
      drawText(frame, 'RISES', x0, 33, fight.COL.grey, { mono: false });
      // a headstone per rise: pale while it's still to come, dark once he's used it
      for (let i = 0; i < n; i++) {
        const used = i < M.rises, x = x0 + 29 + i * 9, y = 33;
        const col = used ? fight.COL.dark : fight.COL.off, ink = used ? fight.COL.grey : fight.COL.dark;
        frame.rect(x + 1, y, 4, 1, col); frame.rect(x, y + 1, 6, 6, col);
        frame.rect(x + 2, y + 1, 2, 4, ink); frame.rect(x + 1, y + 2, 4, 1, ink);
      }
      if (fight.phase === 'oppDown' && ai.state === 'getup' && (fight.clock >> 2) & 1) callout(frame, 'HE RISES!', 128, 56, fight.COL.cyan, fight.COL.black, 2);
      if (M.riseT > 0 && fight.phase === 'fight' && (M.riseT >> 2) & 1) callout(frame, M.rises >= n ? 'THE LAST TIME...' : 'HE WON\'T STAY DOWN!', 128, 56, fight.COL.cyan, fight.COL.black, 1);
    },
  },

  // Frenzy. Every punch you land stokes him: +1 HEAT (up to cfg.max), and heat
  // shrinks his windups, recoveries and the gaps between his moves, down to
  // cfg.minScale at full heat (windups never under cfg.minWindup). Leave him be
  // and he cools one point every cfg.cool frames; a knockdown halves it. A few
  // big, patient shots beat a pile of little ones.
  frenzy: {
    init(ai) { Object.assign(ai.mods, { heat: 0, cool: 0, acc: 0 }); },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result !== 'hit') return;
      const M = ai.mods;
      if (M.heat < cfg.max) { M.heat++; M.heatT = 36; ai.fight.sfx('heat'); if (M.heat === cfg.max) M.maxT = 80; }
      M.cool = 0;
    },
    onKnockdown(ai) { ai.mods.heat = Math.floor(ai.mods.heat / 2); },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.heatT > 0) M.heatT--;
      if (M.maxT > 0) M.maxT--;
      if (f.phase !== 'fight') return;
      if (M.heat > 0 && ++M.cool >= cfg.cool) { M.heat--; M.cool = 0; }
      const s = heatScale(ai, cfg);
      if (s < 1 && ['idle', 'taunt', 'block'].includes(ai.state) && ai.wait > 1) {
        M.acc += 1 / s - 1;
        while (M.acc >= 1 && ai.wait > 1) { ai.wait--; M.acc--; }
      }
    },
    modifyMove(ai, cfg, m) { return scaleTimings(m, heatScale(ai, cfg), cfg.minWindup); },
    palette(ai, cfg) { return ai.mods.heat >= cfg.max - 1 && (ai.fight.clock >> 2) & 1 ? cfg.palette : null; },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const M = ai.mods, n = cfg.max;
      const w = 30 + n * 5;
      panel(frame, 128 - (w >> 1), 31, w, 10);
      const x0 = 128 - (w >> 1) + 3;
      drawText(frame, 'HEAT', x0, 33, M.heat >= n ? ((fight.clock >> 2) & 1 ? fight.COL.red : fight.COL.yellow) : fight.COL.orange, { mono: false });
      for (let i = 0; i < n; i++) {
        const on = i < M.heat, x = x0 + 24 + i * 5;
        frame.rect(x, 34, 4, 5, on ? (i >= n - 2 ? fight.COL.red : i >= n / 2 ? fight.COL.orange : fight.COL.yellow) : fight.COL.barBack);
        if (on) frame.rect(x, 34, 4, 1, fight.COL.white);
      }
      if (fight.phase !== 'fight') return;
      if (M.maxT > 0 && (M.maxT >> 2) & 1) callout(frame, 'FRENZY!', 128, 56, fight.COL.red, fight.COL.black, 2);
      else if (M.heatT > 20) callout(frame, 'FASTER!', 128, 60 + ((36 - M.heatT) >> 2), fight.COL.orange, fight.COL.black, 1);
    },
  },

  // Eclipse. His cfg.call (TOTALITY: arms raised in a ring, a drone rising) is
  // the warning. While it winds up, the moon slides across the sun in the corner
  // of the ring and a tick counts it down. When it completes, the whole ring flips
  // left to right, and LEFT and RIGHT on your controller swap with it. The next
  // TOTALITY puts it all back. Punch him during the call and it never happens.
  // Every round starts the right way round.
  eclipse: {
    init(ai) { ai.mods.flipped = false; },
    roundStart(ai) { ai.mods.flipped = false; ai.mods.flipT = 0; },
    moveStart(ai, cfg, m) { if (m.id === cfg.call) ai.fight.sfx('eclipseWarn'); },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.flipT > 0) M.flipT--;
      if (M.newsT > 0) M.newsT--;
      if (ai.moveId === cfg.call && ai.state === 'windup') {
        const left = ai.move.windupFrames - ai.moveT;
        if (left > 0 && left % cfg.tick === 0) f.sfx('tick');
      }
      if (ai.moveId === cfg.call && ai.state === 'recovery' && ai.moveResult === 'feint' && M.called !== ai.move) {
        M.called = ai.move; M.flipped = !M.flipped; M.flipT = cfg.flash || 18; M.newsT = 80;
        f.sfx('flip'); f.shake = 6; f.arena.reaction('star');
      }
    },
    mapInput(ai, cfg, a) {
      if (!ai.mods.flipped) return a;
      return a === 'left' ? 'right' : a === 'right' ? 'left' : a;
    },
    postScene(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (M.flipped) mirrorFrame(frame);
      // totality: a few frames of black sky with a white corona, the moment it turns
      if (M.flipT > 0) {
        const k = cfg.flash || 18, into = k - M.flipT;
        if (into < 10) {
          frame.rect(0, 0, 256, 224, c32(0, 0, 2));
          const h = fight.oppHead(ai.view());
          const hx = M.flipped ? 256 - Math.round(h.x) : Math.round(h.x);
          ring(frame, hx, Math.round(h.y), 17 + (into >> 1), c32(31, 31, 26), c32(31, 22, 6));
        }
      }
    },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown', 'intro'].includes(fight.phase)) return;
      const M = ai.mods;
      badge(frame, fight, M.flipped ? '< MIRRORED >' : 'DAYLIGHT', M.flipped ? fight.COL.pink : fight.COL.yellow);
      if (fight.phase !== 'fight') return;
      if (ai.moveId === cfg.call && ai.state === 'windup') {
        // the warning: the moon slides over the sun, and the count runs down
        const m = ai.move, k = Math.min(1, ai.moveT / m.windupFrames);
        const cx = 40, cy = 64; // off to the side, clear of his raised arms
        disc(frame, cx, cy, 11, fight.COL.black);
        disc(frame, cx, cy, 10, (fight.clock >> 2) & 1 ? fight.COL.yellow : fight.COL.orange);
        disc(frame, cx, cy, 7, fight.COL.yellow);
        const mx = Math.round(cx - 26 + 26 * k);
        disc(frame, mx, cy, 10, c32(4, 3, 10));
        if (k > 0.85) ring(frame, cx, cy, 12, fight.COL.white, fight.COL.yellow);
        const secs = Math.ceil((m.windupFrames - ai.moveT) / cfg.tick);
        drawTextBig(frame, secs > 0 ? `ECLIPSE ${secs}` : 'ECLIPSE!', cx, cy + 16, (fight.clock >> 2) & 1 ? fight.COL.pink : fight.COL.white, fight.COL.black, 1);
        return;
      }
      if (M.newsT > 0 && (M.newsT >> 2) & 1) callout(frame, M.flipped ? 'LEFT IS RIGHT!' : 'DAYLIGHT!', 128, 56, M.flipped ? fight.COL.pink : fight.COL.yellow, fight.COL.black, 2);
    },
  },

  // Echoes (ZERO). Before each borrowed signature he becomes its champion for an
  // instant: an `echo` move (a call, never a punch) turns him that champion's
  // colours (palette 'zero.<echo>'), puts the name under the clock and sounds the
  // echo; the signature itself (its `echoOf`) follows on a 3-frame tell. The echo
  // is the warning. Counter it and the signature never comes.
  echo: {
    moveStart(ai, cfg, m) {
      if (!m.echo) return;
      Object.assign(ai.mods, { echoT: 64, echoName: m.echoName, echoCol: m.echoColor });
      ai.fight.sfx('echo');
    },
    update(ai) { if (ai.mods.echoT > 0) ai.mods.echoT--; },
    palette(ai) {
      const m = ai.move;
      if (!m || !['windup', 'active', 'recovery'].includes(ai.state)) return null;
      const id = m.echo || m.echoOf;
      if (!id || (ai.state === 'recovery' && ai.moveT > 10)) return null;
      return 'zero.' + id;
    },
    render(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown'].includes(fight.phase)) return;
      const M = ai.mods;
      if (!(M.echoT > 0)) return;
      const col = c32(...M.echoCol);
      badge(frame, fight, M.echoName, col);
      if (fight.phase === 'fight' && M.echoT > 34 && (M.echoT >> 1) & 1) callout(frame, M.echoName, 128, 56, col, fight.COL.black, 1);
    },
  },
};

// The Ascension's gimmicks (spec §18): src/fight/ascension.js
Object.assign(MODIFIERS, ASCENSION_MODIFIERS, PHASE_B_MODIFIERS);

// ---------------------------------------------------------------- Boss phases --
// phaseGate: another modifier (cfg.inner), only in the boss phases listed (cfg.phases). Its `phaseOn` / `phaseOff` run as
// the phase starts and ends (spec §4 "Boss phases": Jax's anger, the first ZERO's void, Dash Unbound's glitching tells).
MODIFIERS.phaseGate = { init(ai, cfg) { cfg.def = MODIFIERS[cfg.inner.type]; if (cfg.def && cfg.def.init) cfg.def.init(ai, cfg.inner); } };
{
  const on = (ai, cfg) => cfg.phases.includes(ai.fight.bossPhase || 1);
  const PASS = { modifyMove: (ai, cfg, m) => m, view: (ai, cfg, v) => v, mapInput: (ai, cfg, a) => a, eligible: () => true };
  for (const h of ['roundStart', 'fightStart', 'moveStart', 'moveResolved', 'openDone', 'openBroken', 'onKnockdown', 'modifyMove', 'onPlayerPunch', 'mapInput', 'render', 'renderOpp', 'postScene',
    'palette', 'view', 'eligible', 'futile', 'threats', 'takeover', 'bannerY', 'sneak', 'afterKnowledge', 'stageChange', 'betweenRounds', 'getUp', 'playerDown', 'playerUp']) {
    MODIFIERS.phaseGate[h] = (ai, cfg, ...a) => {
      const d = cfg.def;
      if (!d || !d[h] || !on(ai, cfg)) return PASS[h] ? PASS[h](ai, cfg, ...a) : undefined;
      return d[h](ai, cfg.inner, ...a);
    };
  }
  MODIFIERS.phaseGate.update = (ai, cfg) => { const d = cfg.def; if (d && d.update && on(ai, cfg)) d.update(ai, cfg.inner); };
  MODIFIERS.phaseGate.phaseStart = (ai, cfg, n) => {
    const d = cfg.def;
    if (!d) return;
    if (cfg.phases.includes(n) && d.phaseOn) d.phaseOn(ai, cfg.inner, n);
    if (!cfg.phases.includes(n) && cfg.phases.includes(n - 1) && d.phaseOff) d.phaseOff(ai, cfg.inner, n);
  };
}
// enraged: Jax's second phase (and anyone's like it). A palette (red-faced), a stance (his idle replaced by cfg.stance poses, lower),
// shorter waits between his combos (cfg.pace, never the tells), shorter recoveries (cfg.recovery), and the crowd on its feet when he rises.
MODIFIERS.enraged = {
  phaseOn(ai, cfg) { ai.fight.sfx('roar'); ai.fight.sfx('crowd', true); ai.fight.arena.reaction('ko'); },
  update(ai, cfg) {
    const f = ai.fight;
    if (f.phase === 'fight' && ai.state === 'idle' && ai.t === 1 && ai.wait < 200 && ai.wait > 8) ai.wait = Math.max(8, Math.round(ai.wait * (cfg.pace ?? 0.75)));
    if (f.phase === 'fight' && cfg.flashes && (f.clock % 37) === 0) f.arena.reaction('star'); // the crowd's camera flashes don't stop
  },
  modifyMove(ai, cfg, m) {
    if (m.call || m.feint || !m.avoidBy || m.recoveryFrames <= 8) return m;
    return { ...m, recoveryFrames: Math.max(12, Math.round(m.recoveryFrames * (cfg.recovery ?? 0.75))) };
  },
  palette(ai, cfg) { return cfg.palette || null; },
  view(ai, cfg, v) {
    if (ai.state !== 'idle' || !cfg.stance) return v;
    return { ...v, pose: cfg.stance[(ai.fight.clock >> 4) % cfg.stance.length], dy: v.dy + (cfg.crouch ?? 2) };
  },
};
// voidStir: the first ZERO's second phase, a glimpse of his true form: the ring drains to white (only the hearts and the health
// bars stay on screen), and his waits shorten (cfg.pace).
MODIFIERS.voidStir = {
  phaseOn(ai) { ai.fight.minimalHud = true; ai.fight.sfx('glitch'); },
  phaseOff(ai) { ai.fight.minimalHud = false; },
  roundStart(ai) { ai.fight.minimalHud = true; },
  update(ai, cfg) {
    const f = ai.fight;
    f.minimalHud = true;
    if (f.phase === 'fight' && ai.state === 'idle' && ai.t === 1 && ai.wait < 200 && ai.wait > 8) ai.wait = Math.max(8, Math.round(ai.wait * (cfg.pace ?? 0.85)));
  },
};

// Tiny icons for the Mirror's memory strip (9x8 cell).
const MEM_ICONS = {
  jabLhigh: ['#.....#..', '#....###.', '#...#.#.#', '#.....#..', '#.....#..', '#........', '####.....'],
  jabRhigh: ['..#...#..', '.###..#..', '#.#.#.#..', '..#...#..', '..#...##.', '......#.#', '......#.#'],
  jabLlow: ['#.....#..', '#.....#..', '#.....#..', '#...#.#.#', '#....###.', '#.....#..', '####.....'],
  jabRlow: ['..#...#..', '..#...#..', '..#...#..', '#.#.#.#..', '.###..##.', '..#...#.#', '......#.#'],
  dodgeL: ['.........', '..#......', '.##......', '#########', '.##......', '..#......', '.........'],
  dodgeR: ['.........', '......#..', '......##.', '#########', '......##.', '......#..', '.........'],
  block: ['.##...##.', '####.####', '####.####', '####.####', '.##...##.', '.##...##.', '.........'],
  duck: ['.........', '.........', '#########', '.#######.', '..#####..', '...###...', '....#....'],
  star: ['....#....', '....#....', '#########', '.#######.', '..#####..', '.##...##.', '##.....##'],
};
function memIcon(frame, key, x, y, col) {
  const rows = MEM_ICONS[key];
  if (!rows) return;
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') frame.px(x + i, y + j, col); });
}
function tumbleweed(frame, x, y, t) {
  const A = c32(22, 15, 7), B = c32(13, 8, 4);
  for (let a = 0; a < 26; a++) {
    const th = a * 0.9 + t * 0.2, r = 3 + (a % 4) * 1.4;
    frame.px(Math.round(x + Math.cos(th) * r), Math.round(y + Math.sin(th) * r), a & 1 ? A : B);
  }
}
// Quinn fires first: a heavy shot straight into you (never a knockdown on its own).
function duelLost(ai, cfg, msg) {
  const M = ai.mods;
  M.duel.phase = 'lost'; M.drawT = 60; M.drawMsg = msg;
  ai.state = 'idle'; ai.t = 0; ai.wait = 30;
  ai.beginMove(cfg.shot, { forced: true });
}

// --- modifier helpers ---------------------------------------------------------
function currentCue(ai) {
  if (ai.state === 'open' && ai.openStep) return ai.openStep.cue || null;
  if (['windup', 'active', 'recovery'].includes(ai.state) && ai.move) return ai.move.cue || null;
  return null;
}
// Beat position (in beats) for onBeat: from the music when it's playing at 1x.
function beatNow(ai, cfg) {
  const f = ai.fight, fpb = ai.mods.beat.fpb;
  if (cfg.song && f.audio && !f.opts.frameClock && f.opts.music && f.opts.music.id === cfg.song) {
    const t = f.audio.songTime(f.opts.music);
    if (t !== null) return { beats: (t * 60) / fpb, src: 'audio' };
  }
  return { beats: f.clock / fpb, src: 'frames' };
}
// Move the counter / star / perfect windows by d frames (they stay anchored to the punch).
function shiftWindows(m, d) {
  for (const k of ['counterWindow', 'starWindow', 'kdWindow']) if (m[k]) m[k] = [Math.max(2, m[k][0] + d), Math.max(2, m[k][1] + d)];
  return m;
}
// Keep a scaled perfect-hit window 4 frames wide and inside the windup.
function fitKd(w, windup) {
  const a = Math.min(w[0], windup - 4);
  return [Math.max(1, a), Math.max(1, a) + 3];
}
function pickTwin(ai, cfg) {
  const L = cfg.members;
  ai.mods.twin = L[Math.floor(Math.random() * L.length)];
  ai.pattern = null;
}
function spinWheel(ai, cfg) {
  ai.mods.wheel = { pick: Math.floor(Math.random() * cfg.slices.length), round: ai.fight.round || ai.fight.opts.startRound || 1, lastSlice: null };
  ai.pattern = null;
}
// --- Phase 6 helpers ------------------------------------------------------------
// Scale a move's timings by s (< 1 = faster), like Maestro's tempo: windup (never
// under minWindup, unless it already was), recovery (short combo links stay as
// they are), and the counter / star / perfect windows with the windup.
function scaleTimings(m, s, minWindup = 6) {
  if (s >= 1) return m;
  const w = Math.max(Math.min(m.windupFrames, minWindup), Math.round(m.windupFrames * s));
  const k = w / m.windupFrames;
  const sc = (win) => win && [Math.max(1, Math.round(win[0] * k)), Math.max(1, Math.min(w - 1, Math.round(win[1] * k)))];
  const A = m.animation;
  return {
    ...m, windupFrames: w,
    recoveryFrames: m.recoveryFrames <= 8 ? m.recoveryFrames : Math.max(8, Math.round(m.recoveryFrames * s)),
    counterWindow: sc(m.counterWindow), starWindow: sc(m.starWindow), kdWindow: m.kdWindow && fitKd(sc(m.kdWindow), w),
    animation: { ...A, windupRate: A.windupRate && Math.max(2, Math.round(A.windupRate * k)), windupHold: A.windupHold && Math.round(A.windupHold * k) },
  };
}
// Frenzy's speed for his current heat.
function heatScale(ai, cfg) { return 1 - (1 - cfg.minScale) * (ai.mods.heat / cfg.max); }
// The Warden's phase for this round.
function phaseOf(ai, cfg) {
  const r = ai.fight.stage || ai.fight.round || ai.fight.opts.startRound || 1;
  let P = cfg.phases[0];
  for (const x of cfg.phases) if (r >= x.from) P = x;
  return P;
}
// A label in a panel under the clock.
function badge(frame, fight, label, col) {
  const w = textWidth(label, false) + 8;
  panel(frame, 128 - (w >> 1), 31, w, 10);
  drawText(frame, label, 128 - (textWidth(label, false) >> 1), 33, col, { mono: false });
}
function disc(frame, cx, cy, r, col) {
  for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); frame.rect(cx - w, cy + y, w * 2 + 1, 1, col); }
}
// A dotted ring (Eclipse's corona): alternating colours round the circle.
function ring(frame, cx, cy, r, a, b) {
  const n = Math.round(r * 6.3);
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; frame.px(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), i & 1 ? a : b); }
}
// Left-right mirror of the whole framebuffer (and its owner layer).
function mirrorFrame(frame) {
  const { w, h, buf, layer } = frame;
  for (let y = 0; y < h; y++) {
    const o = y * w;
    buf.subarray(o, o + w).reverse();
    layer.subarray(o, o + w).reverse();
  }
}
// Static's picture tear: n bands of rows inside the box either slide sideways
// (wrapping inside the box) or turn to snow. Seeded, so it holds for the frame.
const SNOW = [c32(31, 31, 31), c32(20, 21, 24), c32(6, 6, 9), c32(26, 8, 28), c32(8, 28, 30)];
function tear(frame, x0, x1, y0, y1, n, seed) {
  x0 = Math.max(0, x0); x1 = Math.min(frame.w, x1); y0 = Math.max(0, y0); y1 = Math.min(frame.h, y1);
  const W = x1 - x0, row = new Uint32Array(W);
  let s = ((seed + 1) * 2654435761) >>> 0 || 1;
  const rnd = (k) => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s % k; };
  for (let i = 0; i < n; i++) {
    const y = y0 + rnd(y1 - y0), h = 2 + rnd(7);
    const snow = rnd(3) === 0, sh = (3 + rnd(12)) * (rnd(2) ? 1 : -1);
    for (let j = y; j < Math.min(y1, y + h); j++) {
      const o = j * frame.w + x0;
      if (snow) { for (let x = 0; x < W; x++) if (rnd(3)) frame.buf[o + x] = SNOW[rnd(SNOW.length)]; continue; }
      row.set(frame.buf.subarray(o, o + W));
      for (let x = 0; x < W; x++) frame.buf[o + x] = row[((x - sh) % W + W) % W];
    }
  }
}
const M_T = (ai) => ai.mods.fullT || 0;
export const FAKE_REST = 30;
const GUARD_MEMORY = 90; // frames a punch on his gloves is remembered
const GUARD_DELAY = 4;   // frames from the last bounced punch to his guard counter
const READ_MEMORY = 28;  // a punch bounced off him this recently: his next windup can't be countered

// His quickest real punch: the guard counter of a fighter who names none (and, for a Title Defense remix, the one the original fight had: remixed() pins it).
export function quickestPunch(moves) {
  let best = null;
  for (const [id, m] of Object.entries(moves)) {
    if (m.feint || m.call || m.knockdown || m.super || !m.counterWindow || !m.avoidBy || !m.avoidBy.length) continue;
    if (m.spins || m.bolt || m.flurry || m.echoOf || m.reflected) continue;
    const k = m.windupFrames - (m.avoidBy.length >= 2 ? 0.5 : 0);
    if (!best || k < best.k) best = { id, k };
  }
  return best ? best.id : null;
}

export class OpponentAI {
  constructor(fighter, circuit, fight, opts = {}) {
    this.d = fighter;
    this.circuit = circuit;
    this.fight = fight;
    this.maxHealth = fighter.stats.health;
    this.health = this.maxHealth;
    this.state = 'idle';
    this.t = 0;          // frames in state
    this.wait = 60;      // frames left for idle/taunt/block steps
    this.pattern = null;
    this.stepIdx = 0;
    this.move = null;
    this.moveId = null;
    this.moveT = 0;
    this.moveResult = null; // 'hit' | 'blocked' | 'dodged' | 'ducked'
    this.combo = 0;
    this.idleHits = 0;
    this.stun = 0;
    this.flurry = 0;     // hits the current chain may land before he covers up
    this.read = false;   // he saw a punch coming early in this windup: no counter now
    this.guardHits = 0;  // punches that hit his guard recently (guard counter)
    this.guardAt = -999;
    this.bounceAt = -999; // last time a punch bounced off him (braced: see READ_MEMORY)
    this.guardQ = null;  // a guard counter waiting to fire
    this.hitHeight = 'high';
    this.knockdowns = 0;
    this.forced = [];    // fight-lab: queued moves
    this.mods = {};
    this.used = {};      // per-fight counters for limited `open` steps
    this.openStep = null;
    this.openHits = 0;
    this.flinch = 0;
    this.punch = { state: 'idle', stunned: false };
    this.patHits = {};   // adaptive randomness: punches landed per pattern id
    // every super (data/fighters/super.js): the sequence ones take turns at the planned times; any super whose chain
    // starts in his patterns (inline, or `keep`) is armored wherever it's thrown
    this.supList = supersOf(fighter);
    // (a Title Defense exclusive super takes the first turn, then they alternate: it is the first super of every fight)
    this.seqSupers = [...this.supList.filter((S) => !S.inline && S.exclusive), ...this.supList.filter((S) => !S.inline && !S.exclusive)];
    this.sup = this.seqSupers[0] || null; // his main super (its `times` set the plan)
    this.cur = this.sup;    // the sequence super being run (or last run)
    this.seqTurn = 0;
    this.chainStart = {};
    for (const S of this.supList) if (S.inline || keptSuper(S)) for (const c of chainsOf(S)) this.chainStart[c[0]] = { S, chain: c };
    this.armor = null;      // { S, chain, i }: armored from the super's first frame to the end of its last attack
    this.goldenUntil = 0;   // a big boss's golden stun runs until this clock frame
    this.superPlan = [];  // real-second marks (fight.realSeconds()) for this round's supers
    this.superTaunt = false; // the current taunt leads into his super
    this.superFar = false;   // ...and he's backed off out of reach
    this.modifiers = [...(fighter.special || []), ...(circuit.special || []), ...(opts.modifiers || [])] // (a circuit's own: the Furnace's heat)
      .map((cfg) => ({ cfg, def: MODIFIERS[cfg.type] }))
      .filter((m) => m.def);
    for (const m of this.modifiers) m.def.init && m.def.init(this, m.cfg);
    // the knowledge layer: exploits, anti-strategies, scripted moments (src/fight/knowledge.js)
    this.know = hasKnowledge(fighter) ? new Knowledge(this) : null;
    this.phased = (fighter.patterns || []).some((p) => p.when && p.when.phase);
    this.log = '';
  }

  // This round's (or Gauntlet stage's) supers: 1-2 marks in real seconds.
  planSupers() {
    const S = this.sup, f = this.fight;
    this.superPlan = []; this.desperate = false;
    if (!S) return;
    const full = (180 * f.FRAMES_PER_SEC) / 60, one = f.rounds <= 1;
    // (a fight held to one stage, the Will Shard's final form, plans its supers over the whole round)
    const staged = one && !f.stageLock;
    const span = staged ? full / 3 : full, base = staged ? ((f.stage || 1) - 1) * span : 0;
    const [a, b] = S.times || [1, 2];
    const n = a + Math.floor(Math.random() * (b - a + 1)) + f.esc.supers; // (the championship rounds add supers: data/difficulty.js CHAMPIONSHIP)
    const r = (lo, hi) => base + span * (lo + Math.random() * (hi - lo));
    // n supers spread over the round, each in its own slice (bosses throw 2-3, ZERO's true form 3-4: data/difficulty.js)
    this.superPlan = n <= 1 ? [r(0.25, 0.6)] : n === 2 ? [r(0.15, 0.4), r(0.55, 0.85)]
      : Array.from({ length: n }, (_, i) => r(0.1 + (0.8 * i) / n, 0.1 + (0.8 * (i + 0.7)) / n));
  }
  // Is a super due before the next step? Only between chains: not when the next
  // step is a punch or a short idle that glues two punches together.
  superDue() {
    const f = this.fight;
    if (!this.sup || !this.superPlan.length || f.phase !== 'fight' || this.forced.length) return false;
    if (!this.desperate && this.healthFrac() < 0.5) { this.desperate = true; this.superPlan[0] = Math.min(this.superPlan[0], f.realSeconds()); }
    if (f.realSeconds() < this.superPlan[0]) return false;
    return this.atBreak();
  }
  // Between his combos: the next pattern step isn't a punch or a short idle that glues two together.
  atBreak() {
    const nx = this.steps && this.pattern && this.stepIdx < this.steps.length ? this.steps[this.stepIdx] : null;
    return !nx || !(nx.move || (nx.idle !== undefined && nx.idle < 24));
  }
  startSuper(force = null) {
    // (a modifier may choose which super comes: ZERO's crystals pick one of the ones still unbroken, `pickSuper`; the tools name the one to test)
    let S = force;
    if (!S) for (const m of this.modifiers) if (m.def.pickSuper) S = m.def.pickSuper(this, m.cfg, this.seqSupers) || S;
    if (!S) S = this.seqSupers[this.seqTurn++ % this.seqSupers.length];
    this.cur = S;
    this.superPlan.shift();
    this.armor = { S, chain: null, i: -1 }; // armored from the step back
    // which super: by his current set (the tag team), at random, or his one
    const set = this.mods.twin ? this.mods.twin.set : null;
    this.superId = S.bySet ? S.bySet[set] || Object.values(S.bySet)[0] : S.moves ? S.moves[Math.floor(Math.random() * S.moves.length)] : S.move;
    this.move = null; this.idleHits = 0;
    this.superTaunt = true;
    this.superFar = S.golden !== 'taunt';
    if (this.superFar) { this.state = 'backstep'; this.t = 0; }
    else this.superTauntStart();
  }
  superTauntStart() { const S = this.cur; this.state = 'taunt'; this.t = 0; this.wait = S.taunt || 50; if (S.sfx) this.fight.sfx(S.sfx); }
  superThrow() {
    this.superTaunt = false; this.superFar = false;
    const then = thenOf(this.cur, this.superId);
    if (this.armor) this.armor.chain = [this.superId, ...then];
    this.beginMove(this.superId + '*', { forced: true });
    this.forced.push(...then);
  }
  endArmor() { this.armor = null; }
  // his health bar for a boss phase (data `phaseHealth`: one number a phase; default: his health)
  phaseHealth(n) { const H = this.d.phaseHealth; return H && H[n - 1] != null ? H[n - 1] : this.d.stats.health; }
  // The super he's about to throw (for the bot and overlays).
  superMove() { return this.d.moves[(this.superId || (this.cur && superKey(this.cur))) + '*']; }
  // The taunt's golden moment, if this taunt has one.
  tauntKdNow() { return this.superTaunt && this.cur && this.cur.golden === 'taunt' && this.flagOk(this.cur.flag) ? this.cur.window : null; }
  flagOk(flag) { return !flag || !!(this.know && this.know.flag(flag)); }
  // The super whose golden moment an open step is (a slipped super's opening: Cade's bent crowbar)
  openGolden(step) { return step ? this.supList.find((S) => S.golden === 'open' && S.open === step.anim) : null; }
  // Does punch p land a golden moment right now? (before the clean-punch rule)
  goldenHere(p) {
    const S = this.state, m = this.move;
    const inside = (w, t) => !!w && t >= w[0] && t <= w[1];
    if (S === 'windup' && m && m.goldenHit && inside(m.kdWindow, this.moveT)) return this.flagOk(m.goldenFlag) && hitMatches(m.goldenHit, p);
    if (S === 'taunt' && this.superTaunt && !this.superFar) { const w = this.tauntKdNow(); return inside(w, this.t) && hitMatches(hitOf(this.cur, this.d), p); }
    if (S === 'recovery' && m && m.goldenHit && m.recoveryKd && inside(m.recoveryKd, this.moveT)) {
      const res = this.moveResult, after = m.goldenAfter || 'dodged';
      const ok = after === 'any' ? res === 'dodged' || res === 'ducked' || res === 'blocked' : after === 'ducked' ? res === 'ducked' : res === 'dodged' || (after === 'dodged' && res === 'ducked' && !(m.avoidBy || []).some((a) => a.startsWith('dodge')));
      return ok && (!m.goldenDir || m.goldenDir === this.lastSlip) && this.flagOk(m.goldenFlag) && hitMatches(m.goldenHit, p);
    }
    if (S === 'open' && this.openStep) { const G = this.openGolden(this.openStep); if (G && inside(G.window, this.t)) return this.flagOk(G.flag) && hitMatches(hitOf(G, this.d), p); }
    return false;
  }
  // the super whose golden moment this is (for the scouting report)
  goldenDef() {
    if (this.state === 'taunt') return this.cur;
    if (this.state === 'open') return this.openGolden(this.openStep);
    if (this.armor) return this.armor.S;
    const id = this.moveId;
    return this.supList.find((S) => chainsOf(S).some((c) => c.includes(id))) || this.cur;
  }

  // A blow of his that would land: a modifier may take it back instead (ORIGIN's Rewind undoes it: no damage, hearts or star; `rewindHit`)
  rewindHit(move) {
    for (const m of this.modifiers) if (m.def.rewindHit && m.def.rewindHit(this, m.cfg, move)) return true;
    return false;
  }
  hook(name, ...args) {
    if (this.fight.track) this.fight.track.hook(name, ...args); // medal telemetry
    for (const m of this.modifiers) if (m.def[name]) m.def[name](this, m.cfg, ...args);
    if (this.know && name !== 'update') this.know.hook(name, ...args);
  }
  mapInput(a) {
    for (const m of this.modifiers) if (m.def.mapInput) a = m.def.mapInput(this, m.cfg, a);
    return a;
  }
  paletteOverride() {
    for (const m of this.modifiers) if (m.def.palette) { const p = m.def.palette(this, m.cfg); if (p) return p; }
    return this.know ? this.know.palette() : null;
  }
  // true while a modifier has frozen the fight for a scene of its own
  takeover() {
    for (const m of this.modifiers) if (m.def.takeover && m.def.takeover(this, m.cfg)) return true;
    return false;
  }
  // What the player started this frame (the Player updates first, so a new
  // action shows as t === 0): { key, punch, high } with key one of jabLhigh,
  // jabLlow, jabRhigh, jabRlow, dodgeL, dodgeR, block, duck, star. Else null.
  playerAction() {
    const f = this.fight, P = f.player;
    if (this.seen && this.seen.at === f.clock) return this.seen.a;
    let a = null;
    if (f.phase === 'fight' && P.t === 0) {
      if (P.state === 'jab') a = { key: `jab${P.dir < 0 ? 'L' : 'R'}${P.high ? 'high' : 'low'}`, punch: true, high: P.high };
      else if (P.state === 'dodge') a = { key: P.dir < 0 ? 'dodgeL' : 'dodgeR' };
      else if (P.state === 'block' || P.state === 'duck' || P.state === 'star') a = { key: P.state, punch: P.state === 'star', high: true };
    }
    this.seen = { at: f.clock, a };
    return a;
  }

  healthFrac() { return this.health / this.maxHealth; }

  // --- pattern selection ----------------------------------------------------
  eligible(p) {
    const w = p.when || {};
    // a scripted moment's pattern set (knowledge.js): only its patterns while it runs, never otherwise
    if (this.know ? !this.know.eligible(p) : p.script) return false;
    const round = this.fight.stage || this.fight.round; // a Gauntlet stage counts as a round
    if (w.rounds && !w.rounds.includes(round)) return false;
    // a boss's phase (spec §4): once any of his patterns names a phase, the ones that don't are his first phase's
    const ph = w.phase || (this.phased ? [1] : null);
    if (ph && !ph.includes(this.fight.bossPhase || 1)) return false;
    const h = this.healthFrac();
    if (w.health && (h < w.health[0] || h > w.health[1])) return false;
    if (w.knockdowns && !w.knockdowns.includes(this.knockdowns)) return false;
    for (const m of this.modifiers) if (m.def.eligible && m.def.eligible(this, m.cfg, p) === false) return false;
    return true;
  }
  pickPattern() {
    const list = this.d.patterns.filter((p) => this.eligible(p));
    const pool = list.length ? list : this.d.patterns;
    const mode = this.circuit.randomness;
    let p = pool[0];
    if (mode !== 'fixed' && pool.length > 1) {
      // adaptive: whatever has been landing on you comes back more often
      const adaptive = mode === 'adaptive' || mode === 'all';
      const wt = (x) => (x.weight || 1) * (adaptive ? 1 + (this.d.adapt ?? 0.5) * Math.min(4, this.patHits[x.id] || 0) : 1);
      const total = pool.reduce((s, x) => s + wt(x), 0);
      let r = Math.random() * total;
      for (const x of pool) { r -= wt(x); if (r <= 0) { p = x; break; } }
    }
    this.pattern = p;
    this.stepIdx = 0;
    const shuffle = !p.fixed && (p.shuffle || mode === 'shuffled' || mode === 'adaptive' || mode === 'all');
    this.steps = shuffle ? shuffleMoves(p.steps) : p.steps;
    // (a modifier may rewrite the steps he is about to walk: broken crystals take their moves out, `steps`)
    for (const m of this.modifiers) if (m.def.steps) this.steps = m.def.steps(this, m.cfg, this.steps, p) || this.steps;
  }

  resume(delay = 30) {
    this.superTaunt = false; this.superFar = false; this.armor = null;
    this.state = 'idle'; this.t = 0; this.wait = delay;
    this.move = null; this.combo = 0; this.stun = 0; this.flurry = 0;
    this.resumeAfter = true;
  }

  nextStep(depth = 0) {
    if (this.forced.length) { this.beginMove(this.forced.shift(), { forced: true }); return; }
    // a scripted moment's steps, or an anti-strategy's own step (knowledge.js)
    const ks = this.know && this.know.nextStep(this.atBreak());
    if (ks) { this.runStep(ks, depth); return; }
    if (this.superDue()) { this.startSuper(); return; }
    if (!this.pattern || !this.eligible(this.pattern)) this.pickPattern();
    else if (this.stepIdx >= this.steps.length) {
      // fixed loops repeat; every other mode re-rolls at the end of a pattern
      if (this.circuit.randomness === 'fixed') this.stepIdx = 0;
      else this.pickPattern();
    }
    this.runStep(this.steps[this.stepIdx++], depth);
  }
  runStep(s, depth = 0) {
    this.idleHits = 0;
    if (s.open && this.know && this.know.skipOpen(s)) { this.state = 'idle'; this.t = 0; this.wait = 20; return; }
    if (s.move) {
      // (a move a modifier has taken out of his pool for good, a broken crystal's: the step is skipped, `removed`)
      if (depth < 40 && this.modifiers.some((m) => m.def.removed && m.def.removed(this, m.cfg, s.move))) return this.nextStep(depth + 1);
      this.beginMove(s.move);
    }
    else if (s.taunt) { this.state = 'taunt'; this.t = 0; this.wait = this.paced(s.taunt); }
    else if (s.block) { this.state = 'block'; this.t = 0; this.wait = this.paced(s.block); }
    else if (s.open) {
      if (s.limit && (this.used[s.id] || 0) >= s.limit) {
        if (depth < 16) return this.nextStep(depth + 1);
        this.state = 'idle'; this.t = 0; this.wait = 30; return;
      }
      this.used[s.id] = (this.used[s.id] || 0) + 1;
      this.startOpen(s);
    }
    else { this.state = 'idle'; this.t = 0; this.wait = this.paced(s.idle || 30); }
  }

  // The championship rounds (data/difficulty.js CHAMPIONSHIP): fewer, shorter pauses between his combos...
  paced(w) { const k = this.fight.esc.pace; return k < 1 && w >= 12 ? Math.max(8, Math.round(w * k)) : w; }
  // ...and shorter openings (data/difficulty.js CHAMPIONSHIP openings): the part of a recovery or an `open` step in which a punch lands shrinks, and he
  // covers up for the rest. The timeline itself never changes, so every attack keeps its place and stays avoidable; golden moments, perfect hits,
  // armored supers and traps keep their whole window. `len`: the frames of the recovery or the step, `t`: the frames gone.
  shut(len, t, step) {
    const k = this.fight.esc.openings;
    if (k >= 1 || len <= 12 || this.armor) return false;
    if (step ? (step.kd || step.armorOpen || step.trap || this.openGolden(step)) : (this.move.recoveryKd || this.move.goldenHit)) return false;
    return t > Math.max(8, len * k);
  }

  startOpen(s) {
    this.armor = null; // (a slipped super's opening comes after the super)
    // ...but an opening that IS a super (the Strongman's flex): armored from now to the end of the punch it powers up
    const SO = this.supList.find((S) => S.armorOpen && (S.armorOpen === s.id || S.armorOpen === s.anim));
    if (SO) this.armor = { S: SO, chain: null, i: -1, open: true };
    this.state = 'open'; this.t = 0; this.wait = s.open;
    this.openStep = s; this.openHits = 0; this.flinch = 0;
    this.move = null;
    if (s.sfx) this.fight.sfx(s.sfx);
    if (s.shake) this.fight.shake = s.shake;
  }

  beginMove(id, { forced = false } = {}) {
    // a reply a modifier fires (ice shard, riposte, guard counter) can't hold a super off
    // for ever: once it's 4 seconds overdue, the super comes instead
    if (forced && !id.endsWith('*') && !this.forced.length && !this.armor && this.sup && this.superPlan.length
      && this.fight.phase === 'fight' && this.fight.realSeconds() >= this.superPlan[0] + 4) { this.startSuper(); return; }
    let m = this.d.moves[id];
    if (!m) { this.state = 'idle'; this.wait = 30; return; }
    const copy = id.endsWith('*');
    if (copy) id = id.slice(0, -1); // a super: modifiers see the move it copies
    // the armor follows the super's chain: the next move of it keeps it on, anything else ends it; an inline super's
    // first move (or a kept one thrown from a pattern) puts it on
    if (this.armor && this.armor.open && !this.armor.chain) { this.armor.chain = [id]; this.armor.i = 0; this.armor.open = false; } // (the punch the flex powered up)
    else if (this.armor && this.armor.chain) { if (this.armor.chain[this.armor.i + 1] === id) this.armor.i++; else this.armor = null; }
    if (!this.armor && !copy && this.chainStart[id]) this.armor = { S: this.chainStart[id].S, chain: this.chainStart[id].chain, i: 0 };
    m = { id, ...m };
    const fk = this.circuit.fakes || 0;
    if (fk && !forced && !m.feint && !m.noFake && m.counterWindow && Math.random() < fk) m = makeFake(m);
    for (const mod of this.modifiers) if (mod.def.modifyMove) m = mod.def.modifyMove(this, mod.cfg, m);
    if (this.know) m = this.know.modifyMove(m);
    // defense rules (knowledge spec K3): unblockable / undodgeable take those defenses away
    if (m.unblockable && m.avoidBy.includes('block')) m = { ...m, avoidBy: m.avoidBy.filter((a) => a !== 'block') };
    if (m.undodgeable && m.avoidBy.some((a) => a.startsWith('dodge'))) m = { ...m, avoidBy: m.avoidBy.filter((a) => !a.startsWith('dodge')) };
    this.move = m; this.moveId = id;
    this.state = 'windup'; this.t = 0; this.moveT = 0; this.moveResult = null;
    this.combo = 0;
    // swinging at his gloves right before he throws? he's braced: no counter this time
    this.read = this.fight.clock - this.bounceAt <= READ_MEMORY;
    this.hook('moveStart', m);
    if (this.know) this.know.moveStart(m);
    if (m.sfx && m.sfx.tell && !m.sfxScheduled) this.fight.sfx(m.sfx.tell);
  }

  // --- per frame --------------------------------------------------------------
  update() {
    this.t++;
    this.hook('update');
    if (this.know) this.know.update();
    const f = this.fight;
    // a guard counter: he's had enough of punches bouncing off his gloves
    if (this.guardQ && (this.state === 'block' || this.state === 'idle')) {
      if (--this.guardQ.delay <= 0) {
        const id = this.guardQ.id;
        this.guardQ = null; this.guardHits = 0;
        this.beginMove(id, { forced: true });
        return;
      }
    }
    switch (this.state) {
      case 'taunt':
        if (--this.wait <= 0) {
          if (!this.superTaunt) this.nextStep();
          else if (this.superFar) { this.state = 'advance'; this.t = 0; }
          else this.superThrow();
        }
        break;
      case 'idle':
      case 'block':
        if (--this.wait <= 0) this.nextStep();
        break;
      case 'backstep':
        if (this.t >= SUPER_BACK) this.superTauntStart();
        break;
      case 'advance':
        if (this.t >= SUPER_ADVANCE) this.superThrow();
        break;
      case 'windup':
        this.moveT++;
        if (this.moveT >= this.move.windupFrames && this.move.feint) {
          // a feint: the tell was a bluff, he drops straight into recovery (unless an
          // anti-strategy turns it into the real thing: Ray's yellow light)
          if (this.know && this.know.feintEnd(this.move)) break;
          this.state = 'recovery'; this.moveT = 0; this.moveResult = 'feint';
        } else if (this.moveT >= this.move.windupFrames) {
          this.state = 'active'; this.moveT = 0;
          if (this.move.sfx && this.move.sfx.swing) f.sfx(this.move.sfx.swing);
          const mv = this.move; // a knockdown clears this.move inside opponentAttack
          this.moveResult = f.opponentAttack(mv);
          if (this.moveResult === 'hit' && this.pattern) this.patHits[this.pattern.id] = (this.patHits[this.pattern.id] || 0) + 1;
          this.hook('moveResolved', mv, this.moveResult);
        }
        break;
      case 'active':
        this.moveT++;
        if (this.moveT >= this.move.activeFrames) {
          if (this.armor && this.armor.chain && this.armor.i >= this.armor.chain.length - 1) this.armor = null; // the super's last attack is thrown
          const oa = this.move.openAfter;
          if (this.know && this.know.takeResolved()) break; // an exploit on how you defended it
          if (oa && oa.when.includes(this.moveResult)) this.startOpen(oa);
          else { this.state = 'recovery'; this.moveT = 0; }
        }
        break;
      case 'recovery': {
        this.moveT++;
        const landed = this.moveResult === 'hit';
        const len = landed ? Math.round(this.move.recoveryFrames * 0.5) : this.move.recoveryFrames;
        if (this.moveT >= len) this.nextStep();
        break;
      }
      case 'hit':
        if (this.t >= (this.hitLen || this.d.stats.hitstun)) {
          if (this.stun > 0) { this.state = 'stunned'; this.t = 0; }
          else this.resume(this.combo >= this.flurry ? 12 : 24); // chain spent: straight back to work
        }
        if (this.stun > 0) this.stun--;
        break;
      case 'stunned':
        if (--this.stun <= 0) this.resume(20);
        break;
      case 'open': {
        const s = this.openStep;
        if (this.flinch > 0) this.flinch--;
        if (s.heal) this.health = Math.min(this.maxHealth, this.health + (s.heal * this.maxHealth) / s.open);
        if (s.sfxLoop && this.t % (s.sfxEvery || 30) === 1) f.sfx(s.sfxLoop);
        if (--this.wait <= 0) { this.openStep = null; this.hook('openDone', s); this.nextStep(); }
        break;
      }
      default:
        break; // kd / down / getup / victory handled by the fight
    }
  }

  // --- the player's punch reaches us ------------------------------------------
  // p: { side:'L'|'R', high:bool, star:bool } -> { result, damage, star, counter }
  onPlayerPunch(p) {
    const st = this.d.stats;
    const S = this.state;
    let r;
    // Punch-Out rules: his guard stops everything except the openings. A chain of
    // hits (a flurry) only starts from one of them, and `chain` says which:
    //   counter  a punch inside his tell's counter window: stunned, stunComboLimit hits
    //   punish   the first punch after you slipped or ducked his punch: dazed, comboLimit hits
    //   taunt    hitting him while he shows off: dazed, comboLimit hits
    //   open     a vulnerable `open` step broken by a hit: comboLimit hits
    //   single   his open spot while idle (idleGuard), or the recovery of a punch you
    //            only blocked: idleHitLimit / 1 hits, no daze
    // Punch before the counter window and he reads it: that windup can't be countered
    // any more. Keep punching his gloves and he fires a guard counter (circuit.guardCounter).
    const land = (counter = false, star = false, chain = 'single') => {
      const base = p.star ? PUNCH_DAMAGE.star : p.high ? PUNCH_DAMAGE.head : PUNCH_DAMAGE.body;
      // a punch thrown in a stream of them is worn down (data/difficulty.js MASH): mashing earns little, however the punches land
      const tired = p.star ? 1 : this.fight.mashK || 1;
      return { result: 'hit', damage: Math.max(1, Math.round(base * tired * (counter ? this.fight.counterMult ?? PUNCH_DAMAGE.counterMult : 1))), counter, star, chain };
    };
    const cover = () => { this.state = 'block'; this.t = 0; this.wait = 26; this.combo = 0; this.stun = 0; this.flurry = 0; };
    const prevStun = this.stun;
    const daze = () => Math.max(16, Math.round(st.stunFrames * (st.punishDaze ?? 0.55)) - (st.stunResistance || 0));
    this.punch = { state: S, stunned: this.stun > 0 || S === 'stunned' };
    // a super's golden moment: the right punch, on its frames, thrown on purpose (data/difficulty.js GOLDEN: no other
    // punch of yours just before it). A mashed punch on the frame is no golden moment.
    let golden = this.goldenHere(p);
    if (golden && this.d.goldenClean) { const B = this.fight.behavior; if (B && B.total.punches && B.t - B.lastPunch < this.d.goldenClean) golden = false; }
    if (S === 'backstep' || S === 'advance' || (S === 'taunt' && this.superFar)) {
      r = { result: 'whiff', far: true }; // he's backed off out of reach
    } else if (golden) {
      // the super is over: the armor drops, its follow-ups never come. A fighter goes down; a big boss is left wide open.
      const G = this.goldenDef();
      r = land(true, false, 'counter');
      r.golden = G ? superKey(G) : true;
      this.lastGolden = { key: r.golden, t: this.fight.clock || 0 };
      this.hook('golden', G); // (a modifier hears it: ZERO's crystal cracks)
      // (medals hear it: '!golden:<super>', and '!exploit:<id>' for a golden moment that used to be that exploit)
      if (this.fight.event) { this.fight.event('golden'); this.fight.event('golden:' + r.golden); if (G && G.from) this.fight.event('exploit:' + G.from); }
      if (this.d.goldenStun) r.goldenStun = (G && G.stun) || this.d.goldenStun; else r.knockdown = true; // (a super may stun for longer than the boss's usual: the First Punch's `stun`)
      // (an inline super thrown from his pattern: the rest of its chain in the pattern is skipped too)
      const A = this.armor;
      if (A && A.chain && this.steps) for (let k = A.i + 1; k < A.chain.length && this.steps[this.stepIdx] && this.steps[this.stepIdx].move === A.chain[k]; k++) this.stepIdx++;
      this.armor = null; this.forced = []; this.superTaunt = false; this.superFar = false;
      this.stun = Math.max(20, st.stunFrames - (st.stunResistance || 0)); this.combo = 0;
      if (this.know && G) this.know.scoutGolden(G);
    } else if (this.armor) {
      // armored: it clanks off, does nothing, can't stun or interrupt him (no guard counter either: he's busy)
      r = { result: 'blocked', clank: true, armor: true };
      this.fight.sfx('clank');
      if (this.know) { this.know.afterPunch(); this.know.postPunch(p, r, S); }
      return r;
    } else if (S === 'windup') {
      const f = this.moveT, m = this.move;
      const cw = m.counterWindow;
      const okHeight = !m.counterWith || m.counterWith === 'any' || (m.counterWith === 'high') === p.high;
      if (cw && f >= cw[0] && f <= cw[1] && okHeight && !this.read) {
        const star = !!(m.starWindow && f >= m.starWindow[0] && f <= m.starWindow[1]);
        r = land(true, star, 'counter');
        if (m.kdWindow && !m.goldenHit && f >= m.kdWindow[0] && f <= m.kdWindow[1] && (!this.d.kdStar || p.star)) r.knockdown = true; // (a perfect hit that isn't a super's)
        this.stun = Math.max(20, st.stunFrames - (st.stunResistance || 0));
        this.combo = 0;
      } else if (p.star) r = land();
      else {
        r = { result: 'blocked' };
        if (cw && f < cw[0]) r.early = true; // read: closes the counter window below
      }
    } else if (S === 'active') {
      r = { result: 'whiff' };
    } else if (S === 'recovery') {
      const m = this.move, res = this.moveResult;
      if (res === 'hit') r = { result: 'blocked' };
      else if (this.shut(m.recoveryFrames, this.moveT)) { cover(); r = { result: 'blocked' }; } // (the championship rounds: his guard is back up)
      else if (m.punishStar && m.punishStar.includes(res) && this.combo === 0) { r = land(true, true, 'punish'); this.stun = daze(); }
      else if (res === 'dodged' || res === 'ducked') { r = land(false, false, 'punish'); this.stun = daze(); }
      else r = land(); // blocked it, or a feint's shrug: one clean shot, no daze
    } else if (S === 'open') {
      const s = this.openStep;
      const star = !!(s.star && this.openHits === 0 && this.t >= s.star[0] && this.t <= s.star[1]);
      r = this.openHits < (s.comboLimit ?? 99) && !this.shut(s.open, this.t, s) ? land(star, star, 'open') : (cover(), { result: 'blocked' });
      if (r.result === 'hit' && s.kd && this.t >= s.kd[0] && this.t <= s.kd[1] && (!this.d.kdStar || p.star)) { r.counter = true; r.knockdown = true; }
    } else if (S === 'idle') {
      if (p.star) r = land();
      else if (p.high && st.idleGuard === 'high') r = { result: 'blocked' };
      else if (!p.high && st.idleGuard === 'low') r = { result: 'blocked' };
      else if (this.idleHits < Math.floor(st.idleHitLimit * this.fight.esc.idle + 1e-6)) { this.idleHits++; r = land(); } // (the championship rounds close the free hit he gives while idle)
      else { cover(); r = { result: 'blocked' }; }
    } else if (S === 'taunt') {
      // (not his super's taunt: that one is armored, above)
      r = land(false, false, 'taunt');
      this.stun = daze();
    } else if (S === 'block') {
      r = { result: 'blocked' };
    } else if (S === 'hit' || S === 'stunned') {
      r = this.combo < this.flurry ? land(false, false, 'more') : (cover(), { result: 'blocked' });
    } else {
      r = { result: 'whiff' };
    }
    // the knowledge layer first: an exploit (or an anti-strategy) replaces the result, and
    // then his gimmicks don't get a say (an exploit always gets through)
    // the golden chance needs a deliberate punch (data/difficulty.js GOLDEN): one thrown right after another stays a counter
    if (r.knockdown && this.d.goldenClean) { const B = this.fight.behavior; if (B && B.total.punches && B.t - B.lastPunch < this.d.goldenClean) r.knockdown = false; }
    const kr = !r.golden && this.know && this.know.punch(p, r, S);
    if (r.golden) { /* the golden moment always gets through: no exploit or gimmick has a say */ }
    else if (kr) {
      r = kr;
      // (a modifier's own rules about damage still hold: Iron Jaw's last point of health)
      for (const m of this.modifiers) if (m.def.afterKnowledge) r = m.def.afterKnowledge(this, m.cfg, p, r) || r;
    } else for (const m of this.modifiers) if (m.def.onPlayerPunch) r = m.def.onPlayerPunch(this, m.cfg, p, r) || r;
    if (r.result !== 'hit') this.stun = prevStun; // a modifier cancelled a counter
    else if (!r.chain && r.counter && this.stun > prevStun) r.chain = 'counter'; // a modifier's own stun (the standoff)

    if (r.result === 'hit') {
      this.health = Math.max(0, this.health - r.damage);
      // a big boss's golden stun opens him up, but never empties his health bar (it can't skip a phase or end the fight)
      if (r.goldenStun || this.fight.clock < this.goldenUntil) this.health = Math.max(1, this.health);
      this.combo++;
      this.hitHeight = p.high ? 'high' : 'low';
      // how long this chain may run (a star punch into his guard starts none)
      const ch = r.chain;
      if (ch !== 'more') {
        this.combo = 1;
        this.flurry = ch === 'counter' ? st.stunComboLimit
          : ch === 'punish' || ch === 'taunt' || ch === 'open' ? st.comboLimit
          : S === 'idle' ? Math.max(1, st.idleHitLimit) : 1;
      }
      if (S === 'open' && this.state === 'open' && !this.openStep.interrupt) {
        this.openHits++; this.flinch = 10;
      } else {
        if (S === 'windup' && this.move && this.move.cancels) this.stepIdx += this.move.cancels;
        if (S === 'open' && this.openStep && this.openStep.stunOnInterrupt) this.stun = this.openStep.stunOnInterrupt;
        if (S === 'open' && this.openStep) this.hook('openBroken', this.openStep);
        this.openStep = null;
        this.state = 'hit'; this.t = 0;
        this.hitLen = r.counter ? st.hitstun + 6 : st.hitstun;
        this.move = null;
      }
    } else if (r.result === 'blocked' && !r.absorbed && (S === 'idle' || S === 'hit' || S === 'taunt' || S === 'open')) {
      if (this.state !== 'block') { this.state = 'block'; this.t = 0; this.wait = 18; }
    }
    if (r.goldenStun) { this.stun = r.goldenStun; this.flurry = 999; this.goldenUntil = this.fight.clock + r.goldenStun; }
    if (r.result === 'blocked' && !p.star) this.bounceAt = this.fight.clock;
    if (r.early && r.result === 'blocked') this.read = true;
    if (r.result === 'blocked' && !r.absorbed && !r.parried && !r.read && !r.anti && !p.star) this.guardHit(S);
    if (this.know) { this.know.afterPunch(); this.know.postPunch(p, r, S); }
    return r;
  }

  // Knockdowns and bells wipe the slate: no guard counter carries over.
  forgetGuard() { this.guardQ = null; this.guardHits = 0; this.bounceAt = -999; }

  // A punch just bounced off his guard. Enough of them in a row (circuit.guardCounter
  // within GUARD_MEMORY frames) and he answers with his guard counter: the fighter's
  // `guardCounter` move, or his quickest real punch.
  guardHit(S) {
    const n = this.d.stats.guardCounter ?? this.circuit.guardCounter;
    if (!n || this.guardQ || !['idle', 'block', 'hit', 'stunned', 'taunt', 'open', 'recovery'].includes(S)) return;
    const f = this.fight;
    if (f.clock - this.guardAt > GUARD_MEMORY) this.guardHits = 0;
    this.guardAt = f.clock;
    if (++this.guardHits < n) return;
    const id = this.counterMove();
    if (id) this.guardQ = { id, delay: GUARD_DELAY };
  }

  counterMove() {
    if (this.d.guardCounter !== undefined) return this.d.guardCounter;
    if (this.autoCounter !== undefined) return this.autoCounter;
    return (this.autoCounter = quickestPunch(this.d.moves));
  }

  // --- rendering --------------------------------------------------------------
  view() {
    const A = this.d.anims;
    // Animated entries ({ frames, rate }) run on the state timer unless given one.
    const pick = (a, t = this.t) => {
      if (!a) return 'idle1';
      if (Array.isArray(a)) return a[0];
      return a.frames[Math.floor(Math.max(0, t) / a.rate) % a.frames.length];
    };
    let pose = pick(A.idle, this.fight.clock), dx = 0, dy = 0;
    const m = this.move;
    switch (this.state) {
      case 'windup': {
        const w = m.animation.windup;
        const hold = m.animation.windupHold || 0;
        if (w.length > 1 && this.moveT >= hold) pose = w[Math.floor((this.moveT - hold) / (m.animation.windupRate || 6)) % w.length];
        else pose = w[0];
        break;
      }
      case 'active': {
        const a = m.animation.active;
        pose = a[Math.min(a.length - 1, Math.floor((this.moveT / m.activeFrames) * a.length))];
        dy = 3;
        break;
      }
      case 'recovery': {
        const r = m.animation.recovery;
        const len = this.moveResult === 'hit' ? m.recoveryFrames * 0.5 : m.recoveryFrames;
        pose = r[Math.min(r.length - 1, Math.floor((this.moveT / len) * r.length))];
        break;
      }
      case 'block': pose = pick(A.block); break;
      case 'taunt': pose = pick(A.taunt); break;
      case 'backstep': pose = pick(A.idle, this.t * 2); break;
      case 'advance': pose = pick(A.idle, this.t * 2); break;
      case 'hit':
        pose = pick(this.hitHeight === 'high' ? A.hitHigh : A.hitLow);
        dx = this.t < 6 ? (this.t & 2 ? 2 : -2) : 0;
        dy = this.hitHeight === 'high' ? -1 : 1;
        break;
      case 'stunned': pose = pick(A.stunned, this.t); break;
      case 'kd': {
        const k = A.knockdown;
        pose = this.t < 10 ? k[0] : this.t < 22 ? k[1] : this.t < 30 ? k[2] : pick(A.down);
        if (this.t < 10) dy = -2;
        break;
      }
      case 'down': pose = pick(A.down); break;
      case 'getup': pose = this.t < 30 ? pick(A.getup) : pose; break;
      case 'victory': pose = pick(A.victory); dy = (this.fight.clock >> 3) & 1 ? -2 : 0; break;
      case 'open':
        if (this.flinch > 0) {
          pose = pick(this.hitHeight === 'high' ? A.hitHigh : A.hitLow);
          dx = this.flinch > 5 ? (this.flinch & 2 ? 2 : -2) : 0;
        } else pose = pick(A[this.openStep.anim], this.t);
        break;
      default: break;
    }
    // backed off up the ring for his super: `lift` moves him and his shadow up
    const lift = this.state === 'backstep' ? Math.round((SUPER_DEPTH * Math.min(this.t, SUPER_BACK)) / SUPER_BACK)
      : this.state === 'advance' ? Math.round(SUPER_DEPTH * (1 - Math.min(this.t, SUPER_ADVANCE) / SUPER_ADVANCE))
      : this.state === 'taunt' && this.superFar ? SUPER_DEPTH : 0;
    let v = { pose, dx, dy: dy - lift, lift, hidden: false };
    for (const mod of this.modifiers) if (mod.def.view) v = mod.def.view(this, mod.cfg, v) || v;
    return v;
  }

  // The frames where pressing a punch *now* lands a perfect hit (the impact comes
  // `lead` frames later). The fight draws a glint on him during these frames.
  // (the golden moment's subtle tell: fightState draws a small glint on the first of these frames, src/fight/fightState.js)
  kdCue(lead) {
    const inside = (w, t) => w && t + lead >= w[0] && t + lead <= w[1];
    // backed off, about to step in: a punch thrown now lands in the super's windup after the step in (an 'advance' golden moment)
    if ((this.state === 'advance' || (this.state === 'taunt' && this.superFar && this.superTaunt)) && this.cur && this.cur.golden === 'advance') {
      const toWind = this.state === 'advance' ? SUPER_ADVANCE - this.t : Math.max(0, this.wait) + SUPER_ADVANCE;
      const sm = this.superMove();
      return !!sm && lead >= toWind && inside(sm.kdWindow, -toWind);
    }
    if (this.state === 'windup' && this.move && this.move.kdWindow) return inside(this.move.kdWindow, this.moveT) && (!this.move.goldenHit || this.flagOk(this.move.goldenFlag));
    // the golden moment sits on the next move of the super (a Star Punch thrown during Avalanche's rumble lands on the first rock)
    const nx = this.nextChainMove();
    if (nx && nx.m.kdWindow && nx.m.goldenHit) return lead >= nx.wait && inside(nx.m.kdWindow, -nx.wait) && this.flagOk(nx.m.goldenFlag);
    if (this.state === 'windup' && this.move) return false;
    if (this.state === 'taunt') return inside(this.tauntKdNow(), this.t);
    if (this.state === 'recovery' && this.move && this.move.recoveryKd && ['dodged', 'ducked', 'blocked'].includes(this.moveResult)) return inside(this.move.recoveryKd, this.moveT) && this.flagOk(this.move.goldenFlag);
    if (this.state === 'open' && this.openStep) { const G = this.openGolden(this.openStep); return inside(G ? G.window : this.openStep.kd, this.t); }
    return false;
  }
  // a golden moment still ahead in this state (a perfect player holds his punches for it: one thrown now spoils the clean shot)
  goldenAhead(lead) {
    const ahead = (w, t) => !!w && t + lead < w[0];
    if (this.state === 'open' && this.openStep) { const G = this.openGolden(this.openStep); return !!G && ahead(G.window, this.t); }
    if (this.state === 'recovery' && this.move && this.move.recoveryKd && ['dodged', 'ducked', 'blocked'].includes(this.moveResult)) return ahead(this.move.recoveryKd, this.moveT);
    return false;
  }
  // the next move of the armored chain and the frames until its windup starts (from a windup or a recovery of the chain)
  nextChainMove() {
    const A = this.armor, m = this.move;
    if (!A || !A.chain || !m || A.i + 1 >= A.chain.length) return null;
    const nm = this.d.moves[A.chain[A.i + 1]];
    if (!nm) return null;
    const recLen = this.moveResult === 'hit' ? Math.round(m.recoveryFrames * 0.5) : m.recoveryFrames;
    const wait = this.state === 'windup' ? (m.windupFrames - this.moveT) + (m.feint ? 0 : m.activeFrames) + (m.feint ? m.recoveryFrames : recLen)
      : this.state === 'active' ? (m.activeFrames - this.moveT) + recLen : this.state === 'recovery' ? recLen - this.moveT : null;
    return wait == null ? null : { m: nm, wait };
  }
  // the punch the golden moment showing now needs (the bot reads it; a player learns it)
  cueHit() {
    if (this.state === 'advance' || (this.state === 'taunt' && this.superFar)) { const sm = this.superMove(); return sm ? sm.goldenHit || null : null; }
    if (this.state === 'taunt') return hitOf(this.cur, this.d);
    if (this.state === 'open') { const G = this.openGolden(this.openStep); return G ? hitOf(G, this.d) : null; }
    const nx = this.nextChainMove();
    if (nx && nx.m.goldenHit) return nx.m.goldenHit;
    return this.move && this.move.goldenHit || null;
  }

  // For fight-lab overlays.
  timeline() {
    if (!this.move || !['windup', 'active', 'recovery'].includes(this.state)) return null;
    const m = this.move;
    const at = this.state === 'windup' ? this.moveT : this.state === 'active' ? m.windupFrames + this.moveT : m.windupFrames + m.activeFrames + this.moveT;
    return { move: m, at };
  }
}

// A circuit fake: the same tell, cut off at 60%, then a shrug back to idle.
function makeFake(m) {
  const w = Math.max(6, Math.round(m.windupFrames * 0.6));
  const hold = m.animation.windupHold || 0;
  return {
    ...m, name: m.name + ' (FAKE)', feint: true, fake: true,
    windupFrames: w, activeFrames: 0, recoveryFrames: FAKE_REST,
    counterWindow: [2, w - 1], starWindow: null, kdWindow: null, knockdown: false, cancels: 0, openAfter: null,
    animation: { ...m.animation, windupHold: Math.min(hold, w - 2), recovery: ['idle1'] },
    sfx: m.sfx && m.sfx.tell ? { tell: m.sfx.tell } : {},
  };
}

function shuffleMoves(steps) {
  const out = steps.map((s) => ({ ...s }));
  const idx = out.map((s, i) => (s.move ? i : -1)).filter((i) => i >= 0);
  const moves = idx.map((i) => out[i].move);
  for (let i = moves.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [moves[i], moves[j]] = [moves[j], moves[i]]; }
  idx.forEach((i, k) => { out[i].move = moves[k]; });
  return out;
}
