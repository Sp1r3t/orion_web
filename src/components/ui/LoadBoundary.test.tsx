import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import LoadBoundary from './LoadBoundary'
import PixelWord from './PixelWord'

function FailedChunk(): never {
  throw new Error('Failed to fetch dynamically imported module')
}

describe('loading fallbacks', () => {
  it('keeps surrounding content when a chunk fails and offers recovery', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(
        <>
          <h1>ORION</h1>
          <LoadBoundary>
            <FailedChunk />
          </LoadBoundary>
        </>,
      )
      expect(screen.getByRole('heading')).toHaveTextContent('ORION')
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:orion.company.web@gmail.com')
    } finally {
      log.mockRestore()
    }
  })

  it('shows the heading word when canvas is unavailable', () => {
    render(<PixelWord words={['создание', 'развитие']} />)
    expect(screen.getByText('создание')).not.toHaveClass('sr-only')
  })
})
