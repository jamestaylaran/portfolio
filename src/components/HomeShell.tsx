"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Intro from "@/components/Intro";
import ScrollReveal from "@/components/ScrollReveal";
import type { Profile, Achievement, Role, Activity } from "@/lib/types";

// --- Gravity physics -------------------------------------------------------
// Viewport-space rigid "cards": fall, bounce off floor/walls, grab & throw.
type Body = {
  el: HTMLElement;
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

function createGravitySystem() {
  const bodies: Body[] = [];
  const GRAVITY = 0.55;
  const FLOOR_FRICTION = 0.985;
  const AIR_DRAG = 0.996;
  const BOUNCE = 0.45;
  let rafId = 0;
  let grabbed: Body | null = null;

  function render(b: Body) {
    // Center-based: translate3d positions the element's center at (x, y).
    const rot = Math.max(-9, Math.min(9, b.vx * 2.2));
    b.el.style.transform = `translate3d(${b.x - b.w / 2}px, ${
      b.y - b.h / 2
    }px, 0) rotate(${rot}deg)`;
  }

  function step() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    for (const b of bodies) {
      if (b.dragging) {
        // Spring toward the pointer — feels weighty but responsive.
        b.vx = (b.targetX - b.x) * 0.3;
        b.vy = (b.targetY - b.y) * 0.3;
        b.x += b.vx;
        b.y += b.vy;
      } else {
        b.vy += GRAVITY;
        b.vx *= AIR_DRAG;
        b.vy *= AIR_DRAG;
        b.x += b.vx;
        b.y += b.vy;

        // Floor
        const floorY = H - b.h / 2;
        if (b.y > floorY) {
          b.y = floorY;
          b.vy *= -BOUNCE;
          b.vx *= FLOOR_FRICTION;
          if (Math.abs(b.vy) < 0.7) b.vy = 0;
        }
        // Ceiling
        if (b.y - b.h / 2 < 0) {
          b.y = b.h / 2;
          b.vy *= -BOUNCE;
        }
        // Walls
        if (b.x + b.w / 2 > W) {
          b.x = W - b.w / 2;
          b.vx *= -BOUNCE;
        }
        if (b.x - b.w / 2 < 0) {
          b.x = b.w / 2;
          b.vx *= -BOUNCE;
        }
      }
      render(b);
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
    grabbed.vx *= 0.5; // keeps some momentum for a satisfying throw
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
    add(el: HTMLElement, x: number, y: number) {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const body: Body = {
        el,
        x,
        y,
        vx: 0,
        vy: 0,
        w,
        h,
        dragging: false,
        targetX: x,
        targetY: y,
      };
      // Fixed at viewport origin; translate3d alone places the center.
      el.style.position = "fixed";
      el.style.left = "0";
      el.style.top = "0";
      el.style.zIndex = "30";
      el.style.willChange = "transform";
      el.style.cursor = "grab";
      el.style.touchAction = "none";
      el.style.userSelect = "none";
      render(body);
      bodies.push(body);
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

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), INTRO_DURATION);
    return () => clearTimeout(t);
  }, []);

  // Gravity only kicks in once the intro has handed off, so the badge drops
  // into view instead of falling while the screen is still covered.
  useEffect(() => {
    if (!introDone) return;
    const el = badgeRef.current;
    if (!el) return;
    const sys = createGravitySystem();
    const r = el.getBoundingClientRect();
    sys.add(el, r.left + r.width / 2, r.top + r.height / 2);
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

          {/* Draggable ID badge — drops in with gravity once the intro ends */}
          <div
            ref={badgeRef}
            className="hero-anim hero-fade hero-d4 absolute right-6 top-[16%] w-40 rounded-xl border border-white/10 bg-black/50 p-3 shadow-2xl backdrop-blur-sm sm:right-12 sm:w-48 lg:right-16"
          >
            <div className="overflow-hidden rounded-lg border border-white/15">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1272de8e00?w=400&h=500&fit=crop"
                alt="Profile ID"
                className="h-36 w-full object-cover sm:h-44"
                draggable={false}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/60">
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
