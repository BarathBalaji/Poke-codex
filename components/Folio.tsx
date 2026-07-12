import {
  FolioPage,
  Species,
  getSpecies,
  getNote,
  rangeRows,
  roman,
  dexNo,
  pages,
  STAT_LABELS,
  TYPE_LABEL,
} from "@/lib/data";
import HabitatBackdrop from "@/components/HabitatBackdrop";

/* deterministic per-creature layout so every entry is laid out differently,
   yet stable between renders. */
function seeded(id: number) {
  let s = (id * 2654435761) >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return s / 4294967296;
  };
}

const lower = (s: string) => s[0].toLowerCase() + s.slice(1);

/* "FireRed · LeafGreen · HeartGold" -> "FireRed, LeafGreen and HeartGold" */
function prettyGames(games: string): string {
  const parts = games.split(" · ");
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
}

/* run-on account of where a creature is found, in the explorer's voice */
function rangeProse(sp: Species, parentName: string | null, method: string | null): string {
  const rows = rangeRows(sp);
  if (rows.length === 0) {
    if (parentName)
      return `Not taken in the wild; it is raised up from ${parentName}${method ? ", " + lower(method) : ""}.`;
    return "Not to be taken in the wild by any means known to me.";
  }
  const shown = rows.slice(0, 4);
  const parts = shown.map((r) => `in ${prettyGames(r.games)}, about ${r.places}`);
  let out = "Met with " + parts.join("; ");
  if (rows.length > shown.length) out += "; and in sundry regions besides";
  return out + ".";
}

/* a wobbly inked underline drawn beneath a heading */
function InkUnderline({ w = 320 }: { w?: number }) {
  return (
    <svg
      viewBox={`0 0 ${w} 14`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "11px", marginTop: ".1rem", overflow: "visible" }}
    >
      <path
        d={`M3 8 Q ${w * 0.2} 3 ${w * 0.42} 7 T ${w * 0.72} 6 T ${w - 3} 7`}
        fill="none"
        stroke="var(--rubric)"
        strokeWidth="2.2"
        strokeLinecap="round"
        filter="url(#inked)"
      />
    </svg>
  );
}

/* rough hand-drawn ring, for lineage medallions */
function InkRing() {
  return (
    <svg className="lin-ring" viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 6 C 74 4 96 26 94 50 C 96 76 72 96 50 94 C 26 96 4 72 6 50 C 5 25 27 7 50 6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        filter="url(#inked)"
      />
    </svg>
  );
}

/* rough hand-drawn frame around a specimen */
function InkFrame() {
  return (
    <svg className="ink-frame" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M8 6 L 192 10 L 194 190 L 6 194 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        filter="url(#inked)"
      />
    </svg>
  );
}

function typesLine(sp: Species): string {
  return "Of the " + sp.types.map((x) => TYPE_LABEL[x] ?? x).join(" and ") + " kind";
}

function Measures({ sp }: { sp: Species }) {
  return (
    <div className="scrawl measures">
      <span className="sc-label" style={{ ["--sc-rot" as string]: "-2deg" }}>
        by my measure
      </span>
      <div className="sc-body">
        {STAT_LABELS.map(([key, label]) => (
          <span className="stat" key={key}>
            <span className="st-key">{label}</span>
            <span className="st-val">{sp.stats[key]}</span>
            <span className="st-bar">
              <i style={{ ["--v" as string]: sp.stats[key] }} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Entry({
  member,
  solo,
}: {
  member: FolioPage["members"][number];
  solo: boolean;
}) {
  const sp = getSpecies(member.id);
  const note = getNote(member.id);
  const parent = member.from ? getSpecies(member.from) : null;

  const rand = seeded(sp.id);
  const side = rand() < 0.5 ? "left" : "right";
  const imgW = Math.round(230 + rand() * 140);
  const imgRot = (rand() * 5 - 2.5).toFixed(2);
  const nameRot = (rand() * 5.5 - 3).toFixed(2);
  const capRot = (rand() * 4 - 2).toFixed(2);
  const scRotA = (rand() * 5 - 2.5).toFixed(2);
  const scRotB = (rand() * 5 - 2.5).toFixed(2);
  const framed = rand() < 0.55;

  const quote = sp.flavor.length
    ? [...sp.flavor].sort((a, b) => b.text.length - a.text.length)[0]
    : null;
  const paras = (note?.notes ?? sp.flavor[0]?.text ?? "").split("\n");

  return (
    <section className="entry" id={`no-${sp.id}`}>
      {!solo && (
        <header className="entry-hand-head">
          <span className="eh-no">{dexNo(sp.id)}</span>
          <div>
            <span className="eh-name" style={{ ["--name-rot" as string]: `${nameRot}deg` }}>
              {sp.name}
            </span>
            <span className="eh-genus">the {sp.genus} Pokémon</span>
          </div>
          {parent && member.method && (
            <p className="eh-from">raised from {parent.name}, {lower(member.method)}</p>
          )}
        </header>
      )}

      <figure
        className={`specimen side-${side}`}
        style={{ ["--img-w" as string]: `${imgW}px` }}
      >
        <span className="plate-wrap" style={{ ["--img-rot" as string]: `${imgRot}deg` }}>
          <img
            src={`/art/${sp.id}.png`}
            alt={`Illustrated plate of ${sp.name}`}
            width={475}
            height={475}
            loading={member.from === null ? "eager" : "lazy"}
          />
          {framed && <InkFrame />}
        </span>
        {quote && (
          <figcaption style={{ ["--cap-rot" as string]: `${capRot}deg` }}>
            “{quote.text}”
            <span className="src"> ({quote.version})</span>
          </figcaption>
        )}
        <span className="plate-tag">plate {roman(sp.id)}</span>
      </figure>

      <div className="hand-notes">
        {paras.map((p, i) => (
          <p key={i} className={i === 0 ? "dropcap" : undefined}>
            {p}
          </p>
        ))}
        {note?.scribe && <span className="quill">{note.scribe}</span>}
      </div>

      <div className="scrawls">
        <Measures sp={sp} />

        <div className="scrawl">
          <span className="sc-label" style={{ ["--sc-rot" as string]: `${scRotA}deg` }}>
            where it is met
          </span>
          <p className="sc-body">{rangeProse(sp, parent?.name ?? null, member.method)}</p>
        </div>

        {sp.moves.length > 0 && (
          <div className="scrawl">
            <span className="sc-label" style={{ ["--sc-rot" as string]: `${scRotB}deg` }}>
              arts it is seen to know
            </span>
            <p className="sc-body">
              {sp.moves.slice(0, 7).map((m, i, arr) => (
                <span key={m.name}>
                  {m.name}{" "}
                  <span className="lvl">
                    ({m.level <= 1 ? "from birth" : roman(m.level)})
                  </span>
                  {i < arr.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Folio({ page }: { page: FolioPage }) {
  const first = getSpecies(page.members[0].id);
  const solo = page.members.length === 1;
  const last = page.members[page.members.length - 1];
  const next = pages[page.folio] ? getSpecies(pages[page.folio].members[0].id) : null;

  const lineName = solo ? first.name : `The ${first.name} Line`;
  const dexSpan = solo
    ? dexNo(first.id)
    : `${dexNo(first.id)} to ${String(last.id).padStart(3, "0")}`;
  const legendMark = page.members.some((m) => getSpecies(m.id).isMythical)
    ? "a mythical creature"
    : page.members.some((m) => getSpecies(m.id).isLegendary)
      ? "a legendary creature"
      : null;

  return (
    <article className="folio paper">
      <HabitatBackdrop habitat={first.habitat} />

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="inked" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="folio-inner">
        <p className="leaf-running">
          Codex Monstrorum <span className="amp">·</span> Regnum Kanto{" "}
          <span className="amp">·</span> folio {roman(page.folio)}
        </p>

        <div className="leaf-title">
          <span className="leaf-dex">{dexSpan}</span>
          <h1 className="leaf-name">{lineName}</h1>
          <InkUnderline w={420} />
          <p className="leaf-genus">the {first.genus} Pokémon{solo ? "" : " and its kin"}</p>
          <p className="leaf-crests">
            <span>{typesLine(first)}</span>
            {legendMark && (
              <>
                <span className="dot">✦</span>
                <span>{legendMark}</span>
              </>
            )}
          </p>
        </div>

        {!solo && (
          <div className="lineage-sketch">
            {page.members.map((m, i) => (
              <span key={m.id} style={{ display: "contents" }}>
                {i > 0 && m.from === page.members[i - 1].id && (
                  <span className="lin-step">
                    <span className="lin-arrow" aria-hidden="true">➳</span>
                    {m.method ?? ""}
                  </span>
                )}
                <span className="lin-medallion">
                  <img
                    src={`/art/${m.id}.png`}
                    alt=""
                    width={96}
                    height={96}
                    loading="lazy"
                    style={{ ["--r" as string]: `${(i % 2 ? 2 : -2)}deg` }}
                  />
                  <InkRing />
                </span>
              </span>
            ))}
          </div>
        )}

        {page.members.map((m) => (
          <Entry key={m.id} member={m} solo={solo} />
        ))}

        <footer className="leaf-foot">
          <span>folio {roman(page.folio)} of {roman(pages.length)}</span>
          {next && <span className="catch">{next.name}</span>}
        </footer>
      </div>
    </article>
  );
}
