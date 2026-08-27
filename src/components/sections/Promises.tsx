import Reveal from '@/components/ui/Reveal'
import Section from '@/components/ui/Section'
import { promises } from '@/content/process'

/** Bento-сетка: плитки разного размера вместо ряда одинаковых карточек. */
export default function Promises() {
  return (
    <Section
      id="promises"
      index="05"
      eyebrow="Гарантии"
      title={<>Условия, а не обещания</>}
      lead="Каждый пункт ниже зафиксирован в договоре — его можно с нас спросить."
    >
      <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promises.map((item, index) => (
          <Reveal
            key={item.title}
            delay={index * 0.05}
            className={item.wide ? 'lg:col-span-2' : undefined}
          >
            <article className="group relative h-full overflow-hidden rounded-card border border-line bg-surface p-7 transition-colors duration-500 hover:border-accent/40">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-accent/0 blur-3xl transition-colors duration-700 group-hover:bg-accent/15"
              />
              {item.metric && (
                <p className="text-display mb-4 text-5xl text-ember">{item.metric}</p>
              )}
              <h3 className="relative text-lg font-medium">{item.title}</h3>
              <p className="relative mt-3 text-sm text-muted">{item.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
