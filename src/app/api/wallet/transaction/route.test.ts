import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock variables
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/postgrest', () => ({
  createPostgrestClient: () => ({
    from: (table: string) => {
      if (table === 'wallets') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              single: mockSingle,
            }),
          }),
          insert: mockInsert.mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
          update: mockUpdate.mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'wallet_transactions') {
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

describe('POST /api/wallet/transaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if consumer_id is missing', async () => {
    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ADD', amount_points: 100 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing parameters')
  })

  it('should return 400 if type is missing', async () => {
    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumer_id: 'consumer-123', amount_points: 100 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing parameters')
  })

  it('should return 400 if amount_points is missing', async () => {
    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumer_id: 'consumer-123', type: 'ADD' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing parameters')
  })

  it('should accept amount_points of 0', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'wallet-123', total_points: 1000 },
      error: null,
    })

    mockSingle.mockResolvedValueOnce({
      data: { id: 'tx-123', created_at: new Date().toISOString() },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        type: 'MANUAL',
        amount_points: 0,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
  })

  it('should create wallet if not exists', async () => {
    // First call: wallet not found
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    // Second call: wallet created
    mockSingle.mockResolvedValueOnce({
      data: { id: 'new-wallet-123', total_points: 0 },
      error: null,
    })

    // Third call: transaction created
    mockSingle.mockResolvedValueOnce({
      data: { id: 'tx-123', created_at: new Date().toISOString() },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'new-consumer',
        type: 'GAME_REWARD',
        amount_points: 500,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.new_balance).toBe(500)
  })

  it('should add points to existing wallet', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'wallet-123', total_points: 1000 },
      error: null,
    })

    mockSingle.mockResolvedValueOnce({
      data: { id: 'tx-123', created_at: new Date().toISOString() },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        type: 'GAME_REWARD',
        amount_points: 500,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
    expect(data.wallet_tx_id).toBe('tx-123')
    expect(data.new_balance).toBe(1500)
  })

  it('should subtract points (negative amount)', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'wallet-123', total_points: 1000 },
      error: null,
    })

    mockSingle.mockResolvedValueOnce({
      data: { id: 'tx-123', created_at: new Date().toISOString() },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        type: 'POINT_USE',
        amount_points: -300,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.new_balance).toBe(700)
  })

  it('should return 500 if transaction insert fails', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'wallet-123', total_points: 1000 },
      error: null,
    })

    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Transaction insert failed' },
    })

    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        type: 'GAME_REWARD',
        amount_points: 500,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Transaction insert failed')
  })

  it('should handle large point values', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'wallet-123', total_points: 500000000 },
      error: null,
    })

    mockSingle.mockResolvedValueOnce({
      data: { id: 'tx-123', created_at: new Date().toISOString() },
      error: null,
    })

    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        type: 'MEGA_BONUS',
        amount_points: 500000000,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.new_balance).toBe(1000000000)
  })

  it('should return 500 on invalid JSON', async () => {
    const request = new Request('http://localhost/api/wallet/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })
})
