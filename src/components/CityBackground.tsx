"use client";

import { useEffect, useState } from "react";

/**
 * Ambient 3D city (Three.js scene under /public/city), embedded as the page
 * backdrop.
 *
 * Two modes, because the scene's OrbitControls bind wheel-to-zoom: left live,
 * the iframe would swallow every scroll and the page could not move. So by
 * default the iframe is inert and the city is pure atmosphere. "Explore" hands
 * input over to the scene, steps the page copy aside, and lets you orbit and
 * click buildings for their company card.
 *
 * Stacking matters here: the backdrop must never sit on a negative z-index.
 * Behind the body box it still paints, but hit testing resolves to <body>
 * first, so drags and clicks never reach the canvas. It sits at z-0 instead
 * and is lifted above the copy while exploring. For the same reason the
 * trigger button is a sibling at z-50 rather than a child of the backdrop,
 * which would put it under the page copy and make it unclickable.
 */
export default function CityBackground() {
  const [exploring, setExploring] = useState(false);
  const [pastCity, setPastCity] = useState(false);

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

  // The trigger belongs to the city view, so it retires once the copy sections
  // have taken over the screen rather than floating over them forever.
  useEffect(() => {
    const onScroll = () =>
      setPastCity(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 overflow-hidden bg-noir-950 ${
          exploring ? "z-30" : "z-0"
        }`}
      >
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
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-4 px-6 pb-8">
          <p className="rounded-sm bg-noir-950/80 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-noir-100 backdrop-blur-md">
            Drag to orbit · Scroll to zoom · Click a building
          </p>
          <button
            type="button"
            onClick={() => setExploring(false)}
            className="pointer-events-auto rounded-sm bg-amber-500 px-7 py-3.5 text-base font-semibold text-noir-950 shadow-lg shadow-noir-950/50 transition-colors duration-200 hover:bg-amber-400"
          >
            Close city view
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExploring(true)}
          aria-hidden={pastCity}
          tabIndex={pastCity ? -1 : 0}
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-2.5 rounded-sm bg-amber-500 px-7 py-3.5 text-base font-semibold text-noir-950 shadow-lg shadow-noir-950/50 transition-all duration-300 hover:bg-amber-400 ${
            pastCity
              ? "pointer-events-none translate-y-2 opacity-0"
              : "opacity-100"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-noir-950 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-noir-950" />
          </span>
          Explore the city
        </button>
      )}
    </>
  );
}
