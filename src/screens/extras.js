// The Home gym's screens (§15, §16): each is a station you walk up to (src/screens/interior.js, data/interiors.js), and each goes back to the gym:
//   RecordsScreen   every fighter's best KO time, by circuit
//   MedalsScreen    the medal grid: every fighter, his 3 medals locked or earned
//   GalleryScreen   (unlock) every opponent: sprite (and a 4x view), bio, stats,
//                   record time, medals, the corner's notes on him
//   TheaterScreen   (theater.js) every cutscene you have seen, by zone: watch it again
//   SoundTestScreen (unlock) every song and every sound effect
//   UnlocksScreen   the medal thresholds and what they open
// Fighters you haven't met show as ??? (a silhouette in the gallery). The Ascension's zones
// (Pantheon, Underworld, the Void) stay out of every list until you've reached them (Phase F).
import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { layout, MORE, drawBlock, drawLabel, drawLabelCentered } from '../engine/textbox.js';

// the gallery's scrolling pages (bio, corner notes, scouting): their text width, clear of the ▼ at the right
const SCROLL_W = 134;
import { c32 } from '../engine/palette.js';
import { ICONS } from '../../data/sprites/ui.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { CIRCUITS, SHORT, ROMAN } from '../../data/circuits.js';
import { PORTRAITS } from '../../data/sprites/portraits.js';
import { fighterSprites, paletteFor } from '../engine/spriteCache.js';
import { UNLOCKS, ASC_UNLOCKS, ALL_UNLOCKS } from '../../data/unlocks.js';
import { speedTarget } from '../../data/medals.js';
import { SFX_NAMES } from '../engine/audio.js';
import { SONG_ZONE } from '../../data/music/index.js';
import { EVERYONE, clockText, remixUnlocked } from '../save/records.js';
import { remixed } from '../../data/fighters/titleDefense.js';
import { medalCount, ascMedalCount, MEDAL_TOTAL, ASC_MEDAL_TOTAL } from '../save/medals.js';
import { isUnlocked, nextUnlock, freshUnlocks, unlockedList, ZONES, ZONE_NAMES, zoneOfFighter, zoneSeen, ascensionSeen, visibleFighters } from '../save/unlocks.js';
import { drawMedalRow } from './medalIcons.js';
import { scoutEntries } from '../fight/knowledge.js';
import { scoutProgress, isScouted, circuitScouted, SCOUT_CIRCUITS } from '../save/scouting.js';
import { Hits, scrollList, swipe, swipeX } from '../engine/hits.js';

const BG = c32(3, 3, 8), STRIPE = c32(4, 7, 12), BOX = c32(11, 22, 27), GOLD = c32(30, 24, 6), SIL = c32(6, 7, 10);
const backdrop = (f, t) => { f.clear(BG); for (let y = 0; y < 224; y += 8) f.rect(0, y + ((t >> 3) & 7), 256, 2, STRIPE); };
const cursor = (f, x, y, t) => f.blit(ICONS.glove, x + ((t >> 3) & 1), y + 3, UIPAL);
const nameOf = (d) => (d.rival ? `DASH MADDOX ${ROMAN[d.rival]}` : d.name);
// three letters for the medal grid's cells
const tagOf = (d) => (d.rival ? `DM${d.rival}` : (d.short || d.name.replace(/^THE /, '')).replace(/[^A-Z]/g, '').slice(0, 3));
// Everyone, circuit by circuit (rival fights after the title they follow).
function byCircuit(ids = EVERYONE) {
  const out = [];
  let cur = null;
  for (const id of ids) {
    const c = FIGHTERS[id].circuit;
    if (c !== cur) { out.push({ header: CIRCUITS[c].rival ? 'RIVAL' : SHORT[c] }); cur = c; }
    out.push({ id });
  }
  return out;
}
const metOf = (g) => new Set(g.records.met);

// ---------------------------------------------------------------------------
// A scrolling list of rows (headers are skipped by the cursor).
class ListScreen {
  constructor(game, rows) { this.g = game; this.t = 0; this.rows = rows; this.sel = rows.findIndex((r) => !r.header); this.top = 0; this.hits = new Hits(); }
  enter() { this.g.audio.play(this.g.songs.modes); }
  move(d) {
    let s = this.sel;
    do { s = (s + d + this.rows.length) % this.rows.length; } while (this.rows[s].header);
    this.sel = s;
  }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio;
    if (I.back()) { A.sfx('menu'); this.g.go('map'); return; }
    if (I.confirm() && this.other) { A.sfx('menu'); this.g.go(this.other); return; } // (the trophy case: the medal grid and the record times are one case)
    // touch: a tap on a row chooses it, and on the one chosen presses A; a swipe scrolls
    for (const h of this.hits.take(I)) { if (h.id === this.sel) I.fake('a'); else { this.sel = h.id; A.sfx('menu'); } }
    scrollList(I, this, this.rows.length, this.visible || 15, { pitch: 10, margin: 1, skip: (i) => this.rows[i].header });
    if (I.pressed('up')) { this.move(-1); A.sfx('menu'); }
    if (I.pressed('down')) { this.move(1); A.sfx('menu'); }
    if (I.pressed('left')) { for (let i = 0; i < 8; i++) this.move(-1); A.sfx('menu'); }
    if (I.pressed('right')) { for (let i = 0; i < 8; i++) this.move(1); A.sfx('menu'); }
    const VIS = this.visible || 15;
    if (this.sel < this.top + 1) this.top = Math.max(0, this.sel - 1);
    if (this.sel >= this.top + VIS) this.top = this.sel - VIS + 1;
    this.onUpdate && this.onUpdate(I, A);
  }
}

export class RecordsScreen extends ListScreen {
  constructor(game) { super(game, byCircuit(visibleFighters(game))); this.visible = 15; this.other = 'medals'; this.ids = visibleFighters(game); }
  render(f) {
    backdrop(f, this.t);
    drawTextBig(f, 'RECORDS', 128, 6, COL.cyan, COL.black, 2);
    const M = this.g.medals, met = metOf(this.g);
    panel(f, 8, 26, 240, 170);
    this.hits.clear();
    drawText(f, 'FIGHTER', 16, 30, COL.grey, { mono: false }); drawText(f, 'BEST KO', 148, 30, COL.grey, { mono: false });
    this.rows.slice(this.top, this.top + this.visible).forEach((r, k) => {
      const y = 42 + k * 10, i = this.top + k;
      if (r.header) { drawText(f, r.header, 12, y, COL.orange, { mono: false }); return; }
      this.hits.add(10, y - 2, 236, 10, i);
      const d = FIGHTERS[r.id], known = met.has(r.id), on = i === this.sel;
      if (on) f.rect(10, y - 2, 236, 10, COL.panelHi);
      drawText(f, known ? nameOf(d) : '???', 20, y, known ? (on ? COL.white : COL.off) : COL.grey, { mono: false });
      const b = M.best[r.id];
      drawText(f, b == null ? '--:--' : clockText(b), 160, y, b == null ? COL.grey : COL.yellow, { mono: false });
      drawMedalRow(f, 206, y - 3, M.got[r.id] || {});
    });
    const all = this.ids.filter((id) => M.best[id] != null).length;
    drawTextCentered(f, `${all}/${this.ids.length} FIGHTERS WITH A KO TIME`, 128, 202, COL.grey, { mono: false });
    drawTextCentered(f, 'A: MEDAL GRID   B: BACK', 128, 212, COL.dark, { mono: false });
  }
}

// ---------------------------------------------------------------------------
export class MedalsScreen {
  // The grid is paged by section (Phase F): the circuits' 56, then one page for each Ascension zone you've reached
  // (STAR switches). Its headline total is the base game's 168; each Ascension page counts its own.
  constructor(game) {
    this.g = game; this.t = 0; this.sel = 0; this.tab = 0; this.hits = new Hits();
    this.tabs = ['base', ...ZONES.filter((z) => zoneSeen(game, z))].map((z) => ({ zone: z, ids: EVERYONE.filter((id) => zoneOfFighter(id) === z) }));
  }
  enter() { this.g.audio.play(this.g.songs.modes); }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio, C = 7, ids = this.tabs[this.tab].ids, n = ids.length;
    // touch: a tap on a fighter chooses him, and on the one chosen opens the KO times; the top line turns the page
    for (const h of this.hits.take(I)) { if (h.id === 'star') I.fake('star'); else if (h.id === this.sel) I.fake('a'); else { this.sel = h.id; A.sfx('menu'); } }
    if (swipeX(I, 40) && this.tabs.length > 1) I.fake('star');
    if (I.back()) { A.sfx('menu'); this.g.go('map'); return; }
    if (I.pressed('star') && this.tabs.length > 1) { this.tab = (this.tab + 1) % this.tabs.length; this.sel = 0; A.sfx('menu'); return; }
    if (I.confirm()) { A.sfx('menu'); this.g.go('records'); return; }
    const d = I.pressed('left') ? -1 : I.pressed('right') ? 1 : I.pressed('up') ? -C : I.pressed('down') ? C : 0;
    if (d) { this.sel = (this.sel + d + n) % n; A.sfx('menu'); }
  }
  render(f) {
    backdrop(f, this.t);
    const M = this.g.medals, met = metOf(this.g), C = 7, T = this.tabs[this.tab], ids = T.ids;
    drawText(f, T.zone === 'base' ? 'MEDALS' : ZONE_NAMES[T.zone], 8, 6, GOLD);
    const got = ids.reduce((a, id) => a + ['speed', 'flawless', 'signature'].filter((k) => (M.got[id] || {})[k]).length, 0);
    const tot = `${got}/${ids.length * 3}`;
    drawText(f, tot, 248 - textWidth(tot), 6, COL.yellow);
    // (the buttons on their own row, under the title and the count)
    drawTextCentered(f, this.tabs.length > 1 ? `STAR: PAGE  A: TIMES` : 'A: KO TIMES', 128, 16, COL.grey, { mono: false });
    this.hits.clear();
    if (this.tabs.length > 1) this.hits.add(0, 0, 256, 25, 'star');
    ids.forEach((id, i) => {
      const x = 4 + (i % C) * 36, y = 27 + Math.floor(i / C) * 18, on = i === this.sel;
      this.hits.add(x - 1, y - 1, 36, 18, i);
      if (on) f.rect(x - 1, y - 1, 36, 18, COL.panelHi);
      drawMedalRow(f, x + 1, y, M.got[id] || {});
      drawText(f, met.has(id) ? tagOf(FIGHTERS[id]) : '???', x + 5, y + 11, on ? COL.white : met.has(id) ? COL.off : COL.grey, { mono: false });
    });
    // the selected fighter
    const id = ids[this.sel], d = FIGHTERS[id], known = met.has(id);
    panel(f, 4, 172, 248, 48);
    // his record time at the right ("BEST" goes when a long name needs the room)
    const b = M.best[id], nm = known ? nameOf(d) : '???', tm = b == null ? '--:--' : clockText(b);
    const best = textWidth(`${nm}  BEST ${tm}`, false) <= 236 ? `BEST ${tm}` : tm, bw = textWidth(best, false);
    drawText(f, best, 246 - bw, 176, COL.cyan, { mono: false });
    drawLabel(f, nm, 10, 176, 236 - bw - 6, COL.white, { mono: false, where: 'medals name' });
    const st = clockText(speedTarget(d)), bronze = textWidth(`BRONZE KO IN ${st}  SILVER NO HITS`, false) <= 240 ? `BRONZE KO IN ${st}  SILVER NO HITS` : `BRONZE KO IN ${st} SILVER NO HITS`;
    drawLabel(f, bronze, 8, 187, 240, COL.grey, { mono: false, where: 'medals bronze' });
    drawBlock(f, `GOLD: ${known ? d.medals.signature.text : '???'}`, 10, 198, 236, 2, COL.yellow, { lineH: 9, where: 'medals gold' });
  }
}

// ---------------------------------------------------------------------------
export class GalleryScreen {
  constructor(game) { this.g = game; this.t = 0; this.sel = 0; this.zoom = false; this.pan = 0; this.page = 0; this.hits = new Hits(); this.ids = visibleFighters(game); this.load(); }
  enter() { this.g.audio.play(this.g.songs.modes); }
  load() {
    const id = this.ids[this.sel], d = FIGHTERS[id];
    this.d = d; this.known = metOf(this.g).has(id);
    // a champion's Title Defense remix has a scouting report of its own (spec §6: new exploits and anti-strategies), once the tier is open
    this.rd = d.titleDefense && d.titleDefense.exploits && remixUnlocked(this.g.records, id) ? remixed(id) : null;
    const p = paletteFor(d.palette);
    this.pal = p.u32; this.portrait = PORTRAITS[id](p);
    this.bank = fighterSprites(d.spriteLayers);
    // unmet: a silhouette (every colour the same dark)
    this.sil = new Uint32Array(p.u32.length).fill(SIL); this.sil[0] = 0;
  }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio, n = this.ids.length;
    // touch: the picture opens the 4x view (and a tap on it again closes it); the card turns its page; the arrows (and a sideways swipe) change fighter;
    // up and down drag the text, or pan the 4x view
    for (const h of this.hits.take(I)) {
      if (h.id === 'pic') I.fake(this.zoom ? 'b' : 'a');
      else if (h.id === 'card' && this.known && !this.zoom) I.fake('star');
      else if (h.id === 'prev') I.fake('left');
      else if (h.id === 'next') I.fake('right');
    }
    const sx = swipeX(I, 34); if (sx && !this.zoom) I.fake(sx > 0 ? 'right' : 'left');
    const sy = swipe(I, 4);
    if (sy) { if (this.zoom) this.pan = Math.max(0, Math.min(this.maxPan || 0, this.pan + sy * 3)); else this.scroll = Math.max(0, (this.scroll || 0) + Math.sign(sy)); }
    if (I.back()) { A.sfx('menu'); if (this.zoom) this.zoom = false; else this.g.go('map'); return; }
    if (I.confirm() && this.known) { this.zoom = !this.zoom; this.pan = 0; A.sfx('menu'); }
    if (this.zoom) {
      if (I.held('up')) this.pan = Math.max(0, this.pan - 2);
      if (I.held('down')) this.pan = Math.min(this.maxPan || 0, this.pan + 2);
      return;
    }
    // pages: the card, trainer notes, and (if he has one) the scouting report (K5)
    if (I.pressed('star') && this.known) { this.page = (this.page + 1) % this.pageCount(); this.scroll = 0; A.sfx('menu'); }
    { const max = this.page === 0 ? this.bioMax || 0 : this.page === 1 ? this.noteMax || 0 : this.scoutMax || 0; if (I.pressed('up')) this.scroll = Math.max(0, (this.scroll || 0) - 1); if (I.pressed('down')) this.scroll = Math.min(max, (this.scroll || 0) + 1); }
    const d = I.pressed('left') ? -1 : I.pressed('right') ? 1 : 0;
    if (d) { this.sel = (this.sel + d + n) % n; this.page = 0; this.scroll = 0; A.sfx('menu'); this.load(); }
  }
  // pages: the card (0), corner notes (1), his scouting report (2, if he has one) and his remix's report (3, once the remix is open)
  pageCount() { return 2 + (scoutEntries(this.d).length ? 1 : 0) + (this.rd ? 1 : 0); }
  pageName(p) { return ['NOTES', scoutEntries(this.d).length ? 'SCOUTING' : (this.rd ? 'REMIX' : 'CARD'), this.rd && scoutEntries(this.d).length ? 'REMIX' : 'CARD', 'CARD'][p]; }
  render(f) {
    backdrop(f, this.t);
    this.hits.clear();
    this.hits.add(0, 0, 256, 224, 'pic'); // (a tap on the picture: the 4x view; in the 4x view a tap anywhere closes it)
    const d = this.d, pose = (this.t >> 5) & 1 ? 'idle2' : 'idle1';
    let s;
    try { s = this.bank.get(pose); } catch { s = this.bank.get('idle1'); }
    if (this.zoom) {
      // the sprite at 4x, panned with UP / DOWN
      const k = 4, H = s.h * k;
      this.maxPan = Math.max(0, H - 210);
      for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const v = s.data[y * s.w + x]; if (v) f.rect(128 - (s.w * k) / 2 + x * k, 14 + y * k - this.pan, k, k, this.pal[v]); }
      drawLabel(f, `${nameOf(d)} X4`, 6, 4, 244, COL.yellow, { mono: false, where: 'gallery zoom' });
      panel(f, 4, 208, 248, 14);
      drawTextCentered(f, 'UP/DOWN: PAN  B: BACK', 128, 211, COL.grey, { mono: false });
      return;
    }
    // left: the full sprite at 1x in a box
    panel(f, 4, 4, 92, 180);
    f.blit(s, 50, 178, this.known ? this.pal : this.sil);
    // right: card
    panel(f, 100, 4, 152, 180);
    this.hits.add(100, 4, 152, 180, 'card'); this.hits.add(4, 4, 92, 180, 'pic');
    this.hits.add(0, 192, 40, 32, 'prev'); this.hits.add(216, 192, 40, 32, 'next');
    drawText(f, '<', 12, 204, COL.cyan, { mono: false }); drawText(f, '>', 238, 204, COL.cyan, { mono: false });
    const M = this.g.medals;
    if (!this.known) {
      drawTextCentered(f, '???', 176, 60, COL.grey);
      drawTextCentered(f, 'NOT MET YET', 176, 80, COL.grey, { mono: false });
    } else if (this.page === 0) {
      f.rect(105, 8, 66, 62, COL.white); f.rect(106, 9, 64, 60, BOX); f.blit(this.portrait, 106, 9, this.pal);
      // his circuit, shortened until it fits beside the portrait
      const cs = SHORT[d.circuit] || '', tries = [cs, cs.replace('UNDERGROUND', 'UNDERGR.').replace('DREAM FIGHT', 'DREAM').replace('CONTINENTAL', 'CONTIN.').replace('GRAND PRIX', 'G. PRIX').replace('UNDERWORLD', 'UNDERW.').replace('PANTHEON', 'PANTH.').replace('THE VOID', 'VOID'), cs.replace('UNDERWORLD', 'UNDER.').replace('PANTHEON', 'PAN.').replace('THE VOID', 'VOID')];
      drawLabel(f, tries.find((x) => textWidth(x, false) <= 74) || tries[2], 176, 10, 74, COL.cyan, { mono: false, where: 'gallery circuit' });
      const b = M.best[d.id];
      drawText(f, `BEST ${b == null ? '--:--' : clockText(b)}`, 176, 22, COL.yellow, { mono: false });
      drawMedalRow(f, 176, 33, M.got[d.id] || {});
      const c = CIRCUITS[d.circuit];
      drawText(f, `HP ${d.stats.health}`, 176, 48, COL.off, { mono: false });
      drawLabel(f, textWidth(`TELLS ${c.tellWindow}F`, false) <= 74 ? `TELLS ${c.tellWindow}F` : `TELL ${c.tellWindow}F`, 176, 58, 74, COL.off, { mono: false, where: 'gallery tells' });
      // name and nickname wrap (two lines each at most); the bio takes the rows left, UP / DOWN scrolls a longer one
      // (the ▼ says there's more)
      let y = 74;
      y += 10 * drawBlock(f, nameOf(d), 106, y, 142, 2, COL.white, { where: 'gallery name' });
      y += 9 * drawBlock(f, `"${d.nickname}"`, 106, y, 142, 2, COL.yellow, { lineH: 9, where: 'gallery nickname' }) + 2;
      drawLabel(f, d.card.record, 106, y, 142, COL.grey, { mono: false, where: 'gallery record' }); y += 9;
      drawLabel(f, `AGE ${d.card.age}  ${d.card.weight} LB`, 106, y, 142, COL.grey, { mono: false, where: 'gallery age' }); y += 13;
      const L = layout(d.gallery || '', SCROLL_W), rows = Math.floor((179 - y) / 9);
      this.bioMax = Math.max(0, L.length - rows);
      this.scroll = Math.min(this.scroll || 0, this.bioMax);
      L.slice(this.scroll, this.scroll + rows).forEach((l, i) => drawText(f, l, 106, y + i * 9, COL.off, { mono: false }));
      if (this.bioMax) drawText(f, this.scroll < this.bioMax ? MORE : '^', 242, y + (rows - 1) * 9, COL.grey, { mono: false });
    } else if (this.page === 2 && !scoutEntries(d).length && this.rd) {
      this.renderScout(f, this.rd, this.rd.scoutId, 'REMIX REPORT');
    } else if (this.page === 2) {
      this.renderScout(f, d, d.id, 'SCOUTING REPORT');
    } else if (this.page === 3) {
      this.renderScout(f, this.rd, this.rd.scoutId, 'REMIX REPORT');
    } else {
      // the corner's notes: every hint your cornerman has given you against him (the handbook keeps them); UP / DOWN scrolls
      drawText(f, 'CORNER NOTES', 106, 8, COL.orange, { mono: false });
      const notes = (this.g.handbook || {})[d.scoutId || d.id] || [];
      const L = notes.length ? notes.flatMap((t, i) => [...(i ? [''] : []), ...layout(`"${t}"`, SCROLL_W)]) : layout('NOTHING YET. YOUR CORNER TALKS ABOUT HIM BETWEEN ROUNDS.', SCROLL_W);
      const rows = 17;
      this.noteMax = Math.max(0, L.length - rows);
      this.scroll = Math.min(this.scroll || 0, this.noteMax);
      L.slice(this.scroll, this.scroll + rows).forEach((l, i) => drawText(f, l, 106, 20 + i * 9, notes.length ? COL.off : COL.grey, { mono: false }));
      if (this.noteMax) drawText(f, this.scroll < this.noteMax ? MORE : '^', 242, 172, COL.grey, { mono: false });
    }
    panel(f, 4, 188, 248, 32);
    drawLabelCentered(f, `${this.sel + 1}/${this.ids.length}   LEFT/RIGHT: FIGHTER`, 128, 192, 240, COL.grey, { mono: false, where: 'gallery help' });
    drawLabelCentered(f, this.known ? `A: 4X VIEW  STAR: ${this.pageName(this.page)}  B: BACK` : 'B: BACK', 128, 204, 240, COL.grey, { mono: false, where: 'gallery help' });
  }
  // a scouting report: what you've found out about him, the rest still hidden
  // (+ an exploit, ! an anti-strategy to beware of; UP / DOWN scrolls a long one)
  renderScout(f, d, key, title) {
    const S = this.g.scouting || {}, sp = scoutProgress(S, d.id, d.remix ? d : null);
    const cnt = `${sp.got}/${sp.total}`, cw = textWidth(cnt, false);
    drawText(f, cnt, 248 - cw, 8, sp.got >= sp.total ? COL.green : COL.grey, { mono: false });
    drawLabel(f, textWidth(title, false) <= 142 - cw - 6 ? title : title.replace(' REPORT', ''), 106, 8, 142 - cw - 6, COL.green, { mono: false, where: 'scout title' });
    drawText(f, '+ EXPLOIT', 106, 18, COL.cyan, { mono: false });
    drawText(f, '! BEWARE', 114 + textWidth('+ EXPLOIT', false), 18, COL.pink, { mono: false });
    const L = [];
    for (const e of scoutEntries(d)) {
      const mk = e.kind === 'exploit' ? '+' : '!', col = e.kind === 'exploit' ? COL.cyan : COL.pink;
      if (!isScouted(S, key, e.key)) { L.push([mk, '??? UNDISCOVERED', col, COL.grey]); continue; }
      layout(e.e.name, SCROLL_W - 8).forEach((l, i) => L.push([i ? '' : mk, l, col, COL.white]));
      for (const l of layout(e.e.scout || '', SCROLL_W)) L.push(['', l, col, COL.off, true]);
      L.push(null);
    }
    const rows = 16;
    this.scoutMax = Math.max(0, L.length - rows);
    this.scroll = Math.min(this.scroll || 0, this.scoutMax);
    L.slice(this.scroll, this.scroll + rows).forEach((ln, i) => {
      if (!ln) return;
      const y = 30 + i * 9;
      if (ln[0]) drawText(f, ln[0], 106, y, ln[2], { mono: false });
      drawText(f, ln[1], ln[4] ? 106 : 114, y, ln[3], { mono: false });
    });
    if (this.scoutMax) drawText(f, this.scroll < this.scoutMax ? MORE : '^', 242, 172, COL.grey, { mono: false });
  }
}

// ---------------------------------------------------------------------------
export class SoundTestScreen {
  constructor(game) {
    this.g = game; this.t = 0; this.tab = 0; this.sel = [0, 0]; this.top = [0, 0]; this.playing = null; this.hits = new Hits();
    // every song and effect, the Ascension's zones once you've reached them (Phase F): their names would spoil the way ahead
    this.lists = [Object.keys(game.songs).filter((n) => !SONG_ZONE[n] || zoneSeen(game, SONG_ZONE[n])), SFX_NAMES];
  }
  enter() { this.g.audio.stop(); }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio, L = this.lists[this.tab], n = L.length;
    if (I.pressed('pause')) { A.stop(); this.g.go('map'); return; }
    // touch: the tabs switch list; a tap on a title chooses it, and on the one chosen plays it (B stops the music); a swipe scrolls
    for (const h of this.hits.take(I)) {
      if (h.id === 'tab0' || h.id === 'tab1') { const t = +h.id[3]; if (t !== this.tab) { this.tab = t; A.sfx('menu'); return; } continue; }
      if (h.id === 'stop') { A.stop(); this.playing = null; continue; }
      if (h.id === this.sel[this.tab]) I.fake('a'); else { this.sel[this.tab] = h.id; A.sfx('menu'); }
    }
    { const T = { top: this.top[this.tab], sel: this.sel[this.tab] }; if (scrollList(I, T, n, 14, { pitch: 10 })) { this.top[this.tab] = T.top; this.sel[this.tab] = T.sel; } }
    if (I.pressed('b')) { A.stop(); this.playing = null; return; }
    if (I.pressed('left') || I.pressed('right')) { this.tab ^= 1; A.sfx('menu'); return; }
    if (I.pressed('up')) this.sel[this.tab] = (this.sel[this.tab] + n - 1) % n;
    if (I.pressed('down')) this.sel[this.tab] = (this.sel[this.tab] + 1) % n;
    const s = this.sel[this.tab];
    if (s < this.top[this.tab]) this.top[this.tab] = s;
    if (s >= this.top[this.tab] + 14) this.top[this.tab] = s - 13;
    if (I.confirm() || I.pressed('star')) {
      const name = L[s];
      if (this.tab === 0) { A.play(this.g.songs[name]); this.playing = name; } else A.sfx(name);
    }
  }
  render(f) {
    backdrop(f, this.t);
    drawTextBig(f, 'SOUND TEST', 128, 6, COL.green, COL.black, 2);
    this.hits.clear();
    this.hits.add(0, 20, 256, 6, 'stop');
    ['MUSIC', 'SOUND FX'].forEach((t, i) => { const x = i ? 150 : 40; this.hits.add(x - 8, 22, textWidth(t) + 16, 18, `tab${i}`); if (i === this.tab) f.rect(x - 4, 26, textWidth(t) + 8, 11, COL.panelHi); drawText(f, t, x, 28, i === this.tab ? COL.white : COL.grey); });
    const L = this.lists[this.tab], s = this.sel[this.tab], top = this.top[this.tab];
    panel(f, 20, 42, 216, 150);
    L.slice(top, top + 14).forEach((name, k) => {
      const i = top + k, y = 47 + k * 10, on = i === s;
      this.hits.add(22, y - 2, 212, 10, i);
      if (on) f.rect(22, y - 2, 212, 10, COL.panelHi);
      drawText(f, `${String(i + 1).padStart(3, '0')} ${name.toUpperCase()}`, 30, y, on ? COL.white : name === this.playing ? COL.yellow : COL.off, { mono: false });
    });
    drawTextCentered(f, this.playing ? `NOW PLAYING: ${this.playing.toUpperCase()}` : `${L.length} ${this.tab ? 'SOUNDS' : 'SONGS'}`, 128, 198, COL.cyan, { mono: false });
    this.hits.add(40, 194, 176, 12, 'stop');
    drawTextCentered(f, 'A PLAY  B STOP  L/R TAB  P BACK', 128, 210, COL.grey, { mono: false });
  }
}

// ---------------------------------------------------------------------------
export class UnlocksScreen {
  // Pages (LEFT / RIGHT): the circuits' medal unlocks, the Ascension's (once you've reached it), the scouting rewards
  constructor(game) {
    this.g = game; this.t = 0; this.page = 0; this.scroll = 0; this.hits = new Hits();
    this.pages = ['base', ...(ascensionSeen(game) ? ['asc'] : []), 'scout'];
    this.fresh = freshUnlocks(game.medals); // what a medal crossed since you last looked (the shop shows NEW! over its counter until then)
  }
  enter() { this.g.audio.play(this.g.songs.modes); if (this.fresh.length) this.g.audio.sfx('unlock'); }
  update() {
    this.t++;
    const I = this.g.input, n = this.pages.length;
    // touch: the left or right of the screen turns the page, and so does a swipe; up and down scroll the scouting list
    for (const h of this.hits.take(I)) I.fake(h.x < h.w / 2 ? 'left' : 'right');
    const sx = swipeX(I, 34); if (sx) I.fake(sx > 0 ? 'right' : 'left');
    { const sy = swipe(I, 11); if (sy) this.scroll = Math.max(0, Math.min(this.scoutMax || 0, this.scroll + sy)); }
    if (I.pressed('left')) { this.page = (this.page + n - 1) % n; this.scroll = 0; this.g.audio.sfx('menu'); return; }
    if (I.pressed('right')) { this.page = (this.page + 1) % n; this.scroll = 0; this.g.audio.sfx('menu'); return; }
    if (this.pages[this.page] === 'scout') {
      if (I.pressed('up')) this.scroll = Math.max(0, this.scroll - 1);
      if (I.pressed('down')) this.scroll = Math.min(this.scoutMax || 0, this.scroll + 1);
    }
    if (I.back() || I.confirm()) { this.g.audio.sfx('menu'); this.g.go('map'); }
  }
  render(f) {
    backdrop(f, this.t);
    const p = this.pages[this.page];
    this.hits.clear(); this.hits.add(0, 0, 256, 224, 'page');
    if (p === 'scout') return this.renderScouting(f);
    const asc = p === 'asc', list = asc ? ASC_UNLOCKS : UNLOCKS, M = this.g.medals;
    drawTextBig(f, asc ? 'ASCENSION' : 'UNLOCKS', 128, 6, asc ? COL.cyan : GOLD, COL.black, 2);
    const n = asc ? ascMedalCount(M) : medalCount(M), have = new Set(unlockedList(M).map((u) => u.id));
    panel(f, 8, 26, 240, 180);
    list.forEach((u, i) => {
      const y = 31 + i * 11, ok = have.has(u.id), shown = !asc || zoneSeen(this.g, u.zone);
      drawText(f, String(u.at).padStart(3), 14, y, ok ? COL.yellow : COL.grey, { mono: false });
      drawLabel(f, shown ? u.name : '???', 38, y, 192, ok ? COL.white : COL.grey, { mono: false, where: 'unlock name' }); // (clear of the star)
      if (ok) f.blit(ICONS.star, 232, y - 1, UIPAL);
    });
    if (asc) {
      drawTextCentered(f, `OF THE ASCENSION'S ${ASC_MEDAL_TOTAL} MEDALS.`, 128, 130, COL.grey, { mono: false });
      drawTextCentered(f, 'GALLERY AND SOUND ENTRIES OPEN', 128, 142, COL.grey, { mono: false });
      drawTextCentered(f, 'WITH EACH ZONE YOU REACH.', 128, 152, COL.grey, { mono: false });
    }
    drawTextCentered(f, this.fresh.length && (this.t >> 4) & 1 ? `NEW! ${this.fresh[this.fresh.length - 1].short}` : `${n} ${asc ? 'ASCENSION ' : ''}MEDALS   L/R: PAGE`, 128, 211, this.fresh.length && (this.t >> 4) & 1 ? COL.yellow : COL.cyan, { mono: false });
  }
  // the scouting rewards (knowledge spec K5): scout every fighter in a circuit and its
  // EXPLOIT VIEW opens in Practice. Ascension circuits list once you've met someone in them; UP / DOWN scrolls.
  renderScouting(f) {
    drawTextBig(f, 'SCOUTING', 128, 6, COL.green, COL.black, 2);
    const S = this.g.scouting || {}, met = metOf(this.g);
    panel(f, 8, 26, 240, 180);
    drawText(f, 'SCOUT EVERY FIGHTER IN A CIRCUIT TO OPEN', 14, 31, COL.grey, { mono: false });
    drawText(f, 'ITS EXPLOIT VIEW IN PRACTICE.', 14, 41, COL.grey, { mono: false });
    const rows = SCOUT_CIRCUITS.filter((c) => zoneSeen(this.g, CIRCUITS[c].asc ? CIRCUITS[c].zone : 'base') && (!CIRCUITS[c].asc || CIRCUITS[c].fighters.some((id) => met.has(id))));
    const VIS = 13;
    this.scoutMax = Math.max(0, rows.length - VIS);
    this.scroll = Math.min(this.scroll, this.scoutMax);
    rows.slice(this.scroll, this.scroll + VIS).forEach((c, i) => {
      const y = 54 + i * 11, ok = circuitScouted(S, c);
      let got = 0, tot = 0;
      for (const id of CIRCUITS[c].fighters) { const p = scoutProgress(S, id); got += p.got; tot += p.total; }
      drawText(f, CIRCUITS[c].name.slice(0, 32), 14, y, ok ? COL.white : COL.off, { mono: false });
      drawText(f, `${got}/${tot}`, 200, y, ok ? COL.green : COL.grey, { mono: false });
      if (ok) f.blit(ICONS.star, 232, y - 1, UIPAL);
    });
    if (this.scoutMax) drawText(f, this.scroll < this.scoutMax ? 'v' : '^', 240, 196, COL.grey, { mono: false });
    drawTextCentered(f, `${rows.filter((c) => circuitScouted(S, c)).length}/${rows.length} SCOUTED   L/R: PAGE`, 128, 211, COL.cyan, { mono: false });
  }
}
