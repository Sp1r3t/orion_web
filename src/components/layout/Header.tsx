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
      {/* При прокрутке хедер собирается в плавающую капсулу. */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={`container-page transition-[padding] duration-500 ease-out ${
            scrolled ? 'pt-3' : 'pt-0'
          }`}
        >
          <div
            className={`flex items-center justify-between transition-all duration-500 ease-out ${
              scrolled
                ? 'h-14 gap-5 rounded-full border border-line bg-bg/85 px-5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl'
                : 'h-20 gap-6 rounded-full border border-transparent bg-transparent px-0'
            }`}
          >
            <a
              href="#top"
              className={`font-display font-bold tracking-[-0.02em] uppercase transition-all duration-500 hover:text-accent ${
                scrolled ? 'text-xl' : 'text-2xl lg:text-3xl'
              }`}
            >
              {site.name}
            </a>

            <nav
              className={`hidden items-center transition-all duration-500 ease-out lg:flex ${
                scrolled ? 'gap-6 lg:mr-auto lg:ml-8' : 'gap-9'
              }`}
              aria-label="Разделы сайта"
            >
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

            <div
              className={`flex items-center transition-all duration-500 ease-out ${
                scrolled ? 'gap-3' : 'gap-4'
              }`}
            >
              <a
                href={site.telegram}
                target="_blank"
                rel="noreferrer noopener"
                className="hidden text-sm text-muted transition-colors duration-300 hover:text-text xl:inline"
              >
                Telegram
              </a>
              <Button
                href="#contact"
                variant="light"
                size={scrolled ? 'sm' : 'md'}
                className="hidden lg:inline-flex"
              >
                Создать сайт
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
        </div>
      </header>

      <MobileMenu open={menuOpen} activeId={activeId} onClose={() => setMenuOpen(false)} />
    </>
  )
}
