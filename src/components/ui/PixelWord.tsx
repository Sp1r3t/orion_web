import { useEffect, useRef, useState } from 'react'

type Particle = {
  x: number
  y: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  scale: number
  fromScale: number
  toScale: number
  delay: number
  arc: number
  seed: number
}

/** Длительность перетекания одного слова в другое и ширина волны задержек, мс. */
const MORPH = 1200
const SPREAD = 420
const BUCKETS = 8

/**
 * Точка слова для частицы: доля внутри пула переносится на длину карты.
 * Так левые пиксели всегда перетекают в левые, и ни один не пропадает —
 * в коротком слове несколько частиц просто садятся рядом.
 */
const pointIndex = (i: number, length: number, pool: number) =>
  Math.min(length - 1, Math.round((i * length) / pool))

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Цвет пикселя: слева акцент, справа — тёплый ember. */
function bucketColor(index: number) {
  const t = index / (BUCKETS - 1)
  return `rgb(255 ${Math.round(lerp(106, 176, t))} ${Math.round(lerp(0, 32, t))})`
}

type PixelWordProps = {
  words: string[]
  /** Длительность полного цикла одного слова. */
  interval?: number
  className?: string
}

/**
 * Слово, собранное из пикселей. При смене слова точки не исчезают: те же самые
 * пиксели по дуге перетекают на новые места и складываются в следующее слово.
 * Рядом лежит скрытый span — текст на канвасе иначе не прочитать.
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

    let particles: Particle[] = []
    let maps: Array<Array<[number, number]>> = []
    let widths: number[] = []
    let pixel = 4
    let cssWidth = 0
    let cssHeight = 0
    let withBloom = true

    let current = 0
    let next = 0
    let morphing = false
    let phaseStart = 0
    let widthFrom = 0
    let widthTo = 0

    /** Карта пикселей слова: точки идут по X, чтобы левые перетекали в левые. */
    function sample(word: string, font: string, baseline: number) {
      const sampler = document.createElement('canvas')
      sampler.width = cssWidth
      sampler.height = cssHeight

      const ctx = sampler.getContext('2d', { willReadFrequently: true })
      if (!ctx) return []

      ctx.font = font
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#fff'
      ctx.fillText(word, cssWidth / 2, baseline)

      const data = ctx.getImageData(0, 0, cssWidth, cssHeight).data
      const points: Array<[number, number]> = []

      for (let x = 0; x < cssWidth; x += pixel) {
        for (let y = 0; y < cssHeight; y += pixel) {
          if (data[(y * cssWidth + x) * 4 + 3] >= 128) points.push([x, y])
        }
      }

      return points
    }

    function build() {
      if (!canvas || !wrapper || !context) return

      const styles = getComputedStyle(wrapper)
      const fontSize = parseFloat(styles.fontSize)
      const font = `700 ${fontSize}px ${styles.fontFamily}`
      const ratio = Math.min(window.devicePixelRatio || 1, 2)

      const probe = document.createElement('canvas').getContext('2d')
      if (!probe) return
      probe.font = font
      widths = words.map((word) => Math.ceil(probe.measureText(word).width))

      // Холст берём по самому длинному слову плюс запас на дуги перелёта.
      cssWidth = Math.ceil(Math.max(...widths) + fontSize * 1.4)
      cssHeight = Math.ceil(fontSize * 2)
      pixel = Math.max(3, Math.round(fontSize / 22))

      // Базовая линия слова должна совпасть с базовой линией соседнего «на»:
      // у обёртки нет строчного содержимого, поэтому её базовая линия — нижний край.
      const baseline = cssHeight * 0.72

      wrapper.style.height = `${Math.ceil(fontSize * 0.72)}px`
      wrapper.style.width = `${widths[current]}px`
      canvas.style.bottom = `${-Math.round(cssHeight - baseline)}px`
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`
      canvas.width = cssWidth * ratio
      canvas.height = cssHeight * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      maps = words.map((word) => sample(word, font, baseline))

      // Один общий пул точек на все слова — при смене слова он не пересоздаётся.
      const pool = Math.max(...maps.map((map) => map.length))
      const start = maps[current]
      withBloom = pool < 2200

      particles = Array.from({ length: pool }, (_, i) => {
        const target = start[pointIndex(i, start.length, pool)] ?? [cssWidth / 2, baseline]
        const angle = Math.random() * Math.PI * 2
        const distance = fontSize * (0.4 + Math.random() * 1.2)
        const x = target[0] + Math.cos(angle) * distance
        const y = target[1] + Math.sin(angle) * distance * 0.7

        return {
          x,
          y,
          fromX: x,
          fromY: y,
          toX: target[0],
          toY: target[1],
          scale: 0,
          fromScale: 0,
          toScale: 1,
          delay: (target[0] / cssWidth) * SPREAD + Math.random() * 120,
          arc: (Math.random() - 0.5) * pixel * 5,
          seed: Math.random() * Math.PI * 2,
        }
      })

      // Первый показ — та же механика: точки слетаются к буквам.
      next = current
      morphing = true
      widthFrom = widths[current]
      widthTo = widths[current]
      phaseStart = performance.now()
    }

    /** Нацеливаем те же самые точки на следующее слово. */
    function startMorph(target: number) {
      const map = maps[target]
      if (map.length === 0) return

      const pool = particles.length

      particles.forEach((particle, i) => {
        const point = map[pointIndex(i, map.length, pool)]

        particle.fromX = particle.x
        particle.fromY = particle.y
        particle.fromScale = particle.scale
        particle.toX = point[0]
        particle.toY = point[1]
        particle.toScale = 1
        particle.delay = (particle.x / cssWidth) * SPREAD + Math.random() * 120
        particle.arc = (Math.random() - 0.5) * pixel * 5
      })

      widthFrom = widths[current]
      widthTo = widths[target]
      next = target
      morphing = true
      phaseStart = performance.now()
    }

    function draw(now: number) {
      if (cancelled || !context || !wrapper) return

      const elapsed = now - phaseStart
      const flight = MORPH - SPREAD

      if (morphing) {
        const global = clamp01(elapsed / MORPH)
        // Ширина коробки едет по той же кривой, что и пиксели, — «на» не дёргается.
        wrapper.style.width = `${Math.round(lerp(widthFrom, widthTo, easeInOut(global)))}px`

        for (const particle of particles) {
          const local = clamp01((elapsed - particle.delay) / flight)
          const eased = easeInOut(local)

          particle.x = lerp(particle.fromX, particle.toX, eased)
          particle.y =
            lerp(particle.fromY, particle.toY, eased) + Math.sin(Math.PI * local) * particle.arc
          particle.scale = lerp(particle.fromScale, particle.toScale, local)
        }

        if (global >= 1) {
          for (const particle of particles) {
            particle.x = particle.toX
            particle.y = particle.toY
            particle.scale = particle.toScale
          }
          morphing = false
          phaseStart = now
          if (next !== current) {
            current = next
            setIndex(current)
          }
        }
      }

      context.clearRect(0, 0, cssWidth, cssHeight)

      const pool = particles.length
      for (let b = 0; b < BUCKETS; b += 1) {
        const from = Math.floor((b * pool) / BUCKETS)
        const to = Math.floor(((b + 1) * pool) / BUCKETS)
        const color = bucketColor(b)

        for (let pass = withBloom ? 0 : 1; pass < 2; pass += 1) {
          // Первый проход — мягкое свечение, второй — сами пиксели.
          const bloom = pass === 0
          context.fillStyle = color
          context.globalAlpha = bloom ? 0.14 : 1

          for (let i = from; i < to; i += 1) {
            const particle = particles[i]
            if (particle.scale <= 0.01) continue

            // Пока слово стоит на месте, пиксели едва заметно дышат.
            const idle = morphing ? 0 : 1
            const x = particle.x + Math.sin(now / 700 + particle.seed) * 0.6 * idle
            const y = particle.y + Math.cos(now / 900 + particle.seed) * 0.6 * idle
            const size = (pixel - 1) * particle.scale * (bloom ? 2.4 : 1)

            context.fillRect(x - size / 2, y - size / 2, size, size)
          }
        }
      }

      context.globalAlpha = 1

      if (!morphing && elapsed >= interval - MORPH) {
        startMorph((current + 1) % words.length)
      }

      frame = requestAnimationFrame(draw)
    }

    function run() {
      build()
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(draw)
    }

    // Шрифт должен быть загружен: иначе снимем карту пикселей запасного шрифта.
    const ready = document.fonts?.ready ?? Promise.resolve()
    ready.then(() => {
      if (!cancelled) run()
    })

    function onResize() {
      if (!cancelled) run()
    }

    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [interval, words, reduced])

  if (reduced) {
    return <span className={className}>{words[index]}</span>
  }

  return (
    <span ref={wrapperRef} className={`relative inline-block align-baseline ${className}`}>
      <span className="sr-only">{words[index]}</span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      />
    </span>
  )
}
