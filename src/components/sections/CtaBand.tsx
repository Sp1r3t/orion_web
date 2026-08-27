import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { site } from '@/content/site'

/** Широкая CTA-полоса между портфолио и процессом. */
export default function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-surface py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[52rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
      />
      <div className="container-page relative">
        <Reveal className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-display text-[clamp(2rem,5vw,3.5rem)]">
              Готовы начать
              <br />
              ваш проект.
            </h2>
            <p className="mt-6 max-w-lg text-muted">
              Расскажите о задаче — подберём решение. Консультация бесплатно.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button href="#contact" size="lg">
              Оставить заявку
            </Button>
            <Button href={site.telegram} variant="outline" size="lg">
              Telegram
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
