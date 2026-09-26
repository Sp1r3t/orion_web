import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

type Entry = { value: string; expires?: number }

/**
 * Замена Cloudflare KV для запуска на своём сервере: те же get/put/delete,
 * данные — в одном JSON-файле. Пишем через временный файл и rename, чтобы
 * сбой посреди записи не оставил файл обрезанным.
 */
export class FileKv {
  private readonly path: string
  private readonly data: Map<string, Entry>

  constructor(path: string) {
    this.path = path
    this.data = new Map()

    if (existsSync(path)) {
      const saved = JSON.parse(readFileSync(path, 'utf8')) as Record<string, Entry>
      for (const [key, entry] of Object.entries(saved)) this.data.set(key, entry)
    } else {
      mkdirSync(dirname(path), { recursive: true })
    }

    this.prune()
  }

  async get(key: string, type?: 'text' | 'json'): Promise<unknown> {
    const entry = this.data.get(key)
    if (!entry) return null
    if (entry.expires && entry.expires < Date.now()) {
      this.data.delete(key)
      return null
    }
    return type === 'json' ? JSON.parse(entry.value) : entry.value
  }

  async put(key: string, value: string, options: { expirationTtl?: number } = {}) {
    const expires = options.expirationTtl ? Date.now() + options.expirationTtl * 1000 : undefined
    this.data.set(key, { value, expires })
    this.save()
  }

  async delete(key: string) {
    if (this.data.delete(key)) this.save()
  }

  /** Просроченные записи (счётчики заявок, старые письма) не копим. */
  prune() {
    const now = Date.now()
    let changed = false
    for (const [key, entry] of this.data) {
      if (entry.expires && entry.expires < now) {
        this.data.delete(key)
        changed = true
      }
    }
    if (changed) this.save()
  }

  private save() {
    const temp = `${this.path}.tmp`
    writeFileSync(temp, JSON.stringify(Object.fromEntries(this.data)))
    renameSync(temp, this.path)
  }
}
