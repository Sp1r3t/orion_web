import type { Lead, LeadIndexItem, Mail, Settings } from './types.ts'

const INDEX = 'leads:index'
const SEQ = 'leads:seq'
const SETTINGS = 'settings'
const MENU = 'menu:message'
const PENDING_NOTE = 'pending:note'

/** Письма нужны боту только ради кнопок под карточкой — месяца хватает. */
const MAIL_TTL = 60 * 60 * 24 * 30
const INDEX_LIMIT = 1000

export const defaultSettings: Settings = { mail: true, quiet: false }

export function toIndexItem(lead: Lead): LeadIndexItem {
  return {
    id: lead.id,
    status: lead.status,
    name: lead.name,
    type: lead.estimate?.projectType || lead.task || '',
    createdAt: lead.createdAt,
  }
}

export class Store {
  private readonly kv: KVNamespace

  constructor(kv: KVNamespace) {
    this.kv = kv
  }

  async index(): Promise<LeadIndexItem[]> {
    return (await this.kv.get<LeadIndexItem[]>(INDEX, 'json')) ?? []
  }

  async nextLeadId(): Promise<number> {
    const [seq, index] = await Promise.all([this.kv.get(SEQ), this.index()])
    const next = Math.max(Number(seq) || 0, ...index.map((item) => item.id), 0) + 1
    await this.kv.put(SEQ, String(next))
    return next
  }

  lead(id: number) {
    return this.kv.get<Lead>(`lead:${id}`, 'json')
  }

  async saveLead(lead: Lead) {
    const index = (await this.index()).filter((item) => item.id !== lead.id)
    index.push(toIndexItem(lead))
    index.sort((a, b) => b.id - a.id)

    await Promise.all([
      this.kv.put(`lead:${lead.id}`, JSON.stringify(lead)),
      this.kv.put(INDEX, JSON.stringify(index.slice(0, INDEX_LIMIT))),
    ])
  }

  async deleteLead(id: number) {
    const index = (await this.index()).filter((item) => item.id !== id)
    await Promise.all([this.kv.delete(`lead:${id}`), this.kv.put(INDEX, JSON.stringify(index))])
  }

  async settings(): Promise<Settings> {
    const saved = await this.kv.get<Partial<Settings>>(SETTINGS, 'json')
    return { ...defaultSettings, ...saved }
  }

  saveSettings(settings: Settings) {
    return this.kv.put(SETTINGS, JSON.stringify(settings))
  }

  mail(id: string) {
    return this.kv.get<Mail>(`mail:${id}`, 'json')
  }

  saveMail(mail: Mail) {
    return this.kv.put(`mail:${mail.id}`, JSON.stringify(mail), { expirationTtl: MAIL_TTL })
  }

  deleteMail(id: string) {
    return this.kv.delete(`mail:${id}`)
  }

  /** Последнее сообщение-меню: при новом /start старое убираем, чтобы чат не зарастал. */
  async menuMessage(): Promise<number | null> {
    const value = await this.kv.get(MENU)
    return value ? Number(value) : null
  }

  saveMenuMessage(id: number) {
    return this.kv.put(MENU, String(id))
  }

  /** Бот ждёт текст заметки: к какой заявке и какое сообщение-подсказку потом убрать. */
  pendingNote() {
    return this.kv.get<{ leadId: number; promptId: number }>(PENDING_NOTE, 'json')
  }

  savePendingNote(value: { leadId: number; promptId: number }) {
    return this.kv.put(PENDING_NOTE, JSON.stringify(value), { expirationTtl: 60 * 30 })
  }

  clearPendingNote() {
    return this.kv.delete(PENDING_NOTE)
  }

  /** Счётчик заявок с одного адреса за десять минут. */
  async hit(ip: string): Promise<number> {
    const key = `rate:${ip}`
    const count = (Number(await this.kv.get(key)) || 0) + 1
    await this.kv.put(key, String(count), { expirationTtl: 600 })
    return count
  }
}
