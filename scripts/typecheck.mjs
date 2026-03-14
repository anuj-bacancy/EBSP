import { existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

for (const path of [".next-build/types", ".next-build/dev/types"]) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

const result = spawnSync("tsc", ["--noEmit"], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
