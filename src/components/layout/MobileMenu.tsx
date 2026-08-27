import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

import Button from '@/components/ui/Button'
import { navItems, site } from '@/content/site'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

type MobileMenuProps = {
  open: boolean
  activeId: string
  onClose: () => void
}

export default function MobileMenu({ open, activeId, onClose }: MobileMenuProps) {
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 bg-bg lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          <div className="container-page flex h-20 items-center justify-between">
            <span className="font-display text-xl font-bold tracking-[-0.02em] uppercase">
              {site.name}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть меню"
              className="p-2 text-text transition-colors duration-300 hover:text-accent"
            >
              <X className="size-6" />
            </button>
          </div>

          <nav className="container-page mt-8 flex flex-col gap-2" aria-label="Разделы сайта">
            {navItems.map((item, index) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={onClose}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index + 0.05, duration: 0.35 }}
                className={`text-display border-b border-line py-4 text-4xl transition-colors duration-300 ${
                  activeId === item.id ? 'text-accent' : 'text-text'
                }`}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          <div className="container-page mt-10 flex flex-col gap-4">
            <Button href="#contact" size="lg" onClick={onClose}>
              Обсудить проект
            </Button>
            <Button href={site.telegram} variant="outline" size="lg">
              Telegram
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
