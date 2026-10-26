"use client";

/**
 * Full-screen intro matching your spec:
 * - 3 icons slide UP chronologically, 1s interval
 * - "Welcome" slides LEFT, 2s
 * - "to My" slides RIGHT, 2s
 * - "Portfolio Website" slides UP, 2s
 * - After the animations + 2s interval, fades into the home page.
 * All animations use transform/opacity only (GPU-accelerated, lag-free).
 */
export default function Intro() {
  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
      aria-hidden="true"
    >
      {/* Three circular icons, slide up one by one with 1s interval */}
      <div className="flex gap-6 mb-12">
        <div
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-[11px] font-mono text-muted intro-icon intro-icon-delay-0"
        >
          &lt;/&gt;
        </div>
        <div
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-[11px] font-mono text-muted intro-icon intro-icon-delay-1000"
        >
          me
        </div>
        <div
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-[11px] font-mono text-muted intro-icon intro-icon-delay-2000"
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
        className="mt-16 rounded-full border border-border bg-surface px-6 py-2.5 text-xs text-muted intro-url"
      >
        www.rifiq.vercel.app
      </div>
    </div>
  );
}
