"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Intro from "@/components/Intro";
import ScrollReveal from "@/components/ScrollReveal";
import type { Profile, Achievement, Role, Activity } from "@/lib/types";

// --- Lanyard physics -------------------------------------------------------
// The card hangs from a thin strap anchored just below the navbar on the
// top-right of the landing (like the reference portfolio): it swings inside
// a sane cone, can be grabbed and thrown, and is rope-constrained so it
// can NEVER reach the ground or flip sideways.
type Body = {
  el: HTMLElement;
  rope: HTMLElement;
  segs: HTMLElement[]; // strap segments (3D bend + twist)
  shades: HTMLElement[]; // per-segment darkening as it turns edge-on
  clasp: HTMLElement; // snap-hook at the strap's end
  anchorClip: HTMLElement | null; // black buckle at the strap's top
  x: number; // center X (viewport px)
  y: number; // center Y (viewport px)
  vx: number;
  vy: number;
  w: number;
  h: number;
  dragging: boolean;
  targetX: number;
  targetY: number;
  vxS: number; // smoothed lateral speed — drives the ribbon twist
  twist: number; // smoothed twist in degrees (grows toward the badge)
  laceLen: number; // design length: taut when the badge hangs at rest
  segW: number; // segment width (9) — for centering on the curve
  segH: number; // segment base height — scaleY reference
  flip: number; // current card-flip angle (0 = photo, 180 = info)
  flipV: number; // flip angular velocity
  flipTarget: number; // which face should be showing
  flipEl: HTMLElement | null; // inner wrapper that rotates on the Y axis
};

const GROUND_GAP = 120; // minimum clearance between badge and the floor
const ANCHOR_Y = 86; // just below the sticky navbar — the buckle's height
const ANCHOR_OFFSET = 130; // px from the right edge — top-right hang spot
const OVERHANG = 14; // the card may lean slightly past the screen edge
const LACE_SEGS = 14; // strap segments along the bend curve
const CARD_LEAN = 8; // baked-in tilt (deg), like a casually hung badge
const MAX_ANGLE = 0.62; // ~35° max swing from vertical — stays upright
const MAX_SPEED = 14; // px/frame cap so throws stay graceful, never violent
const ROPE_K = 0.2; // lace spring stiffness — bungee catch that bounces
const ROPE_DAMP = 0.08; // softens each successive bounce
const HARD_STRETCH = 1.12; // lace never stretches past 12% of its length
const RESTITUTION = 0.5; // energy kept when a hard impact rebounds
const BOUNCE_VN = 3; // min outward speed that triggers a rebound

// Short strap, like the reference: the card hangs high, close under the
// buckle, and grows its strap only slightly with card size.
const restLaceLen = (h: number) => Math.max(44, h * 0.17 + 22);

function createLanyardSystem() {
  const bodies: Body[] = [];
  const GRAVITY = 0.5;
  const AIR_DRAG = 0.99;
  let rafId = 0;
  let grabbed: Body | null = null;
  let anchorX = 0;
  let lastSy = 0; // last seen window.scrollY — the lanyard rides the landing
  let downX = 0; // pointer where the grab started — tells tap from drag
  let downY = 0;
  let downT = 0;
  let tapMoved = false;

  // The strap is clipped under the navbar's right side (re-measured on
  // resize). Its ANCHOR Y follows window scroll, so the whole lanyard
  // stays on the landing and scrolls away with the hero.
  const updateAnchor = () => {
    anchorX = window.innerWidth - ANCHOR_OFFSET;
    // Keep the strap in sync with the landing on resize: segment width,
    // the card's own box, the strap length, and each segment's height.
    for (const b of bodies) {
      const s0 = b.segs[0];
      if (s0) b.segW = s0.offsetWidth;
      b.w = b.el.offsetWidth;
      b.h = b.el.offsetHeight;
      b.laceLen = restLaceLen(b.h);
      b.segH = b.laceLen / Math.max(1, b.segs.length) + 2;
      for (const s of b.segs) s.style.height = `${b.segH}px`;
    }
  };
  window.addEventListener("resize", updateAnchor);

  // Quadratic bezier point — the lace's bend curve.
  function bez(
    t: number,
    x0: number,
    y0: number,
    cx: number,
    cy: number,
    x1: number,
    y1: number
  ) {
    const u = 1 - t;
    return {
      x: u * u * x0 + 2 * u * t * cx + t * t * x1,
      y: u * u * y0 + 2 * u * t * cy + t * t * y1,
    };
  }

  function render(b: Body, ax: number, ay: number, time: number) {
    // Badge tilt: direction from the anchor down to the badge center.
    const dx = b.x - ax;
    const dy = b.y - ay;
    const th = Math.atan2(-dx, dy); // 0 = hanging straight down
    const thDeg = (th * 180) / Math.PI;

    // The card rotates about its TOP center (transform-origin 50% 0), so the
    // slot stays glued to the end of the lace even while tilted.
    const slotX = b.x + (b.h / 2) * Math.sin(th);
    const slotY = b.y - (b.h / 2) * Math.cos(th);
    b.el.style.transform = `translate3d(${slotX - b.w / 2}px, ${slotY}px, 0) rotate(${thDeg}deg)`;
    // The flip spins on its own inner axis so the pendulum tilt and the
    // flip never fight each other. A small baked-in lean (CARD_LEAN) makes
    // it hang tilted like the reference's polaroid, and the pivot sits at
    // the card's top — right where the clip is.
    if (b.flipEl) {
      b.flipEl.style.transform = `rotate(${CARD_LEAN}deg) perspective(900px) rotateY(${b.flip}deg)`;
    }
    // The buckle stays glued to the anchor point, above the strap's start.
    if (b.anchorClip) {
      b.anchorClip.style.transform = `translate3d(${ax}px, ${ay}px, 0) translate(-50%, -100%)`;
    }

    // --- 3D lace ---------------------------------------------------------
    // BEND: the strap follows a quadratic bezier from the anchor to the
    // slot. Its control point sags under gravity (deeper when the card is
    // lifted and the strap has slack) and lags opposite the card's motion,
    // so the strap bows like a real cord instead of a ruler-straight line.
    // The strap is short, so the sag stays modest.
    const n = b.segs.length;
    const dist = Math.hypot(slotX - ax, slotY - ay) || 1;
    const slack = Math.max(0, b.laceLen - dist);
    const sag = 4 + Math.min(20, slack * 0.35) + Math.max(0, b.vy) * 1.2;
    const ccx = (ax + slotX) / 2 - b.vxS * 3;
    const ccy = (ay + slotY) / 2 + sag;

    // TWIST: each segment gets a rotateY that grows toward the badge plus a
    // slow ripple that never stops — the woven strap keeps flipping and
    // turning in 3D like a real ribbon.
    let lastDeg = 0;
    for (let i = 0; i < n; i++) {
      const p0 = bez(i / n, ax, ay, ccx, ccy, slotX, slotY);
      const p1 = bez((i + 1) / n, ax, ay, ccx, ccy, slotX, slotY);
      const sx = p1.x - p0.x;
      const sy = p1.y - p0.y;
      const segLen = Math.hypot(sx, sy) + 1.5;
      const deg = (Math.atan2(-sx, sy) * 180) / Math.PI;
      const rotY =
        b.twist * ((i + 1) / n) + Math.sin(time * 0.0015 + i * 0.75) * 6;

      b.segs[i].style.transform = `translate3d(${p0.x - b.segW / 2}px, ${p0.y}px, 0) rotate(${deg}deg) scaleY(${segLen / b.segH}) perspective(520px) rotateY(${rotY}deg)`;
      // Edge-on segments go dark, like a ribbon catching less light.
      b.shades[i].style.opacity = (
        (1 - Math.abs(Math.cos((rotY * Math.PI) / 180))) *
        0.5
      ).toFixed(3);
      lastDeg = deg;
    }

    // Snap-hook at the strap's end, pivoting right where it meets the slot.
    b.clasp.style.transform = `translate3d(${slotX}px, ${slotY + 10}px, 0) translate(-50%, -100%) rotate(${lastDeg}deg)`;
  }

  function step() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const time = performance.now();

    // The whole lanyard rides the landing: when the page scrolls, the anchor
    // and the badge move with it 1:1, so the badge only lives on the hero
    // and scrolls away with it instead of hovering over the content below.
    const sy = window.scrollY;
    const dsy = sy - lastSy;
    if (dsy !== 0) {
      for (const b of bodies) {
        b.y -= dsy;
        b.targetY -= dsy;
      }
      lastSy = sy;
    }
    const ay = ANCHOR_Y - sy;

    for (const b of bodies) {
      // Lace length: short, so the card hangs high near the buckle.
      // Recomputed on resize. The card may lean slightly past the edge.
      const maxD = b.laceLen + b.h / 2;
      const ax = Math.min(anchorX, W + OVERHANG - b.w / 2);

      // --- forces (computed from the current position) --------------------
      if (b.dragging) {
        // Damped spring toward the pointer.
        b.vx = (b.vx + (b.targetX - b.x) * 0.32) * 0.9;
        b.vy = (b.vy + (b.targetY - b.y) * 0.32) * 0.9;
      } else {
        b.vy += GRAVITY;
      }

      // Bungee lace: elastic past its length, so a dropped badge gets caught
      // and bounces back instead of snapping dead.
      const dx = b.x - ax;
      const dy = b.y - ay;
      const d = Math.hypot(dx, dy) || 1;
      const nx = dx / d;
      const ny = dy / d;
      if (d > maxD) {
        const stretch = d - maxD;
        b.vx += -nx * stretch * ROPE_K;
        b.vy += -ny * stretch * ROPE_K;
        const vn = b.vx * nx + b.vy * ny;
        if (vn > 0) {
          b.vx -= nx * vn * ROPE_DAMP;
          b.vy -= ny * vn * ROPE_DAMP;
        }
      }

      b.vx *= AIR_DRAG;
      b.vy *= AIR_DRAG;

      // --- integrate ------------------------------------------------------
      b.x += b.vx;
      b.y += b.vy;

      // --- constraints ----------------------------------------------------
      // Hard lace cap — if something moves faster than the lace can absorb,
      // clamp it and rebound (the classic drop-it-and-it-bounces).
      let cx2 = b.x - ax;
      let cy2 = b.y - ay;
      const cd = Math.hypot(cx2, cy2) || 1;
      if (cd > maxD * HARD_STRETCH) {
        const cnx = cx2 / cd;
        const cny = cy2 / cd;
        b.x = ax + cnx * maxD * HARD_STRETCH;
        b.y = ay + cny * maxD * HARD_STRETCH;
        const vn = b.vx * cnx + b.vy * cny;
        if (vn > BOUNCE_VN && !b.dragging) {
          // Impact too hard for the spring: bounce it back.
          b.vx -= (1 + RESTITUTION) * vn * cnx;
          b.vy -= (1 + RESTITUTION) * vn * cny;
        } else if (vn > 0) {
          b.vx -= vn * cnx;
          b.vy -= vn * cny;
        }
      }

      // Swing cone: keeps the card upright — max 35° from vertical.
      const ang = Math.atan2(cx2, cy2); // 0 = straight down
      const cAng = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, ang));
      if (cAng !== ang) {
        b.x = ax + Math.sin(cAng) * cd;
        b.y = ay + Math.cos(cAng) * cd;
        // Cancel the tangential velocity that pushed it past the cone.
        const tnx = Math.cos(cAng);
        const tny = -Math.sin(cAng);
        const vt = b.vx * tnx + b.vy * tny;
        b.vx -= tnx * vt;
        b.vy -= tny * vt;
      }

      // Speed cap — no violent slingshots.
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > MAX_SPEED) {
        b.vx = (b.vx / sp) * MAX_SPEED;
        b.vy = (b.vy / sp) * MAX_SPEED;
      }

      // Walls — the right wall sits slightly past the screen edge so the
      // card can hang half cut-off, like the reference's polaroid.
      if (b.x + b.w / 2 > W + OVERHANG) {
        b.x = W + OVERHANG - b.w / 2;
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

      // Twist: smooth the badge's lateral speed into a ribbon-twist angle.
      b.vxS += (b.vx - b.vxS) * 0.15;
      const twistTarget = Math.max(-58, Math.min(58, b.vxS * 4.5));
      b.twist += (twistTarget - b.twist) * 0.12;

      // Card flip: spring toward the target face with a slight overshoot,
      // like snapping a real ID card over.
      const fdiff = b.flipTarget - b.flip;
      if (Math.abs(fdiff) < 0.08 && Math.abs(b.flipV) < 0.08) {
        b.flip = b.flipTarget;
        b.flipV = 0;
      } else {
        b.flipV = (b.flipV + fdiff * 0.14) * 0.84;
        b.flip += b.flipV;
      }

      render(b, ax, ay, time);
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
        downX = e.clientX;
        downY = e.clientY;
        downT = performance.now();
        tapMoved = false;
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
    if (
      Math.abs(e.clientX - downX) > 6 ||
      Math.abs(e.clientY - downY) > 6
    ) {
      tapMoved = true;
    }
    grabbed.targetX = e.clientX;
    grabbed.targetY = e.clientY;
  };

  const onPointerUp = (e?: Event) => {
    if (!grabbed) return;
    const b = grabbed;
    b.dragging = false;
    b.el.style.cursor = "grab";
    b.vx *= 0.5;
    b.vy *= 0.5;
    // A quick tap (barely moved) flips the card; a real drag throws it.
    if (
      !tapMoved &&
      e?.type === "pointerup" &&
      performance.now() - downT < 500
    ) {
      b.flipTarget = b.flipTarget === 0 ? 180 : 0;
    }
    grabbed = null;
  };

  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("blur", onPointerUp);

  rafId = requestAnimationFrame(step);

  return {
    add(el: HTMLElement, rope: HTMLElement) {
      updateAnchor();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const W = window.innerWidth;
      // Short strap: the card hangs high, close under the buckle.
      const laceLen = restLaceLen(h);
      const maxD = laceLen + h / 2;
      const ax = Math.min(anchorX, W + OVERHANG - w / 2);
      const ay = ANCHOR_Y - window.scrollY;
      lastSy = window.scrollY;
      // Entry: the card starts up near the buckle and falls in — the strap
      // feeds out as it drops, then catches it with a bounce.
      const phi = -0.1;
      const d0 = Math.min(h / 2 + 68, maxD * 0.6);
      const startX = ax + Math.sin(phi) * d0;
      const startY = ay + Math.cos(phi) * d0;

      const segs = Array.from(rope.querySelectorAll<HTMLElement>(".lace-seg"));
      const shades = segs.map(
        (s) => s.querySelector<HTMLElement>(".lace-shade") as HTMLElement
      );
      const clasp = rope.querySelector<HTMLElement>(
        ".lace-clasp"
      ) as HTMLElement;
      const anchorClip = rope.querySelector<HTMLElement>(".lace-anchor");

      const body: Body = {
        el,
        rope,
        segs,
        shades,
        clasp,
        anchorClip,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        w,
        h,
        dragging: false,
        targetX: startX,
        targetY: startY,
        vxS: 0,
        twist: 0,
        laceLen,
        segW: segs[0] ? segs[0].offsetWidth : 9,
        segH: laceLen / Math.max(1, segs.length) + 2,
        flip: 0,
        flipV: 0,
        flipTarget: 0,
        flipEl: el.querySelector<HTMLElement>(".badge-flipper"),
      };

      // The segments are absolutely positioned with only absolute children,
      // so their CSS height is 0 — scaleY would keep them at 0 and the strap
      // would render as faint outlined lines with gaps. Giving each its
      // natural height makes scaleY stretch it to exactly span the curve
      // (with a 1.5px overlap) every frame.
      for (const s of segs) s.style.height = `${body.segH}px`;

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
      render(body, ax, ay, performance.now());
    },
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("blur", onPointerUp);
    },
  };
}

const INTRO_DURATION = 5000;
const TYPE_TEXT = "fresh Graduate"; // typed out under the headline

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
  const [typed, setTyped] = useState("");
  const badgeRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), INTRO_DURATION);
    return () => clearTimeout(t);
  }, []);

  // Typewriter line under the headline, like the reference's "Happy
  // coding_": types out once the hero entrance starts, then the cursor
  // keeps blinking forever.
  useEffect(() => {
    if (!introDone) return;
    let iv = 0;
    const start = window.setTimeout(() => {
      let i = 0;
      iv = window.setInterval(() => {
        i += 1;
        setTyped(TYPE_TEXT.slice(0, i));
        if (i >= TYPE_TEXT.length) window.clearInterval(iv);
      }, 70);
    }, 750);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(iv);
    };
  }, [introDone]);

  // Lace physics only kicks in once the intro has handed off, so the badge
  // sways into view instead of moving while the screen is still covered.
  useEffect(() => {
    if (!introDone) return;
    const el = badgeRef.current;
    const rope = ropeRef.current;
    if (!el || !rope) return;
    // The strap is clipped under the navbar's right side; the card rests
    // near the top-right of the landing and scrolls away with it.
    const sys = createLanyardSystem();
    sys.add(el, rope);
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

        {/* Full-bleed hero: content hard left, card hanging top-right */}
        <section className="relative flex min-h-[88vh] w-full items-center px-6 py-20 sm:px-10 lg:px-16">
          {/* Soft ambient light orbs (static blurred blobs, like the
              reference portfolio) */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <span className="hero-orb -top-24 right-16 h-72 w-72 bg-white/[0.04]" />
            <span
              className="hero-orb -bottom-32 -left-16 h-80 w-80"
              style={{ background: "var(--accent-soft)" }}
            />
          </div>

          <div className="flex w-full max-w-[64rem] flex-col items-start gap-5">
            <span className="hero-anim hero-blur hero-d1 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
              <span
                className="avatar-pill h-2 w-2 rounded-full"
                style={{ background: profile.accent }}
              />
              {profile.location}
            </span>

            <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              <span className="hero-anim hero-scale hero-d2 block">
                Frontend
              </span>
              <span className="hero-anim hero-rotate hero-d3 block text-gray-500">
                Developer
              </span>
            </h1>

            <p className="hero-anim hero-fade hero-d4 text-sm uppercase tracking-[0.35em] text-muted">
              {typed}
              <span className="type-cursor">_</span>
            </p>

            <p className="hero-anim hero-up hero-d5 max-w-xl text-sm leading-relaxed text-muted">
              Menciptakan website modern dengan tampilan clean, responsif, dan
              elegan. Membangun ide dan desain menjadi pengalaman digital yang
              menarik dan mudah digunakan.
            </p>

            <div className="flex flex-wrap gap-3">
              {["Typescript", "React.js", "Tailwind"].map((tech, i) => (
                <span
                  key={tech}
                  className="hero-anim hero-pop rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                  style={{ animationDelay: `${1.05 + i * 0.12}s` }}
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="hero-anim hero-up hero-d7 text-[10px] uppercase tracking-[0.25em] text-muted">
              ↓ explore my work below
              <br />↖ open to full-time &amp; freelance opportunities
            </div>
          </div>

          {/* "SCROLL ↓" indicator at the hero's bottom center, like the
              reference portfolio */}
          <div className="hero-anim hero-fade hero-d7 pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted sm:flex">
            <span>scroll</span>
            <span className="scroll-arrow">↓</span>
          </div>

          {/* ID strap — a thin flat strap that BENDS (bezier sag + lag)
              and TWISTS (rotateY ripple along its length); the physics
              transforms every segment every frame */}
          <div
            ref={ropeRef}
            className="hero-anim hero-fade hero-d1 pointer-events-none fixed left-0 top-0 z-[15]"
            style={{ width: 0, height: 0 }}
          >
            {/* Black buckle clipped under the navbar — the strap threads
                through it */}
            <span className="lace-anchor" />

            {/* Metal snap-hook at the strap's end, clipping into the slot */}
            <span className="lace-clasp flex flex-col items-center">
              <span className="lace-clasp-ring" />
              <span className="lace-clasp-hook" />
            </span>

            {/* Strap segments laid along the bend curve */}
            {Array.from({ length: LACE_SEGS }, (_, i) => (
              <div key={i} className="lace-seg">
                <span className="lace-shade" />
              </div>
            ))}
          </div>

          {/* Draggable photo card — hangs from the strap, sways like a
              pendulum, and flips over on tap: polaroid photo on the front,
              short info on the back. The fade lives on the wrapper so the
              inner 3D flip never gets flattened during the fade-in. */}
          <div className="badge-shell hero-anim hero-fade hero-d1 absolute right-6 top-[16%] z-[30] w-52 sm:right-12 sm:w-60 lg:right-16 lg:w-64">
            <div
              ref={badgeRef}
              className="relative w-52 sm:w-60 lg:w-64"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="badge-flipper">
                {/* FRONT — polaroid photo card */}
                <div className="badge-face rounded-[14px] bg-[#f3f3f6] p-2.5 pb-9 shadow-[0_22px_50px_-14px_rgba(0,0,0,0.65)]">
                  {/* Slot hole punched through the white frame */}
                  <div className="mx-auto mb-2 h-1.5 w-9 rounded-full bg-black/15" />

                  <div className="relative overflow-hidden rounded-[6px]">
                    <img
                      src="/id-photo.jpg"
                      alt="Profile ID"
                      className="h-48 w-full object-cover object-top grayscale sm:h-56 lg:h-64"
                      draggable={false}
                    />
                    <span
                      className="absolute right-2 top-1.5 text-xs text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]"
                      title="Tap to flip"
                    >
                      ↻
                    </span>
                  </div>
                  <p className="mt-2 text-center text-[9px] uppercase tracking-[0.22em] text-black/45">
                    ✦ grab me ✦
                  </p>
                </div>

                {/* BACK — short info, like a note on the back of the photo */}
                <div
                  className="badge-face absolute inset-0 flex flex-col rounded-[14px] bg-[#f3f3f6] p-2.5 pb-9 shadow-[0_22px_50px_-14px_rgba(0,0,0,0.65)]"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <div className="mx-auto mb-2 h-1.5 w-9 rounded-full bg-black/15" />

                  <div className="flex flex-1 flex-col justify-center gap-3 px-1.5">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.22em] text-black/40">
                        Nickname
                      </p>
                      <p className="text-xl font-bold tracking-wide text-[#17171d]">
                        RYOTA
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.22em] text-black/40">
                        Age
                      </p>
                      <p className="text-xl font-bold text-[#17171d]">22</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.22em] text-black/40">
                        Motto
                      </p>
                      <p className="text-[13px] italic leading-snug text-black/60">
                        “Turning ideas into interfaces — one pixel at a time.”
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between px-1 text-[9px] uppercase tracking-[0.18em] text-black/45">
                    <span>ID CARD</span>
                    <span>↻ tap to flip</span>
                  </div>
                </div>
              </div>
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
                  className="hover-slide px-3 py-1 text-sm text-muted hover:text-foreground"
                >
                  <span>View all →</span>
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
