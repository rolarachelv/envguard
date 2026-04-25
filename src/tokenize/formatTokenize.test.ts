import { formatTokenizeText, formatTokenizeJson } from "./formatTokenize";
import { TokenizedEntry } from "./tokenizer";

const sampleEntries: TokenizedEntry[] = [
  { key: "PORT", value: "3000", type: "number" },
  { key: "DEBUG", value: "true", type: "boolean" },
  { key: "APP_NAME", value: "myapp", type: "string" },
  { key: "TIMEOUT", value: "5000", type: "number" },
];

describe("formatTokenizeText", () => {
  it("returns a message when there are no entries", () => {
    const result = formatTokenizeText([]);
    expect(result).toContain("No entries to tokenize.");
  });

  it("includes entry count in header", () => {
    const result = formatTokenizeText(sampleEntries);
    expect(result).toContain("Tokenized 4 entries");
  });

  it("renders each key with its type", () => {
    const result = formatTokenizeText(sampleEntries);
    expect(result).toContain("PORT");
    expect(result).toContain("[number  ]");
    expect(result).toContain("DEBUG");
    expect(result).toContain("[boolean ]");
    expect(result).toContain("APP_NAME");
    expect(result).toContain("[string  ]");
  });

  it("includes a type summary", () => {
    const result = formatTokenizeText(sampleEntries);
    expect(result).toContain("Summary by type:");
    expect(result).toContain("number");
    expect(result).toContain("boolean");
    expect(result).toContain("string");
  });

  it("handles a single entry with correct singular label", () => {
    const result = formatTokenizeText([sampleEntries[0]]);
    expect(result).toContain("Tokenized 1 entry:");
  });
});

describe("formatTokenizeJson", () => {
  it("returns valid JSON", () => {
    const result = formatTokenizeJson(sampleEntries);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("includes total count", () => {
    const parsed = JSON.parse(formatTokenizeJson(sampleEntries));
    expect(parsed.total).toBe(4);
  });

  it("includes entries array with key, value, type", () => {
    const parsed = JSON.parse(formatTokenizeJson(sampleEntries));
    expect(parsed.entries[0]).toEqual({ key: "PORT", value: "3000", type: "number" });
  });

  it("includes summary with type counts", () => {
    const parsed = JSON.parse(formatTokenizeJson(sampleEntries));
    expect(parsed.summary.number).toBe(2);
    expect(parsed.summary.boolean).toBe(1);
    expect(parsed.summary.string).toBe(1);
  });

  it("returns empty entries for no input", () => {
    const parsed = JSON.parse(formatTokenizeJson([]));
    expect(parsed.total).toBe(0);
    expect(parsed.entries).toEqual([]);
    expect(parsed.summary).toEqual({});
  });
});
