import { forwardRef } from "react";
import clsx from "clsx";

const VARIANTS = {
  primary:
    "bg-navy-900 text-paper-50 hover:bg-navy-800 focus-visible:outline-amber-500 shadow-swing-sm",
  amber:
    "bg-amber-500 text-navy-950 hover:bg-amber-400 shadow-swing-sm",
  ghost:
    "bg-transparent text-navy-900 hover:bg-navy-900/5 border border-navy-900/15",
  outline:
    "bg-transparent text-paper-50 border border-paper-50/40 hover:bg-paper-50/10",
  danger:
    "bg-coral-500 text-paper-50 hover:bg-coral-600",
  subtle:
    "bg-paper-200 text-ink-900 hover:bg-paper-100",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-5 py-3 rounded-xl gap-2",
};

const Button = forwardRef(function Button(
  { as: Comp = "button", variant = "primary", size = "md", className, loading, disabled, children, ...props },
  ref
) {
  return (
    <Comp
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </Comp>
  );
});

export default Button;
