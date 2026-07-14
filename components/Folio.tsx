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
  TYPE_TINT,
  REGION_LABEL,
} from "@/lib/data";
import HabitatBackdrop from "@/components/HabitatBackdrop";
import RegionMap from "@/components/RegionMap";

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

/* hand-drawn ink arrow marking an evolution */
function InkArrow() {
  return (
    <svg className="lin-arrow-svg" viewBox="0 0 68 34" aria-hidden="true">
      {/* a slightly wavering shaft */}
      <path
        d="M4 18 C 20 14, 34 21, 52 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#inked)"
      />
      {/* an open, two-stroke arrowhead */}
      <path
        d="M44 8 C 50 12, 55 15, 60 17 C 54 19, 49 23, 45 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

/* a hand-lettered record heading with an inked underline the width of the label */
function RecLabel({ text, rot = -1 }: { text: string; rot?: number }) {
  return (
    <span style={{ display: "inline-block", marginBottom: ".5rem" }}>
      <span className="rec-label" style={{ ["--rec-rot" as string]: `${rot}deg` }}>
        {text}
      </span>
      <InkUnderline w={180} />
    </span>
  );
}

function StatGrid({ sp }: { sp: Species }) {
  return (
    <div className="m-grid">
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
  // a cross-generation pre-evolution may fall outside this codex (e.g. a
  // later-gen baby); treat it as no recorded parent if we have no plate for it.
  const parent = member.from != null ? getSpecies(member.from) ?? null : null;

  const rand = seeded(sp.id);
  const side = rand() < 0.5 ? "left" : "right";
  const imgW = Math.round(230 + rand() * 140);
  const imgRot = (rand() * 5 - 2.5).toFixed(2);
  const nameRot = (rand() * 5.5 - 3).toFixed(2);
  const capRot = (rand() * 4 - 2).toFixed(2);
  const scRotA = Number((rand() * 5 - 2.5).toFixed(2));
  const scRotB = Number((rand() * 5 - 2.5).toFixed(2));
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

      <div className="entry-body">
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
      </div>

      <div className="records">
        <div className="record rec-vital">
          <RecLabel text="the vital record" rot={-1.5} />
          <dl className="rec-dl">
            <dt>Height</dt>
            <dd>{sp.height.toFixed(1)} m</dd>
            <dt>Weight</dt>
            <dd>{sp.weight.toFixed(1)} kg</dd>
            <dt>{sp.abilities.length > 1 ? "Faculties" : "Faculty"}</dt>
            <dd>{sp.abilities.map((a) => a.name + (a.hidden ? " (hidden)" : "")).join(", ")}</dd>
            <dt>Haunt</dt>
            <dd style={{ textTransform: "capitalize" }}>{sp.habitat.replace("-", " ")}</dd>
          </dl>
        </div>

        <div className="record rec-measures">
          <RecLabel text="by my own measure" rot={scRotA} />
          <StatGrid sp={sp} />
        </div>

        <div className="record rec-range">
          <RecLabel text="where it is found" rot={scRotB} />
          <dl className="rec-dl">
            {rangeRows(sp).length > 0 ? (
              rangeRows(sp).map((r) => (
                <span key={r.games} style={{ display: "contents" }}>
                  <dt>{r.games}</dt>
                  <dd>{r.places}</dd>
                </span>
              ))
            ) : (
              <>
                <dt>All games</dt>
                <dd>
                  {parent
                    ? `Not taken in the wild; raised from ${parent.name}${member.method ? ", " + lower(member.method) : ""}.`
                    : "Not to be taken in the wild."}
                </dd>
              </>
            )}
          </dl>
        </div>

        {sp.moves.length > 0 && (
          <div className="record rec-arts">
            <RecLabel text="arts it is known to use" rot={-1} />
            <ol>
              {sp.moves.slice(0, 6).map((m) => (
                <li key={m.name}>
                  <span className="art-lvl">{m.level <= 1 ? "birth" : roman(m.level)}</span>
                  <span className="art-name">{m.name}</span>
                  <span className="art-desc">{m.desc}</span>
                </li>
              ))}
            </ol>
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
  const regionLabel = REGION_LABEL[page.region ?? "kanto"] ?? "Kanto";

  const tint = TYPE_TINT[first.types[0]] ?? "#9a8a63";

  return (
    <article className="folio paper" style={{ ["--tint" as string]: tint }}>
      <RegionMap region={page.region ?? "kanto"} />
      <HabitatBackdrop habitat={first.habitat} />

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="inked" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="folio-inner">
        <p className="leaf-running">
          Codex Monstrorum <span className="amp">·</span> Regnum {regionLabel}{" "}
          <span className="amp">·</span> folio {roman(page.folio)}
        </p>

        <div className="leaf-title">
          <span className="leaf-dex">{dexSpan}</span>
          <h1 className="leaf-name">{lineName}</h1>
          <InkUnderline w={420} />
          <p className="leaf-genus">the {first.genus} Pokémon{solo ? "" : " and its kin"}</p>
          {solo && page.members[0].from != null && getSpecies(page.members[0].from) && (
            <p className="leaf-from">
              raised from {getSpecies(page.members[0].from).name}
              {page.members[0].method ? `, ${lower(page.members[0].method)}` : ""}
            </p>
          )}
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
                    <InkArrow />
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
