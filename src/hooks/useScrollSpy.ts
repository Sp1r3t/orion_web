import { useEffect, useState } from 'react'

/**
 * Возвращает id секции, которая сейчас пересекает середину экрана.
 * Пустая строка — когда ни одна секция из списка не активна (например, мы в hero).
 */
export function useScrollSpy(ids: readonly string[]) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio)
          } else {
            visible.delete(entry.target.id)
          }
        }

        // Из пересекающих середину экрана берём самую заметную.
        let best = ''
        let bestRatio = 0
        for (const [id, ratio] of visible) {
          if (ratio >= bestRatio) {
            best = id
            bestRatio = ratio
          }
        }
        setActiveId(best)
      },
      // Узкая полоса по центру экрана: секция считается активной, пока проходит через неё.
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}
