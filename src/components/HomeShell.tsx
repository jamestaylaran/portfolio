"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Intro from "@/components/Intro";
import ScrollReveal from "@/components/ScrollReveal";
import type { Profile, Achievement, Role, Activity } from "@/lib/types";

// --- Lanyard physics -------------------------------------------------------
// The ID badge hangs from a lace anchored at the top of the viewport, like a
// real lanyard: it swings inside a sane cone, can be grabbed and thrown, and
// is rope-constrained so it can NEVER reach the ground or flip sideways.
type Body = {
  el: HTMLElement;
  rope: HTMLElement;
  x: number; // center X (viewport px)
  y: number; // center Y (viewport px)
  vx: number;
  vy: number;
  w: number;
  h: number;
  dragging: boolean;
  targetX: number;
  targetY: number;
};

const GROUND_GAP = 120; // minimum clearance between badge and the floor
const ANCHOR_Y = 0; // lace is anchored at the very top edge of the viewport
const MAX_ANGLE = 0.62; // ~35° max swing from vertical — stays upright
const MAX_SPEED = 14; // px/frame cap so throws stay graceful, never violent

function createLanyardSystem() {
  const bodies: Body[] = [];
  const GRAVITY = 0.5;
  const AIR_DRAG = 0.99;
  let rafId = 0;
  let grabbed: Body | null = null;
  let anchorX = 0;
  let anchorEl: HTMLElement | null = null;

  // The lace hangs from directly below the Contact nav link — re-measured
  // whenever the layout shifts (window resize).
  const updateAnchorFromNav = () => {
    if (!anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    anchorX = r.left + r.width / 2;
  };
  window.addEventListener("resize", updateAnchorFromNav);

  function render(b: Body, ax: number) {
    // Rope angle: direction from the anchor down to the badge center.
    const dx = b.x - ax;
    const dy = b.y - ANCHOR_Y;
    const th = Math.atan2(-dx, dy); // 0 = hanging straight down
    const thDeg = (th * 180) / Math.PI;

    // The card rotates about its TOP center (transform-origin 50% 0), so the
    // slot stays glued to the end of the lace even while tilted.
    const slotX = b.x + (b.h / 2) * Math.sin(th);
    const slotY = b.y - (b.h / 2) * Math.cos(th);
    b.el.style.transform = `translate3d(${slotX - b.w / 2}px, ${slotY}px, 0) rotate(${thDeg}deg)`;

    const rdx = slotX - ax;
    const rdy = slotY - ANCHOR_Y;
    const rd = Math.hypot(rdx, rdy) || 1;
    const rdeg = (Math.atan2(-rdx, rdy) * 180) / Math.PI;
    b.rope.style.height = `${rd}px`;
    b.rope.style.transform = `translate3d(${ax}px, 0px, 0) rotate(${rdeg}deg)`;
  }

  function step() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    for (const b of bodies) {
      // Recomputed every frame so window resizes stay correct.
      const maxD = Math.max(160, H - GROUND_GAP - b.h / 2);
      const ax = Math.min(anchorX, W - b.w / 2 - 8);

      if (b.dragging) {
        // Spring toward the pointer, clamped inside the lace length.
        let tx = b.targetX;
        let ty = b.targetY;
        const ddx = tx - ax;
        const ddy = ty - ANCHOR_Y;
        const dd = Math.hypot(ddx, ddy) || 1;
        if (dd > maxD) {
          tx = ax + (ddx / dd) * maxD;
          ty = ANCHOR_Y + (ddy / dd) * maxD;
        }
        b.vx = (tx - b.x) * 0.3;
        b.vy = (ty - b.y) * 0.3;
        b.x += b.vx;
        b.y += b.vy;
      } else {
        b.vy += GRAVITY;
        b.vx *= AIR_DRAG;
        b.vy *= AIR_DRAG;
        b.x += b.vx;
        b.y += b.vy;
      }

      // Rope sphere + swing cone clamp. The cone is what keeps the card
      // upright: it can lean at most 35° either way, never past horizontal,
      // never up near the anchor.
      const dx = b.x - ax;
      const dy = b.y - ANCHOR_Y;
      const d = Math.hypot(dx, dy) || 1;
      const ang = Math.atan2(dx, dy); // 0 = straight down
      const cAng = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, ang));
      const cD = Math.min(d, maxD);
      if (cAng !== ang || cD !== d) {
        b.x = ax + Math.sin(cAng) * cD;
        b.y = ANCHOR_Y + Math.cos(cAng) * cD;
        if (!b.dragging) {
          // Project velocity onto what's still allowed: inward radial motion
          // (rope limit) and tangential motion (cone limit).
          const nx = Math.sin(cAng);
          const ny = Math.cos(cAng); // radial, outward
          const tnx = Math.cos(cAng);
          const tny = -Math.sin(cAng); // tangent
          const vn = b.vx * nx + b.vy * ny;
          const vt = b.vx * tnx + b.vy * tny;
          const vr = vn > 0 ? 0 : vn;
          const keepTan = cAng === ang;
          b.vx = nx * vr + tnx * (keepTan ? vt : 0);
          b.vy = ny * vr + tny * (keepTan ? vt : 0);
        }
      }

      // Speed cap — no violent slingshots.
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > MAX_SPEED) {
        b.vx = (b.vx / sp) * MAX_SPEED;
        b.vy = (b.vy / sp) * MAX_SPEED;
      }

      // Walls
      if (b.x + b.w / 2 > W) {
        b.x = W - b.w / 2;
        b.vx *= -0.4;
      }
      if (b.x - b.w / 2 < 0) {
        b.x = b.w / 2;
        b.vx *= -0.4;
      }

      // Absolute ground guard (belt & suspenders).
      const maxCy = H - GROUND_GAP - b.h / 2;
      if (b.y > maxCy) {
        b.y = maxCy;
        if (b.vy > 0) b.vy = 0;
      }

      render(b, ax);
    }

    rafId = requestAnimationFrame(step);
  }

  const onPointerDown = (e: PointerEvent) => {
    for (const b of bodies) {
      if (
        Math.abs(e.clientX - b.x) <= b.w / 2 &&
        Math.abs(e.clientY - b.y) <= b.h / 2
      ) {
        grabbed = b;
        b.dragging = true;
        b.targetX = e.clientX;
        b.targetY = e.clientY;
        b.el.style.cursor = "grabbing";
        try {
          b.el.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        break;
      }
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!grabbed) return;
    grabbed.targetX = e.clientX;
    grabbed.targetY = e.clientY;
  };

  const onPointerUp = () => {
    if (!grabbed) return;
    grabbed.dragging = false;
    grabbed.el.style.cursor = "grab";
    grabbed.vx *= 0.5;
    grabbed.vy *= 0.5;
    grabbed = null;
  };

  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("blur", onPointerUp);

  rafId = requestAnimationFrame(step);

  return {
    add(el: HTMLElement, rope: HTMLElement, x: number, aEl?: HTMLElement | null) {
      anchorX = x;
      anchorEl = aEl ?? null;
      if (anchorEl) updateAnchorFromNav();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const H = window.innerHeight;
      const W = window.innerWidth;
      const maxD = Math.max(160, H - GROUND_GAP - h / 2);
      const ax = Math.min(anchorX, W - w / 2 - 8);
      // Start gently swung aside so the badge sways in like a pendulum.
      const phi = -0.18;
      const startX = ax + Math.sin(phi) * maxD;
      const startY = ANCHOR_Y + Math.cos(phi) * maxD;

      const body: Body = {
        el,
        rope,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        w,
        h,
        dragging: false,
        targetX: startX,
        targetY: startY,
      };

      el.style.position = "fixed";
      el.style.left = "0";
      el.style.top = "0";
      el.style.zIndex = "30";
      el.style.willChange = "transform";
      el.style.cursor = "grab";
      el.style.touchAction = "none";
      el.style.userSelect = "none";
      // Rotate around the slot at the top of the card, where the clip is.
      el.style.transformOrigin = "50% 0";
      rope.style.position = "fixed";

      bodies.push(body);

      // Paint the first frame immediately (no flash at the DOM position).
      render(body, ax);
    },
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateAnchorFromNav);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("blur", onPointerUp);
    },
  };
}

const INTRO_DURATION = 5000;

type HomeShellProps = {
  profile: Profile;
  achievements: Achievement[];
  roles: Role[];
  activities: Activity[];
};

export default function HomeShell({
  profile,
  achievements,
  roles,
  activities,
}: HomeShellProps) {
  const [introDone, setIntroDone] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), INTRO_DURATION);
    return () => clearTimeout(t);
  }, []);

  // Lace physics only kicks in once the intro has handed off, so the badge
  // sways into view instead of moving while the screen is still covered.
  useEffect(() => {
    if (!introDone) return;
    const el = badgeRef.current;
    const rope = ropeRef.current;
    if (!el || !rope) return;
    // Anchor the lace directly below the "Contact" nav link.
    const contact = document.querySelector<HTMLElement>(
      'header a[href="/contact"]'
    );
    const r = el.getBoundingClientRect();
    const fallbackX = r.left + r.width / 2;
    const cx = contact
      ? contact.getBoundingClientRect().left +
        contact.getBoundingClientRect().width / 2
      : fallbackX;
    const sys = createLanyardSystem();
    sys.add(el, rope, cx, contact);
    return () => sys.destroy();
  }, [introDone]);

  const stats = [
    { label: "Achievements", value: achievements.length },
    { label: "Leadership Roles", value: roles.length },
    { label: "Activities", value: activities.length },
  ];

  return (
    <div className={`relative glow min-h-screen ${introDone ? "home-ready" : ""}`}>
      {!introDone && <Intro />}

      <div
        className={`transition-opacity duration-700 ease-out ${
          introDone ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Grid background pattern */}
        <div className="fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdHlwZT0icmVwdGV0ZXkiPjxwYXRoIGQ9Ik0gNCAwIEwgMCA0IE0gNDAgNAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzI2MjYzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] [background-size:40px_40px] opacity-40 pointer-events-none" />

        {/* Full-bleed hero: content hard left, badge hanging on the right */}
        <section className="relative flex min-h-[88vh] w-full items-center px-6 py-20 sm:px-10 lg:px-16">
          <div className="flex w-full max-w-[64rem] flex-col items-start gap-5">
            <span className="hero-anim hero-left hero-d1 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
              <span
                className="avatar-pill h-2 w-2 rounded-full"
                style={{ background: profile.accent }}
              />
              {profile.location}
            </span>

            <h1 className="hero-anim hero-left hero-d2 text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              Frontend
              <br />
              <span className="text-gray-500">Developer</span>
            </h1>

            <p className="hero-anim hero-right hero-d3 text-sm uppercase tracking-[0.35em] text-muted">
              fresh Graduat_
            </p>

            <p className="hero-anim hero-up hero-d4 max-w-xl text-sm leading-relaxed text-muted">
              Menciptakan website modern dengan tampilan clean, responsif, dan
              elegan. Membangun ide dan desain menjadi pengalaman digital yang
              menarik dan mudah digunakan.
            </p>

            <div className="hero-anim hero-up hero-d5 flex flex-wrap gap-3">
              {["Typescript", "React.js", "Tailwind"].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="hero-anim hero-up hero-d6 text-[10px] uppercase tracking-[0.25em] text-muted">
              ↓ explore my work below
              <br />↖ open to full-time &amp; freelance opportunities
            </div>
          </div>

          {/* ID lace — thick string anchored at the top edge of the screen,
              running down to the badge (length/tilt updated every frame) */}
          <div
            ref={ropeRef}
            className="hero-anim hero-fade hero-d4 pointer-events-none fixed left-0 top-0 z-[15] w-9 origin-top bg-[linear-gradient(90deg,#0d0d12_0%,#23232f_45%,#17171f_68%,#0a0a0f_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] sm:w-10"
            style={{ height: "320px", willChange: "transform" }}
          >
            {/* "ID CARD" printed repeatedly down the woven strap */}
            <div className="flex h-full flex-col items-center justify-around py-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="shrink-0 select-none whitespace-nowrap font-mono text-[7px] font-bold tracking-[0.08em] text-white/55"
                >
                  ID CARD
                </span>
              ))}
            </div>

            {/* Snap-hook clasp at the bottom end, clipping into the slot */}
            <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-white/35 bg-black/70" />
              <span className="-mt-1 h-7 w-4 rounded-[4px] border border-white/25 bg-[#0e0e13]">
                <span className="mx-auto mt-2 h-4 w-px bg-white/30" />
              </span>
            </span>
          </div>

          {/* Draggable ID badge — hangs from the lace, sways like a pendulum,
              and is rope-constrained so it never touches the ground */}
          <div
            ref={badgeRef}
            className="hero-anim hero-fade hero-d4 absolute right-6 top-[16%] w-52 rounded-xl border border-white/10 bg-black/50 p-3 shadow-2xl backdrop-blur-sm sm:right-12 sm:w-60 lg:right-16 lg:w-64"
          >
            {/* Slot hole where the clip meets the card */}
            <div className="mx-auto mb-2 h-2 w-10 rounded-full bg-white/15 ring-1 ring-white/10" />

            <div className="overflow-hidden rounded-lg border border-white/15">
              <img
                src="/id-photo.jpg"
                alt="Profile ID"
                className="h-48 w-full object-cover object-top sm:h-56 lg:h-64"
                draggable={false}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/60">
              <span>ID CARD</span>
              <span className="text-white/40">✦ grab me</span>
            </div>
          </div>
        </section>

        {/* Lower sections only mount after the intro so their scroll-reveal
            animations actually play */}
        {introDone && (
          <>
            <section className="relative z-10 w-full px-6 pb-20 sm:px-10 lg:px-16">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((s, i) => (
                  <ScrollReveal key={s.label} delay={i * 100}>
                    <div className="card p-6">
                      <p className="text-3xl font-bold gradient-text">
                        {s.value}
                      </p>
                      <p className="mt-1 text-sm text-muted">{s.label}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            <section className="relative z-10 w-full px-6 pb-24 sm:px-10 lg:px-16">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold section-head">
                  Featured achievements
                </h2>
                <Link
                  href="/achievements"
                  className="text-sm text-muted hover:text-foreground"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {achievements.slice(0, 4).map((a, i) => (
                  <ScrollReveal key={a.id} delay={i * 120}>
                    <div className="card card-lift card-hover p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                          {a.category}
                        </span>
                        <span className="text-xs text-muted">{a.date}</span>
                      </div>
                      <h3 className="mt-3 font-semibold">{a.title}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {a.organization}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
