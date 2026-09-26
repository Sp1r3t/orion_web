import { AnimatePresence, m } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import type { MouseEvent } from 'react'

import { useTheme } from '@/hooks/useTheme'
import { useContent } from '@/i18n/context'

/** Сетка, по которой рассыпаются круги: 4×3 клетки покрывают экран целиком. */
const COLS = 4
const ROWS = 3
const DURATION = 1000
/** Доля цикла, на которую растянуты старты кругов. */
const WAVE = 0.35
/**
 * Опорных кадров немного: clip-path из окружностей браузер интерполирует сам,
 * промежуточные кадры он досчитает. Маску из градиентов он интерполировать не
 * умел — приходилось задавать почти каждый кадр экрана, и полноэкранная
 * перерисовка не успевала, отчего переход выглядел рваным.
 */
const STEPS = 10

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const { ui } = useContent()
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
    // Класс включает правила перехода темы: снимки не растворяются, их открывает маска.
    document.documentElement.classList.add('theme-switch')

    // flushSync нужен, чтобы React применил тему внутри перехода: снимок
    // «после» браузер делает сразу по возвращении из коллбэка.
    const transition = start(() => {
      flushSync(() => setTheme(next))
    })

    transition.ready
      .then(() => {
        /**
         * Снимок новой темы обрезан окружностями: внутри круга видно новую
         * страницу, снаружи просвечивает старая. Круги растут — старая тема
         * исчезает. Каждая окружность записана одинаковым набором команд,
         * поэтому кадры пути интерполируются между собой.
         */
        const pathAt = (t: number) =>
          circles
            .map((circle) => {
              const local = clamp01((t - circle.delay) / (1 - circle.delay))
              const size = Math.max(0.01, easeOut(local) * radius)
              return `M ${circle.x - size} ${circle.y} a ${size} ${size} 0 1 0 ${size * 2} 0 a ${size} ${size} 0 1 0 ${-size * 2} 0`
            })
            .join(' ')

        const frames = Array.from({ length: STEPS + 1 }, (_, step) => ({
          clipPath: `path("${pathAt(step / STEPS)}")`,
        }))

        document.documentElement.animate(frames, {
          duration: DURATION,
          easing: 'linear',
          pseudoElement: '::view-transition-new(root)',
        })
      })
      .catch(() => {
        // Переход мог быть прерван — тема уже применена.
      })

    /**
     * Уборка висит на finished, а не на ready: ready срабатывает в начале
     * перехода, и класс, гасящий переходы цвета, снялся бы ещё до того, как
     * круги начали расти. finished наступает по концу анимации — держать
     * класс дольше незачем, иначе сразу после смены темы наведение теряет
     * плавность. Значения к этому моменту уже конечные, поэтому возврат
     * переходов ничего не запускает.
     */
    transition.finished
      .catch(() => {
        // Переход прерван — состояние всё равно нужно вернуть.
      })
      .finally(() => {
        document.documentElement.classList.remove('theme-switch')
        running.current = false
      })
  }

  return (
    <button
      type="button"
      onClick={switchTheme}
      aria-label={dark ? ui.header.toLight : ui.header.toDark}
      className={`relative flex size-9 items-center justify-center rounded-full text-muted transition-colors duration-300 hover:text-accent ${className}`.trim()}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </m.span>
      </AnimatePresence>
    </button>
  )
}
