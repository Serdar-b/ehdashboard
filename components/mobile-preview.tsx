"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"

const previewImageSrc = "/patient-app-preview.png"

export function MobilePreview() {
  const [imageMissing, setImageMissing] = useState(false)

  return (
    <section className="flex h-full flex-col rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Patientens vy
        </p>
        <h2 className="mt-1 text-sm font-semibold text-foreground">
          Så visas planen i mobilappen
        </h2>
      </div>

      <div className="mt-5 flex flex-1 items-center justify-center">
        {imageMissing ? (
          <div className="flex min-h-[520px] w-full max-w-[320px] flex-col items-center justify-center rounded-[30px] border border-dashed border-[#DED6CF] bg-[#FBFAF8] p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#DDF4F1] text-[#078C7A]">
              <ImageIcon className="size-6" />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#27221F]">
              Lägg bilden här
            </p>
            <p className="mt-2 text-xs leading-5 text-[#817771]">
              Spara din mobilskärmbild som
              <br />
              <span className="font-mono text-[#27221F]">public/patient-app-preview.png</span>
            </p>
          </div>
        ) : (
          <img
            alt="Patientappens Idag-vy"
            className="max-h-[680px] w-auto max-w-full rounded-[30px] object-contain shadow-[0_22px_60px_rgba(39,34,31,0.12)]"
            onError={() => setImageMissing(true)}
            src={previewImageSrc}
          />
        )}
      </div>

      <p className="mx-auto mt-5 max-w-[320px] text-center text-xs leading-relaxed text-muted-foreground text-pretty">
        Den här förhandsvisningen använder samma skärmbild som patienten ser i
        mobilappen.
      </p>
    </section>
  )
}
