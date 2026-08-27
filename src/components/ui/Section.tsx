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
 * Каркас секции: слева крупный номер с названием раздела, справа заголовок
 * и содержимое. Номер стоит вровень с первой строкой заголовка — отступ
 * сверху компенсирует разницу между высотой строки и высотой самих букв.
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
      <div className="container-page grid gap-x-10 gap-y-10 lg:grid-cols-12">
        {/* Отступ подобран так, чтобы верх цифры совпал с верхом букв заголовка. */}
        <div className="lg:col-span-3 lg:pt-[19px]">
          <div className="flex items-baseline gap-4 lg:flex-col lg:items-start lg:gap-3">
            <span className="font-mono text-3xl leading-none font-medium text-accent lg:text-4xl">
              {index}
            </span>
            <span className="font-mono text-sm tracking-[0.16em] text-muted uppercase lg:text-base">
              {eyebrow}
            </span>
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
