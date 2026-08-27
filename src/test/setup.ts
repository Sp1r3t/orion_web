import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom не реализует IntersectionObserver, а его используют scroll-spy и анимации появления.
class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly scrollMargin = ''
  readonly thresholds: readonly number[] = []

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

// jsdom не реализует matchMedia — им проверяются настройки уменьшенной анимации.
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
)

// jsdom не умеет canvas — звёздное поле в тестах просто не рисуется.
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null as never)

afterEach(() => {
  cleanup()
})
