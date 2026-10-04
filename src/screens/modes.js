// Other modes (§6), reached by walking to them on the world map (src/screens/interior.js):
//   RunScreen       the hub between the fights of a Gauntlet run (next opponent, progress, the last fight), the card after a fight of a Title
//                   Defense (its podium hall shows the rest), and the end-of-run summary (records). Both return to their hall on the map.
//   PracticeScreen  the practice ring: pick any opponent you've met, with practice aids
//
// Title Defense (data/fighters/titleDefense.js): the champions remixed, easiest to hardest, in five divisions (data/divisions.js):
//   Classic     the 12 champions, Jax and the first ZERO (opened by beating the first ZERO)
//   Pantheon    the seven champions of the climb, Barney Ascended and Halcyon (opened by beating Halcyon)
//   Underworld  the six champions below and Vorgath (opened by beating Vorgath)
//   Void        the twelve Hollowed, Dash Unbound and ZERO's true form, all fought as bosses (opened by beating ZERO's true form)
//   Combined    all of them in story order (opened by the true ending)
//   Normal fights (each fighter's own rounds) at his circuit's values, 2 lives for the whole defense: lose one and you rematch,
//   lose both and the title is gone. Every remix carries one attack that exists only here (the `exclusive` super). Best defenses,
//   best clear time and three medals are kept per division (records.js). Fought in the championship hall (data/arenas/modes.js).
// Gauntlet (records.js GAUNTLETS): Classic (#1-50, Jax, the first ZERO), Pantheon (#51-81, Dash V and VI, Halcyon), Underworld (#82-107,
//   Dash VII and VIII, Vorgath), Void (the twelve Hollowed, Dash Unbound, ZERO's true form), Combined (all four, in story order). Every
//   opponent in list order, each from round 1 on the standard clock (rounds, then the championship rounds: no judges); one loss (KO or TKO) ends it. Between fights hearts reset, health comes back
//   50% (of a full bar, never past full) and stars carry over. The Will Shard (#119) fights
//   in his final form from the first bell. Records are kept per division. Fought in the endurance arena, to a theme that builds with the run.
// Practice: nothing counts. Tell flash, infinite hearts, unlimited health and 50% slow motion.
// Perks (§7): the career's equipped training perks apply in every fight mode, Title Defense, the Gauntlets, podium rematches and Practice
// included. They only touch the player's side (hearts, damage, stars, get-ups), never a tell or an opponent's timing.

import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { drawBlock, drawLabel } from '../engine/textbox.js';
import { c32 } from '../engine/palette.js';
import { ICONS } from '../../data/sprites/ui.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { CIRCUITS, SHORT } from '../../data/circuits.js';
import { remixed, TD_LISTS, TD_NAMES } from '../../data/fighters/titleDefense.js';
import { PORTRAITS } from '../../data/sprites/portraits.js';
import { paletteFor } from '../engine/spriteCache.js';
import { PERK } from '../../data/perks.js';
import { TD_LIVES, saveRecords, recordTdFight, tdChampOf, gauntletList, GAUNTLET_INFO, tdMedalsFor, clockText, fighterName, rosterNumber, remixUnlocked, tdVersions } from '../save/records.js';
import { medalCount, MEDAL_TOTAL } from '../save/medals.js';
import { altUnlocked, altPaletteOf } from '../save/unlocks.js';
import { circuitScouted } from '../save/scouting.js';
import { drawMedalRow } from './medalIcons.js';
import { FighterGrid } from './fighterGrid.js';
import { EVERYONE } from '../save/records.js';
import { Hits } from '../engine/hits.js';

const BG = c32(3, 3, 8), STRIPE = c32(5, 5, 12), BOX = c32(11, 22, 27), GOLD = c32(30, 24, 6);
export { TD_LIVES };
const GAUNTLET_HEAL = 50;

// The fighter data a mode fights: the remix in Title Defense (and the Practice
// "title defense version"), the regular fighter otherwise.
export const fighterFor = (id, remix) => (remix ? remixed(id) : FIGHTERS[id]);

function portraitOf(d) {
  const p = paletteFor(d.palette);
  return { sprite: (PORTRAITS[d.id] || PORTRAITS.barney)(p), pal: p.u32 };
}

function backdrop(f, t) {
  f.clear(BG);
  for (let y = 0; y < 224; y += 8) f.rect(0, y + ((t >> 3) & 7), 256, 2, STRIPE);
}

function cursor(f, x, y, t) { f.blit(ICONS.glove, x + ((t >> 3) & 1), y + 3, UIPAL); }

const equippedText = (g) => {
  const eq = g.career ? g.career.training.equipped : [];
  return eq.length ? `PERKS: ${eq.map((id) => PERK[id].short).join(', ')}` : 'NO PERKS EQUIPPED';
};

// the title a run shows: "CLASSIC DEFENSE" ... "VOID DEFENSE", "CLASSIC GAUNTLET"...
export const runTitle = (run) => (run.mode === 'td' ? `${TD_NAMES[run.tier || 'classic']} DEFENSE` : GAUNTLET_INFO[run.zone || 'classic'].name);
const MEDAL_WORD = ['', 'BRONZE', 'SILVER', 'GOLD'];
const bestMedal = (m) => (m.gold ? 3 : m.silver ? 2 : m.bronze ? 1 : 0);

// ---------------------------------------------------------------------------
export class RunScreen {
  constructor(game, { start, tier = 'classic', zone = 'classic', result, giveUp = false, back = 'map' } = {}) {
    this.g = game;
    this.t = 0;
    this.sel = 0;
    this.hits = new Hits();
    this.back = back;
    this.card = null; // a Title Defense fight's result card (the hall is the hub)
    this.confirmQuit = false;
    const R = game.records;
    if (start) {
      R.run = start === 'td'
        ? { mode: 'td', tier, list: [...TD_LISTS[tier]], idx: 0, lives: TD_LIVES, seconds: 0, last: null }
        : { mode: 'gauntlet', zone, list: [...gauntletList(zone)], idx: 0, health: 100, stars: 0, seconds: 0, last: null };
      saveRecords(R);
    }
    this.run = R.run;
    this.over = null; // { kind: 'lost' | 'clear' | 'quit', newRecord, medals }
    if (giveUp && this.run) this.finish('quit', null);
    else if (result && this.run) this.apply(result);
    if (this.run && this.run.mode === 'td' && !this.over && !this.card) this.leaveAtOnce = true; // (a defense in progress is shown by its hall, not a hub)
    this.loadNext();
  }

  // One fight's result goes into the run.
  apply(r) {
    const run = this.run, R = this.g.records;
    const won = r.winner === 'player';
    const id = run.list[run.idx];
    run.seconds += r.seconds || 0;
    run.last = { id, won, method: r.method, round: r.round, time: r.time };
    if (run.mode === 'td') {
      // the champion's own medals and best time (kept apart from the Career's)
      this.tdRec = recordTdFight(R, fighterFor(id, true), r);
      this.card = { id, won, how: r.method, round: r.round, time: r.time, rec: this.tdRec };
      if (won) run.idx++;
      else if (--run.lives <= 0) { this.card = null; return this.finish('lost', id); }
      if (run.idx >= run.list.length) { this.card = null; return this.finish('clear'); }
    } else {
      if (!won) return this.finish('lost', id);
      run.idx++;
      run.health = Math.min(100, (r.health || 0) + GAUNTLET_HEAL);
      run.stars = r.stars || 0;
      if (run.idx >= run.list.length) return this.finish('clear');
    }
    saveRecords(R);
  }

  // The run is over: records, then the summary.
  finish(kind, by = null) {
    const run = this.run, R = this.g.records;
    let newRecord = false, medals = null;
    if (run.mode === 'td') {
      const T = R.td[run.tier || 'classic'], lost = TD_LIVES - Math.max(0, run.lives);
      if (run.idx > T.best) { T.best = run.idx; newRecord = true; }
      if (kind === 'clear') {
        T.clears++;
        if (run.seconds < (T.bestTime ?? Infinity)) { T.bestTime = run.seconds; newRecord = true; }
        medals = tdMedalsFor(run.tier || 'classic', { lives: run.lives, seconds: run.seconds });
        for (const k of ['bronze', 'silver', 'gold']) if (medals[k] && !T.medals[k]) { T.medals[k] = true; newRecord = true; medals.fresh = [...(medals.fresh || []), k]; }
      }
      T.runs = [{ defenses: run.idx, of: run.list.length, seconds: run.seconds, lost, by: kind === 'lost' ? by : null, clear: kind === 'clear' }, ...T.runs].slice(0, 8);
    } else {
      const G = R.gauntlet[run.zone || 'classic'], streak = run.idx;
      if (streak > G.bestStreak || (streak === G.bestStreak && streak > 0 && run.seconds < (G.bestStreakTime ?? Infinity))) {
        G.bestStreak = streak; G.bestStreakTime = run.seconds; newRecord = true;
      }
      if (kind === 'clear') G.clears = (G.clears || 0) + 1;
      if (kind === 'clear' && run.seconds < (G.bestTime ?? Infinity)) { G.bestTime = run.seconds; newRecord = true; }
      G.runs = [{ streak, seconds: run.seconds, by, of: run.list.length }, ...G.runs].slice(0, 8);
    }
    this.over = { kind, by, newRecord, medals, run: { ...run } };
    R.run = null;
    saveRecords(R);
  }

  loadNext() {
    if (this.over || !this.run) return;
    const id = this.run.list[this.run.idx];
    this.d = fighterFor(id, this.run.mode === 'td');
    this.portrait = portraitOf(this.d);
  }

  // (the end-of-run summary and a defense's result card turn with a tap; the hub's menu has rows to tap)
  get tapAdvance() { return !!(this.over || !this.run || this.card); }
  enter() {
    const A = this.g.audio, S = this.g.songs;
    if (this.leaveAtOnce) { this.g.go(this.back); return; }
    if (this.over) A.play(this.over.kind === 'clear' ? S.belt : S.defeat);
    else A.play(S.modes);
    if (this.over && this.over.newRecord) A.sfx('fanfare');
  }

  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio;
    if (this.over || !this.run) {
      if (this.t > 60 && (I.confirm() || I.pressed('star') || I.pressed('pause'))) { A.sfx('confirm'); this.g.go(this.back); }
      return;
    }
    if (this.card) { if (this.t > 40 && (I.confirm() || I.pressed('star') || I.pressed('pause'))) { A.sfx('confirm'); this.g.go(this.back); } return; }
    this.hits.rows(I, this.sel, (i) => { this.sel = i; this.confirmQuit = false; A.sfx('menu'); });
    if (I.pressed('up') || I.pressed('down')) { this.sel ^= 1; this.confirmQuit = false; A.sfx('menu'); }
    if (I.pressed('pause')) { A.sfx('menu'); this.g.go(this.back); return; } // the run stays saved
    if (!(I.confirm() || I.pressed('star'))) return;
    if (this.sel === 0) { A.sfx('confirm'); this.g.go('intro', { fighter: this.run.list[this.run.idx], mode: this.run.mode }); return; }
    if (!this.confirmQuit) { this.confirmQuit = true; A.sfx('menu'); return; }
    A.sfx('confirm');
    this.finish('quit', null);
    this.enter();
  }

  render(f) {
    backdrop(f, this.t);
    if (this.over || !this.run) return this.renderOver(f);
    if (this.card) return this.renderCard(f);
    const run = this.run, td = run.mode === 'td', d = this.d, R = this.g.records;
    drawTextBig(f, td ? 'TITLE DEFENSE' : 'THE GAUNTLET', 128, 6, td ? GOLD : COL.red, COL.black, 2);

    // the last fight
    if (run.last) {
      const L = run.last;
      const how = L.method === 'QUIT' ? 'WALKED OUT' : `${L.method === 'KO' ? 'K.O.' : 'T.K.O.'} R${L.round} ${L.time}`;
      const F = FIGHTERS[L.id], txt = `${L.won ? 'WON' : 'LOST'} VS ${F.short || F.name}: ${how}`;
      drawTextCentered(f, txt, 128, 26, L.won ? COL.green : COL.pink, { mono: false });
    }

    // next opponent
    panel(f, 6, 38, 128, 124);
    drawText(f, 'NEXT', 12, 44, COL.orange, { mono: false });
    f.rect(58, 42, 70, 66, COL.white);
    f.rect(60, 44, 66, 62, BOX);
    f.blit(this.portrait.sprite, 61, 46, this.portrait.pal);
    let ly = 112;
    ly += 9 * drawBlock(f, d.name, 12, ly, 120, 2, COL.white, { lineH: 9, where: 'run name' });
    ly += 9 * drawBlock(f, `"${d.nickname}"`, 12, ly, 120, 2, COL.yellow, { lineH: 9, where: 'run nickname' });
    drawLabel(f, td || !rosterNumber(d.id) ? SHORT[d.circuit] : `#${rosterNumber(d.id)} ${SHORT[d.circuit]}`, 12, Math.max(ly + 1, 150), 120, COL.cyan, { mono: false, where: 'run circuit' });

    // progress
    panel(f, 138, 38, 112, 124);
    const row = (label, val, y, col = COL.white) => { drawText(f, label, 143, y, COL.cyan, { mono: false }); drawText(f, val, 245 - textWidth(val, false), y, col, { mono: false }); };
    const name = runTitle(run).replace(/^(TITLE) /, '');
    if (td) {
      drawTextCentered(f, TD_NAMES[run.tier || 'classic'], 194, 43, GOLD, { mono: false });
      row('DEFENSE', `${run.idx + 1}/${run.list.length}`, 55);
      drawText(f, 'LIVES', 143, 67, COL.cyan, { mono: false });
      for (let i = 0; i < TD_LIVES; i++) {
        if (i < run.lives) f.blit(ICONS.glove, 222 + i * 14, 71, UIPAL);
        else f.rect(217 + i * 14, 67, 11, 9, COL.dark);
      }
      // the defense so far: one mark per fighter (small ones for the long defenses)
      const small = run.list.length > 14, pitch = small ? 10 : 14, size = small ? 8 : 12, cols = small ? 10 : 7;
      run.list.forEach((id, i) => {
        const x = 143 + (i % cols) * pitch, y = 84 + Math.floor(i / cols) * (small ? 10 : 16);
        const done = i < run.idx, cur = i === run.idx;
        f.rect(x, y, size, size, cur && (this.t >> 4) & 1 ? COL.yellow : done ? GOLD : COL.dark);
        if (done && !small) f.blit(ICONS.star, x + 1, y + 1, UIPAL);
        else if (done) f.rect(x + 2, y + 2, size - 4, size - 4, c32(31, 29, 12));
        else if (id === 'jax' && !small) drawText(f, 'J', x + 4, y + 3, cur ? COL.black : COL.grey, { mono: false });
      });
      row('TIME', clockText(run.seconds), 136);
      row('BEST', `${R.td[run.tier || 'classic'].best}/${run.list.length}`, 148, COL.grey);
    } else {
      drawTextCentered(f, name.replace(' GAUNTLET', ''), 194, 43, COL.yellow, { mono: false });
      row('FIGHT', `${run.idx + 1}/${run.list.length}`, 55);
      row('STREAK', String(run.idx), 67, COL.yellow);
      row('TIME', clockText(run.seconds), 79);
      drawText(f, 'HEALTH', 143, 93, COL.cyan, { mono: false });
      f.rect(143, 102, 102, 8, COL.barBack);
      f.rect(144, 103, Math.round(100 * run.health / 100), 6, COL.off);
      f.rect(144, 103, Math.round(100 * run.health / 100), 1, COL.white);
      drawText(f, 'STARS', 143, 116, COL.cyan, { mono: false });
      for (let i = 0; i < 3; i++) f.blit(i < run.stars ? ICONS.star : ICONS.starEmpty, 207 + i * 13, 115, UIPAL);
      row('BEST', `${R.gauntlet[run.zone || 'classic'].bestStreak}`, 134, COL.grey);
    }

    // menu
    this.hits.clear();
    ['FIGHT!', this.confirmQuit ? (td ? 'GIVE UP THE TITLE?' : 'END THE RUN HERE?') : (td ? 'GIVE UP' : 'END RUN')].forEach((m, i) => {
      const y = 170 + i * 12, on = i === this.sel;
      this.hits.add(8, y - 3, 240, 13, i);
      drawText(f, m, 30, y, on ? (i && this.confirmQuit ? COL.red : COL.white) : COL.grey);
      if (on) cursor(f, 12, y - 3, this.t);
    });
    const rule = td ? 'LOSE TWICE: THE TITLE IS GONE.' : `ONE LOSS ENDS IT. WINS HEAL ${GAUNTLET_HEAL}%.`;
    drawTextCentered(f, rule, 128, 198, COL.grey, { mono: false });
    drawTextCentered(f, equippedText(this.g), 128, 210, COL.cyan, { mono: false });
  }

  // after a fight of a Title Defense: what happened, what it cost and who is next (the podium hall is the rest of the hub)
  renderCard(f) {
    const run = this.run, C = this.card, d = FIGHTERS[C.id], R = this.g.records;
    drawTextBig(f, C.won ? 'DEFENDED!' : 'YOU LOST', 128, 14, C.won ? GOLD : COL.red, COL.black, 2);
    const how = C.how === 'QUIT' ? 'WALKED OUT' : `${C.how === 'KO' ? 'K.O.' : 'T.K.O.'} ROUND ${C.round}  ${C.time}`;
    drawTextCentered(f, `${C.won ? 'BEAT' : 'LOST TO'} ${d.name}`, 128, 40, COL.white, { mono: false });
    drawTextCentered(f, how, 128, 51, COL.cyan, { mono: false });
    panel(f, 24, 66, 208, 70);
    const rec = C.rec;
    drawText(f, C.won && rec && rec.time != null ? `${rec.newBest ? 'NEW BEST' : 'KO TIME'} ${clockText(rec.time)}` : 'NO KO TIME', 34, 72, rec && rec.newBest && (this.t >> 3) & 1 ? COL.yellow : COL.white, { mono: false });
    drawMedalRow(f, 34, 86, tdChampOf(R, C.id).got, (this.t >> 3) & 1 && rec ? rec.earned : []);
    if (rec && rec.earned.length && this.t === 30) this.g.audio.sfx('medal');
    drawText(f, 'LIVES', 34, 106, COL.cyan, { mono: false });
    for (let i = 0; i < TD_LIVES; i++) { if (i < run.lives) f.blit(ICONS.glove, 84 + i * 14, 110, UIPAL); else f.rect(79 + i * 14, 106, 11, 9, COL.dark); }
    const nx = run.list[run.idx];
    drawText(f, C.won ? `NEXT: ${FIGHTERS[nx] ? FIGHTERS[nx].name : '???'}` : 'SHAKE IT OFF. REMATCH!', 34, 122, C.won ? COL.white : COL.pink, { mono: false });
    drawTextCentered(f, `DEFENSE ${Math.min(run.idx + 1, run.list.length)} OF ${run.list.length}`, 128, 150, COL.grey, { mono: false });
    drawTextCentered(f, equippedText(this.g), 128, 164, COL.cyan, { mono: false });
    if (this.t > 40 && (this.t >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 206, COL.yellow);
  }

  renderOver(f) {
    const O = this.over;
    if (!O) { drawTextCentered(f, 'NO RUN IN PROGRESS', 128, 100, COL.grey); return; }
    const run = O.run, td = run.mode === 'td', R = this.g.records;
    const clear = O.kind === 'clear';
    const head = td ? (clear ? 'TITLE DEFENDED!' : 'TITLE LOST') : (clear ? (run.zone === 'combined' ? 'COMBINED CLEAR!' : 'GAUNTLET CLEARED!') : 'RUN OVER');
    drawTextBig(f, head, 128, 20, clear ? ((this.t >> 3) & 1 ? COL.yellow : GOLD) : COL.red, COL.black, 2);
    drawTextCentered(f, runTitle(run), 128, 40, COL.cyan, { mono: false });
    panel(f, 24, 56, 208, 96);
    let y = 64;
    const row = (a, b, col = COL.white) => { drawText(f, a, 32, y, COL.cyan, { mono: false }); drawText(f, b, 224 - textWidth(b, false), y, col, { mono: false }); y += 12; };
    if (td) {
      const T = R.td[run.tier || 'classic'];
      row('DEFENSES', `${run.idx} OF ${run.list.length}`);
      row('LIVES LEFT', String(Math.max(0, run.lives)));
      row('FIGHT TIME', clockText(run.seconds));
      if (O.by) row('STOPPED BY', fighterName(O.by), COL.pink);
      row('BEST EVER', `${T.best} OF ${run.list.length}`, COL.grey);
      if (T.bestTime != null) row('BEST TIME', clockText(T.bestTime), COL.grey);
      if (clear && O.medals) {
        const earned = ['bronze', 'silver', 'gold'].filter((k) => O.medals[k]);
        row('MEDAL', MEDAL_WORD[earned.length], earned.length && (this.t >> 3) & 1 ? COL.yellow : COL.white);
      }
    } else {
      row('STREAK', `${run.idx} OF ${run.list.length}`, COL.yellow);
      row('TIME', clockText(run.seconds));
      if (O.by) row('STOPPED BY', fighterName(O.by), COL.pink);
      else if (!clear) row('STOPPED BY', 'YOU WALKED OUT', COL.grey);
      const GS = R.gauntlet[run.zone || 'classic'];
      row('BEST STREAK', String(GS.bestStreak), COL.grey);
      if (GS.bestTime != null) row('BEST TIME', clockText(GS.bestTime), COL.grey);
    }
    if (O.newRecord && (this.t >> 3) & 1) drawTextCentered(f, 'NEW RECORD!', 128, 160, COL.yellow);
    const runs = (td ? R.td[run.tier || 'classic'].runs : R.gauntlet[run.zone || 'classic'].runs).slice(0, 3);
    runs.forEach((r, i) => drawTextCentered(f, td
      ? `${r.defenses} OF ${r.of} - ${r.clear ? 'DEFENDED' : r.by ? fighterName(r.by) : 'GAVE UP'}`
      : `${r.streak} WINS - ${r.by ? fighterName(r.by) : r.streak >= r.of ? 'CLEARED' : 'WALKED OUT'}`, 128, 176 + i * 9, i ? COL.dark : COL.grey, { mono: false }));
    if (this.t > 60 && (this.t >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 208, COL.white);
  }
}

// ---------------------------------------------------------------------------
// (`version`: his normal self, or his Title Defense version in each division you have reached him in)
const PRACTICE_ROWS = ['circuit', 'fighter', 'tell', 'hearts', 'health', 'slow', 'version', 'alt', 'xview', 'fight', 'back'];
// ('TD CLASSIC' where it fits the row or the picture's corner, else the division shortened)
const TD_TAG = { underworld: 'U.WORLD' };
const versionName = (v, room = 1e9) => { if (v === 'normal') return 'NORMAL'; const full = `TD ${TD_NAMES[v]}`; return textWidth(full, false) <= room ? full : `TD ${TD_TAG[v] || TD_NAMES[v]}`; };

export class PracticeScreen {
  constructor(game, { result, last } = {}) {
    this.g = game;
    this.t = 0;
    const R = game.records;
    this.met = R.met;
    this.circuits = [...new Set(this.met.map((id) => FIGHTERS[id].circuit))];
    const P = game.practice || (game.practice = { circuit: 0, fighter: 0, tell: true, hearts: false, health: true, slow: false, version: 'normal' });
    if (!P.version) P.version = 'normal';
    if (P.health === undefined) P.health = true; // (older sessions: unlimited health is on by default)
    this.P = P;
    this.P.circuit = Math.min(P.circuit, Math.max(0, this.circuits.length - 1));
    this.sel = result ? PRACTICE_ROWS.indexOf('fight') : 0;
    this.hits = new Hits();
    this.result = result || null;
    this.lastId = last;
    // it opens on the grid of everyone (as the opponent index does); a fighter you have met opens his practice options. Back from a
    // practice fight it opens on his options again.
    const metSet = new Set(this.met);
    this.grid = new FighterGrid(EVERYONE, (id) => metSet.has(id), 0, game, (id) => (tdVersions(game.records, id).length ? 'TD' : null));
    this.mode = result ? 'options' : 'grid';
    this.refresh();
    if (this.met.length) this.grid.select(this.id());
  }
  updateGrid() {
    const I = this.g.input, A = this.g.audio, r = this.grid.update(I, A);
    if (r === 'back') { this.g.go('map'); return; }
    if (r !== 'open') return;
    const id = this.grid.id;
    if (!this.met.includes(id)) { A.sfx('tired'); return; }
    A.sfx('confirm');
    this.P.circuit = this.circuits.indexOf(FIGHTERS[id].circuit); this.P.fighter = this.list().indexOf(id);
    this.sel = PRACTICE_ROWS.indexOf('fight'); this.result = null; this.mode = 'options'; this.refresh();
  }
  list() { const c = this.circuits[this.P.circuit]; return this.met.filter((id) => FIGHTERS[id].circuit === c); }
  id() { const L = this.list(); this.P.fighter = Math.min(this.P.fighter, L.length - 1); return L[this.P.fighter]; }
  // the versions of him to fight: his own, and his Title Defense version in every division you have reached him in (he has one if he defends in any)
  versions() { const id = this.id(), d = FIGHTERS[id]; return d && d.titleDefense ? ['normal', ...tdVersions(this.g.records, id)] : ['normal']; }
  canRemix() { return this.versions().length > 1; }
  version() { const v = this.versions(); return v.includes(this.P.version) ? this.P.version : v.includes('normal') ? 'normal' : v[0]; }
  isRemix() { return this.version() !== 'normal'; }
  // his alternate palette, once its medal unlock is in (§16)
  canAlt() { return altUnlocked(this.g, this.id()) && !this.isRemix(); }
  // exploit view: the scouting reward for a fully scouted circuit (knowledge spec K5)
  canXview() { const d = FIGHTERS[this.id()]; return !!(d && circuitScouted(this.g.scouting || {}, d.circuit)); }
  shown(r) { return (r !== 'version' || this.canRemix()) && (r !== 'alt' || this.canAlt()) && (r !== 'xview' || this.canXview()); }
  refresh() {
    if (!this.met.length) return;
    this.d = fighterFor(this.id(), this.isRemix());
    this.portrait = portraitOf(this.P.alt && this.canAlt() ? { ...this.d, palette: altPaletteOf(this.d) } : this.d);
  }
  enter() { this.g.audio.play(this.g.songs.modes); }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio, P = this.P;
    if (I.pressed('pause')) { A.sfx('menu'); this.g.go('map'); return; }
    if (!this.met.length) { if (I.confirm() || I.back()) this.g.go('map'); return; }
    if (this.mode === 'grid') { this.updateGrid(); return; }
    if (I.back()) { A.sfx('menu'); this.mode = 'grid'; this.grid.select(this.id()); return; }
    const rows = PRACTICE_ROWS.filter((r) => this.shown(r));
    let i = rows.indexOf(PRACTICE_ROWS[this.sel]);
    if (i < 0) i = 0;
    // touch: a tap on a row chooses it; on the one chosen it does it (the opponent's rows: the left of the line is back, the right is on)
    for (const h of this.hits.take(I)) {
      if (rows[h.id] !== PRACTICE_ROWS[this.sel]) { this.sel = PRACTICE_ROWS.indexOf(rows[h.id]); i = h.id; A.sfx('menu'); continue; }
      if (rows[h.id] === 'circuit' || rows[h.id] === 'fighter') I.fake(h.x < h.w / 2 ? 'left' : 'right'); else I.fake('a');
    }
    if (I.pressed('up')) { i = (i + rows.length - 1) % rows.length; A.sfx('menu'); }
    if (I.pressed('down')) { i = (i + 1) % rows.length; A.sfx('menu'); }
    this.sel = PRACTICE_ROWS.indexOf(rows[i]);
    const row = rows[i];
    const d = I.pressed('left') ? -1 : I.pressed('right') ? 1 : 0;
    const ok = I.confirm() || I.pressed('star');
    if (d || ok) {
      if (row === 'circuit' && (d || ok)) { P.circuit = (P.circuit + (d || 1) + this.circuits.length) % this.circuits.length; P.fighter = 0; this.result = null; A.sfx('menu'); }
      else if (row === 'fighter') { const n = this.list().length; P.fighter = (P.fighter + (d || 1) + n) % n; this.result = null; A.sfx('menu'); }
      else if (row === 'version') { const v = this.versions(), n = v.length; P.version = v[(v.indexOf(this.version()) + (d || 1) + n) % n]; A.sfx('menu'); }
      else if (['tell', 'hearts', 'health', 'slow', 'alt', 'xview'].includes(row)) { P[row] = !P[row]; A.sfx('menu'); }
      else if (row === 'fight' && ok) { A.sfx('confirm'); this.g.go('fight', { fighter: this.id(), practice: { ...P, remix: this.isRemix(), tier: this.version(), alt: P.alt && this.canAlt(), xview: P.xview && this.canXview() } }); return; }
      else if (row === 'back' && ok) { A.sfx('confirm'); this.mode = 'grid'; this.grid.select(this.id()); return; }
      this.refresh();
    }
  }
  render(f) {
    if (this.met.length && this.mode === 'grid') return this.grid.render(f, this.t, 'PRACTICE', COL.green, 'A: PRACTICE   B: BACK');
    backdrop(f, this.t);
    drawTextBig(f, 'PRACTICE', 128, 6, COL.green, COL.black, 2);
    if (!this.met.length) { drawTextCentered(f, 'NOBODY TO PRACTICE AGAINST YET.', 128, 100, COL.grey, { mono: false }); return; }
    const d = this.d, P = this.P;
    // the opponent
    panel(f, 6, 30, 88, 150);
    f.rect(15, 35, 70, 66, COL.white);
    f.rect(17, 37, 66, 62, BOX);
    f.blit(this.portrait.sprite, 18, 39, this.portrait.pal);
    let ly = 106;
    // name and nickname share the 5 rows above the stats
    const nameRows = drawBlock(f, d.name, 11, ly, 80, 3, COL.white, { lineH: 9, where: 'practice name' }); ly += 9 * nameRows;
    drawBlock(f, d.nickname, 11, ly, 80, 5 - nameRows, COL.yellow, { lineH: 9, where: 'practice nickname' });
    const c = CIRCUITS[d.circuit];
    drawText(f, `TELLS ${c.tellWindow}F`, 11, 158, COL.cyan, { mono: false });
    drawText(f, `${c.hearts} HEARTS`, 11, 168, COL.cyan, { mono: false });
    // (his Title Defense version wears its division on the corner of his picture)
    if (d.remix) { const tg = versionName(this.version(), 62); f.rect(18, 90, textWidth(tg, false) + 4, 9, COL.black); drawText(f, tg, 20, 91, (this.t >> 3) & 1 ? GOLD : COL.yellow, { mono: false }); }
    // the options
    panel(f, 98, 30, 152, 150);
    const on = (b) => (b ? 'ON' : 'OFF');
    let y = 36;
    const step = PRACTICE_ROWS.filter((r) => this.shown(r)).length > 10 ? 10 : 11; // (all rows: a little tighter)
    this.hits.clear();
    let hitN = 0;
    for (const r of PRACTICE_ROWS) {
      if (!this.shown(r)) continue;
      this.hits.add(98, y - 3, 152, r === 'circuit' || r === 'fighter' ? 25 : step, hitN++);
      const sel = PRACTICE_ROWS[this.sel] === r;
      if (sel) cursor(f, 99, y - 3, this.t);
      const lab = (t) => drawText(f, t, 112, y, sel ? COL.white : COL.grey, { mono: false });
      const val = (t) => drawText(f, t, 247 - textWidth(t, false), y, sel ? COL.cyan : COL.off, { mono: false });
      if (r === 'circuit' || r === 'fighter') {
        lab(r === 'circuit' ? 'CIRCUIT' : 'OPPONENT');
        const v = r === 'circuit' ? SHORT[this.circuits[P.circuit]] : `${P.fighter + 1} OF ${this.list().length}`;
        y += 10;
        drawText(f, sel ? `< ${v} >` : v, 174 - textWidth(sel ? `< ${v} >` : v, false) / 2, y, sel ? COL.cyan : COL.off, { mono: false });
        y += 14;
        continue;
      }
      if (r === 'tell') { lab('TELL FLASH'); val(on(P.tell)); }
      // (labels kept short enough to clear their ON / OFF)
      else if (r === 'hearts') { lab('NO HEART LOSS'); val(on(P.hearts)); }
      else if (r === 'health') { lab('NO DAMAGE'); val(on(P.health)); }
      else if (r === 'slow') { lab('SLOW-MO 50%'); val(on(P.slow)); }
      else if (r === 'version') { lab('VERSION'); val(versionName(this.version(), 78)); }
      else if (r === 'alt') { lab('ALT COLORS'); val(on(P.alt)); }
      else if (r === 'xview') { lab('EXPLOIT VIEW'); val(on(P.xview)); }
      else lab(r === 'fight' ? 'FIGHT!' : 'BACK');
      y += r === 'fight' ? step + 2 : step;
    }
    // the last practice fight
    panel(f, 6, 186, 244, 30);
    if (this.result && this.result.winner !== 'none') {
      const r = this.result, s = r.stats;
      const how = r.method === 'QUIT' ? 'WALKED OUT' : `${r.method === 'KO' ? 'K.O.' : 'T.K.O.'} R${r.round} ${r.time}`;
      drawText(f, `${r.winner === 'player' ? 'WON' : 'LOST'} BY ${how}`, 12, 190, r.winner === 'player' ? COL.green : COL.pink, { mono: false });
      drawText(f, `HIT ${s.hitsTaken}  DODGED ${s.dodges}  PERFECT ${s.perfects}`, 12, 202, COL.grey, { mono: false });
    } else {
      drawTextCentered(f, 'NOTHING IN PRACTICE COUNTS', 128, 190, COL.grey, { mono: false });
      drawTextCentered(f, 'TOWARD YOUR CAREER.', 128, 201, COL.grey, { mono: false });
    }
  }
}
