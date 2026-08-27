import type { ReactNode } from 'react'

import Reveal from '@/components/ui/Reveal'

type SectionProps = {
  id: string
  index: string
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  className?: string
}

/**
 * Каркас секции: слева липкий индекс с подписью, справа заголовок и содержимое.
 * Липкая колонка держит контекст раздела в поле зрения, пока читаешь длинный блок.
 */
export default function Section({
  id,
  index,
  eyebrow,
  title,
  lead,
  children,
  className = '',
}: SectionProps) {
  return (
    <section id={id} className={`relative border-t border-line py-24 lg:py-32 ${className}`.trim()}>
      <div className="container-page grid gap-x-10 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <div className="flex items-baseline gap-4 lg:sticky lg:top-28 lg:flex-col lg:items-start lg:gap-3">
            <span className="label-mono text-accent">{index}</span>
            <span className="label-mono text-muted">{eyebrow}</span>
          </div>
        </div>

        <div className="lg:col-span-9">
          <Reveal>
            <h2 className="text-display text-[clamp(2rem,4.5vw,3.75rem)] text-balance">{title}</h2>
            {lead && <p className="mt-6 max-w-2xl text-lg text-muted">{lead}</p>}
          </Reveal>
          {children}
        </div>
      </div>
    </section>
  )
}
