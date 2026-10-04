// The Opponent Handbook (the opponent index, open from the start, no medals needed): a page on every fighter that fills in as you
// learn about him. It opens on THE GRID: every fighter's picture in ranking order (a silhouette until you've met him); the arrows move
// the cursor, A opens his page. On a page:
//   PROFILE    his picture, card and bio (once you've met him)
//   HABITS     strengths (what he does to shut you down) and weaknesses (his exploits), each
//              shown once you've found it in a fight; the rest stay ???
//   CORNER     the notes your trainer has given you against him
// LEFT/RIGHT: the fighter before / after   STAR: page   UP/DOWN: scroll   B: back to the grid (B on the grid: out)
import { drawBlock, drawLabel, layout } from '../engine/textbox.js';
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { CIRCUITS, SHORT, ROMAN } from '../../data/circuits.js';
import { PORTRAITS } from '../../data/sprites/portraits.js';
import { paletteFor } from '../engine/spriteCache.js';
import { EVERYONE } from '../save/records.js';
import { scoutEntries } from '../fight/knowledge.js';
import { scoutProgress, isScouted } from '../save/scouting.js';
import { FighterGrid, silhouetteSprite } from './fighterGrid.js';
import { Hits, swipe, swipeX } from '../engine/hits.js';

const BG = c32(3, 3, 8), STRIPE = c32(4, 7, 12), BOX = c32(11, 22, 27), SIL = c32(6, 7, 10), GOLD = c32(30, 24, 6);
const PAGES = ['PROFILE', 'HABITS', 'CORNER NOTES'];
const nameOf = (d) => (d.rival ? `DASH MADDOX ${ROMAN[d.rival]}` : d.name);

export class HandbookScreen {
  constructor(game) {
    this.g = game; this.t = 0; this.sel = 0; this.page = 0; this.scroll = 0; this.mode = 'grid'; this.hits = new Hits();
    const met = new Set(game.records.met);
    this.grid = new FighterGrid(EVERYONE, (id) => met.has(id), 0, game);
    this.load();
  }
  enter() { this.g.audio.play(this.g.songs.modes); }
  load() {
    const id = EVERYONE[this.sel], d = FIGHTERS[id];
    this.id = id; this.d = d; this.known = new Set(this.g.records.met).has(id);
    const p = paletteFor(d.palette);
    this.pal = p.u32; this.portrait = PORTRAITS[id](p);
    this.sil = new Uint32Array(p.u32.length).fill(SIL); this.sil[0] = 0; // unmet: a silhouette
    this.scroll = 0;
  }
  updateGrid() {
    const r = this.grid.update(this.g.input, this.g.audio);
    if (r === 'back') { this.g.go('map'); return; }
    if (r === 'open') { this.g.audio.sfx('confirm'); this.sel = this.grid.sel; this.load(); this.mode = 'page'; this.page = 0; this.scroll = 0; }
  }
  update() {
    this.t++;
    if (this.mode === 'grid') { this.updateGrid(); return; }
    const I = this.g.input, A = this.g.audio, n = EVERYONE.length;
    // touch: the page names and the arrows are buttons; a sideways swipe changes fighter, up and down scroll
    for (const h of this.hits.take(I)) {
      if (h.id === 'prev') I.fake('left'); else if (h.id === 'next') I.fake('right');
      else if (h.id === 'back') I.fake('b');
      else if (this.known && typeof h.id === 'string' && h.id.startsWith('tab') && this.page !== +h.id[3]) { this.page = +h.id[3]; this.scroll = 0; A.sfx('menu'); }
    }
    const sx = swipeX(I, 34); if (sx) I.fake(sx > 0 ? 'right' : 'left');
    const sy = swipe(I, 9); if (sy) this.scroll = Math.max(0, Math.min(this.maxScroll || 0, this.scroll + sy));
    if (I.back()) { A.sfx('menu'); this.mode = 'grid'; this.grid.select(this.id); return; }
    if (I.pressed('star')) { this.page = (this.page + 1) % PAGES.length; this.scroll = 0; A.sfx('menu'); }
    if (I.pressed('up')) this.scroll = Math.max(0, this.scroll - 1);
    if (I.pressed('down')) this.scroll = Math.min(this.maxScroll || 0, this.scroll + 1);
    const d = I.pressed('left') ? -1 : I.pressed('right') ? 1 : 0;
    if (d) { this.sel = (this.sel + d + n) % n; A.sfx('menu'); this.load(); }
  }

  // The lines of the scrolling pages: [text, colour, x-indent] or null (a gap).
  habitLines() {
    const d = this.d, S = this.g.scouting || {}, L = [];
    const sect = (title, col, kind, none) => {
      L.push([title, col, 0]);
      const list = scoutEntries(d).filter((e) => e.kind === kind);
      if (!list.length) L.push([none, COL.grey, 8]);
      for (const e of list) {
        if (!isScouted(S, this.id, e.key)) { L.push(['??? NOT FOUND YET', COL.grey, 8]); continue; }
        layout(e.e.name, 226).forEach((l) => L.push([l, COL.white, 8]));
        layout(e.e.scout || '', 226).forEach((l) => L.push([l, COL.off, 8]));
      }
      L.push(null);
    };
    sect('WEAKNESSES', COL.cyan, 'exploit', 'NONE KNOWN. FIGHT SMART.');
    sect('STRENGTHS', COL.pink, 'anti', 'NO SPECIAL HABITS.');
    return L;
  }
  noteLines() {
    const N = (this.g.handbook || {})[this.id] || [], L = [];
    if (!N.length) return [['YOUR TRAINER HASN\'T', COL.grey, 0], ['SAID ANYTHING ABOUT HIM YET.', COL.grey, 0], ['WIN OR LOSE A ROUND AND', COL.grey, 0], ['LISTEN IN THE CORNER.', COL.grey, 0]];
    N.forEach((t) => { layout(`- ${t}`, 226).forEach((l, i) => L.push([l, COL.off, i ? 6 : 0])); L.push(null); });
    return L;
  }

  render(f) {
    if (this.mode === 'grid') return this.grid.render(f, this.t, 'HANDBOOK');
    f.clear(BG);
    for (let y = 0; y < 224; y += 8) f.rect(0, y + ((this.t >> 3) & 7), 256, 2, STRIPE);
    const d = this.d;
    drawTextBig(f, 'HANDBOOK', 128, 4, GOLD, COL.black, 2);
    panel(f, 4, 24, 248, 160);
    // page tabs
    this.hits.clear();
    PAGES.forEach((p, i) => { const x = 10 + [0, 70, 132][i]; this.hits.add(x - 4, 24, textWidth(p, false) + 8, 14, `tab${i}`); drawText(f, p, x, 28, i === this.page ? COL.yellow : COL.grey, { mono: false }); });
    // portrait (a silhouette until he's met)
    f.rect(9, 40, 66, 62, COL.white); f.rect(10, 41, 64, 60, BOX);
    f.blit(this.known ? this.portrait : silhouetteSprite(this.portrait), 10, 41, this.known ? this.pal : this.sil);
    const x = 82;
    if (!this.known) {
      drawText(f, '???', x, 48, COL.grey);
      drawText(f, 'NOT MET YET', x, 68, COL.grey, { mono: false });
      drawText(f, 'FACE HIM IN A FIGHT TO', x, 84, COL.grey, { mono: false });
      drawText(f, 'START HIS PAGE.', x, 93, COL.grey, { mono: false });
    } else {
      drawBlock(f, nameOf(d), x, 44, 166, 2, COL.white, { where: 'handbook name' });
      drawLabel(f, `"${d.nickname}"`, x, 64, 166, COL.yellow, { mono: false, where: 'handbook nickname' });
      drawLabel(f, SHORT[d.circuit] || '', x, 75, 166, COL.cyan, { mono: false, where: 'handbook circuit' });
      drawText(f, d.card.record, x, 86, COL.grey, { mono: false });
      drawText(f, `AGE ${d.card.age}  ${d.card.weight} LB`, x, 95, COL.grey, { mono: false });
    }
    // the page body below the portrait
    if (this.known) {
      const y0 = 110, rows = 8;
      let L;
      if (this.page === 0) {
        L = [];
        layout(d.gallery || '', 232).forEach((l) => L.push([l, COL.off, 0]));
        L.push(null);
        layout(`FROM: ${d.card.hometown}`, 232).forEach((l) => L.push([l, COL.grey, 0]));
        L.push(null);
        layout(`"${d.card.quote}"`, 232).forEach((l) => L.push([l, COL.white, 0]));
        const sp = scoutProgress(this.g.scouting || {}, this.id);
        if (sp.total) L.push(null, [`HABITS FOUND ${sp.got}/${sp.total}`, sp.got >= sp.total ? COL.green : COL.grey, 0]);
      } else L = this.page === 1 ? this.habitLines() : this.noteLines();
      this.maxScroll = Math.max(0, L.length - rows);
      this.scroll = Math.min(this.scroll, this.maxScroll);
      L.slice(this.scroll, this.scroll + rows).forEach((ln, i) => { if (ln) drawText(f, ln[0], 12 + ln[2], y0 + i * 9, ln[1], { mono: false }); });
      if (this.maxScroll) drawText(f, this.scroll < this.maxScroll ? 'v' : '^', 244, 172, COL.grey, { mono: false });
    } else this.maxScroll = 0;
    panel(f, 4, 188, 248, 32);
    this.hits.add(0, 186, 44, 38, 'prev'); this.hits.add(212, 186, 44, 38, 'next');
    drawText(f, '<', 10, 198, COL.cyan, { mono: false }); drawText(f, '>', 242, 198, COL.cyan, { mono: false });
    drawTextCentered(f, `${this.sel + 1}/${EVERYONE.length}   LEFT/RIGHT: FIGHTER`, 128, 192, COL.grey, { mono: false });
    drawTextCentered(f, 'STAR: PAGE  UP/DN: SCROLL  B: GRID', 128, 204, COL.grey, { mono: false });
  }
}
