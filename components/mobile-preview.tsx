"use client"

import { useState } from "react"
import { Check, ImageIcon } from "lucide-react"
import type { GeneratedAction } from "@/lib/clinic-data"

const previewImageSrc = "/patient-app-preview.png"

type MobilePreviewProps = {
  sentPlan: {
    actions: GeneratedAction[]
    patientName: string
    sentAt: Date
  } | null
}

export function MobilePreview({ sentPlan }: MobilePreviewProps) {
  const [imageMissing, setImageMissing] = useState(false)

  return (
    <section className="flex h-full flex-col rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-wide text-black">
          Patient View
        </p>
        {sentPlan ? (
          <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-[#BCE9E2] bg-[#F0FAF8] px-3 py-1.5 text-xs font-semibold text-[#078C7A]">
            <span className="size-1.5 rounded-full bg-[#078C7A]" />
            Patient app updated with {sentPlan.actions.length} actions
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-1 items-center justify-center">
        {sentPlan ? (
          <div className="min-h-[520px] w-full max-w-[320px] overflow-hidden rounded-[30px] border-[8px] border-[#27221F] bg-[#F7F7F8] p-5 shadow-[0_22px_60px_rgba(39,34,31,0.12)]">
            <p className="text-2xl font-bold tracking-tight text-[#27221F]">Today</p>
            <div className="mt-5 rounded-[24px] bg-[#FBE2BF] p-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#9A4B22]">
                Today's plan
              </p>
              <p className="mt-2 text-xl font-bold leading-6 text-[#27221F]">
                {sentPlan.actions[0]?.title ?? "Your plan is ready"}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#5F4F45]">
                0/{sentPlan.actions.length} completed
              </p>
            </div>
            <p className="mb-3 mt-6 text-lg font-bold text-[#27221F]">Actions</p>
            <div className="space-y-2">
              {sentPlan.actions.map((action) => (
                <div
                  key={`${action.title}-${action.cadence}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#EEE9E4] bg-white p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#DDF4F1] text-[#078C7A]">
                    <Check className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#27221F]">
                      {action.title}
                    </p>
                    <p className="truncate text-[11px] text-[#817771]">
                      {action.cadence}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : imageMissing ? (
          <div className="flex min-h-[520px] w-full max-w-[320px] flex-col items-center justify-center rounded-[30px] border border-dashed border-[#DED6CF] bg-[#FBFAF8] p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#DDF4F1] text-[#078C7A]">
              <ImageIcon className="size-6" />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#27221F]">
              Place image here
            </p>
            <p className="mt-2 text-xs leading-5 text-[#817771]">
              Save your mobile screenshot as
              <br />
              <span className="font-mono text-[#27221F]">
                public/patient-app-preview.png
              </span>
            </p>
          </div>
        ) : (
          <img
            alt="Patient app Today view"
            className="max-h-[680px] w-auto max-w-full rounded-[30px] object-contain shadow-[0_22px_60px_rgba(39,34,31,0.12)]"
            onError={() => setImageMissing(true)}
            src={previewImageSrc}
          />
        )}
      </div>
    </section>
  )
}
