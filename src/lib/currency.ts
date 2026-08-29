export type CurrencyId = 'rub' | 'usd' | 'eur' | 'cny' | 'btc'

export type Currency = {
  id: CurrencyId
  /** Код по ISO 4217; у биткойна кода нет, но Intl принимает любые три буквы. */
  code: string
  symbol: string
  /** Знаков после запятой при выводе. */
  digits: number
  /** Шаг округления в единицах валюты: смета — ориентир, а не прайс до копейки. */
  step: number
}

export const currencies: Currency[] = [
  { id: 'rub', code: 'RUB', symbol: '₽', digits: 0, step: 1000 },
  { id: 'usd', code: 'USD', symbol: '$', digits: 0, step: 10 },
  { id: 'eur', code: 'EUR', symbol: '€', digits: 0, step: 10 },
  { id: 'cny', code: 'CNY', symbol: '¥', digits: 0, step: 100 },
  { id: 'btc', code: 'BTC', symbol: '₿', digits: 4, step: 0.0001 },
]

export function currencyById(id: CurrencyId): Currency {
  return currencies.find((item) => item.id === id) ?? currencies[0]
}

/** Сколько рублей в одной единице валюты. */
export type Rates = Record<CurrencyId, number>

/**
 * Запасные курсы — снимок на 29.08.2026. Ими считаем, пока не ответили сервисы
 * или если они недоступны: показать смету в выбранной валюте важнее, чем
 * дождаться точной цифры до копейки.
 */
export const fallbackRates: Rates = {
  rub: 1,
  usd: 86.03,
  eur: 99.98,
  cny: 12.79,
  btc: 6_688_769,
}

export const FALLBACK_DATE = '2026-08-29'

const STORAGE_KEY = 'orion-rates'
/** Курсы у обоих источников обновляются раз в сутки — чаще спрашивать незачем. */
const TTL = 6 * 60 * 60 * 1000

export type RatesSnapshot = { rates: Rates; date: string; fetchedAt: number }

function readCache(): RatesSnapshot | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as RatesSnapshot
    const fresh = Date.now() - parsed.fetchedAt < TTL
    const complete = currencies.every((item) => typeof parsed.rates?.[item.id] === 'number')

    return fresh && complete ? parsed : null
  } catch {
    return null
  }
}

function writeCache(snapshot: RatesSnapshot) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Приватный режим — просто посчитаем по свежим значениям без кэша.
  }
}

/**
 * Живые курсы из двух открытых источников: фиат у exchangerate-api, биткойн
 * у CoinGecko. Оба отвечают без ключа и с заголовками CORS. Запросы независимы:
 * упавший источник берёт запасное значение, остальные считаются по свежему.
 */
export async function fetchRates(): Promise<RatesSnapshot> {
  const cached = readCache()
  if (cached) return cached

  const rates: Rates = { ...fallbackRates }
  let date = FALLBACK_DATE

  const [fiat, btc] = await Promise.allSettled([
    fetch('https://open.er-api.com/v6/latest/RUB').then((res) => res.json()),
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub').then(
      (res) => res.json(),
    ),
  ])

  if (fiat.status === 'fulfilled' && fiat.value?.rates) {
    // Сервис отдаёт «единиц валюты за рубль» — нам нужно обратное.
    const perRub = fiat.value.rates as Record<string, number>
    for (const item of currencies) {
      const value = perRub[item.code]
      if (item.id !== 'btc' && typeof value === 'number' && value > 0) rates[item.id] = 1 / value
    }
    if (typeof fiat.value.time_last_update_unix === 'number') {
      date = new Date(fiat.value.time_last_update_unix * 1000).toISOString().slice(0, 10)
    }
  }

  if (btc.status === 'fulfilled' && typeof btc.value?.bitcoin?.rub === 'number') {
    rates.btc = btc.value.bitcoin.rub
  }

  const snapshot: RatesSnapshot = { rates, date, fetchedAt: Date.now() }
  writeCache(snapshot)
  return snapshot
}

/** Сумма в рублях → сумма в выбранной валюте, округлённая до шага. */
export function convert(rubles: number, currency: Currency, rates: Rates): number {
  const rate = rates[currency.id] || fallbackRates[currency.id]
  const value = rubles / rate
  return Math.round(value / currency.step) * currency.step
}

const formatters = new Map<string, Intl.NumberFormat>()

function formatter(locale: string, currency: Currency): Intl.NumberFormat {
  const key = `${locale}:${currency.code}:${currency.digits}`
  let cached = formatters.get(key)

  if (!cached) {
    cached = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: currency.digits,
      maximumFractionDigits: currency.digits,
    })
    formatters.set(key, cached)
  }

  return cached
}

/**
 * Сумма из калькулятора в том виде, в котором её видит посетитель.
 * У биткойна нет кода ISO, поэтому Intl подставляет в вывод сами буквы BTC —
 * меняем их на знак. Так место знака остаётся тем, что принято в языке.
 */
export function formatMoney(
  rubles: number,
  currency: Currency,
  rates: Rates,
  locale: string,
): string {
  const value = convert(rubles, currency, rates)
  const text = formatter(locale, currency).format(value)

  return currency.id === 'btc' ? text.replace('BTC', currency.symbol) : text
}
