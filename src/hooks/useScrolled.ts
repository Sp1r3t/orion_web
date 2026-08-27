import { useEffect, useState } from 'react'

/** true, когда страница прокручена ниже порога — хедер по этому сигналу получает фон. */
export function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
