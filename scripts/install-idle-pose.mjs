import fs from "fs";
import path from "path";
import zlib from "zlib";
import jpeg from "jpeg-js";
import { encodePng } from "./png.js";

function decodePng(file) {
  const b = fs.readFileSync(file);
  let off = 8;
  let w = 0;
  let h = 0;
  const idat = [];
  while (off < b.length) {
    const len = b.readUInt32BE(off);
    off += 4;
    const type = b.toString("ascii", off, off + 4);
    off += 4;
    const data = b.subarray(off, off + len);
    off += len + 4;
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * 4;
  const out = Buffer.alloc(w * h * 4);
  let src = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y += 1) {
    const filter = raw[src];
    src += 1;
    const row = Buffer.from(raw.subarray(src, src + stride));
    src += stride;
    for (let i = 0; i < stride; i += 1) {
      const left = i >= 4 ? row[i - 4] : 0;
      const up = prev[i];
      const ul = i >= 4 ? prev[i - 4] : 0;
      if (filter === 1) row[i] = (row[i] + left) & 255;
      else if (filter === 2) row[i] = (row[i] + up) & 255;
      else if (filter === 3) row[i] = (row[i] + ((left + up) >> 1)) & 255;
      else if (filter === 4) {
        const p = left + up - ul;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - ul);
        const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : ul;
        row[i] = (row[i] + pr) & 255;
      }
    }
    row.copy(out, y * stride);
    prev = row;
  }
  return { w, h, out };
}

function decodeGenerated(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    const jpg = jpeg.decode(buf, { useTArray: true, formatAsRGBA: true });
    return { w: jpg.width, h: jpg.height, out: Buffer.from(jpg.data) };
  }
  return decodePng(file);
}

function nearBlack(r, g, b) {
  return r < 28 && g < 28 && b < 28;
}

function nearPaper(r, g, b) {
  return r > 228 && g > 214 && b > 190 && r - b < 50 && Math.abs(r - g) < 28;
}

function flood(src, w, h, match) {
  const n = w * h;
  const bg = new Uint8Array(n);
  const q = [];
  const consider = (i) => {
    if (bg[i]) return;
    const o = i * 4;
    if (!match(src[o], src[o + 1], src[o + 2])) return;
    bg[i] = 1;
    q.push(i);
  };
  for (let x = 0; x < w; x += 1) {
    consider(x);
    consider((h - 1) * w + x);
  }
  for (let y = 0; y < h; y += 1) {
    consider(y * w);
    consider(y * w + w - 1);
  }
  while (q.length) {
    const i = q.pop();
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) consider(i - 1);
    if (x + 1 < w) consider(i + 1);
    if (y > 0) consider(i - w);
    if (y + 1 < h) consider(i + w);
  }
  return bg;
}

function fillSpecks(src, bg, w, h, match) {
  const n = w * h;
  for (let i = 0; i < n; i += 1) {
    if (bg[i]) continue;
    const o = i * 4;
    if (!match(src[o], src[o + 1], src[o + 2])) continue;
    const x = i % w;
    const y = (i / w) | 0;
    let found = false;
    for (let rad = 1; rad <= 6 && !found; rad += 1) {
      for (let oy = -rad; oy <= rad && !found; oy += 1) {
        for (let ox = -rad; ox <= rad; ox += 1) {
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx;
          if (bg[j]) continue;
          const s = j * 4;
          if (match(src[s], src[s + 1], src[s + 2])) continue;
          src[o] = src[s];
          src[o + 1] = src[s + 1];
          src[o + 2] = src[s + 2];
          src[o + 3] = 255;
          found = true;
          break;
        }
      }
    }
    if (!found) bg[i] = 1;
  }
}

function contentBox(buf, w, h, alpha) {
  let l = w;
  let r = -1;
  let t = h;
  let b = -1;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      const keep = alpha ? buf[i * 4 + 3] > 48 : buf[i] === 0;
      if (!keep) continue;
      if (x < l) l = x;
      if (x > r) r = x;
      if (y < t) t = y;
      if (y > b) b = y;
    }
  }
  return { l, r, t, b };
}

function interiorHoles(out, w, h) {
  const n = w * h;
  const seen = new Uint8Array(n);
  const q = [];
  for (let x = 0; x < w; x += 1) {
    q.push(x, (h - 1) * w + x);
  }
  for (let y = 0; y < h; y += 1) q.push(y * w, y * w + w - 1);
  let edge = 0;
  while (q.length) {
    const i = q.pop();
    if (seen[i] || out[i * 4 + 3] > 20) continue;
    seen[i] = 1;
    edge += 1;
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) q.push(i - 1);
    if (x + 1 < w) q.push(i + 1);
    if (y > 0) q.push(i - w);
    if (y + 1 < h) q.push(i + w);
  }
  let interior = 0;
  let opaque = 0;
  let dark = 0;
  for (let i = 0; i < n; i += 1) {
    if (out[i * 4 + 3] > 20) {
      opaque += 1;
      if (nearBlack(out[i * 4], out[i * 4 + 1], out[i * 4 + 2])) dark += 1;
    } else if (!seen[i]) interior += 1;
  }
  return { interior, opaque, dark, edge };
}

function plugHoles(out, w, h) {
  const stats = interiorHoles(out, w, h);
  if (stats.interior === 0) return stats;
  const n = w * h;
  const seen = new Uint8Array(n);
  const q = [];
  for (let x = 0; x < w; x += 1) q.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y += 1) q.push(y * w, y * w + w - 1);
  while (q.length) {
    const i = q.pop();
    if (seen[i] || out[i * 4 + 3] > 20) continue;
    seen[i] = 1;
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) q.push(i - 1);
    if (x + 1 < w) q.push(i + 1);
    if (y > 0) q.push(i - w);
    if (y + 1 < h) q.push(i + w);
  }
  for (let i = 0; i < n; i += 1) {
    if (out[i * 4 + 3] > 20 || seen[i]) continue;
    const x = i % w;
    const y = (i / w) | 0;
    let done = false;
    for (let rad = 1; rad <= 4 && !done; rad += 1) {
      for (let oy = -rad; oy <= rad && !done; oy += 1) {
        for (let ox = -rad; ox <= rad; ox += 1) {
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx;
          if (out[j * 4 + 3] < 200) continue;
          out[i * 4] = out[j * 4];
          out[i * 4 + 1] = out[j * 4 + 1];
          out[i * 4 + 2] = out[j * 4 + 2];
          out[i * 4 + 3] = 255;
          done = true;
          break;
        }
      }
    }
  }
  return interiorHoles(out, w, h);
}

const basePath = process.argv[2];
const genPath = process.argv[3];
const destPath = process.argv[4];
if (!basePath || !genPath || !destPath) {
  console.error("usage: node scripts/install-idle-pose.mjs <base.png> <generated.jpg> <out.png>");
  process.exit(2);
}

const gen = decodeGenerated(genPath);
const base = decodePng(basePath);
const corners = [0, gen.w - 1, (gen.h - 1) * gen.w, (gen.h - 1) * gen.w + gen.w - 1];
let blackVotes = 0;
let paperVotes = 0;
for (const i of corners) {
  const o = i * 4;
  if (nearBlack(gen.out[o], gen.out[o + 1], gen.out[o + 2])) blackVotes += 1;
  if (nearPaper(gen.out[o], gen.out[o + 1], gen.out[o + 2])) paperVotes += 1;
}
const match = blackVotes >= paperVotes ? nearBlack : nearPaper;
const mode = blackVotes >= paperVotes ? "black" : "paper";
const bg = flood(gen.out, gen.w, gen.h, match);
fillSpecks(gen.out, bg, gen.w, gen.h, match);

const box = contentBox(bg, gen.w, gen.h, false);
const baseBox = (() => {
  let l = base.w;
  let r = -1;
  let t = base.h;
  let b = -1;
  for (let y = 0; y < base.h; y += 1) {
    for (let x = 0; x < base.w; x += 1) {
      if (base.out[(y * base.w + x) * 4 + 3] <= 48) continue;
      if (x < l) l = x;
      if (x > r) r = x;
      if (y < t) t = y;
      if (y > b) b = y;
    }
  }
  return { l, r, t, b };
})();

if (box.r < box.l || baseBox.r < baseBox.l) {
  console.log(JSON.stringify({ ok: false, reason: "empty" }));
  process.exit(1);
}

const nw = box.r - box.l + 1;
const nh = box.b - box.t + 1;
const ow = baseBox.r - baseBox.l + 1;
const oh = baseBox.b - baseBox.t + 1;
const scale = Math.min(ow / nw, oh / nh);
const dw = Math.max(1, Math.round(nw * scale));
const dh = Math.max(1, Math.round(nh * scale));
const ox = baseBox.l + Math.round((ow - dw) / 2);
const oy = baseBox.t + Math.round((oh - dh) / 2);
const out = Buffer.alloc(base.w * base.h * 4);
for (let y = 0; y < dh; y += 1) {
  for (let x = 0; x < dw; x += 1) {
    const sx = Math.min(box.r, Math.max(box.l, box.l + Math.round(x / scale)));
    const sy = Math.min(box.b, Math.max(box.t, box.t + Math.round(y / scale)));
    const id = sy * gen.w + sx;
    if (bg[id]) continue;
    const dx = ox + x;
    const dy = oy + y;
    if (dx < 0 || dy < 0 || dx >= base.w || dy >= base.h) continue;
    const o = (dy * base.w + dx) * 4;
    const s = id * 4;
    out[o] = gen.out[s];
    out[o + 1] = gen.out[s + 1];
    out[o + 2] = gen.out[s + 2];
    out[o + 3] = 255;
  }
}
const stats = plugHoles(out, base.w, base.h);
const baseStats = interiorHoles(base.out, base.w, base.h);
const ratio = baseStats.opaque ? stats.opaque / baseStats.opaque : 0;
const darkShare = stats.opaque ? stats.dark / stats.opaque : 1;
const ok = stats.interior === 0 && ratio >= 0.35 && ratio <= 1.75 && darkShare < 0.12;
const report = {
  ok,
  mode,
  interior: stats.interior,
  opaque: stats.opaque,
  baseOpaque: baseStats.opaque,
  ratio: Number(ratio.toFixed(3)),
  darkShare: Number(darkShare.toFixed(3)),
  dest: destPath,
};
console.log(JSON.stringify(report));
if (!ok) process.exit(1);
fs.mkdirSync(path.dirname(destPath), { recursive: true });
fs.writeFileSync(destPath, encodePng(base.w, base.h, out));
