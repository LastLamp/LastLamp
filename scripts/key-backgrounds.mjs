import fs from "fs";
import path from "path";
import jpeg from "jpeg-js";
import { encodePng } from "./png.js";
import { keyPaper, recenter } from "./paper.js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const JOBS = [
  { dir: "public/sprites", trim: false },
  { dir: "public/enemies", trim: false },
  { dir: "public/skills", trim: true },
  { dir: "public/icons", trim: true },
];

let wrote = 0;
for (const job of JOBS) {
  const dir = path.join(ROOT, job.dir);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".jpg")) continue;
    const file = path.join(dir, name);
    const decoded = jpeg.decode(fs.readFileSync(file), { useTArray: true, formatAsRGBA: true });
    const rgba = Buffer.from(decoded.data);
    keyPaper(rgba, decoded.width, decoded.height);
    const out = job.trim ? recenter(rgba, decoded.width, decoded.height) : rgba;
    const dest = file.replace(/\.jpg$/, ".png");
    fs.writeFileSync(dest, encodePng(decoded.width, decoded.height, out));
    wrote += 1;
  }
}
console.log(`Keyed ${wrote} images.`);
