import { readFileSync, writeFileSync, existsSync } from "fs";
import jpeg from "jpeg-js";
import { encodePng } from "./png.js";

const ids = [
  "vesper", "cael", "ivo", "rhys", "soren", "juniper", "marek", "theo", "bastion",
  "niles", "orien", "kit", "pavel", "len", "remy", "nera", "silas", "maris",
];

function source(id) {
  const ult = `public/sprites/${id}-ult.jpg`;
  if (existsSync(ult)) return ult;
  return `public/sprites/${id}.jpg`;
}

const out = 480;

for (const id of ids) {
  const file = source(id);
  if (!existsSync(file)) {
    console.log("missing", id);
    continue;
  }
  const img = jpeg.decode(readFileSync(file), { useTArray: true, formatAsRGBA: true });
  const x0 = Math.floor(img.width * 0.28);
  const y0 = Math.floor(img.height * 0.04);
  const size = Math.floor(img.width * 0.44);
  const data = Buffer.alloc(out * out * 4);
  for (let y = 0; y < out; y += 1) {
    for (let x = 0; x < out; x += 1) {
      const sx = Math.min(img.width - 1, x0 + Math.floor((x / out) * size));
      const sy = Math.min(img.height - 1, y0 + Math.floor((y / out) * size));
      const from = (sy * img.width + sx) * 4;
      const to = (y * out + x) * 4;
      data[to] = img.data[from];
      data[to + 1] = img.data[from + 1];
      data[to + 2] = img.data[from + 2];
      data[to + 3] = img.data[from + 3] || 255;
    }
  }
  writeFileSync(`public/sprites/${id}-yell.png`, encodePng(out, out, data));
  console.log(id);
}
