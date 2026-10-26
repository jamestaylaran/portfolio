"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Intro from "@/components/Intro";
import ScrollReveal from "@/components/ScrollReveal";
import type { Profile, Achievement, Role, Activity } from "@/lib/types";

// --- Lanyard physics -------------------------------------------------------
// The ID badge hangs from a lace anchored at the top of the viewport. It
// swings like a pendulum, can be grabbed and thrown, and is rope-constrained
// so it can NEVER reach the ground.
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

const GROUND_GAP = 120; // minimum clearance between badge bottom and floor
const ANCHOR_Y = 0; // lace is anchored at the very top edge of the viewport

function createLanyardSystem() {
  const bodies: Body[] = [];
  const GRAVITY = 0.5;
  const AIR_DRAG = 0.994;
  let rafId = 0;
  let grabbed: Body | null = null;
  let anchorX = 0;

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

        // Rope constraint: project back onto the lace sphere and cancel the
        // outward velocity so it swings instead of snapping.
        const dx = b.x - ax;
        const dy = b.y - ANCHOR_Y;
        const d = Math.hypot(dx, dy) || 1;
        if (d > maxD) {
          const nx = dx / d;
          const ny = dy / d;
          b.x = ax + nx * maxD;
          b.y = ANCHOR_Y + ny * maxD;
          const vn = b.vx * nx + b.vy * ny;
          if (vn > 0) {
            b.vx -= vn * nx;
            b.vy -= vn * ny;
          }
          b.vx *= 0.97;
          b.vy *= 0.97;
        }
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

      // Lace tilt: drawn from the anchor down to the badge's top center.
      const hookX = b.x;
      const hookY = b.y - b.h / 2;
      const rdx = hookX - ax;
      const rdy = hookY - ANCHOR_Y;
      const rd = Math.hypot(rdx, rdy) || 1;
      const rdeg = (Math.atan2(-rdx, rdy) * 180) / Math.PI;

      b.el.style.transform = `translate3d(${b.x - b.w / 2}px, ${
        b.y - b.h / 2
      }px, 0) rotate(${rdeg}deg)`;
      b.rope.style.height = `${rd}px`;
      b.rope.style.transform = `translate3d(${ax}px, 0px, 0) rotate(${rdeg}deg)`;
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
    add(el: HTMLElement, rope: HTMLElement, x: number) {
      anchorX = x;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const H = window.innerHeight;
      const W = window.innerWidth;
      const maxD = Math.max(160, H - GROUND_GAP - h / 2);
      const ax = Math.min(anchorX, W - w / 2 - 8);
      // Start swung slightly aside so the badge sways in like a pendulum.
      const phi = -0.2;
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
      rope.style.position = "fixed";

      bodies.push(body);

      // Paint the first frame immediately (no flash at the DOM position).
      const hookX = startX;
      const hookY = startY - h / 2;
      const rdx = hookX - ax;
      const rdy = hookY - ANCHOR_Y;
      const rd = Math.hypot(rdx, rdy) || 1;
      const rdeg = (Math.atan2(-rdx, rdy) * 180) / Math.PI;
      el.style.transform = `translate3d(${startX - w / 2}px, ${
        startY - h / 2
      }px, 0) rotate(${rdeg}deg)`;
      rope.style.height = `${rd}px`;
      rope.style.transform = `translate3d(${ax}px, 0px, 0) rotate(${rdeg}deg)`;
    },
    destroy() {
      cancelAnimationFrame(rafId);
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
    const sys = createLanyardSystem();
    const r = el.getBoundingClientRect();
    sys.add(el, rope, r.left + r.width / 2);
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
            className="hero-anim hero-fade hero-d4 pointer-events-none fixed left-0 top-0 z-[15] w-[3px] origin-top-left rounded-full bg-gradient-to-b from-white/10 via-white/30 to-white/50"
            style={{ height: "320px", willChange: "transform" }}
          >
            {/* Metal clip at the bottom end of the lace */}
            <span className="absolute -bottom-2 left-1/2 h-5 w-4 -translate-x-1/2 rounded-[3px] border border-white/40 bg-white/15">
              <span className="absolute left-1/2 top-1.5 h-3 w-px -translate-x-1/2 bg-white/40" />
            </span>
          </div>

          {/* Draggable ID badge — hangs from the lace, sways like a pendulum,
              and is rope-constrained so it never touches the ground */}
          <div
            ref={badgeRef}
            className="hero-anim hero-fade hero-d4 absolute right-6 top-[16%] w-48 rounded-xl border border-white/10 bg-black/50 p-3 shadow-2xl backdrop-blur-sm sm:right-12 sm:w-56 lg:right-16 lg:w-60"
          >
            {/* Slot hole where the clip meets the card */}
            <div className="mx-auto mb-2 h-2 w-10 rounded-full bg-white/15 ring-1 ring-white/10" />

            <div className="overflow-hidden rounded-lg border border-white/15">
              <img
                src="/id-photo.jpg"
                alt="Profile ID"
                className="h-44 w-full object-cover object-top sm:h-52 lg:h-56"
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
