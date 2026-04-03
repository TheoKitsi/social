interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  label,
  showPercent = true,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-on-surface">{label}</span>
          )}
          {showPercent && (
            <span className="text-on-surface-muted">{Math.round(clamped)}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full bg-surface-alt overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-primary shadow-[var(--shadow-accent-sm)] transition-all duration-[var(--duration-slower)] ease-[var(--ease-spring)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
