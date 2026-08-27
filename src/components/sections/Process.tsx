import Section from '@/components/ui/Section'
import Placeholder from '@/components/ui/Placeholder'

export default function Process() {
  return (
    <Section
      id="process"
      eyebrow="Процесс"
      title={<>Три этапа. Прозрачно и понятно</>}
      lead="Вы видите работу по ходу, а не готовый результат в конце."
    >
      <Placeholder phase="фаза 4" />
    </Section>
  )
}
