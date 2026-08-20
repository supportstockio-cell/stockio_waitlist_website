"use client";

import { useEffect, useState } from "react";

/**
 * Ambient 3D city (Three.js scene under /public/city), embedded as the page
 * backdrop.
 *
 * Two modes, because the scene's OrbitControls bind wheel-to-zoom: left live,
 * the iframe would swallow every scroll and the page could not move. So by
 * default the iframe is inert (pointer-events: none) and the city is pure
 * atmosphere. "Explore" hands input over to the scene, fades the page copy out
 * and lets you orbit and click buildings for their company card.
 */
export default function CityBackground() {
  const [exploring, setExploring] = useState(false);

  useEffect(() => {
    document.body.dataset.explore = exploring ? "on" : "off";
  }, [exploring]);

  useEffect(() => {
    if (!exploring) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExploring(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exploring]);

  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden bg-noir-950">
        <iframe
          src="/city/index.html"
          title={exploring ? "Interactive city" : ""}
          aria-hidden={!exploring}
          tabIndex={-1}
          className="h-full w-full border-0"
          style={{ pointerEvents: exploring ? "auto" : "none" }}
        />
        {/* Scrim keeps hero copy legible; it lifts entirely in explore mode. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: exploring ? 0 : 1,
            background:
              "radial-gradient(115% 85% at 72% 18%, transparent 0%, transparent 34%, oklch(0.15 0.018 55 / 0.42) 72%, oklch(0.15 0.018 55 / 0.82) 100%), linear-gradient(180deg, oklch(0.15 0.018 55 / 0.42) 0%, oklch(0.15 0.018 55 / 0.14) 30%, oklch(0.15 0.018 55 / 0.5) 72%, oklch(0.15 0.018 55 / 0.88) 100%)",
          }}
        />
      </div>

      {exploring ? (
        <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-4 px-6 pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-noir-300">
            Drag to orbit · Scroll to zoom · Click a building
          </p>
          <button
            type="button"
            onClick={() => setExploring(false)}
            className="rounded-sm border border-amber-500/40 bg-noir-950/85 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-amber-400 backdrop-blur-md transition-colors duration-200 hover:border-amber-500 hover:text-amber-300"
          >
            Close city view
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExploring(true)}
          className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-sm border border-noir-700 bg-noir-950/80 px-5 py-3 backdrop-blur-md transition-colors duration-200 hover:border-amber-500/60"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-noir-200 transition-colors duration-200 group-hover:text-amber-400">
            Explore the city
          </span>
        </button>
      )}
    </>
  );
}
