// Live cast. These portraits do not match each other.
// Add an id only after its bust is painted and `npm run check-faces` reports no pair
// against anyone already listed. Draw the sprite from that locked portrait afterward.
export const ROSTER_IDS = [
  "amber",
  "beck",
  "col",
  "corin",
  "daph",
  "faye",
  "grim",
  "harren",
  "hestia",
  "ilyra",
  "leif",
  "lira",
  "lumen",
  "marek",
  "nell",
  "nessa",
  "odette",
  "rowan",
  "seraphine",
  "solenne",
  "soren",
  "thalia",
  "willa",
];

export const ROSTER = new Set(ROSTER_IDS);
