import { createContext, useContext } from 'react'

import type { PricingOption, ProjectType, UrgencyMode } from '@/content/pricing'

export type ChosenOption = { option: PricingOption; count: number }

export type EstimateTotals = {
  min: number
  max: number
  weeksMin: number
  weeksMax: number
  surcharge: number
}

export type EstimateValue = {
  type: ProjectType
  urgency: UrgencyMode
  counts: Record<string, number>
  chosen: ChosenOption[]
  totals: EstimateTotals
  /** true — посетитель нажал «Обсудить смету», расчёт прикреплён к форме заявки. */
  attached: boolean
  setTypeId: (id: string) => void
  setUrgencyId: (id: string) => void
  setCount: (id: string, update: (current: number) => number) => void
  resetCounts: () => void
  attach: () => void
}

export const EstimateContext = createContext<EstimateValue | null>(null)

export function useEstimate() {
  const value = useContext(EstimateContext)
  if (!value) throw new Error('useEstimate доступен только внутри EstimateProvider')
  return value
}
