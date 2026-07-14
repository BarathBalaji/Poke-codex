import kanto from "@/content/kanto.json";
import notes from "@/content/notes.json";

export interface Species {
  id: number;
  name: string;
  genus: string;
  types: string[];
  height: number;
  weight: number;
  abilities: { name: string; hidden: boolean }[];
  stats: Record<string, number>;
  habitat: string;
  color: string;
  isLegendary: boolean;
  isMythical: boolean;
  captureRate: number;
  flavor: { version: string; text: string }[];
  range: Record<string, string[]>;
  moves: { level: number; name: string; type: string; desc: string }[];
}

export interface PageMember {
  id: number;
  from: number | null;
  method: string | null;
}

export interface FolioPage {
  chainId: number;
  members: PageMember[];
  folio: number;
  slug: string;
  region?: string;
}

export interface SpeciesNote {
  notes: string;
  scribe?: string;
}

const data = kanto as unknown as {
  region: string;
  species: Record<string, Species>;
  pages: FolioPage[];
};

const speciesNotes = notes as unknown as Record<string, SpeciesNote>;

export const pages: FolioPage[] = data.pages;
export const getSpecies = (id: number): Species => data.species[String(id)];
export const getNote = (id: number): SpeciesNote | undefined => speciesNotes[String(id)];
export const pageCount = pages.length;

export const allSpecies: Species[] = Object.values(data.species).sort((a, b) => a.id - b.id);

/** Folio page that contains a given national dex number. */
export function folioForDex(dex: number): FolioPage | undefined {
  return pages.find((p) => p.members.some((m) => m.id === dex));
}

/** Original stat terms, in canonical order. */
export const STAT_LABELS: [string, string][] = [
  ["hp", "HP"],
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["special-attack", "Sp. Atk"],
  ["special-defense", "Sp. Def"],
  ["speed", "Speed"],
];

export const TYPE_LABEL: Record<string, string> = {
  normal: "Normal", fire: "Fire", water: "Water", electric: "Electric",
  grass: "Grass", ice: "Ice", fighting: "Fighting", poison: "Poison",
  ground: "Ground", flying: "Flying", psychic: "Psychic", bug: "Bug",
  rock: "Rock", ghost: "Ghost", dragon: "Dragon", dark: "Dark",
  steel: "Steel", fairy: "Fairy",
};

/** Ordered version clusters for the range table. */
const VERSION_CLUSTERS: [string, string[]][] = [
  ["Red · Blue", ["red", "blue"]],
  ["Yellow", ["yellow"]],
  ["Gold · Silver", ["gold", "silver"]],
  ["Crystal", ["crystal"]],
  ["Ruby · Sapphire", ["ruby", "sapphire"]],
  ["Emerald", ["emerald"]],
  ["FireRed · LeafGreen", ["firered", "leafgreen"]],
  ["Diamond · Pearl", ["diamond", "pearl"]],
  ["Platinum", ["platinum"]],
  ["HeartGold · SoulSilver", ["heartgold", "soulsilver"]],
  ["Black · White", ["black", "white"]],
  ["Black 2 · White 2", ["black-2", "white-2"]],
];

export interface RangeRow {
  games: string;
  places: string;
}

/**
 * Collapse per-version location lists into readable rows,
 * merging adjacent clusters that share the same locations.
 */
export function rangeRows(sp: Species): RangeRow[] {
  const rows: { games: string[]; key: string; places: string }[] = [];
  for (const [label, versions] of VERSION_CLUSTERS) {
    const locs = new Set<string>();
    for (const v of versions) for (const l of sp.range[v] ?? []) locs.add(l);
    if (locs.size === 0) continue;
    const sorted = [...locs].sort();
    const shown = sorted.length > 4
      ? `${sorted.slice(0, 4).join(", ")} and ${sorted.length - 4} more`
      : sorted.join(", ");
    const key = sorted.join("|");
    const prev = rows[rows.length - 1];
    if (prev && prev.key === key) prev.games.push(label);
    else rows.push({ games: [label], key, places: shown });
  }
  return rows.map((r) => ({ games: r.games.join(" · "), places: r.places }));
}

const ROMAN_VALUES: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export function roman(n: number): string {
  let out = "";
  for (const [v, s] of ROMAN_VALUES) while (n >= v) { out += s; n -= v; }
  return out;
}

export const dexNo = (id: number) => `No. ${String(id).padStart(3, "0")}`;
