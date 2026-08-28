import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'
import type { MouseEvent } from 'react'

import { useTheme } from '@/hooks/useTheme'

/**
 * Переключатель темы. Смена не просто перекрашивает страницу: новая тема
 * раскрывается кругом из-под самой кнопки через View Transitions. Там, где
 * этого API нет (или включена уменьшенная анимация), тема меняется сразу.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const dark = theme === 'dark'

  function switchTheme(event: MouseEvent<HTMLButtonElement>) {
    const next = dark ? 'light' : 'dark'
    const start = document.startViewTransition?.bind(document)
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

    if (!start || reduced) {
      setTheme(next)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    // flushSync нужен, чтобы React успел применить тему внутри перехода:
    // View Transitions снимает страницу до и сразу после этого коллбэка.
    const transition = start(() => {
      flushSync(() => setTheme(next))
    })

    transition.ready
      .then(() => {
        // Радиус круга — до самого дальнего угла экрана от кнопки.
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        )

        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          {
            duration: 760,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {
        // Переход мог быть прерван — тема уже применена, ничего делать не нужно.
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
