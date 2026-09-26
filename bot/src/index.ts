import { handleUpdate } from './bot.ts'
import type { Update } from './bot.ts'
import { json } from './http.ts'
import { handleLead } from './lead.ts'
import { handleMail } from './mail.ts'
import { Telegram } from './telegram.ts'
import type { Env } from './types.ts'

/**
 * Один воркер на всё:
 *   POST /lead      — заявка с формы сайта
 *   POST /mail      — письмо из Gmail (Google Apps Script)
 *   POST /telegram  — вебхук бота
 *   GET  /setup     — разовая настройка вебхука, команд и описания бота
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    switch (url.pathname) {
      case '/lead':
        return handleLead(request, env)

      case '/mail':
        return request.method === 'POST' ? handleMail(request, env) : json({ error: 'method' }, 405)

      case '/telegram': {
        if (request.method !== 'POST') return json({ error: 'method' }, 405)
        if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) {
          return json({ error: 'forbidden' }, 403)
        }
        // Ошибку наружу не отдаём: Telegram повторял бы одно и то же обновление.
        try {
          await handleUpdate((await request.json()) as Update, env)
        } catch (error) {
          console.error('update failed', error)
        }
        return json({ ok: true })
      }

      case '/setup':
        return setup(url, env)

      default:
        return new Response('ORION bot is running 🪐', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
    }
  },
}

async function setup(url: URL, env: Env) {
  if (!env.WEBHOOK_SECRET || url.searchParams.get('key') !== env.WEBHOOK_SECRET) {
    return json({ error: 'forbidden' }, 403)
  }

  const tg = new Telegram(env.BOT_TOKEN)
  const results: Record<string, unknown> = {}

  results.webhook = await tg.call('setWebhook', {
    url: `${url.origin}/telegram`,
    secret_token: env.WEBHOOK_SECRET,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  })

  Object.assign(results, await configureBot(tg))

  return json({ ok: true, results })
}

/** Меню команд и описание бота — общие для воркера и для запуска на своём сервере. */
export async function configureBot(tg: Telegram) {
  const results: Record<string, unknown> = {}

  results.commands = await tg.call('setMyCommands', {
    commands: [
      { command: 'menu', description: '🪐 Панель студии' },
      { command: 'new', description: '🟢 Новые заявки' },
      { command: 'stats', description: '📊 Статистика' },
      { command: 'settings', description: '⚙️ Настройки' },
      { command: 'help', description: '❓ Как пользоваться' },
    ],
  })

  results.description = await tg.call('setMyDescription', {
    description:
      'Служебный бот веб-студии ORION. Сюда приходят заявки с сайта и письма студии. Хотите обсудить проект — оставьте заявку на сайте.',
  })

  results.shortDescription = await tg.call('setMyShortDescription', {
    short_description: 'ORION — веб-студия полного цикла: сайты, магазины и сервисы под ключ.',
  })

  return results
}
