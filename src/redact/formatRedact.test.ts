import { describe, it, expect } from "vitest";
import {
  buildRedactedEntries,
  formatRedactText,
  formatRedactJson,
} from "./formatRedact";

const original = {
  APP_NAME: "myapp",
  DB_PASSWORD: "secret",
  PORT: "3000",
};

const redacted = {
  APP_NAME: "myapp",
  DB_PASSWORD: "[REDACTED]",
  PORT: "3000",
};

describe("buildRedactedEntries", () => {
  it("correctly marks redacted vs kept entries", () => {
    const entries = buildRedactedEntries(original, redacted);
    expect(entries).toHaveLength(3);
    const pw = entries.find((e) => e.key === "DB_PASSWORD")!;
    expect(pw.wasRedacted).toBe(true);
    expect(pw.redactedValue).toBe("[REDACTED]");
    const port = entries.find((e) => e.key === "PORT")!;
    expect(port.wasRedacted).toBe(false);
  });
});

describe("formatRedactText", () => {
  it("shows only redacted entries by default", () => {
    const entries = buildRedactedEntries(original, redacted);
    const output = formatRedactText(entries);
    expect(output).toContain("[REDACTED] DB_PASSWORD");
    expect(output).not.toContain("APP_NAME");
    expect(output).toContain("Total redacted: 1/3");
  });

  it("shows all entries when showAll is true", () => {
    const entries = buildRedactedEntries(original, redacted);
    const output = formatRedactText(entries, true);
    expect(output).toContain("APP_NAME");
    expect(output).toContain("PORT");
  });

  it("reports no redactions when nothing was redacted", () => {
    const same = { PORT: "3000" };
    const entries = buildRedactedEntries(same, same);
    const output = formatRedactText(entries);
    expect(output).toContain("No values were redacted.");
  });
});

describe("formatRedactJson", () => {
  it("returns valid JSON with summary", () => {
    const entries = buildRedactedEntries(original, redacted);
    const output = formatRedactJson(entries);
    const parsed = JSON.parse(output);
    expect(parsed.summary.redactedCount).toBe(1);
    expect(parsed.summary.total).toBe(3);
    expect(parsed.redacted).toHaveLength(1);
    expect(parsed.redacted[0].key).toBe("DB_PASSWORD");
  });
});
