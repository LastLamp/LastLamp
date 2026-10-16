import fs from "fs";
import path from "path";
import jpeg from "jpeg-js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(ROOT, "public", "portraits");
const REPORT = path.join(ROOT, "src", "plateReport.json");
const ANCHORS = ["soren", "marek"];
const STYLE_MIN = Number(process.env.PLATE_STYLE_MIN || 72);
const GRID = 180;

function decode(file) {
  const decoded = jpeg.decode(fs.readFileSync(file), { useTArray: true, formatAsRGBA: true });
  return { width: decoded.width, height: decoded.height, data: decoded.data };
}

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isPaper(r, g, b) {
  const l = lum(r, g, b);
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  return l > 242 && chroma < 18;
}

function sample(image) {
  const { width, height, data } = image;
  const lumg = new Float32Array(GRID * GRID);
  const paper = new Uint8Array(GRID * GRID);
  for (let gy = 0; gy < GRID; gy += 1) {
    const y = Math.min(height - 1, Math.floor((gy + 0.5) * height / GRID));
    for (let gx = 0; gx < GRID; gx += 1) {
      const x = Math.min(width - 1, Math.floor((gx + 0.5) * width / GRID));
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const index = gy * GRID + gx;
      lumg[index] = lum(r, g, b);
      paper[index] = isPaper(r, g, b) ? 1 : 0;
    }
  }
  return { lumg, paper };
}

const SHADE_EDGES = [2, 6, 12, 22, 40, 70];

function shadeBin(gradient) {
  for (let i = 0; i < SHADE_EDGES.length; i += 1) {
    if (gradient < SHADE_EDGES[i]) return i;
  }
  return SHADE_EDGES.length;
}

function features(image) {
  const { lumg, paper } = sample(image);
  let subject = 0;
  let minX = GRID;
  let minY = GRID;
  let maxX = -1;
  let maxY = -1;
  const shade = new Float64Array(SHADE_EDGES.length + 1);
  const faceShade = new Float64Array(SHADE_EDGES.length + 1);
  let faceN = 0;
  let faceLap = 0;
  let gradSum = 0;
  let lineSum = 0;
  let lapSum = 0;
  let lapN = 0;
  let blockN = 0;
  let blockStd = 0;
  let flatBlocks = 0;

  function at(x, y) {
    return lumg[y * GRID + x];
  }
  function onPaper(x, y) {
    return paper[y * GRID + x] === 1;
  }

  for (let y = 1; y < GRID - 1; y += 1) {
    for (let x = 1; x < GRID - 1; x += 1) {
      if (onPaper(x, y)) continue;
      subject += 1;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      const center = at(x, y);
      const dx = Math.abs(center - at(x + 1, y));
      const dy = Math.abs(center - at(x, y + 1));
      const gradient = Math.max(dx, dy);
      shade[shadeBin(gradient)] += 1;
      gradSum += gradient;
      if (gradient > 28) lineSum += gradient;
      const lap = Math.abs(4 * center - at(x - 1, y) - at(x + 1, y) - at(x, y - 1) - at(x, y + 1));
      lapSum += lap;
      lapN += 1;
      const inFace = x > GRID * 0.28 && x < GRID * 0.72 && y > GRID * 0.16 && y < GRID * 0.58;
      if (inFace) {
        faceShade[shadeBin(gradient)] += 1;
        faceLap += lap;
        faceN += 1;
      }
    }
  }

  const block = 8;
  for (let y = 0; y + block <= GRID; y += block) {
    for (let x = 0; x + block <= GRID; x += block) {
      let n = 0;
      let sum = 0;
      let sum2 = 0;
      for (let dy = 0; dy < block; dy += 1) {
        for (let dx = 0; dx < block; dx += 1) {
          if (onPaper(x + dx, y + dy)) continue;
          const value = at(x + dx, y + dy);
          n += 1;
          sum += value;
          sum2 += value * value;
        }
      }
      if (n < block * block * 0.7) continue;
      const mean = sum / n;
      const std = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
      blockN += 1;
      blockStd += std;
      if (std < 6) flatBlocks += 1;
    }
  }

  const safe = Math.max(1, subject);
  const faceSafe = Math.max(1, faceN);
  for (let i = 0; i < shade.length; i += 1) {
    shade[i] /= safe;
    faceShade[i] /= faceSafe;
  }
  const samples = GRID * GRID;
  return {
    topGap: subject ? minY / GRID : 1,
    bottomGap: subject ? (GRID - 1 - maxY) / GRID : 1,
    sideGap: subject ? Math.min(minX, GRID - 1 - maxX) / GRID : 1,
    fill: subject / samples,
    shade: Array.from(shade),
    faceShade: Array.from(faceShade),
    faceDetail: faceN ? faceLap / faceN : 0,
    detail: lapN ? lapSum / lapN : 0,
    line: gradSum ? lineSum / gradSum : 0,
    bands: blockN ? blockStd / blockN : 0,
    flatBlocks: blockN ? flatBlocks / blockN : 0,
  };
}

function frameNotes(row) {
  const notes = [];
  if (row.topGap > 0.03) notes.push("head sits too low");
  if (row.bottomGap > 0.04) notes.push("too much body in frame");
  if (row.sideGap > 0.04) notes.push("empty space at the side");
  if (row.fill < 0.55) notes.push("zoomed out");
  if (row.fill > 0.8) notes.push("cropped tighter than the anchors");
  return notes;
}

function l1(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum;
}

function share(hist, from, to) {
  let sum = 0;
  for (let i = from; i <= to; i += 1) sum += hist[i];
  return sum;
}

function shadeNotes(row, anchor) {
  const notes = [];
  const form = share(row.faceShade, 2, 4);
  const flat = share(row.faceShade, 0, 1);
  if (form < anchor.form - 0.07 || flat > anchor.flat + 0.08) notes.push("flatter face shading");
  if (form > anchor.form + 0.08) notes.push("more modeled than the anchors");
  if (row.faceDetail < anchor.faceDetail * 0.72) notes.push("shallower shadows");
  if (row.faceDetail > anchor.faceDetail * 1.35) notes.push("busier face shading");
  if (row.line > anchor.line * 1.35) notes.push("harder outlines");
  if (row.line < anchor.line * 0.65) notes.push("softer outlines");
  return notes;
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".jpg")).sort();
const measured = files.map((name) => {
  const id = name.slice(0, -4);
  return { id, ...features(decode(path.join(DIR, name))) };
});

const anchorRows = ANCHORS.map((id) => measured.find((row) => row.id === id));
if (anchorRows.some((row) => !row)) {
  console.error("Style anchors missing. Need portraits/soren.jpg and portraits/marek.jpg.");
  process.exit(1);
}

const anchor = {
  faceShade: anchorRows[0].faceShade.map((value, index) => (value + anchorRows[1].faceShade[index]) / 2),
  faceDetail: (anchorRows[0].faceDetail + anchorRows[1].faceDetail) / 2,
  line: (anchorRows[0].line + anchorRows[1].line) / 2,
};
anchor.form = share(anchor.faceShade, 2, 4);
anchor.flat = share(anchor.faceShade, 0, 1);

const rows = measured
  .map((row) => {
    const distance = l1(row.faceShade, anchor.faceShade);
    const shade = Math.max(0, 100 - distance * 110);
    const form = anchor.form ? (share(row.faceShade, 2, 4) / anchor.form) * 100 : 0;
    const depth = anchor.faceDetail ? (row.faceDetail / anchor.faceDetail) * 100 : 0;
    const differ = shadeNotes(row, anchor);
    return {
      id: row.id,
      anchor: ANCHORS.includes(row.id),
      shade: Number(shade.toFixed(1)),
      form: Number(form.toFixed(1)),
      depth: Number(depth.toFixed(1)),
      faceDetail: Number(row.faceDetail.toFixed(2)),
      faceShade: row.faceShade.map((value) => Number(value.toFixed(3))),
      fill: Number(row.fill.toFixed(3)),
      frame: frameNotes(row),
      differ,
    };
  })
  .sort((a, b) => a.shade - b.shade);

const flagged = rows.filter((row) => !row.anchor && (row.shade < STYLE_MIN || row.differ.length));
fs.writeFileSync(
  REPORT,
  JSON.stringify({
    styleMin: STYLE_MIN,
    anchors: ANCHORS,
    anchor: {
      form: Number(anchor.form.toFixed(3)),
      flat: Number(anchor.flat.toFixed(3)),
      faceDetail: Number(anchor.faceDetail.toFixed(2)),
      faceShade: anchor.faceShade.map((value) => Number(value.toFixed(3))),
    },
    rows,
  }, null, 2)
);

console.log(`Face shading vs ${ANCHORS.join(" + ")}. Shade 100 matches their shadow shape. Form 100 is the same amount of modeling. Depth 100 is the same shadow strength.`);
console.log(`Flag shade under ${STYLE_MIN}, or a shading note.`);
console.log("id         shade   form  depth  how the shading differs");
for (const row of rows) {
  const mark = row.anchor ? "*" : row.shade < STYLE_MIN || row.differ.length ? "!" : " ";
  console.log(
    `${mark} ${row.id.padEnd(10)} ${row.shade.toFixed(1).padStart(5)}  ${row.form.toFixed(0).padStart(5)}  ${row.depth.toFixed(0).padStart(5)}  ${row.differ.join("; ")}`
  );
}
console.log(`${flagged.length} of ${rows.length - ANCHORS.length} plates shade differently from the anchors.`);
if (flagged.length) process.exit(1);
