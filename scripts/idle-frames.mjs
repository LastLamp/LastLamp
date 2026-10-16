// Second idle pose. Pose A is the original plate. Pose B swings a weapon,
// ear, or other extremity around its joint so the stance actually changes.
import fs from "fs";
import path from "path";
import zlib from "zlib";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dir = path.join(root, "public", "enemies");

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  return Buffer.concat([len, body, crc]);
}
function encodePng(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y += 1) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength).copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

function decodePng(file) {
  const b = fs.readFileSync(file);
  let off = 8;
  let w = 0;
  let h = 0;
  let color = 0;
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
      color = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }
  if (color !== 6) throw new Error(`unsupported color ${color} in ${file}`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = w * bpp;
  const out = new Uint8ClampedArray(w * h * 4);
  let src = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y += 1) {
    const filter = raw[src];
    src += 1;
    const row = Buffer.from(raw.subarray(src, src + stride));
    src += stride;
    for (let i = 0; i < stride; i += 1) {
      const left = i >= bpp ? row[i - bpp] : 0;
      const up = prev[i];
      const ul = i >= bpp ? prev[i - bpp] : 0;
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
    out.set(row, y * stride);
    prev = row;
  }
  return { w, h, rgba: out };
}

function idlePose(rgba, w, h) {
  const n = w * h;
  const src = new Uint8ClampedArray(rgba);
  const ink = (i) => src[i * 4 + 3] > 48;
  const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  let count = 0;
  let sx = 0;
  let sy = 0;
  let l = w;
  let r = 0;
  let t = h;
  let b = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (!ink(y * w + x)) continue;
      count += 1;
      sx += x;
      sy += y;
      if (x < l) l = x;
      if (x > r) r = x;
      if (y < t) t = y;
      if (y > b) b = y;
    }
  }
  if (!count) return { rgba: src, note: "empty", changed: 0, count: 0, travel: 0 };
  const cx = sx / count;
  const cy = sy / count;
  const bw = r - l + 1;
  const bh = b - t + 1;
  const rad = Math.max(2, Math.round(Math.min(bw, bh) / 55));
  const thick = new Uint16Array(n);
  for (let y = t; y <= b; y += 1) {
    for (let x = l; x <= r; x += 1) {
      const i = y * w + x;
      if (!ink(i)) continue;
      let hits = 0;
      for (let oy = -rad; oy <= rad; oy += 1) {
        for (let ox = -rad; ox <= rad; ox += 1) {
          const nx = x + ox;
          const ny = y + oy;
          if (inside(nx, ny) && ink(ny * w + nx)) hits += 1;
        }
      }
      thick[i] = hits;
    }
  }

  const label = new Int32Array(n);
  const sizes = [0];
  let comps = 0;
  const stack = [];
  for (let i = 0; i < n; i += 1) {
    if (!ink(i) || label[i]) continue;
    comps += 1;
    let size = 0;
    stack.push(i);
    label[i] = comps;
    while (stack.length) {
      const p = stack.pop();
      size += 1;
      const x = p % w;
      const y = (p / w) | 0;
      const next = [x > 0 ? p - 1 : -1, x + 1 < w ? p + 1 : -1, y > 0 ? p - w : -1, y + 1 < h ? p + w : -1];
      for (const q of next) {
        if (q >= 0 && ink(q) && !label[q]) {
          label[q] = comps;
          stack.push(q);
        }
      }
    }
    sizes[comps] = size;
  }
  let body = 1;
  for (let c = 2; c <= comps; c += 1) if (sizes[c] > sizes[body]) body = c;

  let far = 0;
  let farD = -1;
  for (let i = 0; i < n; i += 1) {
    if (!ink(i)) continue;
    const x = i % w;
    const y = (i / w) | 0;
    const d = (x - cx) ** 2 + (y - cy) ** 2;
    if (d > farD) {
      farD = d;
      far = i;
    }
  }
  const farDist = Math.sqrt(farD) || 1;
  const dst = new Uint8ClampedArray(src);
  const notes = [];

  function paint(mask, joint, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const hold = rad * 2;
    for (const i of mask) {
      const x = i % w;
      const y = (i / w) | 0;
      if (Math.hypot(x - joint.x, y - joint.y) <= hold) continue;
      const o = i * 4;
      dst[o] = 0;
      dst[o + 1] = 0;
      dst[o + 2] = 0;
      dst[o + 3] = 0;
    }
    for (const i of mask) {
      const x = i % w;
      const y = (i / w) | 0;
      if (Math.hypot(x - joint.x, y - joint.y) <= hold) continue;
      const dx = x - joint.x;
      const dy = y - joint.y;
      const rx = Math.round(joint.x + dx * cos - dy * sin);
      const ry = Math.round(joint.y + dx * sin + dy * cos);
      const s = i * 4;
      for (let oy = 0; oy <= 1; oy += 1) {
        for (let ox = 0; ox <= 1; ox += 1) {
          const nx = rx + ox;
          const ny = ry + oy;
          if (!inside(nx, ny)) continue;
          const o = (ny * w + nx) * 4;
          dst[o] = src[s];
          dst[o + 1] = src[s + 1];
          dst[o + 2] = src[s + 2];
          dst[o + 3] = src[s + 3];
        }
      }
    }
  }

  const farComp = label[far];
  let travel = 0;
  if (farComp !== body && sizes[farComp] >= 8 && sizes[farComp] < count * 0.12) {
    const lift = Math.round(bh * 0.1);
    const pixels = [];
    for (let i = 0; i < n; i += 1) if (label[i] === farComp) pixels.push(i);
    for (const i of pixels) {
      dst[i * 4 + 3] = 0;
    }
    for (const i of pixels) {
      const x = i % w;
      const y = (i / w) | 0;
      const ny = Math.max(0, y - lift);
      const o = (ny * w + x) * 4;
      const s = i * 4;
      dst[o] = src[s];
      dst[o + 1] = src[s + 1];
      dst[o + 2] = src[s + 2];
      dst[o + 3] = src[s + 3];
    }
    travel = lift;
    notes.push("prop");
  } else {
    const windowArea = (rad * 2 + 1) ** 2;
    const limit = Math.round(windowArea * 0.58);
    const limb = [];
    const seen = new Uint8Array(n);
    const q = [far];
    seen[far] = 1;
    while (q.length && limb.length < count * 0.12) {
      const p = q.pop();
      limb.push(p);
      const x = p % w;
      const y = (p / w) | 0;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (!inside(nx, ny)) continue;
        const id = ny * w + nx;
        if (seen[id] || label[id] !== body || thick[id] > limit) continue;
        seen[id] = 1;
        q.push(id);
      }
    }
    let joint = far;
    let jointD = Infinity;
    let tip = far;
    let tipD = -1;
    for (const i of limb) {
      const x = i % w;
      const y = (i / w) | 0;
      const d = (x - cx) ** 2 + (y - cy) ** 2;
      if (d < jointD) {
        jointD = d;
        joint = i;
      }
    }
    const jx = joint % w;
    const jy = (joint / w) | 0;
    for (const i of limb) {
      const x = i % w;
      const y = (i / w) | 0;
      const d = (x - jx) ** 2 + (y - jy) ** 2;
      if (d > tipD) {
        tipD = d;
        tip = i;
      }
    }
    const tx = tip % w;
    const ty = (tip / w) | 0;
    let best = null;
    for (const sign of [1, -1]) {
      for (const deg of [18, 26]) {
        const angle = (sign * deg * Math.PI) / 180;
        const dx = tx - jx;
        const dy = ty - jy;
        const ry = jy + dx * Math.sin(angle) + dy * Math.cos(angle);
        const moved = ty - ry;
        if (!best || moved > best.moved) best = { angle, moved };
      }
    }
    if (process.argv.includes("foe-011")) console.log({ limb: limb.length, count, limit, moved: best && Math.round(best.moved), need: Math.round(bh * 0.05), farThick: thick[far] });
    if (limb.length > count * 0.008 && limb.length < count * 0.12 && best && best.moved >= bh * 0.05) {
      paint(limb, { x: jx, y: jy }, best.angle);
      travel = Math.round(best.moved);
      notes.push("swing");
    }
  }

  let changed = 0;
  for (let i = 0; i < n * 4; i += 4) {
    if (dst[i] !== src[i] || dst[i + 1] !== src[i + 1] || dst[i + 2] !== src[i + 2] || dst[i + 3] !== src[i + 3]) changed += 1;
  }
  return {
    rgba: dst,
    note: `${notes.join("+") || "still"} lift:${travel}`,
    changed,
    count,
    travel,
  };
}

const only = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((name) => {
  if (!name.endsWith(".png")) return false;
  if (name.startsWith("portrait-")) return false;
  if (/-attack\.png$|-rage\.png$|-idle\.png$/.test(name)) return false;
  if (only.length && !only.includes(name.replace(/\.png$/, ""))) return false;
  return true;
});

let still = 0;
for (const name of files) {
  const { w, h, rgba } = decodePng(path.join(dir, name));
  const posed = idlePose(rgba, w, h);
  fs.writeFileSync(path.join(dir, name.replace(/\.png$/, "-idle.png")), encodePng(w, h, posed.rgba));
  const pct = posed.count ? Math.round((posed.changed / posed.count) * 100) : 0;
  if (posed.travel < 8) still += 1;
  if (only.length || posed.travel < 8) console.log(`${name.replace(/\\.png$/, "")} ${posed.note} ${pct}%`);
}
if (!only.length) console.log(`checked ${files.length} short-swing ${still}`);


