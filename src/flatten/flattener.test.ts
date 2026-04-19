import { describe, it, expect } from "vitest";
import { flattenEnv, serializeFlattenedEnv } from "./flattener";
import { formatFlattenText, formatFlattenJson } from "./formatFlatten";

describe("flattenEnv", () => {
  it("flattens keys split by separator", () => {
    const env = { DB__HOST: "localhost", DB__PORT: "5432" };
    const results = flattenEnv(env);
    expect(results).toEqual([
      { key: "DB_HOST", originalKey: "DB__HOST", value: "localhost" },
      { key: "DB_PORT", originalKey: "DB__PORT", value: "5432" },
    ]);
  });

  it("applies prefix when provided", () => {
    const env = { HOST: "localhost" };
    const results = flattenEnv(env, "APP");
    expect(results[0].key).toBe("APP_HOST");
  });

  it("leaves keys unchanged when no separator present", () => {
    const env = { PORT: "3000" };
    const results = flattenEnv(env);
    expect(results[0].key).toBe("PORT");
    expect(results[0].originalKey).toBe("PORT");
  });

  it("returns empty array for empty env", () => {
    expect(flattenEnv({})).toEqual([]);
  });
});

describe("serializeFlattenedEnv", () => {
  it("serializes results to KEY=VALUE lines", () => {
    const results = [{ key: "DB_HOST", originalKey: "DB__HOST", value: "localhost" }];
    expect(serializeFlattenedEnv(results)).toBe("DB_HOST=localhost");
  });
});

describe("formatFlattenText", () => {
  it("shows renamed count", () => {
    const results = [{ key: "DB_HOST", originalKey: "DB__HOST", value: "localhost" }];
    const out = formatFlattenText(results);
    expect(out).toContain("1 renamed");
    expect(out).toContain("was: DB__HOST");
  });

  it("handles empty results", () => {
    expect(formatFlattenText([])).toContain("No entries");
  });
});

describe("formatFlattenJson", () => {
  it("returns valid JSON with renamed flag", () => {
    const results = [{ key: "PORT", originalKey: "PORT", value: "3000" }];
    const parsed = JSON.parse(formatFlattenJson(results));
    expect(parsed[0].renamed).toBe(false);
  });
});
