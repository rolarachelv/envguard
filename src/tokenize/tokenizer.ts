import { EnvMap } from "../env/loader";

export type TokenType = "string" | "number" | "boolean" | "url" | "email" | "json" | "unknown";

export interface TokenizedEntry {
  key: string;
  value: string;
  type: TokenType;
}

export interface TokenizeResult {
  entries: TokenizedEntry[];
}

const URL_PATTERN = /^https?:\/\/[^\s]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;
const BOOLEAN_VALUES = new Set(["true", "false", "1", "0", "yes", "no"]);

export function detectType(value: string): TokenType {
  if (BOOLEAN_VALUES.has(value.toLowerCase())) return "boolean";
  if (NUMBER_PATTERN.test(value)) return "number";
  if (URL_PATTERN.test(value)) return "url";
  if (EMAIL_PATTERN.test(value)) return "email";
  try {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      JSON.parse(trimmed);
      return "json";
    }
  } catch {
    // not valid JSON
  }
  if (typeof value === "string" && value.length >= 0) return "string";
  return "unknown";
}

export function tokenizeEnv(env: EnvMap): TokenizeResult {
  const entries: TokenizedEntry[] = Object.entries(env).map(([key, value]) => ({
    key,
    value,
    type: detectType(value),
  }));
  return { entries };
}
