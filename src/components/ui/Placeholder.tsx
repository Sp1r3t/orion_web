/** Временный блок вместо содержимого секции — убирается по мере прохождения фаз плана. */
export default function Placeholder({ phase }: { phase: string }) {
  return (
    <div className="mt-12 rounded-card border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
      Содержимое секции — {phase} плана (<code className="text-text">docs/PLAN.md</code>)
    </div>
  )
}
