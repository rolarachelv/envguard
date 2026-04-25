import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { registerUniqueCommand } from "./unique";

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `unique-test-${Date.now()}.env`);
  fs.writeFileSync(file, content, "utf-8");
  return file;
}

function runUnique(args: string[]): { stdout: string; exitCode: number } {
  const logs: string[] = [];
  const originalLog = console.log;
  const originalExit = process.exit;

  let exitCode = 0;
  console.log = (...a) => logs.push(a.join(" "));
  (process.exit as unknown) = (code: number) => {
    exitCode = code;
  };

  const program = new Command();
  program.exitOverride();
  registerUniqueCommand(program);

  try {
    program.parse(["node", "envguard", ...args]);
  } catch {
    // swallow exitOverride errors
  } finally {
    console.log = originalLog;
    (process.exit as unknown) = originalExit;
  }

  return { stdout: logs.join("\n"), exitCode };
}

describe("registerUniqueCommand", () => {
  let tmpFile: string;

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it("reports no duplicates and exits 0", () => {
    tmpFile = writeTempEnv("A=1\nB=2\nC=3\n");
    const { stdout, exitCode } = runUnique(["unique", tmpFile]);
    expect(stdout).toContain("0 duplicate(s) removed");
    expect(exitCode).toBe(0);
  });

  it("detects duplicate values and exits 1", () => {
    tmpFile = writeTempEnv("A=foo\nB=foo\nC=bar\n");
    const { stdout, exitCode } = runUnique(["unique", tmpFile]);
    expect(stdout).toContain("1 duplicate(s) removed");
    expect(exitCode).toBe(1);
  });

  it("outputs json format", () => {
    tmpFile = writeTempEnv("X=1\nY=1\n");
    const { stdout } = runUnique(["unique", tmpFile, "--format", "json"]);
    const parsed = JSON.parse(stdout);
    expect(parsed).toHaveProperty("removedCount", 1);
    expect(parsed).toHaveProperty("entries");
  });

  it("writes output file when --output is provided", () => {
    tmpFile = writeTempEnv("A=dup\nB=dup\nC=unique\n");
    const outFile = path.join(os.tmpdir(), `unique-out-${Date.now()}.env`);
    runUnique(["unique", tmpFile, "--output", outFile]);
    expect(fs.existsSync(outFile)).toBe(true);
    const content = fs.readFileSync(outFile, "utf-8");
    expect(content).toContain("A=dup");
    expect(content).not.toContain("B=dup");
    fs.unlinkSync(outFile);
  });
});
