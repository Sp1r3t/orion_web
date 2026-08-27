import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Pencil } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import Section from '@/components/ui/Section'
import { site } from '@/content/site'
import { useEstimate } from '@/context/estimateContext'
import { formatLead, LeadNotConfiguredError, sendLead, toLeadEstimate } from '@/lib/lead'
import type { LeadPayload } from '@/lib/lead'

const taskChips = [
  'Лендинг',
  'Корпоративный сайт',
  'Магазин',
  'Веб-сервис',
  'Редизайн',
  'Ещё не решил',
]
const budgetChips = ['до 50 000 ₽', '50–100 000 ₽', '100–300 000 ₽', 'больше 300 000 ₽', 'не знаю']

/** Тип проекта из калькулятора → готовый вариант в форме. */
const taskByType: Record<string, string> = {
  landing: 'Лендинг',
  corporate: 'Корпоративный сайт',
  ecommerce: 'Магазин',
  product: 'Веб-сервис',
}

function budgetByPrice(price: number) {
  if (price < 50_000) return budgetChips[0]
  if (price < 100_000) return budgetChips[1]
  if (price < 300_000) return budgetChips[2]
  return budgetChips[3]
}

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

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
  value: string
  onChange: (next: string) => void
}) {
  return (
    <fieldset>
      <legend className="label-mono text-muted">{label}</legend>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => {
          const active = value === item
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(active ? '' : item)}
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
  const { type, urgency, chosen, totals } = useEstimate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-10 rounded-card border border-accent/30 bg-accent/6 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="label-mono text-accent">Ваш расчёт — отправим вместе с заявкой</p>
        <a
          href="#pricing"
          className="label-mono flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
        >
          <Pencil className="size-3" />
          изменить
        </a>
      </div>

      <p className="text-display mt-4 text-2xl">
        {money.format(totals.min)}
        <span className="text-base font-normal text-muted"> — {money.format(totals.max)}</span>
      </p>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">Тип проекта</dt>
          <dd className="sm:mt-1">{type.title}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">Темп</dt>
          <dd className="sm:mt-1">{urgency.title}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">Срок</dt>
          <dd className="sm:mt-1">
            {totals.weeksMin}–{totals.weeksMax} недель
          </dd>
        </div>
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">Опций</dt>
          <dd className="sm:mt-1">{chosen.length === 0 ? 'без дополнений' : chosen.length}</dd>
        </div>
      </dl>

      {chosen.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2 border-t border-accent/20 pt-5">
          {chosen.map(({ option, count }) => (
            <li
              key={option.id}
              className="rounded-full border border-line px-3 py-1 text-xs text-muted"
            >
              {option.title}
              {count > 1 && <span className="text-accent"> ×{count}</span>}
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

  const [taskChoice, setTaskChoice] = useState<string | null>(null)
  const [budgetChoice, setBudgetChoice] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [notConfigured, setNotConfigured] = useState(false)
  const [leadText, setLeadText] = useState('')
  const [copied, setCopied] = useState(false)

  // Пока посетитель не выбрал вручную, поля берутся из калькулятора и следуют за ним.
  const task = taskChoice ?? (attached ? (taskByType[type.id] ?? '') : '')
  const budget = budgetChoice ?? (attached ? budgetByPrice(totals.min) : '')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    const payload: LeadPayload = {
      name: String(data.get('name') ?? ''),
      contact: String(data.get('contact') ?? ''),
      task,
      budget,
      message: String(data.get('message') ?? ''),
      estimate: attached ? toLeadEstimate(estimate) : null,
      page: window.location.href,
      sentAt: new Date().toISOString(),
    }

    setStatus('sending')
    try {
      await sendLead(payload)
      setStatus('sent')
    } catch (error) {
      // Заявку не теряем: показываем её текстом, чтобы человек мог отправить в Telegram.
      setLeadText(formatLead(payload))
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
      eyebrow="Контакты"
      title={
        <>
          Расскажите
          <br />о проекте
        </>
      }
      lead="Ответим в течение часа в рабочее время, предложим решение и назовём вилку по цене и срокам."
    >
      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-6">
            <a
              href={`mailto:${site.email}`}
              className="text-display text-2xl transition-colors hover:text-accent"
            >
              {site.email}
            </a>
            <a
              href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
              className="text-display text-2xl transition-colors hover:text-accent"
            >
              {site.phone}
            </a>
            <a
              href={site.telegram}
              target="_blank"
              rel="noreferrer noopener"
              className="text-display text-2xl transition-colors hover:text-accent"
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
              <p className="text-display text-3xl text-ember">Заявка отправлена</p>
              <p className="mt-4 max-w-md text-muted">
                Спасибо! Свяжемся в течение часа. Если вопрос срочный — напишите в Telegram.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTaskChoice(null)
                  setBudgetChoice(null)
                  setStatus('idle')
                }}
                className="label-mono mt-8 text-muted transition-colors hover:text-accent"
              >
                Отправить ещё одну
              </button>
            </motion.div>
          ) : status === 'error' ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-card border border-line bg-surface p-8"
            >
              <p className="text-display text-2xl">
                {notConfigured ? 'Отправка пока не подключена' : 'Не удалось отправить'}
              </p>
              <p className="mt-4 max-w-lg text-sm text-muted">
                {notConfigured
                  ? 'Форма ещё не соединена с приёмником заявок. Скопируйте заявку и отправьте её в Telegram — так ничего не потеряется.'
                  : 'Сервис приёма заявок не ответил. Скопируйте заявку и пришлите в Telegram, мы ответим так же быстро.'}
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
                  {copied ? 'Скопировано' : 'Скопировать заявку'}
                </button>
                <a
                  href={site.telegram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
                >
                  Открыть Telegram
                </a>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="label-mono text-muted transition-colors hover:text-accent"
                >
                  Вернуться к форме
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="grid gap-8 sm:grid-cols-2">
                <label className="block">
                  <span className="label-mono text-muted">Как вас зовут</span>
                  <input name="name" required placeholder="Имя" className={`${fieldClass} mt-3`} />
                </label>
                <label className="block">
                  <span className="label-mono text-muted">Как связаться</span>
                  <input
                    name="contact"
                    required
                    placeholder="Telegram, почта или телефон"
                    className={`${fieldClass} mt-3`}
                  />
                </label>
              </div>

              <Chips label="Что нужно" items={taskChips} value={task} onChange={setTaskChoice} />
              <Chips label="Бюджет" items={budgetChips} value={budget} onChange={setBudgetChoice} />

              <label className="block">
                <span className="label-mono text-muted">О задаче</span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Пара предложений о проекте — этого достаточно"
                  className={`${fieldClass} mt-3 resize-none`}
                />
              </label>

              <label className="flex items-start gap-3 text-xs text-muted">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 size-4 shrink-0 accent-[#ff6a00]"
                />
                Согласен на обработку персональных данных
              </label>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-accent px-10 text-base font-medium text-bg transition-all duration-300 hover:bg-accent-hover hover:shadow-glow disabled:opacity-60 sm:self-start"
              >
                {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
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
