// THE INTERIOR ENGINE (spec §19 G4): every place you walk into is one of these. A hall seen from the side: the door at the left, a floor you
// walk along, stations and podiums standing on the wall side of it, all defined in data/interiors.js.
//
//   LEFT / RIGHT walk. The one you stand in front of is selected: a podium grows and shows his board (name, best time, three medals, scouting),
//   the others stay small and quiet; a fighter you have not reached is a black silhouette. A / START uses what you stand in front of:
//     a podium    the next of the ladder is a Career fight (a loss costs a life); a fighter already beaten in this run of the circuit is an
//                 instant rematch (never a life, never the ladder; medals and record times count)
//     a station   opens its screen; a door goes in (or, the exit, out)
//   B / PAUSE leave. Touch: tap a station to walk to it, tap it again to use it.
//   Nothing is ever reachable only from a menu: the Home gym's stations are the old menu's every screen.
import { layout, logOver, drawLabel, drawBlock, linesOf } from '../engine/textbox.js';
import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { W } from '../engine/renderer.js';
import { ICONS } from '../../data/sprites/ui.js';
import { CIRCUITS, SHORT, ROMAN, isRival, livesOf } from '../../data/circuits.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { remixed } from '../../data/fighters/titleDefense.js';
import { interiorFor, themeOf, LOCK_TEXT } from '../../data/interiors.js';
import { speedTarget, tdGoldTarget } from '../../data/medals.js';
import { fighterSprites, paletteFor, warmInWorker } from '../engine/spriteCache.js';
import { fighterPose } from '../scene/actors.js';
import { paintHall, TOP, BACK } from '../world/themes.js';
import { drawProp } from '../world/props.js';
import { drawImg } from '../world/img.js';
import { isFreed, HOLLOWED_SET, podiumState, circuitStatus, selectableCircuits, enterCircuit, nextOpponent, hasFighters, replayable, noLives, rankLabel, LIVES } from '../save/career.js';
import { TD_LIVES, saveRecords, tdUnlocked, gauntletUnlocked, tdChampOf, clockText, rosterNumber, gauntletList, fighterName } from '../save/records.js';
import { medalsOf } from '../save/medals.js';
import { isUnlocked, unlockedList } from '../save/unlocks.js';
import { scoutProgress } from '../save/scouting.js';
import { drawMedal } from './medalIcons.js';
import { drawRunner, mapRunner } from './mapkit.js';
import { goIntro, entranceSceneOf } from './introFlow.js';
import { seenCount } from '../save/cutscenes.js';
import { beatenPose } from '../../data/fighters/beaten.js';
const BOSS_IDS = new Set(['jax', 'zero', 'halcyon', 'vorgath', 'dash9', 'zeroTrue']);

const PODY = 142, FEET = 128, LANE = 186;
const SIL = c32(1, 1, 3), GOLD = c32(30, 24, 6), INK = c32(2, 2, 4);

// a fighter's colours as greys (the Hollowed, until they are freed): every entry of his palette turned to its brightness
const grayCache = new Map();
function grayPal(pal, key) {
  if (grayCache.has(key)) return grayCache.get(key);
  const out = new Uint32Array(pal.length);
  for (let i = 0; i < pal.length; i++) { const v = pal[i]; if (!v) continue; const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255, y = Math.round(((r * 3 + g * 6 + b) / 10) / 8); out[i] = c32(y, y, Math.min(31, y + 1)); }
  grayCache.set(key, out);
  return out;
}

// the fighter as a sprite of a given height, feet at (x, y); pose animates if not given
function drawFighter(f, d, x, y, h, t, o = {}) {
  const bank = fighterSprites(d.spriteLayers);
  let pose = o.pose || fighterPose(d.id, 'idle', t + (o.phase || 0)), s;
  try { s = bank.get(pose); } catch { s = bank.get('idle1'); }
  const k = Math.min(1, h / s.h);
  let pal = paletteFor(d.palette).u32;
  if (o.gray) pal = grayPal(pal, `${d.id}|${d.palette}`);
  f.blit(s, Math.round(x), Math.round(y), pal, { scale: k, solid: o.solid, flip: !!o.flip });
  return { w: s.w * k, h: s.h * k };
}
// a beaten fighter: his own pose if his data has one (`beatenPose`), else the winded stoop, breathing in and out
// (Dash's early builds have no stoop of their own: his own winded frames if he has them, else he stands dazed)
const BEATEN_POSE = (d, t) => {
  if (d.beatenPose) return d.beatenPose;
  const own = beatenPose(d.id, t); if (own) return own;
  const fr = (d.anims.winded && d.anims.winded.frames) || (d.rival ? d.anims.stunned.frames : ['winded1', 'winded2']);
  return fr[(t >> 5) % fr.length];
};

// every pose a fighter takes on a podium: standing, beaten, and the few a hall can ask for
function showPoses(d) {
  const set = new Set(['idle1', 'winded1', 'winded2']);
  for (const a of ['idle', 'taunt', 'victory', 'stunned']) for (let t = 0; t < 400; t += 4) set.add(fighterPose(d.id, a, t));
  for (const t of [0, 32]) { const b = beatenPose(d.id, t); if (b) set.add(b); }
  if (d.beatenPose) set.add(d.beatenPose);
  for (const k of ['winded', 'hold']) { const a = d.anims[k]; if (a) for (const f of a.frames || a) set.add(f); }
  return [...set];
}

export class InteriorScreen {
  constructor(game, args = {}) {
    this.g = game; this.args = args; this.t = 0;
    this.c = game.career;
    this.id = args.id;
    this.L = interiorFor(this.id);
    const L = this.L, xs = L.stations.map((s) => s.x), last = Math.max(...xs);
    this.width = L.scroll ? Math.max(W, (L.end || last + 60) + 30, last + 60) : W;
    this.theme = themeOf(L.theme);
    this.note = null; this.noteT = 0;
    this.camX = 0;
    this.goal = null; this.armed = null; this.armedT = 0;
    this.confirm = null;
    const at = args.at && L.stations.find((s) => s.id === args.at);
    this.px = at ? at.x : L.scroll || L.stations.length < 2 ? 50 : 50;
    if (!at && L.stations.find((s) => s.kind === 'podium') && !args.fresh) this.px = this.startX();
    this.face = 1; this.moving = false;
    this.camX = this.clampCam(this.px - W / 2);
    this.k = {}; // podium size easing, by station id
    this.prep();
  }
  // a hall you come into stands you at the next podium you can fight (or the door, in a cleared one)
  startX() {
    const next = this.L.stations.find((s) => s.kind === 'podium' && this.podState(s) === 'next');
    return next ? next.x : this.L.stations[0].x + 28;
  }
  clampCam(x) { return this.L.scroll ? Math.max(0, Math.min(this.width - W, x)) : 0; }
  prep() {
    this.here = null;
    // the poses the hall's fighters stand in, composed in a worker (spriteCache.js warmInWorker): a hall that scrolls must not stop to draw a fighter
    for (const st of this.L.stations) {
      if (st.kind !== 'podium' || !st.fighter) continue;
      try { const d = this.fighterOf(st); warmInWorker(fighterSprites(d.spriteLayers), showPoses(d)); } catch { /* lazy */ }
    }
  }

  enter() { const S = this.g.songs; this.g.audio.play(S[this.songId()] || S.map); this.g.loc = { area: 'interior', args: { id: this.id, at: null } }; }
  songId() { return this.id === 'home' ? 'training' : this.id.startsWith('td') || this.id === 'gauntlet' ? 'modes' : 'map'; }

  // ---- what a station is right now ---------------------------------------------------------------------------------------------------
  fighterOf(st) { return st.run === 'td' ? remixed(st.fighter) : FIGHTERS[st.fighter]; }
  tdRun(st) { const R = this.g.records, tier = this.L.tier; return R.run && R.run.mode === 'td' && R.run.tier === tier ? R.run : null; }
  podState(st) {
    const c = this.c, g = this.g;
    if (st.run === 'td') {
      const run = this.tdRun(st), T = g.records.td[this.L.tier];
      if (run) return st.index < run.idx ? 'beaten' : st.index === run.idx ? 'next' : 'ahead';
      if (T.clears > 0) return 'beaten';
      return st.index === 0 ? 'next' : 'ahead';
    }
    if (isFreed(c, st.fighter) && this.id !== 'never') return 'beaten';
    return podiumState(c, st.circuit, st.index);
  }
  lockedOf(st) {
    const L = st.lock;
    if (!L) return false;
    const g = this.g;
    switch (L.kind) {
      case 'unlock': return !isUnlocked(g, L.id);
      case 'met': return !(g.records.met.length > 0);
      case 'tdTier': return !tdUnlocked(g.records, L.tier);
      case 'gauntlet': return !gauntletUnlocked(g.records, L.zone);
      case 'replay': return !replayable(this.c).length;
      case 'medals': return false;
      default: return false;
    }
  }
  near() {
    let best = null, bd = 19;
    for (const s of this.L.stations) { const d = Math.abs(s.x - this.px); if (d < bd && s.kind !== 'decor') { bd = d; best = s; } }
    return best;
  }

  // ---- update -------------------------------------------------------------------------------------------------------------------------
  update() {
    this.t++;
    if (this.noteT > 0 && --this.noteT === 0) this.note = null;
    const I = this.g.input, A = this.g.audio;
    // a confirm question (give up a defense) is answered first
    if (this.confirm) {
      if (I.back()) { this.confirm = null; A.sfx('menu'); return; }
      if (I.confirm()) { const fn = this.confirm.yes; this.confirm = null; fn(); return; }
      return;
    }
    const taps = I.takeTaps ? I.takeTaps() : [];
    for (const tp of taps) this.tap(tp);
    let dir = (I.held('right') ? 1 : 0) - (I.held('left') ? 1 : 0);
    if (dir) { this.goal = null; this.armed = null; }
    if (!dir && this.goal != null) { const d = this.goal - this.px; if (Math.abs(d) < 2) { this.px = this.goal; this.goal = null; } else dir = Math.sign(d); }
    this.moving = !!dir;
    if (dir) { this.face = dir; this.px = Math.max(16, Math.min(this.width - 16, this.px + dir * 1.8)); if ((this.t & 15) === 0) A.sfx('tick'); }
    const tx = this.clampCam(this.px - W / 2);
    this.camX += (tx - this.camX) * 0.14; if (Math.abs(tx - this.camX) < 0.3) this.camX = tx;
    const near = this.near();
    if (near !== this.here) { this.here = near; if (near) A.sfx('menu'); } // (a station you tapped stays armed while you walk to it, past the others: the next tap on it uses it; walking by hand or a few seconds clears it)
    // podiums ease between small and large
    for (const s of this.L.stations) if (s.kind === 'podium') { const want = near === s && this.podState(s) !== 'ahead' ? 1 : 0, k = this.k[s.id] ?? 0; this.k[s.id] = k + Math.sign(want - k) * Math.min(Math.abs(want - k), 0.12); }
    if (this.armedT > 0 && --this.armedT === 0) this.armed = null;
    if (I.confirm() && near) this.use(near);
    if (I.back()) this.leave();
  }
  tap(tp) {
    const wx = tp.x + this.camX;
    let best = null, bd = 26;
    for (const s of this.L.stations) { const d = Math.abs(s.x - wx); if (d < bd && s.kind !== 'decor') { bd = d; best = s; } }
    if (!best) { if (tp.y > 150) this.goal = Math.max(16, Math.min(this.width - 16, wx)); return; }
    // the second tap on a station you are at uses it; the first walks you there
    if (this.armed === best.id && Math.abs(best.x - this.px) < 20) { this.use(best); this.armed = null; return; }
    this.armed = best.id; this.armedT = 180;
    this.goal = best.x;
    if (Math.abs(best.x - this.px) < 20) this.g.audio.sfx('menu');
  }
  say(text, frames = 160) { this.note = text; this.noteT = frames; }

  // ---- using a station ---------------------------------------------------------------------------------------------------------------
  remember(st) { this.g.loc = { area: 'interior', args: { id: this.id, at: st ? st.id : null } }; }
  leave() {
    const g = this.g, L = this.L;
    g.audio.sfx('menu');
    if (L.parent) { g.loc = { area: 'interior', args: { id: L.parent, at: `door.${L.tier}` } }; g.go('interior', g.loc.args); return; }
    g.loc = { area: 'world' };
    g.go('map');
  }
  use(st) {
    const g = this.g, A = g.audio;
    if (st.kind === 'exit') return this.leave();
    if (this.lockedOf(st)) { A.sfx('tired'); this.say(st.lock.hint || 'LOCKED.'); return; }
    if (st.kind === 'decor') return;
    if (st.kind === 'podium') return this.usePodium(st);
    if (st.kind === 'door') {
      if (st.enter) { A.sfx('confirm'); g.loc = { area: 'interior', args: { id: st.enter } }; g.go('interior', g.loc.args); return; }
      if (st.run) return this.useGauntlet(st);
    }
    if (st.action === 'defense') return this.useDefense();
    if (st.go) { A.sfx('confirm'); this.remember(st); g.go(st.go.screen, { ...(st.go.args || {}), back: 'map' }); return; }
  }

  // ---- the podiums
  usePodium(st) {
    const g = this.g, c = this.c, A = g.audio, state = this.podState(st);
    if (state === 'ahead') { A.sfx('tired'); this.say(st.run !== 'td' && st.index === 0 && ['open', 'current'].includes(circuitStatus(c, st.circuit)) ? 'FINISH YOUR LADDER FIRST.' : 'NOT REACHED YET. BEAT THE ONE BEFORE.'); return; }
    if (st.run === 'td') return this.useTdPodium(st, state);
    if (state === 'beaten') {
      // an instant rematch: nothing about the career changes, medals and record times count
      // (a boss's entrance plays first if it has never been seen in this game: a password can put you past the fight it belongs to)
      A.sfx('confirm'); this.remember(st);
      const fight = ['fight', { fighter: st.fighter, rematch: { circuit: st.circuit, at: st.id } }], ent = entranceSceneOf(st.fighter);
      if (ent && BOSS_IDS.has(st.fighter) && !seenCount(g.seen || {}, ent)) g.go('cutscene', { id: ent, params: {}, then: fight });
      else g.go(fight[0], fight[1]);
      return;
    }
    // the next of the ladder: the career fight
    const id = st.circuit;
    if (id !== c.circuit) {
      if (!selectableCircuits(c).includes(id)) { A.sfx('tired'); this.say('FINISH YOUR LADDER FIRST.'); return; }
      enterCircuit(c, id); g.saveCareer();
    }
    if (!hasFighters(c.circuit) || !nextOpponent(c)) { A.sfx('tired'); this.say('MORE CIRCUITS COMING SOON!'); return; }
    A.sfx('confirm'); this.remember(st);
    if (isRival(c.circuit)) g.go('rival', { id: c.circuit, phase: 'pre' }); // the trash talk first (§11b)
    else goIntro(g, { fighter: nextOpponent(c) }, c.beaten === 0 ? c.circuit : null);
  }
  useTdPodium(st, state) {
    const g = this.g, R = g.records, A = g.audio, tier = this.L.tier;
    if (state === 'beaten') { A.sfx('confirm'); this.remember(st); g.go('fight', { fighter: st.fighter, mode: 'td', rematch: { td: true, at: st.id, tier } }); return; }
    // the next of a defense: starts the run if there is none
    if (R.run && !(R.run.mode === 'td' && R.run.tier === tier)) { A.sfx('tired'); this.say(R.run.mode === 'td' ? `GIVE UP YOUR ${R.run.tier.toUpperCase()} DEFENSE FIRST.` : 'YOU HAVE A GAUNTLET RUN GOING. FINISH IT OR END IT.'); return; }
    if (!R.run) { R.run = { mode: 'td', tier, list: this.L.stations.filter((s) => s.kind === 'podium').map((s) => s.fighter), idx: 0, lives: TD_LIVES, seconds: 0, last: null }; saveRecords(R); }
    A.sfx('confirm'); this.remember(st);
    g.go('intro', { fighter: st.fighter, mode: 'td' });
  }
  useDefense() {
    const g = this.g, R = g.records, A = g.audio, tier = this.L.tier, run = this.tdRun();
    if (run) { A.sfx('menu'); this.confirm = { text: 'GIVE UP THE DEFENSE? THE TITLE GOES TO THE REST.', yes: () => { this.giveUp(); } }; return; }
    if (R.run) { A.sfx('tired'); this.say(R.run.mode === 'td' ? `GIVE UP YOUR ${R.run.tier.toUpperCase()} DEFENSE FIRST.` : 'YOU HAVE A GAUNTLET RUN GOING.'); return; }
    if (g.records.td[tier].clears > 0) {
      R.run = { mode: 'td', tier, list: this.L.stations.filter((s) => s.kind === 'podium').map((s) => s.fighter), idx: 0, lives: TD_LIVES, seconds: 0, last: null };
      saveRecords(R); A.sfx('unlock'); this.say('A NEW DEFENSE BEGINS. THE FIRST CHAMPION WAITS.');
    } else this.say('FIGHT THE FIRST CHAMPION TO BEGIN.');
  }
  giveUp() {
    const g = this.g;
    g.go('run', { giveUp: true, back: 'map' });
  }
  useGauntlet(st) {
    const g = this.g, R = g.records, A = g.audio, zone = st.run;
    if (R.run && !(R.run.mode === 'gauntlet' && (R.run.zone || 'classic') === zone)) { A.sfx('tired'); this.say(R.run.mode === 'td' ? 'A TITLE DEFENSE IS GOING. GIVE IT UP AT ITS HALL.' : 'ANOTHER GAUNTLET RUN IS GOING. FINISH IT OR END IT.'); return; }
    A.sfx('confirm'); this.remember(st);
    g.go('run', R.run ? { back: 'map' } : { start: 'gauntlet', zone, back: 'map' });
  }

  // ---- drawing ------------------------------------------------------------------------------------------------------------------------
  render(f) {
    const t = this.t, cx = Math.round(this.camX), L = this.L;
    f.clear(c32(2, 2, 5));
    paintHall(f, this.theme, t, cx);
    const near = this.here;
    // stations and podiums, back to front (the selected one last: it is the largest)
    const order = [...L.stations].sort((a, b) => (a === near) - (b === near));
    f.probeWorld = true; // (the room scrolls: its signs can sit half off screen; the text-fit audit knows)
    for (const s of order) this.paintStation(f, s, s.x - cx, t, near === s);
    // you
    this.paintPlayer(f, this.px - cx);
    f.probeWorld = false;
    this.paintBoard(f, cx);
    this.paintBars(f);
    if (this.confirm) {
      // (the box grows with the question)
      const n = Math.min(3, linesOf(this.confirm.text, 196));
      panel(f, 24, 92, 208, 22 + n * 10);
      drawBlock(f, this.confirm.text, 30, 98, 196, 3, COL.yellow, { align: 'center', where: 'interior confirm' });
      drawTextCentered(f, 'A: YES   B: NO', 128, 100 + n * 10, COL.white, { mono: false });
    }
  }
  paintStation(f, s, x, t, selected) {
    if (x < -70 || x > W + 70) return;
    if (s.kind === 'podium') return this.paintPodium(f, s, x, t, selected);
    const locked = this.lockedOf(s);
    drawProp(f, s.prop || 'plaque', Math.round(x), BACK - 2, t, { locked, sel: selected, tint: null, style: s.style });
    if (selected) { const y = BACK - 64 - ((t >> 4) & 1); if (!locked) { f.rect(x - 1, y, 3, 1, COL.yellow); f.rect(x - 2, y - 1, 5, 1, COL.yellow); } }
    if (s.id === 'shop' && !locked && (this.g.medals.seen || []).length < unlockedList(this.g.medals).length && (t >> 4) & 1) { const y = BACK - 76; f.rect(x - 14, y - 4, 29, 11, INK); f.rect(x - 13, y - 3, 27, 9, COL.yellow); drawText(f, 'NEW!', x - 12, y - 2, COL.black, { mono: false }); }
    if (locked && s.lock) { const y = BACK - 28; f.rect(x - 4, y - 4, 9, 8, INK); f.rect(x - 3, y - 3, 7, 6, c32(20, 14, 4)); f.rect(x - 2, y - 7, 5, 4, c32(14, 14, 18)); f.rect(x - 1, y - 6, 3, 3, INK); }
  }
  paintPodium(f, s, x, t, selected) {
    const state = this.podState(s), d = this.fighterOf(s), k = this.k[s.id] ?? 0, g = this.g, c = this.c;
    const n = this.L.stations.filter((q) => q.kind === 'podium').length;
    const small = n > 5 ? 38 : 44, big = 88, h = small + (big - small) * k;
    const y = PODY;
    drawProp(f, 'podium', Math.round(x), y, t, { w: 34 + Math.round(k * 16), dim: state === 'ahead' });
    const hollow = HOLLOWED_SET.has(s.fighter) && !isFreed(c, s.fighter);
    if (selected && k > 0 && state !== 'ahead') this.spot(f, x, y - 14, 18 + k * 16, t);
    if (state === 'ahead') { drawFighter(f, d, x, FEET, h, t, { solid: SIL, pose: 'idle1' }); drawText(f, '?', Math.round(x) - 3, FEET - h / 2 - 3, c32(9, 9, 13), { mono: false }); return; }
    if (state === 'beaten') {
      drawFighter(f, d, x, FEET, h, t, { pose: BEATEN_POSE(d, t + s.index * 11), phase: s.index * 13 });
      // the defeated marker: a red sash across the podium, with a white cross
      const w = 26 + Math.round(k * 8);
      f.rect(x - w / 2, y - 9, w, 6, INK); f.rect(x - w / 2 + 1, y - 8, w - 2, 4, c32(24, 4, 6)); f.rect(x - w / 2 + 1, y - 8, w - 2, 1, c32(30, 10, 10));
      f.rect(x - 2, y - 8, 1, 1, COL.white); f.rect(x - 1, y - 7, 2, 2, COL.white); f.rect(x + 1, y - 8, 1, 1, COL.white); f.rect(x - 2, y - 5, 1, 1, COL.white); f.rect(x + 1, y - 5, 1, 1, COL.white);
      return;
    }
    // next: standing, with an arrow over his head
    drawFighter(f, d, x, FEET, h, t, { gray: hollow, phase: s.index * 13 });
    const ay = FEET - h - 6 - ((t >> 3) & 1);
    if (!selected) { f.rect(x - 2, ay, 5, 1, COL.yellow); f.rect(x - 1, ay + 1, 3, 1, COL.yellow); f.rect(x, ay + 2, 1, 1, COL.yellow); }
    void g;
  }
  spot(f, x, y, w, t) {
    for (let j = 0; j < 70; j++) { const ww = Math.round(w * (0.5 + j / 70)); for (let i = -ww; i <= ww; i++) if (((Math.round(x) + i + j * 2) & 3) === 0 && (i + j) % 5 === 0) { const X = Math.round(x) + i, Y = y - 70 + j; if (X >= 0 && X < W && Y > TOP) f.px(X, Y, c32(28, 27, 20)); } }
    void t;
  }
  paintPlayer(f, x) {
    const R = mapRunner(this.c.profile), i = this.moving ? Math.floor(this.t / 6) % 4 : 1, fr = R.frames[i];
    f.blit(R.frames[i], Math.round(x), LANE + (this.moving && (Math.floor(this.t / 6) & 1) ? 0 : -1), R.pal, { flip: this.face < 0, scale: 0.75 });
    void fr;
  }

  // how wide the fighter is drawn at his largest (the board keeps clear of him)
  fighterWidth(d) {
    try { const sp = fighterSprites(d.spriteLayers).get('idle1'); return sp.w * Math.min(1, 88 / sp.h); } catch { return 68; }
  }
  // the board of the podium you stand at: name, best time, the three medals (what they need, if you do not have them) and your scouting
  paintBoard(f, cx) {
    const s = this.here;
    if (!s || s.kind !== 'podium') return;
    const state = this.podState(s);
    if (state === 'ahead') return;
    const d = this.fighterOf(s), g = this.g, td = s.run === 'td';
    const k = this.k[s.id] ?? 0;
    if (k < 0.3) return;
    // (the board is drawn on the screen, never in the room: beside the fighter on the side that has the room for it, and pushed inward if neither does)
    const x = s.x - cx, bw = 138, by = TOP + 3, half = Math.max(34, Math.round(this.fighterWidth(d) / 2) + 6);
    const fitsRight = x + half + bw + 3 <= W, fitsLeft = x - half - bw >= 3, rightSide = fitsRight && (x < 122 || !fitsLeft);
    const bx = Math.max(3, Math.min(W - bw - 3, rightSide || (!fitsLeft && x < 122) ? x + half : x - half - bw));
    const got = td ? tdChampOf(g.records, d.id).got : medalsOf(g.medals, d.id), best = td ? tdChampOf(g.records, d.id).best : g.medals.best[d.id];
    const target = speedTarget(d), sig = d.medals && d.medals.signature;
    const rows = [
      ['speed', `KO UNDER ${clockText(target)}`],
      ['flawless', 'NO HITS TAKEN'],
      ['signature', td ? `KO UNDER ${clockText(tdGoldTarget(d))}` : sig ? sig.text : '???'],
    ].map(([key, txt]) => { const n = key === 'signature' ? 5 : 1, L = layout(txt, bw - 30); if (L.length > n) logOver(txt, 'board medal'); return [key, L.slice(0, n)]; });
    const h = 4 + 10 + 11 + rows.reduce((n, [, l]) => n + Math.max(11, l.length * 8 + 3), 0) + 2;
    panel(f, bx, by, bw, h);
    let y = by + 4;
    // his name beside his record time (his short name when the full one won't fit)
    const bt = best == null ? '--:--' : clockText(best), room = bw - 10 - textWidth(bt, false) - 4;
    const nm = [d.name, d.short, d.name.replace(/^THE /, '').split(' ')[0]].find((x) => x && textWidth(x, false) <= room) || d.name;
    drawLabel(f, nm, bx + 5, y, room, COL.white, { mono: false, where: 'board name' });
    drawText(f, bt, bx + bw - 5 - textWidth(bt, false), y, best == null ? COL.grey : COL.yellow, { mono: false });
    y += 10;
    const num = td ? null : rosterNumber(d.id), sp = scoutProgress(g.scouting || {}, d.id, td ? d : null);
    drawText(f, num ? `#${num}` : state === 'next' ? 'NEXT UP' : 'DEFEATED', bx + 5, y, COL.cyan, { mono: false });
    if (sp.total) { const lab = `${num || state === 'next' ? 'SCOUT ' : ''}${sp.got}/${sp.total}`; drawText(f, lab, bx + bw - 5 - textWidth(lab, false), y, sp.got >= sp.total ? COL.green : COL.grey, { mono: false }); }
    y += 11;
    for (const [key, lines] of rows) {
      drawMedal(f, bx + 5, y - 1, key, got[key]);
      lines.forEach((l, i) => drawText(f, l, bx + 20, y + i * 8, got[key] ? COL.white : COL.grey, { mono: false }));
      y += Math.max(11, lines.length * 8 + 3);
    }
  }

  paintBars(f) {
    const c = this.c, L = this.L, g = this.g;
    f.rect(0, 0, W, TOP, c32(6, 4, 3)); f.rect(0, TOP - 2, W, 2, c32(21, 15, 8)); f.rect(0, TOP - 3, W, 1, c32(11, 7, 4)); f.rect(0, 0, W, 1, c32(21, 15, 8));
    drawText(f, L.name, 5, 3, COL.yellow, { mono: false });
    if (L.sub && textWidth(L.name, false) + textWidth(L.sub, false) < 236) drawText(f, L.sub, 251 - textWidth(L.sub, false), 3, COL.cyan, { mono: false });
    // the second row: where this circuit stands for you, and your lives in it
    const cid = this.circuitId();
    let x = 5; const row = 13;
    if (this.L.tier) {
      const R = g.records, run = R.run && R.run.mode === 'td' && R.run.tier === this.L.tier ? R.run : null, T = R.td[this.L.tier];
      drawText(f, run ? `DEFENSE ${run.idx + 1}/${run.list.length}` : T.clears ? `DEFENDED ${T.clears}X` : 'NOT DEFENDED YET', x, row, COL.cyan, { mono: false });
      if (run) { const lx = 190; drawText(f, 'LIVES', lx - 40, row, COL.cyan, { mono: false }); for (let i = 0; i < TD_LIVES; i++) { if (i < run.lives) f.blit(ICONS.glove, lx + i * 11 + 4, row + 3, UIPAL); else f.rect(lx + i * 11, row, 9, 8, COL.dark); } }
    } else if (cid) {
      const st = circuitStatus(c, cid);
      drawText(f, { cleared: 'CLEARED', current: 'IN PROGRESS', open: 'OPEN', locked: 'LOCKED' }[st], x, row, st === 'cleared' ? COL.green : st === 'locked' ? COL.pink : COL.cyan, { mono: false });
      x += textWidth({ cleared: 'CLEARED', current: 'IN PROGRESS', open: 'OPEN', locked: 'LOCKED' }[st], false) + 14;
      if (st === 'current' && cid === c.circuit) {
        if (noLives(cid)) drawText(f, 'NO LIVES', x, row, COL.grey, { mono: false });
        else { drawText(f, 'LIVES', x, row, COL.cyan, { mono: false }); const max = livesOf(cid); for (let i = 0; i < max; i++) { const gx = x + 44 + i * 11; if (i < c.lives) f.blit(ICONS.glove, gx, row + 3, UIPAL); else f.rect(gx - 4, row, 9, 8, COL.dark); } }
        if (!noLives(cid)) drawText(f, rankLabel(c).replace('RANKED ', ''), 190, row, COL.green, { mono: false });
      }
    }
    // the bottom: what you can do here
    const s = this.here;
    let l1 = 'LEFT / RIGHT: WALK   B: LEAVE', l2 = '', col = COL.grey;
    if (this.note) { l1 = this.note; col = COL.yellow; }
    else if (s) {
      const locked = this.lockedOf(s);
      if (s.kind === 'exit') { l1 = 'A: GO OUT'; col = COL.white; l2 = s.label; }
      else if (s.kind === 'podium') {
        const state = this.podState(s), d = this.fighterOf(s);
        l1 = state === 'ahead' ? 'NOT REACHED YET' : state === 'next' ? `A: FIGHT ${(d.short || d.name).toUpperCase()}` : `A: REMATCH ${(d.short || d.name).toUpperCase()}`;
        l2 = state === 'beaten' ? 'NO LIFE AT RISK. MEDALS COUNT.' : state === 'next' ? (s.run === 'td' ? 'LOSE A LIFE OF THE DEFENSE IF YOU LOSE' : noLives(s.circuit) ? 'NO LIVES: A LOSS IS A RETRY' : 'A LOSS COSTS A LIFE') : '';
        col = state === 'ahead' ? COL.grey : COL.white;
      } else if (s.run && !locked) {
        // a Gauntlet's door: its record, and who ended the last run
        const Gr = g.records.gauntlet[s.run], n = gauntletList(s.run).length, last = Gr.runs[0];
        l1 = `A: ${s.label}`;
        l2 = `BEST ${Gr.bestStreak}/${n}${Gr.bestTime != null ? `  CLEAR ${clockText(Gr.bestTime)}` : ''}${last && last.by ? `  LAST: ${fighterName(last.by)}` : ''}`; col = COL.white;
      } else { l1 = locked ? `LOCKED: ${s.lock.hint}` : `A: ${s.label}`; l2 = locked ? '' : (s.sub || ''); col = locked ? COL.pink : COL.white; }
    }
    // (the prompt is drawn on the screen, never in the room: words that need more than a line wrap, and the bar grows upward to hold them)
    const rows = [...layout(l1, 248).map((t) => [t, col]), ...(l2 ? layout(l2, 248).map((t) => [t, COL.grey]) : [])], top = 204 - Math.max(0, rows.length - 2) * 8;
    f.rect(0, top, W, 224 - top, c32(6, 4, 3)); f.rect(0, top, W, 1, c32(21, 15, 8));
    rows.forEach(([t, c], i) => drawTextCentered(f, t, 128, top + 3 + i * 8, c, { mono: false }));
  }
  circuitId() { const id = this.id; return CIRCUITS[id] ? id : null; }
}
