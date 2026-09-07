# Adoption Notes

Use these notes when replacing an existing tsconfig setup with `@howells/typescript-config`.

## Prefer explicit leaf selection

The safest migration is to update each leaf `tsconfig.json` so it extends the preset that matches its actual environment:

- DOM app with an external bundler: `@howells/typescript-config/bundler-dom-app`
- DOM React package: `@howells/typescript-config/react-library`
- Non-DOM app checked by TypeScript but built elsewhere: `@howells/typescript-config/bundler-no-dom-app`
- Library emitted by `tsc`: `@howells/typescript-config/tsc-no-dom-library`
- Next.js app: `@howells/typescript-config/nextjs`

This makes runtime and emit decisions visible at the call site.

## Avoid opaque wrappers

If an existing setup has local wrappers like `base.json` or `library.json`, do not keep those names forever just to minimize churn.

If you need a temporary compatibility layer, keep it short-lived and rename it toward what it actually means:

- `nextjs.json`
- `react-library.json`
- `bundler-no-dom-app.json`
- `tsc-no-dom-library.json`

The goal is to remove ambiguity, not preserve it behind old filenames.

## Audit before rewriting shared presets

Before replacing a shared preset, check every consumer of that preset.

In particular, verify:

- DOM vs non-DOM
- app vs library
- bundler vs `tsc`
- JSX vs non-JSX

Do not flip a shared preset from DOM to non-DOM, or from library emit to no-emit, without updating the leaves that depend on it.

## Keep overlays thin

House overlays should only add genuinely local policy.

Good examples:

- Next.js plugin and JSX mode
- React library JSX mode

Avoid adding:

- `paths`
- `baseUrl`
- consumer-specific `types`
- hidden runtime dependencies

## Native TypeScript 7

Install the stable native compiler in each package that owns a typecheck or
supported declaration build. Existing `tsc` scripts can retain their command;
verify the actual resolved executable with `pnpm exec tsc --version`.

Keep the current ES2023 target and libraries, DOM boundary, strictness, module
resolution and emit choices. A compiler upgrade alone does not require a new
shared preset or runtime target.

Remove retired `baseUrl` and obsolete `ignoreDeprecations` from leaf configs.
Keep `paths` targets explicitly relative to the config that declares them.
Declare ambient `types` at the leaf according to its runtime: Node, browser,
worker and test globals are separate decisions. Give incremental builds unique
local `tsBuildInfoFile` paths rather than sharing one through a preset.

TypeScript 7 does not expose the old JavaScript compiler API. Owned AST scripts
must use an explicit TypeScript 6 tooling dependency, such as
`@typescript/typescript6`, while application checking remains native. An existing
exact-pinned TypeScript 6 alias can remain where it is already proven. Third-party
declaration builders, framework plugins and parsers need their own supported
compiler resolution; do not globally override them to TypeScript 7.

Validate generated declarations and a fresh packed consumer for published
libraries. Check framework plugins in a real framework consumer: parsing the
Next preset in this package does not prove Next plugin or editor support.
