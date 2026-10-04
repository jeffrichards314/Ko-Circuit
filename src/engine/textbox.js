// The shared text system (spec §1 "Text boxes"): every block of words in the game goes through here, so no text can
// ever spill out of its box.
//
//   layout(str, w, mono)          word wrap to `w` pixels. A word wider than the box (a long name, a run of symbols) is
//                                 broken cleanly with a hyphen; '\n' forces a new line.
//   paginate(str, w, n, mono)     the same, cut into pages of `n` lines
//   TextBox                       a paged box: draws the current page and a blinking ▼ when there is more; next() turns
//                                 the page (the screen decides which button does it). Optional typewriter reveal.
//   drawBlock(f, str, x, y, w, n) a box that never pages (a bio board, a plaque): wraps, and draws at most n lines. If the
//                                 words need more, the last line ends in "..." and the overflow is logged for the text-fit
//                                 audit (tools/text-fit.mjs), which fails until the text or the box is fixed.
//   drawLabel(f, str, x, y, w)    one line that must fit `w` (a name, a menu item): mono if it fits, else the proportional
//                                 font, else it is clipped with "..." and logged the same way.
//   drawPassword(f, code, x, y, w) a password in groups of 4 (XXXX-XXXX-XXXX-XXX), as many groups a line as the box takes.
//
// Every box is logged in font.PROBE while the audit runs (font.js), so the audit can check the text drawn inside it.
import { drawText, textWidth, PROBE } from './font.js';

export const MORE = '▼';
export const LINE = 10; // the line pitch of a text box (7-pixel glyphs plus 3)

// Split one word that is wider than `w` into pieces that fit, each but the last ending in a hyphen.
function breakWord(word, w, mono) {
  // a word with its own hyphens breaks at them first (EIGHTEEN-WHEELER), and only a piece still too wide is cut
  if (word.includes('-') && word.length > 1) {
    const parts = word.split(/(?<=-)/);
    if (parts.length > 1) {
      const out = [];
      let cur = '';
      for (const p of parts) { const t = cur + p; if (cur && textWidth(t, mono) > w) { out.push(cur); cur = p; } else cur = t; }
      out.push(cur);
      return out.flatMap((p) => (textWidth(p, mono) > w ? cutWord(p, w, mono) : [p]));
    }
  }
  return cutWord(word, w, mono);
}
function cutWord(word, w, mono) {
  const out = [];
  let cur = '';
  for (const ch of word) {
    const t = cur + ch;
    if (cur && textWidth(t + '-', mono) > w) { out.push(cur + '-'); cur = ch; } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

export function layout(str, w, mono = false) {
  const lines = [];
  for (const para of String(str ?? '').toUpperCase().split('\n')) {
    let cur = '';
    for (const word0 of para.split(/\s+/).filter(Boolean)) {
      const words = textWidth(word0, mono) > w ? breakWord(word0, w, mono) : [word0];
      for (const word of words) {
        const t = cur ? cur + ' ' + word : word;
        if (textWidth(t, mono) <= w) cur = t;
        else { if (cur) lines.push(cur); cur = word; }
      }
    }
    lines.push(cur);
  }
  // (a trailing empty paragraph adds nothing)
  while (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

export function paginate(str, w, n, mono = false) {
  const L = layout(str, w, mono), pages = [];
  for (let i = 0; i < L.length; i += Math.max(1, n)) pages.push(L.slice(i, i + Math.max(1, n)));
  return pages.length ? pages : [['']];
}

const logBox = (x, y, w, h, kind) => { if (PROBE.on) PROBE.boxes.push({ x, y, w, h, kind }); };
export const logOver = (str, where) => { if (PROBE.on) PROBE.over.push({ s: String(str).toUpperCase(), where }); };

// A paged text box. opts: w (pixels), lines (per page), mono, lineH, speed (characters a frame for a typewriter
// reveal; 0 = all at once).
export class TextBox {
  constructor(str, { w, lines = 3, mono = false, lineH = LINE, speed = 0 } = {}) {
    this.str = String(str ?? '');
    this.w = w; this.n = lines; this.mono = mono; this.lineH = lineH; this.speed = speed;
    this.pages = paginate(this.str, w - textWidth(MORE, mono) - 1, lines, mono); // (room for the ▼ on the last line)
    this.page = 0; this.shown = speed ? 0 : Infinity; this.t = 0;
  }
  get more() { return this.page < this.pages.length - 1; }
  get lines() { return this.pages[this.page]; }
  get chars() { return this.lines.reduce((s, l) => s + l.length + 1, 0); }
  get typed() { return this.shown >= this.chars; }
  // the box's height for its line count
  get h() { return this.n * this.lineH; }
  update() { this.t++; if (this.speed && this.shown < this.chars) this.shown += this.speed; }
  // finish typing the page, then turn it; false once the last page is fully shown (the caller moves on)
  next() {
    if (!this.typed) { this.shown = Infinity; return true; }
    if (!this.more) return false;
    this.page++; this.shown = this.speed ? 0 : Infinity; return true;
  }
  draw(f, x, y, color, opts = {}) {
    logBox(x, y, this.w, this.h, 'textbox');
    let left = this.shown;
    this.lines.forEach((l, i) => {
      if (left <= 0) return;
      drawText(f, left >= l.length ? l : l.slice(0, Math.floor(left)), x, y + i * this.lineH, color, { mono: this.mono });
      left -= l.length + 1;
    });
    // the ▼ under the last line's end when there's another page (blinking), or `done` when the caller wants an end mark
    const blink = ((opts.t ?? this.t) >> 4) & 1;
    if (this.typed && (this.more || opts.endMark) && blink) {
      drawText(f, MORE, x + this.w - textWidth(MORE, this.mono), y + (this.n - 1) * this.lineH, opts.moreColor ?? color, { mono: this.mono });
    }
  }
}

// A block that never pages: at most `n` lines (see the header). Returns the number of lines drawn.
export function drawBlock(f, str, x, y, w, n, color, opts = {}) {
  const mono = !!opts.mono, lh = opts.lineH || LINE;
  logBox(x, y, w, n * lh, 'block');
  let L = layout(str, w, mono);
  if (L.length > n) {
    logOver(str, opts.where || 'block');
    L = L.slice(0, n);
    let last = L[n - 1];
    while (last && textWidth(last + '...', mono) > w) last = last.slice(0, -1);
    L[n - 1] = last.trimEnd() + '...';
  }
  const align = opts.align || 'left';
  L.forEach((l, i) => {
    const lw = textWidth(l, mono);
    const lx = align === 'center' ? Math.round(x + (w - lw) / 2) : align === 'right' ? x + w - lw : x;
    drawText(f, l, lx, y + i * lh, color, { mono });
  });
  return L.length;
}
// A fixed block typed out a character at a time (`shown` characters so far): the hand-drawn talk boxes of the Fall, the
// descent, the deal, the climb and the Void. It never pages, so words that need more than `n` lines are logged for
// the audit like drawBlock's (and the line is split in the script).
export function drawTyped(f, str, x, y, w, n, shown, color, opts = {}) {
  const mono = !!opts.mono, lh = opts.lineH || LINE;
  logBox(x, y, w, n * lh, 'typed');
  const L = layout(str, w, mono);
  if (L.length > n) logOver(str, opts.where || 'typed');
  let left = shown;
  if (PROBE.on) PROBE.typed.push({ s: String(str).toUpperCase(), shown, total: L.slice(0, n).reduce((a, l) => a + l.length + 1, 0) });
  L.slice(0, n).forEach((l, i) => { if (left > 0) drawText(f, left >= l.length ? l : l.slice(0, Math.floor(left)), x, y + i * lh, color, { mono }); left -= l.length + 1; });
}
// ---- the hand-drawn talk boxes (the hosted story scenes): TEXT-DRIVEN (2026-10-03). A line types out at TALK_CPF characters a frame; the scene
// holds until it is all there AND the player pushes to go on. A push while it is still typing finishes it (it never skips it); a line that
// goes on by itself (`auto`) does so only after it has fully shown plus a short reading delay (readFrames).
//   talkTick(S, text, w, pressed, { auto })   call once a frame while a line is open (S.lineT counts it); true when the scene should go on
//   talkReady(S, text, w)                     the line is fully typed (the ▼ / > can show)
export const TALK_CPF = 1.5;
export const talkNeed = (str, w, n = 5) => Math.ceil(layout(str, w).slice(0, n).reduce((s, l) => s + l.length + 1, 0) / TALK_CPF);
export const readFrames = (str) => 40 + Math.round(String(str).length * 1.7);
export const talkReady = (S, str, w, n = 5) => S.lineT >= talkNeed(str, w, n);
export function talkTick(S, str, w, pressed, { auto = false, n = 5 } = {}) {
  const need = talkNeed(str, w, n);
  S.lineT++;
  if (pressed && S.lineT > 6) {
    if (S.lineT < need) { S.lineT = need; return false; } // (the first push finishes the typing)
    return true;
  }
  return !!auto && S.lineT >= need + readFrames(str);
}

// how many lines a block would take (for boxes that size themselves to the text)
export const linesOf = (str, w, mono = false) => layout(str, w, mono).length;

// One line that must fit `w`. opts.align: 'left' | 'center' | 'right'; opts.mono: prefer mono (default true).
export function drawLabel(f, str, x, y, w, color, opts = {}) {
  let s = String(str ?? '').toUpperCase(), mono = opts.mono !== false;
  if (mono && textWidth(s, true) > w) mono = false;
  logBox(x, y, w, 7, 'label');
  if (textWidth(s, mono) > w) {
    logOver(s, opts.where || 'label');
    while (s && textWidth(s + '...', mono) > w) s = s.slice(0, -1);
    s = s.trimEnd() + '...';
  }
  const sw = textWidth(s, mono), align = opts.align || 'left';
  const lx = align === 'center' ? Math.round(x + (w - sw) / 2) : align === 'right' ? x + w - sw : x;
  drawText(f, s, lx, y, color, { mono, shadow: opts.shadow });
  return sw;
}
// the same, centred on cx (a w-wide box around it)
export const drawLabelCentered = (f, str, cx, y, w, color, opts = {}) => drawLabel(f, str, Math.round(cx - w / 2), y, w, color, { ...opts, align: 'center' });

// A password in groups of four (the slashed zero for 0), as many groups a line as fit in `w`; returns the lines used.
export function passwordGroups(code) { const g = []; for (let i = 0; i < code.length; i += 4) g.push(code.slice(i, i + 4)); return g; }
export function passwordLines(code, w, mono = true) {
  const groups = passwordGroups(code), lines = [];
  let cur = '';
  for (const g of groups) { const t = cur ? cur + '-' + g : g; if (textWidth(t, mono) <= w || !cur) cur = t; else { lines.push(cur); cur = g; } }
  if (cur) lines.push(cur);
  return lines;
}
export function drawPassword(f, code, x, y, w, color, opts = {}) {
  const show = opts.show || ((c) => c);
  const L = passwordLines(code, w, true), lh = opts.lineH || 12;
  logBox(x, y, w, L.length * lh, 'password');
  L.forEach((l, i) => {
    const lw = textWidth(l, true), lx = opts.align === 'left' ? x : Math.round(x + (w - lw) / 2);
    drawText(f, [...l].map((c) => (c === '-' ? c : show(c))).join(''), lx, y + i * lh, color);
  });
  return L.length;
}
