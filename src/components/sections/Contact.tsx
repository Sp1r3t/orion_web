import Section from '@/components/ui/Section'
import Placeholder from '@/components/ui/Placeholder'

export default function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="Связаться с нами"
      title={<>Давайте поговорим</>}
      lead="Расскажите о проекте — ответим в течение часа и предложим решение."
    >
      <Placeholder phase="фаза 5" />
    </Section>
  )
}
