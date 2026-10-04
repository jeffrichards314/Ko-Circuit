// Reflection (#72, spec §18 A6 and §21): he wears YOUR look and he dodges.
//   node tools/reflection-test.mjs
//   look    for every costume and 400 random profiles (skin, hair colour, trunks, gloves, shoes), the colours of his palette are the player's: skin, hair, gloves,
//           trunks, shoes, and under a costume its trim and its outline; the hair STYLE is geometry: every one of the six has its own sprite layers
//   dodges  a punch at his stance (idle, guard, a step back) finds only a slide to the side: no hit, no damage; his tells, his recoveries, his openings and a stun
//           still land (the `evasive` gimmick's `hittable` list)
import { FIGHTERS } from '../data/fighters/index.js';
import { reflectionPalette, reflectionLayersFor } from '../data/reflection.js';
import { playerPalettes, DEFAULT_PROFILE, normalizeProfile, SKINS, HAIR_COLORS, TRUNKS, GLOVES, SHOES, HAIR_STYLES } from '../data/customization.js';
import { COSTUMES } from '../data/costumes.js';
import { FIGHTER_LAYERS } from '../data/sprites/index.js';
import { fighterSprites } from '../src/engine/spriteCache.js';
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';

let checks = 0, fails = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; if (fails < 15) console.log('FAIL', m); } };

// --- the look -----------------------------------------------------------------------------------------------------------------------------------
let seed = 5;
const rnd = (n) => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };
const col = (pal, side, key) => { const S = pal[side]; return S.colors[S.index[key]].u32; };
const profiles = [];
for (let ci = 0; ci < COSTUMES.length; ci++) for (let k = 0; k < 8; k++) profiles.push({ ...DEFAULT_PROFILE, costume: ci, skin: rnd(SKINS.length), hairColor: rnd(HAIR_COLORS.length), trunks: rnd(TRUNKS.length), gloves: rnd(GLOVES.length), shoes: rnd(SHOES.length), hair: rnd(HAIR_STYLES.length) });
for (let i = 0; i < 280; i++) profiles.push({ ...DEFAULT_PROFILE, costume: rnd(COSTUMES.length), skin: rnd(SKINS.length), hairColor: rnd(HAIR_COLORS.length), trunks: rnd(TRUNKS.length), gloves: rnd(GLOVES.length), shoes: rnd(SHOES.length), hair: rnd(HAIR_STYLES.length) });
for (const raw of profiles) {
  const p = normalizeProfile(raw), me = playerPalettes(p).default, him = reflectionPalette(p), K = COSTUMES[p.costume], tag = `costume ${K.id}, profile ${JSON.stringify([p.skin, p.hairColor, p.trunks, p.gloves, p.shoes])}`;
  const same = (a, b, what) => ok(a === b, `${tag}: his ${what} is not yours`);
  for (const k of ['skinHi', 'skin', 'skinSh']) same(col(him, 'a', k), col(me, 'a', k), k);
  for (const [a, b] of [['hairHi', 'hairHi'], ['hair', 'hair']]) same(col(him, 'a', a), col(me, 'a', b), a);
  for (const k of ['gloveHi', 'glove', 'gloveDk']) same(col(him, 'a', k), col(me, 'a', k), k);
  for (const [a, b] of [['shHi', 'trunksHi'], ['sh', 'trunks'], ['shDk', 'trunksDk']]) same(col(him, 'b', a), col(me, 'a', b), `trunks (${a})`);
  for (const [a, b] of [['bootHi', 'shoeHi'], ['boot', 'shoe'], ['bootDk', 'shoeDk']]) same(col(him, 'b', a), col(me, 'b', b), `shoes (${a})`);
  if (K.outline) same(col(him, 'a', 'outline'), col(me, 'a', 'outline'), 'outline');
  if (K.trunks && K.accent) for (const [a, b] of [['trimHi', 'accentHi'], ['trim', 'accent'], ['trimSh', 'accentDk']]) same(col(him, 'b', a), col(me, 'b', b), `trim (${a})`);
}
for (const style of HAIR_STYLES) {
  const id = reflectionLayersFor({ ...DEFAULT_PROFILE, hair: HAIR_STYLES.indexOf(style) });
  ok(!!FIGHTER_LAYERS[id], `no sprite layers ${id}`);
  try { const bank = fighterSprites(id); for (const pose of ['idle1', 'idle2', 'jab', 'hitHigh', 'kd1', 'victory']) ok(bank.get(pose).w > 0, `${id}: pose ${pose} is empty`); } catch (e) { ok(false, `${id}: ${e.message}`); }
}

// --- the dodge ---------------------------------------------------------------------------------------------------------------------------------
const d = FIGHTERS.reflection;
const E = d.special.find((s) => s.type === 'evasive');
ok(!!E && E.hittable.includes('windup') && E.hittable.includes('recovery') && E.hittable.includes('open') && !E.hittable.includes('idle'), 'his evasive gimmick: hittable in his tells and openings, not in his stance');
const fresh = () => {
  const f = new Fight({ fighter: d, audio: null, input: null, opts: { rounds: 3, infiniteHealth: true } });
  const bot = new PerfectBot(f, { attack: false });
  for (let i = 0; i < 2000 && f.phase !== 'fight'; i++) { bot.think(); f.update(); }
  return { f, bot, O: f.opp };
};
{
  const { f, bot, O } = fresh();
  let punches = 0, hit = 0, slid = 0;
  for (let i = 0; i < 4000 && punches < 60; i++) {
    bot.think();
    // the player's own punch at his stance, whenever he stands in it
    if (['idle', 'block'].includes(O.state) && !O.armor && f.phase === 'fight') {
      const hp = O.health, r = O.onPlayerPunch({ side: 'a', high: false, star: false });
      punches++; if (r.result === 'hit') hit++; else slid++;
      ok(O.health === hp || r.result === 'hit', 'a punch he slid away from still took health');
    }
    f.update();
  }
  ok(punches >= 20 && hit === 0, `punches at his stance: ${punches} thrown, ${hit} landed (they should all find a slide)`);
}
{
  const { f, bot, O } = fresh();
  // his tell: counter him in the windup of a normal move
  let landed = 0, tried = 0;
  for (let i = 0; i < 6000 && tried < 10; i++) {
    bot.think();
    if (O.state === 'windup' && O.move && O.move.counterWindow && !O.armor && O.moveT >= O.move.counterWindow[0] && O.moveT <= O.move.counterWindow[1]) {
      const r = O.onPlayerPunch({ side: 'a', high: false, star: false }); tried++; if (r.result === 'hit') landed++;
      for (let k = 0; k < 40; k++) { bot.think(); f.update(); }
    }
    f.update();
  }
  ok(tried >= 5 && landed >= tried * 0.6, `a counter in his windup landed ${landed} of ${tried}`);
}
console.log(`reflection test: ${checks} checks, ${fails} failed`);
process.exit(fails ? 1 : 0);
