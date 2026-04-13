import { describe, it, expect } from "vitest";
import { resolveValue, interpolateEnv } from "./interpolator";
import { formatInterpolationText, formatInterpolationJson } from "./formatInterpolation";

describe("resolveValue", () => {
  it("resolves ${VAR} style references", () => {
    const { resolved, missing } = resolveValue("${HOST}:${PORT}", { HOST: "localhost", PORT: "5432" });
    expect(resolved).toBe("localhost:5432");
    expect(missing).toHaveLength(0);
  });

  it("resolves $VAR style references", () => {
    const { resolved, missing } = resolveValue("$PROTO://$HOST", { PROTO: "https", HOST: "example.com" });
    expect(resolved).toBe("https://example.com");
    expect(missing).toHaveLength(0);
  });

  it("records missing references", () => {
    const { resolved, missing } = resolveValue("${MISSING_VAR}", {});
    expect(resolved).toBe("");
    expect(missing).toContain("MISSING_VAR");
  });

  it("returns value unchanged when no references present", () => {
    const { resolved, missing } = resolveValue("plain-value", {});
    expect(resolved).toBe("plain-value");
    expect(missing).toHaveLength(0);
  });
});

describe("interpolateEnv", () => {
  it("interpolates cross-references within the same env", () => {
    const env = { HOST: "localhost", PORT: "5432", DB_URL: "postgres://${HOST}:${PORT}/db" };
    const { results, unresolvedKeys } = interpolateEnv(env);
    const dbUrl = results.find((r) => r.key === "DB_URL")!;
    expect(dbUrl.resolved).toBe("postgres://localhost:5432/db");
    expect(unresolvedKeys).toHaveLength(0);
  });

  it("tracks unresolved keys", () => {
    const env = { URL: "${UNDEFINED_HOST}/path" };
    const { unresolvedKeys } = interpolateEnv(env);
    expect(unresolvedKeys).toContain("URL");
  });

  it("uses extraContext for resolution", () => {
    const env = { FULL_URL: "${BASE_URL}/api" };
    const { results } = interpolateEnv(env, { BASE_URL: "https://api.example.com" });
    expect(results[0].resolved).toBe("https://api.example.com/api");
  });
});

describe("formatInterpolationText", () => {
  it("returns a readable report with interpolated entries", () => {
    const summary = {
      results: [{ key: "DB_URL", original: "${HOST}/db", resolved: "localhost/db", missing: [] }],
      unresolvedKeys: [],
    };
    const output = formatInterpolationText(summary);
    expect(output).toContain("DB_URL");
    expect(output).toContain("localhost/db");
  });
});

describe("formatInterpolationJson", () => {
  it("returns valid JSON with stats", () => {
    const summary = {
      results: [{ key: "A", original: "$B", resolved: "val", missing: [] }],
      unresolvedKeys: [],
    };
    const parsed = JSON.parse(formatInterpolationJson(summary));
    expect(parsed.stats.total).toBe(1);
  });
});
