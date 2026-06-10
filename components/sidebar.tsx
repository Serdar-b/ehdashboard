"use client"

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Sparkles,
  FileOutput,
  Settings,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { label: "Översikt", icon: LayoutDashboard, active: true },
  { label: "Patienter", icon: Users },
  { label: "Vårdplaner", icon: ClipboardList },
  { label: "AI-sammanfattningar", icon: Sparkles },
  { label: "Export", icon: FileOutput },
  { label: "Inställningar", icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Activity className="size-4.5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">
            Executive Health
          </p>
          <p className="text-[11px] text-sidebar-foreground/55">
            Klinisk uppföljning
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              item.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
            aria-current={item.active ? "page" : undefined}
          >
            <item.icon className="size-4.5 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3.5">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <Sparkles className="size-4 text-sidebar-primary" />
          <span className="text-xs font-semibold">AI-triage aktiv</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-sidebar-foreground/60">
          172 patienter granskades automatiskt idag. 12 lyftes för klinisk
          bedömning.
        </p>
      </div>
    </aside>
  )
}
