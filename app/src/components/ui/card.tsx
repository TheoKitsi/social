import { CSSProperties, ReactNode } from "react";

type Variant = "filled" | "outlined" | "elevated";

interface CardProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}

const variantClasses: Record<Variant, string> = {
  filled: "bg-surface border border-transparent shadow-[var(--shadow-sm)]",
  outlined: "bg-transparent border border-border hover:border-border-focus/30",
  elevated: "bg-surface-elevated border border-transparent shadow-[var(--shadow-md)]",
};

export function Card({
  variant = "outlined",
  className = "",
  children,
  onClick,
  style,
}: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      style={style}
      className={`
        rounded-[var(--radius-card)] p-6
        transition-all duration-[var(--duration-normal)] ease-[var(--ease-spring)]
        ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] hover:border-primary/40 active:translate-y-0" : ""}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold text-on-surface ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
