import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import Section from '@/components/ui/Section'
import { cases } from '@/content/cases'
import type { CaseItem } from '@/content/cases'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/** Левая колонка идёт снизу вверх, правая — сверху вниз, и с разной скоростью. */
const COLUMNS = [
  { animation: 'waterfall-up', seconds: 54 },
  { animation: 'waterfall-down', seconds: 44 },
]

function Card({ item }: { item: CaseItem }) {
  return (
    <a
      href="#contact"
      data-case=""
      aria-label={`${item.name} — ${item.field}`}
      className="group relative block aspect-square overflow-hidden rounded-card border border-line transition-colors duration-500 hover:border-accent/50 focus-visible:border-accent/50"
    >
      <img
        src={item.image}
        alt=""
        // Без ленивой загрузки: копии списка лежат за краем обрезки, и лениво
        // они подгрузились бы только в момент, когда уже въехали в кадр.
        decoding="async"
        className="size-full object-cover brightness-[0.55] grayscale-[45%] transition-all duration-700 group-hover:scale-[1.06] group-hover:brightness-90 group-hover:grayscale-0 group-focus-visible:scale-[1.06] group-focus-visible:brightness-90 group-focus-visible:grayscale-0"
      />

      {/* Затемнение снизу, чтобы текст читался поверх любого снимка. */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-transparent transition-opacity duration-500 lg:opacity-70 lg:group-hover:opacity-100" />

      <span className="label-mono pointer-events-none absolute top-4 left-5 text-text/70">
        {item.index}
      </span>

      <ArrowUpRight className="pointer-events-none absolute top-4 right-4 size-5 text-text/50 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />

      {/* На тач-экранах наведения нет — там подпись видна всегда. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 lg:translate-y-2 lg:opacity-0 lg:transition-all lg:duration-500 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
        <span className="text-display text-xl leading-tight lg:text-2xl">{item.name}</span>

        <span className="label-mono text-muted">
          {item.field} · {item.year}
        </span>

        <span className="mt-1 hidden text-sm leading-snug text-text/85 lg:block">
          {item.improved}
        </span>

        <span className="mt-2 flex items-center gap-2 self-start rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
          {item.result}
        </span>
      </span>
    </a>
  )
}

export default function Cases() {
  // Останавливается только та колонка, на которую навели.
  const [hovered, setHovered] = useState<number | null>(null)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  )

  // На узком экране две колонки дают квадраты по 160 px — там поток идёт одной лентой.
  const wide = useMediaQuery('(min-width: 640px)')
  const columns = wide
    ? [cases.filter((_, i) => i % 2 === 0), cases.filter((_, i) => i % 2 === 1)]
    : [cases]

  /**
   * Пауза определяется по элементу под курсором, а не парой enter/leave:
   * непарное событие оставило бы поток стоять навсегда. Слушаем документ —
   * тогда любое движение мыши где угодно возвращает поток в движение.
   */
  useEffect(() => {
    function onMove(event: PointerEvent) {
      const target = event.target as Element | null
      const column = target?.closest?.('[data-column]')
      setHovered(column ? Number(column.getAttribute('data-column')) : null)
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <Section
      id="portfolio"
      index="02"
      eyebrow="Портфолио"
      title={
        <>
          Проекты, которые
          <br />
          уже работают
        </>
      }
      lead="Поток останавливается, стоит навести курсор: на снимке появится, что это за проект, из какой он сферы и что изменилось после запуска."
    >
      <div
        className="relative mt-16 h-[min(860px,80vh)] min-h-[460px] overflow-hidden"
        // Верх и низ растворяются — карточки будто вытекают из-за края секции.
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)',
        }}
      >
        <div
          className={`grid gap-4 lg:gap-6 ${wide ? 'grid-cols-2' : 'grid-cols-1'}`}
          onBlurCapture={() => setHovered(null)}
        >
          {columns.map((column, index) => (
            <div
              key={index}
              data-column={index}
              onFocusCapture={() => setHovered(index)}
              className={index === 1 ? '-mt-20 lg:-mt-32' : ''}
            >
              <div
                className="flex flex-col gap-4 will-change-transform lg:gap-6"
                style={
                  reduced
                    ? undefined
                    : {
                        animation: `${COLUMNS[index % COLUMNS.length].animation} ${
                          COLUMNS[index % COLUMNS.length].seconds
                        }s linear infinite`,
                        animationPlayState: hovered === index ? 'paused' : 'running',
                      }
                }
              >
                {/* Список продублирован: на стыке копий поток выглядит бесконечным. */}
                {[...column, ...column].map((item, i) => (
                  <Card key={`${item.id}-${i}`} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-muted">
        Показаны 8 проектов из 40+. Полное портфолио пришлём в ответ на заявку.
      </p>
    </Section>
  )
}
