import { writeFileSync } from "fs";
import { encodePng } from "./png.js";

const rows = 11;
const GLYPHS = {
  L: ["#.....", "#.....", "#.....", "#.....", "#.....", "#.....", "#.....", "#.....", "#.....", "#.....", "######"],
  A: ["..##..", ".#..#.", "#....#", "#....#", "#....#", "######", "#....#", "#....#", "#....#", "#....#", "#....#"],
  S: [".####.", "#.....", "#.....", ".###..", "....#.", ".....#", ".....#", ".....#", "#....#", ".####.", "......"],
  M: ["#....#", "##..##", "#.#..#", "#.#..#", "#....#", "#....#", "#....#", "#....#", "#....#", "#....#", "#....#"],
  P: ["####..", "#...#.", "#....#", "#....#", "#...#.", "####..", "#.....", "#.....", "#.....", "#.....", "#....."],
  SUN: ["..#.#..", ".#...#.", "#..#..#", ".#.#.#.", "..###..", ".#.#.#.", "#..#..#", ".#...#.", "..#.#..", ".......", "......."],
  DRAKE: ["....##.", "...####", "..##..#", ".##..##", "###..#.", "#..###.", "..##...", ".#.....", "#......", ".#.....", "#......"],
  SWORD: ["...#...", "..###..", "...#...", ".#####.", "...#...", "...#...", "...#...", "...#...", "...#...", "..#.#..", "...#..."],
  " ": ["..", "..", "..", "..", "..", "..", "..", "..", "..", "..", ".."],
};

const scale = 3;
const gap = 3;
const plan = ["DRAKE", " ", "L", "A", "S", "SWORD", " ", "SUN", " ", "L", "A", "M", "P"];
let width = scale;
for (const ch of plan) width += GLYPHS[ch][0].length * scale + gap;
width += scale;
const height = (rows + 2) * scale;
const gold = [236, 196, 96, 255];
const sun = [255, 228, 150, 255];
const gem = [176, 42, 36, 255];
const ink = [36, 20, 10, 255];
const rgba = Buffer.alloc(width * height * 4, 0);

function set(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = (y * width + x) * 4;
  rgba[i] = color[0];
  rgba[i + 1] = color[1];
  rgba[i + 2] = color[2];
  rgba[i + 3] = color[3];
}

let cursor = scale;
let swordAt = 0;
for (const ch of plan) {
  const glyph = GLYPHS[ch];
  if (ch === "SWORD") swordAt = cursor;
  const color = ch === "SUN" ? sun : gold;
  for (let gy = 0; gy < rows; gy += 1) {
    for (let gx = 0; gx < glyph[gy].length; gx += 1) {
      if (glyph[gy][gx] !== "#") continue;
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          const x = cursor + gx * scale + sx;
          const y = scale + gy * scale + sy;
          set(x + 1, y + 1, ink);
          set(x, y, color);
        }
      }
    }
  }
  cursor += glyph[0].length * scale + gap;
}

if (swordAt) {
  const gx = 3;
  const gy = 0;
  for (let sy = 0; sy < scale; sy += 1) {
    for (let sx = 0; sx < scale; sx += 1) set(swordAt + gx * scale + sx, scale + gy * scale + sy, gem);
  }
}

writeFileSync("public/icons/wordmark.png", encodePng(width, height, rgba));
console.log("wordmark", width, height);
