import { describe, expect, it, vi } from 'vitest'

import { getCompanySummary } from '@/services/api/summary.api'
import { apiClient } from '@/services/http/api-client'

vi.mock('@/services/http/api-client', () => ({
  apiClient: {
    get: vi.fn()
  }
}))

describe('summary.api', () => {
  it('uses /companies/:id/summary and preserves aggregate response shape', async () => {
    const summaryPayload = {
      company: { id: 'company-1', name: 'Rumo' },
      information: [{ id: 'info-1', title: 'Histórico' }],
      paint_schemes: [{ id: 'scheme-1', name: 'Azul e amarelo' }]
    }
    vi.mocked(apiClient.get).mockResolvedValue(summaryPayload)

    const response = await getCompanySummary('company-1')

    expect(apiClient.get).toHaveBeenCalledWith('/companies/company-1/summary')
    expect(response.company?.id).toBe('company-1')
    expect(Array.isArray(response.information)).toBe(true)
  })
})
