import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20",
  ghost: "bg-transparent hover:bg-white/5 text-zinc-200",
  outline: "border border-white/10 hover:border-white/25 bg-white/[0.02] text-zinc-100",
  danger: "bg-rose-600 hover:bg-rose-500 text-white",
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium",
      "transition-all duration-200 ease-in-out hover:scale-[1.02]",
      "focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:pointer-events-none",
      variants[variant],
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
