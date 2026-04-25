import { describe, it, expect } from "vitest";
import {
  formatUniqueText,
  formatUniqueJson,
  renderEntry,
  UniqueResult,
} from "./formatUnique";

const sampleEntries: UniqueResult[] = [
  { key: "API_KEY", value: "abc123", kept: true },
  { key: "SECRET", value: "abc123", duplicateOf: "API_KEY", kept: false },
  { key: "PORT", value: "3000", kept: true },
  { key: "APP_PORT", value: "3000", duplicateOf: "PORT", kept: false },
];

describe("renderEntry", () => {
  it("renders a kept entry", () => {
    const result = renderEntry({ key: "FOO", value: "bar", kept: true });
    expect(result).toContain("FOO=bar");
    expect(result).toContain("kept");
  });

  it("renders a removed entry with duplicateOf", () => {
    const result = renderEntry({
      key: "BAR",
      value: "bar",
      duplicateOf: "FOO",
      kept: false,
    });
    expect(result).toContain("BAR=bar");
    expect(result).toContain("duplicate of FOO");
    expect(result).toContain("removed");
  });
});

describe("formatUniqueText", () => {
  it("includes summary line with removed count", () => {
    const output = formatUniqueText(sampleEntries, 2);
    expect(output).toContain("2 duplicate(s) removed");
  });

  it("lists kept and removed sections", () => {
    const output = formatUniqueText(sampleEntries, 2);
    expect(output).toContain("Kept:");
    expect(output).toContain("Removed:");
  });

  it("handles no duplicates", () => {
    const entries: UniqueResult[] = [
      { key: "A", value: "1", kept: true },
    ];
    const output = formatUniqueText(entries, 0);
    expect(output).toContain("0 duplicate(s) removed");
    expect(output).not.toContain("Removed:");
  });
});

describe("formatUniqueJson", () => {
  it("returns valid JSON with removedCount and entries", () => {
    const output = formatUniqueJson(sampleEntries, 2);
    const parsed = JSON.parse(output);
    expect(parsed.removedCount).toBe(2);
    expect(parsed.entries).toHaveLength(4);
  });
});
