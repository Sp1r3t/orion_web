const formatters = new Map<string, Intl.NumberFormat>()

/** Рубли в формате активного языка: «30 000 ₽» и «₽30,000». */
export function money(locale: string): Intl.NumberFormat {
  let formatter = formatters.get(locale)

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'RUB',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    })
    formatters.set(locale, formatter)
  }

  return formatter
}
