// The cutscene registry (spec §19 G1). One entry per scene: plain data, or a template name with parameters.
//   { id, title, zone, template, params }    (a template expands into layers, actors and a script)
//   { id, title, zone, music, world, layers, actors, script }   (written out in full)
// `zone` sorts the Theater: ROAD, SECRET, PANTHEON, UNDERWORLD, VOID, STORY.
import { TEMPLATES } from './templates.js';
import { ARRIVALS } from './arrivals.js';
import { VICTORIES } from './victories.js';
import { ENTRANCES } from './entrances.js';
import { BOSSES } from './bosses.js';
import { INVITATIONS } from './invitations.js';
import { STORY_SCENES } from './story.js';

export const ZONES = ['road', 'secret', 'pantheon', 'underworld', 'void', 'story', 'origin'];
export const ZONE_NAMES = { road: 'THE ROAD', secret: 'SECRET CIRCUITS', pantheon: 'THE PANTHEON', underworld: 'THE UNDERWORLD', void: 'THE VOID', story: 'STORY', origin: 'THE BEGINNING' };

export const SCENES = {};
for (const list of [ARRIVALS, VICTORIES, ENTRANCES, BOSSES, INVITATIONS, STORY_SCENES]) for (const s of list) SCENES[s.id] = s;

export function getScene(id, params = {}) {
  const raw = SCENES[id];
  if (!raw) throw new Error(`unknown cutscene ${id}`);
  if (!raw.template) return raw;
  const T = TEMPLATES[raw.template];
  if (!T) throw new Error(`cutscene ${id}: unknown template ${raw.template}`);
  return { id: raw.id, title: raw.title, zone: raw.zone, params: raw.params, ...T({ ...raw.params, ...params }) };
}

// The Theater's list (spec §19 G5): every scene by zone, in the order a career walks them (a circuit's invitation, arrival,
// boss intro or entrance, then its victory), the story scenes after the circuits.
import { CIRCUITS, ALL_ORDER } from '../circuits.js';
import { FIGHTERS } from '../fighters/index.js';
const KIND = { invite: 0, arrive: 1, boss: 2, entrance: 2, victory: 3, jog: 3.5, ferry: 3.5, rival: 3.6, story: 4 };
const ORIGIN_ORDER = ['boss.origin', 'victory.origin', 'boss.originTrue', 'victory.originTrue'];
function circuitOf(id, raw) {
  const kind = id.split('.')[0], rest = id.slice(kind.length + 1);
  if (raw.params && raw.params.circuit) return raw.params.circuit;
  if (raw.params && raw.params.to) return raw.params.to;
  if (raw.circuit) return raw.circuit;
  if (kind === 'entrance') return FIGHTERS[rest] ? FIGHTERS[rest].circuit : rest;
  if (kind === 'boss') return rest === 'dash9' ? 'rival9' : rest === 'jax' ? 'dream' : rest;
  return raw.after || rest;
}
export function theaterList() {
  const rows = Object.values(SCENES).map((raw, i) => {
    const kind = raw.id.split('.')[0], c = circuitOf(raw.id, raw);
    const idx = ORIGIN_ORDER.includes(raw.id) ? 1000 + ORIGIN_ORDER.indexOf(raw.id) : kind === 'story' ? 999 : kind === 'jog' || kind === 'ferry' ? Math.max(0, ALL_ORDER.indexOf(c) - 0.5) : Math.max(0, ALL_ORDER.indexOf(CIRCUITS[c] && CIRCUITS[c].rival ? CIRCUITS[c].after || c : c));
    return { id: raw.id, title: raw.title, zone: raw.zone || 'road', key: idx * 10 + (KIND[kind] ?? 4) + i / 1000 };
  });
  return ZONES.map((z) => ({ zone: z, name: ZONE_NAMES[z], scenes: rows.filter((r) => r.zone === z).sort((a, b) => a.key - b.key) })).filter((z) => z.scenes.length);
}
