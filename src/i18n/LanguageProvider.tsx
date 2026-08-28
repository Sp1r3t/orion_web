import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { bundles, LanguageContext } from './context'
import type { LanguageValue } from './context'
import type { Lang } from './types'

const STORAGE_KEY = 'orion-lang'

function isLang(value: unknown): value is Lang {
  return value === 'ru' || value === 'en'
}

/** Выбор при первом заходе: сохранённый язык, иначе язык браузера. */
function initialLang(): Lang {
  if (typeof window === 'undefined') return 'ru'

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    // Приватный режим — просто читаем язык браузера.
  }

  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

/**
 * Язык живёт одним состоянием на всё приложение: хук с собственным useState
 * в каждом вызывающем компоненте развёл бы копии, и переключатель в хедере
 * не достучался бы до остальных разделов.
 */
export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    const { meta } = bundles[lang].ui

    document.documentElement.lang = lang
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)

    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Не смогли сохранить — язык всё равно применён.
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])

  const value: LanguageValue = useMemo(
    () => ({ lang, content: bundles[lang], setLang }),
    [lang, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
