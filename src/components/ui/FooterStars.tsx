import { useEffect, useRef, useState } from 'react'

import { channels } from '@/lib/color'

type Star = {
  /** Доли ширины и высоты: при изменении размера поле не пересобирается. */
  bx: number
  by: number
  r: number
  alpha: number
  phase: number
  /** Своя скорость сноса по горизонтали, доли ширины в секунду. */
  drift: number
  ox: number
  oy: number
}

const PUSH_RADIUS = 150
const PUSH_FORCE = 44
/** Радиус, в котором звёзды возле курсора соединяются линиями. */
const LINK_RADIUS = 116
/** Сколько звёзд вокруг курсора берём в расчёт связей — потолок работы за кадр. */
const NEAR_LIMIT = 22

export default function FooterStars({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Палитра живёт в ref: цикл читает её каждый кадр и не перезапускается,
  // поэтому смена темы не пересобирает поле заново.
  const palette = useRef({ ink: '245, 245, 244', accent: '255, 106, 0', boost: 1 })

  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  )

  /**
   * Тему читаем прямо из атрибута html и следим за ним наблюдателем: хук useTheme
   * держит своё состояние у каждого вызывающего, и поле про переключение в хедере
   * так бы и не узнало.
   */
  useEffect(() => {
    function read() {
      const root = getComputedStyle(document.documentElement)
      palette.current = {
        ink: channels(root.getPropertyValue('--color-ink'), '245, 245, 244'),
        accent: channels(root.getPropertyValue('--color-accent'), '255, 106, 0'),
        // Тёмная точка на светлом фоне читается слабее светлой на тёмном.
        boost: document.documentElement.dataset.theme === 'light' ? 1.7 : 1,
      }
    }

    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const host = canvas.parentElement
    if (!host) return

    let width = 0
    let height = 0
    let stars: Star[] = []
    let frame = 0
    let visible = false
    let cancelled = false
    let last = performance.now()
    let time = 0

    const pointer = { x: -9999, y: -9999, active: false }

    function resize() {
      if (!canvas || !context || !host) return

      const rect = host.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)

      width = rect.width
      height = rect.height
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      const count = Math.round((width * height) / 2600)
      stars = Array.from({ length: count }, () => ({
        bx: Math.random(),
        by: Math.random(),
        r: Math.random() * 1.1 + 0.25,
        alpha: Math.random() * 0.45 + 0.12,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() * 0.6 + 0.2) * 0.004,
        ox: 0,
        oy: 0,
      }))

      // Один кадр сразу: поле видно с первого измерения, не дожидаясь цикла.
      draw(performance.now())
    }

    /** Один кадр. Цикл живёт отдельно — иначе вызов из resize плодил бы второй. */
    function draw(now: number) {
      if (cancelled || !context) return

      // Шаг ограничен: вернувшись из фоновой вкладки, поле не дёрнется разом.
      const delta = Math.min(now - last, 60) / 1000
      last = now
      time += delta

      context.clearRect(0, 0, width, height)

      const { ink, accent, boost } = palette.current
      const near: Array<{ x: number; y: number; weight: number }> = []

      for (const star of stars) {
        // Медленный снос вбок с заворотом: поле дышит и без курсора.
        const bx = (star.bx + star.drift * time) % 1
        let x = bx * width
        let y = star.by * height

        if (pointer.active) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const dist = Math.hypot(dx, dy)

          if (dist < PUSH_RADIUS && dist > 0.001) {
            // Ближе к курсору — сильнее отход; на границе радиуса эффекта нет.
            const force = (1 - dist / PUSH_RADIUS) ** 2 * PUSH_FORCE
            star.ox += ((dx / dist) * force - star.ox) * Math.min(1, delta * 9)
            star.oy += ((dy / dist) * force - star.oy) * Math.min(1, delta * 9)
          } else {
            star.ox += -star.ox * Math.min(1, delta * 4)
            star.oy += -star.oy * Math.min(1, delta * 4)
          }
        } else {
          star.ox += -star.ox * Math.min(1, delta * 4)
          star.oy += -star.oy * Math.min(1, delta * 4)
        }

        x += star.ox
        y += star.oy

        const twinkle = 0.75 + Math.sin(time * 1.6 + star.phase) * 0.25
        let alpha = star.alpha * twinkle * boost

        if (pointer.active) {
          const dist = Math.hypot(x - pointer.x, y - pointer.y)
          if (dist < PUSH_RADIUS) {
            const glow = 1 - dist / PUSH_RADIUS
            alpha = Math.min(1, alpha + glow * 0.55)
            if (near.length < NEAR_LIMIT) near.push({ x, y, weight: glow })
          }
        }

        context.beginPath()
        context.arc(x, y, star.r, 0, Math.PI * 2)
        context.fillStyle = `rgba(${ink}, ${alpha})`
        context.fill()
      }

      /**
       * Звёзды рядом с курсором связываются в паутину. Пары ищем только среди
       * попавших в радиус — их единицы, поэтому перебор здесь ничего не стоит.
       */
      for (let i = 0; i < near.length; i += 1) {
        for (let j = i + 1; j < near.length; j += 1) {
          const dist = Math.hypot(near[i].x - near[j].x, near[i].y - near[j].y)
          if (dist > LINK_RADIUS) continue

          const strength = (1 - dist / LINK_RADIUS) * Math.min(near[i].weight, near[j].weight)
          context.beginPath()
          context.moveTo(near[i].x, near[i].y)
          context.lineTo(near[j].x, near[j].y)
          context.strokeStyle = `rgba(${accent}, ${strength * 0.5})`
          context.lineWidth = 0.7
          context.stroke()
        }
      }
    }

    function tick(now: number) {
      draw(now)
      if (!cancelled) frame = requestAnimationFrame(tick)
    }

    function onMove(event: PointerEvent) {
      if (!host) return
      const rect = host.getBoundingClientRect()

      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active =
        pointer.x > -PUSH_RADIUS &&
        pointer.x < rect.width + PUSH_RADIUS &&
        pointer.y > -PUSH_RADIUS &&
        pointer.y < rect.height + PUSH_RADIUS
    }

    resize()

    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
    observer?.observe(host)

    /**
     * Подвал живёт в самом низу страницы: пока его не видно, крутить цикл незачем.
     * Наблюдатель включает отрисовку, когда футер въезжает в кадр, и гасит её,
     * когда уезжает.
     */
    let inView: IntersectionObserver | null = null

    if (!reduced && typeof IntersectionObserver === 'function') {
      inView = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting === visible) return
          visible = entry.isIntersecting

          if (visible) {
            last = performance.now()
            frame = requestAnimationFrame(tick)
          } else {
            cancelAnimationFrame(frame)
          }
        },
        { rootMargin: '200px' },
      )
      inView.observe(host)
    } else if (!reduced) {
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      inView?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full ${className}`.trim()}
    />
  )
}
