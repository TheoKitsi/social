interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  default: "bg-surface-alt text-on-surface-muted",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
  info: "bg-info/15 text-info",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
};

export function Badge({ variant = "default", size = "md", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        rounded-full font-medium tracking-[var(--tracking-wide)]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
