import assert from 'node:assert/strict';
import {
  dominantColors,
  fillSelectionFromEdges,
  normalizeImageRect,
  rgbToHex,
} from '../src/lib/image-processing.ts';

assert.deepEqual(
  normalizeImageRect({ x: 4, y: 4, width: -3, height: -2 }, 10, 10),
  { x: 1, y: 2, width: 3, height: 2 }
);
assert.equal(rgbToHex(255, 0, 128), '#FF0080');

const pixels = new Uint8ClampedArray(5 * 3 * 4);
for (let pixel = 0; pixel < pixels.length; pixel += 4) {
  pixels[pixel] = (pixel / 4) % 5 < 2 ? 16 : 240;
  pixels[pixel + 3] = 255;
}
const filled = fillSelectionFromEdges(pixels, 5, 3, { x: 2, y: 1, width: 1, height: 1 });
assert.equal(filled[(1 * 5 + 2) * 4 + 3], 255);
assert.deepEqual(dominantColors(pixels, 2), ['#F01010', '#101010']);

console.log('image processing checks passed');
