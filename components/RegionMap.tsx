/**
 * A faint antique chart of the region, drawn as a full-page watermark behind
 * the folio. Original stylised cartography (not a game map) so it is safe to
 * ship and sits comfortably in the manuscript's own hand. Rendered very low
 * opacity with the inked wobble filter for a hand-drawn feel.
 */

const INK = "#4a3a22";

function seaHatch(y0: number, count: number, w: number) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const y = y0 + i * 26;
    lines.push(
      <path
        key={i}
        d={`M20 ${y} q ${w * 0.14} -10 ${w * 0.28} 0 t ${w * 0.28} 0 t ${w * 0.28} 0`}
        fill="none"
        stroke={INK}
        strokeWidth="1.4"
        opacity={0.5}
      />,
    );
  }
  return lines;
}

function Town({ x, y, r = 6 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke={INK} strokeWidth="2.2" />
      <circle cx={x} cy={y} r={r * 0.32} fill={INK} />
    </g>
  );
}

function Mountains({ x, y, n = 3 }: { x: number; y: number; n?: number }) {
  const peaks = [];
  for (let i = 0; i < n; i++) {
    const px = x + i * 34;
    peaks.push(
      <path key={i} d={`M${px} ${y} l 22 -34 l 22 34`} fill="none" stroke={INK} strokeWidth="2.4" />,
    );
  }
  return <g>{peaks}</g>;
}

function Forest({ x, y }: { x: number; y: number }) {
  const trees = [];
  for (let i = 0; i < 6; i++) {
    const tx = x + (i % 3) * 26;
    const ty = y + Math.floor(i / 3) * 22;
    trees.push(<circle key={i} cx={tx} cy={ty} r="9" fill="none" stroke={INK} strokeWidth="2" />);
  }
  return <g>{trees}</g>;
}

function Compass({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={INK} fill="none" strokeWidth="2">
      <circle cx={x} cy={y} r="46" />
      <circle cx={x} cy={y} r="30" strokeWidth="1.4" />
      <path d={`M${x} ${y - 62} L ${x + 12} ${y} L ${x} ${y + 62} L ${x - 12} ${y} Z`} fill={INK} opacity="0.5" />
      <path d={`M${x - 62} ${y} L ${x} ${y + 12} L ${x + 62} ${y} L ${x} ${y - 12} Z`} fill={INK} opacity="0.3" />
    </g>
  );
}

function KantoChart() {
  return (
    <>
      {seaHatch(70, 20, 960)}
      {/* landmass: a wandering coastline */}
      <path
        d="M250 210
           C 300 150, 420 150, 470 200
           C 520 170, 600 180, 630 230
           C 700 240, 760 300, 740 370
           C 780 420, 770 500, 710 540
           C 720 600, 660 650, 590 640
           C 540 690, 450 680, 420 630
           C 350 650, 290 610, 300 550
           C 240 530, 220 460, 260 420
           C 220 380, 220 280, 250 210 Z"
        fill="#e9d9b4"
        stroke={INK}
        strokeWidth="3"
        opacity="0.55"
      />
      {/* islands */}
      <path d="M330 690 c 20 -18 52 -14 58 8 c 6 22 -22 40 -46 30 c -20 -8 -24 -28 -12 -38 Z" fill="none" stroke={INK} strokeWidth="2.4" />
      <path d="M690 600 c 16 -12 40 -8 44 8 c 4 16 -18 28 -36 20 Z" fill="none" stroke={INK} strokeWidth="2.4" />
      {/* routes */}
      <path
        d="M330 300 L 430 260 L 520 300 L 560 400 L 500 470 L 560 540 L 470 590 M 520 300 L 640 340 L 660 460"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="2 9"
        strokeLinecap="round"
        opacity="0.85"
      />
      <Town x={330} y={300} />
      <Town x={430} y={260} />
      <Town x={520} y={300} />
      <Town x={560} y={400} />
      <Town x={500} y={470} />
      <Town x={560} y={540} r={7} />
      <Town x={470} y={590} />
      <Town x={640} y={340} />
      <Town x={660} y={460} />
      <Mountains x={370} y={360} n={3} />
      <Forest x={430} y={430} />
      <Compass x={840} y={170} />
      {/* a scaly sea beast */}
      <path
        d="M120 560 q 20 -26 46 -8 q 24 16 46 -2 q 22 -16 44 2"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </>
  );
}

function JohtoChart() {
  return (
    <>
      {seaHatch(70, 20, 960)}
      <path
        d="M210 260
           C 250 200, 330 190, 380 230
           C 440 190, 520 210, 540 270
           C 620 260, 700 300, 690 380
           C 740 420, 720 500, 650 520
           C 660 590, 590 640, 520 620
           C 470 660, 380 650, 360 600
           C 290 610, 250 560, 270 510
           C 210 490, 200 400, 240 360
           C 200 330, 190 290, 210 260 Z"
        fill="#e9d9b4"
        stroke={INK}
        strokeWidth="3"
        opacity="0.55"
      />
      <path d="M700 540 c 18 -14 44 -8 48 10 c 4 18 -22 30 -42 20 Z" fill="none" stroke={INK} strokeWidth="2.4" />
      <path
        d="M300 340 L 400 300 L 470 350 L 520 300 L 600 350 M 470 350 L 450 450 L 520 520 M 450 450 L 360 500"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="2 9"
        strokeLinecap="round"
        opacity="0.85"
      />
      <Town x={300} y={340} />
      <Town x={400} y={300} />
      <Town x={470} y={350} r={7} />
      <Town x={520} y={300} />
      <Town x={600} y={350} />
      <Town x={450} y={450} />
      <Town x={520} y={520} />
      <Town x={360} y={500} />
      <Mountains x={540} y={430} n={3} />
      <Forest x={330} y={410} />
      <Compass x={820} y={180} />
      <path
        d="M120 580 q 20 -26 46 -8 q 24 16 46 -2 q 22 -16 44 2"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </>
  );
}

export default function RegionMap({ region = "kanto" }: { region?: string }) {
  return (
    <div className="region-map" aria-hidden="true">
      <svg viewBox="0 0 1000 720" preserveAspectRatio="xMidYMid meet">
        <g filter="url(#inked)">{region === "johto" ? <JohtoChart /> : <KantoChart />}</g>
      </svg>
    </div>
  );
}
