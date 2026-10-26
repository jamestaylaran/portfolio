"use client";

import { useLayoutEffect } from "react";

/**
 * Full-screen intro matching your spec:
 * - 3 icons slide UP chronologically, 0.5s interval
 * - "Welcome" slides LEFT, 2s
 * - "to My" slides RIGHT, 2s
 * - "Portfolio Website" slides UP, 2s
 * - After the animations + 2s interval, fades into the home page.
 * All animations use transform/opacity only (GPU-accelerated, lag-free).
 * Header is hidden while intro plays.
 */
export default function Intro() {
  useLayoutEffect(() => {
    document.body.classList.add("intro-active");
    return () => document.body.classList.remove("intro-active");
  }, []);

  return (
    <div
      className="intro-overlay fixed inset-0 z-[9999] bg-background min-h-screen flex flex-col items-center justify-center relative"
      aria-hidden="true"
    >
      {/* Three circular icons, slide up one by one with 0.5s interval */}
      <div className="flex gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-[11px] font-mono text-muted intro-icon intro-icon-delay-0"
        >
          &lt;/&gt;
        </div>
        <div
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-[11px] font-mono text-muted intro-icon intro-icon-delay-500"
        >
          me
        </div>
        <div
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-[11px] font-mono text-muted intro-icon intro-icon-delay-1000"
        >
          web
        </div>
      </div>

      {/* Text: two lines */}
      <h1 className="text-5xl font-bold tracking-tight text-white leading-[1.1] text-center">
        <span className="intro-word-welcome intro-word-delay-0">Welcome</span>{" "}
        <span className="intro-word-to-my intro-word-delay-400">to My</span>
        <br />
        <span className="intro-word-portfolio-website intro-word-delay-800">
          Portfolio Website
        </span>
      </h1>

      {/* URL fades in after the words */}
      <div
        className="mt-8 rounded-full border border-border bg-surface px-6 py-2.5 text-xs text-muted intro-url"
      >
        www.rifiq.vercel.app
      </div>
    </div>
  );
}
