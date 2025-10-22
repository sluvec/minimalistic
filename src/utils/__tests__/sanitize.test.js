import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeFormData,
  sanitizeEmail,
  stripHtmlTags,
} from '../sanitize'

describe('sanitize utilities', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>world</strong></p>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
      expect(result).toContain('Hello')
    })

    it('should remove dangerous script tags', () => {
      const input = '<p>Hello</p><script>alert("XSS")</script>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
      expect(result).toContain('Hello')
    })

    it('should remove event handlers', () => {
      const input = '<p onclick="alert(\'XSS\')">Click me</p>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('onclick')
      expect(result).toContain('Click me')
    })

    it('should handle non-string input', () => {
      expect(sanitizeHtml(null)).toBe('')
      expect(sanitizeHtml(undefined)).toBe('')
      expect(sanitizeHtml(123)).toBe('')
    })
  })

  describe('sanitizeText', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("XSS")</script>'
      const result = sanitizeText(input)
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })

    it('should escape ampersands', () => {
      expect(sanitizeText('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('should escape quotes', () => {
      expect(sanitizeText('"Hello" \'World\'')).toContain('&quot;')
      expect(sanitizeText('"Hello" \'World\'')).toContain('&#x27;')
    })

    it('should handle non-string input', () => {
      expect(sanitizeText(null)).toBe('')
      expect(sanitizeText(undefined)).toBe('')
    })
  })

  describe('sanitizeUrl', () => {
    it('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
    })

    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
    })

    it('should allow mailto URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
    })

    it('should allow tel URLs', () => {
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890')
    })

    it('should block javascript protocol', () => {
      expect(sanitizeUrl('javascript:alert("XSS")')).toBe('')
    })

    it('should block data protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert("XSS")</script>')).toBe('')
    })

    it('should block vbscript protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBe('')
    })

    it('should handle non-string input', () => {
      expect(sanitizeUrl(null)).toBe('')
      expect(sanitizeUrl(123)).toBe('')
    })
  })

  describe('sanitizeFormData', () => {
    it('should sanitize all text fields by default', () => {
      const input = {
        name: '<script>alert("XSS")</script>',
        description: 'Normal text',
      }
      const result = sanitizeFormData(input)
      expect(result.name).not.toContain('<script>')
      expect(result.description).toBe('Normal text')
    })

    it('should sanitize HTML fields with sanitizeHtml', () => {
      const input = {
        content: '<p>Hello</p><script>alert("XSS")</script>',
      }
      const result = sanitizeFormData(input, { htmlFields: ['content'] })
      expect(result.content).toContain('<p>')
      expect(result.content).not.toContain('<script>')
    })

    it('should sanitize URL fields with sanitizeUrl', () => {
      const input = {
        website: 'javascript:alert("XSS")',
      }
      const result = sanitizeFormData(input, { urlFields: ['website'] })
      expect(result.website).toBe('')
    })

    it('should preserve non-string values', () => {
      const input = {
        name: 'Test',
        count: 42,
        active: true,
        metadata: { key: 'value' },
      }
      const result = sanitizeFormData(input)
      expect(result.count).toBe(42)
      expect(result.active).toBe(true)
      expect(result.metadata).toEqual({ key: 'value' })
    })
  })

  describe('sanitizeEmail', () => {
    it('should accept valid emails', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com')
      expect(sanitizeEmail('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk')
    })

    it('should lowercase emails', () => {
      expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com')
    })

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('not-an-email')).toBe('')
      expect(sanitizeEmail('@example.com')).toBe('')
      expect(sanitizeEmail('test@')).toBe('')
      expect(sanitizeEmail('test @example.com')).toBe('')
    })

    it('should handle non-string input', () => {
      expect(sanitizeEmail(null)).toBe('')
      expect(sanitizeEmail(123)).toBe('')
    })
  })

  describe('stripHtmlTags', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>world</strong></p>'
      const result = stripHtmlTags(input)
      expect(result).toBe('Hello world')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })

    it('should handle script tags', () => {
      const input = '<script>alert("XSS")</script>Normal text'
      const result = stripHtmlTags(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('Normal text')
    })
  })
})
