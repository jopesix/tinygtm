import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900",
      "focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none",
      "disabled:bg-zinc-50 disabled:text-zinc-500",
      "appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem] pr-9",
      "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http%3A//www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")]",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
