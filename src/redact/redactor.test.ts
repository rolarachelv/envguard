import { describe, it, expect } from "vitest";
import { shouldRedact, redactValue, redactEnv } from "./redactor";

describe("shouldRedact", () => {
  it("returns true for keys matching default sensitive patterns", () => {
    expect(shouldRedact("DB_PASSWORD")).toBe(true);
    expect(shouldRedact("API_KEY")).toBe(true);
    expect(shouldRedact("AUTH_TOKEN")).toBe(true);
    expect(shouldRedact("PRIVATE_KEY")).toBe(true);
    expect(shouldRedact("APP_SECRET")).toBe(true);
  });

  it("returns false for non-sensitive keys", () => {
    expect(shouldRedact("APP_NAME")).toBe(false);
    expect(shouldRedact("PORT")).toBe(false);
    expect(shouldRedact("NODE_ENV")).toBe(false);
  });

  it("respects custom patterns", () => {
    expect(shouldRedact("MY_CUSTOM", [/custom/i])).toBe(true);
    expect(shouldRedact("API_KEY", [/custom/i])).toBe(false);
  });
});

describe("redactValue", () => {
  it("redacts sensitive values with default placeholder", () => {
    expect(redactValue("DB_PASSWORD", "supersecret")).toBe("[REDACTED]");
  });

  it("keeps non-sensitive values unchanged", () => {
    expect(redactValue("PORT", "3000")).toBe("3000");
  });

  it("uses custom placeholder", () => {
    expect(redactValue("API_KEY", "abc123", { placeholder: "***" })).toBe("***");
  });
});

describe("redactEnv", () => {
  it("redacts sensitive keys and keeps others", () => {
    const env = {
      APP_NAME: "myapp",
      DB_PASSWORD: "secret",
      API_KEY: "key123",
      PORT: "8080",
    };
    const result = redactEnv(env);
    expect(result.APP_NAME).toBe("myapp");
    expect(result.PORT).toBe("8080");
    expect(result.DB_PASSWORD).toBe("[REDACTED]");
    expect(result.API_KEY).toBe("[REDACTED]");
  });

  it("returns empty object for empty input", () => {
    expect(redactEnv({})).toEqual({});
  });
});
