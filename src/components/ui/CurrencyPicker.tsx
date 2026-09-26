import { AnimatePresence, m } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useCurrency } from '@/context/currencyContext'
import { useContent } from '@/i18n/context'
import { currencies } from '@/lib/currency'

/**
 * Выбор валюты сметы. Курсы живые, поэтому под списком стоит дата, на которую
 * они взяты: цифры в смете — ориентир, и человек должен видеть, откуда он.
 */
export default function CurrencyPicker() {
  const { currency, date, setCurrencyId } = useCurrency()
  const { ui } = useContent()
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const shownDate = new Intl.DateTimeFormat(ui.locale, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ui.pricing.currency}
        className={`group flex h-8 items-center gap-1.5 rounded-full border px-2.5 transition-colors duration-300 ${
          open
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-line text-muted hover:border-accent/50 hover:text-text'
        }`}
      >
        <span className="font-display text-sm leading-none text-accent">{currency.symbol}</span>
        <span className="label-mono leading-none">{currency.code}</span>
        <ChevronDown
          className={`size-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            role="menu"
            aria-label={ui.pricing.currency}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-card absolute top-full right-0 z-50 mt-2 w-56 origin-top-right border border-line bg-surface-2 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]"
          >
            {currencies.map((item) => {
              const active = item.id === currency.id

              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setCurrencyId(item.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-[0.625rem] px-2.5 py-2 text-left transition-colors duration-200 ${
                    active ? 'bg-accent/12 text-accent' : 'text-text hover:bg-accent/6'
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full border font-display text-sm transition-colors duration-200 ${
                      active ? 'border-accent bg-accent/15 text-accent' : 'border-line text-muted'
                    }`}
                  >
                    {item.symbol}
                  </span>
                  <span className="flex-1 text-sm">{ui.pricing.currencies[item.id]}</span>
                  <span className={`label-mono ${active ? 'text-accent' : 'text-muted'}`}>
                    {item.code}
                  </span>
                  {active && <Check className="size-3.5 shrink-0" />}
                </button>
              )
            })}

            <p className="label-mono border-t border-line px-2.5 pt-2.5 pb-1 text-muted">
              {ui.pricing.rateAt} {shownDate}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
