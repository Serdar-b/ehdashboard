import { cn } from "@/lib/utils"
import type { Signal } from "@/lib/clinic-data"

const styles: Record<Signal, string> = {
  Stabil: "bg-[#DDF4F1] text-[#078C7A] border-[#BCE9E2]",
  Bevaka: "bg-[#FFF0C7] text-[#9A4B22] border-[#F7D982]",
  Kritisk: "bg-[#F8D8CC] text-[#D94E25] border-[#F0B7A2]",
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        styles[signal],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot[signal])} aria-hidden />
      {signal}
    </span>
  )
}
