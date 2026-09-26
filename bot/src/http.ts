export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}

/** Тело не длиннее limit символов, разобранное как JSON; иначе null. */
export async function readJson(request: Request, limit: number): Promise<unknown> {
  const raw = await request.text()
  if (raw.length > limit) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const str = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

export const num = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0
