import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock variables
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

describe('POST /api/game/start', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if consumer_id is missing', async () => {
    const request = new Request('http://localhost/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_type: 'RABBIT_JUMP' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('consumer_id')
  })

  it('should return 400 if game_type is missing', async () => {
    const request = new Request('http://localhost/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumer_id: 'consumer-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('game_type')
  })

  it('should return 400 if both parameters are missing', async () => {
    const request = new Request('http://localhost/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
  })

  it('should successfully start a game session', async () => {
    const startedAt = new Date().toISOString()
    mockSingle.mockResolvedValue({
      data: { id: 'session-123', started_at: startedAt },
      error: null,
    })

    const request = new Request('http://localhost/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        game_type: 'RABBIT_JUMP',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.session_id).toBe('session-123')
    expect(data.started_at).toBe(startedAt)
  })

  it('should insert correct data into game_sessions', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'session-123', started_at: new Date().toISOString() },
      error: null,
    })

    const request = new Request('http://localhost/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        game_type: 'SLOT_MACHINE',
      }),
    })

    await POST(request)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        consumer_id: 'consumer-123',
        game_type: 'SLOT_MACHINE',
      })
    )
  })

  it('should return 500 on database error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    })

    const request = new Request('http://localhost/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: 'consumer-123',
        game_type: 'RABBIT_JUMP',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database connection failed')
  })

  it('should return 500 on invalid JSON', async () => {
    const request = new Request('http://localhost/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })
})
