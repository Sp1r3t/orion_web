import Section from '@/components/ui/Section'
import Placeholder from '@/components/ui/Placeholder'

export default function Testimonials() {
  return (
    <Section
      id="testimonials"
      eyebrow="Отзывы клиентов"
      title={<>Что говорят заказчики</>}
      lead="Короткие истории проектов и результат, который получил клиент."
    >
      <Placeholder phase="фаза 5" />
    </Section>
  )
}
