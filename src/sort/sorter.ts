export type SortOrder = 'asc' | 'desc';
export type SortStrategy = 'alpha' | 'length' | 'natural';

export interface SortOptions {
  order?: SortOrder;
  strategy?: SortStrategy;
  groupComments?: boolean;
}

export interface SortResult {
  original: Record<string, string>;
  sorted: Record<string, string>;
  keys: string[];
}

export function compareKeys(
  a: string,
  b: string,
  strategy: SortStrategy = 'alpha'
): number {
  if (strategy === 'length') {
    return a.length - b.length || a.localeCompare(b);
  }
  if (strategy === 'natural') {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }
  return a.localeCompare(b);
}

export function sortEnv(
  env: Record<string, string>,
  options: SortOptions = {}
): SortResult {
  const { order = 'asc', strategy = 'alpha' } = options;

  const keys = Object.keys(env).sort((a, b) => {
    const cmp = compareKeys(a, b, strategy);
    return order === 'desc' ? -cmp : cmp;
  });

  const sorted: Record<string, string> = {};
  for (const key of keys) {
    sorted[key] = env[key];
  }

  return { original: env, sorted, keys };
}
