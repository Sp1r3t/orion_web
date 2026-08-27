import { useEffect } from 'react'

/** Блокирует прокрутку страницы, пока открыт оверлей (мобильное меню). */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}
