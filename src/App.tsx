import { LazyMotion } from 'framer-motion'
import { lazy, Suspense } from 'react'

import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'
import CurrencyProvider from '@/context/CurrencyProvider'
import EstimateProvider from '@/context/EstimateProvider'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import LanguageProvider from '@/i18n/LanguageProvider'

// Возможности анимации (layout, жесты) подгружаются после первого кадра:
// до этого `m`-элементы рисуются в стартовом состоянии, без движка.
const loadMotion = () => import('@/lib/motionFeatures').then((mod) => mod.default)

// Разделы ниже первого экрана и подвал грузятся отдельными чанками.
const Sections = lazy(() => import('@/components/sections/Sections'))
const Footer = lazy(() => import('@/components/layout/Footer'))

export default function App() {
  useSmoothScroll()

  return (
    <LazyMotion features={loadMotion}>
      <LanguageProvider>
        <CurrencyProvider>
          <EstimateProvider>
            <div className="grain">
              <Header />
              <main>
                <Hero />
                {/* Пока чанк едет, держим место — страница не прыгает под пальцем. */}
                <Suspense fallback={<div className="min-h-[200vh]" aria-hidden="true" />}>
                  <Sections />
                </Suspense>
              </main>
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
            </div>
          </EstimateProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </LazyMotion>
  )
}
