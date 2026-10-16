import fs from "fs";
import path from "path";
import jpeg from "jpeg-js";
import zlib from "zlib";
import { isBackground, PAPER } from "./paper.js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const REPORT = path.join(ROOT, "src", "artReport.json");

function readPng(file) {
  const buf = fs.readFileSync(file);
  let offset = 8;
  let width = 0;
  let height = 0;
  const parts = [];
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString();
    const data = buf.slice(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === "IDAT") parts.push(data);
    else if (type === "IEND") break;
    offset += 12 + length;
  }
  const raw = zlib.inflateSync(Buffer.concat(parts));
  const rgba = Buffer.alloc(width * height * 4);
  const stride = width * 4;
  for (let y = 0; y < height; y += 1) {
    const row = y * (stride + 1);
    raw.copy(rgba, y * stride, row + 1, row + 1 + stride);
  }
  return { width, height, data: rgba };
}

function readImage(file) {
  if (file.endsWith(".png")) return readPng(file);
  const decoded = jpeg.decode(fs.readFileSync(file), { useTArray: true, formatAsRGBA: true });
  return { width: decoded.width, height: decoded.height, data: Buffer.from(decoded.data) };
}

function score(file) {
  const { width, height, data } = readImage(file);
  const count = width * height;
  let opaque = 0;
  let fringe = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  const bins = new Float64Array(512);
  const corners = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ];
  let clearCorners = 0;
  for (const [x, y] of corners) {
    const offset = (y * width + x) * 4;
    if (data[offset + 3] < 16) clearCorners += 1;
  }
  for (let i = 0; i < count; i += 1) {
    const offset = i * 4;
    const alpha = data[offset + 3];
    if (alpha < 16) continue;
    opaque += 1;
    const x = i % width;
    const y = (i / width) | 0;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const edge =
      (x > 0 && data[offset - 4 + 3] < 16) ||
      (x + 1 < width && data[offset + 4 + 3] < 16) ||
      (y > 0 && data[offset - width * 4 + 3] < 16) ||
      (y + 1 < height && data[offset + width * 4 + 3] < 16);
    if (edge && isBackground(r, g, b)) fringe += 1;
    const bin = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    bins[bin] += 1;
  }
  if (opaque) {
    for (let i = 0; i < bins.length; i += 1) bins[i] /= opaque;
  }
  const box = maxX < minX ? 0 : Math.max((maxX - minX + 1) / width, (maxY - minY + 1) / height);
  const halo = fringe / count;
  const reasons = [];
  if (clearCorners < 4) reasons.push("background still shows in the corners");
  if (box < 0.62) reasons.push(`subject only spans ${(box * 100).toFixed(0)}% of the frame`);
  if (halo > 0.04) reasons.push("a paper halo is still stuck to the edges");
  return {
    fill: Number(box.toFixed(3)),
    paperLeft: Number(halo.toFixed(3)),
    clearCorners,
    pass: reasons.length === 0,
    reasons,
    bins,
  };
}

function overlap(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.min(a[i], b[i]);
  return sum;
}

const groups = {};
let failed = 0;
for (const folder of ["skills", "icons"]) {
  const dir = path.join(ROOT, "public", folder);
  groups[folder] = {};
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir).filter((item) => item.endsWith(".png") || item.endsWith(".jpg"))) {
    const id = name.replace(/\.(png|jpg)$/, "");
    if (groups[folder][id]) continue;
    const png = path.join(dir, `${id}.png`);
    const file = fs.existsSync(png) ? png : path.join(dir, `${id}.jpg`);
    const result = score(file);
    groups[folder][id] = {
      fill: result.fill,
      paperLeft: result.paperLeft,
      clearCorners: result.clearCorners,
      pass: result.pass,
      reasons: result.reasons,
    };
    if (!result.pass) failed += 1;
    groups[folder][id].bins = result.bins;
    const mark = result.pass ? "PASS" : "FAIL";
    console.log(`${mark}  ${folder}/${id}  fill ${result.fill.toFixed(2)}${result.reasons.length ? `  ${result.reasons.join("; ")}` : ""}`);
  }
}

const skills = Object.entries(groups.skills || {});
for (let i = 0; i < skills.length; i += 1) {
  for (let j = i + 1; j < skills.length; j += 1) {
    const same = overlap(skills[i][1].bins, skills[j][1].bins);
    if (same > 0.9) {
      failed += 1;
      console.log(`FAIL  ${skills[i][0]} and ${skills[j][0]} look alike (${same.toFixed(2)})`);
    }
  }
}

const report = {
  paper: PAPER,
  skills: Object.fromEntries(skills.map(([id, row]) => [id, { fill: row.fill, paperLeft: row.paperLeft, pass: row.pass, reasons: row.reasons }])),
  icons: Object.fromEntries(
    Object.entries(groups.icons || {}).map(([id, row]) => [id, { fill: row.fill, paperLeft: row.paperLeft, pass: row.pass, reasons: row.reasons }]),
  ),
};
fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
console.log(failed ? `\n${failed} art checks flagged.` : "\nArt checks passed.");
process.exit(failed ? 1 : 0);
