import type { ReactNode } from 'react'

import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'

type SectionProps = {
  id: string
  eyebrow?: string
  title?: ReactNode
  lead?: ReactNode
  bordered?: boolean
  className?: string
  children?: ReactNode
}

/** Каркас секции: якорь, верхняя граница, eyebrow + заголовок + лид. */
export default function Section({
  id,
  eyebrow,
  title,
  lead,
  bordered = true,
  className = '',
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative py-24 lg:py-32 ${bordered ? 'border-t border-line' : ''} ${className}`.trim()}
    >
      <div className="container-page">
        {(eyebrow || title || lead) && (
          <Reveal className="max-w-4xl">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && (
              <h2 className="text-display mt-6 text-[clamp(2rem,5vw,4rem)] text-balance">
                {title}
              </h2>
            )}
            {lead && <p className="mt-6 max-w-2xl text-lg text-muted">{lead}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  )
}
