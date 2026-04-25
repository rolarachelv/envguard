import { Command } from "commander";
import { loadEnvFile } from "../env/loader";
import { uniqueEnv } from "../unique/uniquer";
import { formatUniqueText, formatUniqueJson, UniqueResult } from "../unique/formatUnique";
import * as fs from "fs";

export function registerUniqueCommand(program: Command): void {
  program
    .command("unique")
    .description("Remove entries with duplicate values from a .env file")
    .argument("<file>", ".env file to process")
    .option("-o, --output <path>", "Write deduplicated env to file")
    .option("--format <fmt>", "Output format: text or json", "text")
    .action((file: string, options: { output?: string; format: string }) => {
      const env = loadEnvFile(file);
      const { result, removed } = uniqueEnv(env);

      const allEntries: UniqueResult[] = [
        ...Object.entries(result).map(([key, value]) => ({
          key,
          value,
          kept: true,
        })),
        ...removed,
      ];

      const removedCount = removed.length;

      const report =
        options.format === "json"
          ? formatUniqueJson(allEntries, removedCount)
          : formatUniqueText(allEntries, removedCount);

      console.log(report);

      if (options.output) {
        const lines = Object.entries(result)
          .map(([k, v]) => `${k}=${v}`)
          .join("\n");
        fs.writeFileSync(options.output, lines + "\n", "utf-8");
        console.log(`\nWritten to ${options.output}`);
      }

      if (removedCount > 0) {
        process.exit(1);
      }
    });
}
