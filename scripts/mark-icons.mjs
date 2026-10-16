import { writeFileSync } from "fs";
import { encodePng } from "./png.js";

const S = 32;
const INK = [28, 22, 16, 255];

function blank() {
  return Array.from({ length: S }, () => Array.from({ length: S }, () => [0, 0, 0, 0]));
}

function shade(base, light, x, y) {
  const t = Math.max(0, Math.min(1, (x * 0.35 + (S - y) * 0.65) / S));
  return base.map((channel, i) => Math.round(channel + (light[i] - channel) * t * 0.85));
}

function paint(fill) {
  const grid = blank();
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const color = fill(x + 0.5, y + 0.5);
      if (color) grid[y][x] = color.length === 4 ? color : [...color, 255];
    }
  }
  const outlined = grid.map((row) => row.map((pixel) => pixel.slice()));
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      if (grid[y][x][3] > 0) continue;
      const near = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dy, dx]) => {
        const ny = y + dy;
        const nx = x + dx;
        return ny >= 0 && nx >= 0 && ny < S && nx < S && grid[ny][nx][3] > 0;
      });
      if (near) outlined[y][x] = INK;
    }
  }
  const rgba = Buffer.alloc(S * S * 4);
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const pixel = outlined[y][x];
      const i = (y * S + x) * 4;
      rgba[i] = pixel[0];
      rgba[i + 1] = pixel[1];
      rgba[i + 2] = pixel[2];
      rgba[i + 3] = pixel[3];
    }
  }
  return encodePng(S, S, rgba);
}

function sword(x, y) {
  const cx = 16;
  if (y < 3 || y > 29) return null;
  if (y < 7) {
    const w = (y - 2.2) * 0.72;
    if (Math.abs(x - cx) <= w) return x < cx ? [255, 236, 170] : [232, 176, 64];
  }
  if (y < 18 && Math.abs(x - cx) <= 2.4) return x < cx + 0.4 ? [255, 228, 150] : [214, 154, 48];
  if (y >= 17.5 && y < 21 && Math.abs(x - cx) <= 8) return y < 19 ? [92, 64, 40] : [58, 40, 28];
  if (y >= 21 && y < 28 && Math.abs(x - cx) <= 1.7) return [120, 78, 46];
  if (y >= 27 && y < 29.5 && Math.abs(x - cx) <= 2.6) return [214, 168, 64];
  return null;
}

function star(x, y) {
  const dx = Math.abs(x - 16);
  const dy = Math.abs(y - 16);
  if (dx / 6.2 + dy / 6.2 <= 1) return dx + dy < 4 ? [255, 248, 220] : [255, 214, 96];
  if ((dy < 1.7 && dx < 13) || (dx < 1.7 && dy < 13)) return [240, 168, 40];
  if (Math.abs(dx - dy) < 1.15 && dx > 4 && dx < 9) return [255, 206, 90];
  return null;
}

function shield(x, y) {
  if (y < 4 || y > 29) return null;
  const half = y < 14 ? 11 : 11 * ((29.2 - y) / 15.2);
  if (Math.abs(x - 16) > half) return null;
  if (Math.abs(x - 16) < 3.2 && y > 9 && y < 18) return [255, 250, 243];
  return shade([70, 130, 196], [186, 224, 255], x, y);
}

function eye(x, y) {
  const dx = (x - 16) / 12;
  const dy = (y - 16) / 7.2;
  if (dx * dx + dy * dy > 1) return null;
  const pupil = Math.hypot(x - 16, y - 16);
  if (pupil < 2.2) return [28, 22, 16];
  if (pupil < 4.6) return [124, 86, 196];
  if (Math.hypot(x - 13.2, y - 14.2) < 1.5) return [255, 250, 243];
  return [232, 236, 248];
}

function cross(x, y) {
  if (Math.hypot(x - 16, y - 16) > 12) return null;
  const bar = (Math.abs(x - 16) < 3.1 && y > 8 && y < 24) || (Math.abs(y - 16) < 3.1 && x > 8 && x < 24);
  if (bar) return [255, 250, 243];
  return shade([46, 140, 96], [150, 214, 170], x, y);
}

function flame(x, y) {
  if (y < 3 || y > 29) return null;
  const lean = Math.sin((y - 3) / 6) * 1.3;
  const width = y < 8 ? (y - 2) * 0.85 : Math.sin(((y - 3) / 26) * Math.PI) * 9.2;
  if (Math.abs(x - 16 - lean) > width) return null;
  const core = Math.abs(x - 16) < width * 0.38 && y > 12 && y < 24;
  if (core) return [255, 236, 160];
  if (y < 14) return [255, 150, 48];
  return [214, 64, 36];
}

function gust(x, y) {
  const cx = 16.2;
  const cy = 16.6;
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.hypot(dx, dy);
  let ang = Math.atan2(dy, dx);
  if (ang < 0) ang += Math.PI * 2;
  const light = [198, 236, 170];
  const mid = [46, 150, 68];
  const deep = [16, 88, 38];
  const turns = 3.15;
  const maxTheta = Math.PI * 2 * turns;
  const growth = 12.4 / maxTheta;
  for (let k = 0; k < 4; k += 1) {
    const theta = ang + Math.PI * 2 * k;
    if (theta < 0.35 || theta > maxTheta) continue;
    const radius = 0.45 + growth * theta;
    const thick = 0.72 + theta * 0.045;
    if (Math.abs(r - radius) > thick * 0.52) continue;
    const t = theta / maxTheta;
    if (t > 0.72) return light;
    if (t < 0.28) return deep;
    return mid;
  }
  return null;
}

function drop(x, y) {
  if (y >= 14 && Math.hypot(x - 16, y - 19) <= 8.2) return shade([36, 120, 196], [180, 230, 255], x, y);
  if (y < 15 && y > 3) {
    const width = (y - 3) * 0.72;
    if (Math.abs(x - 16) <= width) return x < 15 ? [214, 240, 255] : [48, 140, 210];
  }
  return null;
}

function gem(x, y) {
  const dx = Math.abs(x - 16);
  const top = y > 6 && y < 14 && dx < (y - 6) * 1.35;
  const body = y >= 14 && y < 26 && dx < (26 - y) * 1.15 + 1;
  if (!top && !body) return null;
  if (x < 16 && y < 20) return [255, 228, 186];
  if (dx < 2 && y > 10 && y < 24) return [255, 244, 220];
  return y < 16 ? [212, 150, 78] : [150, 96, 48];
}

function moon(x, y) {
  const main = Math.hypot(x - 15, y - 16);
  const bite = Math.hypot(x - 21, y - 13);
  if (main < 10 && bite > 8) return main < 6.5 ? [214, 196, 255] : [124, 92, 196];
  if (Math.hypot(x - 8, y - 8) < 1.3) return [255, 236, 170];
  return null;
}

function soul(x, y) {
  if (y < 3 || y > 29) return null;
  if (y < 11 && Math.abs(x - 16) < 1.15) return null;
  const lean = Math.sin(y / 4.5) * 0.7;
  const width = y < 12 ? 1.6 + (y - 3) * 0.55 : 3 + ((29 - y) / 17) * 6;
  if (Math.abs(x - 16 - lean) > width) return null;
  if (Math.abs(x - 15.2) < width * 0.34 && y > 13 && y < 25) return [240, 252, 255];
  return y < 15 ? [150, 214, 255] : [24, 104, 214];
}

const files = {
  attacker: sword,
  support: star,
  guardian: shield,
  controller: eye,
  healer: cross,
  flare: flame,
  gale: gust,
  tide: drop,
  stone: gem,
  veil: moon,
  ap: soul,
};

const only = process.argv[2];
for (const [name, draw] of Object.entries(files)) {
  if (only && name !== only) continue;
  writeFileSync(`public/icons/${name}.png`, paint(draw));
  console.log(name);
}
