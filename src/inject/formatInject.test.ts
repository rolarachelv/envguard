import { describe, it, expect } from "vitest";
import { formatInjectText, formatInjectJson } from "./formatInject";
import { InjectionResult } from "./injector";

const sampleResults: InjectionResult[] = [
  { key: "NEW_KEY", injected: true, newValue: "hello" },
  { key: "OLD_KEY", injected: true, previousValue: "old", newValue: "new" },
  { key: "SKIP_KEY", injected: false, previousValue: "keep", newValue: "keep" },
];

describe("formatInjectText", () => {
  it("includes added, updated, and skipped sections", () => {
    const output = formatInjectText(sampleResults);
    expect(output).toContain("Added");
    expect(output).toContain("Updated");
    expect(output).toContain("Skipped");
  });

  it("shows correct summary counts", () => {
    const output = formatInjectText(sampleResults);
    expect(output).toContain("1 added");
    expect(output).toContain("1 updated");
    expect(output).toContain("1 skipped");
  });

  it("shows arrow for updates", () => {
    const output = formatInjectText(sampleResults);
    expect(output).toContain("old → new");
  });

  it("returns fallback message for empty results", () => {
    expect(formatInjectText([])).toBe("No variables processed.\n");
  });
});

describe("formatInjectJson", () => {
  it("returns valid JSON with results and summary", () => {
    const json = JSON.parse(formatInjectJson(sampleResults));
    expect(json).toHaveProperty("results");
    expect(json).toHaveProperty("summary");
    expect(json.summary.added).toBe(1);
    expect(json.summary.updated).toBe(1);
    expect(json.summary.skipped).toBe(1);
  });

  it("includes all result entries", () => {
    const json = JSON.parse(formatInjectJson(sampleResults));
    expect(json.results).toHaveLength(3);
  });

  it("handles empty results", () => {
    const json = JSON.parse(formatInjectJson([]));
    expect(json.results).toHaveLength(0);
    expect(json.summary.added).toBe(0);
  });
});
