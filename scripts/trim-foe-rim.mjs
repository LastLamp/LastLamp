import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import zlib from "zlib";
import { encodePng } from "./png.js";

const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../public/enemies");

function readPng(file) {
  const buf = readFileSync(file);
  let offset = 8;
  let width = 0;
  let height = 0;
  let color = 0;
  const parts = [];
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString();
    const data = buf.slice(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      color = data[9];
    } else if (type === "IDAT") parts.push(data);
    else if (type === "IEND") break;
    offset += 12 + length;
  }
  const raw = zlib.inflateSync(Buffer.concat(parts));
  const bpp = color === 6 ? 4 : color === 2 ? 3 : 4;
  const stride = width * bpp;
  const rgba = Buffer.alloc(width * height * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    const row = y * (stride + 1);
    const filter = raw[row];
    const line = Buffer.alloc(stride);
    for (let i = 0; i < stride; i += 1) {
      const x = raw[row + 1 + i];
      const a = i >= bpp ? line[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let v = x;
      if (filter === 1) v = (x + a) & 255;
      else if (filter === 2) v = (x + b) & 255;
      else if (filter === 3) v = (x + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        v = (x + pr) & 255;
      }
      line[i] = v;
    }
    if (bpp === 4) line.copy(rgba, y * width * 4);
    else {
      for (let x = 0; x < width; x += 1) {
        const o = (y * width + x) * 4;
        rgba[o] = line[x * 3];
        rgba[o + 1] = line[x * 3 + 1];
        rgba[o + 2] = line[x * 3 + 2];
        rgba[o + 3] = 255;
      }
    }
    prev = line;
  }
  return { width, height, rgba };
}

function paleRim(r, g, b, a) {
  if (a < 20) return false;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  return lum > 188 && chroma < 42;
}

let trimmed = 0;
let cleared = 0;
for (const name of readdirSync(DIR)) {
  if (!name.endsWith(".png")) continue;
  const file = path.join(DIR, name);
  const { width, height, rgba } = readPng(file);
  let removed = 0;
  for (let pass = 0; pass < 4; pass += 1) {
    const kill = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const o = (y * width + x) * 4;
        if (!paleRim(rgba[o], rgba[o + 1], rgba[o + 2], rgba[o + 3])) continue;
        const edge =
          x === 0 ||
          y === 0 ||
          x === width - 1 ||
          y === height - 1 ||
          rgba[o - 4 + 3] < 16 ||
          rgba[o + 4 + 3] < 16 ||
          rgba[o - width * 4 + 3] < 16 ||
          rgba[o + width * 4 + 3] < 16;
        if (edge) kill.push(o);
      }
    }
    if (!kill.length) break;
    for (const o of kill) rgba[o + 3] = 0;
    removed += kill.length;
  }
  if (!removed) continue;
  writeFileSync(file, encodePng(width, height, rgba));
  trimmed += 1;
  cleared += removed;
}
console.log(`Trimmed the pale rim on ${trimmed} enemy sprites (${cleared} pixels).`);
