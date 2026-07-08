import { motion } from "framer-motion";
import Logo from "../ui/Logo";

const PILLARS = [
  { stat: "3", label: "steps from sign-up to certified" },
  { stat: "OTP", label: "verified registration, every time" },
  { stat: "1", label: "dashboard for your role only" },
];

export default function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <div className="min-h-screen bg-paper-50 lg:grid lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-10 text-paper-50 lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #F2A93B 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #1E9E8B 0%, transparent 70%)" }}
        />

        <Logo dark />

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md font-display text-4xl font-semibold leading-[1.15]"
          >
            From "looking for work" to certified and hired.
          </motion.h1>
          <p className="mt-4 max-w-sm text-sm text-paper-200/80">
            Swing pairs trainees with real trainers, tracks certification, and puts
            recommended jobs in front of the people ready for them.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {PILLARS.map((p) => (
              <div key={p.label}>
                <p className="font-mono text-xl font-semibold text-amber-400">{p.stat}</p>
                <p className="mt-1 text-xs leading-snug text-paper-200/70">{p.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-paper-200/50">
          Trinity 2026 Workshop Practice · Team Fully Charged
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-600">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
          {description && <p className="mt-1.5 text-sm text-ink-500">{description}</p>}
          <div className="mt-7">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
