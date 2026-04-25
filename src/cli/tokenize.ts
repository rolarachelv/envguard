import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { loadEnvFile } from "../env/loader";
import { tokenizeEnv } from "../tokenize/tokenizer";
import { formatTokenizeText, formatTokenizeJson } from "../tokenize/formatTokenize";

export function registerTokenizeCommand(program: Command): void {
  program
    .command("tokenize <envFile>")
    .description("Tokenize .env file values by their detected types (string, number, boolean, url, etc.)")
    .option("-f, --format <format>", "Output format: text or json", "text")
    .option("-o, --output <file>", "Write output to a file instead of stdout")
    .option("--keys <keys>", "Comma-separated list of keys to include (default: all)")
    .action((envFile: string, options: { format: string; output?: string; keys?: string }) => {
      const resolvedPath = path.resolve(process.cwd(), envFile);

      if (!fs.existsSync(resolvedPath)) {
        console.error(`Error: File not found: ${resolvedPath}`);
        process.exit(1);
      }

      const env = loadEnvFile(resolvedPath);
      let entries = tokenizeEnv(env);

      if (options.keys) {
        const allowedKeys = new Set(options.keys.split(",").map((k) => k.trim()));
        entries = entries.filter((e) => allowedKeys.has(e.key));
      }

      const output =
        options.format === "json"
          ? formatTokenizeJson(entries)
          : formatTokenizeText(entries);

      if (options.output) {
        const outPath = path.resolve(process.cwd(), options.output);
        fs.writeFileSync(outPath, output, "utf-8");
        console.log(`Output written to ${outPath}`);
      } else {
        process.stdout.write(output);
      }
    });
}
