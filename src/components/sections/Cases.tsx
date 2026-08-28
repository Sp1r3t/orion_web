import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

import Section from '@/components/ui/Section'
import { cases } from '@/content/cases'
import type { CaseItem } from '@/content/cases'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/** Левая колонка идёт снизу вверх, правая — сверху вниз, и с разной скоростью. */
const COLUMNS = [
  { direction: 1, seconds: 30 },
  { direction: -1, seconds: 24 },
]

/**
 * Высота шторки у края потока и отступ, на который карточка отодвигается от края
 * при наведении. Отступ чуть больше шторки — иначе подтянутая карточка всё равно
 * оказывалась бы под затемнением.
 */
const VEIL = 44
const EDGE_PAD = VEIL + 12

function Card({ item }: { item: CaseItem }) {
  return (
    <a
      href="#contact"
      data-case=""
      aria-label={`${item.name} — ${item.field}`}
      className="group relative block aspect-square overflow-hidden rounded-card border border-line ring-0 ring-accent/45 transition-all duration-500 hover:border-accent/80 hover:ring-2 focus-visible:border-accent/80 focus-visible:ring-2"
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

type ColumnProps = {
  items: CaseItem[]
  direction: number
  seconds: number
  offsetTop: boolean
  reduced: boolean
  hovered: HTMLElement | null
  windowRef: RefObject<HTMLDivElement | null>
}

/**
 * Колонка-лента. Смещением управляет свой цикл, а не CSS-анимация: только так
 * можно и вести поток равномерно, и подтянуть карточку, если на неё навели,
 * когда она наполовину уехала за край.
 */
function Column({
  items,
  direction,
  seconds,
  offsetTop,
  reduced,
  hovered,
  windowRef,
}: ColumnProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const hoveredRef = useRef<HTMLElement | null>(null)

  // Цикл читает наведение из ref, поэтому не перезапускается на каждое движение мыши.
  useEffect(() => {
    hoveredRef.current = hovered
  }, [hovered])

  useEffect(() => {
    if (reduced) return

    const track = trackRef.current
    if (!track) return

    let frame = 0
    let last = performance.now()
    let offset = 0
    let target: number | null = null
    let measured: HTMLElement | null = null

    function tick(now: number) {
      if (!track) return
      const delta = Math.min(now - last, 100)
      last = now

      // Период — это высота одной копии вместе с отступом до следующей.
      // Просто половина высоты ленты дала бы промах на половину зазора,
      // и на стыке копий поток дёргался бы.
      const gap = parseFloat(getComputedStyle(track).rowGap) || 0
      const period = (track.scrollHeight + gap) / 2

      if (period > 0) {
        const card = hoveredRef.current
        const mine = card !== null && track.contains(card)

        if (mine) {
          // Курсор встал на карточку этой колонки: считаем, насколько её нужно
          // подтянуть, чтобы она целиком вышла из-под растворяющегося края.
          if (measured !== card) {
            measured = card
            const box = windowRef.current?.getBoundingClientRect()
            const rect = card.getBoundingClientRect()

            let shift = 0
            if (box) {
              if (rect.top < box.top + EDGE_PAD) shift = -(box.top + EDGE_PAD - rect.top)
              else if (rect.bottom > box.bottom - EDGE_PAD)
                shift = rect.bottom - (box.bottom - EDGE_PAD)
            }

            target = offset + shift

            // Сдвиг вниз не должен увести ленту выше её начала — иначе сверху
            // откроется пустота. Работаем на копию ниже.
            if (target < 0) {
              target += period
              offset += period
            }
          }

          if (target !== null) {
            offset += (target - offset) * 0.2
            if (Math.abs(target - offset) < 0.4) offset = target
          }
        } else {
          measured = null
          target = null
          offset += direction * (period / (seconds * 1000)) * delta
          offset = ((offset % period) + period) % period
        }

        track.style.transform = `translateY(${-offset}px)`
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [direction, seconds, reduced, windowRef])

  return (
    <div className={offsetTop ? '-mt-20 lg:-mt-32' : ''}>
      <div ref={trackRef} className="flex flex-col gap-4 will-change-transform lg:gap-6">
        {/* Список продублирован: на стыке копий поток выглядит бесконечным. */}
        {[...items, ...items].map((item, i) => (
          <Card key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  )
}

export default function Cases() {
  const [hovered, setHovered] = useState<HTMLElement | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)
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
   * Карточку под курсором определяем по цели события, а не парой enter/leave:
   * непарное событие оставило бы поток стоять навсегда. Слушаем документ —
   * тогда любое движение мыши где угодно возвращает поток в движение.
   */
  useEffect(() => {
    function onMove(event: PointerEvent) {
      const target = event.target as Element | null
      setHovered((target?.closest?.('[data-case]') as HTMLElement | null) ?? null)
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
      lead="Наведите на карточку: колонка остановится, подтянет снимок в кадр и покажет, что это за проект, из какой он сферы и что изменилось после запуска."
    >
      {/* Сетка на фоне всей секции — под потоком и текстом. */}
      <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0" />

      <div
        ref={windowRef}
        className="relative mt-16 h-[min(1000px,88vh)] min-h-[520px] overflow-hidden"
      >
        <div
          className={`grid gap-4 lg:gap-6 ${wide ? 'grid-cols-2' : 'grid-cols-1'}`}
          onBlurCapture={() => setHovered(null)}
        >
          {columns.map((column, index) => (
            <Column
              key={index}
              items={column}
              direction={COLUMNS[index % COLUMNS.length].direction}
              seconds={COLUMNS[index % COLUMNS.length].seconds}
              offsetTop={index === 1}
              reduced={reduced}
              hovered={hovered}
              windowRef={windowRef}
            />
          ))}
        </div>

        {/* Шторки вместо маски: маска делала полупрозрачной саму карточку,
            и сквозь фотографию просвечивала фоновая сетка. Градиент цветом
            фона закрывает у краёв и карточки, и сетку. */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-bg via-bg/85 to-transparent lg:h-11" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg via-bg/85 to-transparent lg:h-11" />
      </div>

      <p className="mt-8 text-sm text-muted">
        Показаны 8 проектов из 40+. Полное портфолио пришлём в ответ на заявку.
      </p>
    </Section>
  )
}
