import { useEffect, useRef, useState } from 'react'

type Star = {
  bx: number
  by: number
  z: number
  r: number
  alpha: number
  phase: number
  ox: number
  oy: number
}

type Node = { u: number; v: number; size: number; ignition: number; x: number; y: number }

/**
 * Орион в единичном квадрате: дубина слева вверх, плечи, пояс, лук справа и ноги.
 * Пропорции сняты с классической схемы созвездия.
 */
const SHAPE: Array<{ u: number; v: number; size: number }> = [
  { u: 0.1, v: 0.06, size: 2.8 }, // 0 — конец дубины
  { u: 0.19, v: 0.25, size: 2.2 }, // 1 — изгиб дубины
  { u: 0.26, v: 0.35, size: 3.2 }, // 2 — плечо
  { u: 0.4, v: 0.21, size: 2.4 }, // 3 — голова
  { u: 0.51, v: 0.33, size: 3.2 }, // 4 — второе плечо
  { u: 0.72, v: 0.16, size: 2.2 }, // 5 — верх лука
  { u: 0.82, v: 0.22, size: 2.2 }, // 6
  { u: 0.86, v: 0.31, size: 2.4 }, // 7 — середина лука
  { u: 0.83, v: 0.39, size: 2.2 }, // 8
  { u: 0.73, v: 0.46, size: 2.2 }, // 9 — низ лука
  { u: 0.47, v: 0.53, size: 2.6 }, // 10 — пояс, первая
  { u: 0.44, v: 0.565, size: 2.6 }, // 11 — пояс, вторая
  { u: 0.41, v: 0.6, size: 2.6 }, // 12 — пояс, третья
  { u: 0.37, v: 0.84, size: 3 }, // 13 — нога
  { u: 0.64, v: 0.77, size: 3.2 }, // 14 — вторая нога
]

const EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 7],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [4, 10],
  [10, 11],
  [11, 12],
  [2, 12],
  [12, 13],
  [10, 14],
  [13, 14],
]

/** Меч Ориона: три звезды под поясом, линиями они не соединяются. */
const SWORD: Array<{ u: number; v: number }> = [
  { u: 0.455, v: 0.66 },
  { u: 0.45, v: 0.695 },
  { u: 0.46, v: 0.73 },
]

/**
 * Маршрут автопилота: идём по списку линий, при разрыве перелетая к началу
 * следующей. Так свет гарантированно проходит через каждую звезду — прежняя
 * фигура Лиссажу мимо крайних просто не проходила, и линии не соединялись.
 */
const TOUR = EDGES.reduce<number[]>((path, [from, to]) => {
  if (path[path.length - 1] !== from) path.push(from)
  path.push(to)
  return path
}, [])

/** Скорость света автопилота, пикселей в секунду. */
const AUTO_SPEED = 620

const PUSH_RADIUS = 190
const PUSH_FORCE = 78
const PARALLAX = 26
const PAD = 60
/** Сколько собранное созвездие держится на экране, прежде чем погаснуть. */
const HOLD_AFTER_COMPLETE = 7000
const FADE_OUT = 1300

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

/**
 * Фон первого экрана: звёздное поле во всю секцию, без видимых границ.
 * Курсор расталкивает звёзды и зажигает Орион — линии остаются, пока
 * созвездие не соберётся целиком. Тогда оно вспыхивает, держится семь
 * секунд и плавно гаснет, возвращая всё в исходное состояние.
 * Курсор слушается только пока страница в самом верху.
 */
export default function SpaceField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const section = canvas.parentElement
    let width = 0
    let height = 0
    let stars: Star[] = []
    const nodes: Node[] = SHAPE.map((item) => ({ ...item, ignition: 0, x: 0, y: 0 }))
    const edges = EDGES.map(() => 0)
    let backdrop: HTMLCanvasElement | null = null

    const pointer = { x: -9999, y: -9999, active: false }
    const smooth = { x: 0, y: 0 }
    const parallax = { x: 0, y: 0 }
    let idle = 0
    let tour = 0
    let atTop = true

    // Жизненный цикл созвездия: рисуем → вспышка → пауза → гаснет.
    let phase: 'drawing' | 'celebrating' | 'fading' = 'drawing'
    let phaseTime = 0
    let flash = 0
    let shock = -1

    let shooting = { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 }
    let nextShot = 3000 + Math.random() * 5000
    let frame = 0
    let cancelled = false
    let last = performance.now()

    /**
     * Квадрат под созвездие: слева и выше кнопок, чтобы линии на них не наезжали.
     * Сторона одна на обе оси — иначе фигура растягивается и перестаёт быть Орионом.
     */
    function region() {
      if (width < 1024) {
        // На узком экране всё сложено в столбик: созвездие уводим наверх,
        // иначе оно ложится ровно на кнопки внизу.
        const side = Math.min(width * 0.82, height * 0.36)
        return { x: (width - side) / 2, y: height * 0.02, side }
      }

      // Правый край фигуры держим левее 39% ширины — дальше начинается заголовок.
      const side = Math.min(width * 0.38, height * 0.68)
      return { x: width * 0.055, y: height * 0.11, side }
    }

    function paintBackdrop() {
      const buffer = document.createElement('canvas')
      buffer.width = width + PAD * 2
      buffer.height = height + PAD * 2
      const ctx = buffer.getContext('2d')
      if (!ctx) return null

      const clouds = [
        { x: 0.22, y: 0.42, r: 0.42, color: '255, 106, 0', alpha: 0.1 },
        { x: 0.68, y: 0.2, r: 0.5, color: '255, 176, 32', alpha: 0.05 },
        { x: 0.86, y: 0.78, r: 0.4, color: '120, 90, 255', alpha: 0.05 },
      ]

      for (const cloud of clouds) {
        const cx = cloud.x * buffer.width
        const cy = cloud.y * buffer.height
        const radius = cloud.r * buffer.width * 0.6
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        gradient.addColorStop(0, `rgba(${cloud.color}, ${cloud.alpha})`)
        gradient.addColorStop(1, `rgba(${cloud.color}, 0)`)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, buffer.width, buffer.height)
      }

      // Далёкая планета: тёмный диск с подсвеченным краем и тонким кольцом.
      const px = buffer.width * 0.78
      const py = buffer.height * 0.28
      const pr = Math.min(buffer.width, buffer.height) * 0.09

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(-0.35)
      ctx.strokeStyle = 'rgba(255, 176, 32, 0.16)'
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.ellipse(0, 0, pr * 1.9, pr * 0.42, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      const disc = ctx.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr)
      disc.addColorStop(0, 'rgba(255, 133, 36, 0.22)')
      disc.addColorStop(0.6, 'rgba(60, 26, 6, 0.5)')
      disc.addColorStop(1, 'rgba(5, 5, 5, 0.75)')
      ctx.fillStyle = disc
      ctx.beginPath()
      ctx.arc(px, py, pr, 0, Math.PI * 2)
      ctx.fill()

      return buffer
    }

    function resize() {
      if (!canvas || !context || !section) return
      const rect = section.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)

      width = rect.width
      height = rect.height
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      const count = Math.round((width * height) / 2400)
      stars = Array.from({ length: count }, () => ({
        bx: Math.random(),
        by: Math.random(),
        z: 0.12 + Math.random() * 0.88,
        r: Math.random() * 1.15 + 0.25,
        alpha: Math.random() * 0.5 + 0.12,
        phase: Math.random() * Math.PI * 2,
        ox: 0,
        oy: 0,
      }))

      backdrop = paintBackdrop()
      smooth.x = width * 0.2
      smooth.y = height * 0.5
    }

    /** Возврат в исходное: линии погашены, звёзды остыли. */
    function resetConstellation() {
      edges.fill(0)
      nodes.forEach((node) => {
        node.ignition = 0
      })
      phase = 'drawing'
      phaseTime = 0
      tour = 0
    }

    function draw(now: number) {
      if (cancelled || !context || !canvas) return
      const delta = Math.min(now - last, 48)
      last = now

      // Секция может смениться в размере без события resize — сверяем каждый кадр.
      if (canvas.clientWidth !== Math.round(width) || canvas.clientHeight !== Math.round(height)) {
        resize()
      }

      // Первый экран уехал из вида — кадры на него больше не тратим.
      if (window.scrollY > height + 40) {
        frame = requestAnimationFrame(draw)
        return
      }

      // Взаимодействие живёт только пока страница в самом верху.
      const interactive = atTop && !reduced

      idle += delta

      const walk = region()
      nodes.forEach((node) => {
        node.x = walk.x + node.u * walk.side + parallax.x * 0.8
        node.y = walk.y + node.v * walk.side + parallax.y * 0.8
      })

      if (interactive && pointer.active && idle < 3500) {
        // За курсором свет тянется с запаздыванием — так движение мягче.
        smooth.x += (pointer.x - smooth.x) * 0.075
        smooth.y += (pointer.y - smooth.y) * 0.075
      } else if (interactive) {
        // Автопилот идёт от звезды к звезде с постоянной скоростью: сглаживание
        // к цели асимптотично и до узла не доводило, из-за чего линия зависала.
        const target = nodes[TOUR[tour] ?? 0]
        const dx = target.x - smooth.x
        const dy = target.y - smooth.y
        const distance = Math.hypot(dx, dy)
        const step = (AUTO_SPEED * delta) / 1000

        if (distance <= step || distance < 2) {
          smooth.x = target.x
          smooth.y = target.y
          tour = (tour + 1) % TOUR.length
        } else {
          smooth.x += (dx / distance) * step
          smooth.y += (dy / distance) * step
        }
      }

      const nx = clamp01(smooth.x / (width || 1)) - 0.5
      const ny = clamp01(smooth.y / (height || 1)) - 0.5
      parallax.x += (nx * PARALLAX - parallax.x) * 0.06
      parallax.y += (ny * PARALLAX * 0.6 - parallax.y) * 0.06

      context.clearRect(0, 0, width, height)

      if (backdrop) {
        context.drawImage(backdrop, -PAD + parallax.x * 0.6, -PAD + parallax.y * 0.6)
      }

      if (interactive) {
        const haloR = PUSH_RADIUS * 1.2
        const halo = context.createRadialGradient(smooth.x, smooth.y, 0, smooth.x, smooth.y, haloR)
        halo.addColorStop(0, 'rgba(255, 106, 0, 0.10)')
        halo.addColorStop(1, 'rgba(255, 106, 0, 0)')
        context.fillStyle = halo
        context.fillRect(smooth.x - haloR, smooth.y - haloR, haloR * 2, haloR * 2)
      }

      const box = region()
      const beltX = box.x + SHAPE[11].u * box.side + parallax.x * 0.8
      const beltY = box.y + SHAPE[11].v * box.side + parallax.y * 0.8

      // Звёзды: параллакс, отталкивание от курсора и волна после сборки.
      for (const star of stars) {
        const baseX = star.bx * width + parallax.x * star.z
        const baseY = star.by * height + parallax.y * star.z

        let wantX = 0
        let wantY = 0

        if (interactive) {
          const dx = baseX + star.ox - smooth.x
          const dy = baseY + star.oy - smooth.y
          const distance = Math.hypot(dx, dy)

          if (distance < PUSH_RADIUS) {
            const strength = Math.pow(1 - distance / PUSH_RADIUS, 2) * PUSH_FORCE * (0.35 + star.z)
            wantX = (dx / (distance || 1)) * strength
            wantY = (dy / (distance || 1)) * strength
          }
        }

        const spring = Math.hypot(wantX, wantY) > Math.hypot(star.ox, star.oy) ? 0.14 : 0.045
        star.ox += (wantX - star.ox) * spring
        star.oy += (wantY - star.oy) * spring

        let x = baseX + star.ox
        let y = baseY + star.oy

        if (shock >= 0) {
          const wave = shock * Math.max(width, height)
          const dx = x - beltX
          const dy = y - beltY
          const distance = Math.hypot(dx, dy)
          const push = Math.max(0, 1 - Math.abs(distance - wave) / 90) * (1 - shock) * 30
          x += (dx / (distance || 1)) * push
          y += (dy / (distance || 1)) * push
        }

        const pushed = clamp01(Math.hypot(star.ox, star.oy) / 46)
        const twinkle = reduced ? 1 : 0.72 + Math.sin(now / 950 + star.phase) * 0.28
        const alpha = clamp01(star.alpha * twinkle + pushed * 0.5 + flash * 0.35)

        context.fillStyle =
          pushed > 0.04
            ? `rgba(255, ${Math.round(176 - pushed * 60)}, ${Math.round(120 - pushed * 110)}, ${alpha})`
            : `rgba(245, 245, 244, ${alpha})`

        const size = star.r * (1 + pushed * 0.7 + flash * 0.5)
        context.fillRect(x - size / 2, y - size / 2, size, size)
      }

      // Падающая звезда.
      if (!reduced) {
        nextShot -= delta
        if (!shooting.active && nextShot <= 0) {
          shooting = {
            active: true,
            x: Math.random() * width * 0.7,
            y: Math.random() * height * 0.4,
            vx: 0.5 + Math.random() * 0.35,
            vy: 0.18 + Math.random() * 0.12,
            life: 0,
          }
          nextShot = 7000 + Math.random() * 9000
        }

        if (shooting.active) {
          shooting.life += delta
          shooting.x += shooting.vx * delta
          shooting.y += shooting.vy * delta
          const fade = clamp01(1 - shooting.life / 1100)
          const tail = 120
          const gradient = context.createLinearGradient(
            shooting.x,
            shooting.y,
            shooting.x - shooting.vx * tail,
            shooting.y - shooting.vy * tail,
          )
          gradient.addColorStop(0, `rgba(255, 244, 232, ${0.85 * fade})`)
          gradient.addColorStop(1, 'rgba(255, 244, 232, 0)')
          context.strokeStyle = gradient
          context.lineWidth = 1.5
          context.beginPath()
          context.moveTo(shooting.x, shooting.y)
          context.lineTo(shooting.x - shooting.vx * tail, shooting.y - shooting.vy * tail)
          context.stroke()
          if (fade <= 0 || shooting.x > width || shooting.y > height) shooting.active = false
        }
      }

      // Звёзды созвездия: положение и разогрев от курсора.
      const ignite = Math.min(150, Math.max(80, box.side * 0.22))

      nodes.forEach((node) => {
        if (phase === 'fading') {
          node.ignition = clamp01(node.ignition - delta / FADE_OUT)
          return
        }

        if (!interactive) return

        const distance = Math.hypot(node.x - smooth.x, node.y - smooth.y)
        if (distance < ignite) {
          node.ignition = clamp01(node.ignition + delta / 190)
        }
        // Остывания во время сборки нет: звезда, зажжённая в начале обхода,
        // успевала погаснуть до того, как загорится её дальняя пара, и линия
        // между ними не появлялась вовсе. Всё гаснет разом на фазе fading.
      })

      // Линии: зажглась — держится, пока созвездие не погаснет целиком.
      EDGES.forEach(([a, b], index) => {
        if (phase === 'fading') {
          edges[index] = clamp01(edges[index] - delta / FADE_OUT)
        } else if (Math.min(nodes[a].ignition, nodes[b].ignition) > 0.35) {
          edges[index] = clamp01(edges[index] + delta / 335)
        }

        if (edges[index] <= 0.01) return

        const from = nodes[a]
        const to = nodes[b]
        const progress = edges[index]
        const alpha = 0.8 * progress
        const gradient = context.createLinearGradient(from.x, from.y, to.x, to.y)
        gradient.addColorStop(0, `rgba(255, ${106 + flash * 120}, ${flash * 180}, ${alpha})`)
        gradient.addColorStop(1, `rgba(255, ${176 + flash * 60}, ${32 + flash * 180}, ${alpha})`)

        context.strokeStyle = gradient
        context.lineWidth = 1.4 + flash * 1.6
        context.beginPath()
        context.moveTo(from.x, from.y)
        context.lineTo(from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress)
        context.stroke()
      })

      nodes.forEach((node, index) => {
        // Соединённая звезда держит свет сама, даже когда курсор ушёл.
        const wired = EDGES.some(
          ([a, b], edge) => edges[edge] > 0.5 && (a === index || b === index),
        )
        const glow = wired ? Math.max(node.ignition, 0.85) : node.ignition
        const radius = node.size * (1 + glow * 0.5 + flash * 0.6)

        if (glow > 0.02) {
          const aura = context.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 9)
          aura.addColorStop(0, `rgba(255, 133, 36, ${(0.45 + flash * 0.4) * glow})`)
          aura.addColorStop(1, 'rgba(255, 133, 36, 0)')
          context.fillStyle = aura
          context.beginPath()
          context.arc(node.x, node.y, radius * 9, 0, Math.PI * 2)
          context.fill()
        }

        context.fillStyle = glow > 0.2 ? '#ffb020' : 'rgba(245, 245, 244, 0.85)'
        context.beginPath()
        context.arc(node.x, node.y, radius, 0, Math.PI * 2)
        context.fill()
      })

      // Меч под поясом — три звезды без линий.
      SWORD.forEach((point, index) => {
        const x = box.x + point.u * box.side + parallax.x * 0.8
        const y = box.y + point.v * box.side + parallax.y * 0.8
        const twinkle = reduced ? 1 : 0.7 + Math.sin(now / 800 + index) * 0.3
        context.fillStyle = `rgba(255, 214, 170, ${0.35 * twinkle + flash * 0.5})`
        context.beginPath()
        context.arc(x, y, 1.6 + flash * 1.4, 0, Math.PI * 2)
        context.fill()
      })

      // Кольцо ударной волны после сборки.
      if (shock >= 0) {
        shock += delta / 1600
        const wave = shock * Math.max(width, height)
        context.strokeStyle = `rgba(255, 133, 36, ${(1 - shock) * 0.4})`
        context.lineWidth = 2
        context.beginPath()
        context.arc(beltX, beltY, wave, 0, Math.PI * 2)
        context.stroke()
        if (shock >= 1) shock = -1
      }

      // Фазы: собрали → вспышка → семь секунд → плавное гашение → исходное.
      if (phase === 'drawing' && edges.every((value) => value >= 1)) {
        phase = 'celebrating'
        phaseTime = 0
        flash = 1
        shock = 0
      } else if (phase === 'celebrating') {
        phaseTime += delta
        flash = clamp01(flash - delta / 900)
        if (phaseTime >= HOLD_AFTER_COMPLETE) {
          phase = 'fading'
          phaseTime = 0
        }
      } else if (phase === 'fading') {
        phaseTime += delta
        if (phaseTime >= FADE_OUT) resetConstellation()
      }

      frame = requestAnimationFrame(draw)
    }

    function onMove(event: PointerEvent) {
      if (!section || !atTop) return
      const rect = section.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
      idle = 0
    }

    function onScroll() {
      atTop = window.scrollY < 4
      if (!atTop) {
        pointer.active = false
        idle = 4000
      }
    }

    resize()
    onScroll()
    frame = requestAnimationFrame(draw)

    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
    if (section) observer?.observe(section)
    window.addEventListener('resize', resize)
    // Слушаем окно, а не секцию: тогда поле отзывается и когда курсор в хедере.
    window.addEventListener('pointermove', onMove)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
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
