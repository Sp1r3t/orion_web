import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

import Reveal from '@/components/ui/Reveal'
import Section from '@/components/ui/Section'
import { processSteps } from '@/content/process'

export default function Process() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 70%', 'end 70%'],
  })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <Section
      id="process"
      index="03"
      eyebrow="Процесс"
      title={
        <>
          Четыре этапа
          <br />
          без сюрпризов
        </>
      }
      lead="Вы всегда знаете, на каком шаге проект и что происходит дальше. Рабочая ссылка появляется на третьем этапе, а не в конце."
    >
      <div ref={trackRef} className="relative mt-16 pl-10 lg:pl-16">
        {/* Линия, которая заполняется по мере прокрутки. */}
        <div className="absolute top-2 bottom-2 left-0 w-px bg-line lg:left-3">
          <motion.div
            style={{ scaleY }}
            className="h-full w-px origin-top bg-gradient-to-b from-accent to-ember"
          />
        </div>

        <div className="flex flex-col gap-16">
          {processSteps.map((step, index) => (
            <Reveal key={step.index} delay={index * 0.05} className="relative">
              <span
                className="absolute top-2 -left-10 size-2.5 rounded-full border border-accent bg-bg lg:-left-[3.6rem]"
                aria-hidden="true"
              />

              <div className="flex flex-wrap items-baseline gap-4">
                <span className="label-mono text-accent">{step.index}</span>
                <h3 className="text-display text-2xl lg:text-3xl">{step.title}</h3>
                <span className="label-mono rounded-full border border-line px-3 py-1 text-muted">
                  {step.duration}
                </span>
              </div>

              <p className="mt-5 max-w-2xl text-muted">{step.text}</p>

              <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
                {step.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-text">
                    <span className="size-1 rounded-full bg-accent" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
