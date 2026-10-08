import { domMax, LazyMotion } from 'framer-motion'
import { lazy, Suspense } from 'react'

import LoadBoundary from '@/components/ui/LoadBoundary'
import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'
import CurrencyProvider from '@/context/CurrencyProvider'
import EstimateProvider from '@/context/EstimateProvider'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import LanguageProvider from '@/i18n/LanguageProvider'

// Разделы ниже первого экрана и подвал грузятся отдельными чанками.
const Sections = lazy(() => import('@/components/sections/Sections'))
const Footer = lazy(() => import('@/components/layout/Footer'))

export default function App() {
  useSmoothScroll()

  return (
    <LazyMotion features={domMax}>
      <LanguageProvider>
        <CurrencyProvider>
          <EstimateProvider>
            <div className="grain">
              <Header />
              <main>
                <Hero />
                {/* Пока чанк едет, держим место — страница не прыгает под пальцем. */}
                <LoadBoundary>
                  <Suspense
                    fallback={
                      <div className="container-page min-h-[50vh] py-16" role="status">
                        {document.documentElement.lang === 'en' ? 'Loading…' : 'Загружаем разделы…'}
                      </div>
                    }
                  >
                    <Sections />
                  </Suspense>
                </LoadBoundary>
              </main>
              <LoadBoundary>
                <Suspense fallback={null}>
                  <Footer />
                </Suspense>
              </LoadBoundary>
            </div>
          </EstimateProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </LazyMotion>
  )
}
