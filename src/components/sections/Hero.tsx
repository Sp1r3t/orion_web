import Button from '@/components/ui/Button'
import PixelWord from '@/components/ui/PixelWord'
import StarField from '@/components/ui/StarField'
import { site, stats } from '@/content/site'

const rotatingWords = ['создание', 'выполнение', 'креатив']

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-dvh flex-col overflow-hidden pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -left-40 size-[36rem] rounded-full bg-accent/10 blur-[150px]"
      />

      <div className="container-page relative flex flex-1 flex-col justify-center py-16">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Слева — звёздное небо и кнопки. */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <StarField className="pointer-events-none h-56 w-full sm:h-72 lg:h-96" />

            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="#contact" size="lg">
                Обсудить проект
              </Button>
              <Button href="#portfolio" variant="outline" size="lg">
                Смотреть работы
              </Button>
            </div>
            <p className="label-mono mt-5 text-muted">Ответим за час · Оценка бесплатно</p>
          </div>

          {/* Справа — заголовок и описание. */}
          <div className="order-1 lg:order-2 lg:col-span-7 lg:text-right">
            <div className="flex items-center gap-3 lg:justify-end">
              <span
                className="size-1.5 animate-pulse-dot rounded-full bg-accent"
                aria-hidden="true"
              />
              <p className="label-mono text-muted">{site.tagline}</p>
            </div>

            <h1 className="text-display mt-8 text-[clamp(2.5rem,7vw,6.5rem)]">
              Держим курс
              <br />
              <span className="inline-flex items-baseline gap-[0.25em] lg:justify-end">
                на <PixelWord words={rotatingWords} interval={3000} />
              </span>
            </h1>

            <p className="mt-8 text-lg text-muted lg:ml-auto lg:max-w-lg">{site.description}</p>
          </div>
        </div>
      </div>

      {/* Цифры студии — полосой во всю ширину под первым экраном. */}
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
    </section>
  )
}
