import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Contact from '@/components/sections/Contact'
import CtaBand from '@/components/sections/CtaBand'
import Faq from '@/components/sections/Faq'
import Hero from '@/components/sections/Hero'
import Pricing from '@/components/sections/Pricing'
import Portfolio from '@/components/sections/Portfolio'
import Process from '@/components/sections/Process'
import Promises from '@/components/sections/Promises'
import Solutions from '@/components/sections/Solutions'
import Testimonials from '@/components/sections/Testimonials'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Solutions />
        <Portfolio />
        <CtaBand />
        <Process />
        <Pricing />
        <Promises />
        <Testimonials />
        <Contact />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
