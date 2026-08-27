import { ArrowDown } from 'lucide-react'

import Button from '@/components/ui/Button'
import StarField from '@/components/ui/StarField'
import { site, stats } from '@/content/site'

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-dvh flex-col overflow-hidden pt-20">
      {/* Правая половина: звёздное поле с созвездием Ориона. */}
      <StarField className="pointer-events-none absolute top-0 right-0 h-full w-full opacity-70 lg:w-[55%]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -left-40 size-[36rem] rounded-full bg-accent/10 blur-[150px]"
      />

      <div className="container-page relative flex flex-1 flex-col justify-center py-16">
        <div className="flex items-center gap-3">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" aria-hidden="true" />
          <p className="label-mono text-muted">
            {site.tagline} · {site.city}
          </p>
        </div>

        <h1 className="text-display mt-10 max-w-5xl text-[clamp(2.75rem,9vw,8rem)]">
          Держим курс
          <br />
          <span className="text-ember">на заявки</span>
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
          <p className="max-w-lg text-lg text-muted lg:col-span-6">{site.description}</p>

          <div className="flex flex-col gap-4 lg:col-span-6 lg:items-end">
            <div className="flex flex-wrap gap-3">
              <Button href="#contact" size="lg">
                Обсудить проект
              </Button>
              <Button href="#portfolio" variant="outline" size="lg">
                Смотреть работы
              </Button>
            </div>
            <p className="label-mono text-muted">Ответим за час · Оценка бесплатно</p>
          </div>
        </div>
      </div>

      {/* Цифры студии — вместо привычной бегущей строки под первым экраном. */}
      <div className="relative border-t border-line">
        <div className="container-page grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {stats.map((stat, index) => (
            <div
              key={stat.caption}
              className={`flex flex-col gap-1 py-6 lg:px-8 ${index === 0 ? 'lg:pl-0' : ''}`}
            >
              <p className="font-display text-3xl leading-none">
                {stat.value}
                <span className="ml-2 text-sm font-normal text-muted">{stat.unit}</span>
              </p>
              <p className="text-sm text-muted">{stat.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#solutions"
        className="absolute bottom-40 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-muted transition-colors hover:text-accent lg:flex"
        aria-label="К разделу «Решения»"
      >
        <ArrowDown className="size-4" />
        <span className="label-mono">Листайте</span>
      </a>
    </section>
  )
}
