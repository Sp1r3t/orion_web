import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import Section from '@/components/ui/Section'
import { useContent } from '@/i18n/context'

/** Сколько держится один отзыв. Столько же длится заливка активной точки. */
const SLIDE_MS = 10_000

export default function Reviews() {
  const { reviews, ui } = useContent()
  const [index, setIndex] = useState(0)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  )

  const fillRef = useRef<HTMLSpanElement>(null)

  const review = reviews[index]

  /**
   * Отсчёт до следующего отзыва ведём сами, а не событием окончания CSS-анимации:
   * анимацию мог прервать любой перерендер, и полоса застывала на середине.
   * Пауз нет: полоса идёт всегда, что бы ни делал курсор.
   */
  useEffect(() => {
    if (reduced) return

    let frame = 0
    let last = performance.now()
    let elapsed = 0

    function tick(now: number) {
      // Шаг ограничен: вернувшись из фоновой вкладки, слайдер не проглотит отзыв разом.
      const delta = Math.min(now - last, 100)
      last = now
      elapsed += delta

      const progress = Math.min(elapsed / SLIDE_MS, 1)
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`

      if (progress >= 1) {
        setIndex((current) => (current + 1) % reviews.length)
        return
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [index, reduced, reviews.length])

  return (
    <Section
      id="testimonials"
      index="06"
      eyebrow={ui.reviews.eyebrow}
      title={ui.reviews.title}
      lead={ui.reviews.lead}
    >
      <div className="mt-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            {/* Высота зафиксирована: иначе на смене отзыва прыгает вся секция. */}
            <div className="relative min-h-64 sm:min-h-52">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={review.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-8"
                >
                  <blockquote className="text-xl leading-relaxed text-balance lg:text-2xl">
                    <span aria-hidden="true" className="mr-2 font-display text-accent">
                      “
                    </span>
                    {review.quote}
                  </blockquote>

                  <figcaption className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <span className="flex size-11 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-display text-accent">
                      {review.author.charAt(0)}
                    </span>
                    <span>
                      <span className="block font-medium">{review.author}</span>
                      <span className="block text-sm text-muted">{review.role}</span>
                    </span>
                    <span className="label-mono rounded-full border border-line px-3 py-1.5 text-muted">
                      {review.result}
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6 lg:col-span-3 lg:flex-col lg:items-end lg:justify-end">
            <p className="font-mono text-3xl leading-none">
              <span className="text-accent">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-muted"> / {String(reviews.length).padStart(2, '0')}</span>
            </p>

            <div className="flex items-center gap-2" role="tablist" aria-label={ui.reviews.list}>
              {reviews.map((item, i) => {
                const active = i === index

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`${ui.reviews.item} ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-2 overflow-hidden rounded-full bg-line-strong transition-all duration-500 ${
                      active ? 'w-14' : 'w-2 hover:bg-muted'
                    }`}
                  >
                    {active && (
                      <span
                        ref={reduced ? undefined : fillRef}
                        className="block h-full w-full origin-left rounded-full bg-accent"
                        style={{ transform: reduced ? 'scaleX(1)' : 'scaleX(0)' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
