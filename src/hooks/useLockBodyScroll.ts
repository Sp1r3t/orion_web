import { useEffect } from 'react'

import { getLenis } from '@/hooks/useSmoothScroll'

/** Блокирует прокрутку страницы, пока открыт оверлей (мобильное меню). */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Инерционная прокрутка живёт своей жизнью и overflow её не останавливает.
    getLenis()?.stop()

    return () => {
      document.body.style.overflow = previous
      getLenis()?.start()
    }
  }, [locked])
}
