import { useRef } from 'react'

import Reveal from '@/components/ui/Reveal'
import Section from '@/components/ui/Section'
import StarDust from '@/components/ui/StarDust'
import StarGlyph from '@/components/ui/StarGlyph'
import { usePauseOffscreen } from '@/hooks/usePauseOffscreen'
import { useContent } from '@/i18n/context'

/** Ряды складываются зеркально: длинный + короткий, короткий + длинный, во всю ширину. */
const SPAN = {
  wide: 'lg:col-span-2',
  small: 'lg:col-span-1',
  full: 'lg:col-span-3',
}

export default function Promises() {
  const { promises, ui } = useContent()
  const gridRef = useRef<HTMLDivElement>(null)
  usePauseOffscreen(gridRef)

  return (
    <Section id="promises" index="05" eyebrow={ui.promises.eyebrow} title={ui.promises.title}>
      {/* Подзаголовка у раздела нет, поэтому плитки идут сразу под названием. */}
      <div ref={gridRef} className="mt-8 grid gap-4 lg:grid-cols-3">
        {promises.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.05} className={SPAN[item.span]}>
            <article className="group relative flex h-full min-h-48 items-start gap-5 overflow-hidden rounded-card border border-line bg-surface p-7 transition-colors duration-500 hover:border-accent/40">
              {/* Звёзды рассыпаны по всей плитке, а не только под рисунком. */}
              <StarDust seed={index} />

              {/* Свечение под созвездием разгорается вместе с ним. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full bg-accent/0 blur-3xl transition-colors duration-700 group-hover:bg-accent/15"
              />

              {/* Текст и созвездие — соседи по строке, поэтому наехать друг на друга не могут. */}
              <div className="relative flex-1">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-3 text-sm text-muted">{item.text}</p>
              </div>

              <StarGlyph
                shape={item.glyph}
                className={`pointer-events-none relative shrink-0 ${
                  item.span === 'small' ? 'w-20 lg:w-24' : 'w-24 lg:w-32'
                }`}
              />
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
