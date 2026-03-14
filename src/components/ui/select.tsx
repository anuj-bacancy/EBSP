import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "h-11 w-full rounded-2xl border border-[var(--border)] bg-black/10 px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-400)] focus:ring-2 focus:ring-[var(--brand-500)]/30",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";
