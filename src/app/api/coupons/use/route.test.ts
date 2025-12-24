import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock variables
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/postgrest', () => ({
  createPostgrestClient: () => ({
    from: () => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      }),
    }),
  }),
}))

describe('POST /api/coupons/use', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if coupon_issue_id is missing', async () => {
    const request = new Request('http://localhost/api/coupons/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: 'store-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing parameters')
  })

  it('should return 400 if store_id is missing', async () => {
    const request = new Request('http://localhost/api/coupons/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coupon_issue_id: 'issue-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing parameters')
  })

  it('should return 404 if coupon not found', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    })

    const request = new Request('http://localhost/api/coupons/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coupon_issue_id: 'nonexistent-issue',
        store_id: 'store-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Coupon not found')
  })

  it('should return 400 if coupon is already used', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { status: 'USED' },
      error: null,
    })

    const request = new Request('http://localhost/api/coupons/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coupon_issue_id: 'issue-123',
        store_id: 'store-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Coupon cannot be used')
    expect(data.error).toContain('USED')
  })

  it('should return 400 if coupon is expired', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { status: 'EXPIRED' },
      error: null,
    })

    const request = new Request('http://localhost/api/coupons/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coupon_issue_id: 'issue-123',
        store_id: 'store-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('EXPIRED')
  })

  it('should successfully use a coupon', async () => {
    const usedAt = new Date().toISOString()

    // First call: verify coupon status
    mockSingle.mockResolvedValueOnce({
      data: { status: 'ISSUED' },
      error: null,
    })

    // Second call: update coupon
    mockSingle.mockResolvedValueOnce({
      data: { id: 'issue-123', status: 'USED', used_at: usedAt },
      error: null,
    })

    const request = new Request('http://localhost/api/coupons/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coupon_issue_id: 'issue-123',
        store_id: 'store-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('issue-123')
    expect(data.status).toBe('USED')
  })

  it('should return 500 on database update error', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { status: 'ISSUED' },
      error: null,
    })

    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Update failed' },
    })

    const request = new Request('http://localhost/api/coupons/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coupon_issue_id: 'issue-123',
        store_id: 'store-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Update failed')
  })
})
