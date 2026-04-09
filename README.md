# `@howells/typescript-config`

Pinned wrappers and thin overlays around `@total-typescript/tsconfig`.

The goal is not to invent a second tsconfig philosophy. The goal is to:

- pin a specific upstream `@total-typescript/tsconfig` version
- give every consumer the same decision matrix
- keep only a few house overlays for framework and runtime cases

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
- Treat changes in compiler behavior as breaking changes when versioning this package.

## Upstream

This package follows Matt Pocock's guidance and wraps:

- `https://www.totaltypescript.com/tsconfig-cheat-sheet`
- `https://github.com/total-typescript/tsconfig`
