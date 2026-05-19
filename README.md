# `@howells/typescript-config`

Self-contained TypeScript config presets based on the Total TypeScript decision tree.

The goal is not to invent a second tsconfig philosophy. The goal is to:

- keep public preset names stable across projects
- give every consumer the same decision matrix
- avoid fragile transitive `extends` resolution in tools that parse `tsconfig.json` themselves
- keep only a few house overlays for framework and runtime cases

## Why Use This Instead Of The Upstream Package?

If `@total-typescript/tsconfig` already works for you directly, use it directly.

This package exists for teams that want a small amount of centralisation without creating a second config system. The public presets are self-contained so consumers do not need `@total-typescript/tsconfig` to be resolvable from their own workspace.

What it adds:

- stable package-local import paths like `@howells/typescript-config/nextjs`
- config files that are safe for tools such as bundlers, CLIs, and config loaders that do not use TypeScript's exact package resolution behavior
- a couple of thin house overlays for cases the upstream package does not name the way this repo wants to consume them
- a documented migration path that keeps runtime and emit choices explicit at the leaf `tsconfig.json`

What it does not add:

- a new baseline philosophy
- consumer-specific `paths`, `types`, or workspace hacks
- broad overrides on top of the upstream presets

In practice, this package is mainly useful when you want consistency, pinned upgrades, and a tiny amount of local naming policy across multiple apps and packages.

## Install

```bash
npm install -D @howells/typescript-config
```

## Core Presets

These map directly to the Total TypeScript decision tree:

- `@howells/typescript-config/bundler-dom-app`
- `@howells/typescript-config/bundler-dom-library`
- `@howells/typescript-config/bundler-dom-library-monorepo`
- `@howells/typescript-config/bundler-no-dom-app`
- `@howells/typescript-config/bundler-no-dom-library`
- `@howells/typescript-config/bundler-no-dom-library-monorepo`
- `@howells/typescript-config/tsc-dom-app`
- `@howells/typescript-config/tsc-dom-library`
- `@howells/typescript-config/tsc-dom-library-monorepo`
- `@howells/typescript-config/tsc-no-dom-app`
- `@howells/typescript-config/tsc-no-dom-library`
- `@howells/typescript-config/tsc-no-dom-library-monorepo`

## Overlays

These are intentionally small:

- `@howells/typescript-config/nextjs`
- `@howells/typescript-config/react-library`

## Examples

Next.js app:

```json
{
  "extends": "@howells/typescript-config/nextjs"
}
```

React package in a monorepo:

```json
{
  "extends": "@howells/typescript-config/react-library"
}
```

Non-DOM app checked by TypeScript but built elsewhere:

```json
{
  "extends": "@howells/typescript-config/bundler-no-dom-app"
}
```

Library emitted by `tsc`:

```json
{
  "extends": "@howells/typescript-config/tsc-no-dom-library"
}
```

## Rules

- Do not put consumer-local `paths` or `baseUrl` in these shared presets.
- Do not put workspace-specific `types` in shared presets unless the preset is explicitly runtime-specific.
- Do not reintroduce a universal `base.json` that hides runtime and emit decisions.
- Do not reintroduce public presets that only forward to a dependency package with `extends`.
- Treat changes in compiler behavior as breaking changes when versioning this package.

## Upstream

This package follows Matt Pocock's guidance and wraps:

- `https://www.totaltypescript.com/tsconfig-cheat-sheet`
- `https://github.com/total-typescript/tsconfig`
