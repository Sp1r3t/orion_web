import Cases from '@/components/sections/Cases'
import Contact from '@/components/sections/Contact'
import Faq from '@/components/sections/Faq'
import Pricing from '@/components/sections/Pricing'
import Process from '@/components/sections/Process'
import Promises from '@/components/sections/Promises'
import Reviews from '@/components/sections/Reviews'
import Services from '@/components/sections/Services'
import Stack from '@/components/sections/Stack'

/**
 * Всё, что ниже первого экрана. Лежит отдельным чанком: пока он грузится,
 * первый экран уже нарисован и живой, а стартовый бандл не тащит за собой
 * тарифы, отзывы и остальные разделы.
 */
export default function Sections() {
  return (
    <>
      <Services />
      <Cases />
      <Process />
      <Stack />
      <Pricing />
      <Promises />
      <Reviews />
      <Faq />
      <Contact />
    </>
  )
}
