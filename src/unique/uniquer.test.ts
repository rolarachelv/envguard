import { describe, it, expect } from "vitest";
import { findValueDuplicates, uniqueEnv } from "./uniquer";

describe("findValueDuplicates", () => {
  it("identifies keys with duplicate values", () => {
    const env = { A: "foo", B: "foo", C: "bar" };
    const dupes = findValueDuplicates(env);
    expect(dupes.get("foo")).toEqual(expect.arrayContaining(["A", "B"]));
    expect(dupes.has("bar")).toBe(false);
  });

  it("returns empty map when no duplicates", () => {
    const env = { A: "1", B: "2", C: "3" };
    const dupes = findValueDuplicates(env);
    expect(dupes.size).toBe(0);
  });

  it("handles empty env", () => {
    const dupes = findValueDuplicates({});
    expect(dupes.size).toBe(0);
  });
});

describe("uniqueEnv", () => {
  it("removes later keys with duplicate values", () => {
    const env = { A: "foo", B: "foo", C: "bar" };
    const { result, removed } = uniqueEnv(env);
    expect(result).toHaveProperty("A", "foo");
    expect(result).not.toHaveProperty("B");
    expect(result).toHaveProperty("C", "bar");
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe("B");
    expect(removed[0].duplicateOf).toBe("A");
  });

  it("keeps all entries when no duplicates", () => {
    const env = { X: "1", Y: "2" };
    const { result, removed } = uniqueEnv(env);
    expect(Object.keys(result)).toHaveLength(2);
    expect(removed).toHaveLength(0);
  });

  it("handles three keys with same value, keeps first", () => {
    const env = { A: "same", B: "same", C: "same" };
    const { result, removed } = uniqueEnv(env);
    expect(result).toHaveProperty("A");
    expect(removed.map((r) => r.key)).toEqual(expect.arrayContaining(["B", "C"]));
  });

  it("returns empty result for empty env", () => {
    const { result, removed } = uniqueEnv({});
    expect(result).toEqual({});
    expect(removed).toHaveLength(0);
  });
});
