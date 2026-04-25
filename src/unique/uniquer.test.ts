import { describe, it, expect } from "vitest";
import { findValueDuplicates, uniqueEnv } from "./uniquer";

describe("findValueDuplicates", () => {
  it("returns empty array when no values are duplicated", () => {
    const env = { FOO: "bar", BAZ: "qux", HELLO: "world" };
    expect(findValueDuplicates(env)).toEqual([]);
  });

  it("detects two keys sharing the same value", () => {
    const env = { A: "same", B: "same", C: "different" };
    const result = findValueDuplicates(env);
    expect(result).toHaveLength(2);
    const keys = result.map((r) => r.key);
    expect(keys).toContain("A");
    expect(keys).toContain("B");
    expect(result[0].occurrences).toBe(2);
  });

  it("reports all duplicate keys when three keys share a value", () => {
    const env = { X: "val", Y: "val", Z: "val" };
    const result = findValueDuplicates(env);
    expect(result).toHaveLength(3);
    for (const r of result) {
      expect(r.occurrences).toBe(3);
      expect(r.duplicateValues).toHaveLength(2);
    }
  });

  it("trims values before comparing", () => {
    const env = { A: "  trimmed  ", B: "trimmed" };
    const result = findValueDuplicates(env);
    expect(result).toHaveLength(2);
  });

  it("returns results sorted by key", () => {
    const env = { Z: "dup", A: "dup", M: "dup" };
    const result = findValueDuplicates(env);
    const keys = result.map((r) => r.key);
    expect(keys).toEqual(["A", "M", "Z"]);
  });
});

describe("uniqueEnv", () => {
  it("returns all keys when all values are unique", () => {
    const env = { FOO: "1", BAR: "2", BAZ: "3" };
    const { unique, duplicates } = uniqueEnv(env);
    expect(Object.keys(unique)).toHaveLength(3);
    expect(duplicates).toHaveLength(0);
  });

  it("excludes keys with duplicate values from unique map", () => {
    const env = { A: "same", B: "same", C: "unique" };
    const { unique, duplicates } = uniqueEnv(env);
    expect(unique).toEqual({ C: "unique" });
    expect(duplicates).toHaveLength(2);
  });

  it("handles empty env", () => {
    const { unique, duplicates } = uniqueEnv({});
    expect(unique).toEqual({});
    expect(duplicates).toEqual([]);
  });
});
