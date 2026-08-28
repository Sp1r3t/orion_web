import type { CSSProperties } from 'react'

/**
 * Звёздная пыль на всю плитку: доли ширины и высоты, размер в пикселях.
 * Координаты заданы вручную — случайные перетасовывались бы на каждом рендере.
 */
const DUST: Array<[number, number, number]> = [
  [4, 12, 2],
  [11, 34, 1],
  [7, 62, 2],
  [15, 82, 1],
  [21, 18, 1],
  [26, 52, 2],
  [30, 88, 1],
  [34, 8, 2],
  [39, 40, 1],
  [43, 70, 1],
  [47, 24, 2],
  [52, 58, 1],
  [55, 92, 2],
  [60, 14, 1],
  [64, 46, 2],
  [68, 76, 1],
  [72, 28, 1],
  [76, 60, 2],
  [80, 10, 1],
  [84, 40, 1],
  [87, 84, 2],
  [91, 22, 1],
  [94, 54, 1],
  [97, 74, 2],
  [18, 66, 2],
  [58, 34, 1],
  [37, 96, 1],
  [88, 96, 1],
]

/** Смещение узора, чтобы соседние плитки не выглядели одинаковыми. */
export default function StarDust({ seed = 0 }: { seed?: number }) {
  const shift = seed * 7
  const mirrored = seed % 2 === 1

  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {DUST.map(([x, y, size], index) => {
        const left = mirrored ? 100 - x : x
        const top = (y + shift) % 100

        return (
          <span
            key={index}
            className="glyph-dust"
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                '--i': index,
              } as CSSProperties
            }
          />
        )
      })}
    </span>
  )
}
