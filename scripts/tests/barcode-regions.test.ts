import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findBarcodeRegions } from '../../src/modules/shipments/utils/barcode-regions';

const width = 640, height = 480;
function scene(labels: Array<{ x: number; y: number; angle: number }>) {
  const pixels = new Uint8ClampedArray(width * height * 4).fill(255);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    for (const label of labels) {
      const dx = x - label.x, dy = y - label.y;
      const u = dx * Math.cos(label.angle) + dy * Math.sin(label.angle);
      const v = -dx * Math.sin(label.angle) + dy * Math.cos(label.angle);
      if (Math.abs(u) < 85 && Math.abs(v) < 27 && ((u + 85) % 7) < 3) {
        const i = (y * width + x) * 4;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = 30;
      }
    }
  }
  return pixels;
}

test('blank image has no proposals', () => {
  assert.equal(findBarcodeRegions(scene([]), width, height).length, 0);
});
for (const angle of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 6]) {
  test(`localizes parallel bars near top at ${angle} radians`, () => {
    const regions = findBarcodeRegions(scene([{ x: 160, y: 115, angle }]), width, height);
    const match = regions.find(r => r.x <= 160 && r.y <= 115 && r.x + r.width >= 160 && r.y + r.height >= 115);
    assert.ok(match);
    assert.ok(Math.cos(2 * (match.angle - angle)) > 0.9);
    assert.ok(match.width * match.height < width * height / 2);
  });
}
test('retains spatially separate horizontal and vertical candidates', () => {
  const labels = [{ x: 130, y: 100, angle: 0 }, { x: 480, y: 330, angle: Math.PI / 2 }];
  const regions = findBarcodeRegions(scene(labels), width, height);
  for (const p of labels) assert.ok(regions.some(r => r.x <= p.x && r.y <= p.y && r.x + r.width >= p.x && r.y + r.height >= p.y));
});
