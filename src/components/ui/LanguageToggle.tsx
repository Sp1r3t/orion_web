import { motion, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'

import { useLanguage } from '@/i18n/context'
import type { Lang } from '@/i18n/types'

/**
 * Геометрия рамки. Считаем от внутренней области: слой подписей и бегунок лежат
 * внутри рамки, поэтому её толщину нужно вычесть — иначе подсветка букв
 * разъезжается с бегунком на пару пикселей.
 */
const WIDTH = 84
const HEIGHT = 36
const BORDER = 1
const PAD = 3
const TRACK = WIDTH - BORDER * 2
const HALF = (TRACK - PAD * 2) / 2
const THUMB_H = HEIGHT - BORDER * 2 - PAD * 2

const ORDER: Lang[] = ['ru', 'en']

/** Пружина плотная: бегунок доезжает быстро, но без рывка в конце. */
const SPRING = { stiffness: 420, damping: 34, mass: 0.8 }

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, content } = useLanguage()
  const running = useRef(false)

  const index = Math.max(0, ORDER.indexOf(lang))
  const progress = useSpring(index, SPRING)

  useEffect(() => {
    progress.set(index)
  }, [index, progress])

  const x = useTransform(progress, (value) => value * HALF)

  /** На разгоне бегунок слегка растягивается — движение читается живым, а не линейным. */
  const velocity = useVelocity(progress)
  const scaleX = useTransform(velocity, (value) => 1 + Math.min(Math.abs(value) * 0.05, 0.16))

  /**
   * Верхний слой подписей обрезан ровно по бегунку: буквы перекрашиваются в тёмное
   * по мере того, как он на них наезжает. Перекрашивания целиком по клику не видно —
   * цвет меняется постепенно вместе с движением.
   */
  const clip = useTransform(progress, (value) => {
    const left = PAD + value * HALF
    return `inset(${PAD}px ${TRACK - left - HALF}px ${PAD}px ${left}px round 9px)`
  })

  function switchTo(next: Lang) {
    if (next === lang) return

    const start = document.startViewTransition?.bind(document)
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

    if (!start || reduced || running.current) {
      setLang(next)
      return
    }

    running.current = true
    const root = document.documentElement
    // Класс включает мягкое растворение снимков: без него сработало бы правило
    // смены темы, где переход между снимками отключён.
    root.classList.add('lang-switch')

    const transition = start(() => {
      flushSync(() => setLang(next))
    })

    transition.finished
      .catch(() => {
        // Переход мог быть прерван — язык уже применён.
      })
      .finally(() => {
        root.classList.remove('lang-switch')
        running.current = false
      })
  }

  return (
    <div
      role="group"
      aria-label={content.ui.header.language}
      style={{ width: WIDTH, height: HEIGHT }}
      className={`relative flex shrink-0 items-center overflow-hidden rounded-[11px] border border-line bg-surface/70 transition-colors duration-500 ${className}`.trim()}
    >
      <motion.span
        aria-hidden="true"
        style={{ x, scaleX, width: HALF, height: THUMB_H, left: PAD, top: PAD }}
        className="pointer-events-none absolute overflow-hidden rounded-[9px] bg-gradient-to-br from-accent to-ember shadow-[0_8px_20px_-8px_rgb(255_106_0/0.9)]"
      >
        {/* Блик пробегает по бегунку на каждом переключении. */}
        <motion.span
          key={lang}
          initial={{ x: '-180%' }}
          animate={{ x: '180%' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 w-1/2 bg-white/40 blur-[5px]"
        />
      </motion.span>

      <span
        aria-hidden="true"
        className="label-mono pointer-events-none absolute inset-0 grid grid-cols-2 items-center text-center text-muted"
      >
        <span className="pl-[0.18em]">RU</span>
        <span className="pl-[0.18em]">EN</span>
      </span>

      <motion.span
        aria-hidden="true"
        style={{ clipPath: clip, WebkitClipPath: clip }}
        className="label-mono pointer-events-none absolute inset-0 grid grid-cols-2 items-center text-center font-semibold text-bg"
      >
        <span className="pl-[0.18em]">RU</span>
        <span className="pl-[0.18em]">EN</span>
      </motion.span>

      {/* Настоящие кнопки лежат сверху и прозрачны: подписи рисуют слои выше. */}
      {ORDER.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          aria-pressed={lang === code}
          className="relative z-10 h-full flex-1 rounded-[9px]"
        >
          <span className="sr-only">{code === 'ru' ? 'Русский' : 'English'}</span>
        </button>
      ))}
    </div>
  )
}
