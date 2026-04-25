import { EnvMap } from '../env/loader';

export interface EnvStats {
  total: number;
  empty: number;
  nonEmpty: number;
  prefixBreakdown: Record<string, number>;
  longestKey: string;
  shortestKey: string;
  averageValueLength: number;
  uniquePrefixes: number;
}

export function computeStats(env: EnvMap): EnvStats {
  const keys = Object.keys(env);
  const total = keys.length;

  if (total === 0) {
    return {
      total: 0,
      empty: 0,
      nonEmpty: 0,
      prefixBreakdown: {},
      longestKey: '',
      shortestKey: '',
      averageValueLength: 0,
      uniquePrefixes: 0,
    };
  }

  const empty = keys.filter((k) => env[k] === '').length;
  const nonEmpty = total - empty;

  const prefixBreakdown: Record<string, number> = {};
  for (const key of keys) {
    const parts = key.split('_');
    const prefix = parts.length > 1 ? parts[0] : '(none)';
    prefixBreakdown[prefix] = (prefixBreakdown[prefix] ?? 0) + 1;
  }

  const longestKey = keys.reduce((a, b) => (a.length >= b.length ? a : b), '');
  const shortestKey = keys.reduce((a, b) => (a.length <= b.length ? a : b), keys[0]);

  const totalValueLength = keys.reduce((sum, k) => sum + env[k].length, 0);
  const averageValueLength = Math.round((totalValueLength / total) * 100) / 100;

  const uniquePrefixes = Object.keys(prefixBreakdown).length;

  return {
    total,
    empty,
    nonEmpty,
    prefixBreakdown,
    longestKey,
    shortestKey,
    averageValueLength,
    uniquePrefixes,
  };
}
