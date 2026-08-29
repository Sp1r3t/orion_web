import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { EstimateContext } from '@/context/estimateContext'
import type { EstimateValue } from '@/context/estimateContext'
import { useContent } from '@/i18n/context'

/**
 * Состояние калькулятора живёт здесь, а не внутри секции тарифов:
 * форма заявки показывает тот же расчёт и отправляет его вместе с контактами.
 */
export default function EstimateProvider({ children }: { children: ReactNode }) {
  // Данные калькулятора берём из активного языка: id опций в обеих версиях
  // одинаковые, поэтому выбор посетителя переживает смену языка.
  const { pricingOptions, projectTypes, urgencyModes } = useContent()

  const [typeId, setTypeId] = useState(projectTypes[0].id)
  const [urgencyId, setUrgencyId] = useState(urgencyModes[0].id)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [attached, setAttached] = useState(false)

  const type = projectTypes.find((item) => item.id === typeId) ?? projectTypes[0]
  const urgency = urgencyModes.find((item) => item.id === urgencyId) ?? urgencyModes[0]

  const chosen = useMemo(
    () =>
      pricingOptions
        .map((option) => ({ option, count: counts[option.id] ?? 0 }))
        .filter((item) => item.count > 0),
    [counts, pricingOptions],
  )

  const totals = useMemo(() => {
    const extraPrice = chosen.reduce((sum, item) => sum + item.option.price * item.count, 0)
    const extraWeeks = chosen.reduce((sum, item) => sum + item.option.weeks * item.count, 0)

    const clean = type.base + extraPrice
    const min = clean * urgency.priceFactor
    // Без коэффициента верхней границы у типа нет: потолок равен полу и не показывается.
    const max = type.spread ? (type.base * type.spread + extraPrice) * urgency.priceFactor : min

    return {
      min: Math.round(min / 1000) * 1000,
      max: Math.round(max / 1000) * 1000,
      weeksMin: Math.max(1, Math.round((type.weeks[0] + extraWeeks) * urgency.timeFactor)),
      weeksMax: Math.max(2, Math.round((type.weeks[1] + extraWeeks) * urgency.timeFactor)),
      surcharge: Math.round((clean * (urgency.priceFactor - 1)) / 1000) * 1000,
    }
  }, [type, urgency, chosen])

  const setCount = useCallback((id: string, update: (current: number) => number) => {
    setCounts((prev) => ({ ...prev, [id]: update(prev[id] ?? 0) }))
  }, [])

  const value: EstimateValue = useMemo(
    () => ({
      type,
      urgency,
      counts,
      chosen,
      totals,
      openEnded: type.spread === undefined,
      attached,
      setTypeId,
      setUrgencyId,
      setCount,
      resetCounts: () => setCounts({}),
      attach: () => setAttached(true),
    }),
    [type, urgency, counts, chosen, totals, attached, setCount],
  )

  return <EstimateContext.Provider value={value}>{children}</EstimateContext.Provider>
}
