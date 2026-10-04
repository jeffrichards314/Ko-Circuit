// Password entry (§8), from the title screen. Type the code on the keyboard (0-9, A-Z,
// any case; Backspace deletes, Enter checks it, Ctrl/Cmd+V pastes), or use the pad /
// touch controls: arrows pick a character, A enters it, B deletes, START checks the code.
// While this screen is open the keyboard's letter and digit keys are text, not buttons
// (input.textMode); Enter and Esc still work as START and PAUSE.

import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered } from '../engine/font.js';
import { PASSWORD_CHARS, cleanPassword, PASSWORD_LENGTH, OLD_PASSWORD_LENGTHS, showChar } from '../save/password.js';
import { drawLabelCentered } from '../engine/textbox.js';
import { PROBE } from '../engine/font.js';

const PW_BOX = { x: 30, y: 36, w: 196 }, PW_GAP = 8;
import { careerFromPassword } from '../save/career.js';
import { Hits } from '../engine/hits.js';

// (PASTE: where the browser lets a page read the clipboard on a tap)
const CAN_PASTE = typeof navigator !== 'undefined' && !!(navigator.clipboard && navigator.clipboard.readText);
const KEYS = [...PASSWORD_CHARS, 'DEL', 'END', ...(CAN_PASTE ? ['PASTE'] : [])];
const COLS = 10;

export class PasswordScreen {
  constructor(game, args = {}) {
    this.g = game;
    this.back = args.back || 'title';
    this.code = '';
    this.sel = 0;
    this.t = 0;
    this.msg = null;
    this.msgT = 0;
    this.typed = [];
    this.hits = new Hits();
    this.onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') { this.typed.push('DEL'); e.preventDefault(); }
      else if (/^[0-9a-zA-Z]$/.test(e.key)) this.typed.push(e.key.toUpperCase());
    };
    this.onPaste = (e) => {
      const text = e.clipboardData ? e.clipboardData.getData('text') : '';
      this.typed.push({ paste: text }); e.preventDefault();
    };
  }
  enter() {
    this.g.audio.play(this.g.songs.map);
    this.g.input.textMode = true;
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('paste', this.onPaste);
  }
  exit() {
    this.g.input.textMode = false;
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('paste', this.onPaste);
  }
  // keyboard input queued since the last frame
  typing() {
    const A = this.g.audio;
    for (const k of this.typed.splice(0)) {
      if (k === 'DEL') { this.code = this.code.slice(0, -1); A.sfx('menu'); }
      else if (k.paste !== undefined) { const t = cleanPassword(k.paste).slice(0, PASSWORD_LENGTH); if (t) { this.code = t; this.sel = KEYS.length - 1; A.sfx('menu'); } }
      else if (this.code.length < PASSWORD_LENGTH) { this.code += k; A.sfx('menu'); }
    }
  }
  update() {
    this.t++;
    if (this.msgT > 0) this.msgT--;
    this.typing();
    const I = this.g.input, A = this.g.audio, n = KEYS.length;
    let s = this.sel;
    if (I.pressed('left')) s = (s + n - 1) % n;
    if (I.pressed('right')) s = (s + 1) % n;
    if (I.pressed('up')) s = s - COLS < 0 ? Math.min(n - 1, s + COLS * 3) : s - COLS;
    if (I.pressed('down')) s = s + COLS >= n ? s % COLS : s + COLS;
    // touch: a tap on a key presses it
    for (const h of this.hits.take(I)) { s = this.sel = h.id; I.fake('a'); }
    if (s !== this.sel) { this.sel = s; A.sfx('menu'); }
    if (I.pressed('pause')) { this.g.go(this.back); return; }
    if (I.pressed('b')) { this.code = this.code.slice(0, -1); A.sfx('menu'); return; }
    if (I.pressed('start') || (I.pressed('a') && KEYS[s] === 'END')) return this.check();
    if (I.pressed('a') && KEYS[s] === 'PASTE') { navigator.clipboard.readText().then((t) => this.typed.push({ paste: t })).catch(() => { this.msg = 'CANNOT PASTE HERE'; this.msgT = 90; }); return; }
    if (I.pressed('a') || I.pressed('star')) {
      if (KEYS[s] === 'DEL') { this.code = this.code.slice(0, -1); A.sfx('menu'); }
      else if (this.code.length < PASSWORD_LENGTH) {
        this.code += KEYS[s]; A.sfx('menu');
        if (this.code.length === PASSWORD_LENGTH) this.sel = KEYS.length - 1;
      }
    }
  }
  check() {
    // (a password makes a save of its own: nothing of the game that is open is mixed in. The slot is chosen next: src/screens/saves.js)
    const c = careerFromPassword(this.code, null);
    if (!c) { this.msg = 'WRONG PASSWORD'; this.msgT = 90; this.g.audio.sfx('heartOut'); return; }
    this.g.audio.sfx('star');
    this.g.go('saves', { mode: 'password', career: c, back: this.back === 'title' ? 'title' : 'map' });
  }
  render(f) {
    f.clear(COL.black);
    drawTextCentered(f, 'ENTER PASSWORD', 128, 20, COL.yellow);
    // the slots in groups of four, like the password is shown (XXXX-XXXX-XXXX-XXX): as many groups a line as the box
    // takes, the rest on the next line
    const groups = Math.ceil(PASSWORD_LENGTH / 4), perLine = Math.max(1, Math.floor((PW_BOX.w - 16 + PW_GAP) / (4 * 12 + PW_GAP)));
    const rows = Math.ceil(groups / perLine);
    panel(f, PW_BOX.x, PW_BOX.y, PW_BOX.w, 12 + rows * 14);
    if (PROBE.on) PROBE.boxes.push({ x: PW_BOX.x, y: PW_BOX.y, w: PW_BOX.w, h: 12 + rows * 14, kind: 'password' });
    for (let i = 0; i < PASSWORD_LENGTH; i++) {
      const g = Math.floor(i / 4), row = Math.floor(g / perLine), col = g % perLine;
      const inRow = Math.min(perLine, groups - row * perLine), rowW = inRow * 48 + (inRow - 1) * PW_GAP;
      const x = Math.round(128 - rowW / 2) + col * (48 + PW_GAP) + (i % 4) * 12 + 2, y = PW_BOX.y + 7 + row * 14;
      const ch = this.code[i];
      if (i % 4 === 3 && i < PASSWORD_LENGTH - 1 && col < inRow - 1) f.rect(x + 9, y + 3, PW_GAP - 3, 1, COL.grey); // the dash between groups
      if (ch) drawText(f, showChar(ch), x, y, COL.white);
      else f.rect(x, y + 7, 7, 1, i === this.code.length && (this.t >> 4) & 1 ? COL.yellow : COL.grey);
    }
    panel(f, 24, 80, 208, KEYS.includes('PASTE') ? 90 : 80);
    this.hits.clear();
    KEYS.forEach((k, i) => {
      const x = k === 'PASTE' ? 108 : 36 + (i % COLS) * 19 + (k === 'END' ? 20 : 0), y = 90 + (k === 'PASTE' ? 4 : Math.floor(i / COLS)) * 16;
      this.hits.add(x - 4, y - 4, k.length > 1 ? 32 + (k === 'PASTE' ? 12 : 0) : 19, 16, i);
      const on = i === this.sel;
      if (on) f.rect(x - 3, y - 3, k === 'PASTE' ? 44 : k.length > 1 ? 30 : 13, 13, COL.panelHi);
      drawText(f, showChar(k), x, y, on ? COL.white : COL.grey, { mono: false });
    });
    if (this.msgT > 0) drawLabelCentered(f, this.msg, 128, 172, 240, (this.t >> 3) & 1 ? COL.red : COL.white, { where: 'password message' });
    drawLabelCentered(f, `OLD ${OLD_PASSWORD_LENGTHS.slice(0, -1).join(', ')} AND ${OLD_PASSWORD_LENGTHS[OLD_PASSWORD_LENGTHS.length - 1]}-LETTER CODES TOO`, 128, 184, 244, COL.dark || COL.grey, { mono: false, where: 'password help' });
    drawLabelCentered(f, 'TYPE OR PASTE. ENTER: OK', 128, 196, 244, COL.grey, { mono: false, where: 'password help' });
    drawLabelCentered(f, this.back === 'title' ? 'BKSP: DELETE  ESC: BACK TO TITLE' : 'BKSP: DELETE  ESC: BACK', 128, 208, 244, COL.grey, { mono: false, where: 'password help' });
  }
}
