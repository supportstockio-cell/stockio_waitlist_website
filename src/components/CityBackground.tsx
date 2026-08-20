/**
 * Ambient 3D city, rendered from a self-contained Three.js scene exported by
 * Claude Design (see /public/city/index.html). It's embedded as a
 * non-interactive iframe: pointer-events are disabled so drags/clicks pass
 * straight through to the page, which also means the scene's own idle timer
 * never gets reset by user input and its built-in slow orbit runs forever.
 * A Coco Noir scrim sits above it for text legibility.
 */
export default function CityBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-noir-950" aria-hidden="true">
      <iframe
        src="/city/index.html"
        title=""
        tabIndex={-1}
        loading="eager"
        className="h-full w-full scale-[1.08] border-0"
        style={{ pointerEvents: "none" }}
      />
      {/* scrim: darkest at the edges and toward the bottom, clearest center-top
          where the hero copy sits, so the skyline still reads through */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 78% 20%, transparent 0%, transparent 30%, oklch(0.15 0.018 55 / 0.55) 68%, oklch(0.15 0.018 55 / 0.92) 100%), linear-gradient(180deg, oklch(0.15 0.018 55 / 0.55) 0%, oklch(0.15 0.018 55 / 0.35) 22%, oklch(0.15 0.018 55 / 0.75) 78%, var(--noir-950) 100%)",
        }}
      />
    </div>
  );
}
