import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import Section from '@/components/ui/Section'
import { useEstimate } from '@/context/estimateContext'
import { useCurrency, useMoney } from '@/context/currencyContext'
import { useContent } from '@/i18n/context'
import { formatLead, LeadNotConfiguredError, sendLead, toLeadEstimate } from '@/lib/lead'
import type { LeadPayload } from '@/lib/lead'

/**
 * Выбор в чипах храним номером, а не подписью: при смене языка подписи другие,
 * и отмеченный вариант иначе бы слетал.
 */
const taskIndexByType: Record<string, number> = {
  landing: 0,
  corporate: 1,
  ecommerce: 2,
  product: 3,
}

/** Вилка бюджета подставляется по нижней границе расчёта. */
function budgetIndexByPrice(price: number) {
  if (price < 50_000) return 0
  if (price < 100_000) return 1
  if (price < 300_000) return 2
  return 3
}

const fieldClass =
  'w-full border-b border-line bg-transparent py-3 text-base transition-colors duration-300 placeholder:text-muted/60 focus:border-accent focus:outline-none'

function Chips({
  label,
  items,
  value,
  onChange,
}: {
  label: string
  items: string[]
  value: number | null
  onChange: (next: number | null) => void
}) {
  return (
    <fieldset>
      <legend className="text-display text-base text-text">{label}</legend>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item, index) => {
          const active = value === index
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(active ? null : index)}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
                active
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-line text-muted hover:border-line-strong hover:text-text'
              }`}
            >
              {item}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Расчёт, прикреплённый к заявке кнопкой «Обсудить смету». */
function EstimateCard() {
  const { type, urgency, chosen, totals, setCount } = useEstimate()
  const { ui } = useContent()
  const money = useMoney()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-10 rounded-card border border-accent/30 bg-accent/6 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="label-mono text-accent">{ui.contact.attached}</p>
        <a
          href="#pricing"
          className="label-mono flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
        >
          <Pencil className="size-3" />
          {ui.contact.edit}
        </a>
      </div>

      <p className="text-display mt-4 text-2xl">
        {money.format(totals.min)}
        <span className="text-base font-normal text-muted"> — {money.format(totals.max)}</span>
      </p>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">{ui.contact.projectType}</dt>
          <dd className="sm:mt-1">{type.title}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">{ui.contact.pace}</dt>
          <dd className="sm:mt-1">{urgency.title}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">{ui.contact.term}</dt>
          <dd className="sm:mt-1">
            {totals.weeksMin}–{totals.weeksMax} {ui.contact.weeks}
          </dd>
        </div>
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">{ui.contact.options}</dt>
          <dd className="sm:mt-1">{chosen.length === 0 ? ui.contact.noOptions : chosen.length}</dd>
        </div>
      </dl>

      {chosen.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2 border-t border-accent/20 pt-5">
          {chosen.map(({ option, count }) => (
            <li
              key={option.id}
              className="flex items-center gap-1 rounded-full border border-line py-1 pr-1 pl-3 text-xs text-muted transition-colors hover:border-accent/50"
            >
              <span>
                {option.title}
                {count > 1 && <span className="text-accent"> ×{count}</span>}
              </span>
              <button
                type="button"
                onClick={() => setCount(option.id, () => 0)}
                aria-label={`${ui.pricing.remove} ${option.title}`}
                className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-accent/15 hover:text-accent"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

export default function Contact() {
  const estimate = useEstimate()
  const { attached, type, totals } = estimate
  const { site, ui } = useContent()
  const { currency } = useCurrency()
  const money = useMoney()

  const [taskChoice, setTaskChoice] = useState<number | null>(null)
  const [budgetChoice, setBudgetChoice] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [notConfigured, setNotConfigured] = useState(false)
  const [leadText, setLeadText] = useState('')
  const [copied, setCopied] = useState(false)

  // Пока посетитель не выбрал вручную, поля берутся из калькулятора и следуют за ним.
  const taskIndex = taskChoice ?? (attached ? (taskIndexByType[type.id] ?? null) : null)
  const budgetIndex = budgetChoice ?? (attached ? budgetIndexByPrice(totals.min) : null)

  const task = taskIndex === null ? '' : ui.contact.taskChips[taskIndex]
  const budget = budgetIndex === null ? '' : ui.contact.budgetChips[budgetIndex]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    const payload: LeadPayload = {
      name: String(data.get('name') ?? ''),
      contact: String(data.get('contact') ?? ''),
      task,
      budget,
      message: String(data.get('message') ?? ''),
      estimate: attached ? toLeadEstimate(estimate, currency.code) : null,
      page: window.location.href,
      sentAt: new Date().toISOString(),
    }

    setStatus('sending')
    try {
      await sendLead(payload)
      setStatus('sent')
    } catch (error) {
      // Заявку не теряем: показываем её текстом, чтобы человек мог отправить в Telegram.
      setLeadText(formatLead(payload, ui.leadMail, ui.locale, money.format))
      setNotConfigured(error instanceof LeadNotConfiguredError)
      setStatus('error')
    }
  }

  async function copyLead() {
    try {
      await navigator.clipboard.writeText(leadText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Section
      id="contact"
      index="08"
      eyebrow={ui.contact.eyebrow}
      title={
        <>
          {ui.contact.title[0]}
          <br />
          {ui.contact.title[1]}
        </>
      }
      lead={ui.contact.lead}
    >
      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-6">
            <a
              href={`mailto:${site.email}`}
              className="text-display text-2xl text-accent transition-colors hover:text-text"
            >
              {site.email}
            </a>
            <a
              href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
              className="text-display text-2xl text-accent transition-colors hover:text-text"
            >
              {site.phone}
            </a>
            <a
              href={site.telegram}
              target="_blank"
              rel="noreferrer noopener"
              className="text-display text-2xl text-accent transition-colors hover:text-text"
            >
              Telegram
            </a>
            <p className="label-mono mt-4 text-muted">{site.city}</p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <AnimatePresence>{attached && status !== 'sent' && <EstimateCard />}</AnimatePresence>

          {status === 'sent' ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-card border border-accent/40 bg-accent/8 p-10"
            >
              <p className="text-display text-3xl text-ember">{ui.contact.sentTitle}</p>
              <p className="mt-4 max-w-md text-muted">{ui.contact.sentText}</p>
              <button
                type="button"
                onClick={() => {
                  setTaskChoice(null)
                  setBudgetChoice(null)
                  setStatus('idle')
                }}
                className="label-mono mt-8 text-muted transition-colors hover:text-accent"
              >
                {ui.contact.again}
              </button>
            </motion.div>
          ) : status === 'error' ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-card border border-line bg-surface p-8"
            >
              <p className="text-display text-2xl">
                {notConfigured ? ui.contact.notConfigured : ui.contact.failed}
              </p>
              <p className="mt-4 max-w-lg text-sm text-muted">
                {notConfigured ? ui.contact.notConfiguredText : ui.contact.failedText}
              </p>

              <pre className="mt-6 max-h-56 overflow-auto rounded-card border border-line bg-bg p-4 text-xs whitespace-pre-wrap text-muted">
                {leadText}
              </pre>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyLead}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm transition-colors hover:border-accent hover:text-accent"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? ui.contact.copied : ui.contact.copy}
                </button>
                <a
                  href={site.telegram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
                >
                  {ui.contact.openTelegram}
                </a>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="label-mono text-muted transition-colors hover:text-accent"
                >
                  {ui.contact.back}
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="grid gap-8 sm:grid-cols-2">
                <label className="block">
                  <span className="text-display text-base text-text">{ui.contact.name}</span>
                  <input
                    name="name"
                    required
                    placeholder={ui.contact.namePlaceholder}
                    className={`${fieldClass} mt-3`}
                  />
                </label>
                <label className="block">
                  <span className="text-display text-base text-text">{ui.contact.contact}</span>
                  <input
                    name="contact"
                    required
                    placeholder={ui.contact.contactPlaceholder}
                    className={`${fieldClass} mt-3`}
                  />
                </label>
              </div>

              <Chips
                label={ui.contact.need}
                items={ui.contact.taskChips}
                value={taskIndex}
                onChange={setTaskChoice}
              />
              <Chips
                label={ui.contact.budget}
                items={ui.contact.budgetChips}
                value={budgetIndex}
                onChange={setBudgetChoice}
              />

              <label className="block">
                <span className="text-display text-base text-text">{ui.contact.about}</span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder={ui.contact.aboutPlaceholder}
                  className={`${fieldClass} mt-3 resize-none`}
                />
              </label>

              <label className="flex items-start gap-3 text-xs text-muted">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 size-4 shrink-0 accent-[#ff6a00]"
                />
                {ui.contact.consent}
              </label>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-accent px-10 text-base font-medium text-bg transition-all duration-300 hover:bg-accent-hover hover:shadow-glow disabled:opacity-60 sm:self-start"
              >
                {status === 'sending' ? ui.contact.sending : ui.contact.submit}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </Section>
  )
}
