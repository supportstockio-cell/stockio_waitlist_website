"use client";

import { useEffect, useState } from "react";
import { useCity } from "./city-context";

/**
 * Ambient 3D city (Three.js scene under /public/city), embedded as the page
 * backdrop.
 *
 * Two modes, because the scene's OrbitControls bind wheel-to-zoom: left live,
 * the iframe would swallow every scroll and the page could not move. So by
 * default the iframe is inert and the city is pure atmosphere. Explore hands
 * input over to the scene, steps the page copy aside, and lets you orbit and
 * click buildings for their company card.
 *
 * Stacking matters here: the backdrop must never sit on a negative z-index.
 * Behind the body box it still paints, but hit testing resolves to <body>
 * first, so drags and clicks never reach the canvas.
 *
 * The scene mounts only after hydration, which keeps roughly 2MB of Three.js
 * off the critical path so the hero paints first. Reduced-motion and Save-Data
 * users get the gradient and never pay for the scene at all.
 */
export default function CityBackground() {
  const { exploring, setExploring } = useCity();
  const [sceneOn, setSceneOn] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const conn = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (reduced || conn?.saveData) return;
    setSceneOn(true);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 overflow-hidden bg-noir-950 ${
          exploring ? "z-30" : "z-0"
        }`}
      >
        {sceneOn ? (
          <iframe
            src="/city/index.html"
            title={exploring ? "Interactive city" : ""}
            aria-hidden={!exploring}
            tabIndex={-1}
            className="h-full w-full border-0"
            style={{
              pointerEvents: exploring ? "auto" : "none",
              // Without this the browser claims touch gestures before the
              // canvas sees them, so pinch and drag die on phones.
              touchAction: exploring ? "none" : "auto",
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(120% 80% at 70% 88%, oklch(0.42 0.09 62) 0%, oklch(0.24 0.05 55) 38%, oklch(0.15 0.018 55) 78%)",
            }}
          />
        )}

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

      {exploring && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 px-4 pb-6 sm:gap-4 sm:pb-8">
          <p className="rounded-sm bg-noir-950/80 px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-noir-100 backdrop-blur-md sm:px-4 sm:text-xs sm:tracking-[0.14em]">
            Drag to orbit · Pinch to zoom · Tap a building
          </p>
          <button
            type="button"
            onClick={() => setExploring(false)}
            className="pointer-events-auto rounded-sm bg-amber-500 px-6 py-3.5 text-base font-semibold text-noir-950 shadow-lg shadow-noir-950/50 transition-colors duration-200 hover:bg-amber-400 sm:px-7"
          >
            Close city view
          </button>
        </div>
      )}
    </>
  );
}
