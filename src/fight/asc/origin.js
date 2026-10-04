// ORIGIN's mechanics (2026-10-04, the secret final boss; data/fighters/origin/): the modifiers `originSeg` (his phases cut into segments, the way ZERO's
// true form's are) and `origin` (everything that is his own):
//   PHASES      each phase is a list of segments that share the round; the current one is `ai.mods.seg`, the patterns tagged with it are the only ones he picks.
//   SUPERS      `pickSuper` chooses by phase and builds the long ones as he throws them (Every Arena: three or four styles; the Medley: three worlds; the first
//               arena rewound: a bit of everything): the chain is `then`, the golden moment is on its last move.
//   ARENAS      a `flick` call swaps the arena the fight is drawn in for a past one (the champion's own) and he takes that champion's colours; `ea_fin` brings the
//               Beginning back. The fragments of the Beginning light up when a move tied to their place is thrown (`arena.state.lit`).
//   REWIND      a blow marked `rewind` that lands is undone (the fight asks first: `rewindHit`, so no damage, no hearts, no star is taken), time runs back to the
//               start of the sequence and it replays faster, up to three times. A run with no hit in it is `rewindClean`: the golden moment of its last blow is
//               only there then.
//   SLOW-MO     the First Punch's windup slows the whole screen (`fight.timeScale`, read by the fight screen): every frame of it is the same game frame, only
//               slower to watch, so nothing about it is harder than a normal tell, and the golden moment, two frames wide, is six or seven frames of real time.
//   LOOK        his body cycles through the palettes of every zone, his afterimages trail every move, a halo of every belt in the game orbits his head (the true
//               form's is a ring of fire), the belts that slam down, the fist of the First Punch: src/fight/asc/originFx.js.
import { Arena } from '../../engine/arena.js';
import { ARENAS } from '../../../data/arenas/index.js';
import { CIRCUITS } from '../../../data/circuits.js';
import { STYLES, STYLE_BY_ID } from '../../../data/fighters/origin/styles.js';
import { MEDLEY_WORLDS, REWIND_CHAIN, styleChain, WORLD_NAMES, VOID_SIG_KEYS } from '../../../data/fighters/origin/_kit.js';
import { ZONE_ORDER } from '../../../data/sprites/fighters/origin/origin.js';

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { const o = [...a]; for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
const PH = (f) => (f.bossPhases > 1 ? f.bossPhase : f.round);
export const MAX_REWINDS = 3;

export const ORIGIN_MODIFIERS = {
  // ------------------------------------------------------------------------------------------------------------------ phases and segments
  //   cfg.rounds[phase] = { segs: [{ seg, name, style? }], pace?: 1.2 }  (a phase's segments share each round's real seconds equally)
  //   cfg.finalHealth: the last phase's (thinner) health bar
  originSeg: {
    init(ai) { ai.mods.seg = null; ai.mods.segI = -1; },
    fightStart(ai, cfg) { ai.mods.seg = null; segSet(ai, cfg, 0); },
    roundStart(ai) { ai.mods.seg = null; ai.mods.segI = -1; ai.fight.formOverride = null; },
    phaseStart(ai, cfg, n) {
      ai.mods.seg = null; ai.mods.segI = -1;
      if (n >= ai.fight.bossPhases && cfg.finalHealth) { ai.maxHealth = cfg.finalHealth; ai.health = ai.maxHealth; }
      segSet(ai, cfg, 0);
    },
    update(ai, cfg) {
      const f = ai.fight, M = ai.mods;
      if (f.phase !== 'fight') return;
      const R = cfg.rounds[Math.min(PH(f), cfg.rounds.length - 1)] || cfg.rounds[cfg.rounds.length - 1], i = Math.min(R.segs.length - 1, Math.floor(f.realSeconds() / (f.roundReal() / R.segs.length)));
      if (R.segs[i].seg !== M.seg) segSet(ai, cfg, i);
      // the last phases are the quickest: the pauses between his combos shrink (never the tells)
      if (R.pace && ai.state === 'idle' && ai.t === 1 && ai.wait < 200 && !ai.superTaunt) ai.wait = Math.max(6, Math.round(ai.wait / R.pace));
    },
    modifyMove(ai, cfg, m) {
      const R = cfg.rounds[Math.min(PH(ai.fight), cfg.rounds.length - 1)] || cfg.rounds[cfg.rounds.length - 1];
      if (!R.pace || m.call || m.feint || !m.avoidBy || m.super) return m;
      return { ...m, recoveryFrames: Math.max(14, Math.round(m.recoveryFrames / R.pace)) };
    },
    eligible(ai, cfg, p) { return !p.seg || (Array.isArray(p.seg) ? p.seg.includes(ai.mods.seg) : p.seg === ai.mods.seg); },
  },

  origin: {
    init(ai, cfg) {
      const f = ai.fight;
      ai.mods.o = {
        t: 0, home: f.arena, arenas: {}, cur: 'home', flick: 0, flickTo: null, lit: {}, style: null, world: null, sm: 1, smWant: 1,
        gone: new Set(), goneT: {}, rw: null, rwFlash: 0, rwCount: 0, clean: true, hist: [], picks: 0, last: null, styleSeg: null, calm: 0, zoneAt: 0, true: !!cfg.trueForm,
      };
      f.timeScale = 1;
    },
    fightStart(ai) { const O = ai.mods.o; arenaTo(ai, 'home', false); O.style = null; O.world = null; },
    roundStart(ai) { const O = ai.mods.o; O.rw = null; O.style = null; O.world = null; if (ai.fight.round > 1) arenaTo(ai, 'home', false); ai.fight.timeScale = 1; O.sm = 1; },
    phaseStart(ai) { const O = ai.mods.o; O.rw = null; O.style = null; O.world = null; ai.fight.timeScale = 1; O.sm = 1; },

    // ---- which super, and the long ones built as he throws them --------------------------------------------------------------------
    //   cfg.mix[phase] = [[super key (its first move), weight], ...]; `cfg.styles` / `cfg.worlds`: how many styles in Every Arena / worlds in the Medley
    pickSuper(ai, cfg, list) {
      const f = ai.fight, O = ai.mods.o, ph = Math.min(PH(f), Object.keys(cfg.mix).length), mix = cfg.mix[ph] || cfg.mix[1], n = O.picks++;
      // (the first super of a fight is the First Punch: it is what he is known for)
      const pool = mix.filter(([k]) => list.some((S) => S.move === k));
      let total = pool.reduce((a, [, w]) => a + w, 0), r = Math.random() * total, key = pool[0][0];
      for (const [k, w] of pool) { r -= w; if (r <= 0) { key = k; break; } }
      if (n === 0 && cfg.first && list.some((S) => S.move === cfg.first)) key = cfg.first;
      if (key === O.last && pool.length > 1 && Math.random() < 0.7) key = pool.find(([k]) => k !== O.last)[0];
      O.last = key;
      const T = list.find((S) => S.move === key);
      return derive(ai, cfg, T);
    },
    // ---- the golden moment of a rewound sequence needs a clean run -------------------------------------------------------------------
    rewindHit(ai, cfg, move) {
      const O = ai.mods.o;
      if (!O.rw || !move.rewind || O.rw.n >= MAX_REWINDS) return false;
      O.rw.hit = true; O.clean = false;
      if (ai.know) ai.know.flags.rewindClean = false;
      return true;
    },
    moveStart(ai, cfg, m) {
      const f = ai.fight, O = ai.mods.o;
      if (m.arena !== undefined) arenaTo(ai, m.arena === 'origin' ? 'home' : m.arena, true);
      if (m.style) O.style = m.style === 'origin' ? null : m.style;
      if (m.world) O.world = m.world;
      if (m.slowmo) f.sfx('originGather');
      // a place's fragment lights up while a move tied to it is thrown
      if (m.style && STYLE_BY_ID[m.style]) O.lit[STYLE_BY_ID[m.style].circuit] = 90;
      if (m.id === 'rw_go' || m.id === 'fa_go') {
        const P = f.player;
        O.rw = { n: O.rw && O.rw.chainOf === ai.armor ? O.rw.n : 0, chain: ai.armor && ai.armor.chain ? [...ai.armor.chain] : [m.id], chainOf: ai.armor, snap: { health: P.health, hearts: P.hearts, stars: P.stars }, hit: false };
        O.clean = true;
        if (ai.know) ai.know.flags.rewindClean = true;
      }
    },
    // faster in a replay: the recoveries and the call's windup shrink with every loop (never the tells of the blows themselves)
    modifyMove(ai, cfg, m) {
      const O = ai.mods.o;
      if (!O.rw || !m.rewind || O.rw.n === 0) return m;
      const k = 1 - 0.16 * O.rw.n;
      if (m.call) return { ...m, windupFrames: Math.max(8, Math.round(m.windupFrames * k)) };
      return { ...m, recoveryFrames: Math.max(14, Math.round(m.recoveryFrames * k)) };
    },
    moveResolved(ai, cfg, m, r) {
      const f = ai.fight, O = ai.mods.o;
      // a belt slipped leaves a gap in the halo for a while (his exploit's tell)
      if (m.halo && m.halo.safe && r === 'dodged') { const i = Math.floor(Math.random() * 36); O.gone.add(i); O.goneT[i] = 170; }
      if (!O.rw || !m.rewind) return;
      if (r === 'hit' && O.rw.hit) {
        // TIME RUNS BACK: what the hit did is undone, the sequence starts again, quicker
        const P = f.player, S = O.rw.snap;
        P.health = S.health; P.hearts = S.hearts; P.stars = S.stars; P.pink = P.hearts === 0;
        O.rw.n++; O.rw.hit = false; O.clean = true; O.rwFlash = 40; O.rwCount++;
        if (ai.know) ai.know.flags.rewindClean = true;
        f.sfx('rewind'); f.event('rewound'); f.shake = Math.max(f.shake, 6);
        ai.forced = [...O.rw.chain];
        if (ai.armor) ai.armor.i = -1;
        return;
      }
      // the last blow of the run is over: a hit would have rewound it, so what is left is a clean run
      if (ai.armor && ai.armor.chain && ai.armor.i >= ai.armor.chain.length - 1) { O.rw = null; }
    },
    onKnockdown(ai) { const O = ai.mods.o; O.rw = null; ai.fight.timeScale = 1; O.sm = 1; },
    getUp(ai) { ai.mods.o.rw = null; },
    // the golden moment of a rewound sequence breaks the rewind for good (the run is over)
    golden(ai) { const O = ai.mods.o; O.rw = null; O.rwFlash = 0; ai.fight.timeScale = 1; O.sm = 1; },

    // ---- every frame ------------------------------------------------------------------------------------------------------------------
    update(ai, cfg) {
      const f = ai.fight, O = ai.mods.o, m = ai.move;
      O.t++;
      for (const k of Object.keys(O.lit)) if (--O.lit[k] <= 0) delete O.lit[k];
      for (const k of Object.keys(O.goneT)) if (--O.goneT[k] <= 0) { delete O.goneT[k]; O.gone.delete(+k); }
      O.home.state.lit = O.lit;
      if (O.rwFlash > 0) O.rwFlash--;
      // slow motion: the windup of a move that asks for it (the First Punch), eased in and out
      O.smWant = ai.state === 'windup' && m && m.slowmo ? cfg.slowmo ?? 0.3 : 1;
      O.sm += (O.smWant - O.sm) * 0.2;
      if (Math.abs(O.sm - O.smWant) < 0.01) O.sm = O.smWant;
      f.timeScale = f.phase === 'fight' ? O.sm : 1;
      // the arena flicker
      if (O.flick > 0) {
        O.flick--;
        const to = O.flick > 0 && (O.flick >> 2) & 1 ? O.flickFrom : O.flickTo;
        setArena(ai, to);
      }
      // his history (afterimages)
      const v = ai.view();
      O.hist.unshift({ pose: v.pose, dx: v.dx, dy: v.dy, hidden: v.hidden, pal: ai.paletteOverride() });
      if (O.hist.length > 16) O.hist.length = 16;
    },

    // ---- his colours -------------------------------------------------------------------------------------------------------------------
    palette(ai, cfg) {
      const f = ai.fight, O = ai.mods.o, m = ai.move;
      if (cfg.trueForm) {
        // white-gold, flaring toward the fire palette now and then; borrowed colours still show (the style's, the signature's)
        const own = borrowed(ai, O);
        if (own) return own;
        return (O.t >> 3) % 9 === 0 ? 'originTrue.fire' : 'originTrue';
      }
      const own = borrowed(ai, O);
      if (own) return own;
      // a medley world's colours until the next transition
      if (O.world) { const i = O.world === 'void' ? 5 : O.world === 'warp' ? 2 : ZONE_ORDER.indexOf(O.world === 'road' ? 'road' : O.world); return `origin.z${Math.max(0, i) * 2}`; }
      if (f.phase === 'fight' && m && ai.state === 'windup' && m.slowmo) return 'origin.flash';
      // the cycle: every zone's palette in turn, a blend between each
      return `origin.z${Math.floor(O.t / 22) % 12}`;
    },
  },
};

// the colours of whoever's style or signature he is wearing (their palette), while their blows come
function borrowed(ai, O) {
  const m = ai.move;
  if (m && ['windup', 'active', 'recovery'].includes(ai.state) && !(ai.state === 'recovery' && ai.moveT > 10)) {
    const id = m.echo || m.echoOf || m.style;
    if (id && id !== 'origin') { const pid = String(id).endsWith('Shard') ? id : id; return `origin.${pid}`; }
  }
  if (O.style && ai.move && ['windup', 'active', 'recovery'].includes(ai.state) && ai.moveId && (ai.moveId.startsWith('st_') || ai.moveId.startsWith('flick_'))) return `origin.${O.style}`;
  return null;
}

// ---------------------------------------------------------------------------------------------------------------- the arena
function arenaObj(ai, key) {
  const O = ai.mods.o;
  if (key === 'home') return O.home;
  const aid = CIRCUITS[key] && CIRCUITS[key].arena;
  if (!aid || !ARENAS[aid]) return O.home;
  return (O.arenas[aid] ||= new Arena(ARENAS[aid]));
}
function setArena(ai, key) {
  const f = ai.fight, A = arenaObj(ai, key);
  if (f.arena === A) return;
  A.state.round = f.stage;
  f.arena = A;
  f.shadowCol = A.pal.u32[A.pal.idx(A.def.shadowColor || 'shadow')];
}
// to a past arena (or back to the Beginning): a few frames of the two flickering, then it settles
export function arenaTo(ai, key, flicker) {
  const O = ai.mods.o;
  if (O.cur === key && !flicker) return;
  O.flickFrom = O.cur; O.flickTo = key; O.cur = key;
  if (flicker) { O.flick = 16; ai.fight.sfx('originTear'); } else { O.flick = 0; setArena(ai, key); }
}

// ---------------------------------------------------------------------------------------------------------------- segments
function segSet(ai, cfg, i) {
  const M = ai.mods, f = ai.fight, R = cfg.rounds[Math.min(PH(f), cfg.rounds.length - 1)] || cfg.rounds[cfg.rounds.length - 1], S = R.segs[i];
  M.segI = i; M.seg = S.seg; M.segName = S.name;
  ai.pattern = null; ai.stepIdx = 0;
  // a style segment brings its arena: the arena flickers into it every few seconds
  if (M.o && S.style) arenaTo(ai, STYLE_BY_ID[S.style].circuit, true);
  else if (M.o && M.o.cur !== 'home' && !S.keepArena) arenaTo(ai, 'home', true);
  f.event('segment');
}

// ---------------------------------------------------------------------------------------------------------------- the long supers
// A super's template (in his `supers`) names its first move and a default chain; the ones that vary are rebuilt here, at the throw.
function derive(ai, cfg, T) {
  const O = ai.mods.o, key = T.move;
  if (key === 'ea_go') {
    const n = cfg.styles ?? 3, ids = shuffle(STYLES.map((s) => s.id)).slice(0, n);
    return { ...T, then: [...ids.flatMap(styleChain), 'ea_fin'], styles: ids };
  }
  if (key === 'md_go') {
    const n = cfg.worlds ?? 3, worlds = shuffle(Object.keys(MEDLEY_WORLDS).concat(cfg.trueForm ? ['void'] : [])).slice(0, n), then = [];
    for (const w of worlds) {
      then.push(`tr_${w}`);
      if (w === 'void') { const k = pick(VOID_SIG_KEYS); then.push(`vecho_${k}`, `vsig_${k}`); } else { const c = pick(MEDLEY_WORLDS[w]); then.push(`echo_${c}`, `sig_${c}`); }
    }
    return { ...T, then: [...then, 'md_fin'], worlds };
  }
  if (key === 'fa_go') {
    const ids = shuffle(STYLES.map((s) => s.id)).slice(0, 3);
    const then = ['fa_punch'];
    ids.forEach((id, i) => { then.push(`flick_${id}`, `st_${id}_1`, `st_${id}_2`); if (i === 0) then.push(`echo_${id}`, `sig_${id}`); });
    then.push('rw_1', 'rw_3', 'rw_5', 'fa_fin');
    return { ...T, then, styles: ids };
  }
  void O;
  return T;
}
export { derive as deriveOriginSuper };
void REWIND_CHAIN; void WORLD_NAMES;
