import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validateName,
  validateImageFile,
  fileToBase64,
} from './validation'

describe('validateEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('user.name@example.co.kr')).toBe(true)
    expect(validateEmail('user+tag@example.org')).toBe(true)
    expect(validateEmail('user123@subdomain.example.com')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('invalid@')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('user @example.com')).toBe(false)
    expect(validateEmail('user@ example.com')).toBe(false)
  })

  it('should return false for email with spaces', () => {
    expect(validateEmail('user @domain.com')).toBe(false)
    expect(validateEmail(' user@domain.com')).toBe(false)
    expect(validateEmail('user@domain.com ')).toBe(false)
  })

  it('should return false for email without domain extension', () => {
    expect(validateEmail('user@domain')).toBe(false)
  })
})

describe('validateName', () => {
  it('should return true for valid names (2+ characters)', () => {
    expect(validateName('김철수')).toBe(true)
    expect(validateName('John')).toBe(true)
    expect(validateName('AB')).toBe(true)
    expect(validateName('Kim Chul-su')).toBe(true)
  })

  it('should return false for names with less than 2 characters', () => {
    expect(validateName('')).toBe(false)
    expect(validateName('A')).toBe(false)
    expect(validateName('김')).toBe(false)
  })

  it('should trim whitespace before validation', () => {
    expect(validateName('  ')).toBe(false)
    expect(validateName(' A ')).toBe(false)
    expect(validateName('  AB  ')).toBe(true)
  })

  it('should handle unicode characters', () => {
    expect(validateName('田中太郎')).toBe(true)
    expect(validateName('홍길동')).toBe(true)
    expect(validateName('李')).toBe(false) // Single character
  })
})

describe('validateImageFile', () => {
  const createMockFile = (name: string, type: string, size: number): File => {
    const blob = new Blob([''], { type })
    Object.defineProperty(blob, 'size', { value: size })
    return new File([blob], name, { type })
  }

  it('should accept valid JPEG files', () => {
    const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 1024)
    const result = validateImageFile(file)

    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should accept valid PNG files', () => {
    const file = createMockFile('test.png', 'image/png', 1024 * 1024)
    const result = validateImageFile(file)

    expect(result.valid).toBe(true)
  })

  it('should accept image/jpg type', () => {
    const file = createMockFile('test.jpg', 'image/jpg', 1024 * 1024)
    const result = validateImageFile(file)

    expect(result.valid).toBe(true)
  })

  it('should reject invalid file types', () => {
    const gifFile = createMockFile('test.gif', 'image/gif', 1024)
    expect(validateImageFile(gifFile).valid).toBe(false)
    expect(validateImageFile(gifFile).error).toContain('JPG 또는 PNG')

    const pdfFile = createMockFile('test.pdf', 'application/pdf', 1024)
    expect(validateImageFile(pdfFile).valid).toBe(false)

    const webpFile = createMockFile('test.webp', 'image/webp', 1024)
    expect(validateImageFile(webpFile).valid).toBe(false)
  })

  it('should reject files larger than 5MB', () => {
    // Create a real file-like object with proper size
    const largeSize = 6 * 1024 * 1024
    const buffer = new ArrayBuffer(largeSize)
    const blob = new Blob([buffer], { type: 'image/jpeg' })
    const largeFile = new File([blob], 'large.jpg', { type: 'image/jpeg' })

    const result = validateImageFile(largeFile)

    expect(result.valid).toBe(false)
    expect(result.error).toContain('5MB')
  })

  it('should accept files exactly 5MB', () => {
    const file = createMockFile('exact.jpg', 'image/jpeg', 5 * 1024 * 1024)
    const result = validateImageFile(file)

    expect(result.valid).toBe(true)
  })

  it('should accept very small files', () => {
    const file = createMockFile('tiny.png', 'image/png', 1)
    const result = validateImageFile(file)

    expect(result.valid).toBe(true)
  })
})

describe('fileToBase64', () => {
  it('should convert file to base64 string', async () => {
    const content = 'Hello, World!'
    const blob = new Blob([content], { type: 'text/plain' })
    const file = new File([blob], 'test.txt', { type: 'text/plain' })

    const result = await fileToBase64(file)

    expect(result).toContain('data:text/plain;base64,')
  })

  it('should handle empty files', async () => {
    const blob = new Blob([''], { type: 'text/plain' })
    const file = new File([blob], 'empty.txt', { type: 'text/plain' })

    const result = await fileToBase64(file)

    expect(result).toContain('data:text/plain;base64,')
  })

  it('should handle image files', async () => {
    // Create a minimal PNG-like blob
    const blob = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], {
      type: 'image/png',
    })
    const file = new File([blob], 'test.png', { type: 'image/png' })

    const result = await fileToBase64(file)

    expect(result).toContain('data:image/png;base64,')
  })
})
