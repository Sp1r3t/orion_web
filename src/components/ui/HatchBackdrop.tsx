type Segment = {
  x: number
  y1: number
  y2: number
  opacity: number
  width: number
  accent: boolean
}

const TILE = 360
const STEP = 12

/** Простой генератор с фиксированным зерном: рисунок один и тот же при каждом рендере. */
function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

/**
 * Колонки будущей штриховки: каждая рвётся на один-три отрезка со случайными
 * длиной, положением и яркостью. Из-за разрывов линии не идут строем.
 */
function buildSegments(): Segment[] {
  const random = seeded(20260828)
  const segments: Segment[] = []

  for (let x = 0; x < TILE; x += STEP) {
    const accent = random() < 0.26
    const pieces = 1 + Math.floor(random() * 3)
    let cursor = -random() * 80

    for (let i = 0; i < pieces; i += 1) {
      const length = 80 + random() * 240
      const y1 = cursor
      const y2 = Math.min(TILE, y1 + length)

      if (y2 > 0) {
        segments.push({
          x: x + random() * 4 - 2,
          y1: Math.max(0, y1),
          y2,
          opacity: accent ? 0.34 + random() * 0.28 : 0.14 + random() * 0.2,
          width: accent ? 1.4 : 1,
          accent,
        })
      }

      // Разрыв до следующего отрезка в той же колонке.
      cursor = y2 + 24 + random() * 70
      if (cursor > TILE) break
    }
  }

  return segments
}

const SEGMENTS = buildSegments()

/**
 * Диагональная штриховка на фон секции. Рисунок собран из отрезков разной
 * длины с разрывами — периодического «частокола» из повторяющегося градиента
 * здесь не получить.
 */
export default function HatchBackdrop({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full ${className}`.trim()}
    >
      <defs>
        <pattern
          id="orion-hatch"
          width={TILE}
          height={TILE}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          {SEGMENTS.map((segment, index) => (
            <line
              key={index}
              x1={segment.x}
              y1={segment.y1}
              x2={segment.x}
              y2={segment.y2}
              stroke={segment.accent ? 'var(--color-accent)' : 'var(--color-ink)'}
              strokeOpacity={segment.opacity}
              strokeWidth={segment.width}
              strokeLinecap="round"
            />
          ))}
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#orion-hatch)" />
    </svg>
  )
}
