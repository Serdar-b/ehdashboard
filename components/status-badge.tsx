import { cn } from "@/lib/utils"
import type { Signal } from "@/lib/clinic-data"

const styles: Record<Signal, string> = {
  Stabil: "bg-teal-muted text-teal border-teal/30",
  Bevaka: "bg-amber-muted text-amber-foreground border-amber/40",
  Kritisk: "bg-coral-muted text-coral border-coral/30",
}

const dot: Record<Signal, string> = {
  Stabil: "bg-teal",
  Bevaka: "bg-amber",
  Kritisk: "bg-coral",
}

export function StatusBadge({
  signal,
  className,
}: {
  signal: Signal
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[signal],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot[signal])} aria-hidden />
      {signal}
    </span>
  )
}
