import { m } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useState } from 'react'

import MobileMenu from '@/components/layout/MobileMenu'
import Button from '@/components/ui/Button'
import LanguageToggle from '@/components/ui/LanguageToggle'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { spySectionIds } from '@/content/site'
import { useScrolled } from '@/hooks/useScrolled'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { useContent } from '@/i18n/context'

/**
 * Пружина для сборки хедера. Layout-анимация framer-motion меряет положение
 * до и после перестройки и переносит элементы из старых координат в новые —
 * без неё смена раскладки была бы мгновенным скачком.
 */
const glide = { type: 'spring', stiffness: 200, damping: 28, mass: 0.9 } as const

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled()
  const activeId = useScrollSpy(spySectionIds)
  const { site, navItems, ui } = useContent()

  return (
    <>
      {/* При прокрутке хедер собирается в плавающую капсулу. */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className={`container-page ${scrolled ? 'pt-3' : 'pt-0'}`}>
          <m.div
            layout
            transition={glide}
            style={{ borderRadius: 999 }}
            // Фон и рамку ведём классами, а не значениями framer: так они следуют за темой.
            // Блюр включается сразу, без анимации радиуса: плавно растущее размытие
            // перерисовывалось каждый кадр и давало рывок в начале прокрутки. Наверху
            // его нет вовсе — он размыл бы звёздное поле под хедером.
            className={`flex items-center border transition-colors duration-500 ${
              scrolled
                ? 'h-14 gap-6 border-line bg-bg/85 px-6 backdrop-blur-xl shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)] lg:mx-auto lg:w-fit lg:justify-start lg:gap-8'
                : 'h-20 w-full justify-between gap-6 border-transparent bg-transparent px-0'
            }`}
          >
            <m.a
              layout
              transition={glide}
              href="#top"
              className={`flex items-center gap-2.5 font-display font-bold tracking-[-0.02em] uppercase transition-[font-size,color] duration-500 hover:text-accent ${
                scrolled ? 'text-xl' : 'text-2xl lg:text-3xl'
              }`}
            >
              <img
                src="/favicon.svg?v=2"
                width={40}
                height={40}
                alt=""
                fetchPriority="high"
                className={`transition-[width,height] duration-500 ${
                  scrolled ? 'size-7' : 'size-8 lg:size-10'
                }`}
              />
              {site.name}
            </m.a>

            <m.nav
              layout
              transition={glide}
              className={`hidden items-center lg:flex ${scrolled ? 'gap-6' : 'gap-9'}`}
              aria-label={ui.header.nav}
            >
              {navItems.map((item) => {
                const active = activeId === item.id
                return (
                  <m.a
                    layout
                    transition={glide}
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
                  </m.a>
                )
              })}
            </m.nav>

            <m.div
              layout
              transition={glide}
              className={`flex items-center ${scrolled ? 'gap-3' : 'gap-4'}`}
            >
              <LanguageToggle />
              <ThemeToggle />
              {/* Прячем обёрткой: у самой кнопки в базовых классах есть inline-flex,
                  и он перебивает hidden — на телефоне кнопка выдавливала бургер за экран.
                  На десктопе contents убирает лишний бокс, раскладка не меняется. */}
              <span className="hidden lg:contents">
                <Button href="#contact" variant="light" size={scrolled ? 'sm' : 'md'}>
                  {ui.header.cta}
                </Button>
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={ui.header.openMenu}
                aria-expanded={menuOpen}
                className="p-2 text-text transition-colors duration-300 hover:text-accent lg:hidden"
              >
                <Menu className="size-6" />
              </button>
            </m.div>
          </m.div>
        </div>
      </header>

      <MobileMenu open={menuOpen} activeId={activeId} onClose={() => setMenuOpen(false)} />
    </>
  )
}
