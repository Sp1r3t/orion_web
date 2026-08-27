import Reveal from '@/components/ui/Reveal'
import Section from '@/components/ui/Section'
import { reviews } from '@/content/reviews'

export default function Reviews() {
  return (
    <Section
      id="testimonials"
      index="06"
      eyebrow="Отзывы"
      title={<>Что говорят клиенты</>}
      lead="Три истории про то, как менялись цифры после запуска."
    >
      <div className="mt-16 grid gap-4 lg:grid-cols-3">
        {reviews.map((review, index) => (
          <Reveal
            key={review.id}
            delay={index * 0.07}
            className={index === 1 ? 'lg:mt-12' : undefined}
          >
            <figure className="flex h-full flex-col justify-between rounded-card border border-line bg-surface p-7">
              <span
                aria-hidden="true"
                className="font-display text-5xl leading-none text-accent/40"
              >
                “
              </span>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-text">
                {review.quote}
              </blockquote>
              <figcaption className="mt-8 border-t border-line pt-5">
                <p className="text-sm font-medium">{review.author}</p>
                <p className="mt-1 text-xs text-muted">{review.role}</p>
                <p className="label-mono mt-4 inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">
                  {review.result}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
