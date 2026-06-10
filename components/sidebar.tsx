"use client"

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Sparkles,
  FileOutput,
  Settings,
  ShieldCheck,
  LogOut,
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
    <aside className="hidden w-[256px] shrink-0 flex-col border-r border-[#EEE9E4] bg-white lg:flex">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#078C7A] text-white shadow-sm">
          <ShieldCheck className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold text-[#27221F]">
            Executive Health
          </p>
          <p className="text-[11px] font-medium text-[#817771]">
            Klinisk uppföljning
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-3 px-5 pt-3">
        {nav.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors",
              item.active
                ? "bg-[#DDF4F1] text-[#078C7A]"
                : "text-[#635C57] hover:bg-[#F7F7F8] hover:text-[#27221F]",
            )}
            aria-current={item.active ? "page" : undefined}
          >
            <item.icon className="size-4.5 shrink-0 stroke-[1.8]" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-5 pb-6">
        <button className="flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium text-[#635C57] transition-colors hover:bg-[#F7F7F8] hover:text-[#27221F]">
          <LogOut className="size-4.5 stroke-[1.8]" />
          Logga ut
        </button>
      </div>
    </aside>
  )
}
