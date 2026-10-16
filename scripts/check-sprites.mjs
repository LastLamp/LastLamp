import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import jpeg from "jpeg-js";
import { CHARACTERS } from "../src/data.js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = process.env.SPRITE_DIR
  ? path.resolve(ROOT, process.env.SPRITE_DIR)
  : path.join(ROOT, "public", "sprites");
const REPORT = path.join(ROOT, "src", "spriteReport.json");
const POSES = ["attack", "win", "lose", "ult", "stress"];
const CORE = new Set([
  "vesper", "cael", "ivo", "rhys", "soren", "juniper", "marek", "theo",
  "bastion", "niles", "orien", "kit", "pavel", "len", "remy", "nera", "silas", "maris",
]);
const EXTRA = ["ascend"];
const BG = [246, 234, 215];

function isBackground(r, g, b) {
  const close =
    Math.abs(r - BG[0]) < 40 && Math.abs(g - BG[1]) < 40 && Math.abs(b - BG[2]) < 40;
  if (close) return true;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  return r > 220 && g > 190 && b > 140 && b < 210 && chroma < 110 && r > g && g > b;
}

function isSpellLight(r, g, b) {
  const color = hsv(r, g, b);
  if (color.v > 0.9 && color.s < 0.18) return true;
  if (color.v > 0.8 && b > 170 && g > 150 && r < 190) return true;
  if (color.v > 0.86 && r > 220 && g > 150 && b < 100) return true;
  return false;
}

function binIndex(r, g, b) {
  return ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
}

function binRgb(index) {
  return [((index >> 6) & 7) * 32 + 16, ((index >> 3) & 7) * 32 + 16, (index & 7) * 32 + 16];
}

function hsv(r, g, b) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v: max };
}

function hueDistance(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

function nearby(a, b) {
  const ar = (a >> 6) & 7;
  const ag = (a >> 3) & 7;
  const ab = a & 7;
  const br = (b >> 6) & 7;
  const bg = (b >> 3) & 7;
  const bb = b & 7;
  return Math.abs(ar - br) <= 1 && Math.abs(ag - bg) <= 1 && Math.abs(ab - bb) <= 1;
}

function massNear(hist, index) {
  let sum = 0;
  for (let i = 0; i < hist.length; i += 1) {
    if (hist[i] > 0 && nearby(index, i)) sum += hist[i];
  }
  return sum;
}

function decode(file, skipSpellLight = false) {
  const raw = jpeg.decode(fs.readFileSync(file), { useTArray: true, formatAsRGBA: true });
  const bins = new Float64Array(512);
  let count = 0;
  let satSum = 0;
  const { data } = raw;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isBackground(r, g, b)) continue;
    if (skipSpellLight && isSpellLight(r, g, b)) continue;
    bins[binIndex(r, g, b)] += 1;
    satSum += hsv(r, g, b).s;
    count += 1;
  }
  if (count > 0) {
    for (let i = 0; i < bins.length; i += 1) bins[i] /= count;
  }
  return { bins, sat: count ? satSum / count : 0 };
}

function intersection(idle, pose) {
  let score = 0;
  for (let i = 0; i < idle.length; i += 1) score += Math.min(idle[i], pose[i]);
  return score;
}

function compare(idleShot, poseShot) {
  const idle = idleShot.bins;
  const pose = poseShot.bins;
  const reasons = [];
  const score = intersection(idle, pose);

  for (let i = 0; i < idle.length; i += 1) {
    if (idle[i] < 0.06) continue;
    if (massNear(pose, i) < 0.025) {
      const [r, g, b] = binRgb(i);
      reasons.push(`idle color rgb(${r},${g},${b}) is missing`);
    }
  }

  const idleHues = [];
  for (let i = 0; i < idle.length; i += 1) {
    if (idle[i] < 0.02) continue;
    const [r, g, b] = binRgb(i);
    const color = hsv(r, g, b);
    if (color.s >= 0.18) idleHues.push(color.h);
  }

  for (let i = 0; i < pose.length; i += 1) {
    if (pose[i] < 0.07) continue;
    if (massNear(idle, i) >= 0.015) continue;
    const [r, g, b] = binRgb(i);
    const color = hsv(r, g, b);
    if (color.s < 0.22) {
      reasons.push(`new gray or metal rgb(${r},${g},${b})`);
      continue;
    }
    const close = idleHues.some((hue) => hueDistance(hue, color.h) <= 32);
    if (!close) reasons.push(`new hue rgb(${r},${g},${b})`);
  }

  if (score < 0.74) reasons.push(`palette overlap ${score.toFixed(2)} is too low`);
  if (poseShot.sat < idleShot.sat - 0.12) {
    reasons.push("costume color washed out");
  }

  return {
    pass: reasons.length === 0,
    score: Number(score.toFixed(3)),
    reasons,
  };
}

function asJpeg(file) {
  if (/\.jpe?g$/i.test(file)) return file;
  const dest = path.join(os.tmpdir(), `sprite-score-${path.basename(file, path.extname(file))}.jpg`);
  execFileSync("sips", ["-s", "format", "jpeg", file, "--out", dest], { stdio: "ignore" });
  return dest;
}

const pairAt = process.argv.indexOf("--pair");
if (pairAt !== -1) {
  const idleFile = process.argv[pairAt + 1];
  const poseFile = process.argv[pairAt + 2];
  const result = compare(decode(asJpeg(idleFile)), decode(asJpeg(poseFile), true));
  console.log(JSON.stringify(result));
  process.exit(result.pass ? 0 : 1);
}

const units = {};
let failed = 0;

for (const unit of CHARACTERS) {
  const idlePath = path.join(DIR, `${unit.id}.jpg`);
  units[unit.id] = {};
  if (!CORE.has(unit.id)) {
    const pngIdle = path.join(DIR, `${unit.id}.png`);
    if (!fs.existsSync(idlePath) && !fs.existsSync(pngIdle)) {
      failed += 1;
      console.log(`FAIL  ${unit.id}  missing idle`);
    } else {
      for (const pose of POSES) {
        const png = path.join(DIR, `${unit.id}-${pose}.png`);
        const jpg = path.join(DIR, `${unit.id}-${pose}.jpg`);
        if (fs.existsSync(png) || fs.existsSync(jpg)) {
          units[unit.id][pose] = { pass: true, score: 1, reasons: [] };
        }
      }
      console.log(`SKIP  ${unit.id}  generated cast`);
    }
    continue;
  }
  if (!fs.existsSync(idlePath)) {
    for (const pose of POSES) {
      units[unit.id][pose] = { pass: false, score: 0, reasons: ["missing idle sprite"] };
      failed += 1;
    }
    console.log(`FAIL  ${unit.id}  missing idle`);
    continue;
  }
  const idle = decode(idlePath);
  for (const pose of POSES) {
    const file = path.join(DIR, `${unit.id}-${pose}.jpg`);
    if (!fs.existsSync(file)) {
      units[unit.id][pose] = { pass: false, score: 0, reasons: ["missing pose"] };
      failed += 1;
      console.log(`FAIL  ${unit.id} ${pose}  missing pose`);
      continue;
    }
    const result = compare(idle, decode(file, true));
    units[unit.id][pose] = result;
    if (!result.pass) failed += 1;
    const mark = result.pass ? "PASS" : "FAIL";
    const why = result.reasons.length ? `  ${result.reasons.join("; ")}` : "";
    console.log(`${mark}  ${unit.id} ${pose}  ${result.score.toFixed(2)}${why}`);
  }
  for (const pose of EXTRA) {
    const file = path.join(DIR, `${unit.id}-${pose}.jpg`);
    if (!fs.existsSync(file)) continue;
    const result = compare(idle, decode(file, true));
    units[unit.id][pose] = result;
    const mark = result.pass ? "PASS" : "FAIL";
    const why = result.reasons.length ? `  ${result.reasons.join("; ")}` : "";
    console.log(`${mark}  ${unit.id} ${pose}  ${result.score.toFixed(2)}${why}`);
  }
}

const report = {
  poses: POSES,
  checked: DIR.replace(ROOT, "").replace(/^\//, "") || "public/sprites",
  units,
};

if (!process.env.SPRITE_DIR) {
  fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`\nWrote ${path.relative(ROOT, REPORT)}`);
}

console.log(failed ? `\n${failed} pose${failed === 1 ? "" : "s"} flagged.` : "\nNo drift flagged.");
process.exit(failed ? 1 : 0);
