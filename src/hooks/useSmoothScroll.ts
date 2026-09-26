import type Lenis from 'lenis'
import { useEffect } from 'react'

let instance: Lenis | null = null

/** Экземпляр нужен оверлеям: под открытым меню страница крутиться не должна. */
export function getLenis() {
  return instance
}

/**
 * Плавные переходы по якорям. Колесо и тач Lenis не трогает: их прокручивает
 * сам браузер в отдельном потоке композитора. Когда колесо вёл Lenis, страница
 * двигалась из JavaScript на каждом кадре, и любая работа основного потока
 * (звёздное поле, анимации) превращалась в подёргивание, а инерция — в задержку.
 *
 * Смещения у якорей нет: раздел встаёт верхним краем ровно к верху экрана.
 * С отступом под хедер над разделом оставалась полоса предыдущего — хедер
 * прозрачный и в прокрученном виде висит короткой капсулой, так что закрыть
 * её собой он не мог.
 *
 * Библиотека подгружается отдельным чанком после первого кадра: пока она
 * едет, работает обычная прокрутка браузера, а якоря — нативные.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let lenis: Lenis | null = null

    import('lenis').then(({ default: LenisCtor }) => {
      if (cancelled) return

      lenis = new LenisCtor({
        duration: 1.15,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        autoRaf: true,
        smoothWheel: false,
        anchors: { offset: 0 },
      })
      instance = lenis
    })

    return () => {
      cancelled = true
      lenis?.destroy()
      instance = null
    }
  }, [])
}
