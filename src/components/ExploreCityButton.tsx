"use client";

import { useCity } from "./city-context";

/**
 * Trigger for explore mode. Rendered inside the hero so it sits in the corner
 * of the city view and scrolls away with it, rather than floating in the
 * viewport corner over every section below.
 */
export default function ExploreCityButton() {
  const { exploring, setExploring } = useCity();
  if (exploring) return null;

  return (
    <button
      type="button"
      onClick={() => setExploring(true)}
      className="inline-flex items-center gap-2.5 rounded-sm bg-amber-500 px-6 py-3.5 text-base font-semibold text-noir-950 shadow-lg shadow-noir-950/40 transition-colors duration-200 hover:bg-amber-400 sm:px-7"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-noir-950 opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-noir-950" />
      </span>
      Explore the city
    </button>
  );
}
