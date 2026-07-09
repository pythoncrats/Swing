import clsx from "clsx";

export function Field({ label, error, hint, children, required }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-ink-700">
          {label}
          {required && <span className="text-coral-500 text-xs">required</span>}
        </span>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-coral-600">{error}</p>}
    </label>
  );
}

export const inputBase =
  "w-full rounded-xl border bg-paper-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60";

export function TextInput({ error, className, ...props }) {
  return (
    <input
      className={clsx(
        inputBase,
        error ? "border-coral-400" : "border-paper-200 focus:border-navy-400",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ error, className, ...props }) {
  return (
    <textarea
      className={clsx(
        inputBase,
        "resize-none",
        error ? "border-coral-400" : "border-paper-200 focus:border-navy-400",
        className
      )}
      {...props}
    />
  );
}

export function Select({ error, className, children, ...props }) {
  return (
    <select
      className={clsx(
        inputBase,
        "appearance-none bg-no-repeat bg-[right_0.9rem_center] bg-[length:14px]",
        error ? "border-coral-400" : "border-paper-200 focus:border-navy-400",
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9' fill='none'%3E%3Cpath d='M1 1L7 7L13 1' stroke='%236B7080' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
