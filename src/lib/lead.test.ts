import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatLead, LeadNotConfiguredError, sendLead } from '@/lib/lead'
import type { LeadPayload } from '@/lib/lead'

const payload: LeadPayload = {
  name: 'Тест',
  contact: '@testuser',
  task: 'Веб-сервис',
  budget: 'больше 300 000 ₽',
  message: 'Нужен сервис для расчётов',
  estimate: {
    projectType: 'Веб-сервис',
    pace: 'Срочный запуск',
    options: [
      { title: 'Сложные виджеты', count: 2, price: 24_000 },
      { title: 'Личный кабинет', count: 1, price: 45_000 },
    ],
    priceMin: 308_000,
    priceMax: 542_000,
    weeksMin: 6,
    weeksMax: 9,
  },
  page: 'http://localhost:5173/#contact',
  sentAt: '2026-08-27T12:00:00.000Z',
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('formatLead', () => {
  it('включает расчёт из калькулятора', () => {
    const text = formatLead(payload)

    expect(text).toContain('Имя: Тест')
    expect(text).toContain('Тип проекта: Веб-сервис')
    expect(text).toContain('Сложные виджеты ×2')
    expect(text).toContain('Срок: 6–9 недель')
  })

  it('не показывает пустые поля и работает без расчёта', () => {
    const text = formatLead({ ...payload, budget: '', message: '', estimate: null })

    expect(text).not.toContain('Бюджет:')
    expect(text).not.toContain('Расчёт из калькулятора')
    expect(text).toContain('Контакт: @testuser')
  })
})

describe('sendLead', () => {
  it('без VITE_LEAD_ENDPOINT сообщает, что приём не настроен', async () => {
    vi.stubEnv('VITE_LEAD_ENDPOINT', '')

    await expect(sendLead(payload)).rejects.toBeInstanceOf(LeadNotConfiguredError)
  })

  it('отправляет заявку и расчёт на заданный адрес', async () => {
    vi.stubEnv('VITE_LEAD_ENDPOINT', 'https://example.test/lead')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    await sendLead(payload)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.test/lead')
    expect(init.method).toBe('POST')

    const body = JSON.parse(init.body)
    expect(body.name).toBe('Тест')
    expect(body.estimate.priceMin).toBe(308_000)
    expect(body.estimate.options).toHaveLength(2)
    expect(body.text).toContain('Личный кабинет')
  })

  it('сообщает об ошибке, если сервис ответил неудачно', async () => {
    vi.stubEnv('VITE_LEAD_ENDPOINT', 'https://example.test/lead')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(sendLead(payload)).rejects.toThrow('500')
  })
})
