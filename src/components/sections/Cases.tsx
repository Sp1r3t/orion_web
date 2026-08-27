import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useRef, useState } from 'react'

import Section from '@/components/ui/Section'
import { cases } from '@/content/cases'

export default function Cases() {
  const [hovered, setHovered] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.4 })

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = listRef.current?.getBoundingClientRect()
    if (!bounds) return
    x.set(event.clientX - bounds.left + 24)
    y.set(event.clientY - bounds.top - 110)
  }

  const active = cases.find((item) => item.id === hovered)

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
      lead="Наведите на строку, чтобы увидеть проект. Результат — цифры клиента через три месяца после запуска."
    >
      <div ref={listRef} onMouseMove={handleMove} className="relative mt-16 border-t border-line">
        {cases.map((item) => (
          <a
            key={item.id}
            href="#contact"
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className="group block border-b border-line py-8 transition-colors duration-500 hover:bg-surface/60"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
              <span className="label-mono text-muted transition-colors group-hover:text-accent">
                {item.index}
              </span>

              <div className="flex-1">
                <h3 className="text-display text-3xl transition-transform duration-500 group-hover:translate-x-2 lg:text-5xl">
                  {item.name}
                </h3>
                <p className="mt-3 max-w-md text-sm text-muted">{item.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 lg:w-80 lg:justify-end">
                <span className="label-mono text-muted">{item.field}</span>
                <span className="label-mono text-muted">{item.type}</span>
                <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
                  {item.result}
                </span>
              </div>

              <ArrowUpRight className="size-6 shrink-0 text-muted transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
            </div>

            {/* На мобильных превью показываем прямо в строке — курсора там нет. */}
            <div
              className={`mt-5 h-32 rounded-card bg-gradient-to-br ${item.gradient} opacity-80 lg:hidden`}
              aria-hidden="true"
            />
          </a>
        ))}

        {/* Превью, которое следует за курсором. */}
        <AnimatePresence>
          {active && (
            <motion.div
              className="pointer-events-none absolute top-0 left-0 z-20 hidden lg:block"
              style={{ x: springX, y: springY }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className={`flex h-56 w-80 flex-col justify-between rounded-card bg-gradient-to-br p-5 ${active.gradient}`}
              >
                <span className="label-mono text-bg/80">{active.year}</span>
                <div>
                  <p className="font-display text-2xl text-bg">{active.name}</p>
                  <p className="mt-1 text-sm text-bg/80">{active.type}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-sm text-muted">
        Показаны 5 из 40+ проектов. Полное портфолио пришлём в ответ на заявку.
      </p>
    </Section>
  )
}
