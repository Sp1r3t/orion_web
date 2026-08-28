import Button from '@/components/ui/Button'
import PixelWord from '@/components/ui/PixelWord'
import SpaceField from '@/components/ui/SpaceField'
import { useContent } from '@/i18n/context'

export default function Hero() {
  const { site, stats, ui } = useContent()

  return (
    <section
      id="top"
      className="relative flex min-h-dvh flex-col overflow-hidden bg-bg pt-20 text-text"
    >
      {/* Космос занимает весь первый экран и живёт под контентом — границы не видно. */}
      <SpaceField />

      <div className="container-page relative z-10 flex flex-1 flex-col justify-center py-12 lg:py-8">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Справа — заголовок и описание. Слева пусто: там живёт созвездие. */}
          {/* @container: кегль считается от ширины колонки, а не окна — иначе длинное
              «выполнение» вылезает за край. Слово стоит на отдельной строке: пока рядом
              с ним было «на», строка стоила на четверть дороже и кегль приходилось резать. */}
          <div className="@container lg:col-span-8 lg:col-start-5 lg:text-right">
            <h1 className="text-display text-[clamp(1.75rem,min(11.9cqw,12vh),6.5rem)]">
              {ui.hero.lineOne}
              <br />
              {ui.hero.lineTwo}
              <br />
              <PixelWord key={ui.hero.words.join()} words={ui.hero.words} interval={3000} />
            </h1>

            <p className="mt-8 text-base text-muted lg:ml-auto lg:max-w-2xl lg:text-lg">
              {site.description}
            </p>
          </div>
        </div>

        {/* Кнопки прижаты к низу экрана — созвездие остаётся выше них. */}
        <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row">
          <Button href="#contact" size="lg" className="w-full sm:w-auto">
            {ui.hero.cta}
          </Button>
          <Button href="#portfolio" variant="outline" size="lg" className="w-full sm:w-auto">
            {ui.hero.portfolio}
          </Button>
        </div>
      </div>

      {/* Цифры студии — полосой во всю ширину под первым экраном. */}
      <div className="relative z-10 border-t border-line bg-bg/40 backdrop-blur-sm">
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
