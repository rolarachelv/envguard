import { Command } from "commander";
import { loadEnvFile } from "../env/loader";
import { redactEnv } from "../redact/redactor";
import {
  buildRedactedEntries,
  formatRedactText,
  formatRedactJson,
} from "../redact/formatRedact";

export function registerRedactCommand(program: Command): void {
  program
    .command("redact <envFile>")
    .description("Display env file contents with sensitive values redacted")
    .option("-f, --format <format>", "Output format: text or json", "text")
    .option("--show-all", "Show all keys, not just redacted ones", false)
    .option(
      "--placeholder <placeholder>",
      "Custom redaction placeholder",
      "[REDACTED]"
    )
    .action(async (envFile: string, options) => {
      try {
        const env = await loadEnvFile(envFile);
        const redacted = redactEnv(env, {
          placeholder: options.placeholder,
        });
        const entries = buildRedactedEntries(env, redacted);

        if (options.format === "json") {
          console.log(formatRedactJson(entries, options.showAll));
        } else {
          console.log(formatRedactText(entries, options.showAll));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Error: ${message}`);
        process.exit(1);
      }
    });
}
