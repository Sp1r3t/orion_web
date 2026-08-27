import { ArrowUp } from 'lucide-react'

import { navItems, site } from '@/content/site'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line pt-20">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="max-w-sm text-lg text-balance">
              Собираем сайты и сервисы, которые считаются в деньгах.
            </p>
            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-2 text-accent transition-colors hover:text-accent-hover"
            >
              Создать сайт →
            </a>
          </div>

          <nav className="lg:col-span-3" aria-label="Разделы в подвале">
            <p className="label-mono text-muted">Разделы</p>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="transition-colors hover:text-accent">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <p className="label-mono text-muted">Контакты</p>
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
          </div>
        </div>

        {/* Крупный логотип-леттеринг: подпись студии во всю ширину подвала. */}
        <div className="mt-20 -mb-4 overflow-hidden lg:-mb-8">
          <p
            aria-hidden="true"
            className="text-display text-ember text-[clamp(4rem,19vw,17rem)] leading-none"
          >
            {site.name}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Все права защищены.
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-2 transition-colors hover:text-accent"
          >
            <ArrowUp className="size-3.5" />
            Наверх
          </a>
        </div>
      </div>
    </footer>
  )
}
