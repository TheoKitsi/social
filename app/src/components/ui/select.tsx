import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, id, className = "", ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-on-surface"
          >
            {label}
            {props.required && (
              <span className="text-primary ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full rounded-[var(--radius-input)] border
            bg-surface px-4 py-2.5 text-on-surface
            transition-all duration-[var(--duration-normal)] ease-[var(--ease-standard)]
            focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[var(--shadow-accent-sm)]
            disabled:opacity-50
            ${error ? "border-error" : "border-border"}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-sm text-on-surface-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
