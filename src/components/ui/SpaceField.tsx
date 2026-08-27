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

type Node = {
  u: number
  v: number
  name: string
  size: number
  ignition: number
  x: number
  y: number
}

/** Орион в единичном квадрате — потом он раскладывается в область слева. */
const SHAPE: Array<{ u: number; v: number; name: string; size: number }> = [
  { u: 0.22, v: 0.1, name: 'Бетельгейзе', size: 3.2 },
  { u: 0.74, v: 0.16, name: 'Беллатрикс', size: 2.6 },
  { u: 0.4, v: 0.46, name: 'Минтака', size: 2.4 },
  { u: 0.52, v: 0.52, name: 'Альнилам', size: 2.8 },
  { u: 0.64, v: 0.58, name: 'Альнитак', size: 2.4 },
  { u: 0.26, v: 0.88, name: 'Саиф', size: 2.4 },
  { u: 0.82, v: 0.82, name: 'Ригель', size: 3.2 },
]

const EDGES: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 4],
  [2, 3],
  [3, 4],
  [2, 5],
  [4, 6],
  [5, 6],
]

const PUSH_RADIUS = 190
const PUSH_FORCE = 78
const PARALLAX = 26
const PAD = 60

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

/**
 * Фон первого экрана: глубокое звёздное поле во всю секцию, без видимых границ.
 * Курсор расталкивает звёзды и тянет за собой тёплый свет, а проходя рядом с
 * Орионом — зажигает его линии. Стоит увести мышь, созвездие медленно гаснет.
 * Пока к странице не притронулись (и на телефоне) поле водит себя само.
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

    // Указатель: реальный и сглаженный, плюс автопилот, когда мышью не водят.
    const pointer = { x: -9999, y: -9999, active: false }
    const smooth = { x: 0, y: 0 }
    const parallax = { x: 0, y: 0 }
    let idle = 0
    let auto = 0

    let shooting = { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 }
    let nextShot = 3000 + Math.random() * 5000
    let frame = 0
    let cancelled = false
    let last = performance.now()

    /** Область, в которой лежит созвездие: слева от текста, но не у самого края. */
    function region() {
      const narrow = width < 1024
      return narrow
        ? { x: width * 0.12, y: height * 0.16, w: width * 0.76, h: height * 0.6 }
        : { x: width * 0.05, y: height * 0.14, w: width * 0.34, h: height * 0.68 }
    }

    /** Туманности и далёкая планета рисуются один раз в буфер — каждый кадр это дорого. */
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

      // Далёкая планета: тёмный диск, подсвеченный с одного края, и тонкое кольцо.
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

    function draw(now: number) {
      if (cancelled || !context || !canvas) return
      const delta = Math.min(now - last, 48)
      last = now

      // Секция может смениться в размере без события resize (шрифты, раскрытие блоков).
      // Дешевле сверять размер каждый кадр, чем полагаться на одно измерение при монтировании.
      if (canvas.clientWidth !== Math.round(width) || canvas.clientHeight !== Math.round(height)) {
        resize()
      }

      // Автопилот: если мышью не водят, светящаяся точка сама гуляет по созвездию.
      idle += delta
      let targetX = pointer.x
      let targetY = pointer.y

      if (!reduced && (!pointer.active || idle > 3500)) {
        auto += delta
        const box = region()
        targetX = box.x + box.w * (0.5 + Math.sin(auto / 3400) * 0.46)
        targetY = box.y + box.h * (0.5 + Math.sin(auto / 2100 + 1.2) * 0.42)
      }

      const follow = reduced ? 1 : 0.075
      smooth.x += (targetX - smooth.x) * follow
      smooth.y += (targetY - smooth.y) * follow

      // Параллакс считаем от положения курсора в секции.
      const nx = clamp01(smooth.x / (width || 1)) - 0.5
      const ny = clamp01(smooth.y / (height || 1)) - 0.5
      parallax.x += (nx * PARALLAX - parallax.x) * 0.06
      parallax.y += (ny * PARALLAX * 0.6 - parallax.y) * 0.06

      context.clearRect(0, 0, width, height)

      if (backdrop) {
        context.drawImage(backdrop, -PAD + parallax.x * 0.6, -PAD + parallax.y * 0.6)
      }

      // Тёплый свет, который курсор носит с собой.
      const halo = context.createRadialGradient(
        smooth.x,
        smooth.y,
        0,
        smooth.x,
        smooth.y,
        PUSH_RADIUS * 1.2,
      )
      halo.addColorStop(0, 'rgba(255, 106, 0, 0.10)')
      halo.addColorStop(1, 'rgba(255, 106, 0, 0)')
      context.fillStyle = halo
      // Заливаем только габарит свечения, а не весь экран.
      const haloR = PUSH_RADIUS * 1.2
      context.fillRect(smooth.x - haloR, smooth.y - haloR, haloR * 2, haloR * 2)

      // Звёзды: параллакс по глубине, расталкивание курсором и возврат на место.
      for (const star of stars) {
        const baseX = star.bx * width + parallax.x * star.z
        const baseY = star.by * height + parallax.y * star.z

        let wantX = 0
        let wantY = 0

        if (!reduced) {
          const dx = baseX + star.ox - smooth.x
          const dy = baseY + star.oy - smooth.y
          const distance = Math.hypot(dx, dy)

          if (distance < PUSH_RADIUS) {
            const strength = Math.pow(1 - distance / PUSH_RADIUS, 2) * PUSH_FORCE * (0.35 + star.z)
            wantX = (dx / (distance || 1)) * strength
            wantY = (dy / (distance || 1)) * strength
          }
        }

        // Пружина: к курсору звезда убегает быстро, обратно возвращается мягко.
        const spring = Math.hypot(wantX, wantY) > Math.hypot(star.ox, star.oy) ? 0.14 : 0.045
        star.ox += (wantX - star.ox) * spring
        star.oy += (wantY - star.oy) * spring

        const x = baseX + star.ox
        const y = baseY + star.oy
        const pushed = clamp01(Math.hypot(star.ox, star.oy) / 46)
        const twinkle = reduced ? 1 : 0.72 + Math.sin(now / 950 + star.phase) * 0.28
        const alpha = clamp01(star.alpha * twinkle + pushed * 0.5)

        context.fillStyle =
          pushed > 0.04
            ? `rgba(255, ${Math.round(176 - pushed * 60)}, ${Math.round(120 - pushed * 110)}, ${alpha})`
            : `rgba(245, 245, 244, ${alpha})`

        const size = star.r * (1 + pushed * 0.7)
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

      // Созвездие: звёзды загораются от близости курсора и сами гаснут.
      const box = region()
      const ignite = Math.min(160, Math.max(90, width * 0.1))

      nodes.forEach((node) => {
        node.x = box.x + node.u * box.w + parallax.x * 0.8
        node.y = box.y + node.v * box.h + parallax.y * 0.8

        const distance = Math.hypot(node.x - smooth.x, node.y - smooth.y)
        if (distance < ignite) {
          node.ignition = clamp01(node.ignition + delta / 260)
        } else {
          node.ignition = clamp01(node.ignition - delta / 2600)
        }
      })

      EDGES.forEach(([a, b], index) => {
        const lit = Math.min(nodes[a].ignition, nodes[b].ignition)
        const target = lit > 0.35 ? 1 : 0
        const speed = target === 1 ? delta / 420 : -delta / 900
        edges[index] = clamp01(edges[index] + speed)

        if (edges[index] <= 0.01) return

        const from = nodes[a]
        const to = nodes[b]
        const progress = edges[index]
        const gradient = context.createLinearGradient(from.x, from.y, to.x, to.y)
        gradient.addColorStop(0, `rgba(255, 106, 0, ${0.75 * progress})`)
        gradient.addColorStop(1, `rgba(255, 176, 32, ${0.75 * progress})`)

        context.strokeStyle = gradient
        context.lineWidth = 1.4
        context.beginPath()
        context.moveTo(from.x, from.y)
        context.lineTo(from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress)
        context.stroke()
      })

      nodes.forEach((node) => {
        const glow = node.ignition
        const radius = node.size * (1 + glow * 0.6)

        if (glow > 0.02) {
          const aura = context.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 9)
          aura.addColorStop(0, `rgba(255, 133, 36, ${0.5 * glow})`)
          aura.addColorStop(1, 'rgba(255, 133, 36, 0)')
          context.fillStyle = aura
          context.beginPath()
          context.arc(node.x, node.y, radius * 9, 0, Math.PI * 2)
          context.fill()
        }

        context.fillStyle = glow > 0.2 ? '#ffb020' : 'rgba(245, 245, 244, 0.9)'
        context.beginPath()
        context.arc(node.x, node.y, radius, 0, Math.PI * 2)
        context.fill()

        if (glow > 0.25) {
          context.fillStyle = `rgba(245, 245, 244, ${(glow - 0.25) * 0.9})`
          context.font = '500 11px Inter Variable, system-ui, sans-serif'
          context.textAlign = 'left'
          context.fillText(node.name, node.x + 12, node.y - 10)
        }
      })

      frame = requestAnimationFrame(draw)
    }

    function onMove(event: PointerEvent) {
      if (!section) return
      const rect = section.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
      idle = 0
    }

    function onLeave() {
      pointer.active = false
      idle = 4000
    }

    resize()
    frame = requestAnimationFrame(draw)

    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
    if (section) observer?.observe(section)
    window.addEventListener('resize', resize)
    section?.addEventListener('pointermove', onMove)
    section?.addEventListener('pointerleave', onLeave)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      section?.removeEventListener('pointermove', onMove)
      section?.removeEventListener('pointerleave', onLeave)
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
