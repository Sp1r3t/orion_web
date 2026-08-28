import { createContext, useContext } from 'react'

import { en } from './en'
import { money } from './format'
import { ru } from './ru'
import type { Bundle, Lang } from './types'

export const bundles: Record<Lang, Bundle> = { ru, en }

export type LanguageValue = {
  lang: Lang
  content: Bundle
  setLang: (next: Lang) => void
}

export const LanguageContext = createContext<LanguageValue | null>(null)

/**
 * Язык страницы. Без провайдера отдаём русскую версию — так отдельные компоненты
 * можно рендерить в тестах, не оборачивая их каждый раз.
 */
export function useLanguage(): LanguageValue {
  return useContext(LanguageContext) ?? { lang: 'ru', content: ru, setLang: () => {} }
}

export function useContent(): Bundle {
  return useLanguage().content
}

export function useMoney(): Intl.NumberFormat {
  return money(useContent().ui.locale)
}
