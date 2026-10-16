import { readFileSync, writeFileSync } from "fs";
import jpeg from "jpeg-js";

const sources = {};
function load(name) {
  if (!sources[name]) {
    const decoded = jpeg.decode(readFileSync(`public/backdrops/${name}.jpg`), { useTArray: true, formatAsRGBA: true });
    sources[name] = decoded;
  }
  return sources[name];
}

function clamp(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

const jobs = [
  { id: "warmup", src: "road", pan: 0, lift: 0.04, zoom: 1.05, mood: "day" },
  { id: "comments", src: "gate", pan: 0, lift: 0, zoom: 1.08, mood: "day" },
  { id: "pyro", src: "kiln", pan: 0.04, lift: 0, zoom: 1.12, mood: "fire" },
  { id: "deadair", src: "night", pan: 0, lift: 0.02, zoom: 1.06, mood: "night" },
  { id: "signoff", src: "night", pan: 0.16, lift: 0.1, zoom: 1.28, mood: "void" },
  { id: "ford", src: "ford", pan: 0, lift: 0.06, zoom: 1.08, mood: "day" },
  { id: "quarry", src: "quarry", pan: 0, lift: 0, zoom: 1.06, mood: "day" },
  { id: "cinder", src: "kiln", pan: -0.08, lift: 0.08, zoom: 1.22, mood: "ember" },
  { id: "watch", src: "night", pan: -0.12, lift: 0, zoom: 1.18, mood: "watch" },
  { id: "span", src: "gate", pan: 0.14, lift: 0.05, zoom: 1.24, mood: "storm" },
  { id: "kiln2", src: "kiln", pan: 0.12, lift: 0.12, zoom: 1.3, mood: "ash" },
  { id: "lantern", src: "road", pan: 0.08, lift: 0.02, zoom: 1.16, mood: "lantern" },
  { id: "boar", src: "quarry", pan: 0.18, lift: 0.08, zoom: 1.26, mood: "dusk" },
  { id: "lamps", src: "road", pan: -0.1, lift: 0.06, zoom: 1.2, mood: "mile" },
];

function tone(mood, r, g, b, y, h) {
  const t = y / h;
  if (mood === "day") return [r, g, b];
  if (mood === "fire") return [r * 1.12 + 16, g * 0.9, b * 0.68];
  if (mood === "night") return [r, g, b];
  if (mood === "void") return [r * 0.48, g * 0.46 + 4, b * 0.72 + 18];
  if (mood === "ember") return [r * 1.18 + 28, g * 0.62 + 6, b * 0.38];
  if (mood === "watch") return [r * 0.62 + 8, g * 0.58 + 10, b * 0.95 + 22];
  if (mood === "storm") {
    const gray = (r + g + b) / 3;
    return [gray * 0.7, gray * 0.78 + 6, gray * 0.92 + 14];
  }
  if (mood === "ash") return [r * 0.72 + 18, g * 0.66 + 8, b * 0.58];
  if (mood === "lantern") {
    const night = 0.34 + t * 0.08;
    return [r * night + 22 + (1 - t) * 18, g * night + 14, b * (night + 0.12) + 26];
  }
  if (mood === "dusk") return [r * 1.02 + 26, g * 0.7 + 8, b * 0.48 + 6];
  if (mood === "mile") {
    const night = 0.3 + t * 0.1;
    return [r * night + 8, g * (night + 0.04) + 12, b * (night + 0.22) + 32];
  }
  return [r, g, b];
}

const outW = 1280;
const outH = 720;

for (const job of jobs) {
  const src = load(job.src);
  const spanX = 1 / job.zoom;
  const spanY = 1 / job.zoom;
  let x0 = job.pan < 0 ? 1 - spanX + job.pan : job.pan;
  let y0 = job.lift;
  x0 = Math.max(0, Math.min(1 - spanX, x0));
  y0 = Math.max(0, Math.min(1 - spanY, y0));
  const data = Buffer.alloc(outW * outH * 4);
  for (let y = 0; y < outH; y += 1) {
    const sy = (y0 + (y / (outH - 1)) * spanY) * (src.height - 1);
    const y1 = Math.floor(sy);
    const y2 = Math.min(src.height - 1, y1 + 1);
    const fy = sy - y1;
    for (let x = 0; x < outW; x += 1) {
      const sx = (x0 + (x / (outW - 1)) * spanX) * (src.width - 1);
      const x1 = Math.floor(sx);
      const x2 = Math.min(src.width - 1, x1 + 1);
      const fx = sx - x1;
      const i11 = (y1 * src.width + x1) * 4;
      const i21 = (y1 * src.width + x2) * 4;
      const i12 = (y2 * src.width + x1) * 4;
      const i22 = (y2 * src.width + x2) * 4;
      const sample = (channel) =>
        mix(mix(src.data[i11 + channel], src.data[i21 + channel], fx), mix(src.data[i12 + channel], src.data[i22 + channel], fx), fy);
      let [r, g, b] = tone(job.mood, sample(0), sample(1), sample(2), y, outH);
      const edge = Math.min(x, outW - 1 - x) / outW;
      const shade = edge < 0.08 ? 0.86 + edge * 1.6 : 1;
      r *= shade;
      g *= shade;
      b *= shade;
      const i = (y * outW + x) * 4;
      data[i] = clamp(r);
      data[i + 1] = clamp(g);
      data[i + 2] = clamp(b);
      data[i + 3] = 255;
    }
  }
  writeFileSync(`public/backdrops/stage-${job.id}.jpg`, jpeg.encode({ data, width: outW, height: outH }, 82).data);
  console.log(job.id);
}
