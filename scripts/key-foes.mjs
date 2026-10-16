import { readFileSync, writeFileSync } from "fs";
import zlib from "zlib";
import { encodePng } from "./png.js";

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buf) {
  let offset = 8;
  let width = 0;
  let height = 0;
  const idat = [];
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    offset += 4;
    const type = buf.slice(offset, offset + 4).toString("ascii");
    offset += 4;
    const data = buf.slice(offset, offset + length);
    offset += length + 4;
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const out = Buffer.alloc(width * height * 4);
  let prev = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[pos];
    pos += 1;
    const row = Buffer.alloc(stride);
    for (let i = 0; i < stride; i += 1) {
      const x = raw[pos + i];
      const left = i >= 4 ? row[i - 4] : 0;
      const up = prev[i];
      const ul = i >= 4 ? prev[i - 4] : 0;
      if (filter === 0) row[i] = x;
      else if (filter === 1) row[i] = (x + left) & 255;
      else if (filter === 2) row[i] = (x + up) & 255;
      else if (filter === 3) row[i] = (x + Math.floor((left + up) / 2)) & 255;
      else row[i] = (x + paeth(left, up, ul)) & 255;
    }
    pos += stride;
    row.copy(out, y * stride);
    prev = row;
  }
  return { width, height, rgba: out };
}

function keyCream(rgba) {
  const corner = [rgba[0], rgba[1], rgba[2]];
  for (let i = 0; i < rgba.length; i += 4) {
    const d = Math.abs(rgba[i] - corner[0]) + Math.abs(rgba[i + 1] - corner[1]) + Math.abs(rgba[i + 2] - corner[2]);
    if (d < 42) rgba[i + 3] = 0;
  }
}

for (const element of ["flare", "gale", "tide", "stone", "veil"]) {
  const file = decodePng(readFileSync(`public/enemies/${element}.png`));
  keyCream(file.rgba);
  writeFileSync(`public/enemies/portrait-${element}.png`, encodePng(file.width, file.height, file.rgba));
  console.log(element, file.width, file.height);
}
