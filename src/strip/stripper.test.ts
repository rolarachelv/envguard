import { describe, it, expect } from "vitest";
import {
  stripLine,
  stripEnv,
  serializeStrippedEnv,
} from "./stripper";

const SAMPLE_ENV = [
  "# Database config",
  "DB_HOST=localhost",
  "",
  "DB_PORT=5432",
  "# Cache",
  "REDIS_URL=redis://localhost:6379",
  "",
  "SECRET_KEY=abc123",
].join("\n");

describe("stripLine", () => {
  it("marks comment lines for removal", () => {
    expect(stripLine("# a comment", {})).toEqual({ keep: false, reason: "comment" });
  });

  it("marks blank lines for removal", () => {
    expect(stripLine("", {})).toEqual({ keep: false, reason: "blank" });
    expect(stripLine("   ", {})).toEqual({ keep: false, reason: "blank" });
  });

  it("keeps regular key=value lines", () => {
    expect(stripLine("FOO=bar", {})).toEqual({ keep: true });
  });

  it("keeps comments when stripComments is false", () => {
    expect(stripLine("# comment", { stripComments: false })).toEqual({ keep: true });
  });

  it("keeps blanks when stripBlanks is false", () => {
    expect(stripLine("", { stripBlanks: false })).toEqual({ keep: true });
  });
});

describe("stripEnv", () => {
  it("removes comments and blanks by default", () => {
    const result = stripEnv(SAMPLE_ENV);
    expect(result.removedComments).toBe(2);
    expect(result.removedBlanks).toBe(2);
    expect(result.stripped).toEqual([
      "DB_HOST=localhost",
      "DB_PORT=5432",
      "REDIS_URL=redis://localhost:6379",
      "SECRET_KEY=abc123",
    ]);
  });

  it("preserves comments when stripComments is false", () => {
    const result = stripEnv(SAMPLE_ENV, { stripComments: false });
    expect(result.removedComments).toBe(0);
    expect(result.stripped.some((l) => l.startsWith("#"))).toBe(true);
  });

  it("preserves blanks when stripBlanks is false", () => {
    const result = stripEnv(SAMPLE_ENV, { stripBlanks: false });
    expect(result.removedBlanks).toBe(0);
  });
});

describe("serializeStrippedEnv", () => {
  it("joins stripped lines with newline", () => {
    const result = stripEnv(SAMPLE_ENV);
    const output = serializeStrippedEnv(result);
    expect(output).toBe(result.stripped.join("\n"));
    expect(output).not.toContain("#");
  });
});
