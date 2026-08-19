import type { ReactNode } from "react";

type Building = {
  x: number;
  width: number;
  height: number;
  roof: "flat" | "step" | "dome" | "spire" | "screen";
  delay: number;
};

// Varied rooflines echoing the in-app archetypes: flat/parapet, stepped
// tech tower, domed consumer building, finance spire, screen-fronted board.
const buildings: Building[] = [
  { x: 0, width: 58, height: 210, roof: "flat", delay: 0.2 },
  { x: 62, width: 44, height: 150, roof: "step", delay: 0.9 },
  { x: 110, width: 36, height: 260, roof: "spire", delay: 0.4 },
  { x: 150, width: 62, height: 190, roof: "screen", delay: 1.4 },
  { x: 216, width: 40, height: 130, roof: "dome", delay: 0.1 },
  { x: 260, width: 50, height: 300, roof: "flat", delay: 1.1 },
  { x: 314, width: 34, height: 170, roof: "step", delay: 0.6 },
  { x: 352, width: 46, height: 230, roof: "spire", delay: 1.7 },
  { x: 402, width: 58, height: 165, roof: "flat", delay: 0.3 },
];

const VIEW_WIDTH = 460;
const VIEW_HEIGHT = 320;

function Roofline({ b }: { b: Building }) {
  const top = VIEW_HEIGHT - b.height;
  switch (b.roof) {
    case "step":
      return (
        <>
          <rect x={b.x + b.width * 0.18} y={top - 16} width={b.width * 0.64} height={16} fill="var(--noir-800)" />
          <rect x={b.x} y={top} width={b.width} height={b.height} fill="var(--noir-850)" />
        </>
      );
    case "dome":
      return (
        <>
          <path
            d={`M ${b.x} ${top} a ${b.width / 2} ${b.width / 2} 0 0 1 ${b.width} 0 z`}
            fill="var(--noir-850)"
          />
          <rect x={b.x} y={top} width={b.width} height={b.height} fill="var(--noir-850)" />
        </>
      );
    case "spire":
      return (
        <>
          <polygon
            points={`${b.x + b.width / 2},${top - 34} ${b.x + b.width * 0.62},${top} ${b.x + b.width * 0.38},${top}`}
            fill="var(--noir-800)"
          />
          <rect x={b.x} y={top} width={b.width} height={b.height} fill="var(--noir-850)" />
        </>
      );
    case "screen":
      return (
        <>
          <rect x={b.x} y={top} width={b.width} height={b.height} fill="var(--noir-850)" />
          <rect
            x={b.x + b.width * 0.14}
            y={top + b.height * 0.08}
            width={b.width * 0.72}
            height={b.height * 0.22}
            fill="var(--noir-900)"
            stroke="var(--amber-600)"
            strokeOpacity={0.35}
            strokeWidth={1}
          />
        </>
      );
    default:
      return <rect x={b.x} y={top} width={b.width} height={b.height} fill="var(--noir-850)" />;
  }
}

function Windows({ b }: { b: Building }) {
  const top = VIEW_HEIGHT - b.height;
  const cols = Math.max(2, Math.floor(b.width / 14));
  const rows = Math.max(3, Math.floor(b.height / 22));
  const cells: ReactNode[] = [];
  let seed = b.x * 7 + b.height;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rand() > 0.62) continue;
      const wx = b.x + 6 + c * (14 * ((b.width - 12) / (cols * 14)));
      const wy = top + 18 + r * 20;
      if (wy > VIEW_HEIGHT - 10) continue;
      const lit = rand() > 0.55;
      cells.push(
        <rect
          key={`${b.x}-${r}-${c}`}
          x={wx}
          y={wy}
          width={5}
          height={8}
          fill={lit ? "var(--amber-400)" : "var(--noir-700)"}
          opacity={lit ? 0.75 : 0.6}
        />
      );
    }
  }
  return <>{cells}</>;
}

export default function Skyline() {
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="w-full h-auto"
      role="img"
      aria-label="Illustrated city skyline of buildings, each capped with a glowing amber roofline"
    >
      <defs>
        <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--noir-900)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--noir-950)" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {buildings.map((b, i) => {
        const top = VIEW_HEIGHT - b.height;
        return (
          <g key={i}>
            <Roofline b={b} />
            <Windows b={b} />
            {/* rooftop glow cap */}
            <rect
              x={b.x}
              y={top - 2}
              width={b.width}
              height={3}
              fill="var(--amber-500)"
              style={{
                animation: `glow-drift 4.5s ease-in-out ${b.delay}s infinite`,
                transformOrigin: `${b.x + b.width / 2}px ${top}px`,
              }}
            />
          </g>
        );
      })}

      <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#skyFade)" />
      <rect x="0" y={VIEW_HEIGHT - 4} width={VIEW_WIDTH} height={4} fill="var(--noir-900)" />
    </svg>
  );
}
