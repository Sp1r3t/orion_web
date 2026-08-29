import Lenis from 'lenis'
import { useEffect } from 'react'

let instance: Lenis | null = null

/** Экземпляр нужен оверлеям: под открытым меню страница крутиться не должна. */
export function getLenis() {
  return instance
}

/**
 * Инерционная прокрутка: колесо не дёргает страницу рывками, а разгоняет и
 * мягко тормозит. Якорные ссылки Lenis перехватывает сам.
 *
 * Смещения у якорей нет: раздел встаёт верхним краем ровно к верху экрана.
 * С отступом под хедер над разделом оставалась полоса предыдущего — хедер
 * прозрачный и в прокрученном виде висит короткой капсулой, так что закрыть
 * её собой он не мог.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      autoRaf: true,
      anchors: { offset: 0 },
    })

    instance = lenis

    return () => {
      lenis.destroy()
      instance = null
    }
  }, [])
}
