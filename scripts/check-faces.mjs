import fs from "fs";
import path from "path";
import jpeg from "jpeg-js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(ROOT, "public", "portraits");
const CAST = path.join(ROOT, "src", "generatedCast.js");
const REPORT = path.join(ROOT, "src", "faceLikeness.json");

const SAME = [
  ["brock", "dorian"],
  ["brock", "silas"],
  ["dorian", "silas"],
  ["dorian", "jasper"],
  ["brock", "harlan"],
  ["silas", "jasper"],
  ["brock", "kit"],
  ["dorian", "kit"],
  ["marek", "bastion"],
  ["marek", "brock"],
  ["bastion", "brock"],
  ["bastion", "dorian"],
  ["marek", "silas"],
];
const DIFFERENT = [
  ["brock", "vance"],
  ["brock", "orko"],
  ["brock", "willa"],
  ["vance", "orko"],
  ["willa", "nessa"],
  ["willa", "anwen"],
  ["vance", "willa"],
  ["orko", "willa"],
  ["marek", "willa"],
  ["bastion", "willa"],
  ["bastion", "orko"],
  ["marek", "vance"],
];

const HAIR = 48;
const EYE_W = 64;
const EYE_H = 36;
const EYE_WIN = 18;

function decode(file) {
  const decoded = jpeg.decode(fs.readFileSync(file), { useTArray: true, formatAsRGBA: true });
  return { width: decoded.width, height: decoded.height, data: decoded.data };
}

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isPaper(r, g, b) {
  const l = lum(r, g, b);
  return l > 242 && Math.max(r, g, b) - Math.min(r, g, b) < 18;
}

function at(image, x, y) {
  const xx = Math.min(image.width - 1, Math.max(0, x));
  const yy = Math.min(image.height - 1, Math.max(0, y));
  const i = (yy * image.width + xx) * 4;
  return [image.data[i], image.data[i + 1], image.data[i + 2]];
}

function skinCenter(image) {
  const { width, height, data } = image;
  let sx = 0;
  let sy = 0;
  let n = 0;
  const step = 3;
  for (let y = Math.floor(height * 0.18); y < Math.floor(height * 0.5); y += step) {
    for (let x = Math.floor(width * 0.25); x < Math.floor(width * 0.75); x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isPaper(r, g, b)) continue;
      if (!(r > 130 && r + 6 >= g && g + 8 >= b && r - b > 12 && r - b < 140)) continue;
      sx += x;
      sy += y;
      n += 1;
    }
  }
  if (n < 30) return { x: 0.5, y: 0.36 };
  return { x: sx / n / width, y: sy / n / height };
}

function sample(image, cx, cy, spanW, spanH, w, h) {
  const gray = new Float64Array(w * h);
  const x0 = cx * image.width - (spanW * image.width) / 2;
  const y0 = cy * image.height - (spanH * image.height) / 2;
  for (let y = 0; y < h; y += 1) {
    const sy = Math.round(y0 + ((y + 0.5) * spanH * image.height) / h);
    for (let x = 0; x < w; x += 1) {
      const sx = Math.round(x0 + ((x + 0.5) * spanW * image.width) / w);
      const px = at(image, sx, sy);
      gray[y * w + x] = lum(px[0], px[1], px[2]);
    }
  }
  return gray;
}

function highpass(values) {
  const out = new Float64Array(values.length);
  const radius = 5;
  for (let i = 0; i < values.length; i += 1) {
    let sum = 0;
    let n = 0;
    for (let j = -radius; j <= radius; j += 1) {
      const index = Math.min(values.length - 1, Math.max(0, i + j));
      sum += values[index];
      n += 1;
    }
    out[i] = values[i] - sum / n;
  }
  return out;
}

function hairSig(image, eyeY) {
  const { width, height } = image;
  const y1 = Math.max(2, Math.floor((eyeY - 0.03) * height));
  const x0 = Math.floor(width * 0.12);
  const x1 = Math.floor(width * 0.88);
  const cols = x1 - x0;
  const top = new Float64Array(HAIR);
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < HAIR; i += 1) {
    const x = x0 + Math.floor(((i + 0.5) * cols) / HAIR);
    let found = y1;
    for (let y = 2; y < y1; y += 1) {
      const px = at(image, x, y);
      if (!isPaper(px[0], px[1], px[2])) {
        found = y;
        break;
      }
    }
    top[i] = found / Math.max(1, y1);
    const band = Math.min(y1 - 1, found + Math.floor(height * 0.04));
    const px = at(image, x, band);
    if (!isPaper(px[0], px[1], px[2])) {
      r += px[0];
      g += px[1];
      b += px[2];
      n += 1;
    }
  }
  return { top, spikes: highpass(top), color: n ? [r / n, g / n, b / n] : [0, 0, 0] };
}

function highpass2d(gray, w, h) {
  const out = new Float64Array(gray.length);
  const radius = 2;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      let n = 0;
      for (let dy = -radius; dy <= radius; dy += 1) {
        const yy = Math.min(h - 1, Math.max(0, y + dy));
        for (let dx = -radius; dx <= radius; dx += 1) {
          const xx = Math.min(w - 1, Math.max(0, x + dx));
          sum += gray[yy * w + xx];
          n += 1;
        }
      }
      out[y * w + x] = gray[y * w + x] - sum / n;
    }
  }
  return out;
}

function eyePatch(image, center) {
  return sample(image, center.x, center.y - 0.05, 0.36, 0.22, EYE_W, EYE_H);
}

function mirrorPatch(gray) {
  const out = new Float64Array(gray.length);
  for (let y = 0; y < EYE_H; y += 1) {
    for (let x = 0; x < EYE_W; x += 1) out[y * EYE_W + x] = gray[y * EYE_W + (EYE_W - 1 - x)];
  }
  return out;
}

function shapeSig(image, eyeY) {
  const { width, height } = image;
  const rows = 8;
  const curve = new Float64Array(rows);
  const y0 = eyeY - 0.01;
  const y1 = eyeY + 0.09;
  for (let i = 0; i < rows; i += 1) {
    const y = Math.floor((y0 + ((i + 0.5) * (y1 - y0)) / rows) * height);
    let minX = width;
    let maxX = -1;
    for (let x = Math.floor(width * 0.2); x < Math.floor(width * 0.8); x += 2) {
      const px = at(image, x, y);
      const l = lum(px[0], px[1], px[2]);
      if (l < 230) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    curve[i] = maxX > minX ? (maxX - minX) / width : 0;
  }
  const base = curve[0] || 1;
  for (let i = 0; i < rows; i += 1) curve[i] /= base;
  return curve;
}

function corr(a, b) {
  const n = Math.min(a.length, b.length);
  let sA = 0;
  let sB = 0;
  let sA2 = 0;
  let sB2 = 0;
  let sAB = 0;
  for (let i = 0; i < n; i += 1) {
    sA += a[i];
    sB += b[i];
    sA2 += a[i] * a[i];
    sB2 += b[i] * b[i];
    sAB += a[i] * b[i];
  }
  const num = n * sAB - sA * sB;
  const den = Math.sqrt(Math.max(0, (n * sA2 - sA * sA) * (n * sB2 - sB * sB)));
  return den > 1e-6 ? num / den : 0;
}

function eyeScore(a, b) {
  let best = -1;
  for (const dy of [-8, -4, 0, 4, 8]) {
    for (const dx of [-8, -4, 0, 4, 8]) {
      let sA = 0;
      let sB = 0;
      let sA2 = 0;
      let sB2 = 0;
      let sAB = 0;
      let n = 0;
      for (let y = 0; y < EYE_WIN; y += 1) {
        const ya = y + 9;
        const yb = ya + dy;
        if (yb < 0 || yb >= EYE_H) continue;
        for (let x = 6; x < EYE_W - 6; x += 1) {
          const xx = x + dx;
          if (xx < 0 || xx >= EYE_W) continue;
          const va = a[ya * EYE_W + x];
          const vb = b[yb * EYE_W + xx];
          sA += va;
          sB += vb;
          sA2 += va * va;
          sB2 += vb * vb;
          sAB += va * vb;
          n += 1;
        }
      }
      if (n < 80) continue;
      const num = n * sAB - sA * sB;
      const den = Math.sqrt(Math.max(0, (n * sA2 - sA * sA) * (n * sB2 - sB * sB)));
      const score = den > 1e-6 ? num / den : 0;
      if (score > best) best = score;
    }
  }
  return best;
}

function colorScore(a, b) {
  const dist = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 255;
  return Math.max(0, 1 - dist * 1.6);
}

function irisCenters(gray) {
  let mean = 0;
  for (let i = 0; i < gray.length; i += 1) mean += gray[i];
  mean /= gray.length;
  const pts = [];
  for (let y = 6; y < EYE_H - 6; y += 1) {
    for (let x = 8; x < EYE_W - 8; x += 1) {
      const value = gray[y * EYE_W + x];
      if (value > mean - 8) continue;
      let lighter = 0;
      let ring = 0;
      for (let dy = -3; dy <= 3; dy += 1) {
        for (let dx = -3; dx <= 3; dx += 1) {
          if (Math.abs(dx) + Math.abs(dy) < 2) continue;
          ring += 1;
          if (gray[(y + dy) * EYE_W + (x + dx)] > value + 24) lighter += 1;
        }
      }
      if (lighter / ring > 0.28) pts.push({ x, y });
    }
  }
  if (!pts.length) return [];
  pts.sort((a, b) => a.x - b.x);
  const mid = pts[Math.floor(pts.length / 2)].x;
  const groups = [[], []];
  for (const pt of pts) groups[pt.x < mid ? 0 : 1].push(pt);
  return groups.filter((group) => group.length > 4).map((group) => {
    const x = group.reduce((sum, pt) => sum + pt.x, 0) / group.length;
    const y = group.reduce((sum, pt) => sum + pt.y, 0) / group.length;
    return { x, y };
  });
}

function irisPatch(image, center, point) {
  const spanW = 0.36;
  const spanH = 0.22;
  const ix = (center.x - spanW / 2) + ((point.x + 0.5) / EYE_W) * spanW;
  const iy = (center.y - 0.05 - spanH / 2) + ((point.y + 0.5) / EYE_H) * spanH;
  return sample(image, ix, iy, 0.07, 0.045, 24, 14);
}

function irisScore(a, b) {
  if (a.irises.length < 1 || b.irises.length < 1) return 0;
  const pairs = [
    [0, 0],
    [0, Math.min(1, b.irises.length - 1)],
    [Math.min(1, a.irises.length - 1), 0],
    [Math.min(1, a.irises.length - 1), Math.min(1, b.irises.length - 1)],
  ];
  let best = 0;
  for (const [i, j] of pairs) {
    best = Math.max(best, corr(a.irises[i], b.irises[j]));
  }
  return best;
}

function compare(a, b) {
  const hair = corr(a.hair.spikes, b.hair.spikes);
  const color = colorScore(a.hair.color, b.hair.color);
  const eyes = Math.max(eyeScore(a.eyes, b.eyes), eyeScore(a.eyes, mirrorPatch(b.eyes)));
  const shape = corr(a.shape, b.shape);
  const iris = irisScore(a, b);
  const head = hair * 0.2 + color * 0.1 + eyes * 0.25 + iris * 0.45;
  return { hair, color, eyes, shape, iris, head };
}

function namesById() {
  const text = fs.readFileSync(CAST, "utf8");
  const names = {};
  const re = /"id": "([^"]+)",\s*"name": "([^"]+)"/g;
  for (const match of text.matchAll(re)) {
    if (!match[1].includes("-") && !names[match[1]]) names[match[1]] = match[2];
  }
  return names;
}

function styleOf(image) {
  const { width, height, data } = image;
  const L = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) L[p] = lum(data[i], data[i + 1], data[i + 2]);

  const bins = new Array(8).fill(0);
  let strong = 0;
  let ink = 0;
  let samples = 0;
  for (let y = 2; y < height - 2; y += 2) {
    for (let x = 2; x < width - 2; x += 2) {
      const l = L[y * width + x];
      samples += 1;
      if (l <= 70) {
        const nearBright =
          L[y * width + x + 4] > 150 ||
          L[y * width + x - 4] > 150 ||
          L[(y + 4) * width + x] > 150 ||
          L[(y - 4) * width + x] > 150;
        if (nearBright) ink += 1;
      }
      const gx = L[y * width + x + 1] - L[y * width + x - 1];
      const gy = L[(y + 1) * width + x] - L[(y - 1) * width + x];
      if (Math.hypot(gx, gy) < 24) continue;
      strong += 1;
      let ang = Math.atan2(gy, gx);
      if (ang < 0) ang += Math.PI;
      bins[Math.min(7, Math.floor((ang / Math.PI) * 8))] += 1;
    }
  }
  const axis = strong ? (bins[0] + bins[4]) / strong : 0;
  const inkRate = samples ? ink / samples : 0;

  let whiteRows = 0;
  const cx = Math.floor(width / 2);
  for (let y = height - 1; y >= 0; y -= 1) {
    const i = (y * width + cx) * 4;
    if (isPaper(data[i], data[i + 1], data[i + 2])) whiteRows += 1;
    else break;
  }
  const gap = whiteRows / height;

  let flatRows = 0;
  for (let y = height - 1; y > height * 0.5; y -= 1) {
    let sum = 0;
    let sum2 = 0;
    let n = 0;
    let paper = 0;
    for (let x = 0; x < width; x += 6) {
      const i = (y * width + x) * 4;
      const l = L[y * width + x];
      if (isPaper(data[i], data[i + 1], data[i + 2])) paper += 1;
      sum += l;
      sum2 += l * l;
      n += 1;
    }
    const mean = sum / n;
    const std = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
    if (paper / n > 0.3) break;
    if (std < 8) flatRows += 1;
    else break;
  }
  const bar = flatRows / height;

  const reasons = [];
  if (axis >= 0.34) reasons.push("pixel");
  if (inkRate < 0.008) reasons.push("soft");
  if (gap > 0.02) reasons.push("crop");
  if (bar > 0.04) reasons.push("bar");
  return {
    axis: Number(axis.toFixed(3)),
    ink: Number(inkRate.toFixed(4)),
    gap: Number(gap.toFixed(3)),
    bar: Number(bar.toFixed(3)),
    reasons,
  };
}

function measure(id) {
  const file = path.join(DIR, `${id}.jpg`);
  const image = decode(file);
  const center = skinCenter(image);
  const eyeY = Math.max(0.2, center.y - 0.02);
  const eyes = eyePatch(image, center);
  const irises = irisCenters(eyes).map((point) => irisPatch(image, center, point));
  return {
    id,
    eyeY,
    center,
    hair: hairSig(image, eyeY),
    eyes,
    irises,
    shape: shapeSig(image, center.y),
    style: styleOf(image),
  };
}

const names = namesById();
const onDisk = new Set(
  fs.readdirSync(DIR).filter((name) => name.endsWith(".jpg")).map((name) => name.slice(0, -4)),
);
const labeledIds = [...new Set([...SAME, ...DIFFERENT].flat())].filter((id) => onDisk.has(id));
const labeled = new Map(labeledIds.map((id) => [id, measure(id)]));

function lookup(a, b) {
  return compare(labeled.get(a), labeled.get(b));
}

const debugDir = path.join(ROOT, "scripts", ".face-debug");
fs.mkdirSync(debugDir, { recursive: true });
function dumpGray(file, gray, w, h) {
  const data = Buffer.alloc(w * h * 4);
  let max = 1;
  for (const value of gray) if (value > max) max = value;
  for (let i = 0; i < gray.length; i += 1) {
    const v = Math.max(0, Math.min(255, Math.round((gray[i] / max) * 255)));
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  fs.writeFileSync(file, jpeg.encode({ data, width: w, height: h }, 90).data);
}
for (const id of ["marek", "bastion", "brock", "harlan", "vance", "orko", "willa"]) {
  const row = labeled.get(id);
  if (!row) continue;
  dumpGray(path.join(debugDir, `${id}-eyes.jpg`), row.eyes, EYE_W, EYE_H);
  console.log(`${id} eyeY ${row.eyeY.toFixed(3)} hair ${Array.from(row.hair.top).map((v) => v.toFixed(2)).join(" ")}`);
}

function eyeGeometry(gray) {
  let mean = 0;
  for (let i = 0; i < gray.length; i += 1) mean += gray[i];
  mean /= gray.length;
  const boxes = [];
  for (const half of [0, 1]) {
    const x0 = half === 0 ? 8 : EYE_W / 2;
    const x1 = half === 0 ? EYE_W / 2 : EYE_W - 8;
    let best = 255;
    let bx = x0;
    let by = EYE_H / 2;
    for (let y = 8; y < EYE_H - 4; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const value = gray[y * EYE_W + x];
        if (value < best) {
          best = value;
          bx = x;
          by = y;
        }
      }
    }
    const limit = best + 28;
    let minX = bx;
    let maxX = bx;
    let minY = by;
    let maxY = by;
    const seen = new Uint8Array(gray.length);
    const stack = [[bx, by]];
    seen[by * EYE_W + bx] = 1;
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < x0 || nx >= x1 || ny < 4 || ny >= EYE_H - 2) continue;
        const index = ny * EYE_W + nx;
        if (seen[index] || gray[index] > limit) continue;
        seen[index] = 1;
        stack.push([nx, ny]);
      }
    }
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    boxes.push({ w, h, ratio: w / Math.max(1, h), y: by / EYE_H });
  }
  return boxes;
}

console.log("iris count");
for (const id of labeledIds) console.log(`  ${id.padEnd(10)} ${labeled.get(id).irises.length}`);

console.log("\nlabeled parts  hair  color  eyes  iris  head");
const sameParts = SAME.filter(([a, b]) => labeled.has(a) && labeled.has(b)).map(([a, b]) => ({ a, b, ...lookup(a, b) }));
const diffParts = DIFFERENT.filter(([a, b]) => labeled.has(a) && labeled.has(b)).map(([a, b]) => ({ a, b, ...lookup(a, b) }));
for (const row of sameParts) {
  console.log(`  SAME ${row.a}-${row.b}  ${row.hair.toFixed(2)}  ${row.color.toFixed(2)}  ${row.eyes.toFixed(2)}  ${row.iris.toFixed(2)}  ${row.head.toFixed(2)}`);
}
for (const row of diffParts) {
  console.log(`  DIFF ${row.a}-${row.b}  ${row.hair.toFixed(2)}  ${row.color.toFixed(2)}  ${row.eyes.toFixed(2)}  ${row.iris.toFixed(2)}  ${row.head.toFixed(2)}`);
}

const best = { eyeT: 0.41, colorT: 0.7 };
const sameHit = sameParts.filter((row) => row.eyes >= best.eyeT && row.color >= best.colorT);
const diffHit = diffParts.filter((row) => row.eyes >= best.eyeT && row.color >= best.colorT);
console.log(`\nRule: eyes >= ${best.eyeT.toFixed(2)} and hair color >= ${best.colorT.toFixed(2)}`);
console.log(`Labeled same ${sameHit.length}/${SAME.length}. Labeled different flagged ${diffHit.length}/${DIFFERENT.length}.`);
for (const row of sameParts) {
  const mark = row.eyes >= best.eyeT && row.color >= best.colorT ? "flag" : "miss";
  console.log(`  ${mark}  ${row.a} ~ ${row.b}  eyes ${row.eyes.toFixed(2)}  color ${row.color.toFixed(2)}`);
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".jpg")).sort();
const plates = files.map((name) => measure(name.slice(0, -4)));
const pairs = [];
for (let i = 0; i < plates.length; i += 1) {
  for (let j = i + 1; j < plates.length; j += 1) {
    const score = compare(plates[i], plates[j]);
    if (score.eyes >= best.eyeT && score.color >= best.colorT) {
      pairs.push({
        a: plates[i].id,
        b: plates[j].id,
        aName: names[plates[i].id] || plates[i].id,
        bName: names[plates[j].id] || plates[j].id,
        hair: Number(score.hair.toFixed(3)),
        eyes: Number(score.eyes.toFixed(3)),
        shape: Number(score.shape.toFixed(3)),
      });
    }
  }
}
pairs.sort((a, b) => b.eyes + b.hair - (a.eyes + a.hair));

const ids = new Set(pairs.flatMap((pair) => [pair.a, pair.b]));
const degree = new Map();
for (const pair of pairs) {
  degree.set(pair.a, (degree.get(pair.a) || 0) + 1);
  degree.set(pair.b, (degree.get(pair.b) || 0) + 1);
}
const keep = new Set(["willa", "nessa", "corin", "marek"]);
const style = plates
  .filter((plate) => plate.style.reasons.length)
  .map((plate) => ({
    id: plate.id,
    name: names[plate.id] || plate.id,
    reasons: plate.style.reasons,
    axis: plate.style.axis,
    ink: plate.style.ink,
    gap: plate.style.gap,
    bar: plate.style.bar,
  }));
const styleById = new Map(style.map((plate) => [plate.id, plate.reasons]));
const faces = plates
  .map((plate) => ({
    id: plate.id,
    name: names[plate.id] || plate.id,
    degree: degree.get(plate.id) || 0,
    protected: keep.has(plate.id),
    style: styleById.get(plate.id) || [],
  }))
  .sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id));
fs.writeFileSync(
  REPORT,
  JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      rule: best,
      styleRule: { pixelAxis: 0.34, softInk: 0.008, cropGap: 0.02, bar: 0.04 },
      labeledDifferentFlagged: best.miss,
      faces,
      pairs,
      style,
    },
    null,
    2,
  ),
);
console.log(`\nRoster flags: ${pairs.length} pairs, ${ids.size} plates`);
console.log("Face list:");
for (const face of faces.filter((face) => face.degree > 0 || face.style.length).slice(0, 20)) {
  const note = face.protected ? " protected" : "";
  const styleNote = face.style.length ? ` [${face.style.join(", ")}]` : "";
  console.log(`  ${String(face.degree).padStart(3)}  ${face.name}${styleNote}${note}`);
}
for (const pair of pairs.slice(0, 30)) {
  console.log(`  ${pair.aName} ~ ${pair.bName}  hair ${pair.hair.toFixed(2)}  eyes ${pair.eyes.toFixed(2)}  shape ${pair.shape.toFixed(2)}`);
}
if (pairs.length > 30) console.log(`  … ${pairs.length - 30} more`);
console.log(`\nStyle flags: ${style.length}`);
for (const plate of style) {
  console.log(`  ${plate.name}  ${plate.reasons.join(", ")}  axis ${plate.axis.toFixed(2)}  ink ${plate.ink.toFixed(4)}  gap ${(plate.gap * 100).toFixed(1)}%  bar ${((plate.bar || 0) * 100).toFixed(0)}%`);
}
console.log(`\nWrote ${path.relative(ROOT, REPORT)}`);
if (pairs.length || style.length || best.miss) process.exitCode = 1;
