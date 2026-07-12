"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Folio from "@/components/Folio";
import { allSpecies, folioForDex, pageCount, pages, roman, dexNo } from "@/lib/data";

const TURN_MS = 700;

interface Turn {
  from: number;
  to: number;
  dir: "forward" | "back";
  fromScroll: number;
}

export default function CodexShell({ initialFolio }: { initialFolio: number }) {
  const [current, setCurrent] = useState(initialFolio);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const turning = useRef(false);

  const go = useCallback(
    (target: number, push = true) => {
      if (turning.current) return;
      target = Math.max(1, Math.min(pageCount, target));
      if (target === current) {
        setSearchOpen(false);
        return;
      }
      turning.current = true;
      setSearchOpen(false);
      const fromScroll = window.scrollY;
      window.scrollTo(0, 0);
      setTurn({
        from: current,
        to: target,
        dir: target > current ? "forward" : "back",
        fromScroll,
      });
      if (push) window.history.pushState({ folio: target }, "", `/codex/${target}`);
      window.setTimeout(() => {
        setCurrent(target);
        setTurn(null);
        turning.current = false;
      }, TURN_MS + 60);
    },
    [current],
  );

  /* keyboard: arrows page, slash searches */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        if (e.key === "Escape") setSearchOpen(false);
        return;
      }
      if (e.key === "ArrowRight") go(current + 1);
      else if (e.key === "ArrowLeft") go(current - 1);
      else if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, current]);

  /* browser back and forward */
  useEffect(() => {
    const onPop = () => {
      const m = window.location.pathname.match(/\/codex\/(\d+)/);
      if (m) go(Number(m[1]), false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [go]);

  /* warm the next folio's first plate so the turn reveals a finished page */
  useEffect(() => {
    for (const n of [current + 1, current - 1]) {
      const page = pages[n - 1];
      if (page) {
        const img = new Image();
        img.src = `/art/${page.members[0].id}.png`;
      }
    }
  }, [current]);

  const stage = (() => {
    if (!turn) {
      return (
        <div className="stage">
          <Folio page={pages[current - 1]} />
        </div>
      );
    }
    const outgoing = (
      <div
        className={`sheet outgoing ${turn.dir}`}
        style={{ zIndex: turn.dir === "forward" ? 3 : 1 }}
        aria-hidden="true"
      >
        <div style={{ transform: `translateY(-${turn.fromScroll}px)` }}>
          <Folio page={pages[turn.from - 1]} />
        </div>
        <div className="sheet-shade" />
      </div>
    );
    const incoming = (
      <div
        className={`sheet incoming ${turn.dir}`}
        style={{ zIndex: turn.dir === "forward" ? 1 : 3 }}
      >
        <Folio page={pages[turn.to - 1]} />
        <div className="sheet-shade" />
      </div>
    );
    return (
      <div className="stage turning">
        {outgoing}
        {incoming}
      </div>
    );
  })();

  return (
    <main className="codex-root">
      {stage}

      <nav className="ribbon" aria-label="Codex navigation">
        <a className="ribbon-home" href="/" title="Close the codex">
          ✦ Cover
        </a>
        <button
          className="ribbon-arrow"
          onClick={() => go(current - 1)}
          disabled={current <= 1}
          aria-label="Previous folio"
        >
          ❮
        </button>
        <button className="ribbon-title" onClick={() => setSearchOpen(true)}>
          folio {roman(turn ? turn.to : current)} of {roman(pageCount)}
          <span className="ribbon-hint">search ⁄ jump</span>
        </button>
        <button
          className="ribbon-arrow"
          onClick={() => go(current + 1)}
          disabled={current >= pageCount}
          aria-label="Next folio"
        >
          ❯
        </button>
      </nav>

      {searchOpen && <SearchOverlay onGo={go} onClose={() => setSearchOpen(false)} />}
    </main>
  );
}

function SearchOverlay({
  onGo,
  onClose,
}: {
  onGo: (folio: number) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const asNumber = Number(query.replace(/^no\.?\s*/, ""));
    if (Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= 151) {
      const sp = allSpecies[asNumber - 1];
      return [sp];
    }
    return allSpecies
      .filter((sp) => sp.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(query) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(query) ? 0 : 1;
        return aStarts - bStarts || a.id - b.id;
      })
      .slice(0, 7);
  }, [q]);

  const pick = (dex: number) => {
    const page = folioForDex(dex);
    if (page) onGo(page.folio);
  };

  return (
    <div className="veil" onClick={onClose} role="dialog" aria-label="Search the codex">
      <div className="search-card paper" onClick={(e) => e.stopPropagation()}>
        <p className="rubric" style={{ marginBottom: ".6rem" }}>Consult the Index</p>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) pick(results[0].id);
            if (e.key === "Escape") onClose();
          }}
          placeholder="A name, or a number of the dex"
          aria-label="Search by name or Pokédex number"
        />
        <ul className="search-results">
          {results.map((sp) => (
            <li key={sp.id}>
              <button onClick={() => pick(sp.id)}>
                <img src={`/art/${sp.id}.png`} alt="" width={40} height={40} loading="lazy" />
                <span className="r-name">{sp.name}</span>
                <span className="r-genus">the {sp.genus} Pokémon</span>
                <span className="r-no">{dexNo(sp.id)}</span>
              </button>
            </li>
          ))}
          {q.trim() && results.length === 0 && (
            <li className="r-none">Nothing of that name is recorded in this volume.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
