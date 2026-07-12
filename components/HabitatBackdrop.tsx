/**
 * Faint ink-wash habitat scenes drawn behind folio content.
 * One wide scene per PokeAPI habitat, kept abstract: layered silhouette
 * bands in the folio's own ink so they read as washes on the paper.
 */

const INK = "#4a3a22";

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "auto 0 0 0",
        width: "100%",
        height: "min(46%, 380px)",
        opacity: 0.085,
        mixBlendMode: "multiply",
        pointerEvents: "none",
      }}
    >
      <filter id="wash">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="10" />
      </filter>
      <g filter="url(#wash)" fill={INK}>{children}</g>
    </svg>
  );
}

const scenes: Record<string, React.ReactNode> = {
  grassland: (
    <Scene>
      <path opacity=".5" d="M0 330 Q 300 260 620 315 T 1200 300 V420 H0 Z" />
      <path opacity=".8" d="M0 380 Q 260 330 560 368 T 1200 360 V420 H0 Z" />
      <path d="M120 372 l6 -46 4 46 M138 374 l10 -34 6 34 M990 356 l8 -52 5 52 M1012 358 l12 -38 6 38 M560 400 l7 -40 5 40 M580 402 l10 -30 6 30" stroke={INK} strokeWidth="4" fill="none" />
    </Scene>
  ),
  forest: (
    <Scene>
      <path opacity=".4" d="M0 420 V300 l70 -90 60 90 30 -40 50 60 V420 Z" />
      <path opacity=".4" d="M1200 420 V280 l-80 -100 -60 100 -40 -50 -60 80 V420 Z" />
      <path opacity=".75" d="M170 420 v-130 l55 -110 55 110 v130 Z M300 420 v-100 l45 -80 45 80 v100 Z" />
      <path opacity=".75" d="M880 420 v-140 l60 -120 60 120 v140 Z M800 420 v-90 l40 -70 40 70 v90 Z" />
      <path opacity=".9" d="M0 400 Q 400 380 1200 396 V420 H0 Z" />
    </Scene>
  ),
  "waters-edge": (
    <Scene>
      <path opacity=".45" d="M0 320 Q 300 280 600 312 T 1200 306 V420 H0 Z" />
      <path opacity=".8" d="M0 372 Q 350 350 700 366 T 1200 362 V420 H0 Z" />
      <path d="M180 360 v-70 M192 360 v-88 M204 360 v-64 M960 350 v-76 M974 350 v-94 M988 350 v-60" stroke={INK} strokeWidth="5" fill="none" />
      <path d="M60 396 q 40 -10 80 0 M620 402 q 50 -12 100 0 M1040 398 q 40 -10 80 0" stroke={INK} strokeWidth="3" fill="none" opacity=".7" />
    </Scene>
  ),
  sea: (
    <Scene>
      <path opacity=".35" d="M0 310 Q 150 290 300 310 T 600 310 T 900 310 T 1200 310 V420 H0 Z" />
      <path opacity=".6" d="M0 350 Q 150 328 300 350 T 600 350 T 900 350 T 1200 350 V420 H0 Z" />
      <path opacity=".9" d="M0 390 Q 150 372 300 390 T 600 390 T 900 390 T 1200 390 V420 H0 Z" />
      <path d="M540 300 q 30 -50 80 -44 q -20 26 -14 44 Z" opacity=".7" />
    </Scene>
  ),
  cave: (
    <Scene>
      <path opacity=".55" d="M0 420 V80 q 90 10 120 90 q 20 -40 60 -50 q 10 60 -20 120 L 130 420 Z" />
      <path opacity=".55" d="M1200 420 V60 q -100 16 -130 100 q -24 -44 -66 -54 q -8 66 26 126 l 40 188 Z" />
      <path d="M300 90 l 18 70 10 -70 M370 96 l 14 52 8 -52 M840 84 l 16 64 10 -64" stroke={INK} strokeWidth="8" fill="none" opacity=".5" />
      <path opacity=".85" d="M0 400 Q 300 380 600 396 T 1200 392 V420 H0 Z" />
      <ellipse cx="430" cy="404" rx="60" ry="10" opacity=".5" />
      <ellipse cx="760" cy="410" rx="80" ry="12" opacity=".5" />
    </Scene>
  ),
  mountain: (
    <Scene>
      <path opacity=".4" d="M0 420 L 220 130 L 340 300 L 470 90 L 640 420 Z" />
      <path opacity=".6" d="M520 420 L 760 60 L 880 240 L 980 140 L 1200 420 Z" />
      <path opacity=".9" d="M0 420 L 140 300 L 300 420 Z M 860 420 L 1020 280 L 1200 420 Z" />
      <path d="M745 82 l 15 -22 15 22 -10 16 z" opacity=".55" />
    </Scene>
  ),
  "rough-terrain": (
    <Scene>
      <path opacity=".45" d="M0 340 L 180 260 L 320 330 L 520 240 L 700 330 L 900 260 L 1200 330 V420 H0 Z" />
      <path opacity=".8" d="M0 390 Q 300 366 600 384 T 1200 380 V420 H0 Z" />
      <path opacity=".7" d="M240 388 q 10 -46 56 -44 q 40 2 44 44 Z M 850 380 q 8 -38 48 -36 q 34 2 38 36 Z" />
      <path d="M420 372 l 20 -30 22 30 M 1050 368 l 16 -24 18 24" stroke={INK} strokeWidth="5" fill="none" opacity=".6" />
    </Scene>
  ),
  urban: (
    <Scene>
      <path opacity=".4" d="M60 420 V240 h70 v-40 h50 v40 h40 V420 Z M980 420 V220 h60 v-50 h44 v50 h50 V420 Z" />
      <path opacity=".65" d="M280 420 V280 h56 v-36 h36 v36 h60 V420 Z M760 420 V260 h64 v-44 h40 v44 h56 V420 Z" />
      <path opacity=".9" d="M480 420 V300 h52 v-30 h30 v30 h58 V420 Z" />
      <path d="M120 240 v-30 M1010 220 v-34" stroke={INK} strokeWidth="6" fill="none" opacity=".5" />
      <path opacity=".9" d="M0 404 H1200 V420 H0 Z" />
    </Scene>
  ),
  rare: (
    <Scene>
      <path opacity=".35" d="M0 360 Q 300 320 600 350 T 1200 344 V420 H0 Z" />
      <path opacity=".7" d="M0 396 Q 400 376 800 392 T 1200 388 V420 H0 Z" />
      <path d="M600 120 l 10 34 34 10 -34 10 -10 34 -10 -34 -34 -10 34 -10 Z" opacity=".8" />
      <path d="M320 200 l 6 20 20 6 -20 6 -6 20 -6 -20 -20 -6 20 -6 Z M 900 170 l 7 24 24 7 -24 7 -7 24 -7 -24 -24 -7 24 -7 Z" opacity=".55" />
      <path d="M480 260 q 60 -40 120 0 M 660 240 q 50 -30 100 6" stroke={INK} strokeWidth="3" fill="none" opacity=".5" />
    </Scene>
  ),
};

export default function HabitatBackdrop({ habitat }: { habitat: string }) {
  return <>{scenes[habitat] ?? scenes.rare}</>;
}
