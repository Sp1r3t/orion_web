import { AnimatePresence, m } from 'framer-motion'
import { Info } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { useContent } from '@/i18n/context'

type InfoTipProps = {
  label: string
  text: string
}

/**
 * Кнопка-подсказка рядом с термином. Мышью открывается по наведению, с клавиатуры —
 * по фокусу, пальцем — по нажатию.
 *
 * Касание по кнопке браузер сопровождает эмуляцией наведения и фокусом, и прежде они
 * открывали подсказку, а следом клик тут же её закрывал — с телефона она открывалась
 * только со второго раза. Поэтому наведение слушаем только от мыши, а фокус считаем
 * клавиатурным, лишь если ему не предшествовало нажатие.
 */
export default function InfoTip({ label, text }: InfoTipProps) {
  const { ui } = useContent()
  const [open, setOpen] = useState(false)
  const id = useId()
  const rootRef = useRef<HTMLSpanElement>(null)
  /** Чем нажали последний раз: mouse, touch, pen или пусто для клавиатуры. */
  const pointer = useRef('')

  // Касание мимо закрывает подсказку: на iOS кнопка не получает фокус, и blur не придёт.
  useEffect(() => {
    if (!open) return

    function onOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', onOutside)
    return () => document.removeEventListener('pointerdown', onOutside)
  }, [open])

  return (
    <span ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={`${ui.pricing.what} ${label}`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setOpen(true)
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') setOpen(false)
        }}
        onPointerDown={(event) => {
          pointer.current = event.pointerType
        }}
        onFocus={() => {
          if (!pointer.current) setOpen(true)
        }}
        onBlur={() => {
          setOpen(false)
          pointer.current = ''
        }}
        onClick={(event) => {
          event.preventDefault()
          // Мышью подсказка уже открыта наведением — клик её не закрывает.
          if (pointer.current === 'mouse') setOpen(true)
          else setOpen((value) => !value)
        }}
        // На телефоне кнопка крупнее, а невидимая зона нажатия — около 44 px.
        className={`relative flex size-7 items-center justify-center rounded-full border transition-colors duration-300 after:absolute after:-inset-2 after:content-[''] lg:size-5 ${
          open
            ? 'border-accent bg-accent/15 text-accent'
            : 'border-line-strong text-muted hover:border-accent hover:text-accent'
        }`}
      >
        <Info className="size-4 lg:size-3" />
      </button>

      <AnimatePresence>
        {open && (
          <m.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-1/2 z-50 mb-3 w-72 -translate-x-1/2 rounded-card border border-accent/30 bg-surface-2 p-4 text-left text-xs leading-relaxed text-muted shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] sm:w-80"
          >
            <span className="label-mono mb-2 block text-accent">{label}</span>
            {text}
            {/* Уголок подсказки. */}
            <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-r border-b border-accent/30 bg-surface-2" />
          </m.span>
        )}
      </AnimatePresence>
    </span>
  )
}
