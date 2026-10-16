function shuffle(list, roll) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(roll() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function spread(list, roll) {
  const lanes = new Map();
  for (const foe of list) {
    if (!lanes.has(foe.element)) lanes.set(foe.element, []);
    lanes.get(foe.element).push(foe);
  }
  const elements = shuffle([...lanes.keys()], roll);
  const rows = elements.map((element) => shuffle(lanes.get(element), roll));
  const out = [];
  let left = list.length;
  let lane = 0;
  while (left > 0 && lane < rows.length * (list.length + 1)) {
    const row = rows[lane % rows.length];
    if (row.length) {
      out.push(row.shift());
      left -= 1;
    }
    lane += 1;
  }
  return out;
}

export function makeDealer(list, roll) {
  const source = list.length ? list : [];
  let deck = spread(source, roll);
  let index = 0;
  return function draw(avoidElements = new Set(), avoidArts = new Set()) {
    if (!deck.length) return null;
    if (index >= deck.length) {
      deck = spread(source, roll);
      index = 0;
    }
    let pickAt = -1;
    for (let n = 0; n < deck.length - index; n += 1) {
      const foe = deck[index + n];
      if (avoidArts.has(foe.art) || avoidElements.has(foe.element)) continue;
      pickAt = index + n;
      break;
    }
    if (pickAt < 0) {
      for (let n = 0; n < deck.length - index; n += 1) {
        if (!avoidArts.has(deck[index + n].art)) {
          pickAt = index + n;
          break;
        }
      }
    }
    if (pickAt < 0) pickAt = index;
    const picked = deck[pickAt];
    if (pickAt !== index) {
      deck.splice(pickAt, 1);
      deck.splice(index, 0, picked);
    }
    index += 1;
    return picked;
  };
}
