"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Intro from "@/components/Intro";
import type { Profile, Achievement, Role, Activity } from "@/lib/types";

// --- Gravity physics -------------------------------------------------------
type Body = {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  radius: number;
  mass: number;
  dragging: boolean;
  targetX: number;
  targetY: number;
  friction: number;
  bounce: number;
};

function createGravitySystem() {
  const bodies: Body[] = [];
  let rafId: number;
  const gravity = 0.6;
  const floorFriction = 0.98;
  const airDrag = 0.999;
  const bounce = 0.5;

  const add = (
    el: HTMLElement,
    startX: number,
    startY: number,
    radius: number,
    mass = 1
  ) => {
    bodies.push({
      el,
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: gravity,
      radius,
      mass,
      dragging: false,
      targetX: startX,
      targetY: startY,
      friction: floorFriction,
      bounce,
    });
    el.style.position = "fixed";
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.transform = "translate(-50%, -50%)";
    el.style.willChange = "transform";
    el.style.cursor = "grab";
  };

  let mouseX = 0;
  let mouseY = 0;
  let mouseDown = false;
  let grabbedBody: Body | null = null;

  const onMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (mouseDown && grabbedBody) {
      grabbedBody.dragging = true;
      grabbedBody.targetX = mouseX;
      grabbedBody.targetY = mouseY;
      grabbedBody.el.style.cursor = "grabbing";
    }
  };

  const onDown = (e: MouseEvent) => {
    mouseDown = true;
    const closest = bodies.reduce(
      (best, b) => {
        const dx = mouseX - b.x;
        const dy = mouseY - b.y;
        const dist = Math.hypot(dx, dy);
        return dist < b.radius && (!best || dist < best.dist) ? { b, dist } : best;
      },
      null as { b: Body; dist: number } | null
    );
    if (closest) {
      grabbedBody = closest.b;
      grabbedBody.dragging = true;
      closest.b.el.style.cursor = "grabbing";
    }
  };

  const onUp = () => {
    mouseDown = false;
    if (grabbedBody) {
      grabbedBody.dragging = false;
      grabbedBody.el.style.cursor = "grab";
      grabbedBody.vx *= 0.3;
      grabbedBody.vy *= 0.3;
      grabbedBody = null;
    }
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mousedown", onDown);
  window.addEventListener("mouseup", onUp);
  window.addEventListener("blur", onUp);

  const step = () => {
    const innerW = window.innerWidth;
    const innerH = window.innerHeight;

    for (const b of bodies) {
      if (b.dragging) {
        const dx = b.targetX - b.x;
        const dy = b.targetY - b.y;
        b.x += dx * 0.25;
        b.y += dy * 0.25;
        b.vx = 0;
        b.vy = 0;
      } else {
        b.vx += b.ax;
        b.vy += b.ay;
        b.vx *= airDrag;
        b.vy *= airDrag;
        b.x += b.vx;
        b.y += b.vy;
      }

      if (b.y + b.radius > innerH) {
        b.y = innerH - b.radius;
        b.vy *= -b.bounce;
        b.vx *= b.friction;
        if (Math.abs(b.vy) < 0.3) b.vy = 0;
      }
      if (b.y - b.radius < 0) {
        b.y = b.radius;
        b.vy *= -b.bounce;
      }
      if (b.x + b.radius > innerW) {
        b.x = innerW - b.radius;
        b.vx *= -b.bounce;
      }
      if (b.x - b.radius < 0) {
        b.x = b.radius;
        b.vx *= -b.bounce;
      }

      b.el.style.transform = `translate(${b.x - 50}px, ${b.y - 50}px)`;
    }

    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);

  return {
    add,
    destroy: () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
    },
  };
}

let gravitySystem: ReturnType<typeof createGravitySystem> | null = null;

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
  const idBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), INTRO_DURATION);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!idBadgeRef.current) return;
    if (!gravitySystem) gravitySystem = createGravitySystem();

    const rect = idBadgeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    gravitySystem.add(idBadgeRef.current, cx, cy, rect.width / 2, 1);

    return () => {
      if (gravitySystem) gravitySystem.destroy();
      gravitySystem = null;
    };
  }, [introDone]);

  const stats = [
    { label: "Achievements", value: achievements.length },
    { label: "Leadership Roles", value: roles.length },
    { label: "Activities", value: activities.length },
  ];

  return (
    <div className="relative glow min-h-screen flex flex-col">
      {!introDone && <Intro />}

      <div
        className={`transition-opacity duration-700 ease-out ${
          introDone ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdHlwZT0icmVwdGV0ZXkiPjxwYXRoIGQ9Ik0gNCAwIEwgMCA0IE0gNDAgNAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzI2MjYzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] [background-size:40px_40px] opacity-40 pointer-events-none" />

        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ background: profile.accent }}>
                {profile.avatar_text}
              </span>
            </Link>
            <ul className="flex items-center gap-1 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/achievements", label: "Portfolio" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="nav-link rounded-md px-3 py-2 text-sm transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="flex-1 relative z-10">
          <section className="mx-auto max-w-5xl px-6 pt-20 pb-24 sm:pt-32 relative">
            <div className="flex flex-col items-start gap-6 animate-slide-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
                <span
                  className="avatar-pill h-2 w-2 rounded-full"
                  style={{ background: profile.accent }}
                />
                {profile.location}
              </span>
              <h1 className="max-w-none text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white">
                Frontend <br />
                <span className="text-gray-400">Developer</span>
              </h1>
              <p className="mt-2 text-sm text-muted tracking-widest uppercase">fresh Graduat_</p>
              <p className="max-w-2xl text-sm text-muted leading-relaxed mt-4">
                Menciptakan website modern dengan tampilan clean, responsif, dan
                elegan. Membangun ide dan desain menjadi pengalaman digital yang
                menarik dan mudah digunakan.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Typescript", "React.js", "Tailwind"].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-8 text-[10px] text-muted tracking-widest">
                ↓ explore my work below<br />
                ↖ open to full-time &amp; freelance opportunities
              </div>
            </div>

            <div
              ref={idBadgeRef}
              className="w-48 h-64 rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm p-4 shadow-2xl"
              style={{
                left: "85%",
                top: "25%",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1272de8e00?w=400&h=500&fit=crop"
                alt="Profile"
                className="w-full h-full object-cover rounded-md border border-white/20"
              />
              <div className="mt-2 text-[10px] text-white/60 tracking-widest uppercase">ID CARD</div>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-6 pb-20 relative">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="card p-6 reveal"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <p className="text-3xl font-bold gradient-text">{s.value}</p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-6 pb-24 relative">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold section-head reveal-line">Featured achievements</h2>
              <Link href="/achievements" className="text-sm text-muted hover:text-foreground">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {achievements.slice(0, 4).map((a, i) => (
                <div
                  key={a.id}
                  className="card card-lift card-hover p-6 reveal"
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                      {a.category}
                    </span>
                    <span className="text-xs text-muted">{a.date}</span>
                  </div>
                  <h3 className="mt-3 font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted">{a.organization}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
