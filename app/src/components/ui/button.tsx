import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary shadow-[var(--shadow-accent-sm)] hover:shadow-[var(--shadow-accent-md)] hover:brightness-110 active:brightness-95 active:shadow-[var(--shadow-accent-sm)]",
  secondary:
    "bg-surface-elevated text-on-surface shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:bg-surface-alt",
  outline:
    "border border-border text-on-surface hover:border-primary hover:text-primary hover:shadow-[var(--shadow-accent-sm)]",
  ghost:
    "text-on-surface-muted hover:text-on-surface hover:bg-surface-alt",
  danger:
    "bg-error text-white shadow-sm hover:bg-red-600 hover:shadow-md",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-2 text-sm min-h-[44px]",
  md: "px-5 py-2.5 text-base min-h-[44px]",
  lg: "px-7 py-3.5 text-lg min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-[var(--radius-button)] font-medium tracking-[var(--tracking-wide)]
          transition-all duration-[var(--duration-normal)] ease-[var(--ease-spring)]
          hover:-translate-y-px
          focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:shadow-[var(--shadow-focus)]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
