import { json, readJson, str } from './http.ts'
import { Store } from './store.ts'
import { Telegram } from './telegram.ts'
import type { Env, Mail } from './types.ts'
import { mailScreen } from './ui.ts'

/** Письмо от Google Apps Script: проверяем секрет и присылаем карточку. */
export async function handleMail(request: Request, env: Env): Promise<Response> {
  if (!env.MAIL_SECRET || request.headers.get('X-Orion-Secret') !== env.MAIL_SECRET) {
    return json({ error: 'unauthorized' }, 401)
  }
  if (!env.ADMIN_CHAT_ID) return json({ error: 'not_configured' }, 503)

  const body = (await readJson(request, 60_000)) as Record<string, unknown> | null
  const id = str(body?.id, 64)
  if (!body || !/^[\w-]+$/.test(id)) return json({ error: 'bad_request' }, 400)

  const store = new Store(env.KV)
  const settings = await store.settings()
  // Пауза: Apps Script считает письмо доставленным и больше его не шлёт.
  if (!settings.mail) return json({ ok: true, skipped: 'paused' })
  // Повтор после сетевого сбоя — второй карточки не нужно.
  if (await store.mail(id)) return json({ ok: true, skipped: 'duplicate' })

  const mail: Mail = {
    id,
    threadId: str(body.threadId, 64) || id,
    from: str(body.from, 300),
    subject: str(body.subject, 300),
    date: str(body.date, 40) || new Date().toISOString(),
    body: str(body.body, 6000),
    attachments: Array.isArray(body.attachments)
      ? body.attachments
          .slice(0, 10)
          .map((item) => str(item, 120))
          .filter(Boolean)
      : [],
    state: 'unread',
  }

  const screen = mailScreen(mail, env.TIMEZONE || 'Europe/Moscow', Boolean(env.GMAIL_ACTION_URL))
  try {
    mail.messageId = await new Telegram(env.BOT_TOKEN).send(
      env.ADMIN_CHAT_ID,
      screen.text,
      screen.keyboard,
      {
        silent: settings.quiet,
      },
    )
  } catch (error) {
    console.error('mail delivery failed', error)
    return json({ error: 'delivery_failed' }, 502)
  }

  await store.saveMail(mail)
  return json({ ok: true })
}

/**
 * Действие над письмом в самом Gmail через веб-приложение Apps Script.
 * Без GMAIL_ACTION_URL бот меняет только карточку — и сообщает об этом.
 */
export async function gmailAction(env: Env, action: 'read' | 'unread' | 'archive', id: string) {
  if (!env.GMAIL_ACTION_URL) return false

  try {
    const response = await fetch(env.GMAIL_ACTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.MAIL_SECRET, action, id }),
      redirect: 'follow',
    })
    const data = (await response.json()) as { ok?: boolean }
    return data.ok === true
  } catch {
    return false
  }
}
