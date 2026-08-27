type MarqueeProps = {
  items: string[]
  className?: string
}

/**
 * Бегущая строка: список дублируется, лента сдвигается на половину ширины —
 * из-за этого стык не виден и цикл выглядит бесконечным.
 */
export default function Marquee({ items, className = '' }: MarqueeProps) {
  const track = [...items, ...items]

  return (
    <div className={`group overflow-hidden ${className}`.trim()} aria-hidden="true">
      <div className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]">
        {track.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-8 px-8 text-xs tracking-[0.2em] text-muted uppercase"
          >
            {item}
            <span className="size-1 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  )
}
