import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, ShieldCheck, Briefcase } from "lucide-react";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import SwingArc from "../components/ui/SwingArc";

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "Trainees",
    body: "Register, tell us what skills you have or want, and track your training until you're certified.",
  },
  {
    icon: ShieldCheck,
    title: "Trainers",
    body: "Take on the trainees assigned to you, run their training, and certify them when they're job-ready.",
  },
  {
    icon: Briefcase,
    title: "Administrators",
    body: "Review new sign-ups, assign trainees to trainers, and recommend real jobs to certified trainees.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink-700 hover:text-ink-900">
            Log in
          </Link>
          <Button as={Link} to="/register" size="sm">
            Get started
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-teal-600">
              Skills training → certification → real jobs
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-5xl">
              The swing from unemployed to hired, mapped out.
            </h1>
            <p className="mt-5 max-w-lg text-ink-500">
              Swing connects young people looking for skills with trainers who teach them,
              and administrators who match certified trainees to available jobs — one
              account, one dashboard, one clear path forward.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button as={Link} to="/register" size="lg">
                Create an account <ArrowRight size={16} />
              </Button>
              <Button as={Link} to="/login" variant="ghost" size="lg">
                I already have one
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-paper-200 bg-white p-6 shadow-swing"
          >
            <p className="mb-6 font-display text-sm font-semibold text-ink-900">
              A trainee's journey on Swing
            </p>
            <SwingArc status="certified" applied={false} />
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-ink-500">
              <div className="rounded-xl bg-paper-50 p-3">
                <p className="font-mono text-lg font-semibold text-navy-900">3</p>
                user roles, three focused dashboards
              </div>
              <div className="rounded-xl bg-paper-50 p-3">
                <p className="font-mono text-lg font-semibold text-navy-900">OTP</p>
                verified sign-up for every account
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-paper-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 font-display text-2xl font-semibold text-ink-900">
            Built around three people, three jobs to do
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="rounded-2xl border border-paper-200 p-5">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-amber-400">
                  <a.icon size={18} strokeWidth={1.75} />
                </div>
                <p className="font-display font-semibold text-ink-900">{a.title}</p>
                <p className="mt-1.5 text-sm text-ink-500">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-ink-300">
        Swing · Group 25, Team Fully Charged · Trinity 2026 Workshop Practice, UCU
      </footer>
    </div>
  );
}
