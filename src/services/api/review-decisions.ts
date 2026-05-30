export const reviewDecisions = [
  { value: 'approve', label: 'Aprovar' },
  { value: 'reject', label: 'Rejeitar' },
  { value: 'needs_changes', label: 'Precisa de ajustes' }
] as const

export type ReviewDecision = (typeof reviewDecisions)[number]['value']

export function isReviewDecision(value: string): value is ReviewDecision {
  return reviewDecisions.some((decision) => decision.value === value)
}

export function reviewDecisionLabel(value: string | null | undefined) {
  return reviewDecisions.find((decision) => decision.value === value)?.label ?? 'Sem decisão'
}
