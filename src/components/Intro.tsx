"use client";

/**
 * Full-screen intro with word-by-word directional slide-ins.
 * Each word enters from a different side for a staggered, cinematic feel.
 * Animations are transform/opacity only (GPU-accelerated) to stay buttery
 * smooth and lag-free.
 */
export default function Intro() {
  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
      aria-hidden="true"
    >
      {/* Three circular icon chips mirroring the reference */}
      <div className="flex gap-5 mb-16">
        {["</>", "me", "web"].map((label, i) => (
          <div
            key={label}
            className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-[11px] font-mono text-muted transition-colors hover:border-accent hover:text-accent"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            {label}
          </div>
        ))}
      </div>

      <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
        <span className="intro-word intro-left intro-delay-50">Welcome</span>{" "}
        <span className="intro-word intro-right intro-delay-150">to</span>{" "}
        <span className="intro-word intro-up intro-delay-250">my</span>{" "}
        <span className="intro-word intro-down intro-delay-350">Portfolio</span>{" "}
        <span className="intro-word intro-left intro-delay-450">Website</span>
      </h1>

      <div
        className="mt-14 rounded-full border border-border bg-surface px-6 py-2.5 text-xs text-muted animate-fade-in intro-delay-600"
      >
        www.rifiq.vercel.app
      </div>
    </div>
  );
}
