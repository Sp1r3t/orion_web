import Section from '@/components/ui/Section'
import Placeholder from '@/components/ui/Placeholder'

export default function Faq() {
  return (
    <Section
      id="faq"
      eyebrow="Вопросы"
      title={<>Частые вопросы</>}
      lead="Коротко о стоимости, сроках, договоре и поддержке после запуска."
    >
      <Placeholder phase="фаза 5" />
    </Section>
  )
}
