// Song registry.
import rookieFight from './rookie.js';
import minorFight from './minor.js';
import metroFight, { mcbrideEntrance } from './metro.js';
import djDropTrack from './djdrop.js';
import majorFight, { midnightEntrance } from './major.js';
import carnivalFight, { rexEntrance } from './carnival.js';
import continentalFight, { baronEntrance } from './continental.js';
import worldFight, { maestroEntrance } from './world.js';
import stormFight, { avalancheEntrance } from './storm.js';
import legendsFight, { mirrorEntrance } from './legends.js';
import grandprixFight, { karverEntrance } from './grandprix.js';
import dreamFight, { jaxEntrance } from './dream.js';
import undergroundFight, { wardenEntrance } from './underground.js';
import nightmareFight, { eclipseEntrance } from './nightmare.js';
import zeroFight, { zeroEntrance } from './zero.js';
import { endingMain, endingTrue } from './ending.js';
import title from './title.js';
import { victory, defeat, matchup } from './jingles.js';
import { map, jog, belt, gusEntrance, brodyEntrance } from './career.js';
import { modes, training } from './modes.js';
import { WALKUP_SONGS } from './walkups.js';
import { rivalFight, rivalShowdown, rivalScene, dashEntrance } from './rival.js';
import * as SUMMIT_SONGS from './summit.js';
import * as UNDERWORLD_SONGS from './underworld.js';
import * as ABYSS_SONGS from './abyss.js';
import * as VOID_SONGS from './void.js';
import { SCENE_SONGS } from './scenes.js';
import { MODE_SONGS } from './modeThemes.js';
import { champMap, zeroMap, roadTrip } from './worldmaps.js';
import { gateFight, cloudFight, heroesFight, rivalAscendant, pantheonMap, ascend, auroraEntrance, cirrusEntrance, oldGuardEntrance, PANTHEON_WALKUPS } from './pantheon.js';

export const SONGS = {
  rookieFight, minorFight, title, victory, defeat, matchup, map, jog, belt, gusEntrance, brodyEntrance,
  metroFight, mcbrideEntrance, djDropTrack, majorFight, midnightEntrance,
  carnivalFight, rexEntrance,
  continentalFight, baronEntrance, worldFight, maestroEntrance, stormFight, avalancheEntrance,
  legendsFight, mirrorEntrance, grandprixFight, karverEntrance, dreamFight, jaxEntrance,
  undergroundFight, wardenEntrance, nightmareFight, eclipseEntrance, zeroFight, zeroEntrance, endingMain, endingTrue,
  modes, training,
  champMap, zeroMap, roadTrip,
  rivalFight, rivalShowdown, rivalScene, dashEntrance,
  ...WALKUP_SONGS,
  // the Ascension (spec §18 A7): Pantheon fight themes, the map, the sky opening, entrances, walk-ups
  gateFight, cloudFight, heroesFight, rivalAscendant, pantheonMap, ascend, auroraEntrance, cirrusEntrance, oldGuardEntrance,
  ...Object.fromEntries(PANTHEON_WALKUPS.map((w) => [w.id, w])),
  // Phase B: the upper Pantheon, Halcyon, The Fall (summit.js)
  ...Object.fromEntries(Object.values(SUMMIT_SONGS).flatMap((v) => (Array.isArray(v) ? v : v && v.id ? [v] : [])).map((s) => [s.id, s])),
  // Phase C: the Underworld (underworld.js)
  ...Object.fromEntries(Object.values(UNDERWORLD_SONGS).flatMap((v) => (Array.isArray(v) ? v : v && v.id ? [v] : [])).map((s) => [s.id, s])),
  // Phase E: the Void (void.js)
  ...Object.fromEntries(Object.values(VOID_SONGS).flatMap((v) => (Array.isArray(v) ? v : v && v.id ? [v] : [])).map((s) => [s.id, s])),
  // the presentation pass (scenes.js): boss intro themes and the invitation
  ...Object.fromEntries(SCENE_SONGS.map((s) => [s.id, s])),
  // the post-game modes (modeThemes.js): Title Defense's anthems and the Gauntlet's five intensities, per division
  ...MODE_SONGS,
  // Phase D: the lower Underworld (abyss.js)
  ...Object.fromEntries(Object.values(ABYSS_SONGS).flatMap((v) => (Array.isArray(v) ? v : v && v.id ? [v] : [])).map((s) => [s.id, s])),
};

// The Ascension's songs by zone (Phase F: the sound test hides a zone's songs until you've reached it, so its
// names spoil nothing). Everything in SONGS that isn't listed here is the base game's.
const idsOf = (mod) => Object.values(mod).flatMap((v) => (Array.isArray(v) ? v : v && v.id ? [v] : [])).map((s) => s.id);
export const SONG_ZONE = {};
for (const id of [...Object.keys(Object.fromEntries(PANTHEON_WALKUPS.map((w) => [w.id, w]))), 'gateFight', 'cloudFight', 'heroesFight', 'rivalAscendant', 'pantheonMap', 'ascend', 'auroraEntrance', 'cirrusEntrance', 'oldGuardEntrance', ...idsOf(SUMMIT_SONGS)]) SONG_ZONE[id] = 'pantheon';
for (const id of [...idsOf(UNDERWORLD_SONGS), ...idsOf(ABYSS_SONGS)]) SONG_ZONE[id] = 'underworld';
for (const id of idsOf(VOID_SONGS)) SONG_ZONE[id] = 'void';
// the mode themes of a zone's division (modeThemes.js) belong to that zone too (Combined's open with the true ending, like the Void's)
for (const id of Object.keys(MODE_SONGS)) { const m = /^(?:tdFight|gFight)(Pantheon|Underworld|Void|Combined)/.exec(id); if (m) SONG_ZONE[id] = m[1] === 'Combined' ? 'void' : m[1].toLowerCase(); }
// the presentation pass (scenes.js): the boss intros of the Ascension's bosses belong to their zones
SONG_ZONE.bossHalcyon = 'pantheon'; SONG_ZONE.bossVorgath = 'underworld'; SONG_ZONE.bossDash = 'void'; SONG_ZONE.bossZeroTrue = 'void';
