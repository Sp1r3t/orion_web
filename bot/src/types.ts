export interface Env {
  KV: KVNamespace
  /** Токен от @BotFather. Секрет: `wrangler secret put BOT_TOKEN`. */
  BOT_TOKEN: string
  /** Чат владельца — только ему бот показывает заявки и письма. */
  ADMIN_CHAT_ID?: string
  /** Проверка, что вебхук зовёт именно Telegram, и ключ к /setup. */
  WEBHOOK_SECRET: string
  /** Общий секрет с Google Apps Script, который пересылает почту. */
  MAIL_SECRET: string
  /** Адрес веб-приложения Apps Script: через него бот помечает письма в Gmail. */
  GMAIL_ACTION_URL?: string
  /** Сайты, с которых принимаются заявки, через запятую. */
  ALLOWED_ORIGINS?: string
  SITE_URL?: string
  CONTACT_URL?: string
  TIMEZONE?: string
}

export type LeadStatus = 'new' | 'work' | 'done' | 'rejected'

export type LeadEstimate = {
  projectType: string
  pace: string
  currency?: string
  openEnded?: boolean
  options: Array<{ title: string; count: number; price: number }>
  priceMin: number
  priceMax: number
  weeksMin: number
  weeksMax: number
}

export type Lead = {
  id: number
  status: LeadStatus
  name: string
  contact: string
  task: string
  budget: string
  message: string
  estimate: LeadEstimate | null
  page: string
  createdAt: string
  updatedAt: string
  history: Array<{ status: LeadStatus; at: string }>
  note?: string
  /** Карточка-уведомление в чате: её правим при каждой смене статуса. */
  messageId?: number
}

/** Короткая запись о заявке: списки и статистика строятся по ней, не читая каждую. */
export type LeadIndexItem = {
  id: number
  status: LeadStatus
  name: string
  type: string
  createdAt: string
}

export type MailState = 'unread' | 'read' | 'archived'

export type Mail = {
  id: string
  threadId: string
  from: string
  subject: string
  date: string
  body: string
  attachments: string[]
  state: MailState
  messageId?: number
}

export type Settings = {
  /** Пересылать ли почту. */
  mail: boolean
  /** Уведомления без звука. */
  quiet: boolean
}

export type Button =
  | { text: string; callback_data: string }
  | { text: string; url: string }
  | { text: string; copy_text: { text: string } }

export type Keyboard = Button[][]

export type Screen = { text: string; keyboard: Keyboard }
