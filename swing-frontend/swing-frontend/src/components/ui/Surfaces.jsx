import clsx from "clsx";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-paper-200 bg-white p-5 shadow-swing-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const BADGE_STYLES = {
  pending: "bg-amber-500/15 text-amber-600",
  in_training: "bg-navy-900/10 text-navy-800",
  certified: "bg-teal-500/15 text-teal-600",
  rejected: "bg-coral-500/15 text-coral-600",
  neutral: "bg-paper-200 text-ink-500",
};

const BADGE_LABELS = {
  pending: "Awaiting review",
  in_training: "Training in progress",
  certified: "Certified",
  rejected: "Rejected",
};

export function StatusBadge({ status, className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        BADGE_STYLES[status] || BADGE_STYLES.neutral,
        className
      )}
    >
      {BADGE_LABELS[status] || status}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-paper-200 px-6 py-12 text-center">
      {Icon && (
        <div className="grid h-11 w-11 place-items-center rounded-full bg-paper-100 text-ink-500">
          <Icon size={20} strokeWidth={1.75} />
        </div>
      )}
      <div>
        <p className="font-display font-semibold text-ink-900">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-600">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
