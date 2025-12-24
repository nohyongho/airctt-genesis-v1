import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

// Mock variables
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/postgrest', () => ({
  createPostgrestClient: (token?: string) => ({
    from: (table: string) => {
      if (table === 'users') {
        return {
          select: mockSelect.mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: token ? { id: 'user-from-token' } : null,
              error: null,
            }),
          }),
        }
      }
      return {
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle,
          }),
        }),
      }
    },
  }),
}))

describe('GET /api/wallet/my-balance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return balance 0 if wallet not found', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    })

    const request = new Request('http://localhost/api/wallet/my-balance', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.balance).toBe(0)
  })

  it('should return existing balance from wallet', async () => {
    mockSingle.mockResolvedValue({
      data: { total_points: 5000 },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/my-balance', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.balance).toBe(5000)
  })

  it('should use default consumer key without auth token', async () => {
    mockSingle.mockResolvedValue({
      data: { total_points: 1000 },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/my-balance', {
      method: 'GET',
    })

    await GET(request)

    expect(mockEq).toHaveBeenCalledWith(
      'consumer_id',
      '00000000-0000-0000-0000-000000000000'
    )
  })

  it('should use user id from token when provided', async () => {
    mockSingle.mockResolvedValue({
      data: { total_points: 2500 },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/my-balance', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.balance).toBe(2500)
  })

  it('should return 500 on non-PGRST116 database error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST500', message: 'Internal database error' },
    })

    const request = new Request('http://localhost/api/wallet/my-balance', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal database error')
  })

  it('should handle zero balance correctly', async () => {
    mockSingle.mockResolvedValue({
      data: { total_points: 0 },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/my-balance', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.balance).toBe(0)
  })

  it('should handle large balance values', async () => {
    mockSingle.mockResolvedValue({
      data: { total_points: 999999999 },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/my-balance', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.balance).toBe(999999999)
  })
})
