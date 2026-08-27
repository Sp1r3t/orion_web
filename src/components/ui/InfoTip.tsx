import { AnimatePresence, motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useId, useState } from 'react'

type InfoTipProps = {
  label: string
  text: string
}

/**
 * Кнопка-подсказка рядом с термином. Открывается по наведению и по фокусу с клавиатуры,
 * на тач-устройствах — по нажатию: там события наведения не приходят.
 */
export default function InfoTip({ label, text }: InfoTipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`Что такое «${label}»`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          event.preventDefault()
          setOpen((value) => !value)
        }}
        className={`flex size-5 items-center justify-center rounded-full border transition-colors duration-300 ${
          open
            ? 'border-accent bg-accent/15 text-accent'
            : 'border-line-strong text-muted hover:border-accent hover:text-accent'
        }`}
      >
        <Info className="size-3" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-1/2 z-40 mb-3 w-72 -translate-x-1/2 rounded-card border border-accent/30 bg-surface-2 p-4 text-left text-xs leading-relaxed text-muted shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] sm:w-80"
          >
            <span className="label-mono mb-2 block text-accent">{label}</span>
            {text}
            {/* Уголок подсказки. */}
            <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-r border-b border-accent/30 bg-surface-2" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
