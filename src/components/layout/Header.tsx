import { Menu } from 'lucide-react'
import { useState } from 'react'

import MobileMenu from '@/components/layout/MobileMenu'
import Button from '@/components/ui/Button'
import { navItems, site, spySectionIds } from '@/content/site'
import { useScrolled } from '@/hooks/useScrolled'
import { useScrollSpy } from '@/hooks/useScrollSpy'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled()
  const activeId = useScrollSpy(spySectionIds)

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-20 transition-colors duration-300 ${
          scrolled ? 'border-b border-line bg-bg/72 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="container-page flex h-full items-center justify-between gap-6">
          <a
            href="#top"
            className="font-display text-xl font-bold tracking-[-0.02em] uppercase transition-colors duration-300 hover:text-accent"
          >
            {site.name}
          </a>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Разделы сайта">
            {navItems.map((item) => {
              const active = activeId === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={active ? 'true' : undefined}
                  className={`group relative text-sm transition-colors duration-300 ${
                    active ? 'text-accent' : 'text-muted hover:text-text'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-300 ${
                      active ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={site.telegram}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden text-sm text-muted transition-colors duration-300 hover:text-text xl:inline"
            >
              Telegram
            </a>
            <Button href="#contact" variant="light" className="hidden lg:inline-flex">
              Обсудить проект
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
              className="p-2 text-text transition-colors duration-300 hover:text-accent lg:hidden"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} activeId={activeId} onClose={() => setMenuOpen(false)} />
    </>
  )
}
