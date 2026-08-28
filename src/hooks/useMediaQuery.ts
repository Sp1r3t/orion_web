import { useEffect, useState } from 'react'

/** Следит за медиавыражением: раскладку иногда нужно решать в JS, а не в CSS. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(query).matches === true,
  )

  useEffect(() => {
    const media = window.matchMedia?.(query)
    if (!media) return

    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}
