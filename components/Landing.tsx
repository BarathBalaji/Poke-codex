"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RedSilhouette from "@/components/RedSilhouette";
import { regionStartFolio } from "@/lib/data";

const JOHTO_FOLIO = regionStartFolio("johto");

export default function Landing() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);
  const coverRef = useRef<HTMLDivElement>(null);

  const openCodex = (folio = 1) => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => router.push(`/codex/${folio}`), 950);
  };

  return (
    <main className="landing">
      {/* ——— Act I: the summit at dusk ——— */}
      <section className="summit" aria-label="Codex Monstrorum, an illuminated bestiary of Kanto">
        <div className="sky">
          <div className="stars" aria-hidden="true" />
          <div className="sun" aria-hidden="true" />
        </div>

        <svg className="range range-far" viewBox="0 0 1600 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M0 500 L 190 260 L 330 400 L 520 170 L 700 380 L 900 220 L 1080 400 L 1290 190 L 1450 360 L 1600 280 V500 Z" />
        </svg>
        <svg className="range range-mid" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M0 420 L 240 160 L 430 340 L 650 90 L 880 330 L 1120 150 L 1330 330 L 1600 200 V420 Z" />
        </svg>
        <div className="mist" aria-hidden="true" />
        <svg className="range range-near" viewBox="0 0 1600 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M0 340 L 160 250 Q 420 120 700 210 Q 760 226 830 218 L 1090 160 Q 1330 120 1600 240 V340 Z" />
        </svg>

        <svg className="flock" viewBox="0 0 200 60" aria-hidden="true">
          <path d="M10 30 q 8 -10 16 0 q 8 -10 16 0 M70 14 q 7 -9 14 0 q 7 -9 14 0 M130 40 q 6 -8 12 0 q 6 -8 12 0" fill="none" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        <RedSilhouette className="red" aria-label="A lone trainer stands on the summit, ball in hand" />

        {/* the illustrated frontispiece; covers the drawn scene when present */}
        {photoOk && (
          <img
            className="hero-photo"
            src="/hero.jpg"
            alt="The frontispiece: a lone figure upon a peak beneath a storm of golden cloud"
            onError={() => setPhotoOk(false)}
          />
        )}
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-frame" aria-hidden="true" />

        <div className="hero-copy">
          <p className="hero-eyebrow">An illuminated bestiary of the first kingdom</p>
          <h1 className="hero-title">Codex Monstrorum</h1>
          <p className="hero-sub">
            The creatures of Kanto and Johto, drawn and recorded in the manner
            of the old almanacs, from the annals of the first five generations.
          </p>
          <a className="hero-cta" href="#tome">
            Descend to the codex
            <span className="cta-glyph" aria-hidden="true">❦</span>
          </a>
        </div>
      </section>

      {/* ——— Act II: the tome ——— */}
      <section className="study" id="tome">
        <p className="study-eyebrow">Upon the desk lies the volume</p>

        <div
          ref={coverRef}
          className={`tome${opening ? " opening" : ""}`}
          onClick={() => openCodex(1)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openCodex(1);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open the codex at Kanto"
        >
          <div className="tome-pages" aria-hidden="true" />
          <div className="tome-cover">
            <div className="tooling">
              <span className="tooling-title">
                Codex
                <br />
                Monstrorum
              </span>
              <svg className="medallion" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="4" />
                <path d="M 8 60 H 44 M 76 60 H 112" fill="none" strokeWidth="4" />
                <circle cx="60" cy="60" r="16" fill="none" strokeWidth="4" />
                <circle cx="60" cy="60" r="6" />
              </svg>
              <span className="tooling-sub">Kanto · Johto</span>
              <span className="tooling-foot">CCLI creatures · two kingdoms</span>
            </div>
          </div>
        </div>

        {opening ? (
          <p className="study-invite">The cover lifts.</p>
        ) : (
          <div className="kingdom-entries">
            <button className="kingdom-btn" onClick={() => openCodex(1)}>
              <span className="kb-eyebrow">begin the first kingdom</span>
              <span className="kb-name">Kanto</span>
            </button>
            <span className="kingdom-div" aria-hidden="true">❦</span>
            <button className="kingdom-btn" onClick={() => openCodex(JOHTO_FOLIO)}>
              <span className="kb-eyebrow">begin the second kingdom</span>
              <span className="kb-name">Johto</span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
