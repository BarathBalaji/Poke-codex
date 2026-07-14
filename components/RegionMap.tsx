/**
 * A faint antique chart of the region behind each folio. Original stylised
 * cartography that echoes the game's town-and-route layout (Nintendo's own
 * maps are copyright, so this is drawn from scratch) and reads clearly as a
 * hand-inked manuscript map: named settlements, dotted roads, a coastline,
 * mountains, a compass rose. Rendered low-opacity with the inked wobble.
 */

const INK = "#4a3a22";

type Place = { x: number; y: number; name: string; big?: boolean };

function Sea() {
  const lines = [];
  for (let i = 0; i < 22; i++) {
    const y = 40 + i * 30;
    lines.push(
      <path
        key={i}
        d={`M10 ${y} q 60 -9 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`}
        fill="none"
        stroke={INK}
        strokeWidth="1.2"
        opacity="0.4"
      />,
    );
  }
  return <g>{lines}</g>;
}

function Roads({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={INK}
      strokeWidth="2.4"
      strokeDasharray="1 10"
      strokeLinecap="round"
      opacity="0.9"
    />
  );
}

function Settlement({ p }: { p: Place }) {
  const r = p.big ? 9 : 6;
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={r} fill="#e9d9b4" stroke={INK} strokeWidth="2.4" />
      {p.big && <circle cx={p.x} cy={p.y} r={r * 0.4} fill={INK} />}
      <text
        x={p.x + r + 6}
        y={p.y + 4}
        fill={INK}
        fontSize="18"
        fontFamily="'IM Fell English SC', Georgia, serif"
        letterSpacing="1"
      >
        {p.name}
      </text>
    </g>
  );
}

function Mountains({ x, y, n = 3 }: { x: number; y: number; n?: number }) {
  const peaks = [];
  for (let i = 0; i < n; i++) {
    const px = x + i * 30;
    peaks.push(<path key={i} d={`M${px} ${y} l 20 -30 l 20 30`} fill="none" stroke={INK} strokeWidth="2.4" />);
  }
  return <g>{peaks}</g>;
}

function Compass({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={INK} fill="none" strokeWidth="2">
      <circle cx={x} cy={y} r="44" />
      <circle cx={x} cy={y} r="28" strokeWidth="1.3" />
      <path d={`M${x} ${y - 58} L ${x + 11} ${y} L ${x} ${y + 58} L ${x - 11} ${y} Z`} fill={INK} opacity="0.5" />
      <path d={`M${x - 58} ${y} L ${x} ${y + 11} L ${x + 58} ${y} L ${x} ${y - 11} Z`} fill={INK} opacity="0.3" />
      <text x={x - 5} y={y - 48} fill={INK} fontSize="15" fontFamily="'IM Fell English SC', serif">N</text>
    </g>
  );
}

/* stylised Kanto: western coast, central plains, southern isles */
const KANTO: Place[] = [
  { x: 250, y: 250, name: "Pewter" },
  { x: 250, y: 470, name: "Viridian" },
  { x: 250, y: 610, name: "Pallet", big: true },
  { x: 560, y: 205, name: "Cerulean" },
  { x: 560, y: 400, name: "Saffron", big: true },
  { x: 430, y: 400, name: "Celadon" },
  { x: 560, y: 585, name: "Vermilion" },
  { x: 745, y: 340, name: "Lavender" },
  { x: 470, y: 665, name: "Fuchsia" },
  { x: 250, y: 700, name: "Cinnabar" },
  { x: 120, y: 220, name: "Indigo" },
];
const KANTO_ROADS =
  "M250 610 L 250 470 L 250 250 M 250 250 L 400 235 L 560 205 M 560 205 L 560 400 L 560 585 " +
  "M 560 400 L 430 400 M 560 400 L 745 340 M 560 205 L 700 270 L 745 340 " +
  "M 430 400 L 470 665 L 560 585 M 470 665 L 250 700 M 250 470 L 120 220";

/* stylised Johto: peninsulas to the west of Kanto */
const JOHTO: Place[] = [
  { x: 720, y: 470, name: "New Bark", big: true },
  { x: 620, y: 430, name: "Cherrygrove" },
  { x: 520, y: 330, name: "Violet" },
  { x: 470, y: 470, name: "Azalea" },
  { x: 420, y: 400, name: "Goldenrod", big: true },
  { x: 380, y: 250, name: "Ecruteak" },
  { x: 240, y: 300, name: "Olivine" },
  { x: 180, y: 470, name: "Cianwood" },
  { x: 520, y: 200, name: "Mahogany" },
  { x: 620, y: 250, name: "Blackthorn" },
];
const JOHTO_ROADS =
  "M720 470 L 620 430 L 520 330 L 520 200 M 520 330 L 470 470 L 420 400 L 380 250 " +
  "M 380 250 L 240 300 L 180 470 M 380 250 L 520 200 L 620 250 M 620 430 L 420 400";

function Chart({ places, roads, coast, mts, isles }: {
  places: Place[]; roads: string; coast: string; mts: [number, number][]; isles: string[];
}) {
  return (
    <>
      <Sea />
      <path d={coast} fill="#e9d9b4" stroke={INK} strokeWidth="3" opacity="0.5" />
      {isles.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={INK} strokeWidth="2.2" />
      ))}
      <Roads d={roads} />
      {mts.map(([x, y], i) => (
        <Mountains key={i} x={x} y={y} />
      ))}
      {places.map((p) => (
        <Settlement key={p.name} p={p} />
      ))}
      <Compass x={870} y={140} />
    </>
  );
}

const KANTO_COAST =
  "M80 140 L 660 130 C 720 150, 760 220, 740 300 C 800 340, 810 460, 740 520 " +
  "C 770 600, 700 680, 600 660 C 560 720, 300 720, 300 660 C 200 690, 120 630, 150 540 " +
  "C 90 500, 90 300, 130 260 C 90 220, 80 170, 80 140 Z";
const JOHTO_COAST =
  "M120 180 L 700 180 C 760 210, 770 300, 720 360 C 780 420, 760 540, 680 540 " +
  "C 700 620, 600 660, 500 630 C 440 680, 320 680, 300 620 C 200 640, 120 580, 150 500 " +
  "C 90 460, 100 260, 140 230 Z";

/* stylised Hoenn: a broad sea broken by many isles */
const HOENN: Place[] = [
  { x: 230, y: 610, name: "Littleroot", big: true },
  { x: 230, y: 500, name: "Petalburg" },
  { x: 230, y: 330, name: "Rustboro" },
  { x: 190, y: 690, name: "Dewford" },
  { x: 410, y: 620, name: "Slateport" },
  { x: 430, y: 470, name: "Mauville", big: true },
  { x: 400, y: 300, name: "Fallarbor" },
  { x: 470, y: 380, name: "Lavaridge" },
  { x: 600, y: 300, name: "Fortree" },
  { x: 680, y: 470, name: "Lilycove" },
  { x: 760, y: 560, name: "Mossdeep" },
  { x: 640, y: 620, name: "Sootopolis" },
];
const HOENN_ROADS =
  "M230 610 L 230 500 L 230 330 M 230 500 L 410 620 L 430 470 M 430 470 L 230 500 " +
  "M 430 470 L 400 300 L 470 380 M 430 470 L 600 300 L 680 470 L 760 560 " +
  "M 680 470 L 640 620 L 410 620 M 230 690 L 230 610";
const HOENN_COAST =
  "M110 200 L 620 200 C 700 220, 720 300, 690 360 C 780 400, 800 520, 720 560 " +
  "C 760 640, 660 700, 560 660 C 480 720, 300 720, 280 650 C 180 680, 110 600, 150 520 " +
  "C 90 470, 90 280, 130 250 Z";

const CHARTS: Record<string, React.ReactNode> = {
  kanto: (
    <Chart
      places={KANTO}
      roads={KANTO_ROADS}
      coast={KANTO_COAST}
      mts={[[350, 235], [690, 260]]}
      isles={[
        "M360 705 c 22 -16 54 -10 58 10 c 4 20 -26 34 -50 20 Z",
        "M700 610 c 16 -12 40 -8 44 8 c 4 16 -20 26 -38 18 Z",
      ]}
    />
  ),
  johto: (
    <Chart
      places={JOHTO}
      roads={JOHTO_ROADS}
      coast={JOHTO_COAST}
      mts={[[300, 260], [560, 300]]}
      isles={["M700 600 c 20 -14 48 -8 52 12 c 4 18 -24 30 -46 18 Z"]}
    />
  ),
  hoenn: (
    <Chart
      places={HOENN}
      roads={HOENN_ROADS}
      coast={HOENN_COAST}
      mts={[[430, 320], [500, 400]]}
      isles={[
        "M300 700 c 20 -14 48 -8 52 12 c 4 18 -24 30 -46 18 Z",
        "M560 690 c 16 -12 40 -8 44 8 c 4 16 -20 26 -38 18 Z",
        "M770 620 c 14 -10 34 -6 38 8 c 3 14 -18 22 -32 14 Z",
      ]}
    />
  ),
};

export default function RegionMap({ region = "kanto" }: { region?: string }) {
  return (
    <div className="region-map" aria-hidden="true">
      <svg viewBox="0 0 1000 760" preserveAspectRatio="xMidYMid meet">
        <g filter="url(#inked)">{CHARTS[region] ?? CHARTS.kanto}</g>
      </svg>
    </div>
  );
}
