export const PAPER = [246, 234, 215];

export function isBackground(r, g, b) {
  const close = Math.abs(r - PAPER[0]) < 36 && Math.abs(g - PAPER[1]) < 36 && Math.abs(b - PAPER[2]) < 36;
  if (close) return true;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  return r > 220 && g > 190 && b > 140 && b < 215 && chroma < 90 && r > g && g > b;
}

export function keyPaper(rgba, width, height) {
  const count = width * height;
  const bg = new Uint8Array(count);
  const queue = [];
  function seed(x, y) {
    const index = y * width + x;
    const offset = index * 4;
    if (rgba[offset + 3] === 0 || !isBackground(rgba[offset], rgba[offset + 1], rgba[offset + 2])) return;
    bg[index] = 1;
    queue.push(index);
  }
  for (let x = 0; x < width; x += 1) {
    seed(x, 0);
    if (height > 1) seed(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    seed(0, y);
    if (width > 1) seed(width - 1, y);
  }
  while (queue.length) {
    const index = queue.pop();
    const x = index % width;
    const y = (index / width) | 0;
    const next = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of next) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const neighbor = ny * width + nx;
      if (bg[neighbor]) continue;
      const offset = neighbor * 4;
      if (!isBackground(rgba[offset], rgba[offset + 1], rgba[offset + 2])) continue;
      bg[neighbor] = 1;
      queue.push(neighbor);
    }
  }
  for (let index = 0; index < count; index += 1) {
    if (bg[index]) rgba[index * 4 + 3] = 0;
  }
  return bg;
}

export function recenter(rgba, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (rgba[(y * width + x) * 4 + 3] < 20) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX) return rgba;
  const box = Math.max(maxX - minX + 1, maxY - minY + 1);
  const pad = Math.round(box * 0.1);
  const span = box + pad * 2;
  const originX = minX - Math.floor((span - (maxX - minX + 1)) / 2);
  const originY = minY - Math.floor((span - (maxY - minY + 1)) / 2);
  const src = Buffer.from(rgba);
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sx = Math.round(originX + ((x + 0.5) * span) / width - 0.5);
      const sy = Math.round(originY + ((y + 0.5) * span) / height - 0.5);
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
      const to = (y * width + x) * 4;
      const from = (sy * width + sx) * 4;
      out[to] = src[from];
      out[to + 1] = src[from + 1];
      out[to + 2] = src[from + 2];
      out[to + 3] = src[from + 3];
    }
  }
  return out;
}
