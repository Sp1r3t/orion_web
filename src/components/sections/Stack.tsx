import { useContent } from '@/i18n/context'

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const track = [...items, ...items]

  return (
    <div className="group overflow-hidden py-4" aria-hidden="true">
      <div
        className={`flex w-max items-center gap-12 group-hover:[animation-play-state:paused] ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
      >
        {track.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-display text-2xl whitespace-nowrap text-muted transition-colors duration-300 hover:text-accent lg:text-4xl"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Две встречные ленты со стеком — визуальная пауза между тяжёлыми секциями. */
export default function Stack() {
  const { stack, ui } = useContent()
  const half = Math.ceil(stack.length / 2)

  return (
    <section className="relative overflow-hidden border-t border-line py-16">
      <div className="container-page">
        <p className="label-mono text-muted">{ui.stack.title}</p>
      </div>
      <div className="mt-8 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <Row items={stack.slice(0, half)} />
        <Row items={stack.slice(half)} reverse />
      </div>
    </section>
  )
}
