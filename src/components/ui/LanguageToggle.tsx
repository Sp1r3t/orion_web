import { m, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'

import { getLenis } from '@/hooks/useSmoothScroll'
import { useLanguage } from '@/i18n/context'
import type { Lang } from '@/i18n/types'

/**
 * Геометрия рамки. Считаем от внутренней области: слой подписей и бегунок лежат
 * внутри рамки, поэтому её толщину нужно вычесть — иначе подсветка букв
 * разъезжается с бегунком на пару пикселей.
 */
const WIDTH = 72
const HEIGHT = 32
const BORDER = 1
const PAD = 3
const TRACK = WIDTH - BORDER * 2
const HALF = (TRACK - PAD * 2) / 2
const THUMB_H = HEIGHT - BORDER * 2 - PAD * 2
const THUMB_R = 7

const ORDER: Lang[] = ['ru', 'en']

/** Высота фиксированного хедера: раздел под ней и считаем тем, что человек читает. */
const HEADER = 80

/** Первый раздел, который ещё виден из-под хедера. */
function anchorSection(): HTMLElement | null {
  for (const section of document.querySelectorAll<HTMLElement>('section[id]')) {
    if (section.getBoundingClientRect().bottom > HEADER) return section
  }
  return null
}

/**
 * Английский текст короче или длиннее русского, поэтому после подстановки блоки
 * разъезжаются и страница под курсором прыгает. Запоминаем, где стоял видимый
 * раздел, и возвращаем его на то же место. Снимок «после» браузер снимает уже
 * с поправкой — в переходе прыжка не видно.
 */
function keepInPlace(update: () => void) {
  const anchor = anchorSection()
  const before = anchor?.getBoundingClientRect().top ?? 0

  update()

  if (!anchor) return

  const delta = anchor.getBoundingClientRect().top - before
  if (Math.abs(delta) < 1) return

  const lenis = getLenis()

  // Lenis ведёт прокрутку сам: правку нужно отдавать ему, иначе он вернёт своё.
  if (lenis) lenis.scrollTo(lenis.scroll + delta, { immediate: true, force: true })
  else window.scrollTo(0, window.scrollY + delta)
}

/** Мягкая пружина: бегунок скользит и едва заметно доводится, без щелчка в конце. */
const SPRING = { stiffness: 260, damping: 30, mass: 0.9 }

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, content } = useLanguage()
  const running = useRef(false)

  const index = Math.max(0, ORDER.indexOf(lang))
  const progress = useSpring(index, SPRING)

  useEffect(() => {
    progress.set(index)
  }, [index, progress])

  const x = useTransform(progress, (value) => value * HALF)

  /**
   * Разгон вытягивает бегунок за собой: точка опоры — на хвосте, поэтому передний
   * край стоит на месте, а тянется след. Это то самое «живое» движение, из-за
   * которого скольжение читается мягким, а не как перестановка блока.
   */
  const velocity = useVelocity(progress)
  const scaleX = useTransform(velocity, (value) => 1 + Math.min(Math.abs(value) * 0.035, 0.1))
  const origin = useTransform(velocity, (value) => (value >= 0 ? 'right center' : 'left center'))

  /**
   * Верхний слой подписей обрезан ровно по бегунку: буква разгорается акцентом ровно
   * там, где он на неё наехал. Оба слоя набраны одинаково — иначе на границе обрезки
   * глифы разной ширины давали бы двоение.
   */
  const clip = useTransform(progress, (value) => {
    const left = PAD + value * HALF
    return `inset(${PAD}px ${TRACK - left - HALF}px ${PAD}px ${left}px round ${THUMB_R}px)`
  })

  function switchTo(next: Lang) {
    if (next === lang) return

    const start = document.startViewTransition?.bind(document)
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

    if (!start || reduced || running.current) {
      keepInPlace(() => setLang(next))
      return
    }

    running.current = true
    const root = document.documentElement
    // Класс включает мягкое растворение снимков: без него сработало бы правило
    // смены темы, где переход между снимками отключён.
    root.classList.add('lang-switch')

    const transition = start(() => {
      keepInPlace(() => flushSync(() => setLang(next)))
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
      className={`group/lang relative flex shrink-0 items-center overflow-hidden rounded-[10px] border border-line bg-surface/40 backdrop-blur-sm transition-colors duration-500 hover:border-line-strong ${className}`.trim()}
    >
      <m.span
        aria-hidden="true"
        style={{
          x,
          scaleX,
          transformOrigin: origin,
          width: HALF,
          height: THUMB_H,
          left: PAD,
          top: PAD,
          borderRadius: THUMB_R,
        }}
        className="pointer-events-none absolute border border-accent/45 bg-accent/12 shadow-[0_0_14px_-3px_rgb(255_106_0/0.5)]"
      >
        {/* На каждом переключении из бегунка расходится короткая волна. */}
        <m.span
          key={lang}
          initial={{ opacity: 0.5, scale: 0.5 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ borderRadius: THUMB_R }}
          className="absolute inset-0 bg-accent/45 blur-[6px]"
        />
      </m.span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid grid-cols-2 items-center text-center font-mono text-[10px] font-medium tracking-[0.12em] text-muted uppercase transition-colors duration-300 group-hover/lang:text-text"
      >
        <span className="pl-[0.12em]">RU</span>
        <span className="pl-[0.12em]">EN</span>
      </span>

      <m.span
        aria-hidden="true"
        style={{ clipPath: clip, WebkitClipPath: clip }}
        className="pointer-events-none absolute inset-0 grid grid-cols-2 items-center text-center font-mono text-[10px] font-medium tracking-[0.12em] text-accent uppercase"
      >
        <span className="pl-[0.12em]">RU</span>
        <span className="pl-[0.12em]">EN</span>
      </m.span>

      {/* Настоящие кнопки лежат сверху и прозрачны: подписи рисуют слои выше. */}
      {ORDER.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          aria-pressed={lang === code}
          className="relative z-10 h-full flex-1 rounded-[7px]"
        >
          <span className="sr-only">{code === 'ru' ? 'Русский' : 'English'}</span>
        </button>
      ))}
    </div>
  )
}
