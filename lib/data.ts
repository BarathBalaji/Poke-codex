import kanto from "@/content/kanto.json";
import johto from "@/content/johto.json";
import hoenn from "@/content/hoenn.json";
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

type Volume = {
  region: string;
  species: Record<string, Species>;
  pages: FolioPage[];
};

/** The codex is one continuous manuscript, kingdom after kingdom. */
export const REGION_ORDER = ["kanto", "johto", "hoenn"] as const;
export const REGION_LABEL: Record<string, string> = { kanto: "Kanto", johto: "Johto", hoenn: "Hoenn" };

const volumes: Record<string, Volume> = {
  kanto: kanto as unknown as Volume,
  johto: johto as unknown as Volume,
  hoenn: hoenn as unknown as Volume,
};

const speciesById: Record<string, Species> = {
  ...(volumes.kanto.species),
  ...(volumes.johto.species),
  ...(volumes.hoenn.species),
};

const speciesNotes = notes as unknown as Record<string, SpeciesNote>;

/** Pages from every volume, folio numbers made continuous across the codex. */
export const pages: FolioPage[] = REGION_ORDER.flatMap((r) =>
  volumes[r].pages.map((p) => ({ ...p, region: r })),
).map((p, i) => ({ ...p, folio: i + 1 }));

export const getSpecies = (id: number): Species => speciesById[String(id)];
export const getNote = (id: number): SpeciesNote | undefined => speciesNotes[String(id)];
export const pageCount = pages.length;

export const allSpecies: Species[] = Object.values(speciesById).sort((a, b) => a.id - b.id);
export const maxDex = allSpecies.length ? allSpecies[allSpecies.length - 1].id : 151;

/** Folio number where a region's pages begin (1-based). */
export function regionStartFolio(region: string): number {
  const p = pages.find((x) => x.region === region);
  return p ? p.folio : 1;
}

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

/** Muted, parchment-friendly cast of each type; the folio takes this hue. */
export const TYPE_TINT: Record<string, string> = {
  normal: "#9a8a63", fire: "#b5532e", water: "#3f6b8a", electric: "#b58f2b",
  grass: "#5f7a37", ice: "#4f8391", fighting: "#94402c", poison: "#7a4a86",
  ground: "#9c7638", flying: "#6a76a3", psychic: "#a6497a", bug: "#6f7d2e",
  rock: "#84703f", ghost: "#5b4a78", dragon: "#4a5aa0", dark: "#4a3f3a",
  steel: "#5f7484", fairy: "#b06a90",
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
