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

      <div className="container-page relative flex flex-1 flex-col justify-center py-16 lg:py-10">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Слева — звёздное небо и кнопки. */}
          <div className="order-2 lg:order-1 lg:col-span-4">
            <StarField className="pointer-events-none h-56 w-full sm:h-64 lg:h-72" />

            {/* Колонка стала уже — на десктопе кнопки стоят в столбик во всю её ширину. */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button href="#contact" size="lg" className="w-full sm:w-auto lg:w-full">
                Обсудить проект
              </Button>
              <Button
                href="#portfolio"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto lg:w-full"
              >
                Смотреть работы
              </Button>
            </div>
          </div>

          {/* Справа — заголовок и описание. */}
          {/* @container: кегль считается от ширины колонки, а не окна — иначе длинное
              «выполнение» вылезает за край. Слово стоит на отдельной строке: пока рядом
              с ним было «на», строка стоила на четверть дороже и кегль приходилось резать. */}
          <div className="@container order-1 lg:order-2 lg:col-span-8 lg:text-right">
            <h1 className="text-display text-[clamp(1.75rem,11.9cqw,6.5rem)]">
              Держим
              <br />
              курс на
              <br />
              <PixelWord words={rotatingWords} interval={3000} />
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
