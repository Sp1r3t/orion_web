import { useId, useState } from 'react'

import HatchBackdrop from '@/components/ui/HatchBackdrop'
import Section from '@/components/ui/Section'
import { useContent } from '@/i18n/context'

export default function Faq() {
  const { site, faq, ui } = useContent()
  const answerId = useId()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Section id="faq" index="07" eyebrow={ui.faq.eyebrow} title={ui.faq.title} lead={ui.faq.lead}>
      {/* Диагональная штриховка на фоне секции — под аккордеоном и карточкой. */}
      <HatchBackdrop className="hatch-backdrop" />

      <div className="relative mt-16 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="border-t border-line [overflow-anchor:none]">
            {faq.map((item, index) => {
              const open = openIndex === index

              return (
                <div key={item.question} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    aria-controls={`${answerId}-${index}`}
                    className="group flex w-full items-center gap-6 py-6 text-left"
                  >
                    <span className="flex-1 text-lg transition-colors duration-300 group-hover:text-accent">
                      {item.question}
                    </span>
                    <span
                      className={`relative size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                        open ? 'rotate-45' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <span className="absolute top-1/2 left-0 h-px w-full bg-accent" />
                      <span className="absolute top-0 left-1/2 h-full w-px bg-accent" />
                    </span>
                  </button>

                  <div
                    id={`${answerId}-${index}`}
                    aria-hidden={!open}
                    inert={!open}
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
                      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="max-w-2xl pb-6 text-muted">{item.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-card border border-line bg-surface p-7 lg:sticky lg:top-28">
            <p className="text-lg">{ui.faq.more}</p>
            <p className="mt-3 text-sm text-muted">{ui.faq.moreText}</p>
            <a
              href={site.telegram}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-hover"
            >
              {ui.faq.write}
            </a>
          </div>
        </aside>
      </div>
    </Section>
  )
}
