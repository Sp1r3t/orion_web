import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Reviews from '@/components/sections/Reviews'

/** Активная точка подписана «Отзыв N» — по ней и проверяем, что слайд сменился. */
const activeLabel = () => screen.getByRole('tab', { selected: true }).getAttribute('aria-label')

describe('Reviews', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('сам переключает отзывы каждые семь секунд', () => {
    render(<Reviews />)
    expect(activeLabel()).toBe('Отзыв 1')

    act(() => {
      vi.advanceTimersByTime(7200)
    })
    expect(activeLabel()).toBe('Отзыв 2')

    act(() => {
      vi.advanceTimersByTime(7200)
    })
    expect(activeLabel()).toBe('Отзыв 3')
  })

  it('лежащий на блоке курсор не останавливает отсчёт навсегда', () => {
    const { container } = render(<Reviews />)
    const block = container.querySelector('.mt-16') as HTMLElement

    // Курсор заехал на блок и больше не двигается — так бывает, когда секция
    // проезжает под неподвижной мышью при прокрутке.
    fireEvent.pointerEnter(block)

    act(() => {
      vi.advanceTimersByTime(9000)
    })

    expect(activeLabel()).toBe('Отзыв 2')
  })

  it('не застревает: полоса продолжает идти после смены слайда', () => {
    render(<Reviews />)

    // Три полных цикла подряд — счётчик не должен замереть ни на одном.
    for (const expected of ['Отзыв 2', 'Отзыв 3', 'Отзыв 4']) {
      act(() => {
        vi.advanceTimersByTime(7200)
      })
      expect(activeLabel()).toBe(expected)
    }
  })
})
