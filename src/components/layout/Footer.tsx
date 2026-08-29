import { ArrowUp } from 'lucide-react'
import { useRef } from 'react'
import type { PointerEvent } from 'react'

import FooterStars from '@/components/ui/FooterStars'
import { useContent } from '@/i18n/context'

export default function Footer() {
  const { site, navItems, ui } = useContent()
  const markRef = useRef<HTMLParagraphElement>(null)

  /** Свет в буквах идёт за курсором по всему подвалу, а не только над ними. */
  function trackGlow(event: PointerEvent<HTMLElement>) {
    const mark = markRef.current
    if (!mark) return

    const rect = mark.getBoundingClientRect()
    mark.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    mark.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }

  return (
    <footer
      onPointerMove={trackGlow}
      className="relative overflow-hidden border-t border-line pt-20"
    >
      {/* Звёздное поле на весь подвал: курсор расталкивает звёзды и вяжет их в паутину. */}
      <FooterStars />

      <div className="relative container-page">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="max-w-sm text-lg text-balance">{ui.footer.line}</p>
            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-2 text-accent transition-colors hover:text-accent-hover"
            >
              {ui.footer.cta}
            </a>
          </div>

          <nav className="lg:col-span-3" aria-label={ui.footer.sections}>
            <p className="label-mono text-muted">{ui.footer.sections}</p>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="group inline-flex items-center gap-2 transition-colors hover:text-accent"
                  >
                    <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-4" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <p className="label-mono text-muted">{ui.footer.contacts}</p>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              <li>
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-accent">
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                  className="transition-colors hover:text-accent"
                >
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={site.telegram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-accent"
                >
                  Telegram
                </a>
              </li>
            </ul>
            <p className="label-mono mt-6 text-muted">{site.city}</p>
          </div>
        </div>

        {/* Леттеринг-подпись: буквы тёмные, и только под курсором в них
            разливается акцентный свет. Размер умеренный, снизу оставлен
            воздух — с прежним кеглем буквы наезжали на линию и текст. */}
        <div className="mt-20 mb-10">
          <p
            ref={markRef}
            aria-hidden="true"
            className="wordmark text-display text-center text-[clamp(3.5rem,15vw,11rem)] leading-[0.85] tracking-[0.04em]"
          >
            {site.name}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {ui.footer.rights}
          </p>
          <a
            href="#top"
            className="group inline-flex items-center gap-2 transition-colors hover:text-accent"
          >
            <ArrowUp className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            {ui.footer.top}
          </a>
        </div>
      </div>
    </footer>
  )
}
