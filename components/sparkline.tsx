import { cn } from "@/lib/utils"

type Props = {
  data: number[]
  className?: string
  stroke?: string
  fill?: string
  /** width/height in viewBox units */
  width?: number
  height?: number
}

/**
 * Lightweight inline area sparkline. No external chart lib needed for this
 * small 7-point series — keeps the bundle lean and renders crisply.
 */
export function Sparkline({
  data,
  className,
  stroke = "var(--coral)",
  fill = "var(--coral)",
  width = 240,
  height = 64,
}: Props) {
  const max = Math.max(...data, 100)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const pad = 4
  const stepX = (width - pad * 2) / (data.length - 1)

  const points = data.map((v, i) => {
    const x = pad + i * stepX
    const y = pad + (1 - (v - min) / range) * (height - pad * 2)
    return [x, y] as const
  })

  const line = points.map(([x, y]) => `${x},${y}`).join(" ")
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`
  const gradId = `spark-${stroke.replace(/[^a-z]/gi, "")}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full", className)}
      preserveAspectRatio="none"
      role="img"
      aria-label="7-dagars följsamhetstrend"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.22" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === points.length - 1 ? 3 : 0}
          fill={stroke}
        />
      ))}
    </svg>
  )
}
