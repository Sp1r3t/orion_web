import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import type { MouseEvent } from 'react'

import { useTheme } from '@/hooks/useTheme'

/** Сетка, по которой рассыпаются круги: 4×3 клетки покрывают экран целиком. */
const COLS = 4
const ROWS = 3
const DURATION = 900
/** Доля цикла, на которую растянуты старты кругов. */
const WAVE = 0.35
const STEPS = 44

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const running = useRef(false)
  const dark = theme === 'dark'

  function switchTheme(event: MouseEvent<HTMLButtonElement>) {
    const next = dark ? 'light' : 'dark'
    const start = document.startViewTransition?.bind(document)
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

    if (!start || reduced || running.current) {
      setTheme(next)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height / 2

    const cellW = window.innerWidth / COLS
    const cellH = window.innerHeight / ROWS
    // Радиус в клетке равен её диагонали: круги гарантированно смыкаются
    // и не оставляют щелей, где просвечивала бы старая тема.
    const radius = Math.hypot(cellW, cellH)
    const far = Math.hypot(window.innerWidth, window.innerHeight)

    const circles: Array<{ x: number; y: number; delay: number }> = []
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const x = cellW * (col + 0.2 + Math.random() * 0.6)
        const y = cellH * (row + 0.2 + Math.random() * 0.6)
        // Волна расходится от кнопки: ближние круги вспухают первыми.
        circles.push({ x, y, delay: (Math.hypot(x - originX, y - originY) / far) * WAVE })
      }
    }

    running.current = true

    // flushSync нужен, чтобы React применил тему внутри перехода: снимок
    // «после» браузер делает сразу по возвращении из коллбэка.
    const transition = start(() => {
      flushSync(() => setTheme(next))
    })

    transition.ready
      .then(() => {
        /**
         * Маска из окружностей поверх снимка новой темы: внутри кругов видно
         * новую страницу, снаружи просвечивает старая. Круги растут — старая
         * тема исчезает. Кадры считаем сами: набор из дюжины градиентов
         * браузер сам не интерполирует.
         */
        const frames: string[] = []
        for (let step = 0; step <= STEPS; step += 1) {
          const t = step / STEPS
          frames.push(
            circles
              .map((circle) => {
                const local = clamp01((t - circle.delay) / (1 - circle.delay))
                const size = easeOut(local) * radius
                return `radial-gradient(circle ${size}px at ${circle.x}px ${circle.y}px, #000 0 99%, transparent 100%)`
              })
              .join(', '),
          )
        }

        document.documentElement.animate(
          { maskImage: frames, WebkitMaskImage: frames } as unknown as Keyframe[],
          {
            duration: DURATION,
            easing: 'linear',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {
        // Переход мог быть прерван — тема уже применена.
      })
      .finally(() => {
        window.setTimeout(() => {
          running.current = false
        }, DURATION)
      })
  }

  return (
    <button
      type="button"
      onClick={switchTheme}
      aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      className={`relative flex size-9 items-center justify-center rounded-full text-muted transition-colors duration-300 hover:text-accent ${className}`.trim()}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
