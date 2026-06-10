import { Brain, ShieldCheck, ArrowRight } from "lucide-react"
import { aiSummaryText, aiSummaryTags } from "@/lib/clinic-data"

export function AiSummary() {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-info/20 bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-info text-info-foreground">
            <Brain className="size-4.5" />
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-semibold text-foreground">
              AI-sammanfattning
            </h2>
            <p className="text-xs text-muted-foreground">
              Alexandra Berg · uppdaterad nyss
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-info/25 bg-info-muted/50 px-2.5 py-1 text-[11px] font-medium text-info">
          <ShieldCheck className="size-3" />
          Granskad av läkare
        </span>
      </div>

      <p className="mt-5 text-lg font-medium leading-relaxed tracking-tight text-foreground text-pretty">
        {aiSummaryText}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {aiSummaryTags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-5">
        <div className="flex-1 rounded-xl bg-info-muted/40 px-3.5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Rekommenderad åtgärd
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            Förenkla rörelseplanen till korta dagliga pass
          </p>
        </div>
        <button className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90">
          <ArrowRight className="size-4.5" />
          <span className="sr-only">Tillämpa rekommendation</span>
        </button>
      </div>
    </section>
  )
}
