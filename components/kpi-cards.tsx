import { ArrowUpRight, Minus } from "lucide-react"
import { kpis } from "@/lib/clinic-data"
import { cn } from "@/lib/utils"

const dotTone: Record<string, string> = {
  info: "bg-info",
  coral: "bg-coral",
  teal: "bg-teal",
  amber: "bg-amber",
}

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2">
            <span
              className={cn("size-1.5 rounded-full", dotTone[kpi.accent])}
              aria-hidden
            />
            <p className="text-xs font-medium text-muted-foreground">
              {kpi.label}
            </p>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {kpi.value}
          </p>
          <p className="mt-2.5 flex items-center gap-1 text-xs text-muted-foreground">
            {kpi.trend === "up" ? (
              <ArrowUpRight className="size-3.5 text-teal" />
            ) : (
              <Minus className="size-3.5" />
            )}
            {kpi.delta}
          </p>
        </div>
      ))}
    </div>
  )
}
