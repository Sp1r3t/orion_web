import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  r: number
  alpha: number
  speed: number
}

/** Созвездие Ориона в долях от размера холста — «пояс» из трёх звёзд по центру. */
const ORION: Array<[number, number]> = [
  [0.22, 0.1], // Бетельгейзе
  [0.74, 0.16], // Беллатрикс
  [0.4, 0.46], // пояс
  [0.52, 0.52],
  [0.64, 0.58],
  [0.28, 0.88], // Саиф
  [0.82, 0.82], // Ригель
]

const LINKS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 4],
  [2, 3],
  [3, 4],
  [2, 5],
  [4, 6],
  [5, 6],
]

/**
 * Фон hero: медленно дрейфующее звёздное поле и поверх него — созвездие Ориона.
 * Рисуем на canvas, потому что несколько сотен точек в DOM стоят дороже, чем один холст.
 */
export default function StarField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let stars: Star[] = []
    let frame = 0

    function resize() {
      if (!canvas) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * ratio
      canvas.height = height * ratio
      context?.setTransform(ratio, 0, 0, ratio, 0, 0)

      const count = Math.round((width * height) / 9000)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        alpha: Math.random() * 0.5 + 0.15,
        speed: Math.random() * 0.12 + 0.02,
      }))
    }

    function draw(time: number) {
      if (!context) return
      context.clearRect(0, 0, width, height)

      for (const star of stars) {
        const twinkle = reduceMotion ? 1 : 0.75 + Math.sin(time / 900 + star.x) * 0.25
        context.beginPath()
        context.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        context.fillStyle = `rgba(245, 245, 244, ${star.alpha * twinkle})`
        context.fill()

        if (!reduceMotion) {
          star.y -= star.speed
          if (star.y < -2) {
            star.y = height + 2
            star.x = Math.random() * width
          }
        }
      }

      const points = ORION.map(([x, y]) => ({ x: x * width, y: y * height }))

      context.strokeStyle = 'rgba(255, 106, 0, 0.28)'
      context.lineWidth = 1
      for (const [from, to] of LINKS) {
        context.beginPath()
        context.moveTo(points[from].x, points[from].y)
        context.lineTo(points[to].x, points[to].y)
        context.stroke()
      }

      points.forEach((point, index) => {
        const pulse = reduceMotion ? 1 : 0.6 + Math.sin(time / 700 + index) * 0.4
        context.beginPath()
        context.arc(point.x, point.y, 2.4, 0, Math.PI * 2)
        context.fillStyle = '#ff6a00'
        context.fill()

        context.beginPath()
        context.arc(point.x, point.y, 10 * pulse, 0, Math.PI * 2)
        context.fillStyle = `rgba(255, 106, 0, ${0.1 * pulse})`
        context.fill()
      })

      frame = requestAnimationFrame(draw)
    }

    resize()
    frame = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
