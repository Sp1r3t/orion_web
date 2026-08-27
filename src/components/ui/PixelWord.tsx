import { useEffect, useRef, useState } from 'react'

type Particle = {
  tx: number
  ty: number
  sx: number
  sy: number
  vx: number
  vy: number
  delay: number
  seed: number
}

/** Фазы одного цикла, мс. Остальное время слово просто держится на месте. */
const ASSEMBLE = 620
const SPREAD = 380
const DISSOLVE = 720
const BUCKETS = 8

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeIn = (t: number) => t * t
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

/** Цвет пикселя: слева акцент, справа — тёплый ember. */
function bucketColor(index: number) {
  const t = index / (BUCKETS - 1)
  const r = Math.round(255 + (255 - 255) * t)
  const g = Math.round(106 + (176 - 106) * t)
  const b = Math.round(0 + (32 - 0) * t)
  return `rgb(${r} ${g} ${b})`
}

type PixelWordProps = {
  words: string[]
  /** Длительность полного цикла одного слова. */
  interval?: number
  className?: string
}

/**
 * Слово, собранное из пикселей: буквы проявляются точками, держатся,
 * затем рассыпаются вверх, и из пикселей вырастает следующее слово.
 * Текст дублируется скрытым span — на канвасе его не прочитать.
 */
export default function PixelWord({ words, interval = 3000, className = '' }: PixelWordProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [index, setIndex] = useState(0)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  )

  // Без анимации слово просто меняется по таймеру.
  useEffect(() => {
    if (!reduced) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % words.length), interval)
    return () => clearInterval(timer)
  }, [reduced, interval, words.length])

  useEffect(() => {
    if (reduced) return

    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let cancelled = false
    let start = 0
    let groups: Particle[][] = []
    let pixel = 4
    // Свечение — второй проход по всем частицам: на тяжёлых словах его отключаем.
    let withBloom = true
    let cssWidth = 0
    let cssHeight = 0

    function build() {
      if (!canvas || !wrapper || !context) return

      const styles = getComputedStyle(wrapper)
      const fontSize = parseFloat(styles.fontSize)
      const font = `700 ${fontSize}px ${styles.fontFamily}`
      const ratio = Math.min(window.devicePixelRatio || 1, 2)

      // Ширина коробки — по самому длинному слову, чтобы строка не прыгала.
      const probe = document.createElement('canvas').getContext('2d')
      if (!probe) return
      probe.font = font
      const widths = words.map((word) => probe.measureText(word).width)
      const maxWidth = Math.max(...widths)

      // Запас по краям нужен, чтобы разлетающиеся пиксели не обрезались.
      const width = Math.ceil(maxWidth + fontSize * 1.4)
      const height = Math.ceil(fontSize * 2)

      // Базовая линия слова должна совпасть с базовой линией соседнего «на»:
      // у обёртки нет строчного содержимого, поэтому её базовая линия — нижний край.
      const baselineY = height * 0.72

      wrapper.style.width = `${Math.ceil(widths[index])}px`
      wrapper.style.height = `${Math.ceil(fontSize * 0.72)}px`
      canvas.style.bottom = `${-Math.round(height - baselineY)}px`

      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      // Слово рисуем в отдельный холст и вынимаем из него карту пикселей.
      const sampler = document.createElement('canvas')
      sampler.width = width
      sampler.height = height
      const samplerContext = sampler.getContext('2d', { willReadFrequently: true })
      if (!samplerContext) return

      samplerContext.font = font
      samplerContext.textAlign = 'center'
      samplerContext.textBaseline = 'alphabetic'
      samplerContext.fillStyle = '#fff'
      samplerContext.fillText(words[index], width / 2, baselineY)

      const data = samplerContext.getImageData(0, 0, width, height).data
      pixel = Math.max(3, Math.round(fontSize / 22))

      groups = Array.from({ length: BUCKETS }, () => [] as Particle[])

      for (let y = 0; y < height; y += pixel) {
        for (let x = 0; x < width; x += pixel) {
          if (data[(y * width + x) * 4 + 3] < 128) continue

          const angle = Math.random() * Math.PI * 2
          const distance = fontSize * (0.5 + Math.random() * 1.5)
          const bucket = Math.min(BUCKETS - 1, Math.floor((x / width) * BUCKETS))

          groups[bucket].push({
            tx: x,
            ty: y,
            sx: x + Math.cos(angle) * distance,
            sy: y + Math.sin(angle) * distance * 0.7,
            vx: (x - width / 2) / width + (Math.random() - 0.5) * 1.4,
            vy: -0.7 - Math.random() * 1.5,
            delay: (x / width) * SPREAD + Math.random() * 140,
            seed: Math.random() * Math.PI * 2,
          })
        }
      }

      cssWidth = width
      cssHeight = height
      withBloom = groups.reduce((sum, group) => sum + group.length, 0) < 2000
      start = performance.now()
    }

    function draw(now: number) {
      if (cancelled || !context || !canvas) return

      const elapsed = now - start
      const dissolveAt = Math.max(ASSEMBLE + SPREAD, interval - DISSOLVE)
      const dissolving = elapsed > dissolveAt
      const dissolve = dissolving ? clamp01((elapsed - dissolveAt) / DISSOLVE) : 0

      context.clearRect(0, 0, cssWidth, cssHeight)
      context.globalAlpha = 1

      const scatter = pixel * 26

      for (let b = 0; b < BUCKETS; b += 1) {
        const color = bucketColor(b)

        for (let pass = withBloom ? 0 : 1; pass < 2; pass += 1) {
          // Первый проход — мягкое свечение, второй — сами пиксели.
          const bloom = pass === 0
          context.fillStyle = color
          context.globalAlpha = bloom ? 0.14 * (1 - dissolve) : 1 - dissolve

          for (const particle of groups[b]) {
            let x = particle.tx
            let y = particle.ty
            let size = pixel - 1

            if (dissolving) {
              const e = easeIn(dissolve)
              x += particle.vx * scatter * e
              y += particle.vy * scatter * e
              size *= 1 + dissolve * 1.6
            } else {
              const local = clamp01((elapsed - particle.delay) / ASSEMBLE)
              const eased = easeOut(local)
              x = particle.sx + (particle.tx - particle.sx) * eased
              y = particle.sy + (particle.ty - particle.sy) * eased
              size *= local
              // Пока слово держится, пиксели едва заметно дышат.
              if (local === 1) {
                x += Math.sin(now / 700 + particle.seed) * 0.6
                y += Math.cos(now / 900 + particle.seed) * 0.6
              }
            }

            if (size <= 0) continue
            const drawn = bloom ? size * 2.4 : size
            context.fillRect(x - drawn / 2, y - drawn / 2, drawn, drawn)
          }
        }
      }

      context.globalAlpha = 1

      if (elapsed >= interval) {
        setIndex((current) => (current + 1) % words.length)
        return
      }

      frame = requestAnimationFrame(draw)
    }

    function run() {
      build()
      frame = requestAnimationFrame(draw)
    }

    // Шрифт должен быть загружен: иначе снимем карту пикселей запасного шрифта.
    const ready = document.fonts?.ready ?? Promise.resolve()
    ready.then(() => {
      if (!cancelled) run()
    })

    function onResize() {
      cancelAnimationFrame(frame)
      run()
    }

    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [index, interval, words, reduced])

  if (reduced) {
    return <span className={className}>{words[index]}</span>
  }

  return (
    <span
      ref={wrapperRef}
      className={`relative inline-block align-baseline transition-[width] duration-500 ease-out ${className}`}
    >
      <span className="sr-only">{words[index]}</span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      />
    </span>
  )
}
