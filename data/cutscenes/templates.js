// Scene templates (spec §19 G1): a template turns a few parameters into a scene's layers, actors and script,
// so a family of scenes (thirty-three arrivals, thirty-three ceremonies, the champions' entrances) is data.
import { CIRCUITS } from '../circuits.js';
import { ARENAS } from '../arenas/index.js';
import { FIGHTERS } from '../fighters/index.js';
import { RIVAL_SCENES } from '../fighters/rival/scenes.js';
import { fighterSprites } from '../../src/engine/spriteCache.js';
import { LOOKS, midLayer } from './looks.js';

// ---- places -------------------------------------------------------------------------------------------
// The ground a scene stands in: 'road' (the jogging road), 'sky' (a marble terrace over the clouds), 'river' (the black
// water of the Underworld) and 'void' (the sea of nothing). Each returns backdrop layers for a landmark at world x = lmX.
const lmBase = { road: 148, sky: 152, river: 130, void: 150 };

function place(env, p, lmX) {
  const L = [];
  const lm = { p: 'landmark', id: p.landmark, x: lmX, base: p.lmBase ?? lmBase[env], k: p.lmK || 3 };
  if (env === 'road') {
    L.push({ p: 'sky', tone: p.tone || 'dusk', stars: /night|nightmare/.test(p.tone || '') ? true : !!p.stars });
    if (p.sun) L.push({ p: 'sun', x: p.sun[0], y: p.sun[1], r: p.sun[2] || 18 });
    if (p.moon) L.push({ p: 'moon', x: p.moon[0], y: p.moon[1] });
    // the road matches where the circuit stands on the map (looks.js); a scene's own colours win
    const look = LOOKS[p.circuit] || {};
    L.push({ p: 'hills', color: p.far || look.far || [12, 8, 20], par: 0.15, top: 96, base: 132, amp: look.verge === 'rock' ? 12 : 6 });
    const mid = look.mid || p.mid;
    if (mid === 'city') L.push({ p: 'city', color: p.midColor || [8, 8, 15], lite: [29, 25, 12], par: 0.4, base: 132, minH: 18, maxH: 56 });
    else { const ml = mid ? midLayer({ ...look, mid }, 132, 0.5) : null; if (ml) L.push(ml); }
    L.push({ p: 'hills', color: p.near || look.near || [7, 8, 14], par: 0.3, top: 116, base: 134, amp: 3, seed: 2 });
    L.push(lm);
    L.push({ p: 'ground', kind: p.ground || 'road', verge: look.verge, y: 128 });
  } else if (env === 'sky') {
    L.push({ p: 'sky', tone: p.tone || 'heaven', stars: !!p.stars, h: 156 });
    if (p.sun) L.push({ p: 'sun', x: p.sun[0], y: p.sun[1], r: p.sun[2] || 18 });
    L.push({ p: 'hills', color: p.cloud || [29, 26, 27], par: 0.12, top: 118, base: 160, amp: 5, scale: 0.02 });
    L.push({ p: 'hills', color: p.cloud2 || [25, 22, 27], par: 0.25, top: 132, base: 160, amp: 4, scale: 0.035, seed: 3 });
    L.push(lm);
    L.push({ p: 'ground', kind: 'marble', y: p.groundY || 150, tone: p.groundTone });
  } else if (env === 'river') {
    L.push({ p: 'sky', tone: p.tone || 'river' });
    L.push({ p: 'hills', color: [1, 1, 3], par: 0.2, top: 100, base: 128, amp: 8 });
    L.push(lm);
    L.push({ p: 'water', y: 126, tone: 'river' });
    L.push({ p: 'fog', y: 122, h: 30 });
  } else {
    L.push({ p: 'sky', tone: p.tone || 'void' }, { p: 'stars', n: 70, par: 0.08 });
    L.push(lm);
    L.push({ p: 'water', y: 150, tone: 'void' });
  }
  for (const a of p.amb || []) L.push({ ...a });
  return L;
}

// ---- ARRIVAL -------------------------------------------------------------------------------------------
// The establishing shot of the arena's exterior, a pan back along the way, the player arriving (jogging with the
// trainer on the road, climbing the terrace, poled in the Ferryman's boat), one line, and the circuit's title card.
function arrival(p) {
  const c = CIRCUITS[p.circuit], env = p.env || 'road';
  const parts = c.name.split(': '), title = parts[0], sub = parts[1] || (ARENAS[c.arena] ? ARENAS[c.arena].name : '');
  const lmX = 512, camEnd = 384;
  const layers = place(env, p, lmX);
  const actors = {}, moves = [];
  const speaker = p.who || (env === 'river' || env === 'void' ? 'corner' : 'trainer');
  if (env === 'road') {
    actors.bike = { kind: 'bike', x: -40, y: 172, anim: 'jog', z: 172 };
    actors.you = { kind: 'player', x: -10, y: 192, anim: 'jog', z: 192 };
    moves.push({ do: 'move', actor: 'you', to: [camEnd + 92, 192], frames: 360, end: '', async: true }, { do: 'move', actor: 'bike', to: [camEnd + 132, 172], frames: 360, end: '', async: true });
  } else if (env === 'sky') {
    actors.you = { kind: 'player', x: -10, y: 200, anim: 'jog', z: 200 };
    moves.push({ do: 'move', actor: 'you', to: [camEnd + 100, 200], frames: 360, end: '', async: true });
  } else {
    // in the boat: the boat, the Ferryman at the stern and you in front of him
    actors.boat = { kind: 'boat', x: -20, y: 178, z: 178 };
    actors.you = { kind: 'playerBack', x: -32, y: 180, anim: 'idle', z: 180 };
    actors.ferry = { kind: 'ferryman', x: 8, y: 182, z: 181 };
    for (const [id, dx] of [['boat', 0], ['you', -12], ['ferry', 28]]) moves.push({ do: 'move', actor: id, to: [camEnd + 118 + dx, id === 'boat' ? 178 : id === 'you' ? 180 : 182], frames: 360, ease: 'linear', async: true });
  }
  const script = [
    { do: 'cam', x: camEnd },
    { do: 'fade', to: 0, frames: 50 },
    { do: 'wait', frames: 70 },                                      // the establishing shot
    { do: 'pan', to: [0, 0], frames: 100 },
    ...moves,
    { do: 'follow', actor: 'you', at: 92, frames: 360, max: camEnd },
    { do: 'wait', frames: 20 },
    { do: 'say', who: speaker, text: p.line, auto: 320 },
    { do: 'card', title, sub, frames: 170, gold: true },
    { do: 'fade', to: 1, frames: 40 },
  ];
  if (env !== 'road' && env !== 'sky') {
    // (the boat does not stop: it drifts on under the words)
  }
  return { music: p.music || 'jog', world: [camEnd + 256, 224], layers, actors, script, cornerZone: p.zone };
}

// ---- VICTORY -------------------------------------------------------------------------------------------
// The belt ceremony, three shots: the arena with the beaten champion and his parting line; a wide shot of the circuit's
// landmark under its sky, the player on the podium and the belt coming down; the classic belt card (§5) in the circuit's colours.
function victory(p) {
  const c = CIRCUITS[p.circuit], champ = p.champion || c.fighters[c.fighters.length - 1];
  const host = p.host || 'announcer';
  const hostLine = p.announce || (host === 'ferryman' ? 'THE RIVER YIELDS. THE BELT IS YOURS, AND THE SHORE.' : 'LADIES AND GENTLEMEN! YOUR NEW {circuit} CHAMPION: {name}!');
  const layers = [
    { p: 'arena', id: c.arena, group: 'A', dim: p.dimA ?? 0.12 },
    { p: 'vignette', group: 'A', k: 0.35 },
    { p: 'sky', tone: p.tone || 'dusk', group: 'B', on: false, stars: /night|nightmare|void/.test(p.tone || '') },
    { p: 'hills', color: p.far || [12, 8, 20], par: 0, top: 108, base: 160, group: 'B', on: false },
    { p: 'landmark', id: p.landmark, x: 128, base: 176, k: p.lmK || 3, group: 'B', on: false, dim: 0 },
    { p: 'ground', kind: p.ground || 'canvas', y: 176, group: 'B', on: false },
    { p: 'podium', y: 196, gold: true, group: 'B', on: false },
    ...(p.fxB || [{ p: 'confetti', n: 60 }]).map((l) => ({ ...l, group: 'B', on: false, fg: true })),
    { p: 'ceremony', group: 'C', on: false, tint: p.tint, confetti: p.confetti, press: true },
  ];
  const actors = {
    champ: { kind: 'fighter', id: champ, x: 128, y: p.champY ?? 150, anim: 'hit', group: 'A', scale: p.champScale },
    you: { kind: 'playerBack', x: 128, y: 200, pose: 'victory', group: 'B', vis: false },
    belt: { kind: 'prop', shape: 'belt', id: p.circuit, x: 128, y: -40, scale: 0.55, group: 'B', vis: false },
  };
  const script = [
    { do: 'fade', to: 0, frames: 30 },
    { do: 'sfx', name: 'crowd' },
    { do: 'wait', frames: 30 },
    { do: 'say', who: champ, text: p.line, auto: 300 },
    { do: 'say', who: host === 'ferryman' ? 'ferryman' : 'announcer', text: hostLine, auto: 200 },
    { do: 'flash', frames: 10 },
    { do: 'hide', layer: 'A' }, { do: 'hide', group: 'A' }, { do: 'show', layer: 'B' }, { do: 'show', group: 'B' },
    { do: 'sfx', name: 'crowd' },
    { do: 'move', actor: 'belt', to: [128, 122], frames: 80, async: true },
    { do: 'wait', frames: 170 },
    { do: 'flash', frames: 10 },
    { do: 'hide', layer: 'B' }, { do: 'hide', group: 'B' }, { do: 'show', layer: 'C' },
    { do: 'sfx', name: 'fanfare' },
    { do: 'press', frames: 90 },
    { do: 'fade', to: 1, frames: 24 },
  ];
  return { music: 'belt', world: [W_, 224], layers, actors, script, circuit: p.circuit };
}
const W_ = 256;

// ---- ENTRANCE ------------------------------------------------------------------------------------------
// A circuit champion's walk-out: he comes out of his corner to the middle of the ring, strikes his pose, and the announcer
// introduces him (spec §19 G3). The intro card follows.
function entrance(p) {
  const d = FIGHTERS[p.fighter], c = CIRCUITS[d.circuit];
  const bank = fighterSprites(d.spriteLayers), h = bank.get('idle1').h, scale = h > 122 ? Math.round((118 / h) * 20) / 20 : 1;
  const weight = d.card.weight ? `${d.card.weight} POUNDS` : '';
  const auto = `FROM ${d.card.hometown}${weight ? `, WEIGHING ${weight}` : ''}, ${d.card.record}... "${d.nickname}" ${d.name}!`;
  const title = c.name.split(': ')[0];
  const layers = [
    { p: 'arena', id: c.arena, group: 'A', dim: 0.85 },
    { p: 'vignette', k: 0.4 },
    { p: 'spot', x: 128, color: [10, 11, 18], w0: 26, spread: 0.25, y: 0, h: 176 },
  ];
  const actors = { champ: { kind: 'fighter', id: p.fighter, x: 236, y: 150, anim: 'walk', scale: scale !== 1 ? scale : undefined, flip: true } };
  const script = [
    { do: 'fade', to: 0, frames: 24 },
    { do: 'tween', layer: 'A', to: { dim: 0.1 }, frames: 90, async: true },
    { do: 'sfx', name: 'crowd' },
    { do: 'say', who: 'announcer', text: p.open || `THE ${title} TITLE IS ON THE LINE, AND HERE COMES THE CHAMPION!`, auto: 110 },
    { do: 'move', actor: 'champ', to: [128, 150], frames: 120, anim: 'walk', end: 'idle', flip: true },
    { do: 'set', actor: 'champ', values: { flip: false } },
    { do: 'anim', actor: 'champ', anim: 'taunt' },
    { do: 'sfx', name: 'crowd' },
    { do: 'say', who: 'announcer', text: p.intro || auto, auto: 150 },
    { do: 'flash', frames: 6 },
    { do: 'wait', frames: 26 },
    { do: 'fade', to: 1, frames: 20 },
  ];
  return { music: d.music, world: [W_, 224], layers, actors, script, circuit: d.circuit, tokens: {} };
}

// ---- JOG -----------------------------------------------------------------------------------------------
// The road between circuits: the player runs, the trainer rides alongside and talks (spec §5). The world scrolls under them.
function jog(p) {
  const lines = [...(p.lines || []), '{signoff}'];
  // the road looks like where it is going (looks.js): the City's towers, the Highlands' pines on rock, the Pantheon's marble over the clouds
  const look = LOOKS[p.to] || { verge: 'grass', mid: 'city' };
  const layers = look.env === 'sky' ? [
    { p: 'sky', tone: 'heaven', h: 156 }, { p: 'sun', x: 190, y: 96, r: 18, par: 0.02 },
    { p: 'hills', color: [29, 26, 27], par: 0.12, top: 118, base: 160, amp: 5, scale: 0.02 },
    { p: 'hills', color: [25, 22, 27], par: 0.25, top: 132, base: 160, amp: 4, scale: 0.035, seed: 3 },
    { p: 'ground', kind: 'marble', y: 150 },
    { p: 'label', text: p.label || 'ON THE ROAD', x: 8, y: 212 },
  ] : [
    { p: 'sky', tone: look.tone || 'dusk', h: 128 }, { p: 'sun', x: 190, y: 112, r: 18, par: 0.02 },
    { p: 'hills', color: look.far || [12, 8, 20], par: 0.2, top: 100, base: 132, amp: look.verge === 'rock' ? 12 : 6 },
    midLayer(look, 130, 0.6),
    { p: 'hills', color: look.near || [7, 8, 14], par: 0.3, top: 118, base: 132, amp: 3, seed: 2 },
    { p: 'ground', kind: 'road', verge: look.verge, y: 128 }, { p: 'poles', par: 2 / 2 },
    { p: 'label', text: p.label || 'ON THE ROAD', x: 8, y: 212 },
  ].filter(Boolean);
  const actors = { bike: { kind: 'bike', x: 166, y: 172, anim: 'jog', par: 0, bobAmp: 0, z: 172 }, you: { kind: 'player', x: 104, y: 192, anim: 'jog', par: 0, z: 192 } };
  // (the road scrolls steadily for as long as the words take: it is a drift, not a timed pan that could run out under the last line)
  const script = [{ do: 'fade', to: 0, frames: 24 }, { do: 'drift', vx: 2 },
    ...lines.map((text) => ({ do: 'say', who: 'trainer', text, top: true, auto: 200 })), { do: 'fade', to: 1, frames: 20 }, { do: 'drift', vx: 0 }];
  return { music: 'jog', world: [1e6, 224], layers, actors, script, circuit: p.to };
}

// ---- FERRY ---------------------------------------------------------------------------------------------
// The ride between circuits below the sky: the Ferryman poles the boat across black water (or over nothing, in the Void).
function ferry(p) {
  const lines = p.lines || [], vd = p.void;
  const layers = vd
    ? [{ p: 'sky', tone: 'void' }, { p: 'stars', n: 60, par: 0.05 }, { p: 'water', y: 126, tone: 'void', par: 1 }]
    : [{ p: 'sky', tone: 'river' }, { p: 'hills', color: [1, 1, 3], par: 0.3, top: 96, base: 128, amp: 8 }, { p: 'water', y: 126, tone: 'river', par: 1 }, { p: 'fog', y: 122, h: 30 }];
  layers.push({ p: 'vignette', k: 0.5, from: 0.6 }, { p: 'label', text: p.label || 'THE RIVER GOES ON', x: 8, y: 212 });
  const actors = { boat: { kind: 'boat', x: 116, y: 172, par: 0, bobAmp: 2, bobRate: 50, z: 172 }, you: { kind: 'playerBack', x: 104, y: 174, pose: 'idle1', par: 0, bobAmp: 2, bobRate: 50, z: 174 }, ferry: { kind: 'ferryman', x: 144, y: 176, par: 0, bobAmp: 2, bobRate: 50, z: 176 } };
  const script = [{ do: 'fade', to: 0, frames: 24 }, { do: 'sfx', name: 'oarDip' }, { do: 'drift', vx: 1.2 },
    ...lines.map((text) => ({ do: 'say', who: 'ferryman', text, top: true, auto: 240 })), { do: 'fade', to: 1, frames: 20 }, { do: 'drift', vx: 0 }];
  return { music: 'ferrymanTheme', world: [1e6, 224], layers, actors, script, circuit: p.to };
}

// ---- RIVAL ---------------------------------------------------------------------------------------------
// Dash Maddox's scenes (spec §11b, §18 A5): a few lines in text boxes before and after each fight, in the Night Gym (fight I opens at the
// belt ceremony). The lines are data/fighters/rival/scenes.js.
function rival(p) {
  const n = p.n, id = `rival${n}`, S = RIVAL_SCENES[n][p.phase], sc = S[p.variant] || S.first;
  const freed = n === 9 && p.phase === 'post', dashFighter = freed ? 'dash1' : `dash${n}`;
  const layers = sc.bg === 'ceremony'
    ? [{ p: 'fill', color: [0, 0, 0] }, { p: 'spot', x: 128, color: [3, 4, 8], w0: 30, spread: 0.45, y: 0 }, { p: 'spot', x: 128, color: [5, 6, 12], w0: 20, spread: 0.33, y: 0 }, { p: 'spot', x: 128, color: [8, 9, 16], w0: 10, spread: 0.21, y: 0 }]
    : [{ p: 'arena', id: CIRCUITS[id].arena }];
  const actors = { dash: { kind: 'fighter', id: dashFighter, x: 128, y: 150, anim: p.phase === 'pre' ? 'beckon' : 'idle', pose: p.phase === 'post' ? 'hitHigh' : undefined } };
  const vanish = sc.vanish || S.vanish;
  const script = [{ do: 'fade', to: 0, frames: 20 }, { do: 'sfx', name: 'rivalSting' }, ...(sc.caption ? [{ do: 'caption', text: sc.caption }] : [])];
  sc.lines.forEach(([who, text], i) => {
    if (p.phase === 'post' && i === 1) script.push({ do: 'pose', actor: 'dash', pose: 'idle1' });
    if (vanish && i === sc.lines.length - 1) script.push({ do: 'tween', actor: 'dash', to: { fade: 0.1 }, frames: 60, async: true });
    script.push({ do: 'say', who: who === 'coach' ? 'corner' : who === 'you' ? 'player' : 'dash', text });
  });
  script.push({ do: 'fade', to: 1, frames: 16 });
  return { music: 'rivalScene', world: [W_, 224], layers, actors, script, circuit: id, tokens: {}, params: { dashId: dashFighter } };
}

export const TEMPLATES = { arrival, victory, entrance, jog, ferry, rival };
