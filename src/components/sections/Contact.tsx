import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent } from 'react'

import Section from '@/components/ui/Section'
import { site } from '@/content/site'

const taskChips = [
  'Лендинг',
  'Корпоративный сайт',
  'Магазин',
  'Веб-сервис',
  'Редизайн',
  'Ещё не решил',
]
const budgetChips = ['до 50 000 ₽', '50–100 000 ₽', '100–300 000 ₽', 'больше 300 000 ₽', 'не знаю']

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

export default function Contact() {
  const [task, setTask] = useState('')
  const [budget, setBudget] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO: подключить отправку — Telegram-бот или форм-сервис (фаза 6 плана).
    setSent(true)
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
          {sent ? (
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
                onClick={() => setSent(false)}
                className="label-mono mt-8 text-muted transition-colors hover:text-accent"
              >
                Отправить ещё одну
              </button>
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

              <Chips label="Что нужно" items={taskChips} value={task} onChange={setTask} />
              <Chips label="Бюджет" items={budgetChips} value={budget} onChange={setBudget} />

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
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-accent px-10 text-base font-medium text-bg transition-all duration-300 hover:bg-accent-hover hover:shadow-glow sm:self-start"
              >
                Отправить заявку
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
