import { navItems, site } from '@/content/site'

export default function Footer() {
  return (
    <footer className="border-t border-line pt-16">
      <div className="container-page">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-md">
            <a
              href="#top"
              className="font-display text-2xl font-bold tracking-[-0.02em] uppercase transition-colors duration-300 hover:text-accent"
            >
              {site.name}
            </a>
            <p className="mt-6 text-sm text-muted">{site.description}</p>
            <div className="mt-6 flex flex-col gap-1 text-sm">
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-accent">
                {site.email}
              </a>
              <a
                href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                className="transition-colors hover:text-accent"
              >
                {site.phone}
              </a>
            </div>
          </div>

          <div className="flex gap-16">
            <nav aria-label="Разделы в подвале">
              <p className="text-xs tracking-[0.2em] text-muted uppercase">Разделы</p>
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

            <div>
              <p className="text-xs tracking-[0.2em] text-muted uppercase">Контакты</p>
              <ul className="mt-5 flex flex-col gap-3 text-sm">
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
                <li>
                  <a href="#contact" className="transition-colors hover:text-accent">
                    Обсудить проект
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line py-8 text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Все права защищены.
          </p>
          <p>Принимаем заказы · Работаем по всей России</p>
        </div>
      </div>
    </footer>
  )
}
