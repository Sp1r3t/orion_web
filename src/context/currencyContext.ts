import { createContext, useContext } from 'react'

import { currencyById, fallbackRates, FALLBACK_DATE, formatMoney } from '@/lib/currency'
import type { Currency, CurrencyId, Rates } from '@/lib/currency'
import { useContent } from '@/i18n/context'

export type CurrencyValue = {
  currency: Currency
  rates: Rates
  /** Дата, на которую взяты курсы. */
  date: string
  setCurrencyId: (id: CurrencyId) => void
}

export const CurrencyContext = createContext<CurrencyValue | null>(null)

/** Без провайдера — рубли по запасным курсам: так компонент рендерится и в тестах. */
export function useCurrency(): CurrencyValue {
  return (
    useContext(CurrencyContext) ?? {
      currency: currencyById('rub'),
      rates: fallbackRates,
      date: FALLBACK_DATE,
      setCurrencyId: () => {},
    }
  )
}

/**
 * Форматирование сумм калькулятора. Отдаём объект с методом `format`, как у
 * Intl.NumberFormat: на местах вызова ничего не меняется, а валюта и курс
 * приезжают из контекста.
 */
export function useMoney(): { format: (rubles: number) => string } {
  const { currency, rates } = useCurrency()
  const { ui } = useContent()

  return { format: (rubles) => formatMoney(rubles, currency, rates, ui.locale) }
}
