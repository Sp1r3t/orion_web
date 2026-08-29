import type { EstimateValue } from '@/context/estimateContext'
import { money } from '@/i18n/format'
import { ru } from '@/i18n/ru'
import type { Ui } from '@/i18n/types'

export type LeadEstimate = {
  projectType: string
  pace: string
  /** Валюта, в которой смету видел посетитель. Суммы ниже всегда в рублях. */
  currency?: string
  options: Array<{ title: string; count: number; price: number }>
  priceMin: number
  priceMax: number
  weeksMin: number
  weeksMax: number
}

export type LeadPayload = {
  name: string
  contact: string
  task: string
  budget: string
  message: string
  estimate: LeadEstimate | null
  page: string
  sentAt: string
}

export class LeadNotConfiguredError extends Error {
  constructor() {
    super('Приём заявок не настроен: не задан VITE_LEAD_ENDPOINT')
    this.name = 'LeadNotConfiguredError'
  }
}

/** Снимок расчёта в том виде, в котором он уходит вместе с заявкой. */
export function toLeadEstimate(estimate: EstimateValue, currency?: string): LeadEstimate {
  return {
    projectType: estimate.type.title,
    pace: estimate.urgency.title,
    currency,
    options: estimate.chosen.map(({ option, count }) => ({
      title: option.title,
      count,
      price: option.price * count,
    })),
    priceMin: estimate.totals.min,
    priceMax: estimate.totals.max,
    weeksMin: estimate.totals.weeksMin,
    weeksMax: estimate.totals.weeksMax,
  }
}

/**
 * Читаемый текст заявки — уходит в тело письма и лежит под кнопкой «скопировать».
 * Подписи берутся из активного языка; по умолчанию русские, чтобы функцию можно
 * было звать и там, где до контекста не дотянуться.
 */
export function formatLead(
  payload: LeadPayload,
  strings: Ui['leadMail'] = ru.ui.leadMail,
  locale: string = ru.ui.locale,
  format: (rubles: number) => string = (value) => money(locale).format(value),
): string {
  const lines = [
    `${strings.name}: ${payload.name}`,
    `${strings.contact}: ${payload.contact}`,
    payload.task && `${strings.task}: ${payload.task}`,
    payload.budget && `${strings.budget}: ${payload.budget}`,
    payload.message && `${strings.comment}: ${payload.message}`,
  ].filter(Boolean) as string[]

  if (payload.estimate) {
    const { estimate } = payload
    lines.push('', `--- ${strings.estimate} ---`)
    lines.push(`${strings.projectType}: ${estimate.projectType}`)
    lines.push(`${strings.pace}: ${estimate.pace}`)
    lines.push(
      estimate.options.length > 0
        ? `${strings.options}: ${estimate.options
            .map((item) => `${item.title}${item.count > 1 ? ` ×${item.count}` : ''}`)
            .join(', ')}`
        : `${strings.options}: ${strings.noOptions}`,
    )
    // Смету показываем в валюте посетителя, а рядом оставляем рубли: курс
    // плавает, договор всё равно рублёвый.
    const rubles = money(ru.ui.locale)
    const original =
      estimate.currency && estimate.currency !== 'RUB'
        ? ` (${rubles.format(estimate.priceMin)} — ${rubles.format(estimate.priceMax)})`
        : ''

    lines.push(
      `${strings.range}: ${format(estimate.priceMin)} — ${format(estimate.priceMax)}${original}`,
    )
    lines.push(`${strings.term}: ${estimate.weeksMin}–${estimate.weeksMax} ${strings.weeks}`)
  }

  return lines.join('\n')
}

/**
 * Отправка заявки. Адрес приёмника берётся из VITE_LEAD_ENDPOINT — это может быть
 * форм-сервис (Formspree, Getform) или свой обработчик, который перекладывает
 * заявку в Telegram. Токен бота на фронтенде держать нельзя: он виден всем.
 */
export async function sendLead(payload: LeadPayload): Promise<void> {
  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT

  if (!endpoint) throw new LeadNotConfiguredError()

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...payload, text: formatLead(payload) }),
  })

  if (!response.ok) {
    throw new Error(`Сервис приёма заявок ответил ${response.status}`)
  }
}
