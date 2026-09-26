import type {
  Button,
  Keyboard,
  Lead,
  LeadIndexItem,
  LeadStatus,
  Mail,
  Screen,
  Settings,
} from './types.ts'

export const STATUS: Record<LeadStatus, { icon: string; label: string; plural: string }> = {
  new: { icon: '🟢', label: 'Новая', plural: 'Новые' },
  work: { icon: '🟡', label: 'В работе', plural: 'В работе' },
  done: { icon: '✅', label: 'Завершена', plural: 'Завершённые' },
  rejected: { icon: '⛔', label: 'Отклонена', plural: 'Отклонённые' },
}

export type Filter = LeadStatus | 'all'

export const FILTERS: Filter[] = ['new', 'work', 'done', 'rejected', 'all']

export function isFilter(value: string): value is Filter {
  return (FILTERS as string[]).includes(value)
}

const LINE = '━━━━━━━━━━━━━━━━'
const PAGE_SIZE = 6

export const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const cut = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value

export const btn = (text: string, data: string): Button => ({ text, callback_data: data })
export const link = (text: string, url: string): Button => ({ text, url })
const copy = (text: string, value: string): Button => ({ text, copy_text: { text: value } })

export function formatDate(iso: string, timeZone: string, withYear = true) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  return new Intl.DateTimeFormat('ru-RU', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: withYear ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

function counts(index: LeadIndexItem[]) {
  const result: Record<LeadStatus, number> = { new: 0, work: 0, done: 0, rejected: 0 }
  for (const item of index) result[item.status] += 1
  return result
}

// ─── Главное меню ────────────────────────────────────────────────────────────

export function menuScreen(index: LeadIndexItem[], settings: Settings, siteUrl?: string): Screen {
  const c = counts(index)

  const text = [
    '🪐 <b>ORION</b> · панель студии',
    LINE,
    '',
    `🟢 Новые — <b>${c.new}</b>`,
    `🟡 В работе — <b>${c.work}</b>`,
    `✅ Завершено — <b>${c.done}</b>`,
    `⛔ Отклонено — <b>${c.rejected}</b>`,
    '',
    `✉️ Почта: ${settings.mail ? 'пересылается' : '<i>на паузе</i>'}`,
    `🔔 Уведомления: ${settings.quiet ? 'без звука' : 'со звуком'}`,
  ]

  if (c.new > 0) {
    text.push('', `👉 <i>Ждут ответа: ${c.new} ${plural(c.new, 'заявка', 'заявки', 'заявок')}</i>`)
  } else if (index.length === 0) {
    text.push(
      '',
      '<i>Заявок пока нет — как только кто-то оставит её на сайте, она появится здесь.</i>',
    )
  }

  const keyboard: Keyboard = [
    [btn(`🟢 Новые · ${c.new}`, 'list:new:0'), btn(`🟡 В работе · ${c.work}`, 'list:work:0')],
    [btn('📋 Все заявки', 'list:all:0'), btn('📊 Статистика', 'stats')],
    [btn('⚙️ Настройки', 'settings'), btn('❓ Помощь', 'help')],
  ]
  if (siteUrl) keyboard.push([link('🌐 Открыть сайт', siteUrl)])

  return { text: text.join('\n'), keyboard }
}

// ─── Списки заявок ───────────────────────────────────────────────────────────

function filterTitle(filter: Filter) {
  return filter === 'all' ? '📋 Все заявки' : `${STATUS[filter].icon} ${STATUS[filter].plural}`
}

export function listScreen(index: LeadIndexItem[], filter: Filter, page: number): Screen {
  const items = filter === 'all' ? index : index.filter((item) => item.status === filter)
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const current = Math.min(Math.max(0, page), pages - 1)
  const slice = items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

  const text = [`<b>${filterTitle(filter)}</b> · ${items.length}`, LINE, '']
  if (items.length === 0) {
    text.push('Здесь пока пусто ✨')
  } else {
    text.push('Выберите заявку, чтобы открыть карточку.')
    if (pages > 1) text.push(`<i>Страница ${current + 1} из ${pages}</i>`)
  }

  const ctx = `${filter}.${current}`
  const keyboard: Keyboard = slice.map((item) => [
    btn(
      cut(
        `${STATUS[item.status].icon} #${item.id} · ${item.name}${item.type ? ` · ${item.type}` : ''}`,
        60,
      ),
      `lead:${item.id}:${ctx}`,
    ),
  ])

  if (pages > 1) {
    keyboard.push([
      btn(current > 0 ? '◀️' : '·', current > 0 ? `list:${filter}:${current - 1}` : 'noop'),
      btn(`${current + 1} / ${pages}`, 'noop'),
      btn(
        current < pages - 1 ? '▶️' : '·',
        current < pages - 1 ? `list:${filter}:${current + 1}` : 'noop',
      ),
    ])
  }

  // Быстрое переключение фильтра: текущий отмечен точкой.
  keyboard.push(
    FILTERS.map((item) =>
      btn(
        item === filter
          ? `• ${item === 'all' ? 'Все' : STATUS[item].icon} •`
          : item === 'all'
            ? 'Все'
            : STATUS[item].icon,
        `list:${item}:0`,
      ),
    ),
  )
  keyboard.push([btn('🏠 Меню', 'menu')])

  return { text: text.join('\n'), keyboard }
}

// ─── Карточка заявки ─────────────────────────────────────────────────────────

function contactButtons(contact: string): Button[] {
  const value = contact.trim()

  const telegram = value.match(/^(?:https?:\/\/)?(?:t\.me\/|@)([a-zA-Z][\w]{3,31})\/?$/)
  if (telegram) return [link('✈️ Написать в Telegram', `https://t.me/${telegram[1]}`)]

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    const compose = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(value)}&su=${encodeURIComponent('ORION — ваша заявка')}`
    return [link('📧 Написать письмо', compose)]
  }

  let digits = value.replace(/\D/g, '')
  if (/^[+\d\s()-]+$/.test(value) && digits.length >= 10 && digits.length <= 15) {
    // Российский номер через восьмёрку — к международному виду.
    if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`
    return [
      copy('📋 Скопировать номер', `+${digits}`),
      link('💬 WhatsApp', `https://wa.me/${digits}`),
    ]
  }

  return [copy('📋 Скопировать контакт', value)]
}

function field(icon: string, label: string, value: string) {
  return `${icon} <b>${label}:</b> ${esc(value)}`
}

function pageLabel(page: string) {
  try {
    const url = new URL(page)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return ` · <a href="${esc(url.href)}">${esc(url.host)}</a>`
  } catch {
    return ''
  }
}

export function leadText(lead: Lead, timeZone: string) {
  const status = STATUS[lead.status]
  const lines = [`${status.icon} <b>Заявка #${lead.id}</b> · ${status.label}`, LINE, '']

  lines.push(field('👤', 'Имя', lead.name), field('📞', 'Контакт', lead.contact))
  if (lead.task) lines.push(field('🧩', 'Задача', lead.task))
  if (lead.budget) lines.push(field('💰', 'Бюджет', lead.budget))

  if (lead.message) {
    lines.push(
      '',
      '💬 <b>Комментарий</b>',
      `<blockquote expandable>${esc(lead.message)}</blockquote>`,
    )
  }

  const estimate = lead.estimate
  if (estimate) {
    const range = estimate.openEnded
      ? `от ${rubles.format(estimate.priceMin)}`
      : `${rubles.format(estimate.priceMin)} — ${rubles.format(estimate.priceMax)}`
    const options = estimate.options.length
      ? estimate.options
          .map((item) => `${item.title}${item.count > 1 ? ` ×${item.count}` : ''}`)
          .join(', ')
      : 'без опций'

    lines.push(
      '',
      '🧮 <b>Расчёт на сайте</b>',
      `<blockquote>Тип: ${esc(estimate.projectType)}`,
      `Темп: ${esc(estimate.pace)}`,
      `Опции: ${esc(options)}`,
      `Вилка: <b>${range}</b>`,
      `Срок: ${estimate.weeksMin}–${estimate.weeksMax} нед.${
        estimate.currency && estimate.currency !== 'RUB'
          ? `\nКлиент смотрел цены в ${esc(estimate.currency)}`
          : ''
      }</blockquote>`,
    )
  }

  if (lead.note) lines.push('', '📝 <b>Заметка</b>', `<i>${esc(lead.note)}</i>`)

  lines.push('', `🕓 ${formatDate(lead.createdAt, timeZone)}${pageLabel(lead.page)}`)

  const last = lead.history[lead.history.length - 1]
  if (last && lead.history.length > 1) {
    lines.push(`🔄 ${status.label} с ${formatDate(last.at, timeZone)}`)
  }

  return lines.join('\n')
}

/**
 * ctx — откуда открыта карточка: пусто для уведомления, `фильтр.страница` для
 * списка. От него зависит кнопка «назад» и что делать после удаления.
 */
export function leadScreen(
  lead: Lead,
  timeZone: string,
  ctx: string,
  confirmDelete = false,
): Screen {
  const id = lead.id

  if (confirmDelete) {
    return {
      text: `${leadText(lead, timeZone)}\n\n⚠️ <b>Удалить заявку #${id}?</b> Восстановить её не получится.`,
      keyboard: [
        [btn('🗑 Да, удалить', `delok:${id}:${ctx}`), btn('↩️ Отмена', `lead:${id}:${ctx}`)],
      ],
    }
  }

  const to = (status: LeadStatus, text: string) => btn(text, `st:${id}:${status}:${ctx}`)
  const keyboard: Keyboard = []

  switch (lead.status) {
    case 'new':
      keyboard.push([to('work', '🟡 Взять в работу'), to('rejected', '⛔ Отклонить')])
      break
    case 'work':
      keyboard.push(
        [to('done', '✅ Завершить'), to('rejected', '⛔ Отклонить')],
        [to('new', '↩️ Вернуть в новые')],
      )
      break
    default:
      keyboard.push([to('work', '♻️ Вернуть в работу')])
  }

  keyboard.push(contactButtons(lead.contact))
  keyboard.push([
    btn(lead.note ? '📝 Изменить заметку' : '📝 Заметка', `note:${id}`),
    btn('🗑 Удалить', `del:${id}:${ctx}`),
  ])

  if (ctx) {
    const [filter, page] = ctx.split('.')
    keyboard.push([btn('⬅️ К списку', `list:${filter}:${page}`), btn('🏠 Меню', 'menu')])
  }

  return { text: leadText(lead, timeZone), keyboard }
}

export function deletedLeadScreen(id: number): Screen {
  return { text: `🗑 <s>Заявка #${id}</s> удалена.`, keyboard: [[btn('🏠 Меню', 'menu')]] }
}

// ─── Статистика ──────────────────────────────────────────────────────────────

export function statsScreen(index: LeadIndexItem[], now = Date.now()): Screen {
  const c = counts(index)
  const day = 24 * 60 * 60 * 1000
  const since = (days: number) =>
    index.filter((item) => now - new Date(item.createdAt).getTime() < days * day).length

  const closed = c.done + c.rejected
  const conversion = closed ? Math.round((c.done / closed) * 100) : null

  const types = new Map<string, number>()
  for (const item of index) if (item.type) types.set(item.type, (types.get(item.type) ?? 0) + 1)
  const top = [...types.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)

  const text = [
    '📊 <b>Статистика</b>',
    LINE,
    '',
    `Всего заявок: <b>${index.length}</b>`,
    `За 7 дней: <b>${since(7)}</b> · за 30 дней: <b>${since(30)}</b>`,
    '',
    `🟢 ${c.new}   🟡 ${c.work}   ✅ ${c.done}   ⛔ ${c.rejected}`,
    '',
    conversion === null
      ? '🎯 Конверсия появится после первых закрытых заявок'
      : `🎯 Конверсия: <b>${conversion}%</b> <i>(завершено из закрытых)</i>`,
  ]

  if (top.length) {
    text.push('', '🔥 <b>Чаще всего просят</b>')
    top.forEach(([type, count], i) => text.push(`${['🥇', '🥈', '🥉'][i]} ${esc(type)} — ${count}`))
  }

  return {
    text: text.join('\n'),
    keyboard: [[btn('🔄 Обновить', 'stats'), btn('🏠 Меню', 'menu')]],
  }
}

// ─── Настройки и помощь ──────────────────────────────────────────────────────

export function settingsScreen(settings: Settings, gmailActions: boolean): Screen {
  const text = [
    '⚙️ <b>Настройки</b>',
    LINE,
    '',
    `✉️ Пересылка почты: ${settings.mail ? '<b>включена</b>' : '<b>на паузе</b>'}`,
    `🔔 Звук уведомлений: ${settings.quiet ? '<b>выключен</b>' : '<b>включён</b>'}`,
    `🔗 Синхронизация с Gmail: ${gmailActions ? '<b>подключена</b>' : '<i>не подключена</i>'}`,
    '',
    '<i>Без синхронизации «Прочитано» и «В архив» меняют только карточку в Telegram.</i>',
  ]

  return {
    text: text.join('\n'),
    keyboard: [
      [
        btn(
          settings.mail ? '⏸ Поставить почту на паузу' : '▶️ Включить пересылку почты',
          'set:mail',
        ),
      ],
      [btn(settings.quiet ? '🔔 Включить звук' : '🔕 Присылать без звука', 'set:quiet')],
      [btn('🏠 Меню', 'menu')],
    ],
  }
}

export function helpScreen(): Screen {
  const text = [
    '❓ <b>Как пользоваться</b>',
    LINE,
    '',
    '<b>Заявки</b> приходят сюда сразу после отправки формы на сайте.',
    'Под каждой — кнопки статуса:',
    '🟢 Новая → 🟡 В работе → ✅ Завершена',
    '⛔ Отклонить можно на любом шаге, ♻️ вернуть — тоже.',
    '',
    '📝 <b>Заметка</b> — любая пометка к заявке: договорились о созвоне, прислали ТЗ.',
    '📞 Кнопка контакта открывает Telegram, почту или копирует номер.',
    '',
    '<b>Письма</b> с orion.company.web@gmail.com приходят отдельными карточками:',
    'открыть в Gmail, ответить, отметить прочитанным, убрать в архив.',
    '',
    '<b>Команды</b>',
    '/menu — панель студии',
    '/new — новые заявки',
    '/stats — статистика',
    '/settings — настройки',
    '/cancel — отменить ввод заметки',
  ]

  return { text: text.join('\n'), keyboard: [[btn('🏠 Меню', 'menu')]] }
}

// ─── Письма ──────────────────────────────────────────────────────────────────

/** Адрес из «Имя <адрес>». */
export function emailOf(from: string) {
  return from.match(/<([^>]+)>/)?.[1] ?? from.trim()
}

export function mailScreen(mail: Mail, timeZone: string, gmailActions: boolean): Screen {
  const header = {
    unread: '📬 <b>Новое письмо</b>',
    read: '📭 <b>Письмо</b> · прочитано',
    archived: '🗄 <b>Письмо</b> · в архиве',
  }[mail.state]

  const lines = [
    header,
    LINE,
    '',
    `<b>От:</b> ${esc(mail.from)}`,
    `<b>Тема:</b> ${esc(mail.subject || '(без темы)')}`,
    `<b>Дата:</b> ${formatDate(mail.date, timeZone)}`,
  ]

  const body = mail.body.trim()
  if (body) lines.push('', `<blockquote expandable>${esc(cut(body, 2800))}</blockquote>`)
  if (mail.attachments.length) lines.push('', `📎 ${esc(cut(mail.attachments.join(', '), 300))}`)

  const reply = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(emailOf(mail.from))}&su=${encodeURIComponent(
    mail.subject.startsWith('Re:') ? mail.subject : `Re: ${mail.subject}`,
  )}`

  const keyboard: Keyboard = [
    [
      link(
        '📖 Открыть в Gmail',
        `https://mail.google.com/mail/u/0/#all/${encodeURIComponent(mail.threadId)}`,
      ),
      link('↩️ Ответить', reply),
    ],
  ]

  const actions: Button[] = []
  if (mail.state === 'unread') actions.push(btn('✅ Прочитано', `m:read:${mail.id}`))
  if (mail.state === 'read') actions.push(btn('📬 Непрочитано', `m:unread:${mail.id}`))
  if (mail.state !== 'archived') actions.push(btn('🗄 В архив', `m:archive:${mail.id}`))
  actions.push(btn('🙈 Скрыть', `m:hide:${mail.id}`))
  keyboard.push(actions)

  if (!gmailActions && mail.state === 'unread') {
    lines.push(
      '',
      '<i>Отметки меняют только эту карточку — синхронизация с Gmail не подключена.</i>',
    )
  }

  return { text: lines.join('\n'), keyboard }
}

// ─── Чужие и первый запуск ───────────────────────────────────────────────────

export function guestScreen(siteUrl?: string, contactUrl?: string): Screen {
  const keyboard: Keyboard = []
  if (siteUrl)
    keyboard.push([link('🌐 Оставить заявку на сайте', `${siteUrl.replace(/\/$/, '')}/#contact`)])
  if (contactUrl) keyboard.push([link('✈️ Написать менеджеру', contactUrl)])

  return {
    text: [
      '👋 <b>Здравствуйте!</b>',
      '',
      'Это служебный бот веб-студии <b>ORION</b> — через него к нам приходят заявки.',
      '',
      'Чтобы обсудить проект, оставьте заявку на сайте или напишите нам напрямую — ответим в течение часа.',
    ].join('\n'),
    keyboard,
  }
}

export function setupScreen(chatId: number): Screen {
  return {
    text: [
      '🛠 <b>Бот почти готов</b>',
      '',
      `Ваш chat_id: <code>${chatId}</code>`,
      '',
      'Впишите его в ADMIN_CHAT_ID и перезапустите бота — после этого заявки и письма будут приходить только вам.',
      '',
      '• свой сервер: <code>/etc/orion-bot.env</code>, затем <code>sudo systemctl restart orion-bot</code>',
      '• Cloudflare: <code>npx wrangler secret put ADMIN_CHAT_ID</code>',
    ].join('\n'),
    keyboard: [],
  }
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
