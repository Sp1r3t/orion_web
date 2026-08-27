import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useState } from 'react'

import MobileMenu from '@/components/layout/MobileMenu'
import Button from '@/components/ui/Button'
import { navItems, site, spySectionIds } from '@/content/site'
import { useScrolled } from '@/hooks/useScrolled'
import { useScrollSpy } from '@/hooks/useScrollSpy'

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

  return (
    <>
      {/* При прокрутке хедер собирается в плавающую капсулу. */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className={`container-page ${scrolled ? 'pt-3' : 'pt-0'}`}>
          <motion.div
            layout
            transition={glide}
            animate={{
              backgroundColor: scrolled ? 'rgba(11, 11, 13, 0.85)' : 'rgba(11, 11, 13, 0)',
              borderColor: scrolled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0)',
              // Наверху блюра быть не должно: он размыл бы звёздное поле под хедером.
              backdropFilter: scrolled ? 'blur(24px)' : 'blur(0px)',
            }}
            style={{ borderRadius: 999 }}
            // Классы цвета — страховка на первый кадр: инлайновые стили framer перекроют их.
            className={`flex items-center border border-transparent bg-transparent ${
              scrolled
                ? 'h-14 gap-6 px-6 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] lg:mx-auto lg:w-fit lg:justify-start lg:gap-8'
                : 'h-20 w-full justify-between gap-6 px-0'
            }`}
          >
            <motion.a
              layout
              transition={glide}
              href="#top"
              className={`font-display font-bold tracking-[-0.02em] uppercase transition-[font-size,color] duration-500 hover:text-accent ${
                scrolled ? 'text-xl' : 'text-2xl lg:text-3xl'
              }`}
            >
              {site.name}
            </motion.a>

            <motion.nav
              layout
              transition={glide}
              className={`hidden items-center lg:flex ${scrolled ? 'gap-6' : 'gap-9'}`}
              aria-label="Разделы сайта"
            >
              {navItems.map((item) => {
                const active = activeId === item.id
                return (
                  <motion.a
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
                  </motion.a>
                )
              })}
            </motion.nav>

            <motion.div
              layout
              transition={glide}
              className={`flex items-center ${scrolled ? 'gap-3' : 'gap-4'}`}
            >
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
            </motion.div>
          </motion.div>
        </div>
      </header>

      <MobileMenu open={menuOpen} activeId={activeId} onClose={() => setMenuOpen(false)} />
    </>
  )
}
