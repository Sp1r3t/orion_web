import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

/** Звёзды Ориона: доли от размера холста, глубина для параллакса и настоящее имя. */
const NODES: Array<{ x: number; y: number; z: number; name: string; size: number }> = [
  { x: 0.2, y: 0.12, z: 0.75, name: 'Бетельгейзе', size: 3.4 },
  { x: 0.76, y: 0.18, z: 0.55, name: 'Беллатрикс', size: 2.8 },
  { x: 0.4, y: 0.45, z: 0.85, name: 'Минтака', size: 2.6 },
  { x: 0.52, y: 0.51, z: 0.9, name: 'Альнилам', size: 3 },
  { x: 0.64, y: 0.57, z: 0.95, name: 'Альнитак', size: 2.6 },
  { x: 0.26, y: 0.86, z: 0.6, name: 'Саиф', size: 2.6 },
  { x: 0.82, y: 0.82, z: 0.7, name: 'Ригель', size: 3.4 },
]

/** Рисунок созвездия: восемь линий, которые и предстоит соединить. */
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

const HIT_RADIUS = 30
const PARALLAX = 16

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number }
type BackStar = { x: number; y: number; z: number; r: number; alpha: number; phase: number }

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Интерактивное созвездие: посетитель сам соединяет звёзды Ориона —
 * мышью протягивает линию, на телефоне нажимает звёзды по очереди.
 * Когда собраны все восемь линий, по полю расходится ударная волна.
 */
export default function Constellation({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [linked, setLinked] = useState(0)
  const [done, setDone] = useState(false)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  )

  // Всё, что меняется каждый кадр, живёт в ref — перерисовка React тут не нужна.
  const state = useRef({
    width: 0,
    height: 0,
    points: [] as Array<{ x: number; y: number }>,
    stars: [] as BackStar[],
    sparks: [] as Spark[],
    lit: new Set<string>(),
    active: -1,
    hover: -1,
    dragging: false,
    pointer: { x: 0.5, y: 0.5, has: false },
    smooth: { x: 0.5, y: 0.5 },
    shock: -1,
    reveal: 0,
    done: false,
    lastTouch: 0,
    hint: 0,
  })

  const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)

  /** Экранные координаты звезды с учётом параллакса. */
  const project = useCallback((index: number) => {
    const s = state.current
    const node = NODES[index]
    const shiftX = (s.smooth.x - 0.5) * 2 * PARALLAX * node.z
    const shiftY = (s.smooth.y - 0.5) * 2 * PARALLAX * node.z * 0.6
    const padX = s.width * 0.12
    const padY = s.height * 0.12

    return {
      x: padX + node.x * (s.width - padX * 2) + shiftX,
      y: padY + node.y * (s.height - padY * 2) + shiftY,
    }
  }, [])

  const findStar = useCallback((x: number, y: number) => {
    const s = state.current
    let best = -1
    let bestDistance = HIT_RADIUS

    s.points.forEach((point, index) => {
      const distance = Math.hypot(point.x - x, point.y - y)
      if (distance < bestDistance) {
        best = index
        bestDistance = distance
      }
    })

    return best
  }, [])

  /** Пытаемся зажечь линию между двумя звёздами. */
  const connect = useCallback(
    (from: number, to: number) => {
      const s = state.current
      if (from < 0 || to < 0 || from === to) return

      const exists = EDGES.some(([a, b]) => (a === from && b === to) || (a === to && b === from))
      const key = edgeKey(from, to)
      if (!exists || s.lit.has(key)) return

      s.lit.add(key)
      s.hint = 0

      if (!reduced) {
        // Искры вдоль зажжённой линии.
        const start = s.points[from]
        const end = s.points[to]
        for (let i = 0; i < 26; i += 1) {
          const t = i / 25
          const angle = Math.random() * Math.PI * 2
          const speed = 0.4 + Math.random() * 1.4
          s.sparks.push({
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            max: 500 + Math.random() * 500,
          })
        }
      }

      setLinked(s.lit.size)

      if (s.lit.size === EDGES.length) {
        s.shock = 0
        s.reveal = 0
        s.done = true
        setDone(true)
      }
    },
    [reduced],
  )

  const reset = useCallback(() => {
    const s = state.current
    s.lit.clear()
    s.active = -1
    s.shock = -1
    s.reveal = 0
    s.sparks = []
    s.done = false
    setLinked(0)
    setDone(false)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const s = state.current
    let frame = 0
    let cancelled = false
    let last = performance.now()
    let shooting = { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 }
    let nextShot = 4000 + Math.random() * 6000

    function resize() {
      if (!canvas || !context) return
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)

      s.width = rect.width
      s.height = rect.height
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      const count = Math.round((rect.width * rect.height) / 3600)
      s.stars = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: 0.15 + Math.random() * 0.85,
        r: Math.random() * 1.1 + 0.3,
        alpha: Math.random() * 0.45 + 0.15,
        phase: Math.random() * Math.PI * 2,
      }))

      s.points = NODES.map((_, index) => project(index))
    }

    function drawStar(x: number, y: number, radius: number, color: string, glow: number) {
      if (!context) return
      if (glow > 0) {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius * glow)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, 'rgba(255, 106, 0, 0)')
        context.fillStyle = gradient
        context.beginPath()
        context.arc(x, y, radius * glow, 0, Math.PI * 2)
        context.fill()
      }

      context.fillStyle = color
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }

    function draw(now: number) {
      if (cancelled || !context) return
      const delta = Math.min(now - last, 48)
      last = now

      // Курсор догоняем плавно — поле «дышит» вслед за рукой, а не дёргается.
      if (!reduced) {
        s.smooth.x += (s.pointer.x - s.smooth.x) * 0.06
        s.smooth.y += (s.pointer.y - s.smooth.y) * 0.06
      }

      s.points = NODES.map((_, index) => project(index))
      context.clearRect(0, 0, s.width, s.height)

      // Туманность у пояса.
      const belt = s.points[3]
      const nebula = context.createRadialGradient(belt.x, belt.y, 0, belt.x, belt.y, s.width * 0.55)
      const heat = s.done ? 0.16 : 0.09
      nebula.addColorStop(0, `rgba(255, 106, 0, ${heat})`)
      nebula.addColorStop(1, 'rgba(255, 106, 0, 0)')
      context.fillStyle = nebula
      context.fillRect(0, 0, s.width, s.height)

      // Фоновые звёзды с параллаксом по глубине.
      for (const star of s.stars) {
        const shiftX = (s.smooth.x - 0.5) * 2 * PARALLAX * star.z
        const shiftY = (s.smooth.y - 0.5) * 2 * PARALLAX * star.z * 0.6
        let x = star.x * s.width + shiftX
        let y = star.y * s.height + shiftY

        // Ударная волна расталкивает поле и возвращает его обратно.
        if (s.shock >= 0) {
          const wave = s.shock * s.width * 0.9
          const dx = x - belt.x
          const dy = y - belt.y
          const distance = Math.hypot(dx, dy)
          const push = Math.max(0, 1 - Math.abs(distance - wave) / 70) * (1 - s.shock) * 26
          x += (dx / (distance || 1)) * push
          y += (dy / (distance || 1)) * push
        }

        const twinkle = reduced ? 1 : 0.72 + Math.sin(now / 900 + star.phase) * 0.28
        context.fillStyle = `rgba(245, 245, 244, ${star.alpha * twinkle})`
        context.beginPath()
        context.arc(x, y, star.r, 0, Math.PI * 2)
        context.fill()
      }

      // Падающая звезда — редкий гость.
      if (!reduced) {
        nextShot -= delta
        if (!shooting.active && nextShot <= 0) {
          shooting = {
            active: true,
            x: Math.random() * s.width * 0.6,
            y: Math.random() * s.height * 0.4,
            vx: 0.42 + Math.random() * 0.2,
            vy: 0.16 + Math.random() * 0.1,
            life: 0,
          }
          nextShot = 6000 + Math.random() * 8000
        }

        if (shooting.active) {
          shooting.life += delta
          shooting.x += shooting.vx * delta
          shooting.y += shooting.vy * delta
          const fade = clamp01(1 - shooting.life / 900)
          const tail = 90
          const gradient = context.createLinearGradient(
            shooting.x,
            shooting.y,
            shooting.x - shooting.vx * tail,
            shooting.y - shooting.vy * tail,
          )
          gradient.addColorStop(0, `rgba(255, 245, 235, ${0.9 * fade})`)
          gradient.addColorStop(1, 'rgba(255, 245, 235, 0)')
          context.strokeStyle = gradient
          context.lineWidth = 1.6
          context.beginPath()
          context.moveTo(shooting.x, shooting.y)
          context.lineTo(shooting.x - shooting.vx * tail, shooting.y - shooting.vy * tail)
          context.stroke()
          if (fade <= 0 || shooting.x > s.width || shooting.y > s.height) shooting.active = false
        }
      }

      // Линии созвездия: несобранные — пунктиром, собранные — градиентом.
      for (const [a, b] of EDGES) {
        const from = s.points[a]
        const to = s.points[b]
        const isLit = s.lit.has(edgeKey(a, b))

        context.beginPath()
        context.moveTo(from.x, from.y)
        context.lineTo(to.x, to.y)

        if (isLit) {
          const gradient = context.createLinearGradient(from.x, from.y, to.x, to.y)
          gradient.addColorStop(0, '#ff6a00')
          gradient.addColorStop(1, '#ffb020')
          context.strokeStyle = gradient
          context.lineWidth = s.done ? 2.4 : 1.8
          context.setLineDash([])
        } else {
          context.strokeStyle = 'rgba(245, 245, 244, 0.12)'
          context.lineWidth = 1
          context.setLineDash([4, 7])
        }

        context.stroke()
        context.setLineDash([])
      }

      // Линия, которую тянет курсор.
      if (s.active >= 0 && s.pointer.has && (s.dragging || s.lastTouch > 0)) {
        const from = s.points[s.active]
        context.strokeStyle = 'rgba(255, 106, 0, 0.5)'
        context.lineWidth = 1.4
        context.setLineDash([2, 6])
        context.beginPath()
        context.moveTo(from.x, from.y)
        context.lineTo(s.pointer.x * s.width, s.pointer.y * s.height)
        context.stroke()
        context.setLineDash([])
      }

      // Искры от зажжённых линий.
      s.sparks = s.sparks.filter((spark) => {
        spark.life += delta
        if (spark.life >= spark.max) return false
        spark.x += spark.vx * (delta / 16)
        spark.y += spark.vy * (delta / 16)
        const fade = 1 - spark.life / spark.max
        context.fillStyle = `rgba(255, 176, 32, ${fade * 0.9})`
        context.fillRect(spark.x - 1, spark.y - 1, 2, 2)
        return true
      })

      // Кольцо ударной волны после сборки.
      if (s.shock >= 0) {
        s.shock += delta / 1400
        const wave = s.shock * s.width * 0.9
        context.strokeStyle = `rgba(255, 106, 0, ${(1 - s.shock) * 0.5})`
        context.lineWidth = 2
        context.beginPath()
        context.arc(belt.x, belt.y, wave, 0, Math.PI * 2)
        context.stroke()
        if (s.shock >= 1) s.shock = -1
      }

      if (s.done && s.reveal < 1) s.reveal = clamp01(s.reveal + delta / 700)
      if (!s.done && s.reveal > 0) s.reveal = clamp01(s.reveal - delta / 400)

      // Подсказка: если посетитель замер, пульсирует звезда, с которой можно начать.
      if (!s.done && !s.dragging) {
        s.hint += delta
      }

      const nextEdge = EDGES.find(([a, b]) => !s.lit.has(edgeKey(a, b)))
      const hintIndex = s.hint > 6000 && nextEdge ? nextEdge[0] : -1

      // Сами звёзды.
      s.points.forEach((point, index) => {
        const touched = [...s.lit].some((key) => key.split('-').includes(String(index)))
        const isHover = s.hover === index || s.active === index
        const pulse = reduced ? 0 : Math.sin(now / 600 + index) * 0.15
        const hinting = index === hintIndex
        const radius = NODES[index].size * (1 + (isHover ? 0.5 : 0) + (hinting ? 0.35 : 0) + pulse)

        if (touched || isHover || hinting) {
          drawStar(point.x, point.y, radius, '#ff8524', s.done ? 7 : 5)
        } else {
          drawStar(point.x, point.y, radius, 'rgba(245, 245, 244, 0.85)', 2.4)
        }

        // Имена: у звезды под курсором и у всех сразу — после сборки.
        const nameAlpha = Math.max(isHover ? 1 : 0, s.done ? easeOut(s.reveal) * 0.75 : 0)
        if (nameAlpha > 0.02) {
          context.fillStyle = `rgba(245, 245, 244, ${nameAlpha})`
          context.font = '500 11px Inter Variable, system-ui, sans-serif'
          context.textAlign = point.x > s.width * 0.7 ? 'right' : 'left'
          const offset = point.x > s.width * 0.7 ? -10 : 10
          context.fillText(NODES[index].name, point.x + offset, point.y - 10)
        }
      })

      frame = requestAnimationFrame(draw)
    }

    resize()
    frame = requestAnimationFrame(draw)

    // Холст тянется за колонкой, а не за окном: следим именно за элементом.
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
    observer?.observe(canvas)
    window.addEventListener('resize', resize)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [project, reduced])

  function toLocal(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function handleMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const s = state.current
    const { x, y } = toLocal(event)
    s.pointer = { x: x / (s.width || 1), y: y / (s.height || 1), has: true }

    const star = findStar(x, y)
    s.hover = star

    // Протягивание мышью: цепочка звёзд соединяется на лету.
    if (s.dragging && star >= 0 && star !== s.active) {
      connect(s.active, star)
      s.active = star
    }
  }

  function handleDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const s = state.current
    const { x, y } = toLocal(event)
    const star = findStar(x, y)

    s.pointer = { x: x / (s.width || 1), y: y / (s.height || 1), has: true }
    s.hint = 0

    if (star < 0) {
      s.active = -1
      return
    }

    // Второе нажатие по соседней звезде соединяет их — так работает на телефоне.
    if (s.active >= 0 && star !== s.active) {
      connect(s.active, star)
    }

    s.active = star
    s.dragging = true
    s.lastTouch = event.pointerType === 'touch' ? 1 : 0
    try {
      // Захват указателя нужен, чтобы линия тянулась и за пределами холста.
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Некоторые указатели захватить нельзя — рисование это не ломает.
    }
  }

  function handleUp() {
    state.current.dragging = false
  }

  function handleLeave() {
    const s = state.current
    s.dragging = false
    s.hover = -1
    s.pointer = { ...s.pointer, has: false }
    s.smooth = { x: 0.5, y: 0.5 }
  }

  return (
    <div className={`relative ${className}`.trim()}>
      <canvas
        ref={canvasRef}
        className="size-full cursor-crosshair"
        onPointerMove={handleMove}
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerLeave={handleLeave}
        role="img"
        aria-label={
          done
            ? 'Созвездие Ориона собрано'
            : 'Звёздное поле: соедините звёзды, чтобы собрать созвездие Ориона'
        }
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4">
        <p className="label-mono text-muted">
          {done ? <span className="text-accent">Орион собран</span> : 'Соедините звёзды Ориона'}
        </p>
        <p className={`label-mono ${done ? 'text-accent' : 'text-muted'}`} aria-live="polite">
          {linked} / {EDGES.length}
        </p>
      </div>

      {done && (
        <button
          type="button"
          onClick={reset}
          className="label-mono absolute bottom-0 left-0 text-muted transition-colors hover:text-accent"
        >
          Собрать заново
        </button>
      )}
    </div>
  )
}
