import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import worker from './index'
import type { Env } from './types'

/** KV в памяти: воркеру нужны только get/put/delete. */
function memoryKv() {
  const data = new Map<string, string>()
  return {
    data,
    async get(key: string, type?: string) {
      const value = data.get(key)
      if (value === undefined) return null
      return type === 'json' ? JSON.parse(value) : value
    },
    async put(key: string, value: string) {
      data.set(key, value)
    },
    async delete(key: string) {
      data.delete(key)
    },
  }
}

type Call = { method: string; body: Record<string, any> }

let calls: Call[]
let env: Env
let nextMessageId: number

const SITE = 'https://orion.test'

beforeEach(() => {
  calls = []
  nextMessageId = 100
  env = {
    KV: memoryKv() as unknown as KVNamespace,
    BOT_TOKEN: 'test-token',
    ADMIN_CHAT_ID: '42',
    WEBHOOK_SECRET: 'hook-secret',
    MAIL_SECRET: 'mail-secret',
    ALLOWED_ORIGINS: `${SITE},http://localhost:5173`,
    SITE_URL: SITE,
    TIMEZONE: 'Europe/Moscow',
  }

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init?: RequestInit) => {
      const method = String(input).split('/').pop() ?? ''
      calls.push({ method, body: JSON.parse(String(init?.body ?? '{}')) })
      return new Response(JSON.stringify({ ok: true, result: { message_id: nextMessageId++ } }))
    }),
  )
})

afterEach(() => vi.unstubAllGlobals())

const lead = (overrides: Record<string, unknown> = {}) => ({
  name: 'Иван <script>',
  contact: '@ivan_petrov',
  task: 'Интернет-магазин',
  budget: '200–400 тыс.',
  message: 'Нужен магазин одежды',
  estimate: {
    projectType: 'Интернет-магазин',
    pace: 'Стандартный',
    currency: 'USD',
    options: [{ title: 'Оплата онлайн', count: 1, price: 30000 }],
    priceMin: 180000,
    priceMax: 320000,
    weeksMin: 4,
    weeksMax: 6,
  },
  page: `${SITE}/`,
  sentAt: new Date().toISOString(),
  ...overrides,
})

function postLead(body: unknown, origin = SITE) {
  return worker.fetch(
    new Request('https://bot.test/lead', {
      method: 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '1.1.1.1',
      },
      body: JSON.stringify(body),
    }),
    env,
  )
}

function update(body: unknown) {
  return worker.fetch(
    new Request('https://bot.test/telegram', {
      method: 'POST',
      headers: { 'X-Telegram-Bot-Api-Secret-Token': 'hook-secret' },
      body: JSON.stringify(body),
    }),
    env,
  )
}

const press = (data: string, messageId = 100, from = 42) =>
  update({
    callback_query: {
      id: 'cb',
      data,
      from: { id: from },
      message: { message_id: messageId, chat: { id: from } },
    },
  })

const say = (text: string, from = 42) =>
  update({ message: { message_id: 555, chat: { id: from }, text } })

const sent = (method: string) => calls.filter((call) => call.method === method)
const buttons = (call: Call) =>
  (call.body.reply_markup?.inline_keyboard ?? [])
    .flat()
    .map((b: any) => b.callback_data ?? b.url ?? b.copy_text?.text)

describe('заявка с сайта', () => {
  it('приходит владельцу карточкой с кнопками и экранированным текстом', async () => {
    const response = await postLead(lead())
    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(SITE)
    expect(await response.json()).toEqual({ ok: true, id: 1 })

    const [message] = sent('sendMessage')
    expect(message.body.chat_id).toBe('42')
    expect(message.body.text).toContain('Заявка #1')
    expect(message.body.text).toContain('Иван &lt;script&gt;')
    expect(message.body.text).toContain('Клиент смотрел цены в USD')
    expect(buttons(message)).toEqual(
      expect.arrayContaining([
        'st:1:work:',
        'st:1:rejected:',
        'https://t.me/ivan_petrov',
        'note:1',
        'del:1:',
      ]),
    )
  })

  it('без имени или контакта отклоняется', async () => {
    expect((await postLead(lead({ name: ' ' }))).status).toBe(400)
    expect(sent('sendMessage')).toHaveLength(0)
  })

  it('с чужого сайта не принимается', async () => {
    expect((await postLead(lead(), 'https://evil.test')).status).toBe(403)
  })

  it('отвечает на preflight только своему сайту', async () => {
    const ok = await worker.fetch(
      new Request('https://bot.test/lead', { method: 'OPTIONS', headers: { Origin: SITE } }),
      env,
    )
    expect(ok.status).toBe(204)
    expect(ok.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })

  it('ограничивает поток с одного адреса', async () => {
    for (let i = 0; i < 5; i++) expect((await postLead(lead())).status).toBe(200)
    expect((await postLead(lead())).status).toBe(429)
  })

  it('номер телефона даёт кнопки копирования и WhatsApp', async () => {
    await postLead(lead({ contact: '8 (903) 317-57-93' }))
    expect(buttons(sent('sendMessage')[0])).toEqual(
      expect.arrayContaining(['+79033175793', 'https://wa.me/79033175793']),
    )
  })

  it('сообщает сайту, если Telegram недоступен', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ok: false, description: 'down' }))),
    )
    expect((await postLead(lead())).status).toBe(502)
  })
})

describe('кнопки заявки', () => {
  beforeEach(async () => {
    await postLead(lead())
    calls = []
  })

  it('смена статуса перерисовывает карточку', async () => {
    await press('st:1:work:')
    const [edit] = sent('editMessageText')
    expect(edit.body.message_id).toBe(100)
    expect(edit.body.text).toContain('🟡 <b>Заявка #1</b> · В работе')
    expect(buttons(edit)).toEqual(expect.arrayContaining(['st:1:done:', 'st:1:new:']))
    expect(sent('answerCallbackQuery')[0].body.text).toContain('в работе')
  })

  it('из списка правит и открытую карточку, и уведомление', async () => {
    await press('st:1:done:all.0', 200)
    const edits = sent('editMessageText')
    expect(edits.map((e) => e.body.message_id).sort()).toEqual([100, 200])
    expect(buttons(edits[0])).toContain('list:all:0')
  })

  it('удаление спрашивает подтверждение, потом убирает заявку', async () => {
    await press('del:1:')
    expect(buttons(sent('editMessageText')[0])).toEqual(['delok:1:', 'lead:1:'])

    await press('delok:1:')
    expect(sent('deleteMessage')[0].body.message_id).toBe(100)

    calls = []
    await press('menu', 300)
    expect(sent('editMessageText')[0].body.text).toContain('Новые — <b>0</b>')
  })

  it('заметка сохраняется ответным сообщением', async () => {
    await press('note:1')
    expect(sent('sendMessage')[0].body.reply_markup.force_reply).toBe(true)

    calls = []
    await say('Созвон в пятницу в 15:00')
    const card = sent('editMessageText').find((e) => e.body.message_id === 100)
    expect(card?.body.text).toContain('Созвон в пятницу в 15:00')
  })

  it('список новых показывает заявку и фильтры', async () => {
    await press('list:new:0')
    const [edit] = sent('editMessageText')
    expect(edit.body.text).toContain('Новые</b> · 1')
    expect(buttons(edit)).toEqual(expect.arrayContaining(['lead:1:new.0', 'list:work:0', 'menu']))
  })

  it('статистика считает заявки', async () => {
    await press('stats')
    expect(sent('editMessageText')[0].body.text).toContain('Всего заявок: <b>1</b>')
  })
})

describe('чат', () => {
  it('/start присылает панель и убирает саму команду', async () => {
    await say('/start')
    expect(sent('deleteMessage').map((c) => c.body.message_id)).toContain(555)
    expect(sent('sendMessage')[0].body.text).toContain('панель студии')
  })

  it('чужому пользователю показывает приветствие без данных', async () => {
    await postLead(lead())
    calls = []
    await say('/start', 7)
    const [message] = sent('sendMessage')
    expect(message.body.chat_id).toBe(7)
    expect(message.body.text).toContain('служебный бот')
    expect(message.body.text).not.toContain('Иван')
  })

  it('чужие нажатия отбиваются', async () => {
    await press('menu', 100, 7)
    expect(sent('editMessageText')).toHaveLength(0)
    expect(sent('answerCallbackQuery')[0].body.show_alert).toBe(true)
  })

  it('без владельца бот подсказывает chat_id', async () => {
    env.ADMIN_CHAT_ID = undefined
    await say('/start', 99)
    expect(sent('sendMessage')[0].body.text).toContain('<code>99</code>')
  })

  it('вебхук без секрета не принимается', async () => {
    const response = await worker.fetch(
      new Request('https://bot.test/telegram', { method: 'POST', body: '{}' }),
      env,
    )
    expect(response.status).toBe(403)
  })
})

describe('почта', () => {
  const mail = {
    id: '18f2a9c0d1e2',
    threadId: '18f2a9c0d1e2',
    from: 'Анна <anna@example.com>',
    subject: 'Вопрос по сайту',
    date: '2026-09-26T10:00:00Z',
    body: 'Здравствуйте! Сколько стоит лендинг?',
    attachments: ['ТЗ.pdf'],
  }

  const postMail = (body: unknown, secret = 'mail-secret') =>
    worker.fetch(
      new Request('https://bot.test/mail', {
        method: 'POST',
        headers: { 'X-Orion-Secret': secret, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      env,
    )

  it('без секрета не принимается', async () => {
    expect((await postMail(mail, 'wrong')).status).toBe(401)
  })

  it('приходит карточкой с кнопками и не дублируется', async () => {
    expect((await postMail(mail)).status).toBe(200)
    const [message] = sent('sendMessage')
    expect(message.body.text).toContain('Новое письмо')
    expect(message.body.text).toContain('Анна &lt;anna@example.com&gt;')
    expect(message.body.text).toContain('📎 ТЗ.pdf')
    expect(buttons(message)).toEqual(
      expect.arrayContaining([`m:read:${mail.id}`, `m:hide:${mail.id}`]),
    )

    await postMail(mail)
    expect(sent('sendMessage')).toHaveLength(1)
  })

  it('«Прочитано» меняет карточку', async () => {
    await postMail(mail)
    calls = []
    await press(`m:read:${mail.id}`)
    const [edit] = sent('editMessageText')
    expect(edit.body.text).toContain('прочитано')
    expect(buttons(edit)).toContain(`m:unread:${mail.id}`)
  })

  it('на паузе письма не пересылаются', async () => {
    await press('set:mail')
    calls = []
    await postMail(mail)
    expect(sent('sendMessage')).toHaveLength(0)
  })
})
