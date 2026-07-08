import { motion } from "framer-motion";

const STAGES = [
  { key: "pending", label: "Registered" },
  { key: "in_training", label: "In training" },
  { key: "certified", label: "Certified" },
  { key: "employed", label: "Employed" },
];

// Points along a shallow arc (a pendulum's swing path), used as the
// visual spine for a trainee's journey from sign-up to employment.
// The literal "swing" motif of the product name.
const ARC_POINTS = [
  { x: 40, y: 92 },
  { x: 146.7, y: 40 },
  { x: 253.3, y: 40 },
  { x: 360, y: 92 },
];

function stageIndex(status, applied) {
  if (status === "certified" && applied) return 3;
  if (status === "certified") return 2;
  if (status === "in_training") return 1;
  return 0;
}

export default function SwingArc({ status, applied = false, rejected = false }) {
  if (rejected) {
    return (
      <div className="rounded-2xl border border-coral-400/40 bg-coral-500/5 px-4 py-3 text-sm text-coral-600">
        This application didn't move forward this round — see the note from the admin below.
      </div>
    );
  }

  const active = stageIndex(status, applied);
  const pathD = `M ${ARC_POINTS[0].x} ${ARC_POINTS[0].y} C ${ARC_POINTS[1].x} ${ARC_POINTS[1].y}, ${ARC_POINTS[2].x} ${ARC_POINTS[2].y}, ${ARC_POINTS[3].x} ${ARC_POINTS[3].y}`;

  return (
    <div className="w-full">
      <svg viewBox="0 0 400 120" className="w-full" role="img" aria-label="Training journey progress">
        <path d={pathD} fill="none" stroke="var(--color-paper-200)" strokeWidth="3" strokeLinecap="round" />
        <motion.path
          d={pathD}
          fill="none"
          stroke="var(--color-teal-500)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active / (STAGES.length - 1) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ pathLength: active / (STAGES.length - 1) }}
        />
        {ARC_POINTS.map((p, i) => {
          const done = i <= active;
          const isCurrent = i === active;
          return (
            <g key={i}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={isCurrent ? 9 : 6}
                fill={done ? "var(--color-teal-500)" : "white"}
                stroke={done ? "var(--color-teal-500)" : "var(--color-paper-200)"}
                strokeWidth="2.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 18 }}
              />
              {isCurrent && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={9}
                  fill="none"
                  stroke="var(--color-teal-400)"
                  strokeWidth="2"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 grid grid-cols-4 text-center">
        {STAGES.map((s, i) => (
          <span
            key={s.key}
            className={`text-xs font-medium ${i <= active ? "text-navy-900" : "text-ink-300"}`}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
