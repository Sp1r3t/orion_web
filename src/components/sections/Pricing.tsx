import Section from '@/components/ui/Section'
import Placeholder from '@/components/ui/Placeholder'

export default function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow="Тарифы"
      title={<>Прозрачные тарифы, понятные условия</>}
      lead="Фиксированная стоимость без сюрпризов — цену знаете до начала работы."
    >
      <Placeholder phase="фаза 4" />
    </Section>
  )
}
