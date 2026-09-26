import { json, num, readJson, str } from './http'
import { Store } from './store'
import { Telegram } from './telegram'
import type { Env, Lead, LeadEstimate } from './types'
import { leadScreen } from './ui'

/** Сколько заявок с одного адреса пропускаем за десять минут. */
const RATE_LIMIT = 5

function corsHeaders(request: Request, env: Env): Record<string, string> | null {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean)

  if (!allowed.includes(origin)) return null

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function parseEstimate(value: unknown): LeadEstimate | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const options = Array.isArray(raw.options) ? raw.options.slice(0, 30) : []

  return {
    projectType: str(raw.projectType, 120),
    pace: str(raw.pace, 120),
    currency: str(raw.currency, 8) || undefined,
    openEnded: raw.openEnded === true,
    options: options.map((item) => {
      const option = (item ?? {}) as Record<string, unknown>
      return {
        title: str(option.title, 120),
        count: num(option.count) || 1,
        price: num(option.price),
      }
    }),
    priceMin: num(raw.priceMin),
    priceMax: num(raw.priceMax),
    weeksMin: num(raw.weeksMin),
    weeksMax: num(raw.weeksMax),
  }
}

/** Заявка с формы на сайте: проверяем, нумеруем, шлём карточку владельцу. */
export async function handleLead(request: Request, env: Env): Promise<Response> {
  const cors = corsHeaders(request, env)

  if (request.method === 'OPTIONS')
    return new Response(null, { status: cors ? 204 : 403, headers: cors ?? {} })
  if (request.method !== 'POST') return json({ error: 'method' }, 405)
  if (!cors) return json({ error: 'origin' }, 403)
  if (!env.ADMIN_CHAT_ID) return json({ error: 'not_configured' }, 503, cors)

  const store = new Store(env.KV)
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  if ((await store.hit(ip)) > RATE_LIMIT) return json({ error: 'rate_limited' }, 429, cors)

  const body = (await readJson(request, 20_000)) as Record<string, unknown> | null
  if (!body) return json({ error: 'bad_request' }, 400, cors)

  const name = str(body.name, 100)
  const contact = str(body.contact, 200)
  if (!name || !contact) return json({ error: 'name_and_contact_required' }, 400, cors)

  const now = new Date().toISOString()
  const lead: Lead = {
    id: await store.nextLeadId(),
    status: 'new',
    name,
    contact,
    task: str(body.task, 200),
    budget: str(body.budget, 100),
    message: str(body.message, 3000),
    estimate: parseEstimate(body.estimate),
    page: str(body.page, 300),
    createdAt: now,
    updatedAt: now,
    history: [{ status: 'new', at: now }],
  }

  // Сначала доставка: если Telegram недоступен, сайт покажет ошибку и запасной
  // вариант с копированием, а не «отправлено» в пустоту.
  const settings = await store.settings()
  const screen = leadScreen(lead, env.TIMEZONE || 'Europe/Moscow', '')
  const tg = new Telegram(env.BOT_TOKEN)

  try {
    lead.messageId = await tg.send(env.ADMIN_CHAT_ID, screen.text, screen.keyboard, {
      silent: settings.quiet,
    })
  } catch (error) {
    console.error('lead delivery failed', error)
    return json({ error: 'delivery_failed' }, 502, cors)
  }

  await store.saveLead(lead)
  return json({ ok: true, id: lead.id }, 200, cors)
}
