import GameCanvas from "@/components/game/GameCanvas";
import GameArchive from "@/components/game/GameArchive";
import Link from "next/link";

export const metadata = {
  title: "Stellar Interceptor — Free Space Shooter Game",
  description:
    "Play Stellar Interceptor, a free browser-based space shooter. Defend the frontier against enemy ships and asteroids designed from real NASA/JPL celestial data — exoplanets, asteroids, and deep-sky objects. No download required.",
  openGraph: {
    title: "Stellar Interceptor — Free Space Shooter Game",
    description:
      "Browser space shooter with NPCs and levels inspired by real astronomical datasets.",
    type: "website",
    url: "https://example.com/game",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "Stellar Interceptor space shooter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stellar Interceptor — Free Space Shooter Game",
    description:
      "Play a free browser space shooter built with real NASA/JPL celestial data.",
  },
  robots: "index,follow",
};

export default function GamePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero / SEO banner — searchable text content */}
      <header className="relative px-6 py-12 md:px-12 md:py-20 overflow-hidden">
        <div className="mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-accent text-xs font-semibold mb-4">
            Play in Browser
          </div>
          <h1 className="text-4xl md:text-6xl font-mono font-bold tracking-tight text-foreground mb-4">
            Stellar Interceptor
          </h1>
          <p className="text-lg text-muted md:text-xl max-w-2xl mb-8 leading-relaxed">
            A free, no-download space shooter. Fly through wave-based sectors,
            destroy enemy drones and capital ships, and survive as long as you
            can. Every enemy and level theme is designed from real public
            astronomical data — NASA exoplanets, JPL asteroids, and Messier
            deep-sky objects.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#game" className="btn btn-primary">
              Start Game
            </Link>
            <Link href="#archive" className="btn btn-ghost">
              Galactic Archive
            </Link>
          </div>
        </div>

        {/* Decorative subtle grid */}
        <div className="absolute inset-0 -z-10 opacity-20" aria-hidden="true">
          <svg
            className="w-full h-full"
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="1" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </header>

      {/* How to play — searchable content */}
      <section className="px-6 md:px-12 py-12 border-y border-border bg-surface-2/50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground mb-6">How to Play</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-border bg-background">
              <span className="text-accent font-mono text-sm font-bold">Move</span>
              <p className="mt-2 text-sm text-muted">
                Use <b>WASD</b> or <b>arrow keys</b> to pilot your ship.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-background">
              <span className="text-accent font-mono text-sm font-bold">Aim</span>
              <p className="mt-2 text-sm text-muted">
                Your ship aims at the <b>mouse cursor</b> automatically.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-background">
              <span className="text-accent font-mono text-sm font-bold">Shoot</span>
              <p className="mt-2 text-sm text-muted">
                Hold <b>SPACE</b> to fire. Enemies get faster and tougher each
                wave.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Game */}
      <section id="game" className="px-6 md:px-12 py-12">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="sr-only">Stellar Interceptor game</h2>
          <GameCanvas />
        </div>
      </section>

      {/* Searchable archive */}
      <section id="archive" className="border-t border-border">
        <GameArchive />
      </section>

      {/* Footer CTA */}
      <footer className="px-6 md:px-12 py-12 text-center border-t border-border">
        <p className="text-muted text-sm mb-4">
          Built with Next.js, React, HTML5 Canvas & Web Audio. No external
          assets or API keys required.
        </p>
        <Link href="/" className="text-accent hover:underline text-sm">
          ← Return to portfolio
        </Link>
      </footer>
    </div>
  );
}
