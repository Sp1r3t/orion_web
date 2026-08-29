import { AnimatePresence, motion } from 'framer-motion'
import {
  Boxes,
  Building2,
  Check,
  ChevronDown,
  Layers,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import type { ComponentType, MouseEvent } from 'react'

import Button from '@/components/ui/Button'
import CurrencyPicker from '@/components/ui/CurrencyPicker'
import InfoTip from '@/components/ui/InfoTip'
import Section from '@/components/ui/Section'
import type { PricingOption } from '@/content/pricing'
import { useEstimate } from '@/context/estimateContext'
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber'
import { useMoney } from '@/context/currencyContext'
import { useContent } from '@/i18n/context'

const typeIcons: Record<string, ComponentType<{ className?: string }>> = {
  landing: Layers,
  corporate: Building2,
  shop: ShoppingBag,
  product: Boxes,
}

/** Подсветка под курсором на карточке типа проекта. */
function spotlight(event: MouseEvent<HTMLElement>) {
  const bounds = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--x', `${event.clientX - bounds.left}px`)
  event.currentTarget.style.setProperty('--y', `${event.clientY - bounds.top}px`)
}

function OptionRow({
  option,
  count,
  onChange,
}: {
  option: PricingOption
  count: number
  onChange: (update: (current: number) => number) => void
}) {
  const { ui } = useContent()
  const money = useMoney()
  const active = count > 0
  const quantity = option.quantity

  return (
    <div
      className={`group flex items-center gap-4 border-b border-line py-4 transition-colors duration-300 ${
        active ? 'bg-accent/4' : ''
      }`}
    >
      {quantity ? (
        <div className="flex flex-1 items-center gap-4">
          <span className="flex flex-1 flex-col">
            <span className="flex items-center gap-2 text-sm">
              {option.title}
              <InfoTip label={option.title} text={option.explain} />
            </span>
            <span className="mt-0.5 text-xs text-muted">{option.hint}</span>
          </span>

          <div className="flex items-center gap-1 rounded-full border border-line p-1">
            <button
              type="button"
              onClick={() => onChange((current) => Math.max(0, current - 1))}
              disabled={count === 0}
              aria-label={`${ui.pricing.remove} ${option.title.toLowerCase()}`}
              className="flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
            >
              <Minus className="size-3.5" />
            </button>
            <span
              className={`label-mono w-6 text-center ${active ? 'text-accent' : 'text-muted'}`}
              aria-live="polite"
            >
              {count}
            </span>
            <button
              type="button"
              onClick={() => onChange((current) => Math.min(quantity.max, current + 1))}
              disabled={count >= quantity.max}
              aria-label={`${ui.pricing.add} ${option.title.toLowerCase()}`}
              className="flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onChange((current) => (current > 0 ? 0 : 1))}
            aria-pressed={active}
            className="flex flex-1 items-center gap-4 text-left"
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded border transition-all duration-300 ${
                active
                  ? 'border-accent bg-accent text-bg'
                  : 'border-line-strong text-transparent group-hover:border-accent'
              }`}
            >
              <Check className="size-3.5" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm">{option.title}</span>
              <span className="mt-0.5 text-xs text-muted">{option.hint}</span>
            </span>
          </button>
          <InfoTip label={option.title} text={option.explain} />
        </>
      )}

      <span
        className={`label-mono w-28 shrink-0 text-right ${active ? 'text-accent' : 'text-muted'}`}
      >
        {quantity
          ? active
            ? money.format(option.price * count)
            : `${money.format(option.price)}/${quantity.unit}`
          : `+${money.format(option.price)}`}
      </span>
    </div>
  )
}

export default function Pricing() {
  const {
    type,
    urgency,
    counts,
    chosen,
    totals,
    setTypeId,
    setUrgencyId,
    setCount,
    resetCounts,
    attach,
    openEnded,
  } = useEstimate()
  const { optionGroups, pricingOptions, projectTypes, urgencyModes, ui } = useContent()
  const money = useMoney()

  // Шаги «темп» и «опции» раскрываются по кнопке: сразу они перегружают экран.
  const [expanded, setExpanded] = useState(false)
  // Пока едет разворот высоты, содержимое подрезается. После разворота подрезку
  // снимаем, иначе всплывающие подсказки обрезаются краем блока.
  const [revealed, setRevealed] = useState(false)

  const typeId = type.id
  const urgencyId = urgency.id
  const animatedMin = useAnimatedNumber(totals.min)

  return (
    <Section
      id="pricing"
      index="04"
      eyebrow={ui.pricing.eyebrow}
      title={ui.pricing.title}
      lead={ui.pricing.lead}
      // overflow-clip, а не hidden: hidden создаёт контейнер прокрутки и ломает
      // прилипание номера раздела и панели сметы.
      className="overflow-clip"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-40 size-[40rem] rounded-full bg-accent/8 blur-[160px]"
      />

      <div className="relative mt-16 grid gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-14 lg:col-span-7">
          <div>
            <p className="label-mono text-muted">{ui.pricing.stepType}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {projectTypes.map((item) => {
                const active = item.id === typeId
                const Icon = typeIcons[item.icon]

                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseMove={spotlight}
                    onClick={() => setTypeId(item.id)}
                    aria-pressed={active}
                    className={`group relative overflow-hidden rounded-card border p-5 text-left transition-all duration-300 ${
                      active
                        ? 'border-accent bg-accent/8'
                        : 'border-line bg-surface hover:border-line-strong'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          'radial-gradient(220px circle at var(--x) var(--y), rgba(255,106,0,0.16), transparent 70%)',
                      }}
                    />

                    <span className="relative flex items-start justify-between gap-3">
                      <span
                        className={`flex size-10 items-center justify-center rounded-full border transition-colors duration-300 ${
                          active
                            ? 'border-accent bg-accent text-bg'
                            : 'border-line text-muted group-hover:text-accent'
                        }`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="label-mono text-muted">
                        {ui.pricing.from} {money.format(item.base)}
                      </span>
                    </span>

                    <span
                      className={`relative mt-5 block font-medium ${active ? 'text-accent' : ''}`}
                    >
                      {item.title}
                    </span>
                    <span className="relative mt-1 block text-sm text-muted">{item.hint}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="label-mono text-muted">{ui.pricing.includes}</span>
              {type.includes.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => setRevealed(true)}
                className={`flex flex-col gap-14 ${revealed ? '' : 'overflow-hidden'}`}
              >
                <div>
                  <p className="label-mono text-muted">{ui.pricing.stepPace}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {urgencyModes.map((mode) => {
                      const active = mode.id === urgencyId
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setUrgencyId(mode.id)}
                          aria-pressed={active}
                          className={`relative overflow-hidden rounded-card border p-5 text-left transition-all duration-300 ${
                            active
                              ? 'border-accent bg-accent/8'
                              : 'border-line bg-surface hover:border-line-strong'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="urgency-active"
                              className="pointer-events-none absolute inset-0 rounded-card border border-accent"
                              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                            />
                          )}
                          <span className="relative flex items-center gap-2">
                            {mode.id === 'fast' && <Zap className="size-4 text-accent" />}
                            <span className={`font-medium ${active ? 'text-accent' : ''}`}>
                              {mode.title}
                            </span>
                          </span>
                          <span className="relative mt-1 block text-sm text-muted">
                            {mode.hint}
                          </span>
                          {mode.priceFactor > 1 && (
                            <span className="label-mono relative mt-3 block text-muted">
                              +{Math.round((mode.priceFactor - 1) * 100)}% {ui.pricing.rushNote}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p className="label-mono text-muted">{ui.pricing.stepOptions}</p>

                  <div className="mt-5 flex flex-col gap-10">
                    {optionGroups.map((group) => (
                      <div key={group}>
                        <p className="label-mono text-accent/70">{group}</p>
                        <div className="mt-3 border-t border-line">
                          {pricingOptions
                            .filter((option) => option.group === group)
                            .map((option) => (
                              <OptionRow
                                key={option.id}
                                option={option}
                                count={counts[option.id] ?? 0}
                                onChange={(update) => setCount(option.id, update)}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!expanded && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setExpanded(true)
                  // Страховка на случай, если анимация не доиграет.
                  window.setTimeout(() => setRevealed(true), 700)
                }}
                className="inline-flex h-13 animate-breathe items-center gap-3 rounded-full bg-accent px-8 text-base font-medium text-bg shadow-glow transition-colors duration-300 hover:bg-accent-hover"
              >
                {ui.pricing.showMore}
                <ChevronDown className="size-5" />
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-card bg-gradient-to-b from-accent/50 via-line to-line p-px lg:sticky lg:top-28">
            <div className="rounded-card bg-surface p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="label-mono text-muted">{ui.pricing.estimate}</p>
                  {urgency.priceFactor > 1 && (
                    <span className="label-mono flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">
                      <Zap className="size-3" />
                      {ui.pricing.rush}
                    </span>
                  )}
                </div>

                {/* Валюта сметы: пересчёт идёт по живому курсу. */}
                <CurrencyPicker />
              </div>

              <p className="text-display mt-5 text-4xl lg:text-5xl">
                {openEnded && (
                  <span className="text-2xl font-normal text-muted">{ui.pricing.from} </span>
                )}
                {money.format(animatedMin)}
              </p>
              {!openEnded && (
                <p className="mt-2 text-muted">
                  {ui.pricing.upTo} {money.format(totals.max)}
                </p>
              )}

              <div className="my-7 border-t border-dashed border-line-strong" />

              <ul className="flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1 text-sm">
                <li className="flex justify-between gap-4">
                  <span className="text-muted">{type.title}</span>
                  <span className="label-mono shrink-0">{money.format(type.base)}</span>
                </li>

                <AnimatePresence initial={false}>
                  {chosen.map(({ option, count }) => {
                    return (
                      <motion.li
                        key={option.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="flex justify-between gap-4 overflow-hidden"
                      >
                        <span className="text-muted">
                          {option.title}
                          {option.quantity && count > 1 && (
                            <span className="text-accent"> × {count}</span>
                          )}
                        </span>
                        <span className="label-mono shrink-0">
                          {money.format(option.price * count)}
                        </span>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>

                {urgency.priceFactor > 1 && (
                  <li className="flex justify-between gap-4 text-accent">
                    <span>
                      {ui.pricing.surcharge} +{Math.round((urgency.priceFactor - 1) * 100)}%
                    </span>
                    <span className="label-mono shrink-0">{money.format(totals.surcharge)}</span>
                  </li>
                )}
              </ul>

              <div className="mt-7 space-y-3 border-t border-line pt-6 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted">{ui.pricing.term}</span>
                  <span>
                    {totals.weeksMin}–{totals.weeksMax} {ui.pricing.weeks}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">{ui.pricing.chosen}</span>
                  <span>{chosen.length === 0 ? ui.pricing.none : chosen.length}</span>
                </div>
              </div>

              {/* Клик прикрепляет расчёт к форме — она покажет его и отправит вместе с контактами. */}
              <Button href="#contact" size="lg" className="mt-8 w-full" onClick={attach}>
                {ui.pricing.discuss}
              </Button>

              {chosen.length > 0 && (
                <button
                  type="button"
                  onClick={resetCounts}
                  className="label-mono mt-4 w-full text-muted transition-colors hover:text-accent"
                >
                  {ui.pricing.reset}
                </button>
              )}

              <p className="mt-6 text-xs text-muted">{ui.pricing.disclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
