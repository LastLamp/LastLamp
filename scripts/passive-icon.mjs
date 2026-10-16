import { deflateSync } from "zlib";
import { writeFileSync } from "fs";

const INK = [44, 36, 27, 255];
const CREAM = [246, 234, 215, 255];
const COLORS = {
  k: INK,
  w: [255, 248, 228, 255],
  y: [240, 194, 74, 255],
  Y: [201, 132, 42, 255],
  c: [127, 211, 194, 255],
  C: [47, 143, 134, 255],
  p: [176, 122, 230, 255],
  P: [109, 78, 150, 255],
  r: [224, 122, 154, 255],
  R: [176, 70, 104, 255],
  b: [108, 182, 255, 255],
  B: [61, 126, 196, 255],
  o: [226, 88, 34, 255],
};

const GRID = 32;
const SCALE = 32;
const SIZE = GRID * SCALE;

function cell(x, y) {
  const dx = x + 0.5 - 15.5;
  const dy = y + 0.5 - 14;
  const topH = 12;
  const botH = 15;
  const half = 11.2;
  let span;
  if (dy <= 0) {
    const u = (dy + topH) / topH;
    if (u < 0) return null;
    span = u * half;
  } else {
    const u = 1 - dy / botH;
    if (u < 0) return null;
    span = u * half;
  }
  const adx = Math.abs(dx);
  if (adx > span) return null;
  if (span - adx < 0.85 || (dy < -topH + 1.15) || (dy > botH - 1.15)) return "k";
  if (span < 2.4) return dy < 0 ? "y" : "p";
  if (dy < -5.2 && adx < span * 0.38) return "w";
  if (dy < -3.4 && adx < span * 0.55) return dx < 0 ? "c" : "y";
  if (dy < 0.4 && dx < -0.4) return adx > span * 0.62 ? "C" : "c";
  if (dy < 0.4 && dx >= -0.4) return adx > span * 0.62 ? "Y" : "y";
  if (dy > 1.2 && dy < 4.8 && adx < 1.1) return "w";
  if (dx < -2.2 && dy > 2 && dy < 7) return "b";
  if (dx < 0) return dy > 6.5 ? "P" : "p";
  return dy > 6.5 ? "R" : "r";
}

const pixels = new Uint8Array(SIZE * SIZE * 4);
for (let i = 0; i < SIZE * SIZE; i += 1) {
  pixels[i * 4] = CREAM[0];
  pixels[i * 4 + 1] = CREAM[1];
  pixels[i * 4 + 2] = CREAM[2];
  pixels[i * 4 + 3] = 255;
}

for (let y = 0; y < GRID; y += 1) {
  for (let x = 0; x < GRID; x += 1) {
    const key = cell(x, y);
    if (!key) continue;
    const [r, g, b, a] = COLORS[key];
    for (let sy = 0; sy < SCALE; sy += 1) {
      for (let sx = 0; sx < SCALE; sx += 1) {
        const px = x * SCALE + sx;
        const py = y * SCALE + sy;
        const i = (py * SIZE + px) * 4;
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = a;
      }
    }
  }
}

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let i = 0; i < 8; i += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, sum]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y += 1) {
  const row = y * (SIZE * 4 + 1);
  raw[row] = 0;
  pixels.subarray(y * SIZE * 4, (y + 1) * SIZE * 4).forEach((byte, i) => {
    raw[row + 1 + i] = byte;
  });
}
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(new URL("../public/icons/passive.png", import.meta.url), png);
