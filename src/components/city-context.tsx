"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type CityContextValue = {
  exploring: boolean;
  setExploring: (value: boolean) => void;
};

const CityContext = createContext<CityContextValue | null>(null);

/**
 * Holds explore state so the backdrop and the trigger button can live in
 * different parts of the tree. The trigger sits inside the hero, anchored to
 * the city view rather than pinned to the viewport, so it cannot simply be a
 * child of the backdrop component.
 */
export function CityProvider({ children }: { children: ReactNode }) {
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
    <CityContext.Provider value={{ exploring, setExploring }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const value = useContext(CityContext);
  if (!value) throw new Error("useCity must be used within a CityProvider");
  return value;
}
