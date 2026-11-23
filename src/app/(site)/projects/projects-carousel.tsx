"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Activity } from "@/lib/types";

const TECH_KEYWORDS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Tailwind",
  "Node",
  "Firebase",
  "Supabase",
  "Laravel",
  "PHP",
  "MySQL",
  "MongoDB",
  "Flutter",
  "Unity",
  "Figma",
  "Vercel",
];

const PALETTES = [
  { from: "#dbe6ff", to: "#f7f2e7", accent: "#6366f1" },
  { from: "#ffe1c6", to: "#f7f2e7", accent: "#f59e0b" },
  { from: "#d8e8da", to: "#f7f2e7", accent: "#10b981" },
  { from: "#e7dcf5", to: "#f7f2e7", accent: "#a855f7" },
  { from: "#ffe0e6", to: "#f7f2e7", accent: "#f43f5e" },
];

function detectTags(p: Activity): string[] {
  const text = `${p.title} ${p.description}`.toLowerCase();
  const found = TECH_KEYWORDS.filter((t) => text.includes(t.toLowerCase()));
  const tags = Array.from(new Set(found));
  if (p.link && p.link !== "#" && p.link !== "...") tags.push("Live demo");
  if (tags.length === 0) tags.push(p.activity_type || "Project");
  return tags.slice(0, 3);
}

function hostOf(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "project.preview";
  }
}

function yearOf(date: string) {
  if (!date) return "";
  const m = date.match(/\d{4}/);
  return m ? m[0] : date;
}

function hasLink(p: Activity) {
  return Boolean(p.link && p.link !== "#" && p.link !== "...");
}

type Palette = (typeof PALETTES)[number];

function screenshotUrl(link: string) {
  return `https://image.thum.io/get/width/800/crop/640/noanimate/${link}`;
}

function MockBody({ project, pal }: { project: Activity; pal: Palette }) {
  return (
    <div className="px-4 py-4">
      <p className="text-[9px] uppercase tracking-[0.24em] text-neutral-400">
        {project.activity_type}
      </p>
      <p className="mt-1 line-clamp-2 text-xl font-black leading-tight text-neutral-800">
        {project.title}
      </p>
      <div className="mt-3 space-y-1.5">
        <span className="block h-1.5 w-4/5 rounded bg-neutral-200" />
        <span className="block h-1.5 w-3/5 rounded bg-neutral-200" />
        <span className="block h-1.5 w-2/3 rounded bg-neutral-100" />
      </div>
      <div className="mt-3 flex gap-1.5">
        <span className="h-5 w-12 rounded" style={{ background: pal.from }} />
        <span className="h-5 w-8 rounded" style={{ background: pal.to }} />
        <span
          className="h-5 w-10 rounded"
          style={{ background: `${pal.accent}22` }}
        />
      </div>
    </div>
  );
}

function ProjectPreview({ project, index }: { project: Activity; index: number }) {
  const pal = PALETTES[index % PALETTES.length];
  const linked = hasLink(project);
  const host = linked ? hostOf(project.link) : "project.preview";
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showShot = linked && !failed;

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(140deg, ${pal.from}, ${pal.to})`,
        }}
      />
      <span
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full"
        style={{ background: pal.accent, opacity: 0.16, filter: "blur(8px)" }}
        aria-hidden="true"
      />

      {/* Browser window */}
      <div className="absolute inset-3 flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_24px_44px_-24px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
        <div className="flex shrink-0 items-center gap-1.5 border-b border-black/5 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#ff6058]" />
          <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex-1 truncate rounded bg-neutral-100 px-2 py-0.5 text-[9px] text-neutral-400">
            {host}
          </span>
        </div>

        <div className="relative flex-1 overflow-hidden bg-white">
          {showShot ? (
            <>
              {!loaded && (
                <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,#eef0f3,#f8f9fb,#eef0f3)]" />
              )}
              {/* Live screenshot of the project's real homepage */}
              <img
                src={screenshotUrl(project.link)}
                alt={`${project.title} homepage`}
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                loading="lazy"
                referrerPolicy="no-referrer"
                className={`h-full w-full object-cover object-top transition-opacity duration-500 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/25 to-transparent" />
            </>
          ) : (
            <MockBody project={project} pal={pal} />
          )}
        </div>
      </div>
    </div>
  );
}

function OpenProjectButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="group/open absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-900 shadow-lg ring-1 ring-black/5 transition hover:bg-white hover:shadow-xl"
    >
      <span className="relative flex h-6 w-6 items-center justify-center rounded-full">
        <span className="arrow-circulate absolute inset-0 rounded-full border border-dashed border-neutral-400" />
        <span
          aria-hidden="true"
          className="text-xs transition-transform duration-300 group-hover/open:-translate-y-0.5 group-hover/open:translate-x-0.5"
        >
          ↗
        </span>
      </span>
      Open project
    </a>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="arrow-nudge h-5 w-5 transition-transform duration-500 ease-out group-hover:rotate-[360deg]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir === "left" ? (
        <>
          <path d="M19 12H5" />
          <path d="m11 18-6-6 6-6" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}
    </svg>
  );
}

export default function ProjectsCarousel({ projects }: { projects: Activity[] }) {
  const count = projects.length;
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(360);
  const [cardW, setCardW] = useState(380);
  const [sideOn, setSideOn] = useState(true);

  const drag = useRef({ active: false, startX: 0, dx: 0 });
  const dragged = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const w = Math.min(vw * 0.86, 400);
      const sides = vw >= 640;
      setCardW(w);
      setSideOn(sides);
      setStep(sides ? w + 52 : w * 0.84);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const go = useCallback(
    (dir: number) => {
      if (count < 2) return;
      setActive((a) => (a + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const onPointerDown = (e: ReactPointerEvent) => {
    drag.current = { active: true, startX: e.clientX, dx: 0 };
    dragged.current = false;
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag.current.active) return;
    drag.current.dx = e.clientX - drag.current.startX;
    if (Math.abs(drag.current.dx) > 8) dragged.current = true;
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    const dx = drag.current.dx;
    drag.current.active = false;
    setDragging(false);
    if (dx < -60) go(1);
    else if (dx > 60) go(-1);
  };

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-surface px-6 py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background">
          <span className="text-xl text-accent">📦</span>
        </div>
        <h3 className="text-lg font-semibold text-white">No projects yet</h3>
        <p className="mt-2 max-w-xs text-sm text-muted">
          Add your first project from the dashboard to showcase it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`projects-stage relative h-[540px] select-none overflow-hidden sm:h-[610px] ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {projects.map((p, i) => {
          let off = i - active;
          if (off > count / 2) off -= count;
          if (off < -count / 2) off += count;

          const abs = Math.abs(off);
          const isActive = off === 0;
          const visible = sideOn ? abs <= 1 : isActive;
          const scale = isActive ? 1 : 0.82;
          const opacity = !visible ? 0 : isActive ? 1 : 0.55;
          const tags = detectTags(p);

          return (
            <article
              key={p.id}
              onClick={() => {
                if (!isActive && !dragged.current) setActive(i);
              }}
              className="project-slide absolute left-1/2 top-1/2 flex h-[500px] flex-col overflow-hidden rounded-[26px] border border-border bg-surface p-3 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)] sm:h-[545px]"
              style={{
                width: cardW,
                zIndex: 30 - abs,
                opacity,
                pointerEvents: visible ? "auto" : "none",
                transform: `translate(-50%, -50%) translateX(${off * step}px) scale(${scale})`,
                filter: isActive ? "none" : "saturate(0.6) brightness(0.82)",
              }}
              aria-hidden={!isActive}
            >
              <div className="relative h-[54%] overflow-hidden rounded-[18px] ring-1 ring-white/10">
                <ProjectPreview project={p} index={i} />
                {isActive && hasLink(p) && <OpenProjectButton href={p.link} />}
              </div>

              <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.22em] text-muted">
                  <span className="truncate">{p.activity_type}</span>
                  <span>{yearOf(p.date)}</span>
                </div>

                <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight text-white">
                  {p.title}
                </h3>

                {p.description && (
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">
                    {p.description}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-border bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={count < 2}
          aria-label="Previous project"
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
        >
          <ArrowIcon dir="left" />
        </button>

        <span className="text-sm font-medium tabular-nums tracking-[0.25em] text-muted">
          {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={count < 2}
          aria-label="Next project"
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
        >
          <ArrowIcon dir="right" />
        </button>

        <span className="hidden text-[11px] uppercase tracking-[0.25em] text-muted sm:inline">
          Drag or use arrows to explore
        </span>
      </div>
    </div>
  );
}
