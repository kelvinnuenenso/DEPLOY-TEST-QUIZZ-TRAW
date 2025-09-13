import { useMemo } from 'react';

export function useSafeArray<T>(array: T[] | undefined | null): T[] {
  return useMemo(() => array || [], [array]);
}

export function safeMap<T, R>(array: T[] | undefined | null, callback: (item: T, index: number) => R): R[] {
  if (!array || !Array.isArray(array)) return [];
  return array.map(callback);
}

export function safeFilter<T>(array: T[] | undefined | null, predicate: (item: T) => boolean): T[] {
  if (!array || !Array.isArray(array)) return [];
  return array.filter(predicate);
}

export function safeFind<T>(array: T[] | undefined | null, predicate: (item: T) => boolean): T | undefined {
  if (!array || !Array.isArray(array)) return undefined;
  return array.find(predicate);
}

export function safeLength(array: any[] | undefined | null): number {
  if (!array || !Array.isArray(array)) return 0;
  return array.length;
}