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

function RubricName({ name }: { name: string }) {
  return (
    <>
      <span className="cap">{name[0]}</span>
      {name.slice(1).toUpperCase()}
    </>
  );
}

function typesLine(sp: Species): string {
  const t = sp.types.map((x) => TYPE_LABEL[x] ?? x).join(" and ");
  return `Of the ${t} kind`;
}

/** "Bulbasaur becomes Ivysaur at level 16; Ivysaur becomes Venusaur at level 32." */
function lineageCaption(page: FolioPage): string {
  const parts: string[] = [];
  for (const m of page.members) {
    if (!m.from || !m.method) continue;
    const from = getSpecies(m.from).name;
    const to = getSpecies(m.id).name;
    const method = m.method[0].toLowerCase() + m.method.slice(1);
    parts.push(`${from} becomes ${to} ${method}`);
  }
  if (parts.length === 0) return "";
  return parts.join("; ") + ".";
}

function pickQuote(sp: Species): { version: string; text: string } | null {
  if (sp.flavor.length === 0) return null;
  return [...sp.flavor].sort((a, b) => b.text.length - a.text.length)[0];
}

function Chapter({
  page,
  member,
  solo,
}: {
  page: FolioPage;
  member: FolioPage["members"][number];
  solo: boolean;
}) {
  const sp = getSpecies(member.id);
  const note = getNote(member.id);
  const rows = rangeRows(sp);
  const quote = pickQuote(sp);
  const evolvesFrom = member.from ? getSpecies(member.from) : null;
  const wildless = rows.length === 0;

  return (
    <section className="chapter" id={`no-${sp.id}`}>
      {!solo && (
        <header className="chapter-head">
          <p className="chapter-no">{dexNo(sp.id)}</p>
          <h3 className="chapter-name">
            <RubricName name={sp.name} />
          </h3>
          <p className="chapter-genus">the {sp.genus} Pokémon</p>
          {evolvesFrom && member.method && (
            <p className="chapter-evolves">
              From {evolvesFrom.name} · {member.method}
            </p>
          )}
        </header>
      )}

      <div className="chapter-grid">
        <div className="chapter-col">
          <figure className="plate">
            {/* Artwork is treated toward ink and parchment by CSS filters. */}
            <img
              src={`/art/${sp.id}.png`}
              alt={`Illustrated plate of ${sp.name}`}
              width={475}
              height={475}
              loading={sp.id === page.members[0].id ? "eager" : "lazy"}
            />
            {quote && (
              <figcaption>
                “{quote.text}” <span className="src">({quote.version})</span>
              </figcaption>
            )}
            <span className="plate-no">Plate {roman(sp.id)}</span>
          </figure>

          <section>
            <h4 className="rubric">Vital Statistics</h4>
            <table className="codex-table">
              <tbody>
                <tr>
                  <td className="label">Height</td>
                  <td>{sp.height.toFixed(1)} m</td>
                </tr>
                <tr>
                  <td className="label">Weight</td>
                  <td>{sp.weight.toFixed(1)} kg</td>
                </tr>
                <tr>
                  <td className="label">
                    {sp.abilities.length > 1 ? "Abilities" : "Ability"}
                  </td>
                  <td>
                    {sp.abilities
                      .map((a) => a.name + (a.hidden ? " (hidden)" : ""))
                      .join(", ")}
                  </td>
                </tr>
                <tr>
                  <td className="label">Habitat</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {sp.habitat.replace("-", " ")}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h4 className="rubric">Base Measures</h4>
            <div className="measures">
              {STAT_LABELS.map(([key, label]) => (
                <div className="measure" key={key}>
                  <span className="m-label">{label}</span>
                  <span className="m-bar">
                    <i style={{ ["--v" as string]: sp.stats[key] }} />
                  </span>
                  <span className="m-val">{sp.stats[key]}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="chapter-col">
          <section className="notes">
            <h4 className="rubric">Field Notes</h4>
            {(note?.notes ?? sp.flavor[0]?.text ?? "").split("\n").map((para, i) => (
              <p key={i} className={i === 0 ? "dropcap" : undefined}>
                {para}
              </p>
            ))}
            {note?.scribe && <p className="margin-note">{note.scribe}</p>}
          </section>

          <section>
            <h4 className="rubric">Where It Is Found</h4>
            <table className="codex-table">
              <tbody>
                {rows.map((r) => (
                  <tr key={r.games}>
                    <td className="label">{r.games}</td>
                    <td>{r.places}</td>
                  </tr>
                ))}
                {wildless && evolvesFrom && (
                  <tr>
                    <td className="label">All games</td>
                    <td>
                      Not found in the wild. It is raised from {evolvesFrom.name}
                      {member.method
                        ? `, ${member.method[0].toLowerCase()}${member.method.slice(1)}`
                        : ""}
                      .
                    </td>
                  </tr>
                )}
                {wildless && !evolvesFrom && (
                  <tr>
                    <td className="label">All games</td>
                    <td>Not found in the wild.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {sp.moves.length > 0 && (
            <section>
              <h4 className="rubric">Notable Arts</h4>
              <table className="codex-table arts-table">
                <tbody>
                  {sp.moves.slice(0, solo ? 8 : 5).map((m) => (
                    <tr key={m.name}>
                      <td className="lvl">{m.level <= 1 ? 1 : m.level}</td>
                      <td className="art-name">{m.name}</td>
                      <td className="art-kind">{m.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Folio({ page }: { page: FolioPage }) {
  const first = getSpecies(page.members[0].id);
  const solo = page.members.length === 1;
  const caption = lineageCaption(page);
  const next = pages[page.folio] ? getSpecies(pages[page.folio].members[0].id) : null;
  const title = solo
    ? first.name
    : `The ${first.name} Line`;
  const dexSpan = solo
    ? dexNo(first.id)
    : `${dexNo(page.members[0].id)} – ${String(page.members[page.members.length - 1].id).padStart(3, "0")}`;
  const legendMark = page.members.some((m) => getSpecies(m.id).isMythical)
    ? "Mythical"
    : page.members.some((m) => getSpecies(m.id).isLegendary)
      ? "Legendary"
      : null;

  return (
    <article className="folio paper">
      <HabitatBackdrop habitat={first.habitat} />

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="inked" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.017" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <header className="running-head">
        <h1 className="codex-title">
          Codex Monstrorum <span className="amp">⁂</span> Regnum Kanto
        </h1>
      </header>

      <div className="entry-head">
        <p className="entry-no">{dexSpan}</p>
        <h2 className="entry-name">
          <RubricName name={title} />
        </h2>
        <p className="entry-genus">the {first.genus} Pokémon{solo ? "" : " and its line"}</p>
        <p className="entry-crests">
          <span className="fleuron">❦</span>
          <span>{typesLine(first)}</span>
          {legendMark && (
            <>
              <span className="fleuron">✦</span>
              <span>{legendMark}</span>
            </>
          )}
          <span className="fleuron">❦</span>
        </p>
      </div>

      {!solo && (
        <>
          <div className="lineage-strip">
            {page.members.map((m, i) => (
              <span key={m.id} style={{ display: "contents" }}>
                {i > 0 && m.from === page.members[i - 1].id && (
                  <span className="lineage-arrow">
                    <span className="arrow-glyph" aria-hidden="true">➳</span>
                    {m.method ?? ""}
                  </span>
                )}
                <span className="medallion">
                  <img src={`/art/${m.id}.png`} alt="" width={104} height={104} loading="lazy" />
                </span>
              </span>
            ))}
          </div>
          {caption && <p className="lineage-caption">{caption}</p>}
        </>
      )}

      {page.members.map((m, i) => (
        <span key={m.id} style={{ display: "contents" }}>
          {i > 0 && <p className="chapter-rule" aria-hidden="true">❦ ✦ ❦</p>}
          <Chapter page={page} member={m} solo={solo} />
        </span>
      ))}

      <p className="fleuron-row" aria-hidden="true">❦ ✦ ❦</p>

      <footer className="folio-foot">
        <p className="foot-no">folio {roman(page.folio)} of {roman(pages.length)}</p>
        {next && (
          <p className="catchword" title="The catchword names the folio to come">
            {next.name}
          </p>
        )}
      </footer>
    </article>
  );
}
