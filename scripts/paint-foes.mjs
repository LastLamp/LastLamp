import { readFileSync, writeFileSync } from "fs";
import zlib from "zlib";
import { encodePng } from "./png.js";
import { FOE_BOOK } from "../src/foeBook.js";

const OUT = 256;

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

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function sample(src, sx, sy) {
  const x0 = Math.floor(sx) - 1;
  const y0 = Math.floor(sy) - 1;
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  let n = 0;
  for (let y = y0; y < y0 + 4; y += 1) {
    for (let x = x0; x < x0 + 4; x += 1) {
      if (x < 0 || y < 0 || x >= src.w || y >= src.h) continue;
      const i = (y * src.w + x) * 4;
      const al = src.pix[i + 3];
      if (al < 16) continue;
      r += src.pix[i];
      g += src.pix[i + 1];
      b += src.pix[i + 2];
      a += al;
      n += 1;
    }
  }
  if (!n) return [0, 0, 0, 0];
  return [r / n, g / n, b / n, a / n];
}

function variant(src, foe, pose) {
  const pix = Buffer.alloc(OUT * OUT * 4);
  const n = hash(`${foe.art}:${pose}`);
  const attack = pose === "attack";
  const flip = (n & 1) === 1;
  const span = foe.role === "boss" ? 860 : foe.role === "bulwark" ? 980 : 1040;
  const spanX = foe.role === "bulwark" ? span * 0.86 : span;
  const shear = attack ? 0.22 : 0;
  const shiftX = (((n >> 4) % 90) - 45) + (attack ? 30 : 0);
  const shiftY = ((n >> 12) % 70) - 40;
  for (let y = 0; y < OUT; y += 1) {
    for (let x = 0; x < OUT; x += 1) {
      let dx = (x - OUT / 2) / OUT;
      const dy = (y - OUT * 0.46) / OUT;
      dx += dy * shear;
      if (flip) dx = -dx;
      const sx = src.w / 2 + dx * spanX + shiftX;
      const sy = src.h / 2 + dy * span + shiftY;
      let [r, g, b, a] = sample(src, sx, sy);
      if (a < 12) continue;
      const jitter = ((n >> 8) % 17) - 8;
      r += jitter;
      g += jitter * 0.4;
      b -= jitter * 0.25;
      if (foe.role === "hexer") {
        r = r * 0.78 + 46;
        b = b * 0.8 + 58;
      } else if (foe.role === "medic") {
        r += 18;
        g += 20;
        b += 16;
      } else if (foe.role === "boss") {
        r -= 16;
        g -= 14;
        b -= 12;
      } else if (foe.role === "bulwark") {
        r -= 10;
        g -= 8;
        b -= 8;
      }
      const i = (y * OUT + x) * 4;
      pix[i] = clamp(r);
      pix[i + 1] = clamp(g);
      pix[i + 2] = clamp(b);
      pix[i + 3] = clamp(a);
    }
  }
  if (foe.role === "boss") rim(pix, [196, 148, 72]);
  return pix;
}

function rim(pix, color) {
  const src = Buffer.from(pix);
  for (let y = 1; y < OUT - 1; y += 1) {
    for (let x = 1; x < OUT - 1; x += 1) {
      const i = (y * OUT + x) * 4;
      if (src[i + 3] > 40) continue;
      let near = 0;
      let clear = 0;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          if (src[((y + dy) * OUT + (x + dx)) * 4 + 3] > 200) near += 1;
          else clear += 1;
        }
      }
      if (near < 3 || near > 7 || clear < near) continue;
      pix[i] = color[0];
      pix[i + 1] = color[1];
      pix[i + 2] = color[2];
      pix[i + 3] = 230;
    }
  }
}

const portraits = {};
for (const element of ["flare", "gale", "tide", "stone", "veil"]) {
  portraits[element] = decodePng(readFileSync(`public/enemies/portrait-${element}.png`));
}

const only = process.argv[2];
for (const foe of FOE_BOOK) {
  if (only && foe.art !== only) continue;
  const src = portraits[foe.element] || portraits.stone;
  writeFileSync(`public/enemies/${foe.art}.png`, encodePng(OUT, OUT, variant(src, foe, "idle")));
  writeFileSync(`public/enemies/${foe.art}-attack.png`, encodePng(OUT, OUT, variant(src, foe, "attack")));
  console.log(foe.art, foe.role, foe.element);
}

if (!only || only === "wisp") {
  for (const pose of ["idle", "attack", "rage"]) {
    const name = pose === "idle" ? "wisp" : `wisp-${pose}`;
    const pix = variant(portraits.gale, { art: name, element: "gale", role: "striker" }, pose === "idle" ? "idle" : "attack");
    if (pose === "rage") {
      for (let i = 0; i < pix.length; i += 4) {
        if (pix[i + 3] < 16) continue;
        pix[i] = clamp(pix[i] * 0.62 + 70);
        pix[i + 1] = clamp(pix[i + 1] * 0.5);
        pix[i + 2] = clamp(pix[i + 2] * 0.4);
      }
    }
    writeFileSync(`public/enemies/${name}.png`, encodePng(OUT, OUT, pix));
    console.log(name);
  }
}
