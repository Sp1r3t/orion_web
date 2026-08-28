import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/App'
import { en } from '@/i18n/en'
import { ru } from '@/i18n/ru'

describe('App', () => {
  beforeEach(() => {
    // Без сохранённого выбора язык берётся из браузера, а в jsdom он английский.
    window.localStorage.setItem('orion-lang', 'ru')
  })

  it('рендерит hero с заголовком студии', () => {
    render(<App />)

    // Заголовок разбит на строки, поэтому пробелов между ними в textContent нет.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Держим\s*курс на/)
  })

  it('каждый пункт хедера ведёт на существующую секцию', () => {
    const { container } = render(<App />)
    const nav = screen.getByRole('navigation', { name: ru.ui.header.nav })

    for (const item of ru.navItems) {
      const link = within(nav).getByRole('link', { name: item.label })
      expect(link).toHaveAttribute('href', `#${item.id}`)
      expect(container.querySelector(`section#${item.id}`)).not.toBeNull()
    }
  })

  it('переключатель языка переводит страницу и запоминает выбор', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Holding\s*course for/)
    expect(screen.getByRole('navigation', { name: en.ui.header.nav })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(window.localStorage.getItem('orion-lang')).toBe('en')

    fireEvent.click(screen.getByRole('button', { name: 'Русский' }))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Держим\s*курс на/)
    expect(document.documentElement.lang).toBe('ru')
  })
})
