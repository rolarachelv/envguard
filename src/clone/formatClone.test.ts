import { formatCloneText, formatCloneJson } from "./formatClone";
import { CloneResult } from "./cloner";

const mockResult: CloneResult = {
  source: ".env.staging",
  destination: ".env.production",
  written: true,
  entries: [
    { key: "DB_HOST", included: true },
    { key: "SECRET_KEY", included: false, reason: "excluded" },
    { key: "PORT", included: true },
  ],
};

describe("formatCloneText", () => {
  it("includes source and destination paths", () => {
    const out = formatCloneText(mockResult);
    expect(out).toContain(".env.staging");
    expect(out).toContain(".env.production");
  });

  it("shows written status", () => {
    const out = formatCloneText(mockResult);
    expect(out).toContain("written");
  });

  it("shows skipped status when not written", () => {
    const out = formatCloneText({ ...mockResult, written: false });
    expect(out).toContain("skipped");
  });

  it("renders included and excluded entries", () => {
    const out = formatCloneText(mockResult);
    expect(out).toContain("✔ DB_HOST");
    expect(out).toContain("✘ SECRET_KEY");
    expect(out).toContain("(excluded)");
  });

  it("shows summary counts", () => {
    const out = formatCloneText(mockResult);
    expect(out).toContain("Included: 2");
    expect(out).toContain("Excluded: 1");
  });
});

describe("formatCloneJson", () => {
  it("returns valid JSON", () => {
    const out = formatCloneJson(mockResult);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it("includes summary and entries in output", () => {
    const parsed = JSON.parse(formatCloneJson(mockResult));
    expect(parsed.summary.included).toBe(2);
    expect(parsed.summary.excluded).toBe(1);
    expect(parsed.entries).toHaveLength(3);
    expect(parsed.written).toBe(true);
  });
});
