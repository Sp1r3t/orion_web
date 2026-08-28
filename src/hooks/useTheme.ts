import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'orion-theme'

function readStored(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Приватный режим может запретить хранилище — тогда просто берём тёмную.
  }

  return 'dark'
}

/** Тема живёт в атрибуте `data-theme` на html: токены переопределяются под него. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStored)

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Не смогли запомнить — не страшно, выбор проживёт до перезагрузки.
    }
  }, [theme])

  return { theme, setTheme }
}
