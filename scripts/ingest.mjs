/**
 * Kanto ingest pipeline.
 *
 * Pulls species, pokemon, evolution chains, encounters, and move data for
 * National Dex 1-151 from the PokeAPI static mirror on GitHub (the live API
 * is unreachable from this environment; the mirror is the same data).
 * Groups species into evolution-line pages and emits content/kanto.json.
 * Official artwork is cached into public/art/{id}.png.
 *
 * Re-runnable: raw JSON is cached under .cache/.
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const MIRROR = "https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2";
const ART = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const CACHE = ".cache";
/* which volume to build: `node scripts/ingest.mjs [kanto|johto]` */
const REGIONS = {
  kanto: { label: "Kanto", min: 1, max: 151 },
  johto: { label: "Johto", min: 152, max: 251 },
};
const REGION = process.argv[2] ?? "kanto";
const CFG = REGIONS[REGION];
if (!CFG) throw new Error(`unknown region: ${REGION}`);
const { min: DEX_MIN, max: DEX_MAX } = CFG;

/** Gen 1-5 version ids in play order. */
const GEN15_VERSIONS = [
  "red", "blue", "yellow",
  "gold", "silver", "crystal",
  "ruby", "sapphire", "emerald",
  "firered", "leafgreen",
  "diamond", "pearl", "platinum",
  "heartgold", "soulsilver",
  "black", "white", "black-2", "white-2",
];
const VERSION_LABEL = {
  red: "Red", blue: "Blue", yellow: "Yellow",
  gold: "Gold", silver: "Silver", crystal: "Crystal",
  ruby: "Ruby", sapphire: "Sapphire", emerald: "Emerald",
  firered: "FireRed", leafgreen: "LeafGreen",
  diamond: "Diamond", pearl: "Pearl", platinum: "Platinum",
  heartgold: "HeartGold", soulsilver: "SoulSilver",
  black: "Black", white: "White", "black-2": "Black 2", "white-2": "White 2",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJsonCached(url, cacheKey) {
  const file = path.join(CACHE, cacheKey + ".json");
  try {
    await access(file);
    return JSON.parse(await readFile(file, "utf8"));
  } catch {}
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const data = await res.json();
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(data));
      return data;
    } catch (err) {
      if (attempt === 3) throw err;
      await sleep(1000 * 2 ** attempt);
    }
  }
}

async function downloadArt(id) {
  const file = path.join("public", "art", `${id}.png`);
  try {
    await access(file);
    return;
  } catch {}
  const res = await fetch(`${ART}/${id}.png`);
  if (!res.ok) throw new Error(`art ${id}: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(file));
}

/** Run tasks with bounded concurrency. */
async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

const titleCase = (slug) =>
  slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const cleanFlavor = (text) =>
  text
    .replace(/[\n\f­]/g, " ")
    .replace(/POKéMON/g, "Pokémon")
    .replace(/(\w)- (\w)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();

/** "kanto-route-2-south-towards-viridian-city-area" -> "Route 2" etc. */
function prettyLocation(areaName) {
  let s = areaName
    .replace(/-area$/, "")
    .replace(/^kanto-/, "")
    .replace(/^johto-/, "")
    .replace(/^hoenn-/, "")
    .replace(/^sinnoh-/, "")
    .replace(/^unova-/, "");
  const routeMatch = s.match(/^route-(\d+)/);
  if (routeMatch) return `Route ${routeMatch[1]}`;
  const seaRouteMatch = s.match(/^sea-route-(\d+)/);
  if (seaRouteMatch) return `Sea Route ${seaRouteMatch[1]}`;
  // Trim trailing sub-area qualifiers like "-1f", "-b1f", "-2f-..." floors
  s = s.replace(/-(b?\d+f|\d+f-.*|basement.*|floors.*|top.*|back.*|entrance.*|inside.*|outside.*|north.*|south.*|east.*|west.*|middle.*|upper.*|lower.*|center.*|cave.*-room.*|\d+r)$/, "");
  return titleCase(s);
}

function formatEvolution(details) {
  if (!details || details.length === 0) return "Unknown";
  const d = details[0];
  const parts = [];
  switch (d.trigger?.name) {
    case "level-up": {
      if (d.min_level) parts.push(`At level ${d.min_level}`);
      else if (d.min_happiness) parts.push("With high friendship");
      else parts.push("On leveling up");
      if (d.time_of_day) parts.push(`by ${d.time_of_day}`);
      if (d.location) parts.push(`near ${titleCase(d.location.name)}`);
      break;
    }
    case "use-item":
      parts.push(`By use of a ${titleCase(d.item.name)}`);
      break;
    case "trade":
      parts.push("By trade");
      if (d.held_item) parts.push(`while holding a ${titleCase(d.held_item.name)}`);
      break;
    default:
      parts.push(titleCase(d.trigger?.name ?? "unknown"));
  }
  return parts.join(" ");
}

async function main() {
  await mkdir(path.join("public", "art"), { recursive: true });
  await mkdir("content", { recursive: true });

  const ids = Array.from({ length: DEX_MAX - DEX_MIN + 1 }, (_, i) => i + DEX_MIN);

  console.log("fetching species, pokemon, encounters ...");
  const species = await pool(ids, 12, (id) =>
    fetchJsonCached(`${MIRROR}/pokemon-species/${id}/index.json`, `species/${id}`));
  const pokemon = await pool(ids, 12, (id) =>
    fetchJsonCached(`${MIRROR}/pokemon/${id}/index.json`, `pokemon/${id}`));
  const encounters = await pool(ids, 12, (id) =>
    fetchJsonCached(`${MIRROR}/pokemon/${id}/encounters/index.json`, `encounters/${id}`));

  console.log("fetching evolution chains ...");
  const chainIds = [...new Set(species.map((s) => Number(s.evolution_chain.url.match(/\/(\d+)\/?$/)[1])))];
  const chainsById = new Map();
  await pool(chainIds, 12, async (cid) => {
    chainsById.set(cid, await fetchJsonCached(`${MIRROR}/evolution-chain/${cid}/index.json`, `chain/${cid}`));
  });

  console.log("fetching artwork ...");
  await pool(ids, 8, downloadArt);

  // Collect level-up moves (Black/White version group) per species.
  const moveNames = new Set();
  const speciesMoves = new Map();
  for (const p of pokemon) {
    const rows = [];
    for (const m of p.moves) {
      const d = m.version_group_details.find(
        (v) => v.version_group.name === "black-white" && v.move_learn_method.name === "level-up",
      );
      if (d) rows.push({ level: d.level_learned_at, name: m.move.name, moveId: Number(m.move.url.match(/\/(\d+)\/?$/)[1]) });
    }
    rows.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
    // Keep a curated-length list: dedupe levels lightly, cap at 8 spread across the range.
    const seen = new Set();
    const kept = [];
    for (const r of rows) {
      if (seen.has(r.name)) continue;
      seen.add(r.name);
      kept.push(r);
    }
    let final = kept;
    if (kept.length > 8) {
      final = [];
      const step = (kept.length - 1) / 7;
      for (let i = 0; i < 8; i++) final.push(kept[Math.round(i * step)]);
      final = [...new Map(final.map((r) => [r.name, r])).values()];
    }
    speciesMoves.set(p.id, final);
    for (const r of final) moveNames.add(JSON.stringify([r.name, r.moveId]));
  }

  console.log(`fetching ${moveNames.size} moves ...`);
  const moveList = [...moveNames].map((s) => JSON.parse(s));
  const moveData = new Map();
  await pool(moveList, 12, async ([name, moveId]) => {
    const m = await fetchJsonCached(`${MIRROR}/move/${moveId}/index.json`, `move/${moveId}`);
    const flavor =
      m.flavor_text_entries.find((f) => f.language.name === "en" && f.version_group.name === "black-white") ??
      m.flavor_text_entries.find((f) => f.language.name === "en");
    moveData.set(name, {
      name: titleCase(name),
      type: m.type.name,
      desc: flavor ? cleanFlavor(flavor.flavor_text) : "",
    });
  });

  // Per-species records.
  const speciesOut = {};
  for (let i = 0; i < ids.length; i++) {
    const s = species[i];
    const p = pokemon[i];
    const id = s.id;

    const flavorSeen = new Set();
    const flavor = [];
    for (const f of s.flavor_text_entries) {
      if (f.language.name !== "en") continue;
      if (!GEN15_VERSIONS.includes(f.version.name)) continue;
      const text = cleanFlavor(f.flavor_text);
      const key = text.toLowerCase().replace(/[^a-z]/g, "").slice(0, 60);
      if (flavorSeen.has(key)) continue;
      flavorSeen.add(key);
      flavor.push({ version: VERSION_LABEL[f.version.name], text });
    }

    const range = {};
    for (const enc of encounters[i]) {
      const loc = prettyLocation(enc.location_area.name);
      for (const vd of enc.version_details) {
        const v = vd.version.name;
        if (!GEN15_VERSIONS.includes(v)) continue;
        (range[v] ??= new Set()).add(loc);
      }
    }
    const rangeOut = {};
    for (const [v, locs] of Object.entries(range)) rangeOut[v] = [...locs].sort();

    speciesOut[id] = {
      id,
      name: titleCase(s.name),
      genus: (s.genera.find((g) => g.language.name === "en")?.genus ?? "").replace(/ Pokémon$/, ""),
      types: p.types.map((t) => t.type.name),
      height: p.height / 10,
      weight: p.weight / 10,
      abilities: p.abilities.map((a) => ({ name: titleCase(a.ability.name), hidden: a.is_hidden })),
      stats: Object.fromEntries(p.stats.map((st) => [st.stat.name, st.base_stat])),
      habitat: s.habitat?.name ?? "rare",
      color: s.color?.name ?? "gray",
      isLegendary: s.is_legendary,
      isMythical: s.is_mythical,
      captureRate: s.capture_rate,
      flavor,
      range: rangeOut,
      moves: (speciesMoves.get(id) ?? []).map((r) => ({ level: r.level, ...moveData.get(r.name) })),
    };
  }

  // Evolution-line pages: walk each chain, keep this region's members, one page
  // per chain. `parentId` is the immediate ancestor's national id even when it
  // belongs to an earlier region, so cross-generation evolutions (e.g. Crobat
  // from Golbat) still record where they are raised from.
  function walkChain(node, parentId, acc) {
    const id = Number(node.species.url.match(/\/(\d+)\/?$/)[1]);
    if (id >= DEX_MIN && id <= DEX_MAX) {
      acc.push({
        id,
        from: parentId,
        method: parentId ? formatEvolution(node.evolution_details) : null,
      });
    }
    for (const child of node.evolves_to) walkChain(child, id, acc);
  }

  const pages = [];
  for (const [cid, chain] of chainsById) {
    const members = [];
    walkChain(chain.chain, null, members);
    if (members.length === 0) continue;
    members.sort((a, b) => a.id - b.id);
    pages.push({ chainId: cid, members });
  }
  pages.sort((a, b) => a.members[0].id - b.members[0].id);
  pages.forEach((p, idx) => {
    p.folio = idx + 1;
    p.slug = speciesOut[p.members[0].id].name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  });

  pages.forEach((p) => { p.region = REGION; });
  const out = { generatedAt: new Date().toISOString(), region: CFG.label, species: speciesOut, pages };
  await writeFile(`content/${REGION}.json`, JSON.stringify(out, null, 1));
  console.log(`wrote content/${REGION}.json: ${Object.keys(speciesOut).length} species, ${pages.length} folio pages`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
