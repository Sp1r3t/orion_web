import { useEffect, useState } from 'react'

import Button from '@/components/ui/Button'
import Marquee from '@/components/ui/Marquee'
import { site } from '@/content/site'

const rotatingWords = ['сайты', 'лендинги', 'магазины', 'сервисы']

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((index) => (index + 1) % rotatingWords.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const word = rotatingWords[wordIndex]

  return (
    <section id="top" className="relative flex min-h-dvh flex-col overflow-hidden pt-20">
      {/* Оранжевое свечение за заголовком */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-accent/12 blur-[140px]"
      />

      <div className="container-page relative flex flex-1 flex-col justify-center py-16">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">{site.tagline}</p>

        <h1 className="text-display mt-8 text-[clamp(3rem,12vw,11rem)]">
          <span className="block">Создаём</span>
          <span key={word} className="block text-accent">
            {word.split('').map((char, index) => (
              <span
                key={`${word}-${index}`}
                className="inline-block animate-[fade-up_0.5s_both]"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>

        <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-xl text-lg text-muted">{site.description}</p>
          <div className="flex flex-wrap gap-4">
            <Button href="#contact" size="lg">
              Обсудить проект
            </Button>
            <Button href="#portfolio" variant="outline" size="lg">
              Наши работы
            </Button>
          </div>
        </div>
      </div>

      <div className="relative border-t border-line py-4">
        <Marquee
          items={[
            `${site.name} © 2026`,
            'Принимаем заказы',
            'Дизайн под ключ',
            'Работаем по всей России',
          ]}
        />
      </div>
    </section>
  )
}
