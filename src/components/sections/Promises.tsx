import Section from '@/components/ui/Section'
import Placeholder from '@/components/ui/Placeholder'

export default function Promises() {
  return (
    <Section
      id="promises"
      eyebrow="Обязательства"
      title={<>Почему с нами спокойно</>}
      lead="Не обещания, а условия — каждое фиксируется в договоре."
    >
      <Placeholder phase="фаза 4" />
    </Section>
  )
}
