import { Component } from 'react'
import type { ReactNode } from 'react'

/** Ошибка чанка не должна заменять работающую страницу пустым экраном. */
export default class LoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    const english = document.documentElement.lang === 'en'
    return (
      <div role="alert" className="container-page py-16 text-text">
        <p>
          {english
            ? 'Part of the page could not load. Please reload to try again.'
            : 'Не удалось загрузить часть страницы. Обновите её, чтобы попробовать снова.'}
        </p>
        <button
          type="button"
          className="mt-4 rounded-lg border border-line px-5 py-3 hover:text-accent"
          onClick={() => window.location.reload()}
        >
          {english ? 'Reload page' : 'Обновить страницу'}
        </button>
        <p className="mt-4">
          <a href="mailto:orion.company.web@gmail.com">orion.company.web@gmail.com</a>
        </p>
      </div>
    )
  }
}
