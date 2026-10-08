// The API stores platforms as one run-together string ("Windows PlayStation 5 ...").
// Split it back into names, normalising a few spelling variants used in the data.
const VARIANTS = [
  ["Xbox Series X & S", "Xbox Series X/S"],
  ["Xbox Series X/S", "Xbox Series X/S"],
  ["Microsoft Windows", "Windows"],
  ["Nintendo Switch", "Nintendo Switch"],
  ["PlayStation 5", "PlayStation 5"],
  ["PlayStation 4", "PlayStation 4"],
  ["PlayStation 3", "PlayStation 3"],
  ["Google Stadia", "Stadia"],
  ["Xbox One", "Xbox One"],
  ["Xbox 360", "Xbox 360"],
  ["Windows", "Windows"],
  ["macOS", "macOS"],
  ["OS X", "macOS"],
  ["Linux", "Linux"],
  ["Android", "Android"],
  ["Stadia", "Stadia"],
  ["iOS", "iOS"],
  ["PC", "PC"],
];

const PATTERN = new RegExp(
  VARIANTS.map(([name]) => name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|"),
  "g"
);

export const splitPlatforms = (text = "") => {
  const matches = text.match(PATTERN) || [];
  const names = matches.map((m) => VARIANTS.find(([v]) => v === m)[1]);
  const unique = [...new Set(names)];
  // If nothing was recognised, fall back to showing the raw text as one item.
  return unique.length ? unique : text ? [text] : [];
};
