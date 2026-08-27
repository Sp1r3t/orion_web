import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'

import Button from '@/components/ui/Button'
import Section from '@/components/ui/Section'
import { pricingOptions, projectTypes } from '@/content/pricing'

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

export default function Pricing() {
  const [typeId, setTypeId] = useState(projectTypes[0].id)
  const [selected, setSelected] = useState<string[]>([])

  const type = projectTypes.find((item) => item.id === typeId) ?? projectTypes[0]

  const estimate = useMemo(() => {
    const options = pricingOptions.filter((option) => selected.includes(option.id))
    const extraPrice = options.reduce((sum, option) => sum + option.price, 0)
    const extraWeeks = options.reduce((sum, option) => sum + option.weeks, 0)

    return {
      min: type.base + extraPrice,
      max: Math.round((type.base * type.spread + extraPrice) / 1000) * 1000,
      weeksMin: Math.round(type.weeks[0] + extraWeeks),
      weeksMax: Math.round(type.weeks[1] + extraWeeks),
    }
  }, [type, selected])

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <Section
      id="pricing"
      index="04"
      eyebrow="Тарифы"
      title={<>Соберите смету за минуту</>}
      lead="Выберите тип проекта и то, что нужно добавить. Калькулятор покажет вилку и срок — точную цену зафиксируем в договоре после брифа."
    >
      <div className="mt-16 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label-mono text-muted">Шаг 1 — тип проекта</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {projectTypes.map((item) => {
              const active = item.id === typeId
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTypeId(item.id)}
                  aria-pressed={active}
                  className={`rounded-card border p-5 text-left transition-all duration-300 ${
                    active
                      ? 'border-accent bg-accent/8'
                      : 'border-line bg-surface hover:border-line-strong'
                  }`}
                >
                  <span className={`block font-medium ${active ? 'text-accent' : ''}`}>
                    {item.title}
                  </span>
                  <span className="mt-2 block text-sm text-muted">{item.hint}</span>
                  <span className="label-mono mt-4 block text-muted">
                    от {money.format(item.base)}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="label-mono mt-12 text-muted">Шаг 2 — что добавить</p>
          <div className="mt-5 border-t border-line">
            {pricingOptions.map((option) => {
              const active = selected.includes(option.id)
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggle(option.id)}
                  aria-pressed={active}
                  className="group flex w-full items-center gap-4 border-b border-line py-4 text-left"
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors duration-300 ${
                      active
                        ? 'border-accent bg-accent text-bg'
                        : 'border-line-strong text-transparent group-hover:border-accent'
                    }`}
                  >
                    <Check className="size-3.5" />
                  </span>

                  <span className="flex-1">
                    <span className="block text-sm">{option.title}</span>
                    <span className="block text-xs text-muted">{option.hint}</span>
                  </span>

                  <span className={`label-mono ${active ? 'text-accent' : 'text-muted'}`}>
                    +{money.format(option.price)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-card border border-line bg-surface p-8 lg:sticky lg:top-28">
            <p className="label-mono text-muted">Ориентировочная стоимость</p>

            <motion.p
              key={estimate.min + estimate.max}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-display mt-4 text-4xl lg:text-5xl"
            >
              {money.format(estimate.min)}
            </motion.p>
            <p className="mt-2 text-muted">до {money.format(estimate.max)}</p>

            <div className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted">Тип проекта</span>
                <span className="text-right">{type.title}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Срок</span>
                <span className="text-right">
                  {estimate.weeksMin}–{estimate.weeksMax} недель
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Опции</span>
                <span className="text-right">
                  {selected.length === 0 ? 'без дополнений' : `${selected.length} шт.`}
                </span>
              </div>
            </div>

            <Button href="#contact" size="lg" className="mt-8 w-full">
              Обсудить смету
            </Button>

            <p className="mt-4 text-xs text-muted">
              Расчёт ориентировочный и не является офертой. После брифа назовём точную цену и
              зафиксируем её в договоре.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
