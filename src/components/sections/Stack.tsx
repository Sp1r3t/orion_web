import { useEffect, useRef, useState } from 'react'
import { useContent } from '@/i18n/context'

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const sequenceRef = useRef<HTMLDivElement>(null)
  const [copies, setCopies] = useState(4)

  useEffect(() => {
    const viewport = viewportRef.current
    const sequence = sequenceRef.current
    if (!viewport || !sequence) return

    const measure = () => {
      const sequenceWidth = sequence.getBoundingClientRect().width
      if (sequenceWidth > 0) {
        setCopies(Math.max(1, Math.ceil(viewport.clientWidth / sequenceWidth)))
      }
    }
    measure()
    if (typeof ResizeObserver !== 'function') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(sequence)
    measure()
    return () => observer.disconnect()
  }, [items])

  return (
    <div ref={viewportRef} className="group overflow-hidden py-4" aria-hidden="true">
      <div
        className={`flex w-max items-center group-hover:[animation-play-state:paused] ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
      >
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0">
            {Array.from({ length: copies }, (_, copy) => (
              <div
                key={copy}
                ref={group === 0 && copy === 0 ? sequenceRef : undefined}
                className="flex shrink-0 items-center gap-12 pr-12"
              >
                {items.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="font-display text-2xl whitespace-nowrap text-muted transition-colors duration-300 hover:text-accent lg:text-4xl"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Две встречные ленты со стеком — визуальная пауза между тяжёлыми секциями. */
export default function Stack() {
  const { stack, ui } = useContent()
  const half = Math.ceil(stack.length / 2)

  return (
    <section className="relative overflow-hidden border-t border-line py-16">
      <div className="container-page">
        <p className="label-mono text-muted">{ui.stack.title}</p>
      </div>
      <div className="mt-8 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <Row items={stack.slice(0, half)} />
        <Row items={stack.slice(half)} reverse />
      </div>
    </section>
  )
}
