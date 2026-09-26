/**
 * Запуск бота на своём сервере, без Cloudflare. Нужен только Node.js 22.18+ —
 * он выполняет TypeScript сам, ставить зависимости и собирать ничего не надо:
 *
 *   node --env-file=.env src/server.ts
 *
 * Что делает:
 *   • HTTP на 127.0.0.1:PORT — /lead (форма сайта) и /mail (Apps Script).
 *     Снаружи его открывает nginx по адресу https://домен/api/…
 *   • забирает сообщения Telegram длинным опросом (getUpdates) — вебхук,
 *     отдельный адрес и сертификат для бота не нужны;
 *   • хранит заявки и настройки в data/kv.json.
 */
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import type { IncomingMessage } from 'node:http'
import { resolve } from 'node:path'

import { handleUpdate } from './bot.ts'
import type { Update } from './bot.ts'
import { FileKv } from './fileKv.ts'
import worker, { configureBot } from './index.ts'
import { Telegram } from './telegram.ts'
import type { Env } from './types.ts'

const env = process.env
const PORT = Number(env.PORT) || 8787
const HOST = env.HOST || '127.0.0.1'
const BODY_LIMIT = 100_000

if (!env.BOT_TOKEN) {
  console.error('Не задан BOT_TOKEN — впишите токен от @BotFather в файл .env')
  process.exit(1)
}
if (!env.MAIL_SECRET) console.warn('Не задан MAIL_SECRET — письма из Gmail приниматься не будут')

if (env.TELEGRAM_API_BASE) Telegram.apiBase = env.TELEGRAM_API_BASE.replace(/\/+$/, '')

const kv = new FileKv(resolve(env.DATA_FILE || 'data/kv.json'))
setInterval(() => kv.prune(), 60 * 60 * 1000).unref()

const config: Env = {
  KV: kv as unknown as KVNamespace,
  BOT_TOKEN: env.BOT_TOKEN,
  ADMIN_CHAT_ID: env.ADMIN_CHAT_ID || undefined,
  // Вебхук здесь не используется: случайный секрет закрывает /telegram и /setup,
  // иначе /setup переключил бы Telegram на вебхук и опрос перестал бы работать.
  WEBHOOK_SECRET: randomUUID(),
  MAIL_SECRET: env.MAIL_SECRET ?? '',
  GMAIL_ACTION_URL: env.GMAIL_ACTION_URL || undefined,
  ALLOWED_ORIGINS: env.ALLOWED_ORIGINS,
  SITE_URL: env.SITE_URL,
  CONTACT_URL: env.CONTACT_URL,
  TIMEZONE: env.TIMEZONE || 'Europe/Moscow',
}

function readBody(request: IncomingMessage): Promise<Buffer> {
  return new Promise((done, fail) => {
    const chunks: Buffer[] = []
    let size = 0
    request.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > BODY_LIMIT) {
        fail(new Error('body too large'))
        request.destroy()
      } else {
        chunks.push(chunk)
      }
    })
    request.on('end', () => done(Buffer.concat(chunks)))
    request.on('error', fail)
  })
}

const server = createServer(async (request, response) => {
  try {
    const headers = new Headers()
    for (const [name, value] of Object.entries(request.headers)) {
      if (typeof value === 'string') headers.set(name, value)
      else if (Array.isArray(value)) headers.set(name, value.join(', '))
    }
    // Адрес посетителя для ограничения частоты: его передаёт nginx.
    const realIp = request.headers['x-real-ip']
    headers.set(
      'CF-Connecting-IP',
      (typeof realIp === 'string' && realIp) || request.socket.remoteAddress || 'unknown',
    )

    const method = request.method ?? 'GET'
    const body = method === 'GET' || method === 'HEAD' ? undefined : await readBody(request)
    const url = `http://${request.headers.host ?? 'localhost'}${request.url ?? '/'}`

    const result = await worker.fetch(new Request(url, { method, headers, body }), config)
    response.writeHead(result.status, Object.fromEntries(result.headers))
    response.end(Buffer.from(await result.arrayBuffer()))
  } catch (error) {
    console.error('request failed', error)
    if (!response.headersSent) response.writeHead(500)
    response.end()
  }
})

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms))

async function poll() {
  const tg = new Telegram(config.BOT_TOKEN)

  // Если бот раньше работал через вебхук (Cloudflare), опрос без этого не получит ничего.
  await tg.call('deleteWebhook', { drop_pending_updates: false })
  await configureBot(tg).catch((error) => console.warn('не удалось обновить меню бота', error))

  const me = await tg.call<{ username: string }>('getMe', {})
  console.log(`Бот @${me.username} слушает Telegram`)
  if (!config.ADMIN_CHAT_ID) {
    console.log('ADMIN_CHAT_ID не задан: напишите боту /start — он пришлёт ваш chat_id')
  }

  let offset = 0
  for (;;) {
    try {
      const updates = await tg.call<Update[]>('getUpdates', {
        offset,
        timeout: 50,
        allowed_updates: ['message', 'callback_query'],
      })

      for (const update of updates) {
        offset = (update.update_id ?? offset) + 1
        await handleUpdate(update, config).catch((error) => console.error('update failed', error))
      }
    } catch (error) {
      console.error('getUpdates failed, retry in 5s', error)
      await sleep(5000)
    }
  }
}

server.listen(PORT, HOST, () => console.log(`HTTP: http://${HOST}:${PORT}`))
poll().catch((error) => {
  console.error('Telegram недоступен — проверьте BOT_TOKEN', error)
  process.exit(1)
})
