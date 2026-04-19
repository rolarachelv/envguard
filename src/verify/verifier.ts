import * as fs from 'fs';
import * as path from 'path';
import { loadEnvFile } from '../env/loader';

export interface VerifyResult {
  key: string;
  expected: string;
  actual: string | undefined;
  match: boolean;
}

export interface VerifyReport {
  file: string;
  results: VerifyResult[];
  passed: number;
  failed: number;
}

export function verifyEnv(
  envPath: string,
  expected: Record<string, string>
): VerifyReport {
  const env = loadEnvFile(envPath);
  const results: VerifyResult[] = [];

  for (const [key, expectedVal] of Object.entries(expected)) {
    const actual = env[key];
    results.push({
      key,
      expected: expectedVal,
      actual,
      match: actual === expectedVal,
    });
  }

  const passed = results.filter(r => r.match).length;
  const failed = results.length - passed;

  return {
    file: path.resolve(envPath),
    results,
    passed,
    failed,
  };
}
