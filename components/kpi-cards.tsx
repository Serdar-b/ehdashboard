import { ArrowUpRight, ClipboardList, FileText, Users } from "lucide-react"
import { kpis } from "@/lib/clinic-data"
import { cn } from "@/lib/utils"

const cardTone: Record<string, string> = {
  info: "bg-[#078C7A] text-white shadow-[0_18px_40px_rgba(7,140,122,0.18)]",
  coral: "bg-white text-[#27221F]",
  teal: "bg-white text-[#27221F]",
}

const iconTone: Record<string, string> = {
  info: "bg-white/90 text-[#078C7A]",
  coral: "bg-[#F8D8CC] text-[#D94E25]",
  teal: "bg-[#DDF4F1] text-[#078C7A]",
}

export function KpiCards() {
  const icons = [Users, FileText, ClipboardList]

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1fr]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {kpis.map((kpi, index) => {
          const Icon = icons[index]
          const active = kpi.accent === "info"

          return (
            <div
              key={kpi.label}
              className={cn(
                "min-h-[142px] rounded-xl p-5 shadow-[0_16px_38px_rgba(59,42,32,0.035)]",
                cardTone[kpi.accent],
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <p
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-white/90" : "text-[#635C57]",
                  )}
                >
                  {kpi.label}
                </p>
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full",
                    iconTone[kpi.accent],
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
              </div>
              <p
                className={cn(
                  "mt-3 text-[30px] font-bold tracking-tight tabular-nums",
                  active ? "text-white" : "text-[#27221F]",
                )}
              >
                {kpi.value}
              </p>
              <p
                className={cn(
                  "mt-4 flex items-center gap-1 text-xs",
                  active ? "text-white/90" : "text-[#817771]",
                )}
              >
                <ArrowUpRight
                  className={cn("size-3.5", active ? "text-white" : "text-[#078C7A]")}
                />
                {kpi.delta}
              </p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#27221F]">Kontinuitetsindex</h2>
        </div>
        <div className="relative h-[210px] overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-between py-1">
            {[100, 75, 50, 25, 0].map((value) => (
              <div key={value} className="flex items-center gap-3">
                <span className="w-8 text-[11px] text-[#A59D97]">{value}%</span>
                <span className="h-px flex-1 border-t border-dashed border-[#EEE9E4]" />
              </div>
            ))}
          </div>
          <svg
            className="absolute inset-x-9 bottom-8 top-5 h-[150px] w-[calc(100%-3rem)] overflow-visible"
            viewBox="0 0 420 150"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="patientLineFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#078C7A" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#078C7A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 105 C28 76 50 82 70 66 C95 46 91 12 118 38 C140 62 127 102 160 100 C190 98 196 70 224 75 C246 79 256 52 278 58 C301 65 299 110 326 101 C350 92 350 68 374 85 C395 100 400 66 420 83 L420 150 L0 150 Z"
              fill="url(#patientLineFill)"
            />
            <path
              d="M0 105 C28 76 50 82 70 66 C95 46 91 12 118 38 C140 62 127 102 160 100 C190 98 196 70 224 75 C246 79 256 52 278 58 C301 65 299 110 326 101 C350 92 350 68 374 85 C395 100 400 66 420 83"
              fill="none"
              stroke="#078C7A"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
            <circle cx="224" cy="75" r="5" fill="#078C7A" stroke="white" strokeWidth="3" />
          </svg>
          <div className="absolute left-[52%] top-[50px] rounded-lg bg-[#27221F] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
            78 % index
          </div>
          <div className="absolute inset-x-12 bottom-0 flex justify-between text-[11px] text-[#817771]">
            {["Lör", "Sön", "Mån", "Tis", "Ons", "Tor", "Fre"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
