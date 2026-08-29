import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Cases from '@/components/sections/Cases'
import Contact from '@/components/sections/Contact'
import Faq from '@/components/sections/Faq'
import Hero from '@/components/sections/Hero'
import Pricing from '@/components/sections/Pricing'
import Process from '@/components/sections/Process'
import Promises from '@/components/sections/Promises'
import Reviews from '@/components/sections/Reviews'
import Services from '@/components/sections/Services'
import Stack from '@/components/sections/Stack'
import CurrencyProvider from '@/context/CurrencyProvider'
import EstimateProvider from '@/context/EstimateProvider'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import LanguageProvider from '@/i18n/LanguageProvider'

export default function App() {
  useSmoothScroll()

  return (
    <LanguageProvider>
      <CurrencyProvider>
        <EstimateProvider>
          <div className="grain">
            <Header />
            <main>
              <Hero />
              <Services />
              <Cases />
              <Process />
              <Stack />
              <Pricing />
              <Promises />
              <Reviews />
              <Faq />
              <Contact />
            </main>
            <Footer />
          </div>
        </EstimateProvider>
      </CurrencyProvider>
    </LanguageProvider>
  )
}
