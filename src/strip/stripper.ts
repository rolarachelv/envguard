/**
 * Strip comments and blank lines from .env file content.
 */

export interface StripOptions {
  stripComments?: boolean;
  stripBlanks?: boolean;
}

export interface StripResult {
  original: string[];
  stripped: string[];
  removedComments: number;
  removedBlanks: number;
}

export function stripLine(
  line: string,
  options: StripOptions
): { keep: boolean; reason?: "comment" | "blank" } {
  const trimmed = line.trim();

  if (options.stripBlanks !== false && trimmed === "") {
    return { keep: false, reason: "blank" };
  }

  if (options.stripComments !== false && trimmed.startsWith("#")) {
    return { keep: false, reason: "comment" };
  }

  return { keep: true };
}

export function stripEnv(
  content: string,
  options: StripOptions = {}
): StripResult {
  const lines = content.split("\n");
  const stripped: string[] = [];
  let removedComments = 0;
  let removedBlanks = 0;

  for (const line of lines) {
    const { keep, reason } = stripLine(line, options);
    if (keep) {
      stripped.push(line);
    } else if (reason === "comment") {
      removedComments++;
    } else if (reason === "blank") {
      removedBlanks++;
    }
  }

  return {
    original: lines,
    stripped,
    removedComments,
    removedBlanks,
  };
}

export function serializeStrippedEnv(result: StripResult): string {
  return result.stripped.join("\n");
}
