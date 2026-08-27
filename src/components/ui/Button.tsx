import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'light'
type Size = 'md' | 'lg'

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:bg-accent-hover hover:shadow-glow',
  outline: 'border border-line text-text hover:border-accent hover:text-accent',
  light: 'bg-text text-bg hover:bg-accent hover:text-bg',
}

const sizes: Record<Size, string> = {
  md: 'h-10 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
}

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  variant?: Variant
  size?: Size
  children: ReactNode
}

/** Кнопка-ссылка: на странице все CTA ведут на якорь или во внешний мессенджер. */
export default function Button({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const external = href.startsWith('http')

  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : null)}
      {...props}
    >
      {children}
    </a>
  )
}
