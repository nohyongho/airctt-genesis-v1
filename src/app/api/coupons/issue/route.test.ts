import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock the postgrest client
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/postgrest', () => ({
  createPostgrestClient: () => ({
    from: () => ({
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle,
        }),
      }),
    }),
  }),
}))

describe('POST /api/coupons/issue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if consumer_id is missing', async () => {
    const request = new Request('http://localhost/api/coupons/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coupon_id: 'coupon-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing parameters')
  })

  it('should return 400 if coupon_id is missing', async () => {
    const request = new Request('http://localhost/api/coupons/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumer_id: 'consumer-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing parameters')
  })

  it('should successfully issue a coupon', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'issue-123', status: 'ISSUED' },
      error: null,
    })

    const request = new Request('http://localhost/api/coupons/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        coupon_id: 'coupon-123',
        reason: 'GAME_REWARD',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.coupon_issue_id).toBe('issue-123')
    expect(data.status).toBe('ISSUED')
  })

  it('should use default reason if not provided', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'issue-123', status: 'ISSUED' },
      error: null,
    })

    const request = new Request('http://localhost/api/coupons/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        coupon_id: 'coupon-123',
      }),
    })

    await POST(request)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        issued_reason: 'MANUAL',
      })
    )
  })

  it('should return 500 if database insert fails', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    })

    const request = new Request('http://localhost/api/coupons/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        coupon_id: 'coupon-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database error')
  })

  it('should return 500 on invalid JSON body', async () => {
    const request = new Request('http://localhost/api/coupons/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })
})
