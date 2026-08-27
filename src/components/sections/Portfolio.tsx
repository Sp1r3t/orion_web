import Section from '@/components/ui/Section'
import Placeholder from '@/components/ui/Placeholder'

export default function Portfolio() {
  return (
    <Section
      id="portfolio"
      eyebrow="Портфолио"
      title={<>Наши работы</>}
      lead="Проекты, которые уже работают и приносят заявки."
    >
      <Placeholder phase="фаза 3" />
    </Section>
  )
}
