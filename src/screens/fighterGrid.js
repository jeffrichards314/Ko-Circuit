// A grid of fighters' pictures (spec §19 G11), shared by the opponent index and Practice: every fighter in ranking order, five across
// and three rows on the screen, a silhouette for one you have not met. The arrows move the cursor (the grid scrolls by rows), the
// one under it is named below.
//   const G = new FighterGrid(ids, (id) => met, sel, game, tag)   G.update(input, audio) -> 'open' | 'back' | null     G.render(f, t, title, colour, hint)
// `tag(id)` (optional) is a short gold word on the corner of a met fighter's picture: Practice marks the ones whose Title Defense version you have reached.
// Two badges on a met fighter's picture: a gold CROWN for a boss (everyone who appears in Title Defense: the champions), and a gold
// STAR for one you have MAXED (every strength and weakness of his found, and all three of his medals won).
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth } from '../engine/font.js';
import { drawLabelCentered } from '../engine/textbox.js';
import { c32 } from '../engine/palette.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { SHORT, ROMAN } from '../../data/circuits.js';
import { PORTRAITS } from '../../data/sprites/portraits.js';
import { paletteFor } from '../engine/spriteCache.js';
import { scoutProgress } from '../save/scouting.js';
import { medalsOf } from '../save/medals.js';
import { Hits, swipe } from '../engine/hits.js';

// a boss: a champion who defends his belt in Title Defense
export const isBoss = (id) => !!(FIGHTERS[id] && FIGHTERS[id].titleDefense);
// maxed: every habit scouted and all three medals won
export function isMaxed(g, id) {
  if (!g) return false;
  const sp = scoutProgress(g.scouting || {}, id), m = medalsOf(g.medals || { got: {} }, id);
  return sp.got >= sp.total && !!(m.speed && m.flawless && m.signature);
}
const INK = c32(2, 2, 4);
function crown(f, x, y) { f.rect(x - 1, y + 2, 11, 6, INK); for (const dx of [-1, 4, 9]) f.rect(x + dx, y - 1, 3, 4, INK); f.rect(x, y + 3, 9, 4, GOLD); for (const dx of [0, 4, 8]) f.rect(x + dx, y, 1, 3, GOLD); f.rect(x, y + 6, 9, 1, c32(19, 12, 2)); f.px(x + 4, y + 4, c32(28, 6, 7)); }
function star(f, x, y, t) { const c = (t >> 4) & 1 ? c32(31, 31, 20) : GOLD; f.rect(x - 1, y + 2, 11, 5, INK); f.rect(x + 3, y - 2, 3, 13, INK); f.rect(x, y + 3, 9, 3, c); f.rect(x + 4, y - 1, 1, 11, c); f.rect(x + 2, y + 1, 5, 7, c); f.px(x + 4, y + 4, c32(31, 31, 31)); }

const BG = c32(3, 3, 8), STRIPE = c32(4, 7, 12), BOX = c32(11, 22, 27), SIL = c32(6, 7, 10), GOLD = c32(30, 24, 6);
export const GC = 5, GR = 3;
const CW = 48, CH = 50, PW = 44, PH = 42, GX = 8, GY = 28, K = 0.69; // cell, picture, top left, picture scale
const nameOf = (d) => (d.rival ? `DASH MADDOX ${ROMAN[d.rival]}` : d.name);

export class FighterGrid {
  constructor(ids, known, sel = 0, game = null, tag = null) {
    this.tag = tag;
    this.hits = new Hits();
    this.ids = ids; this.known = known; this.g = game; this.sel = Math.max(0, Math.min(ids.length - 1, sel)); this.top = 0; this.thumbs = new Map();
    this.scrollTo();
  }
  get id() { return this.ids[this.sel]; }
  select(id) { const i = this.ids.indexOf(id); if (i >= 0) { this.sel = i; this.scrollTo(); } }
  scrollTo() { const row = Math.floor(this.sel / GC); if (row < this.top) this.top = row; if (row >= this.top + GR) this.top = row - GR + 1; }
  thumb(id) {
    if (!this.thumbs.has(id)) { const p = paletteFor(FIGHTERS[id].palette), sil = new Uint32Array(p.u32.length).fill(SIL); sil[0] = 0; this.thumbs.set(id, { s: (PORTRAITS[id] || PORTRAITS.barney)(p), pal: p.u32, sil }); }
    return this.thumbs.get(id);
  }
  update(I, A) {
    if (I.back()) { A.sfx('menu'); return 'back'; }
    const n = this.ids.length;
    // touch: a tap on a picture moves the cursor to it, and a tap on the one under it opens it; a swipe scrolls the rows
    for (const h of this.hits.take(I)) { if (h.id === this.sel) I.fake('a'); else { this.sel = h.id; A.sfx('menu'); } }
    const sw = swipe(I, 26);
    if (sw) { this.sel = Math.max(0, Math.min(n - 1, this.sel + sw * GC)); A.sfx('menu'); }
    let d = 0;
    if (I.pressed('left')) d = -1; if (I.pressed('right')) d = 1; if (I.pressed('up')) d = -GC; if (I.pressed('down')) d = GC;
    if (d) { const to = this.sel + d; if (to >= 0 && to < n) { this.sel = to; A.sfx('menu'); } else if (d > 0 && Math.floor(this.sel / GC) < Math.floor((n - 1) / GC)) { this.sel = n - 1; A.sfx('menu'); } }
    this.scrollTo();
    if (I.confirm()) return 'open';
    return null;
  }
  render(f, t, title, colour = GOLD, hint = 'A: OPEN   B: BACK') {
    f.clear(BG);
    for (let y = 0; y < 224; y += 8) f.rect(0, y + ((t >> 3) & 7), 256, 2, STRIPE);
    drawTextBig(f, title, 128, 4, colour, COL.black, 2);
    const n = this.ids.length;
    this.hits.clear();
    for (let r = 0; r < GR; r++) for (let col = 0; col < GC; col++) {
      const i = (this.top + r) * GC + col; if (i >= n) continue;
      const id = this.ids[i], T = this.thumb(id), x = GX + col * CW, y = GY + r * CH, sel = i === this.sel, known = this.known(id);
      this.hits.add(x - 2, y - 2, CW - 2, CH - 4, i);
      f.rect(x - 1, y - 1, PW + 2, PH + 2, sel ? ((t >> 3) & 1 ? COL.yellow : GOLD) : COL.dark);
      if (sel) f.rect(x - 2, y - 2, PW + 4, PH + 4, (t >> 3) & 1 ? GOLD : COL.yellow), f.rect(x - 1, y - 1, PW + 2, PH + 2, (t >> 3) & 1 ? COL.yellow : GOLD);
      f.rect(x, y, PW, PH, BOX);
      f.blit(T.s, x, y, known ? T.pal : T.sil, { scale: K });
      if (known && isBoss(id)) crown(f, x + 1, y + 1);
      if (known && isMaxed(this.g, id)) star(f, x + PW - 10, y + 1, t);
      const tg = known && this.tag && this.tag(id);
      if (tg) { const w = textWidth(tg, false) + 3; f.rect(x + PW - w - 1, y + PH - 9, w + 1, 9, INK); drawText(f, tg, x + PW - w + 1, y + PH - 8, GOLD, { mono: false }); }
    }
    // where you are in the list
    const rows = Math.ceil(n / GC), track = GR * CH - 6, barH = Math.max(8, Math.round((GR / Math.max(GR, rows)) * track));
    f.rect(249, GY, 3, track, COL.dark); f.rect(249, GY + Math.round((this.top / Math.max(1, rows - GR)) * (track - barH)), 3, barH, COL.grey);
    panel(f, 4, 182, 248, 38);
    const id = this.id, d = FIGHTERS[id], known = this.known(id);
    // his name between the BOSS and MAX tags (the whole row when he has neither); the nickname and circuit under it,
    // the circuit left off when both won't fit
    const tags = known && (isBoss(id) || isMaxed(this.g, id));
    drawLabelCentered(f, known ? nameOf(d) : '???', 128, 186, tags ? 150 : 240, known ? COL.white : COL.grey, { mono: false, where: 'grid name' });
    const nk = known ? (textWidth(`"${d.nickname}"  ${SHORT[d.circuit] || ''}`, false) <= 240 ? `"${d.nickname}"  ${SHORT[d.circuit] || ''}` : `"${d.nickname}"`) : 'NOT MET YET';
    drawLabelCentered(f, nk, 128, 196, 240, known ? COL.yellow : COL.grey, { mono: false, where: 'grid nickname' });
    if (known && isBoss(id)) { crown(f, 10, 186); drawText(f, 'BOSS', 22, 187, GOLD, { mono: false }); }
    if (known && isMaxed(this.g, id)) { star(f, 212, 186, t); drawText(f, 'MAX', 224, 187, GOLD, { mono: false }); }
    drawTextCentered(f, hint, 128, 207, COL.grey, { mono: false });
    void drawText;
  }
}
