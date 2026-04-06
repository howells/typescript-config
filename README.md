# `@howells/tsconfig`

Pinned wrappers and thin overlays around `@total-typescript/tsconfig`.

The goal is not to invent a second tsconfig philosophy. The goal is to:

- pin a specific upstream `@total-typescript/tsconfig` version
- give every consumer the same decision matrix
- keep only a few house overlays for framework and runtime cases

## Install

```bash
npm install -D @howells/tsconfig
```

## Core Presets

These map directly to the Total TypeScript decision tree:

- `@howells/tsconfig/bundler-dom-app`
- `@howells/tsconfig/bundler-dom-library`
- `@howells/tsconfig/bundler-dom-library-monorepo`
- `@howells/tsconfig/bundler-no-dom-app`
- `@howells/tsconfig/bundler-no-dom-library`
- `@howells/tsconfig/bundler-no-dom-library-monorepo`
- `@howells/tsconfig/tsc-dom-app`
- `@howells/tsconfig/tsc-dom-library`
- `@howells/tsconfig/tsc-dom-library-monorepo`
- `@howells/tsconfig/tsc-no-dom-app`
- `@howells/tsconfig/tsc-no-dom-library`
- `@howells/tsconfig/tsc-no-dom-library-monorepo`

## Overlays

These are intentionally small:

- `@howells/tsconfig/nextjs`
- `@howells/tsconfig/react-library`

## Examples

Next.js app:

```json
{
  "extends": "@howells/tsconfig/nextjs"
}
```

React package in a monorepo:

```json
{
  "extends": "@howells/tsconfig/react-library"
}
```

Non-DOM app checked by TypeScript but built elsewhere:

```json
{
  "extends": "@howells/tsconfig/bundler-no-dom-app"
}
```

Library emitted by `tsc`:

```json
{
  "extends": "@howells/tsconfig/tsc-no-dom-library"
}
```

## Rules

- Do not put consumer-local `paths` or `baseUrl` in these shared presets.
- Do not put workspace-specific `types` in shared presets unless the preset is explicitly runtime-specific.
- Do not reintroduce a universal `base.json` that hides runtime and emit decisions.
- Treat changes in compiler behavior as breaking changes when versioning this package.

## Upstream

This package follows Matt Pocock's guidance and wraps:

- `https://www.totaltypescript.com/tsconfig-cheat-sheet`
- `https://github.com/total-typescript/tsconfig`
