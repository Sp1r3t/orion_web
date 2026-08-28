import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import type { MouseEvent } from 'react'

import { useTheme } from '@/hooks/useTheme'

/** Сетка, по которой рассыпаются круги: 4×3 клетки покрывают экран целиком. */
const COLS = 4
const ROWS = 3
const GROW = 620
const WAVE = 360
const FADE = 300

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const running = useRef(false)
  const dark = theme === 'dark'

  function switchTheme(event: MouseEvent<HTMLButtonElement>) {
    const next = dark ? 'light' : 'dark'
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

    if (reduced || running.current) {
      setTheme(next)
      return
    }

    running.current = true

    const rect = event.currentTarget.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height / 2

    const root = getComputedStyle(document.documentElement)
    const color = root.getPropertyValue(next === 'dark' ? '--bg-dark' : '--bg-light').trim()

    const overlay = document.createElement('div')
    overlay.setAttribute('aria-hidden', 'true')
    overlay.style.cssText = 'position:fixed;inset:0;z-index:80;pointer-events:none'

    const cellW = window.innerWidth / COLS
    const cellH = window.innerHeight / ROWS
    // Радиус в клетке равен её диагонали: тогда круги гарантированно смыкаются
    // и не оставляют щелей, где просвечивала бы старая тема.
    const radius = Math.hypot(cellW, cellH)
    const far = Math.hypot(window.innerWidth, window.innerHeight)

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const x = cellW * (col + 0.2 + Math.random() * 0.6)
        const y = cellH * (row + 0.2 + Math.random() * 0.6)

        const circle = document.createElement('span')
        circle.style.cssText = `position:absolute;left:${x - radius}px;top:${y - radius}px;width:${radius * 2}px;height:${radius * 2}px;border-radius:9999px;background:${color};transform:scale(0);will-change:transform`
        overlay.append(circle)

        // Волна расходится от самой кнопки: ближние круги вспухают первыми.
        const delay = (Math.hypot(x - originX, y - originY) / far) * WAVE

        circle.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
          duration: GROW,
          delay,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        })
      }
    }

    document.body.append(overlay)

    // Последовательность ведём таймерами: обещания WAAPI во вкладке без
    // отрисовки могут не разрешиться, а тема должна смениться в любом случае.
    window.setTimeout(() => {
      flushSync(() => setTheme(next))

      overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: FADE,
        easing: 'ease-out',
        fill: 'forwards',
      })

      window.setTimeout(() => {
        overlay.remove()
        running.current = false
      }, FADE)
    }, GROW + WAVE)
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
