import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils/cn';
import {
  base64ToHex,
  hexToBase64,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from '@/lib/utils/encoding';
import { formatDate, getDaysUntil, isExpired } from '@/lib/utils/date';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

describe('encoding utilities', () => {
  describe('base64ToHex', () => {
    it('should convert base64 to hex', () => {
      const base64 = 'SGVsbG8='; // "Hello" in base64
      const hex = base64ToHex(base64);
      expect(hex).toBe('48656c6c6f');
    });

    it('should handle empty string', () => {
      expect(base64ToHex('')).toBe('');
    });
  });

  describe('hexToBase64', () => {
    it('should convert hex to base64', () => {
      const hex = '48656c6c6f'; // "Hello" in hex
      const base64 = hexToBase64(hex);
      expect(base64).toBe('SGVsbG8=');
    });

    it('should handle empty string', () => {
      expect(hexToBase64('')).toBe('');
    });
  });

  describe('arrayBufferToBase64', () => {
    it('should convert ArrayBuffer to base64', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello"
      const base64 = arrayBufferToBase64(buffer);
      expect(base64).toBe('SGVsbG8=');
    });

    it('should handle empty buffer', () => {
      const buffer = new Uint8Array([]).buffer;
      expect(arrayBufferToBase64(buffer)).toBe('');
    });
  });

  describe('base64ToArrayBuffer', () => {
    it('should convert base64 to ArrayBuffer', () => {
      const base64 = 'SGVsbG8='; // "Hello"
      const buffer = base64ToArrayBuffer(base64);
      const array = new Uint8Array(buffer);
      expect(Array.from(array)).toEqual([72, 101, 108, 108, 111]);
    });

    it('should handle empty string', () => {
      const buffer = base64ToArrayBuffer('');
      expect(buffer.byteLength).toBe(0);
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain data integrity in base64 <-> hex conversion', () => {
      const original = 'SGVsbG8gV29ybGQ=';
      const hex = base64ToHex(original);
      const back = hexToBase64(hex);
      expect(back).toBe(original);
    });

    it('should maintain data integrity in base64 <-> ArrayBuffer conversion', () => {
      const original = 'SGVsbG8gV29ybGQ=';
      const buffer = base64ToArrayBuffer(original);
      const back = arrayBufferToBase64(buffer);
      expect(back).toBe(original);
    });
  });
});

describe('date utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan.*15.*2024/);
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-12-25');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-06-15');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('getDaysUntil', () => {
    it('should calculate days until future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const days = getDaysUntil(future);
      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(10);
    });

    it('should return negative for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const days = getDaysUntil(past);
      expect(days).toBeLessThan(0);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      const days = getDaysUntil(today);
      expect(days).toBeGreaterThanOrEqual(-1);
      expect(days).toBeLessThanOrEqual(1);
    });
  });

  describe('isExpired', () => {
    it('should return true for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(isExpired(past)).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      expect(isExpired(future)).toBe(false);
    });

    it('should handle string dates', () => {
      const past = new Date();
      past.setFullYear(past.getFullYear() - 1);
      expect(isExpired(past.toISOString())).toBe(true);
    });
  });
});