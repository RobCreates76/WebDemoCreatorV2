/**
 * Ensures platform-specific native binaries for Tailwind CSS v4 (lightningcss + oxide).
 * Optional npm dependencies are sometimes skipped when node_modules is copied or synced.
 */
const { execSync } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/** @type {Record<string, string[]>} */
const PACKAGES_BY_PLATFORM = {
  "win32-x64": [
    "lightningcss-win32-x64-msvc",
    "@tailwindcss/oxide-win32-x64-msvc",
  ],
  "win32-arm64": [
    "lightningcss-win32-arm64-msvc",
    "@tailwindcss/oxide-win32-arm64-msvc",
  ],
  "darwin-arm64": [
    "lightningcss-darwin-arm64",
    "@tailwindcss/oxide-darwin-arm64",
  ],
  "darwin-x64": [
    "lightningcss-darwin-x64",
    "@tailwindcss/oxide-darwin-x64",
  ],
  "linux-x64": [
    "lightningcss-linux-x64-gnu",
    "@tailwindcss/oxide-linux-x64-gnu",
  ],
  "linux-arm64": [
    "lightningcss-linux-arm64-gnu",
    "@tailwindcss/oxide-linux-arm64-gnu",
  ],
};

const key = `${process.platform}-${process.arch}`;
const packages = PACKAGES_BY_PLATFORM[key];
if (!packages) {
  process.exit(0);
}

const missing = packages.filter((name) => {
  try {
    require.resolve(name, { paths: [ROOT] });
    return false;
  } catch {
    return true;
  }
});

if (missing.length === 0) {
  process.exit(0);
}

console.log(`[postinstall] Installing native CSS deps for ${key}: ${missing.join(", ")}`);
execSync(`npm install --no-save ${missing.join(" ")}`, {
  cwd: ROOT,
  stdio: "inherit",
});
