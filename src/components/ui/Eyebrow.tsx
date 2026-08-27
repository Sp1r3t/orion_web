import type { ReactNode } from 'react'

/** Мелкая подпись капсом над заголовком секции. */
export default function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-xs tracking-[0.2em] text-muted uppercase">
      <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
      {children}
    </p>
  )
}
