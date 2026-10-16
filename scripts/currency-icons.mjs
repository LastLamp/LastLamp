import { writeFileSync } from "fs";
import { encodePng } from "./png.js";

const T = [0, 0, 0, 0];
const I = [44, 36, 27, 255];
const D = [166, 112, 36, 255];
const G = [232, 184, 92, 255];
const H = [255, 226, 160, 255];
const C = [255, 250, 243, 255];
const L = [196, 154, 110, 255];
const R = [184, 68, 58, 255];
const P = [232, 150, 132, 255];

const mark = [
  "................",
  "....IIIIIIII....",
  "...IDDDDDDDDI...",
  "..IDGGGGGGGGDI..",
  ".IDGHHHHHHHHGDI.",
  ".IDGHHHDDHHHGDI.",
  ".IDGHHDDDDHHGDI.",
  ".IDGHHDDDDHHGDI.",
  ".IDGHHHDDHHHGDI.",
  ".IDGHHHHHHHHGDI.",
  "..IDGGGGGGGGDI..",
  "...IDDDDDDDDI...",
  "....IIIIIIII....",
  "................",
  "................",
  "................",
];

const note = [
  "................",
  "...IIIIIIIIII...",
  "..IDDDDDDDDDDI..",
  "..IDCCCCCCCCDI..",
  "..IDCLLLLLLCDI..",
  "..IDCCCCCCCCDI..",
  "..IDCLLLLLLCDI..",
  "..IDCCCCCCCCDI..",
  "..IDCLLLLLLCDI..",
  "..IDCCCCCCCCDI..",
  "..IDDDDDDDDDDI..",
  "...IIIIIIIIII...",
  "................",
  "................",
  "................",
  "................",
];

const bond = [
  "................",
  "................",
  "..II......II....",
  ".IPPP....IPPP...",
  ".IPRRR..IPRRRI..",
  ".IPRRRRIIPRRRI..",
  "..IPRRRRRRRRRI..",
  "...IPRRRRRRRI...",
  "....IPRRRRRI....",
  ".....IPRRRI.....",
  "......IPRI......",
  ".......II.......",
  "................",
  "................",
  "................",
  "................",
];

const B = [90, 150, 220, 255];
const W = [214, 236, 255, 255];
const E = [255, 122, 69, 255];
const Y = [92, 140, 64, 255];
const F = [232, 96, 120, 255];

const shard = [
  "................",
  ".......II.......",
  "......IWWI......",
  ".....IWBBWI.....",
  "....IWBBBBWI....",
  "...IWBWWWWBWI...",
  "...IBBBBBBBBI...",
  "....IWBBBBWI....",
  ".....IBWWBI.....",
  "......IBBI......",
  ".......II.......",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const xp = [
  "................",
  ".......II.......",
  "......IDDI......",
  ".....IDDDDI.....",
  "......IDDI......",
  "....II.II.II....",
  "...IDDDDDDDDI...",
  "....II....II....",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const fanmail = [
  "................",
  "..IIIIIIIIIIII..",
  "..ICCCCCCCCCCI..",
  "..ICLLLLLLLLCI..",
  "..ICCCCCCCCCCI..",
  "..ICLLLLLLLLCI..",
  "..ICCCCCRRCCCI..",
  "..ICLLLLRRLLCI..",
  "..ICCCCCRRCCCI..",
  "..ICCCCCCCCCCI..",
  "..IIIIIIIIIIII..",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const bouquet = [
  "................",
  "....FF....FF....",
  "...FFFF..FFFF...",
  "....FF....FF....",
  "......YYYY......",
  ".....YYYYYY.....",
  "......YYYY......",
  ".......YY.......",
  ".......YY.......",
  "......YYYY......",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const keepsake = [
  "................",
  "......IIII......",
  ".....IEEEEI.....",
  "....IEEHHHEI....",
  "...IEEHHHHHEI...",
  "...IEHHDDHHEI...",
  "...IEEHHHHHEI...",
  "....IEEHHHEI....",
  ".....IEEEEI.....",
  "......IIII......",
  ".......II.......",
  ".......II.......",
  "................",
  "................",
  "................",
  "................",
];

const V = [176, 140, 230, 255];
const A = [94, 210, 186, 255];

const attacker = [
  ".......II.......",
  "......IGGI......",
  "......IGGI......",
  "......IGGI......",
  "......IGGI......",
  "......IGGI......",
  "....IIIGGIII....",
  "......IGGI......",
  "......IGGI......",
  "......IIII......",
  "......ICCI......",
  "......ICCI......",
  "......IIII......",
  "................",
  "................",
  "................",
];

const support = [
  ".......II.......",
  "......IIII......",
  ".....IIIIII.....",
  "....IHHHHHI.....",
  "...IHHHHHHHI....",
  "...IHHGGHHHI....",
  "...IHHHHHHHI....",
  "....IIIIIII.....",
  ".....ICCCI......",
  ".....ICCCI......",
  ".....ICCCI......",
  "....IIIIIII.....",
  "...IIIIIIIII....",
  "................",
  "................",
  "................",
];

const guardian = [
  "..IIIIIIIIIIII..",
  ".IBBBBBBBBBBBBI.",
  ".IBBBCCCCCCBBBI.",
  ".IBBBCCCCCCBBBI.",
  ".IBBBCCBBCCBBBI.",
  ".IBBBCCBBCCBBBI.",
  ".IBBBCCCCCCBBBI.",
  ".IBBBCCCCCCBBBI.",
  ".IBBBBBBBBBBBBI.",
  "..IBBBBBBBBBBI..",
  "...IBBBBBBBBI...",
  "....IBBBBBBI....",
  ".....IBBBBI.....",
  "......IBBI......",
  ".......II.......",
  "................",
];

const controller = [
  "................",
  ".....IIIIII.....",
  "....IWWWWWWI....",
  "...IWWWIIWWWI...",
  "...IWWIIIIWWI...",
  "...IWIIIIIIWI...",
  "...IWWIIIIWWI...",
  "...IWWWIIWWWI...",
  "....IWWWWWWI....",
  ".....IIIIII.....",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const healer = [
  "................",
  "......IIII......",
  ".....IYYYYI.....",
  ".....IYYYYI.....",
  ".....IYYYYI.....",
  "..IIIIYYYYIIII..",
  ".IYYYYYYYYYYYYI.",
  ".IYYYYYYYYYYYYI.",
  "..IIIIYYYYIIII..",
  ".....IYYYYI.....",
  ".....IYYYYI.....",
  ".....IYYYYI.....",
  "......IIII......",
  "................",
  "................",
  "................",
];

const flare = [
  "................",
  ".......II.......",
  "......IEEE......",
  ".....IEEEEI.....",
  "....IEERRREI....",
  "...IERRRRRREI...",
  "...IRRRRRRRRI...",
  "...IRRRHHRRRI...",
  "....IRRRRRRI....",
  ".....IERRRI.....",
  "......IEEE......",
  ".......II.......",
  "................",
  "................",
  "................",
  "................",
];

const gale = [
  "................",
  "..AAAAAAAAAA....",
  ".IAAAAAAAAAAI...",
  "..IIIIIIIIII....",
  "....AAAAAAAAAA..",
  "...IAAAAAAAAAAI.",
  "....IIIIIIIIII..",
  "..AAAAAAAAAA....",
  ".IAAAAAAAAAAI...",
  "..IIIIIIIIII....",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const tide = [
  "................",
  "..BBBBBBBBBBBB..",
  ".BB..........BB.",
  "..BBBBBBBBBBBB..",
  "................",
  "..BBBBBBBBBBBB..",
  ".BB..........BB.",
  "..BBBBBBBBBBBB..",
  "................",
  "..BBBBBBBBBBBB..",
  ".BB..........BB.",
  "..BBBBBBBBBBBB..",
  "................",
  "................",
  "................",
  "................",
];

const stone = [
  ".......II.......",
  "......IDDI......",
  ".....IDHHDI.....",
  "....IDHHHHDI....",
  "...IDHHHHHHDI...",
  "..IDHHHHHHHHDI..",
  "..IDHHHDDHHHDI..",
  "..IDDDDDDDDDDI..",
  "...IDDDDDDDDI...",
  "....IDDDDDDI....",
  ".....IIIIII.....",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const veil = [
  "................",
  "......IIII......",
  ".....IVVVVI.....",
  "....IVVVVVV.....",
  "...IVVVVVVV.....",
  "...IVVVVV.......",
  "...IVVVVV.......",
  "...IVVVVVVV.....",
  "....IVVVVVV.....",
  ".....IVVVVI.....",
  "......IIII......",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const O = [46, 140, 90, 255];
const S = [255, 214, 90, 255];
const M = [176, 48, 40, 255];
const K = [92, 78, 68, 255];

const story = [
  "................",
  "..IIIIIIIIIIII..",
  ".ICCCCCICCCCCCI.",
  ".ICLLLLCICLLLCI.",
  ".ICCCCCICCCCCCI.",
  ".ICLLLLCICLLLCI.",
  ".ICCCCCICCCCCCI.",
  ".ICLLLLCICLLLCI.",
  ".ICCCCCICCCCCCI.",
  ".IIIIIIIIIIIIII.",
  "..IIIIIIIIIIII..",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const ascend = [
  "................",
  ".............II.",
  "...........IIDDI",
  ".........IIDDDDI",
  ".......IIDDDDDDI",
  ".....IIDDDDDDDDI",
  "...IIDDDDDDDDDDI",
  ".IIDDDDDDDDDDDDI",
  "IIIIIIIIIIIIIIII",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const poison = [
  "................",
  ".......OO.......",
  "......OYYO......",
  ".....OYHHYO.....",
  "....OYHHHHYO....",
  "....OYHHYYHY....",
  ".....OYHHYO.....",
  "......OYYO......",
  ".......OO.......",
  ".......II.......",
  "......IIII......",
  ".....IOOOOI.....",
  ".....IOOOOI.....",
  "......IIII......",
  "................",
  "................",
];

const stun = [
  "................",
  ".......SS.......",
  "......SGGS......",
  ".......SS.......",
  "...SS..SS..SS...",
  "..SGGSSGGSSGGS..",
  "...SS..SS..SS...",
  ".......SS.......",
  "......SGGS......",
  ".......SS.......",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const sleep = [
  "................",
  "......IIII......",
  ".....IVVVI......",
  "....IVVVV.......",
  "...IVVVV........",
  "...IVVV.........",
  "...IVVVV........",
  "....IVVVV.......",
  ".....IVVVI......",
  "......IIII......",
  "..........CC....",
  ".........CC.....",
  "........CC......",
  "................",
  "................",
  "................",
];

const weak = [
  "................",
  "................",
  "......IIII......",
  "......ILLL......",
  "......ILLL......",
  "......ILLL......",
  "....IILLLLII....",
  ".....ILLLLI.....",
  "......ILLL......",
  ".......II.......",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const exposed = [
  "................",
  "................",
  "....MMMMMMMM....",
  "...MM......MM...",
  "..MM..MMMM..MM..",
  "..MM.M....M.MM..",
  "..MM.M.MM.M.MM..",
  "..MM.M.MM.M.MM..",
  "..MM.M....M.MM..",
  "..MM..MMMM..MM..",
  "...MM......MM...",
  "....MMMMMMMM....",
  "................",
  "................",
  "................",
  "................",
];

const block = [
  "................",
  "....IIIIIIII....",
  "...IBBBBBBBBI...",
  "..IBBWWWWWWBBI..",
  "..IBBWWWWWWBBI..",
  "..IBBBBBBBBBBI..",
  "...IBBBBBBBBI...",
  "....IBBBBBBI....",
  ".....IBBBBI.....",
  "......IBBI......",
  ".......II.......",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const lockup = [
  "................",
  "......IIII......",
  ".....I....I.....",
  ".....I....I.....",
  "....IIIIIIII....",
  "....IKKKKKKI....",
  "....IKKIIKKI....",
  "....IKKKKKKI....",
  "....IKKIIKKI....",
  "....IKKKKKKI....",
  "....IIIIIIII....",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const rage = [
  "................",
  ".......MM.......",
  "......MHHM......",
  ".....MHHHHM.....",
  "....MHHMMHHM....",
  "....MHHHHHHM....",
  "...MMHHHHHHMM...",
  "...MMHHHHHHMM...",
  "....MHHHHHHM....",
  ".....MHHHHM.....",
  "......MHHM......",
  ".......MM.......",
  "................",
  "................",
  "................",
  "................",
];

const ink = { I, D, G, H, C, L, R, P, B, W, E, Y, F, V, A, O, S, M, K, ".": T };

function paint(rows, scale = 8) {
  const height = rows.length;
  const width = rows[0].length;
  const rgba = Buffer.alloc(width * scale * height * scale * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const px = ink[rows[y][x]] || T;
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const i = ((y * scale + dy) * width * scale + (x * scale + dx)) * 4;
          rgba[i] = px[0];
          rgba[i + 1] = px[1];
          rgba[i + 2] = px[2];
          rgba[i + 3] = px[3];
        }
      }
    }
  }
  return encodePng(width * scale, height * scale, rgba);
}

for (const [name, rows] of [
  ["mark", mark],
  ["note", note],
  ["bond", bond],
  ["shard", shard],
  ["xp", xp],
  ["fanmail", fanmail],
  ["bouquet", bouquet],
  ["keepsake", keepsake],
  ["attacker", attacker],
  ["support", support],
  ["guardian", guardian],
  ["controller", controller],
  ["healer", healer],
  ["flare", flare],
  ["gale", gale],
  ["tide", tide],
  ["stone", stone],
  ["veil", veil],
  ["story", story],
  ["ascend", ascend],
  ["status-poison", poison],
  ["status-stun", stun],
  ["status-sleep", sleep],
  ["status-weak", weak],
  ["status-exposed", exposed],
  ["status-block", block],
  ["status-break", lockup],
  ["status-rage", rage],
]) {
  rows.forEach((row, i) => {
    if (row.length !== 16) throw new Error(`${name} row ${i} is ${row.length}`);
  });
}

writeFileSync("public/icons/mark.png", paint(mark));
writeFileSync("public/icons/note.png", paint(note));
writeFileSync("public/icons/bond.png", paint(bond));
writeFileSync("public/icons/shard.png", paint(shard));
writeFileSync("public/icons/xp.png", paint(xp));
writeFileSync("public/icons/fanmail.png", paint(fanmail));
writeFileSync("public/icons/bouquet.png", paint(bouquet));
writeFileSync("public/icons/keepsake.png", paint(keepsake));
writeFileSync("public/icons/attacker.png", paint(attacker));
writeFileSync("public/icons/support.png", paint(support));
writeFileSync("public/icons/guardian.png", paint(guardian));
writeFileSync("public/icons/controller.png", paint(controller));
writeFileSync("public/icons/healer.png", paint(healer));
writeFileSync("public/icons/flare.png", paint(flare));
writeFileSync("public/icons/gale.png", paint(gale));
writeFileSync("public/icons/tide.png", paint(tide));
writeFileSync("public/icons/stone.png", paint(stone));
writeFileSync("public/icons/veil.png", paint(veil));
writeFileSync("public/icons/story.png", paint(story));
writeFileSync("public/icons/ascend.png", paint(ascend));
writeFileSync("public/icons/status-poison.png", paint(poison));
writeFileSync("public/icons/status-stun.png", paint(stun));
writeFileSync("public/icons/status-sleep.png", paint(sleep));
writeFileSync("public/icons/status-weak.png", paint(weak));
writeFileSync("public/icons/status-exposed.png", paint(exposed));
writeFileSync("public/icons/status-block.png", paint(block));
writeFileSync("public/icons/status-break.png", paint(lockup));
writeFileSync("public/icons/status-rage.png", paint(rage));
