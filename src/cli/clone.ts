import { Command } from "commander";
import { cloneEnvFile } from "../clone/cloner";
import { formatCloneText, formatCloneJson } from "../clone/formatClone";

export function registerCloneCommand(program: Command): void {
  program
    .command("clone <source> <destination>")
    .description("Clone a .env file to a new destination, optionally filtering keys")
    .option("--overwrite", "overwrite destination if it already exists", false)
    .option("--keys <keys>", "comma-separated list of keys to include")
    .option("--exclude <keys>", "comma-separated list of keys to exclude")
    .option("--format <format>", "output format: text or json", "text")
    .action(async (source: string, destination: string, opts) => {
      const keys = opts.keys
        ? opts.keys.split(",").map((k: string) => k.trim())
        : undefined;
      const exclude = opts.exclude
        ? opts.exclude.split(",").map((k: string) => k.trim())
        : undefined;

      try {
        const result = await cloneEnvFile(source, destination, {
          overwrite: opts.overwrite,
          keys,
          exclude,
        });

        const output =
          opts.format === "json"
            ? formatCloneJson(result)
            : formatCloneText(result);

        console.log(output);

        if (!result.written) {
          process.exit(1);
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
