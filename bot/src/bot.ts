import { gmailAction } from './mail.ts'
import { Store } from './store.ts'
import { Telegram } from './telegram.ts'
import type { Env, Lead, LeadStatus, Screen } from './types.ts'
import {
  deletedLeadScreen,
  guestScreen,
  helpScreen,
  isFilter,
  leadScreen,
  listScreen,
  mailScreen,
  menuScreen,
  setupScreen,
  settingsScreen,
  statsScreen,
  STATUS,
} from './ui.ts'

type Chat = { id: number }
type Message = { message_id: number; chat: Chat; text?: string }
type CallbackQuery = { id: string; data?: string; message?: Message; from: { id: number } }
export type Update = { update_id?: number; message?: Message; callback_query?: CallbackQuery }

type Ctx = { env: Env; tg: Telegram; store: Store; tz: string; admin: string }

const STATUSES: LeadStatus[] = ['new', 'work', 'done', 'rejected']

export async function handleUpdate(update: Update, env: Env) {
  const ctx: Ctx = {
    env,
    tg: new Telegram(env.BOT_TOKEN),
    store: new Store(env.KV),
    tz: env.TIMEZONE || 'Europe/Moscow',
    admin: env.ADMIN_CHAT_ID ?? '',
  }

  if (update.callback_query) return onCallback(ctx, update.callback_query)
  if (update.message) return onMessage(ctx, update.message)
}

// ─── Сообщения ───────────────────────────────────────────────────────────────

async function onMessage(ctx: Ctx, message: Message) {
  const chatId = message.chat.id
  const text = (message.text ?? '').trim()
  const command = text.startsWith('/') ? text.split(/[\s@]/)[0].toLowerCase() : ''

  if (!ctx.admin || command === '/id') {
    // Первый запуск: владелец узнаёт свой chat_id прямо из бота.
    const screen = setupScreen(chatId)
    await ctx.tg.send(chatId, screen.text)
    return
  }

  if (String(chatId) !== ctx.admin) {
    const screen = guestScreen(ctx.env.SITE_URL, ctx.env.CONTACT_URL)
    await ctx.tg.send(chatId, screen.text, screen.keyboard)
    return
  }

  const pending = await ctx.store.pendingNote()

  if (command === '/cancel') {
    if (pending) {
      await ctx.store.clearPendingNote()
      await ctx.tg.remove(chatId, pending.promptId)
    }
    await ctx.tg.remove(chatId, message.message_id)
    return
  }

  if (pending && text && !command) return saveNote(ctx, message, pending)

  switch (command) {
    case '/start':
    case '/menu':
      return openScreen(ctx, message, await menu(ctx))
    case '/new':
      return openScreen(ctx, message, listScreen(await ctx.store.index(), 'new', 0))
    case '/stats':
      return openScreen(ctx, message, statsScreen(await ctx.store.index()))
    case '/settings':
      return openScreen(
        ctx,
        message,
        settingsScreen(await ctx.store.settings(), Boolean(ctx.env.GMAIL_ACTION_URL)),
      )
    case '/help':
      return openScreen(ctx, message, helpScreen())
    default:
      await ctx.tg.send(chatId, '🤔 Не понял. Всё управление — кнопками в меню.', [
        [{ text: '🏠 Открыть меню', callback_data: 'menu' }],
      ])
  }
}

/**
 * Панель живёт одним сообщением: новая команда убирает прежнюю панель и саму
 * команду, так что в чате остаются только карточки заявок и писем.
 */
async function openScreen(ctx: Ctx, message: Message, screen: Screen) {
  const chatId = message.chat.id
  const previous = await ctx.store.menuMessage()

  await Promise.all([
    previous ? ctx.tg.remove(chatId, previous) : null,
    ctx.tg.remove(chatId, message.message_id),
  ])

  const id = await ctx.tg.send(chatId, screen.text, screen.keyboard, { silent: true })
  await ctx.store.saveMenuMessage(id)
}

async function menu(ctx: Ctx) {
  const [index, settings] = await Promise.all([ctx.store.index(), ctx.store.settings()])
  return menuScreen(index, settings, ctx.env.SITE_URL)
}

async function saveNote(ctx: Ctx, message: Message, pending: { leadId: number; promptId: number }) {
  const chatId = message.chat.id
  await ctx.store.clearPendingNote()

  const lead = await ctx.store.lead(pending.leadId)
  await Promise.all([
    ctx.tg.remove(chatId, pending.promptId),
    ctx.tg.remove(chatId, message.message_id),
  ])
  if (!lead) return

  lead.note = (message.text ?? '').trim().slice(0, 1000)
  lead.updatedAt = new Date().toISOString()
  await ctx.store.saveLead(lead)
  await refreshNotification(ctx, lead)

  await ctx.tg.send(
    chatId,
    `📝 Заметка к заявке <b>#${lead.id}</b> сохранена.`,
    [[{ text: '📂 Открыть заявку', callback_data: `lead:${lead.id}:all.0` }]],
    { silent: true },
  )
}

/** Карточка-уведомление всегда отражает текущее состояние заявки. */
async function refreshNotification(ctx: Ctx, lead: Lead, except?: number) {
  if (!lead.messageId || lead.messageId === except) return
  const screen = leadScreen(lead, ctx.tz, '')
  await ctx.tg.edit(ctx.admin, lead.messageId, screen.text, screen.keyboard).catch(() => {})
}

// ─── Кнопки ──────────────────────────────────────────────────────────────────

async function onCallback(ctx: Ctx, query: CallbackQuery) {
  if (String(query.from.id) !== ctx.admin || !query.message) {
    await ctx.tg.answer(query.id, 'Эта панель доступна только владельцу студии', true)
    return
  }

  const chatId = query.message.chat.id
  const messageId = query.message.message_id
  const show = (screen: Screen) => ctx.tg.edit(chatId, messageId, screen.text, screen.keyboard)
  const [action, ...args] = (query.data ?? '').split(':')

  let toast: string | undefined

  try {
    switch (action) {
      case 'menu':
        await show(await menu(ctx))
        break

      case 'list': {
        const filter = isFilter(args[0]) ? args[0] : 'all'
        await show(listScreen(await ctx.store.index(), filter, Number(args[1]) || 0))
        break
      }

      case 'lead': {
        const lead = await ctx.store.lead(Number(args[0]))
        if (!lead) {
          toast = 'Заявка уже удалена'
          await show(await menu(ctx))
        } else {
          await show(leadScreen(lead, ctx.tz, args[1] ?? ''))
        }
        break
      }

      case 'st': {
        const [id, status, where = ''] = args
        const lead = await ctx.store.lead(Number(id))
        if (!lead || !STATUSES.includes(status as LeadStatus)) {
          toast = 'Заявка не найдена'
          break
        }

        const now = new Date().toISOString()
        lead.status = status as LeadStatus
        lead.updatedAt = now
        lead.history.push({ status: lead.status, at: now })
        await ctx.store.saveLead(lead)

        await show(leadScreen(lead, ctx.tz, where))
        await refreshNotification(ctx, lead, messageId)
        toast = `${STATUS[lead.status].icon} Заявка #${lead.id}: ${STATUS[lead.status].label.toLowerCase()}`
        break
      }

      case 'del': {
        const lead = await ctx.store.lead(Number(args[0]))
        if (lead) await show(leadScreen(lead, ctx.tz, args[1] ?? '', true))
        else toast = 'Заявка уже удалена'
        break
      }

      case 'delok': {
        const [id, where = ''] = args
        const lead = await ctx.store.lead(Number(id))
        await ctx.store.deleteLead(Number(id))
        toast = `🗑 Заявка #${id} удалена`

        // Уведомление убираем из чата; старое Telegram удалить не даст — зачеркнём.
        const notification = lead?.messageId
        if (notification && notification !== messageId) {
          if (!(await ctx.tg.remove(chatId, notification))) {
            const gone = deletedLeadScreen(Number(id))
            await ctx.tg.edit(chatId, notification, gone.text, gone.keyboard).catch(() => {})
          }
        }

        if (where) {
          const [filter, page] = where.split('.')
          await show(
            listScreen(
              await ctx.store.index(),
              isFilter(filter) ? filter : 'all',
              Number(page) || 0,
            ),
          )
        } else if (!(await ctx.tg.remove(chatId, messageId))) {
          await show(deletedLeadScreen(Number(id)))
        }
        break
      }

      case 'note': {
        const lead = await ctx.store.lead(Number(args[0]))
        if (!lead) {
          toast = 'Заявка уже удалена'
          break
        }
        const promptId = await ctx.tg.send(
          chatId,
          `📝 Напишите заметку к заявке <b>#${lead.id}</b> (${lead.name}) ответным сообщением.\n\n<i>/cancel — передумали</i>`,
          undefined,
          { forceReply: 'Текст заметки…', silent: true },
        )
        await ctx.store.savePendingNote({ leadId: lead.id, promptId })
        break
      }

      case 'stats':
        await show(statsScreen(await ctx.store.index()))
        toast = 'Обновлено'
        break

      case 'settings':
        await show(settingsScreen(await ctx.store.settings(), Boolean(ctx.env.GMAIL_ACTION_URL)))
        break

      case 'set': {
        const settings = await ctx.store.settings()
        if (args[0] === 'mail') {
          settings.mail = !settings.mail
          toast = settings.mail ? '▶️ Пересылка почты включена' : '⏸ Почта на паузе'
        } else if (args[0] === 'quiet') {
          settings.quiet = !settings.quiet
          toast = settings.quiet ? '🔕 Уведомления без звука' : '🔔 Звук включён'
        }
        await ctx.store.saveSettings(settings)
        await show(settingsScreen(settings, Boolean(ctx.env.GMAIL_ACTION_URL)))
        break
      }

      case 'help':
        await show(helpScreen())
        break

      case 'm':
        toast = await onMailAction(ctx, args[0], args.slice(1).join(':'), chatId, messageId)
        break

      default:
        break
    }
  } catch (error) {
    console.error('callback failed', query.data, error)
    toast = '⚠️ Не получилось — попробуйте ещё раз'
  }

  await ctx.tg.answer(query.id, toast)
}

async function onMailAction(
  ctx: Ctx,
  action: string,
  id: string,
  chatId: number,
  messageId: number,
) {
  if (action === 'hide') {
    await ctx.store.deleteMail(id)
    if (!(await ctx.tg.remove(chatId, messageId)))
      return 'Telegram не даёт удалить сообщения старше 48 часов'
    return undefined
  }

  const mail = await ctx.store.mail(id)
  if (!mail) return 'Письмо устарело — откройте его в Gmail'

  const next = ({ read: 'read', unread: 'unread', archive: 'archived' } as const)[action as 'read']
  if (!next) return undefined

  const synced = await gmailAction(ctx.env, action as 'read' | 'unread' | 'archive', id)
  mail.state = next
  await ctx.store.saveMail(mail)

  const screen = mailScreen(mail, ctx.tz, Boolean(ctx.env.GMAIL_ACTION_URL))
  await ctx.tg.edit(chatId, messageId, screen.text, screen.keyboard)

  const label = { read: '✅ Прочитано', unread: '📬 Непрочитано', archived: '🗄 В архиве' }[next]
  if (!ctx.env.GMAIL_ACTION_URL) return label
  return synced ? `${label} — и в Gmail тоже` : `${label}, но Gmail не ответил`
}
