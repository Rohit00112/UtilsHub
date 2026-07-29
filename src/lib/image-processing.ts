export interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeImageRect(rect: ImageRect, imageWidth: number, imageHeight: number): ImageRect {
  const x1 = clamp(Math.round(Math.min(rect.x, rect.x + rect.width)), 0, Math.max(0, imageWidth - 1));
  const y1 = clamp(Math.round(Math.min(rect.y, rect.y + rect.height)), 0, Math.max(0, imageHeight - 1));
  const x2 = clamp(Math.round(Math.max(rect.x, rect.x + rect.width)), x1 + 1, imageWidth);
  const y2 = clamp(Math.round(Math.max(rect.y, rect.y + rect.height)), y1 + 1, imageHeight);

  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

export function fillSelectionFromEdges(
  pixels: Uint8ClampedArray,
  imageWidth: number,
  imageHeight: number,
  selection: ImageRect
) {
  const output = new Uint8ClampedArray(pixels);
  const { x, y, width, height } = normalizeImageRect(selection, imageWidth, imageHeight);
  const leftX = Math.max(0, x - 1);
  const rightX = Math.min(imageWidth - 1, x + width);
  const topY = Math.max(0, y - 1);
  const bottomY = Math.min(imageHeight - 1, y + height);
  const channel = (px: number, py: number, offset: number) => pixels[(py * imageWidth + px) * 4 + offset];

  for (let py = y; py < y + height; py += 1) {
    const verticalProgress = (py - y + 1) / (height + 1);
    for (let px = x; px < x + width; px += 1) {
      const horizontalProgress = (px - x + 1) / (width + 1);
      const target = (py * imageWidth + px) * 4;

      for (let offset = 0; offset < 3; offset += 1) {
        const horizontal =
          channel(leftX, py, offset) * (1 - horizontalProgress) +
          channel(rightX, py, offset) * horizontalProgress;
        const vertical =
          channel(px, topY, offset) * (1 - verticalProgress) +
          channel(px, bottomY, offset) * verticalProgress;
        output[target + offset] = Math.round((horizontal + vertical) / 2);
      }
      output[target + 3] = 255;
    }
  }

  return output;
}

export function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

export function dominantColors(pixels: Uint8ClampedArray, limit = 6) {
  const counts = new Map<string, number>();

  for (let index = 0; index < pixels.length; index += 16) {
    if (pixels[index + 3] < 128) continue;
    const color = rgbToHex(
      Math.floor(pixels[index] / 32) * 32 + 16,
      Math.floor(pixels[index + 1] / 32) * 32 + 16,
      Math.floor(pixels[index + 2] / 32) * 32 + 16
    );
    counts.set(color, (counts.get(color) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, Math.max(1, limit))
    .map(([color]) => color);
}
