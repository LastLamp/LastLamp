import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import zlib from "zlib";
import { CHARACTERS } from "../src/data.js";

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

function decodePng(buf) {
  let off = 8;
  let width = 0;
  let height = 0;
  let color = 6;
  const parts = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      color = data[9];
    }
    if (type === "IDAT") parts.push(data);
    if (type === "IEND") break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(parts));
  const channels = color === 2 ? 3 : 4;
  const stride = width * channels;
  const pix = Buffer.alloc(width * height * 4);
  let p = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[p];
    p += 1;
    const row = Buffer.alloc(stride);
    for (let i = 0; i < stride; i += 1) {
      const x = raw[p];
      p += 1;
      const a = i >= channels ? row[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v = x;
      if (filter === 1) v = (x + a) & 255;
      else if (filter === 2) v = (x + b) & 255;
      else if (filter === 3) v = (x + ((a + b) >> 1)) & 255;
      else if (filter === 4) v = (x + paeth(a, b, c)) & 255;
      row[i] = v;
    }
    for (let x = 0; x < width; x += 1) {
      const s = x * channels;
      const d = (y * width + x) * 4;
      pix[d] = row[s];
      pix[d + 1] = row[s + 1];
      pix[d + 2] = row[s + 2];
      pix[d + 3] = channels === 4 ? row[s + 3] : 255;
    }
    prev = row;
  }
  return { w: width, h: height, pix };
}

function blank(pix, i) {
  if (pix[i + 3] < 24) return true;
  const r = pix[i];
  const g = pix[i + 1];
  const b = pix[i + 2];
  return r > 226 && g > 210 && b > 186 && Math.abs(r - g) < 36;
}

function frameOf(src) {
  const { w, h, pix } = decodePng(src);
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (blank(pix, (y * w + x) * 4)) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const headBottom = minY + (maxY - minY) * 0.22;
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let y = minY; y < headBottom; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (blank(pix, (y * w + x) * 4)) continue;
      sx += x;
      sy += y;
      n += 1;
    }
  }
  if (!n) return { x: 50, y: 16 };
  return {
    x: Math.round((sx / n / w) * 1000) / 10,
    y: Math.round((sy / n / h) * 1000) / 10,
  };
}

const dir = join(tmpdir(), "last-lamp-faces");
mkdirSync(dir, { recursive: true });
const frames = {};
for (const c of CHARACTERS) {
  const png = `public/sprites/${c.id}.png`;
  const jpg = `public/sprites/${c.id}.jpg`;
  const file = existsSync(png) ? png : jpg;
  if (!existsSync(file)) continue;
  const out = join(dir, `${c.id}.png`);
  execFileSync("sips", ["-Z", "180", "-s", "format", "png", file, "--out", out], { stdio: "ignore" });
  frames[c.id] = frameOf(readFileSync(out));
  console.log(c.id, frames[c.id].x, frames[c.id].y);
}
rmSync(dir, { recursive: true, force: true });
const body = `export const FACE_FRAME = ${JSON.stringify(frames, null, 2)};\n`;
writeFileSync("src/faceFrame.js", body);
