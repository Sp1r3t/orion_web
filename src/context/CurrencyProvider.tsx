import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { CurrencyContext } from '@/context/currencyContext'
import type { CurrencyValue } from '@/context/currencyContext'
import { useLanguage } from '@/i18n/context'
import type { Lang } from '@/i18n/types'
import { currencies, currencyById, fallbackRates, FALLBACK_DATE, fetchRates } from '@/lib/currency'
import type { CurrencyId, Rates } from '@/lib/currency'

const STORAGE_KEY = 'orion-currency'

/** Валюта языка: русская версия считает в рублях, английская — в долларах. */
const BY_LANG: Record<Lang, CurrencyId> = { ru: 'rub', en: 'usd' }

function isCurrencyId(value: unknown): value is CurrencyId {
  return currencies.some((item) => item.id === value)
}

/**
 * Ручной выбор храним вместе с языком, при котором он сделан. Если посетитель
 * вернулся уже на другом языке, выбор не применяется: цены должны начинаться
 * с валюты языка, а не показывать рубли на английской версии.
 */
function savedChoice(lang: Lang): CurrencyId | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const saved = JSON.parse(raw) as { id?: unknown; lang?: unknown }
    return saved.lang === lang && isCurrencyId(saved.id) ? saved.id : null
  } catch {
    return null
  }
}

function remember(id: CurrencyId, lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, lang }))
  } catch {
    // Не сохранили — выбор всё равно применён до конца сессии.
  }
}

export default function CurrencyProvider({ children }: { children: ReactNode }) {
  const { lang } = useLanguage()

  const [currencyId, setId] = useState<CurrencyId>(() => savedChoice(lang) ?? BY_LANG[lang])
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

  /**
   * Смена языка задаёт валюту заново и стирает прежний ручной выбор: включили
   * английский — цены в долларах, вернулись на русский — в рублях. Первый
   * проход эффекта пропускаем, иначе он затёр бы выбор, восстановленный из
   * хранилища при загрузке страницы.
   */
  const previousLang = useRef(lang)

  useEffect(() => {
    if (previousLang.current === lang) return

    previousLang.current = lang
    setId(BY_LANG[lang])
    remember(BY_LANG[lang], lang)
  }, [lang])

  const setCurrencyId = useCallback(
    (id: CurrencyId) => {
      setId(id)
      remember(id, lang)
    },
    [lang],
  )

  const value: CurrencyValue = useMemo(
    () => ({ currency: currencyById(currencyId), rates, date, setCurrencyId }),
    [currencyId, rates, date, setCurrencyId],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
