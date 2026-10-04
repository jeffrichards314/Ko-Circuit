// The Void's gimmicks (spec §18 A6, Phase E): ZERO's shards. One file for the zone; merged in asc/index.js. Same hooks as every modifier.
//   segGate      (ZERO's true form) runs another modifier only while ai.mods.seg is a given segment
// Void I: The Fundamentals
//   dodgeflow    Dodge Shard    counts the slips in a row; the eighth tires him (a flag his exploit reads)
//   syncopate    Block Shard    his rhythm keeps changing: every gap is stretched by a random, changing amount
//   counterOnly  Counter Shard  nothing hurts him but a counter (or what a counter starts): the rest bounces off
import { drawTextBig, drawText, textWidth, callout } from '../../engine/font.js';
import { c32 } from '../../engine/palette.js';
import { badge, box, IN_RING, bayer, nextMoveId } from '../ascension.js';
import { panel } from '../hud.js';

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const REG = {}; // filled below; `gate` needs the registry of the modifiers it wraps

export const VOID_MODIFIERS = {
  segGate: {
    init(ai, cfg) { const d = REG[cfg.inner.type]; cfg.def = d; if (d && d.init) d.init(ai, cfg.inner); },
  },
  dodgeflow: {
    init(ai) { ai.mods.flow = 0; },
    roundStart(ai) { ai.mods.flow = 0; },
    moveResolved(ai, cfg, m, r) {
      const M = ai.mods, K = ai.know;
      if (m.call || m.feint) return;
      if (r === 'dodged') {
        M.flow++;
        if (M.flow >= cfg.n) { M.flow = 0; M.tiredT = 60; if (K) K.roundFlags.winded = true; ai.fight.event('winded'); return; }
      } else if (r === 'hit') M.flow = 0;
      if (K) K.roundFlags.winded = false;
    },
    update(ai) { if (ai.mods.tiredT > 0) ai.mods.tiredT--; },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const n = ai.mods.flow;
      if (n > 0 || ai.mods.tiredT > 0) badge(frame, ai.mods.tiredT > 0 ? 'WINDED!' : `FLOW ${n}/${cfg.n}`, ai.mods.tiredT > 0 ? fight.COL.yellow : fight.COL.cyan);
    },
  },
  syncopate: {
    init(ai) { ai.mods.rh = { list: null, i: 0, left: 0 }; },
    roundStart(ai) { ai.mods.rh = { list: null, i: 0, left: 0 }; },
    update(ai, cfg) {
      const M = ai.mods, R = M.rh;
      if (ai.fight.phase !== 'fight' || ai.state !== 'idle' || ai.t !== 1) return;
      if (ai.wait > 200 || ai.superTaunt) return;
      if (R.left <= 0) { R.list = cfg.rhythms[rand(0, cfg.rhythms.length - 1)]; R.i = 0; R.left = rand(4, 7); }
      const extra = R.list[R.i++ % R.list.length];
      R.left--;
      ai.wait += extra;
    },
  },
  // Block Shard: three blocks in a row with no punch of yours between them shake his arms loose (a flag his exploit reads)
  blockflow: {
    init(ai) { ai.mods.bl = 0; },
    roundStart(ai) { ai.mods.bl = 0; },
    onPlayerPunch(ai, cfg, p, r) { if (r.result !== 'whiff') ai.mods.bl = 0; },
    moveResolved(ai, cfg, m, r) {
      const M = ai.mods, K = ai.know;
      if (m.call || m.feint) return;
      if (r === 'blocked') M.bl++; else M.bl = 0;
      if (K) K.roundFlags.threeBlocks = M.bl >= 3;
      if (M.bl >= 3) { M.bl = 0; ai.fight.event('armsGiveOut'); }
    },
  },
  counterOnly: {
    init(ai) { ai.mods.retortQ = null; },
    futile(ai, cfg) {
      if (ai.state === 'windup') return false;
      if (ai.state === 'stunned' || ai.stun > 0 || (ai.state === 'hit' && ai.combo < ai.flurry)) return false;
      if ((cfg.hittable || []).includes(ai.state)) return false;
      return true;
    },
    onPlayerPunch(ai, cfg, p, r) {
      if (r.result === 'whiff' || r.counter || r.knockdown || ai.punch.stunned) return;
      if ((cfg.hittable || []).includes(ai.punch.state)) return;
      if (ai.punch.state === 'hit' || ai.punch.state === 'stunned') return;
      ai.fight.sfx('clang');
      if (!['windup', 'active'].includes(ai.punch.state)) ai.mods.retortQ = cfg.move;
      return { result: 'blocked', absorbed: true };
    },
    update(ai) {
      const M = ai.mods;
      if (M.retortQ && ['idle', 'block', 'taunt', 'recovery'].includes(ai.state)) { const id = M.retortQ; M.retortQ = null; ai.beginMove(id, { forced: true }); }
    },
    palette(ai, cfg) {
      const m = ai.move, lead = cfg.lead ?? 4;
      if (ai.state !== 'windup' || !m || !m.counterWindow) return null;
      const f = ai.moveT + lead;
      return f >= m.counterWindow[0] && f <= m.counterWindow[1] ? cfg.flash : null;
    },
  },

  // ------------------------------------------------------------------ Void II --

  // Sight Shard: the fight is silent (his data sets `silent`), so his tells are only what you see. Every windup lights a halo round his head
  // and the screen's edge in the colour of the defense: WHITE slip (the pose shows the side), RED block, YELLOW duck. He also blinks: every
  // cfg.every frames in his stance his eye shuts for cfg.frames (the event 'blink': a hit then is an exploit).
  sightEye: {
    init(ai, cfg) { ai.mods.blinkAt = cfg.first || 420; ai.mods.blinkT = 0; },
    roundStart(ai, cfg) { ai.mods.blinkAt = ai.fight.clock + (cfg.first || 420); },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.blinkT > 0) M.blinkT--;
      if (f.phase !== 'fight') return;
      if (f.clock >= M.blinkAt && ai.state === 'idle' && !ai.superTaunt && ai.wait > 12) { M.blinkT = cfg.frames || 16; M.blinkAt = f.clock + (cfg.every || 520); f.event('blink'); }
    },
    view(ai, cfg, v) { return v; },
    renderOpp(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown'].includes(fight.phase)) return;
      const v = ai.view();
      if (v.hidden) return;
      const h = fight.oppHead(v), M = ai.mods;
      if (M.blinkT > 0) { frame.rect(Math.round(h.x - 10), Math.round(h.y - 4), 21, 6, fight.COL.black); return; }
      const m = ai.move;
      if (ai.state !== 'windup' || !m || m.call || !m.avoidBy) return;
      const av = m.avoidBy, col = av.some((a) => a.startsWith('dodge')) ? c32(31, 31, 31) : av.includes('block') ? c32(31, 6, 6) : c32(31, 28, 6);
      for (let a = 0; a < 40; a++) { const t = (a / 40) * Math.PI * 2; frame.px(Math.round(h.x + Math.cos(t) * 17), Math.round(h.y + Math.sin(t) * 19), col); frame.px(Math.round(h.x + Math.cos(t) * 18), Math.round(h.y + Math.sin(t) * 20), col); }
    },
    postScene(ai, cfg, frame, fight) {
      const m = ai.move;
      if (fight.phase !== 'fight' || ai.state !== 'windup' || !m || m.call || !m.avoidBy) return;
      const av = m.avoidBy, col = av.some((a) => a.startsWith('dodge')) ? c32(31, 31, 31) : av.includes('block') ? c32(31, 6, 6) : c32(31, 28, 6);
      for (let i = 0; i < 256; i++) { frame.px(i, 44, col); frame.px(i, 45, col); frame.px(i, 222, col); frame.px(i, 223, col); }
      for (let j = 44; j < 224; j++) { frame.px(0, j, col); frame.px(255, j, col); }
    },
  },

  // Sound Shard: he can barely be seen. A faint ghost (one pixel in sixteen of him) hangs in the ring; he shows fully for cfg.reveal frames
  // after you hit him, and whenever he is hurt, down or stunned. His only tell is his sound (every defense has its own).
  unseen: {
    init(ai) { ai.mods.reveal = 0; },
    onPlayerPunch(ai, cfg, p, r) { if (r.result === 'hit') ai.mods.reveal = cfg.reveal || 50; },
    update(ai) { if (ai.mods.reveal > 0) ai.mods.reveal--; },
    view(ai, cfg, v) {
      const shown = ai.mods.reveal > 0 || ['kd', 'down', 'getup', 'stunned', 'hit', 'victory'].includes(ai.state) || ai.fight.phase === 'intro';
      return shown ? v : { ...v, hidden: true, ghostPose: v.pose };
    },
    renderOpp(ai, cfg, frame, fight) {
      const v = ai.view();
      if (!v.hidden || !v.ghostPose || !['fight', 'oppDown', 'playerDown'].includes(fight.phase)) return;
      const s = fight.oppSprites.get(v.ghostPose), pal = fight.oppPalette(ai.paletteOverride() || 'default');
      const ox = Math.round(fight.OPP_X + v.dx) - s.ax, oy = Math.round(fight.OPP_Y + v.dy) - s.ay, t = fight.clock >> 2;
      for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
        const q = s.data[j * s.w + i];
        if (!q) continue;
        const X = ox + i, Y = oy + j;
        if (bayer(X + t, Y) < (cfg.density ?? 0.07)) frame.px(X, Y, pal[q]);
      }
    },
  },

  // Rhythm Shard: every punch lands ON A BEAT. A grid of beats runs on the fight clock (a click on every beat, a stronger one on the bar's first);
  // his next punch waits (a longer idle, never a shorter one) until its impact falls on a beat. The tempo changes every cfg.bars bars (a new tempo
  // never twice running, the music with it): the click and his metronome are the tell.
  beatgrid: {
    init(ai, cfg) { const bpm = cfg.tempos[cfg.start ?? 1]; ai.mods.bg = { bpm, fpb: 3600 / bpm, next: 1e9, n: 0, pulse: 0, said: 0, aligned: false, lastBeat: -99 }; },
    fightStart(ai, cfg) { const B = ai.mods.bg, f = ai.fight; B.next = f.clock + 36; B.n = 0; B.aligned = false; if (f.audio && cfg.songs && f.opts.songBank) f.audio.play(f.opts.songBank[cfg.songs[B.bpm]]); },
    moveStart(ai) { ai.mods.bg.aligned = false; },
    update(ai, cfg) {
      const B = ai.mods.bg, f = ai.fight;
      if (B.pulse > 0) B.pulse--;
      if (B.said > 0) B.said--;
      if (f.phase !== 'fight') return;
      while (f.clock >= B.next) {
        B.n++; B.lastBeat = f.clock; B.pulse = 6; B.next += B.fpb;
        f.sfx((B.n - 1) % 4 === 0 ? 'baton' : 'tick');
        if (B.n % (cfg.bars * 4) === 0) {
          const opts = cfg.tempos.filter((t) => t !== B.bpm);
          B.bpm = opts[Math.floor(Math.random() * opts.length)]; B.fpb = 3600 / B.bpm; B.said = 70;
          f.sfx('tempoUp'); f.event('tempoChange');
          if (f.audio && cfg.songs && f.opts.songBank) f.audio.play(f.opts.songBank[cfg.songs[B.bpm]]);
        }
      }
      // line the next punch up with a beat
      if (ai.state === 'idle' && ai.wait <= 1 && !B.aligned && !ai.superTaunt) {
        const id = nextMoveId(ai), m = id && ai.d.moves[id];
        if (m && !m.call && !m.feint) {
          const imp = f.clock + m.windupFrames;
          const j = Math.max(0, Math.ceil((imp - B.next) / B.fpb - 1e-6));
          const b = B.next + j * B.fpb;
          ai.wait += Math.max(0, Math.round(b - imp));
          B.aligned = true;
        }
      }
    },
    // the downbeat (a bar's first beat) is when a slipped punch tires him: the flag his exploit reads
    moveResolved(ai, cfg, m, r) {
      const B = ai.mods.bg, K = ai.know;
      if (K) K.roundFlags.downbeat = ((B.n - 1) % 4 === 0) && Math.abs(ai.fight.clock - B.lastBeat) <= 1 && !m.call;
    },
    renderOpp(ai, cfg, frame, fight) {
      if (!['fight', 'oppDown', 'playerDown'].includes(fight.phase)) return;
      const B = ai.mods.bg, v = ai.view();
      if (v.hidden) return;
      // his metronome: a lamp on his chest that flashes on every beat (white on the downbeat)
      const x = fight.OPP_X + v.dx, y = fight.OPP_Y + v.dy - 78;
      if (B.pulse > 0) { const down = (B.n - 1) % 4 === 0; frame.rect(x - 3, y - 3, 7, 7, down ? c32(31, 31, 31) : c32(31, 18, 24)); frame.rect(x - 1, y - 1, 3, 3, c32(31, 31, 31)); }
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const B = ai.mods.bg;
      // the beat dots and the tempo under the clock
      const w = 62, x0 = 128 - (w >> 1);
      panel(frame, x0, 42, w, 11);
      drawText(frame, `${B.bpm}`, x0 + 3, 44, fight.COL.orange, { mono: false });
      for (let i = 0; i < 4; i++) { const on = ((B.n - 1) % 4 + 4) % 4 === i && B.pulse > 0; frame.rect(x0 + 24 + i * 9, 45, 6, 5, on ? (i === 0 ? fight.COL.white : fight.COL.pink) : fight.COL.barBack); }
      if (B.said > 0 && (B.said >> 2) & 1) callout(frame, `TEMPO ${B.bpm}!`, 128, 56, fight.COL.yellow, fight.COL.black, 1);
    },
  },

  // Memory Shard: one fixed sequence of 60 moves, the same in every round and every retry. It shows which move of the sequence he is on
  // (MOVE 17/60): learning the order is the whole fight.
  memcount: {
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const n = memIndex(ai);
      const t = `MOVE ${n}/${cfg.total}`, w = textWidth(t, false) + 8;
      panel(frame, 128 - (w >> 1), 42, w, 11);
      drawText(frame, t, 128 - (textWidth(t, false) >> 1), 44, fight.COL.green, { mono: false });
    },
  },
};
// which move of his sequence he has started (0-based count of the pattern's moves before the current step)
export function memIndex(ai) {
  if (!ai.steps || !ai.pattern) return 0;
  return ai.steps.slice(0, ai.stepIdx).filter((s) => s.move).length;
}
// Void III: The Mind
//   echoReplay   Echo Shard   attacks with your own punches from the previous round
//   chaos        Chaos Shard  his move pool is re-rolled every 10 seconds
//   timewarp     Time Shard   time speeds up or slows down in the middle of a pattern
//   will         Will Shard   five rounds with nothing restored between them: he gets stronger with each
const ECHO_MAP = { jabLhigh: 'eJab', jabRhigh: 'eJabR', jabLlow: 'eBody', jabRlow: 'eBodyR', star: 'eStar' };
Object.assign(VOID_MODIFIERS, {
  // silence, for a while (ZERO's test of the Sight Shard): nothing plays until the segment is over
  hush: {
    segOn(ai) { ai.fight.silence = true; if (ai.fight.audio) ai.fight.audio.stop(); },
    segOff(ai) { ai.fight.silence = !!ai.fight.d.silent; ai.fight.roundMusic(); },
  },
  echoReplay: {
    init(ai) { ai.d = { ...ai.d, patterns: [...ai.d.patterns] }; const M = ai.mods; M.cur = []; M.prev = null; M.t0 = 0; },
    roundStart(ai) { ai.mods.prev = ai.mods.cur; ai.mods.cur = []; },
    fightStart(ai, cfg) { const M = ai.mods; M.t0 = ai.fight.clock; M.cur = []; arm(ai, cfg, M.prev); },
    // ZERO's test of the Echo Shard: the last `rolling` frames of your punches, from the moment the segment starts
    segOn(ai, cfg) {
      const M = ai.mods, f = ai.fight, from = f.clock - (cfg.rolling || 900);
      arm(ai, cfg, M.cur.filter((e) => e.t > from).map((e) => ({ t: e.t - from, key: e.key })));
    },
    alwaysUpdate(ai) { recordEcho(ai); },
    update(ai) { if (ai.mods.said > 0) ai.mods.said--; recordEcho(ai); },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods, n = memIndex(ai), t = `ECHO ${Math.min(n, M.total)}/${M.total}`, w = textWidth(t, false) + 8;
      panel(frame, 128 - (w >> 1), 42, w, 11);
      drawText(frame, t, 128 - (textWidth(t, false) >> 1), 44, fight.COL.cyan, { mono: false });
      if (M.said > 0 && (M.said >> 2) & 1) callout(frame, fight.round > 1 ? 'YOUR OWN PUNCHES!' : 'NOTHING TO ECHO YET', 128, 60, fight.COL.yellow, fight.COL.black, 1);
    },
  },

  chaos: {
    init(ai) { ai.d = { ...ai.d, patterns: [...ai.d.patterns] }; ai.mods.slot = -1; ai.mods.pal = 0; ai.mods.flash = 0; },
    fightStart(ai, cfg) { ai.mods.slot = -1; reroll(ai, cfg, ai.fight.round > 1 || false); },
    update(ai, cfg) {
      const M = ai.mods, f = ai.fight;
      if (M.flash > 0) M.flash--;
      if (f.phase !== 'fight') return;
      const slot = Math.floor(f.realSeconds() / cfg.every);
      if (slot !== M.slot) reroll(ai, cfg, true);
    },
    palette(ai, cfg) { return cfg.palettes[ai.mods.pal % cfg.palettes.length]; },
    postScene(ai, cfg, frame, fight) {
      if (ai.mods.flash <= 0 || fight.phase !== 'fight') return;
      for (let y = 44; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < ai.mods.flash / 30 && ((x + y) & 1)) frame.px(x, y, c32(31, 31, 31));
    },
    render(ai, cfg, frame, fight) {
      if (fight.phase === 'fight' && ai.mods.flash > 8 && (ai.mods.flash >> 2) & 1) callout(frame, 'CHAOS!', 128, 56, fight.COL.pink, fight.COL.black, 2);
    },
  },

  timewarp: {
    init(ai, cfg) { ai.mods.k = 1; ai.mods.left = rand(cfg.every[0], cfg.every[1]); ai.mods.showT = 0; },
    roundStart(ai, cfg) { ai.mods.k = 1; ai.mods.left = rand(cfg.every[0], cfg.every[1]); },
    modifyMove(ai, cfg, m) {
      const k = ai.mods.k;
      if (k === 1 || m.call || m.feint || !m.avoidBy) return m;
      const add = k < 1 ? Math.round(m.windupFrames < 8 ? 2 : m.windupFrames * 0.2) : 0;
      const o = { ...m, windupFrames: m.windupFrames + add, recoveryFrames: Math.max(cfg.minRecovery, Math.round(m.recoveryFrames / k)) };
      if (add && m.counterWindow) o.counterWindow = [m.counterWindow[0], m.counterWindow[1] + add];
      if (add && m.kdWindow) o.kdWindow = [m.kdWindow[0] + add, m.kdWindow[1] + add];
      if (add && m.starWindow) o.starWindow = [m.starWindow[0], m.starWindow[1] + add];
      return o;
    },
    moveResolved(ai, cfg, m) {
      const M = ai.mods, K = ai.know;
      if (m.call || m.feint) return;
      if (--M.left > 0) return;
      // time turns: to the pace that is not the current one
      const opts = cfg.paces.filter((p) => p !== M.k);
      const old = M.k; M.k = opts[Math.floor(Math.random() * opts.length)]; M.left = rand(cfg.every[0], cfg.every[1]); M.showT = 80;
      if (ai.move) ai.move.recoveryFrames = Math.max(cfg.minRecovery, Math.round(ai.move.recoveryFrames * old / M.k));
      ai.fight.sfx(M.k > old ? 'tempoUp' : 'groan'); ai.fight.event('timeShift');
      if (K) K.roundFlags.slowTime = M.k < 1;
    },
    update(ai, cfg) {
      const M = ai.mods;
      if (M.showT > 0) M.showT--;
      if (ai.fight.phase === 'fight' && ai.state === 'idle' && ai.t === 1 && M.k !== 1 && ai.wait < 200) ai.wait = Math.max(4, Math.round(ai.wait / M.k));
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const M = ai.mods, txt = M.k < 1 ? '<< SLOW' : M.k > 1 ? 'FAST >>' : 'TIME';
      const w = textWidth(txt, false) + 8;
      panel(frame, 128 - (w >> 1), 31, w, 10); // (the badge row under the clock: the meter row below is his BORROWED gauge's)
      drawText(frame, txt, 128 - (textWidth(txt, false) >> 1), 33, M.k < 1 ? fight.COL.cyan : M.k > 1 ? fight.COL.red : fight.COL.grey, { mono: false });
      if (M.showT > 30 && (M.showT >> 2) & 1) callout(frame, M.k < 1 ? 'TIME SLOWS...' : 'TIME RACES!', 128, 60, M.k < 1 ? fight.COL.cyan : fight.COL.red, fight.COL.black, 1);
    },
  },

  will: {
    modifyMove(ai, cfg, m) {
      const r = (ai.fight.stage || ai.fight.round) - 1;
      if (!r || m.call || m.feint || !m.damage) return m;
      return { ...m, damage: Math.round(m.damage * (1 + cfg.dmg * r)), recoveryFrames: Math.max(14, Math.round(m.recoveryFrames * (1 - cfg.rec * r))) };
    },
    render(ai, cfg, frame, fight) {
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro') return;
      const r = fight.stage || fight.round, w = 72;
      panel(frame, 128 - (w >> 1), 42, w, 11);
      drawText(frame, 'WILL', 128 - (w >> 1) + 4, 44, fight.COL.orange, { mono: false });
      for (let i = 0; i < Math.max(fight.rounds, r); i++) frame.rect(128 - (w >> 1) + 30 + i * 8, 45, 6, 5, i < r ? fight.COL.red : fight.COL.barBack);
    },
  },
});

// the player's punches of this round (or, for ZERO, of the whole fight so far), as { t, key }
function recordEcho(ai) {
  const M = ai.mods, f = ai.fight;
  if (!M.cur) return;
  const a = ai.playerAction();
  if (a && a.punch && f.phase === 'fight') M.cur.push({ t: f.clock - M.t0, key: ECHO_MAP[a.key] ? a.key : 'star' });
}
// his pattern from what you did: your punches in order (none closer than cfg.minGap), padded to 30 moves with his own
function arm(ai, cfg, prev) {
  const M = ai.mods, f = ai.fight;
  let steps = [{ idle: 34 }], last = -1e9, moves = 0;
  if (prev) {
    for (const e of prev) {
      if (e.t - last < cfg.minGap || moves >= 40) continue;
      if (last > -1e8) steps.push({ idle: Math.max(cfg.minIdle, Math.round(e.t - last - cfg.moveLen)) });
      steps.push({ move: ECHO_MAP[e.key] }); last = e.t; moves++;
    }
    if (prev.length < 6 && f.round > 1 && !cfg.rolling) f.event('emptyEcho');
  }
  const stock = cfg.stock;
  for (let i = 0; moves < 30; i++) { if (moves) steps.push({ idle: 22 }); steps.push({ move: stock[i % stock.length] }); moves++; }
  steps.push({ idle: 44 });
  const pat = { id: 'echo', weight: 1, fixed: true, seg: cfg.patternSeg, steps };
  ai.d.patterns = [...ai.d.patterns.filter((p) => p.id !== 'echo'), pat]; ai.pattern = null; ai.stepIdx = 0;
  M.total = moves; M.said = 80;
}

// Chaos Shard: a new pool of five moves and a new pattern of 32 of them, with room after every block-only or duck-only punch
function reroll(ai, cfg, announce) {
  const M = ai.mods, f = ai.fight;
  M.slot = Math.floor(f.realSeconds() / cfg.every);
  const pool = [...cfg.moves].sort(() => Math.random() - 0.5).slice(0, cfg.size);
  const steps = [{ idle: 30 }];
  let prev = null;
  for (let i = 0; i < 32; i++) {
    const id = pool[Math.floor(Math.random() * pool.length)];
    if (prev) steps.push({ idle: rand(cfg.gaps[0], cfg.gaps[1]) + (cfg.locked.includes(prev) ? 8 : 0) });
    steps.push({ move: id }); prev = id;
  }
  steps.push({ idle: 40 });
  ai.d.patterns = [...ai.d.patterns.filter((p) => p.id !== 'chaos'), { id: 'chaos', weight: 1, fixed: true, seg: cfg.patternSeg, steps }];
  ai.pattern = null; ai.stepIdx = 0;
  M.pal = rand(0, cfg.palettes.length - 1);
  if (announce) { M.flash = 30; f.sfx('glitch'); f.event('reroll'); }
}
// ZERO's true form (Phase E): the four phases (spec §4 "Boss phases": each lasts until its health bar is emptied, on an extended
// bout), each cut into SEGMENTS (a shard's test, a form of Halcyon or of Vorgath). The current segment is `ai.mods.seg`; the gated
// modifiers and the patterns tagged with `seg` follow it.
//   cfg.rounds[phase] = { segs: [{ seg, form?, name }], pace?: 1.4 }; a phase's segments share each round's real seconds equally
Object.assign(VOID_MODIFIERS, {
  zeroSeg: {
    init(ai) { ai.mods.seg = null; ai.mods.segI = -1; ai.mods.segShow = 0; },
    fightStart(ai, cfg) { ai.mods.segI = -1; ai.mods.seg = null; zeroSetSeg(ai, cfg, 0); },
    roundStart(ai) { ai.fight.minimalHud = zph(ai.fight) >= 4; ai.fight.formOverride = null; ai.mods.seg = null; ai.mods.segI = -1; },
    phaseStart(ai, cfg, n) {
      ai.fight.minimalHud = n >= 4; ai.fight.formOverride = null; ai.mods.seg = null; ai.mods.segI = -1;
      // the last phase is the fastest and the thinnest: a glass cannon (cfg.finalHealth)
      if (n >= 4 && cfg.finalHealth) { ai.maxHealth = cfg.finalHealth; ai.health = ai.maxHealth; }
      zeroSetSeg(ai, cfg, 0);
    },
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods;
      if (M.segShow > 0) M.segShow--;
      if (f.phase !== 'fight') return;
      const R = cfg.rounds[Math.min(zph(f), 4)], i = Math.min(R.segs.length - 1, Math.floor(f.realSeconds() / (f.roundReal() / R.segs.length)));
      if (i !== M.segI) zeroSetSeg(ai, cfg, i);
      // phase 4 is at full speed: gaps shrink (never the tells)
      if (R.pace && f.phase === 'fight' && ai.state === 'idle' && ai.t === 1 && ai.wait < 200 && !ai.superTaunt) ai.wait = Math.max(6, Math.round(ai.wait / R.pace));
    },
    modifyMove(ai, cfg, m) {
      const R = cfg.rounds[Math.min(zph(ai.fight), 4)];
      if (!R.pace || m.call || m.feint || !m.avoidBy || m.super) return m;
      return { ...m, recoveryFrames: Math.max(14, Math.round(m.recoveryFrames / R.pace)) };
    },
    eligible(ai, cfg, p) { return !p.seg || (Array.isArray(p.seg) ? p.seg.includes(ai.mods.seg) : p.seg === ai.mods.seg); },
    render(ai, cfg, frame, fight) {
      const M = ai.mods;
      if (!IN_RING.includes(fight.phase) || fight.phase === 'intro' || !M.segName) return;
      void frame; // (the segment's name is no longer flashed in the fight, spec §4: only SCOUTED! pops up)
    },
  },
});
// his phase (the fight's boss phase; the round, for a fight run without one)
const zph = (f) => (f.bossPhases > 1 ? f.bossPhase : f.round);
function zeroSetSeg(ai, cfg, i) {
  const M = ai.mods, f = ai.fight, R = cfg.rounds[Math.min(zph(f), 4)], S = R.segs[i];
  M.segI = i; M.seg = S.seg; M.segName = S.name; M.segShow = S.name ? 70 : 0;
  f.formOverride = S.form || null;
  f.minimalHud = zph(f) >= 4;
  ai.pattern = null; ai.stepIdx = 0;
  if (S.name && i > 0) f.sfx('glitch');
  f.event('segment');
}

// --- segGate: every hook of the inner modifier, only while its segment is on ----------------------------------------
// The inner modifier's own `segOn(ai, cfg)` / `segOff(ai, cfg)` (or, without them, its `fightStart` / nothing) run as the segment starts and ends.
const segOf = (ai) => ai.mods.seg;
const gateOn = (ai, cfg) => (cfg.segs ? cfg.segs.includes(segOf(ai)) : segOf(ai) === cfg.seg);
const PASS = { modifyMove: (ai, cfg, m) => m, view: (ai, cfg, v) => v, mapInput: (ai, cfg, a) => a, eligible: () => true };
for (const h of ['roundStart', 'fightStart', 'phaseStart', 'moveStart', 'moveResolved', 'openDone', 'openBroken', 'onKnockdown', 'modifyMove', 'onPlayerPunch', 'mapInput', 'render', 'renderOpp', 'postScene',
  'palette', 'view', 'eligible', 'futile', 'threats', 'takeover', 'bannerY', 'sneak', 'afterKnowledge', 'stageChange', 'betweenRounds', 'getUp', 'playerDown', 'playerUp', 'clinchBroken']) {
  VOID_MODIFIERS.segGate[h] = (ai, cfg, ...a) => {
    const d = cfg.def;
    if (!d || !d[h] || !gateOn(ai, cfg)) return PASS[h] ? PASS[h](ai, cfg, ...a) : undefined;
    if (h === 'roundStart' || h === 'fightStart') return undefined; // (a gated modifier starts with its segment)
    return d[h](ai, cfg.inner, ...a);
  };
}
VOID_MODIFIERS.segGate.update = (ai, cfg) => {
  const d = cfg.def, on = gateOn(ai, cfg), key = 'sg:' + (cfg.seg || cfg.segs.join()) + cfg.inner.type, M = ai.mods;
  if (!d) return;
  if (on && !M[key]) { M[key] = true; if (d.segOn) d.segOn(ai, cfg.inner); else if (d.fightStart) d.fightStart(ai, cfg.inner); }
  else if (!on && M[key]) { M[key] = false; if (d.segOff) d.segOff(ai, cfg.inner); }
  if (on && d.update) d.update(ai, cfg.inner);
  else if (d.alwaysUpdate) d.alwaysUpdate(ai, cfg.inner);
};
Object.assign(REG, VOID_MODIFIERS);
void drawTextBig; void drawText; void textWidth; void box; void panel; void nextMoveId;
