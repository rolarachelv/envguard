import { describe, it, expect } from "vitest";
import { filterEnv, matchesPattern, FilterResult } from "./filterer";

const sampleEnv = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  APP_NAME: "envguard",
  APP_ENV: "production",
  SECRET_KEY: "abc123",
};

describe("matchesPattern", () => {
  it("returns true when key matches regex pattern", () => {
    expect(matchesPattern("DB_HOST", "^DB_")).toBe(true);
  });

  it("returns false when key does not match regex pattern", () => {
    expect(matchesPattern("APP_NAME", "^DB_")).toBe(false);
  });
});

describe("filterEnv - include mode", () => {
  it("includes only specified keys", () => {
    const result = filterEnv(sampleEnv, { keys: ["DB_HOST", "APP_NAME"], mode: "include" });
    expect(result.filtered).toEqual({ DB_HOST: "localhost", APP_NAME: "envguard" });
    expect(result.included).toContain("DB_HOST");
    expect(result.excluded).toContain("SECRET_KEY");
  });

  it("includes keys matching pattern", () => {
    const result = filterEnv(sampleEnv, { pattern: "^APP_", mode: "include" });
    expect(Object.keys(result.filtered)).toEqual(["APP_NAME", "APP_ENV"]);
  });

  it("combines keys and pattern in include mode", () => {
    const result = filterEnv(sampleEnv, { keys: ["SECRET_KEY"], pattern: "^DB_", mode: "include" });
    expect(result.filtered).toHaveProperty("SECRET_KEY");
    expect(result.filtered).toHaveProperty("DB_HOST");
    expect(result.filtered).toHaveProperty("DB_PORT");
  });
});

describe("filterEnv - exclude mode", () => {
  it("excludes specified keys", () => {
    const result = filterEnv(sampleEnv, { keys: ["SECRET_KEY"], mode: "exclude" });
    expect(result.filtered).not.toHaveProperty("SECRET_KEY");
    expect(result.excluded).toContain("SECRET_KEY");
  });

  it("excludes keys matching pattern", () => {
    const result = filterEnv(sampleEnv, { pattern: "^DB_", mode: "exclude" });
    expect(result.filtered).not.toHaveProperty("DB_HOST");
    expect(result.filtered).not.toHaveProperty("DB_PORT");
    expect(result.filtered).toHaveProperty("APP_NAME");
  });
});

describe("filterEnv - result shape", () => {
  it("preserves original env reference", () => {
    const result = filterEnv(sampleEnv, { mode: "include", keys: ["APP_NAME"] });
    expect(result.original).toBe(sampleEnv);
  });

  it("returns empty filtered map when no keys match in include mode", () => {
    const result = filterEnv(sampleEnv, { keys: ["NONEXISTENT"], mode: "include" });
    expect(result.filtered).toEqual({});
    expect(result.included).toHaveLength(0);
  });
});
