"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CELESTIAL_BODIES,
  NPC_ARCHETYPES,
  searchArchive,
  type CelestialBody,
  type NpcArchetype,
} from "./data";

type Card = {
  kind: "celestial" | "npc";
  title: string;
  subtitle: string;
  type: string;
  color: string;
  desc: string;
  stats: string;
};

function toCards(): Card[] {
  const celestial: Card[] = CELESTIAL_BODIES.map((b) => ({
    kind: "celestial",
    title: b.name,
    subtitle: b.designation,
    type: b.type,
    color: b.themeColor,
    desc: b.description,
    stats: `Distance: ${b.distanceLy >= 1 ? b.distanceLy.toFixed(1) : "< 0.001"} ly • Size class: ${b.hazardLevel}/5 hazard`,
  }));
  const npcs: Card[] = NPC_ARCHETYPES.map((n) => ({
    kind: "npc",
    title: n.name,
    subtitle: `Archetype: ${n.role}`,
    type: "NPC",
    color: n.color,
    desc: n.description,
    stats: `Hull ${n.hull} • Shield ${n.shield} • Speed ${n.speed} • Score ${n.scoreValue}`,
  }));
  return [...celestial, ...npcs];
}

const TABS = ["all", "celestial", "npc"] as const;

export default function GameArchive() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "celestial" | "npc">("all");
  const allCards = useMemo(() => toCards(), []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return allCards.filter((c) => tab === "all" || c.type === tab || (tab === "celestial" && c.kind === "celestial") || (tab === "npc" && c.kind === "npc"));
    }
    return searchArchive(q).map((item) => {
      // map back to card-ish shape for display
      if ("designation" in item) {
        return {
          kind: "celestial" as const,
          title: item.name,
          subtitle: item.designation,
          type: item.type,
          color: item.themeColor,
          desc: item.description,
          stats: `Distance: ${item.distanceLy >= 1 ? item.distanceLy.toFixed(1) : "< 0.001"} ly • Hazard ${item.hazardLevel}/5`,
        } as Card;
      }
      return {
        kind: "npc" as const,
        title: item.name,
        subtitle: `Archetype: ${item.role}`,
        type: "NPC",
        color: item.color,
        desc: item.description,
        stats: `Hull ${item.hull} • Shield ${item.shield} • Speed ${item.speed} • Score ${item.scoreValue}`,
      } as Card;
    });
  }, [query, tab, allCards]);

  const handleTab = useCallback((next: typeof tab) => setTab(next), []);

  return (
    <section
      id="archive"
      className="max-w-5xl mx-auto px-6 py-12 text-center"
      aria-label="Galactic Archive"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-mono font-bold text-[#22d3ee] mb-2">
          Galactic Archive
        </h2>
        <p className="text-[#94a3b8] text-sm max-w-2xl mx-auto">
          Searchable database of real celestial bodies and the NPC archetypes
          they inspired. Data: NASA Exoplanet Archive, JPL Small-Body Database,
          Messier Catalog.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
        <input
          id="archive-search"
          type="search"
          placeholder="Search celestial bodies or NPCs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-96 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
        />
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => handleTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                tab === t
                  ? "bg-accent text-white"
                  : "bg-surface-2 border border-border text-muted hover:bg-surface"
              }`}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[#94a3b8] text-xs mb-4">
        {results.length} entr{results.length === 1 ? "y" : "ies"} matching
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((card, i) => (
          <article
            key={card.title + i}
            className="card card-hover p-4 text-left relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: card.color }}
            />
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-surface-2 border border-border text-muted"
              >
                {card.kind === "celestial" ? "CELESTIAL" : "NPC"}
              </span>
              {card.kind === "npc" && (
                <span className="ml-auto text-[10px] font-bold text-accent">ENEMY</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
            <p className="text-[11px] text-muted font-mono mb-2">{card.subtitle}</p>
            <p className="text-xs text-[#94a3ad] mb-3 line-clamp-2">{card.desc}</p>
            <div className="mt-auto pt-2 border-t border-border">
              <p className="text-[11px] text-[#94a3ad] font-mono">{card.stats}</p>
            </div>
          </article>
        ))}
        {results.length === 0 && (
          <div className="col-span-3 py-10 text-[#94a3ad]">
            No entries found. Try "Ceres", "Pulsar", or "Proxima".
          </div>
        )}
      </div>

      <p className="mt-6 text-[11px] text-[#6b7280]">
        Sources: NASA Exoplanet Archive • NASA JPL Small-Body Database • Messier
        Catalog. Used for design inspiration only.
      </p>
    </section>
  );
}
