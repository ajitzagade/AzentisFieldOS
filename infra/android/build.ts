/**
 * TWA wrapper build CLI (spec 20.1). Non-interactive, no prompts: takes a
 * manifest URL, an Android package id, and an output slug, and emits one
 * signed release APK at infra/android/dist/<slug>.apk.
 *
 * This script is a thin orchestration wrapper — Bubblewrap
 * (`@bubblewrap/cli`) owns TWA project generation and signing. We:
 *   1. copy infra/android/template/ into a per-slug scratch build directory
 *      (template/ itself is never modified);
 *   2. use `@bubblewrap/core`'s TwaManifest.fromWebManifest — the exact
 *      constructor `bubblewrap init` itself calls — to build a manifest
 *      object from the real, live manifest URL, then override packageId and
 *      signingKey (fields a plain web manifest can't carry);
 *   3. shell out to `bubblewrap update --skipVersionUpgrade` to regenerate
 *      the Android project from that manifest (icons, AndroidManifest,
 *      package directories, DAL asset statements — all real Bubblewrap
 *      output, not hand-written);
 *   4. shell out to `bubblewrap build` to compile and sign the APK/AAB.
 *
 * Neither `update` nor `build` is interactive here: `update` only prompts
 * when `--skipVersionUpgrade` is omitted, and `build` only prompts when (a)
 * no manifest-checksum.txt is present (we always have a fresh one, written
 * by the `update` step) or (b) BUBBLEWRAP_KEYSTORE_PASSWORD/
 * BUBBLEWRAP_KEY_PASSWORD aren't set as env vars (we always set them).
 *
 * IMPORTANT: Bubblewrap's `GradleWrapper`/signing steps operate relative to
 * the *process* cwd, not the `--directory` flag (confirmed by reading
 * @bubblewrap/cli's build.js: `new GradleWrapper(process, androidSdkTools)`
 * is called with no project-location argument, so it falls back to
 * `process.cwd()`). We therefore spawn both `update` and `build` with
 * `cwd` set to the per-slug scratch directory, rather than relying on
 * `--directory` alone — otherwise gradle would build whatever project
 * happens to be sitting in this script's own cwd.
 */
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { TwaManifest, util } from "@bubblewrap/core";

const require_ = createRequire(import.meta.url);

const ANDROID_DIR = path.resolve(import.meta.dirname);
const TEMPLATE_DIR = path.join(ANDROID_DIR, "template");
const DIST_DIR = path.join(ANDROID_DIR, "dist");

interface Args {
  manifestUrl: string;
  packageId: string;
  slug: string;
  keystorePath?: string;
  keystoreAlias: string;
}

function usageAndExit(message?: string): never {
  if (message) {
    console.error(`Error: ${message}\n`);
  }
  console.error(
    [
      "Usage: pnpm android:build -- --manifest-url <url> --package-id <id> --slug <slug> [--keystore-path <file>] [--keystore-alias <alias>]",
      "",
      "Required:",
      "  --manifest-url    HTTPS URL of the tenant's web app manifest (e.g. https://<tenant>.azentis.in/manifest.webmanifest)",
      "  --package-id      Android application id (e.g. in.azentis.<tenant>)",
      "  --slug            Output filename slug -> infra/android/dist/<slug>.apk",
      "",
      "Signing key (one of):",
      "  --keystore-path <file>       Path to an existing upload keystore (.jks)",
      "  ANDROID_KEYSTORE_BASE64      Base64-encoded keystore, decoded to a temp file for the build",
      "",
      "Required env vars (whichever keystore source is used):",
      "  ANDROID_KEYSTORE_PASSWORD    Keystore (store) password",
      "  ANDROID_KEY_PASSWORD         Key password (defaults to ANDROID_KEYSTORE_PASSWORD if unset)",
      "",
      "See infra/android/README.md for one-time keystore generation.",
    ].join("\n"),
  );
  process.exit(1);
}

function parseArgs(rawArgv: string[]): Args {
  // `pnpm run <script> -- --foo bar` forwards the literal `--` separator
  // into argv (unlike plain npm, which strips it) — drop it so it isn't
  // mistaken for a (malformed) flag.
  const argv = rawArgv.filter((arg) => arg !== "--");
  const flags = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      usageAndExit(`unrecognized argument: ${arg}`);
    }
    const key = arg.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      usageAndExit(`missing value for --${key}`);
    }
    flags.set(key, value);
    i++;
  }

  const manifestUrl = flags.get("manifest-url");
  const packageId = flags.get("package-id");
  const slug = flags.get("slug");

  if (!manifestUrl) usageAndExit("--manifest-url is required");
  if (!packageId) usageAndExit("--package-id is required");
  if (!slug) usageAndExit("--slug is required");

  try {
    const url = new URL(manifestUrl);
    if (url.protocol !== "https:") {
      usageAndExit("--manifest-url must be an https:// URL");
    }
  } catch {
    usageAndExit(`--manifest-url is not a valid URL: ${manifestUrl}`);
  }

  const packageIdError = util.validatePackageId(packageId);
  if (packageIdError !== null) {
    usageAndExit(`--package-id is invalid: ${packageIdError}`);
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    usageAndExit("--slug must contain only lowercase letters, digits, and hyphens");
  }

  return {
    manifestUrl,
    packageId,
    slug,
    keystorePath: flags.get("keystore-path"),
    keystoreAlias: flags.get("keystore-alias") || "upload",
  };
}

interface ResolvedKeystore {
  path: string;
  alias: string;
  keystorePassword: string;
  keyPassword: string;
  /** Set when the keystore was decoded from ANDROID_KEYSTORE_BASE64 into a temp file we own. */
  cleanupTempFile?: string;
}

function resolveKeystore(args: Args): ResolvedKeystore {
  const keystorePassword = process.env.ANDROID_KEYSTORE_PASSWORD;
  const keyPassword = process.env.ANDROID_KEY_PASSWORD || keystorePassword;

  // Checked before touching disk at all: if we decoded ANDROID_KEYSTORE_BASE64
  // to a temp file first and only then discovered the password was missing,
  // usageAndExit()'s synchronous process.exit(1) would skip main()'s
  // try/finally cleanup and leak that temp file under the OS temp dir.
  if (!keystorePassword) {
    usageAndExit(
      "ANDROID_KEYSTORE_PASSWORD is required to sign the APK (set ANDROID_KEY_PASSWORD too if the key password differs).",
    );
  }

  if (args.keystorePath && process.env.ANDROID_KEYSTORE_BASE64) {
    usageAndExit(
      "both --keystore-path and ANDROID_KEYSTORE_BASE64 are set — pick exactly one keystore source " +
        "(a stale --keystore-path could otherwise silently win over an intended CI secret).",
    );
  }

  let resolvedPath: string;
  let cleanupTempFile: string | undefined;

  if (args.keystorePath) {
    resolvedPath = path.resolve(args.keystorePath);
    if (!fs.existsSync(resolvedPath)) {
      usageAndExit(`keystore not found at --keystore-path ${resolvedPath}`);
    }
  } else if (process.env.ANDROID_KEYSTORE_BASE64) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "android-keystore-"));
    resolvedPath = path.join(tempDir, `upload-${randomBytes(4).toString("hex")}.jks`);
    fs.writeFileSync(resolvedPath, Buffer.from(process.env.ANDROID_KEYSTORE_BASE64, "base64"), {
      mode: 0o600,
    });
    cleanupTempFile = resolvedPath;
  } else {
    usageAndExit(
      "no keystore available — pass --keystore-path <file> or set ANDROID_KEYSTORE_BASE64. " +
        "A missing keystore never generates an ad hoc key; see infra/android/README.md.",
    );
  }

  return {
    path: resolvedPath,
    alias: args.keystoreAlias,
    keystorePassword,
    keyPassword: keyPassword!,
    cleanupTempFile,
  };
}

function resolveBubblewrapBin(): string {
  const pkgJsonPath = require_.resolve("@bubblewrap/cli/package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8")) as {
    bin?: Record<string, string>;
  };
  const binRelPath = pkg.bin?.bubblewrap;
  if (typeof binRelPath !== "string" || binRelPath.length === 0) {
    throw new Error(
      "unexpected @bubblewrap/cli package.json bin field shape — check for a version bump " +
        `(read from ${pkgJsonPath}, expected pkg.bin.bubblewrap to be a non-empty string).`,
    );
  }
  return path.join(path.dirname(pkgJsonPath), binRelPath);
}

function runBubblewrap(
  bin: string,
  args: string[],
  opts: { cwd: string; env?: NodeJS.ProcessEnv },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [bin, ...args], {
      cwd: opts.cwd,
      env: opts.env ?? process.env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`bubblewrap ${args[0]} exited with code ${code}`));
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const keystore = resolveKeystore(args);
  const bubblewrapBin = resolveBubblewrapBin();

  const workDir = path.join(DIST_DIR, ".work", args.slug);

  try {
    if (!fs.existsSync(TEMPLATE_DIR) || fs.readdirSync(TEMPLATE_DIR).length === 0) {
      throw new Error(
        `infra/android/template/ is missing or empty — scaffold it first (see infra/android/README.md).`,
      );
    }

    // Clean re-run: no stale/duplicate artifacts from a previous build of this slug.
    fs.rmSync(workDir, { recursive: true, force: true });
    fs.mkdirSync(workDir, { recursive: true });
    fs.cpSync(TEMPLATE_DIR, workDir, { recursive: true });

    console.log(`Fetching manifest: ${args.manifestUrl}`);
    const twaManifest = await TwaManifest.fromWebManifest(args.manifestUrl);
    twaManifest.packageId = args.packageId;
    twaManifest.signingKey = { path: keystore.path, alias: keystore.alias };
    await twaManifest.saveToFile(path.join(workDir, "twa-manifest.json"));

    console.log("Reconfiguring Android project (bubblewrap update)...");
    await runBubblewrap(bubblewrapBin, ["update", "--skipVersionUpgrade"], { cwd: workDir });

    console.log("Building and signing APK (bubblewrap build)...");
    await runBubblewrap(
      bubblewrapBin,
      ["build", "--signingKeyPath", keystore.path, "--signingKeyAlias", keystore.alias],
      {
        cwd: workDir,
        env: {
          ...process.env,
          BUBBLEWRAP_KEYSTORE_PASSWORD: keystore.keystorePassword,
          BUBBLEWRAP_KEY_PASSWORD: keystore.keyPassword,
        },
      },
    );

    const builtApk = path.join(workDir, "app-release-signed.apk");
    if (!fs.existsSync(builtApk)) {
      throw new Error(`build reported success but ${builtApk} is missing`);
    }

    fs.mkdirSync(DIST_DIR, { recursive: true });
    const outputApk = path.join(DIST_DIR, `${args.slug}.apk`);
    fs.copyFileSync(builtApk, outputApk);

    // Only clean up the scratch build dir on success — a failed run's
    // workDir is left in place (until the next attempt's pre-run rmSync
    // above) so it's there to debug. A successful one shouldn't linger:
    // every distinct --slug ever built would otherwise leave a full Gradle
    // project + build output (hundreds of MB) on disk indefinitely.
    fs.rmSync(workDir, { recursive: true, force: true });

    console.log(`\nDone: ${path.relative(process.cwd(), outputApk)}`);
  } finally {
    if (keystore.cleanupTempFile) {
      fs.rmSync(path.dirname(keystore.cleanupTempFile), { recursive: true, force: true });
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
