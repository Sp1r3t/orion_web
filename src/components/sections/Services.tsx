import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import Section from '@/components/ui/Section'
import { useMoney } from '@/context/currencyContext'
import { useContent } from '@/i18n/context'

export default function Services() {
  const { services, ui } = useContent()
  // Цены услуг идут через тот же форматтер, что и смета: в английской версии
  // они по умолчанию в долларах, в русской — в рублях, и следуют за выбором валюты.
  const money = useMoney()
  const [openId, setOpenId] = useState<string | null>(services[0].id)

  return (
    <Section
      id="solutions"
      index="01"
      eyebrow={ui.services.eyebrow}
      title={ui.services.title}
      lead={ui.services.lead}
    >
      <div className="mt-16 border-t border-line">
        {services.map((service) => {
          const open = openId === service.id

          return (
            <div key={service.id} className="border-b border-line">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : service.id)}
                aria-expanded={open}
                className="group flex w-full items-center gap-6 py-7 text-left transition-colors duration-300"
              >
                <span
                  className={`label-mono transition-colors duration-300 ${
                    open ? 'text-accent' : 'text-muted group-hover:text-accent'
                  }`}
                >
                  {service.index}
                </span>

                <span className="flex-1">
                  <span
                    className={`text-display block text-2xl transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl ${
                      open ? 'text-accent' : ''
                    }`}
                  >
                    {service.title}
                  </span>
                  <span className="mt-2 block text-sm text-muted lg:hidden">{service.summary}</span>
                </span>

                <span className="hidden max-w-xs flex-1 text-sm text-muted lg:block">
                  {service.summary}
                </span>

                <span className="label-mono hidden text-text sm:block">
                  {ui.pricing.from} {money.format(service.priceFrom)}
                </span>

                <Plus
                  className={`size-5 shrink-0 text-muted transition-transform duration-500 group-hover:text-accent ${
                    open ? 'rotate-45 text-accent' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-8 pb-10 lg:grid-cols-12">
                      <p className="text-muted lg:col-span-6 lg:col-start-2">{service.details}</p>

                      <div className="lg:col-span-5">
                        <ul className="flex flex-wrap gap-2">
                          {service.deliverables.map((item) => (
                            <li
                              key={item}
                              className="rounded-full border border-line px-3 py-1.5 text-xs text-muted"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                        <p className="label-mono mt-5 text-muted">
                          {ui.services.term} <span className="text-text">{service.term}</span>
                          <span className="mx-3 text-line-strong">/</span>
                          <span className="text-text sm:hidden">
                            {ui.pricing.from} {money.format(service.priceFrom)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
