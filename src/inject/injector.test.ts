import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { injectIntoContent, injectEnvFile } from "./injector";

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `inject-test-${Date.now()}.env`);
  fs.writeFileSync(file, content, "utf-8");
  return file;
}

describe("injectIntoContent", () => {
  it("adds new keys when createIfMissing is true", () => {
    const { content, results } = injectIntoContent("", { FOO: "bar" }, { createIfMissing: true });
    expect(content).toContain("FOO=bar");
    expect(results[0].injected).toBe(true);
    expect(results[0].previousValue).toBeUndefined();
  });

  it("does not add new keys when createIfMissing is false", () => {
    const { content, results } = injectIntoContent("", { FOO: "bar" }, { createIfMissing: false });
    expect(content).not.toContain("FOO=bar");
    expect(results[0].injected).toBe(false);
  });

  it("overwrites existing keys when overwrite is true", () => {
    const base = "FOO=old\nBAR=baz";
    const { content, results } = injectIntoContent(base, { FOO: "new" }, { overwrite: true });
    expect(content).toContain("FOO=new");
    expect(results[0].previousValue).toBe("old");
    expect(results[0].newValue).toBe("new");
  });

  it("skips existing keys when overwrite is false", () => {
    const base = "FOO=old";
    const { content, results } = injectIntoContent(base, { FOO: "new" }, { overwrite: false });
    expect(content).toContain("FOO=old");
    expect(results[0].injected).toBe(false);
  });

  it("handles multiple keys mixed add and update", () => {
    const base = "EXISTING=yes";
    const { results } = injectIntoContent(
      base,
      { EXISTING: "no", NEWKEY: "val" },
      { overwrite: true, createIfMissing: true }
    );
    expect(results).toHaveLength(2);
    expect(results.find((r) => r.key === "EXISTING")?.injected).toBe(true);
    expect(results.find((r) => r.key === "NEWKEY")?.injected).toBe(true);
  });
});

describe("injectEnvFile", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = writeTempEnv("HOST=localhost\nPORT=3000\n");
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it("writes injected content to file", () => {
    injectEnvFile(tmpFile, { PORT: "8080" }, { overwrite: true });
    const content = fs.readFileSync(tmpFile, "utf-8");
    expect(content).toContain("PORT=8080");
  });

  it("creates file if it does not exist", () => {
    const newFile = path.join(os.tmpdir(), `inject-new-${Date.now()}.env`);
    injectEnvFile(newFile, { SECRET: "abc" }, { createIfMissing: true });
    expect(fs.existsSync(newFile)).toBe(true);
    fs.unlinkSync(newFile);
  });
});
