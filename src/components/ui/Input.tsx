import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400",
      "focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none",
      "disabled:bg-zinc-50 disabled:text-zinc-500",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400",
      "focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none",
      "disabled:bg-zinc-50 disabled:text-zinc-500 resize-y min-h-[100px]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

type FieldProps = {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, required, hint, children, className }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-medium text-zinc-700 flex items-center justify-between">
        <span>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      </span>
      <div className="mt-1">{children}</div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </label>
  );
}
