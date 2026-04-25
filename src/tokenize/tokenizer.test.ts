import { describe, it, expect } from "vitest";
import { detectType, tokenizeEnv } from "./tokenizer";

describe("detectType", () => {
  it("detects boolean true/false", () => {
    expect(detectType("true")).toBe("boolean");
    expect(detectType("false")).toBe("boolean");
    expect(detectType("yes")).toBe("boolean");
    expect(detectType("no")).toBe("boolean");
    expect(detectType("1")).toBe("boolean");
    expect(detectType("0")).toBe("boolean");
  });

  it("detects numbers", () => {
    expect(detectType("42")).toBe("number");
    expect(detectType("-3.14")).toBe("number");
    expect(detectType("0")).toBe("boolean"); // 0 is boolean first
  });

  it("detects URLs", () => {
    expect(detectType("https://example.com")).toBe("url");
    expect(detectType("http://localhost:3000")).toBe("url");
  });

  it("detects emails", () => {
    expect(detectType("user@example.com")).toBe("email");
  });

  it("detects JSON objects", () => {
    expect(detectType('{"key":"value"}')).toBe("json");
    expect(detectType("[1,2,3]")).toBe("json");
  });

  it("detects plain strings", () => {
    expect(detectType("hello world")).toBe("string");
    expect(detectType("some-token-abc")).toBe("string");
  });

  it("returns unknown for empty string", () => {
    expect(detectType("")).toBe("string");
  });
});

describe("tokenizeEnv", () => {
  it("tokenizes a mixed env map", () => {
    const env = {
      PORT: "3000",
      DEBUG: "true",
      API_URL: "https://api.example.com",
      ADMIN_EMAIL: "admin@example.com",
      APP_NAME: "myapp",
      CONFIG: '{"timeout":30}',
    };
    const result = tokenizeEnv(env);
    expect(result.entries).toHaveLength(6);
    const byKey = Object.fromEntries(result.entries.map((e) => [e.key, e.type]));
    expect(byKey["PORT"]).toBe("number");
    expect(byKey["DEBUG"]).toBe("boolean");
    expect(byKey["API_URL"]).toBe("url");
    expect(byKey["ADMIN_EMAIL"]).toBe("email");
    expect(byKey["APP_NAME"]).toBe("string");
    expect(byKey["CONFIG"]).toBe("json");
  });

  it("returns empty entries for empty env", () => {
    const result = tokenizeEnv({});
    expect(result.entries).toHaveLength(0);
  });
});
