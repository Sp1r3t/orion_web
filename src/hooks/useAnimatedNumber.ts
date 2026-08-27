import { useEffect, useRef, useState } from 'react'

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

/** Плавно догоняет новое значение — цена в калькуляторе не должна прыгать скачком. */
export function useAnimatedNumber(target: number, duration = 500) {
  const [reduced] = useState(prefersReducedMotion)
  const [value, setValue] = useState(target)
  const frameRef = useRef(0)
  const fromRef = useRef(target)

  useEffect(() => {
    if (reduced) return

    const from = fromRef.current
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const next = from + (target - from) * easeOut(progress)
      setValue(next)
      fromRef.current = next

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    // В фоновой вкладке requestAnimationFrame не вызывается — таймер гарантирует,
    // что значение всё равно доедет до цели, а не застынет на старом.
    const settle = window.setTimeout(() => {
      setValue(target)
      fromRef.current = target
    }, duration + 150)

    return () => {
      cancelAnimationFrame(frameRef.current)
      clearTimeout(settle)
    }
  }, [target, duration, reduced])

  return reduced ? target : Math.round(value)
}
