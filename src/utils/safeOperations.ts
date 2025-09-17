// Utilities for safe array and object operations to prevent crashes

export function safeProp<T>(obj: Record<string, unknown> | null | undefined, key: string, defaultValue: T): T {
  try {
    return obj && typeof obj === 'object' && key in obj ? obj[key] : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function safeArrayAccess<T>(array: T[] | undefined | null, index: number): T | undefined {
  if (!array || !Array.isArray(array) || index < 0 || index >= array.length) {
    return undefined;
  }
  return array[index];
}

export function safeStringAccess(str: string | undefined | null): string {
  return str || '';
}

export function safeNumberAccess(num: number | undefined | null): number {
  return typeof num === 'number' && !isNaN(num) ? num : 0;
}

export function withErrorBoundary<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.warn('Safe operation failed, using fallback:', error);
    return fallback;
  }
}