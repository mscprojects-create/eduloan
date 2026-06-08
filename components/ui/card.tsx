import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("glass rounded-2xl p-6 animate-fade-in", className)}>{children}</div>
  );
}
