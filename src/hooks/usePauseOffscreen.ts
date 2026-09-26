import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Ставит CSS-анимации внутри блока на паузу, пока он за экраном: атрибут
 * `data-offscreen` подхватывают правила в index.css. Бесконечные анимации SVG
 * и прозрачности с переменными считает основной поток, и без паузы они
 * пересчитывали стили на каждом кадре прокрутки всей страницы.
 */
export function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver !== 'function') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        element.toggleAttribute('data-offscreen', !entry.isIntersecting)
      },
      { rootMargin: '100px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
}
