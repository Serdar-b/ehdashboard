"use client"

import {
  ClipboardPenLine,
  LayoutDashboard,
  FileOutput,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { label: "Overview", icon: LayoutDashboard, href: "#overview", active: true },
  { label: "Patient Queue", icon: Users, href: "#patient-queue" },
  { label: "Clinical Signal", icon: Sparkles, href: "#clinical-signal" },
  { label: "AI Input", icon: ClipboardPenLine, href: "#doctor-input" },
  { label: "Export", icon: FileOutput, href: "#export" },
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
            Clinical Dashboard
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-3 px-5 pt-3">
        {nav.map((item) => (
          <a
            key={item.label}
            href={item.href}
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
          </a>
        ))}
      </nav>

      <div className="px-5 pb-6">
        <div className="rounded-xl bg-[#FBFAF8] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#078C7A]">
            Demo Flow
          </p>
          <p className="mt-1 text-xs leading-5 text-[#817771]">
            Note → micro-actions → patient app → clinical signal.
          </p>
        </div>
      </div>
    </aside>
  )
}
