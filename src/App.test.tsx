import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '@/App'
import { navItems } from '@/content/site'

describe('App', () => {
  it('рендерит hero с названием студии', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Создаём')
  })

  it('каждый пункт хедера ведёт на существующую секцию', () => {
    const { container } = render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Разделы сайта' })

    for (const item of navItems) {
      const link = within(nav).getByRole('link', { name: item.label })
      expect(link).toHaveAttribute('href', `#${item.id}`)
      expect(container.querySelector(`section#${item.id}`)).not.toBeNull()
    }
  })
})
