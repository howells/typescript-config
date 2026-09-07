import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
const presets = Object.keys(manifest.exports).filter((name) => name !== "./package.json");
const temporary = mkdtempSync(join(tmpdir(), "typescript-config-"));
const results = [];
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);

try {
  // Exercise the published package layout, not source-relative extends paths.
  const [packed] = JSON.parse(
    execFileSync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", temporary], {
      cwd: root,
      encoding: "utf-8",
    }),
  );
  execFileSync("tar", ["-xzf", join(temporary, packed.filename), "-C", temporary]);
  mkdirSync(join(temporary, "node_modules", "@howells"), { recursive: true });
  symlinkSync(
    join(temporary, "package"),
    join(temporary, "node_modules", "@howells", "typescript-config"),
    "dir",
  );
  const react = join(temporary, "node_modules", "react");
  mkdirSync(react, { recursive: true });
  writeJson(join(react, "package.json"), {
    exports: { "./jsx-runtime": "./jsx-runtime.d.ts" },
    name: "react",
  });
  writeFileSync(
    join(react, "jsx-runtime.d.ts"),
    "export namespace JSX { interface Element {} interface IntrinsicElements { div: { title: string } } }\n",
  );

  for (const packageName of ["@typescript/typescript6", "typescript"]) {
    const packagePath = join(root, "node_modules", packageName);
    const compiler = JSON.parse(readFileSync(join(packagePath, "package.json"), "utf-8"));
    const binary = join(packagePath, Object.values(compiler.bin)[0]);
    const actualVersion = execFileSync(process.execPath, [binary, "--version"], {
      encoding: "utf-8",
    }).trim();
    assert.match(actualVersion, packageName === "typescript" ? /^Version 7\./u : /^Version 6\./u);
    for (const preset of presets) {
      const name = preset.slice(2);
      const options = JSON.parse(
        readFileSync(join(temporary, "package", `${name}.json`), "utf-8"),
      ).compilerOptions;
      const directory = join(temporary, `${compiler.version}-${name}`);
      mkdirSync(directory);
      writeJson(join(directory, "package.json"), { type: "module" });
      const jsx = name === "nextjs" || name === "react-library";
      const extension = jsx ? "tsx" : "ts";
      writeFileSync(
        join(directory, `index.${extension}`),
        `export const first = (items: string[]): string | undefined => items[0];\n${options.lib.includes("dom") ? 'export const element = document.createElement("div");\n' : ""}${jsx ? 'export const view = <div title="Preset" />;\n' : ""}`,
      );
      writeFileSync(
        join(directory, "jsx.d.ts"),
        "declare namespace JSX { interface Element {} interface IntrinsicElements { div: { title: string } } }\n",
      );
      writeJson(join(directory, "tsconfig.json"), {
        compilerOptions: {
          outDir: "./dist",
          rootDir: ".",
          types: [],
          ...(options.composite ? { tsBuildInfoFile: "./dist/build.tsbuildinfo" } : {}),
        },
        extends: `@howells/typescript-config/${name}`,
        include: [`index.${extension}`, "jsx.d.ts", "invalid.ts"],
      });
      const args = options.composite
        ? ["--build", "--force", "--pretty", "false"]
        : ["--project", "tsconfig.json", "--pretty", "false"];
      const started = performance.now();
      const valid = spawnSync(process.execPath, [binary, ...args], {
        cwd: directory,
        encoding: "utf-8",
      });
      assert.equal(valid.status, 0, `${compiler.version}/${name}: ${valid.stdout}${valid.stderr}`);
      if (options.declaration) {
        assert.match(
          readFileSync(join(directory, "dist/index.d.ts"), "utf-8"),
          /string \| undefined/u,
        );
      }
      if (options.noEmit) {
        assert.equal(
          existsSync(join(directory, "dist")),
          false,
          `${name} unexpectedly emitted files`,
        );
      }
      // Known-invalid controls prove strictness and the non-DOM boundary remain active.
      writeFileSync(
        join(directory, "invalid.ts"),
        `export const wrong: string = 1;\nexport const unchecked: string = ([] as string[])[0];\n${options.lib.includes("dom") ? "" : "export const browserOnly = document.title;\n"}`,
      );
      const invalid = spawnSync(process.execPath, [binary, ...args], {
        cwd: directory,
        encoding: "utf-8",
      });
      assert.notEqual(invalid.status, 0, `${compiler.version}/${name} accepted invalid input`);
      assert.match(invalid.stdout, /TS2322/u);
      assert.match(invalid.stdout, /undefined/u);
      if (!options.lib.includes("dom")) {
        assert.match(invalid.stdout, /Cannot find name 'document'/u);
      }
      results.push({
        actualVersion,
        compiler: compiler.version,
        elapsedMs: Math.round(performance.now() - started),
        passed: true,
        preset: name,
      });
    }
  }
  console.log(
    JSON.stringify(
      {
        cases: results.length,
        invalidControls: results.length,
        packedPresets: presets.length,
        results,
      },
      null,
      2,
    ),
  );
} finally {
  rmSync(temporary, { force: true, recursive: true });
}
