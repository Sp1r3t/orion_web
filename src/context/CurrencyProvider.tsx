import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { CurrencyContext } from '@/context/currencyContext'
import type { CurrencyValue } from '@/context/currencyContext'
import { useLanguage } from '@/i18n/context'
import { currencies, currencyById, fallbackRates, FALLBACK_DATE, fetchRates } from '@/lib/currency'
import type { CurrencyId, Rates } from '@/lib/currency'

const STORAGE_KEY = 'orion-currency'

function isCurrencyId(value: unknown): value is CurrencyId {
  return currencies.some((item) => item.id === value)
}

function savedChoice(): CurrencyId | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return isCurrencyId(saved) ? saved : null
  } catch {
    return null
  }
}

export default function CurrencyProvider({ children }: { children: ReactNode }) {
  const { lang } = useLanguage()

  // Пока валюту не выбрали руками, она следует за языком: русскому — рубли,
  // английскому — доллары. Явный выбор язык уже не перебивает.
  const [chosen, setChosen] = useState<CurrencyId | null>(savedChoice)
  const [rates, setRates] = useState<Rates>(fallbackRates)
  const [date, setDate] = useState(FALLBACK_DATE)

  useEffect(() => {
    let cancelled = false

    fetchRates()
      .then((snapshot) => {
        if (cancelled) return
        setRates(snapshot.rates)
        setDate(snapshot.date)
      })
      .catch(() => {
        // Оба источника молчат — остаёмся на запасных курсах.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const setCurrencyId = useCallback((id: CurrencyId) => {
    setChosen(id)

    try {
      window.localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // Не сохранили — выбор всё равно применён до конца сессии.
    }
  }, [])

  const value: CurrencyValue = useMemo(
    () => ({
      currency: currencyById(chosen ?? (lang === 'en' ? 'usd' : 'rub')),
      rates,
      date,
      setCurrencyId,
    }),
    [chosen, lang, rates, date, setCurrencyId],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
