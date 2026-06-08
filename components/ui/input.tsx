import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm",
      "text-zinc-100 placeholder:text-zinc-500 transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-zinc-400", className)}>
      {children}
    </label>
  );
}
