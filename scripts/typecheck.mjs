import { existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

for (const path of [
  ".next/types",
  ".next/dev/types",
  ".next-build/types",
  ".next-build/dev/types",
  ".next-local/types",
  ".next-local/dev/types",
]) {
  if (existsSync(path)) {
    try {
      rmSync(path, { recursive: true, force: true });
    } catch {
      // Ignore stale permission errors from old generated build dirs.
    }
  }
}

const result = spawnSync("tsc", ["--noEmit"], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
