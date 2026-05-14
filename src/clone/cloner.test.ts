import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { cloneEnv, cloneEnvFile, serializeClonedEnv } from "./cloner";

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `envguard-clone-${Date.now()}.env`);
  fs.writeFileSync(file, content, "utf-8");
  return file;
}

describe("cloneEnv", () => {
  it("copies all entries by default", () => {
    const result = cloneEnv({ A: "1", B: "2", C: "3" });
    expect(result).toEqual({ A: "1", B: "2", C: "3" });
  });

  it("filters to specified keys", () => {
    const result = cloneEnv({ A: "1", B: "2", C: "3" }, { keys: ["A", "C"] });
    expect(result).toEqual({ A: "1", C: "3" });
  });

  it("excludes specified keys", () => {
    const result = cloneEnv({ A: "1", B: "2", C: "3" }, { exclude: ["B"] });
    expect(result).toEqual({ A: "1", C: "3" });
  });

  it("excludes take precedence when combined with keys filter", () => {
    const result = cloneEnv({ A: "1", B: "2" }, { keys: ["A", "B"], exclude: ["B"] });
    expect(result).toEqual({ A: "1" });
  });
});

describe("serializeClonedEnv", () => {
  it("serializes entries as KEY=VALUE lines", () => {
    const out = serializeClonedEnv({ FOO: "bar", BAZ: "qux" });
    expect(out).toBe("FOO=bar\nBAZ=qux");
  });
});

describe("cloneEnvFile", () => {
  it("writes cloned file to destination", async () => {
    const src = writeTempEnv("X=1\nY=2\n");
    const dest = path.join(os.tmpdir(), `envguard-dest-${Date.now()}.env`);
    const result = await cloneEnvFile(src, dest, { overwrite: true });
    expect(result.written).toBe(true);
    expect(fs.existsSync(dest)).toBe(true);
    expect(result.entries.every((e) => e.included)).toBe(true);
    fs.unlinkSync(src);
    fs.unlinkSync(dest);
  });

  it("does not overwrite existing destination without flag", async () => {
    const src = writeTempEnv("X=1\n");
    const dest = writeTempEnv("EXISTING=true\n");
    const result = await cloneEnvFile(src, dest);
    expect(result.written).toBe(false);
    expect(fs.readFileSync(dest, "utf-8")).toContain("EXISTING");
    fs.unlinkSync(src);
    fs.unlinkSync(dest);
  });
});
