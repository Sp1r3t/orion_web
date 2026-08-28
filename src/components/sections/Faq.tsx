import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import Section from '@/components/ui/Section'
import { faq } from '@/content/reviews'
import { site } from '@/content/site'

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Section
      id="faq"
      index="07"
      eyebrow="Вопросы"
      title={<>Отвечаем заранее</>}
      lead="Если вопроса здесь нет — напишите в Telegram, ответим за час."
    >
      {/* Диагональная штриховка на фоне секции — под аккордеоном и карточкой. */}
      <div aria-hidden="true" className="hatch-backdrop pointer-events-none absolute inset-0" />

      <div className="relative mt-16 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="border-t border-line">
            {faq.map((item, index) => {
              const open = openIndex === index

              return (
                <div key={item.question} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    className="group flex w-full items-center gap-6 py-6 text-left"
                  >
                    <span className="flex-1 text-lg transition-colors duration-300 group-hover:text-accent">
                      {item.question}
                    </span>
                    <span
                      className={`relative size-4 shrink-0 transition-transform duration-500 ${
                        open ? 'rotate-45' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <span className="absolute top-1/2 left-0 h-px w-full bg-accent" />
                      <span className="absolute top-0 left-1/2 h-full w-px bg-accent" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 text-muted">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-card border border-line bg-surface p-7 lg:sticky lg:top-28">
            <p className="text-lg">Остались вопросы?</p>
            <p className="mt-3 text-sm text-muted">
              Напишите в Telegram — разберём задачу без формальностей и скажем, во сколько она
              обойдётся.
            </p>
            <a
              href={site.telegram}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-hover"
            >
              Написать в Telegram →
            </a>
          </div>
        </aside>
      </div>
    </Section>
  )
}
