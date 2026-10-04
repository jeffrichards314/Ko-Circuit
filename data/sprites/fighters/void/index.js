// The Void's sprite layers and palettes (spec §18 A6, Phase E): the twelve Hollowed, Dash Unbound's outfit and ZERO's true form.
import dodgeShard, { palettes as dodgeShardPalettes } from './dodgeShard.js';
import blockShard, { palettes as blockShardPalettes } from './blockShard.js';
import duckShard, { palettes as duckShardPalettes } from './duckShard.js';
import counterShard, { palettes as counterShardPalettes } from './counterShard.js';
import sightShard, { palettes as sightShardPalettes } from './sightShard.js';
import soundShard, { palettes as soundShardPalettes } from './soundShard.js';
import rhythmShard, { palettes as rhythmShardPalettes } from './rhythmShard.js';
import memoryShard, { palettes as memoryShardPalettes } from './memoryShard.js';
import echoShard, { palettes as echoShardPalettes } from './echoShard.js';
import chaosShard, { palettes as chaosShardPalettes } from './chaosShard.js';
import timeShard, { palettes as timeShardPalettes } from './timeShard.js';
import willShard, { palettes as willShardPalettes } from './willShard.js';
import zeroTrue, { palettes as zeroTruePalettes } from './zeroTrue.js';

export const VOID_LAYERS = { dodgeShard, blockShard, duckShard, counterShard, sightShard, soundShard, rhythmShard, memoryShard, echoShard, chaosShard, timeShard, willShard, zeroTrue };
export const VOID_PALETTES = { ...dodgeShardPalettes, ...blockShardPalettes, ...duckShardPalettes, ...counterShardPalettes, ...sightShardPalettes, ...soundShardPalettes, ...rhythmShardPalettes, ...memoryShardPalettes, ...echoShardPalettes, ...chaosShardPalettes, ...timeShardPalettes, ...willShardPalettes, ...zeroTruePalettes };
