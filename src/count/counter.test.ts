import { countEnv, countByPrefix } from "./counter";
import { formatCountText, formatCountJson } from "./formatCount";

const sampleEnv: Record<string, string> = {
  APP_NAME: "myapp",
  APP_ENV: "production",
  DB_HOST: "localhost",
  DB_PORT: "5432",
  SECRET_KEY: "abc123",
  EMPTY_VAR: "",
};

describe("countEnv", () => {
  it("returns correct total, empty, and nonEmpty counts", () => {
    const result = countEnv(sampleEnv);
    expect(result.total).toBe(6);
    expect(result.empty).toBe(1);
    expect(result.nonEmpty).toBe(5);
    expect(result.byPrefix).toEqual({});
  });

  it("groups keys by prefix when prefixes are provided", () => {
    const result = countEnv(sampleEnv, ["APP_", "DB_"]);
    expect(result.byPrefix["APP_"]).toBe(2);
    expect(result.byPrefix["DB_"]).toBe(2);
    expect(result.byPrefix["(other)"]).toBe(2);
  });

  it("handles empty env", () => {
    const result = countEnv({});
    expect(result.total).toBe(0);
    expect(result.empty).toBe(0);
    expect(result.nonEmpty).toBe(0);
  });
});

describe("countByPrefix", () => {
  it("counts keys matching each prefix", () => {
    const result = countByPrefix(sampleEnv, ["APP_", "SECRET_"]);
    expect(result["APP_"]).toBe(2);
    expect(result["SECRET_"]).toBe(1);
    expect(result["(other)"]).toBe(3);
  });

  it("returns zero for unmatched prefixes", () => {
    const result = countByPrefix(sampleEnv, ["MISSING_"]);
    expect(result["MISSING_"]).toBe(0);
    expect(result["(other)"]).toBe(6);
  });
});

describe("formatCountText", () => {
  it("formats count result as text", () => {
    const result = countEnv(sampleEnv, ["APP_"]);
    const text = formatCountText(result);
    expect(text).toContain("Total keys");
    expect(text).toContain("Empty");
    expect(text).toContain("By prefix");
    expect(text).toContain("APP_");
  });
});

describe("formatCountJson", () => {
  it("formats count result as JSON", () => {
    const result = countEnv(sampleEnv);
    const json = JSON.parse(formatCountJson(result));
    expect(json.total).toBe(6);
    expect(json.empty).toBe(1);
  });
});
