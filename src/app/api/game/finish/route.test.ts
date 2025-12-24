import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock variables
const mockUpdate = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockLimit = vi.fn()
const mockInsert = vi.fn()

vi.mock('@/lib/postgrest', () => ({
  createPostgrestClient: () => ({
    from: (table: string) => {
      if (table === 'game_sessions') {
        return {
          update: mockUpdate.mockReturnValue({
            eq: mockEq.mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'merchants') {
        return {
          select: mockSelect.mockReturnValue({
            limit: mockLimit.mockReturnValue({
              single: mockSingle,
            }),
          }),
        }
      }
      if (table === 'coupons') {
        return {
          select: mockSelect.mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: mockLimit.mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }
      }
      if (table === 'coupon_issues') {
        return {
          insert: mockInsert.mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }
      }
      return {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
      }
    },
  }),
}))

// Mock CRM service
vi.mock('@/lib/crm-service', () => ({
  registerCustomerInteraction: vi.fn().mockResolvedValue({ success: true }),
}))

describe('POST /api/game/finish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if session_id is missing', async () => {
    const request = new Request('http://localhost/api/game/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps_cleared: 5, success: true }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('session_id')
  })

  it('should return success false when game fails', async () => {
    mockEq.mockResolvedValue({ error: null })

    const request = new Request('http://localhost/api/game/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'session-123',
        steps_cleared: 2,
        success: false,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(false)
    expect(data.message).toContain('no reward')
  })

  it('should update game session with correct data', async () => {
    mockEq.mockResolvedValue({ error: null })

    const request = new Request('http://localhost/api/game/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'session-123',
        steps_cleared: 5,
        success: false,
        client_info: { device: 'mobile' },
      }),
    })

    await POST(request)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        steps_cleared: 5,
        success: false,
        client_info: { device: 'mobile' },
      })
    )
  })

  it('should handle database update and proceed with game logic', async () => {
    // This test verifies the happy path where update succeeds
    mockEq.mockResolvedValue({ error: null })

    const request = new Request('http://localhost/api/game/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'session-123',
        steps_cleared: 5,
        success: false,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(false)
    expect(data.message).toContain('no reward')
  })

  it('should handle success with no merchant found', async () => {
    mockEq.mockResolvedValue({ error: null })
    mockSingle.mockResolvedValueOnce({ data: null }) // No merchant

    const request = new Request('http://localhost/api/game/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'session-123',
        steps_cleared: 10,
        success: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('No merchant')
  })

  it('should issue coupon on successful game completion', async () => {
    mockEq.mockResolvedValue({ error: null })

    // Mock merchant found
    mockSingle.mockResolvedValueOnce({
      data: { id: 'merchant-123' },
    })

    // Mock coupon found
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'coupon-123',
        title: 'Test Coupon',
        discount_value: 1000,
        discount_type: 'AMOUNT',
      },
    })

    // Mock coupon issue success
    mockSingle.mockResolvedValueOnce({
      data: { id: 'issue-123' },
      error: null,
    })

    const request = new Request('http://localhost/api/game/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'session-123',
        steps_cleared: 10,
        success: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.reward_type).toBe('COUPON')
    expect(data.reward_value).toBe(1000)
    expect(data.coupon_title).toBe('Test Coupon')
    expect(data.issue_id).toBe('issue-123')
  })

  it('should handle success with no coupon available', async () => {
    mockEq.mockResolvedValue({ error: null })

    // Mock merchant found
    mockSingle.mockResolvedValueOnce({
      data: { id: 'merchant-123' },
    })

    // Mock no coupon found
    mockSingle.mockResolvedValueOnce({
      data: null,
    })

    const request = new Request('http://localhost/api/game/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'session-123',
        steps_cleared: 10,
        success: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.reward_value).toBe(0)
    expect(data.issue_id).toBeNull()
  })

  it('should return 500 on invalid JSON', async () => {
    const request = new Request('http://localhost/api/game/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })
})
