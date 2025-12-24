import { vi } from 'vitest'

// Mock PostgrestClient response builder
export const createMockPostgrestClient = () => {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn(),
  }

  return {
    from: vi.fn(() => mockQueryBuilder),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    _mockQueryBuilder: mockQueryBuilder,
  }
}

// Helper to set mock response
export const setMockResponse = (
  mockClient: ReturnType<typeof createMockPostgrestClient>,
  data: any,
  error: any = null
) => {
  mockClient._mockQueryBuilder.single.mockResolvedValue({ data, error })
  mockClient._mockQueryBuilder.then = vi.fn((resolve) =>
    resolve({ data: Array.isArray(data) ? data : [data], error })
  )
}

export const setMockError = (
  mockClient: ReturnType<typeof createMockPostgrestClient>,
  errorMessage: string,
  errorCode?: string
) => {
  const error = { message: errorMessage, code: errorCode }
  mockClient._mockQueryBuilder.single.mockResolvedValue({ data: null, error })
}
