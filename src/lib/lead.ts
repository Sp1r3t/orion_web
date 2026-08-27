import type { EstimateValue } from '@/context/estimateContext'

export type LeadEstimate = {
  projectType: string
  pace: string
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

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

/** Снимок расчёта в том виде, в котором он уходит вместе с заявкой. */
export function toLeadEstimate(estimate: EstimateValue): LeadEstimate {
  return {
    projectType: estimate.type.title,
    pace: estimate.urgency.title,
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

/** Читаемый текст заявки — уходит в тело письма и лежит под кнопкой «скопировать». */
export function formatLead(payload: LeadPayload): string {
  const lines = [
    `Имя: ${payload.name}`,
    `Контакт: ${payload.contact}`,
    payload.task && `Задача: ${payload.task}`,
    payload.budget && `Бюджет: ${payload.budget}`,
    payload.message && `Комментарий: ${payload.message}`,
  ].filter(Boolean) as string[]

  if (payload.estimate) {
    const { estimate } = payload
    lines.push('', '--- Расчёт из калькулятора ---')
    lines.push(`Тип проекта: ${estimate.projectType}`)
    lines.push(`Темп: ${estimate.pace}`)
    lines.push(
      estimate.options.length > 0
        ? `Опции: ${estimate.options
            .map((item) => `${item.title}${item.count > 1 ? ` ×${item.count}` : ''}`)
            .join(', ')}`
        : 'Опции: не выбраны',
    )
    lines.push(`Вилка: ${money.format(estimate.priceMin)} — ${money.format(estimate.priceMax)}`)
    lines.push(`Срок: ${estimate.weeksMin}–${estimate.weeksMax} недель`)
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
