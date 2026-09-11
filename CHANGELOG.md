# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-09-11

This release fixes several cases where the inferred type didn't match what the schema
actually accepts. Because these change the types `Jet.Infer<>` produces, code that relied
on the old output may need updating — hence the major version bump.

### Fixed

- **Conditional (`if`/`then`) fields are no longer wrongly required.**
  A `then` was being treated as if its condition were always true, so its fields showed up
  as required on every result — which rejected valid data where the condition didn't apply.
  Now, when an `if`/`then` has no `else`, its fields are optional. This applies everywhere a
  bare `if`/`then` shows up: at the top level, inside `allOf`, inside object properties and
  array items, and nested inside other conditionals. Conditionals that *do* have an `else`
  are unchanged, and `anyOf`/`oneOf` branches stay strict.

- **`if`/`elseIf` chains without an `else` now handle the "nothing matched" case.**
  Before, only the branches that matched a condition were produced, so an object matching
  none of them was rejected. Now a fallback is added for when no condition matches — this is
  the intended "nothing matched" case, distinct from the duplicate branch removed in 1.1.2.

- **Boolean `true` now infers as `unknown` (any value) instead of `never` (no value)**
  in the places where it stands for a value — array items, `prefixItems`, and property
  values. `Jet.Infer<true>` now returns `unknown`. Everywhere else, `true` still steps aside
  so it doesn't wipe out the types around it.

- **`type: "boolean"` no longer infers as `unknown`.**
  A quirk in how TypeScript handles the `boolean` type was turning it into `unknown`.
  A real boolean field now correctly infers as `boolean`.

- **Inferred object properties are no longer `readonly`.**
  `Jet.Infer<>` now gives you plain, mutable object types. Fixed values (`enum`, `const`,
  `required`) are unaffected.

### Added

- **Boolean `true` support in `anyOf` and `oneOf`.**
  When a `true` schema sits next to an object schema, the object keeps its known fields and
  is also allowed any extra keys. `true` only does this next to object schemas; elsewhere it
  steps aside. (`allOf` needs nothing here — `true` adds no constraints in an intersection.)

### Known limitations

- **Conditions are matched by shape, not evaluated.** The inference reads which fields and
  `const`/`enum` values a condition declares — it can't check runtime values. Use literal
  discriminators (`.const()`, `.enum()`) for conditions.
- **`$ref` is not resolved** at the type level and infers as `unknown`. Use `.extend()` to
  reuse schemas.
- **A "nothing matched" fallback doesn't narrow its discriminator** — e.g. an object that
  *should* have matched a branch can still slip into the fallback. Being tightened in a
  future release.

## [2.0.0] - 2026-07-28

### Changed

- **BREAKING:** Version bumped to `2.0.0` to stay aligned with `@jetio/validator` 2.0,
  which had breaking API changes. No breaking changes in `schema-builder` itself.

## [1.1.2] - 2026-06-19

### Fixed

- **Extra type branches in `if`/`elseIf` chains without an `else`**: Schemas that used `if`/`elseIf` but no `else` were producing duplicated branches in the inferred type, because the empty `else` was still being merged in and caused the already-resolved branches to be processed a second time. Chains without an `else` now infer cleanly.
- **`elseIf` branches not being mutually exclusive**: When an `else` was present, the `elseIf` branches weren't made exclusive against one another, so a value matching more than one condition could be wrongly accepted by the inferred type. The branches are now correctly exclusive, matching `oneOf` semantics.

### Documentation

- Launched the official documentation site at <https://jet-schema-docs.vercel.app>
- Full Nextra v4 site with Pagefind search, covering the builder guide, type inference, worked examples, and the complete API reference across 43 pages.

## [1.1.0] - 2026-02-05

### Added

- **`Jet.Infer<>` type helper** - automatic TypeScript type inference from JSON schemas.
- **Full JSON Schema type support** - complete implementation of JSON Schema draft 06 - 2020-12 type inference.

#### Type Inference Features

**Primitives & literals**

- String, number, integer, boolean, and null types.
- Enum with automatic literal type inference (no `as const` required).
- Const for single literal values.
- Multiple types via method chaining (`.string().number()`).

**Complex types**

- Objects with required/optional properties.
- Nested objects with deep property inference.
- Arrays (homogeneous, tuples with `prefixItems`, rest elements).
- Pattern properties with template-literal types.

**Combinators**

- `oneOf` - exclusive unions with discriminated-union support.
- `anyOf` - standard TypeScript unions.
- `allOf` — intersection types with proper merging.

**Conditionals** (unique to JetIO)

- `if/then/else` — conditional type branching.
- `elseIf` — multiple condition chains.
- Accurate type narrowing based on discriminator fields.
- Full distribution over `oneOf` branches (e.g. 3 payment methods × 2 approval states = 6 type branches).

**Advanced features**

- Boolean schemas (`true` for unknown, `false` for never). _(Behavior refined in 3.0.0: `true` is now position-dependent — see the 3.0.0 entry.)_
- All keywords evaluated simultaneously (following the JSON Schema spec).
- Smart schema detection (infers object/array types even without an explicit `type` keyword).
- Support for `items: false`, `additionalItems: false`, `unevaluatedItems`, and similar.

#### Known Limitations

- **`$ref` resolution** — schema references cannot be resolved at compile time. _Workaround:_ use `.extend()` to reuse schemas.
- **Value-based conditions** — TypeScript cannot check runtime values in types (e.g. `amount >= 1000` in an `if` won't create type discrimination). _Workaround:_ use discriminator fields with literal types (`.const()` or `.enum()`).
- **String refinements** — pattern, format, and length constraints are runtime-only (e.g. `.pattern('^[0-9]{5}$')` infers as `string`).
- **Numeric ranges** — min/max constraints are runtime-only (e.g. `.minimum(0).maximum(100)` infers as `number`).
- **Deep recursion** - very deeply nested schemas (50+ levels) may hit TypeScript limits.

### Changed

- **BREAKING:** Tuple `prefixItems` and `items` now take variadic arguments instead of an array.

  Before:

```typescript
  .prefixItems([(s) => s.string(), (s) => s.number()])
  .items([(s) => s.string(), (s) => s.number()])
```

After:

```typescript
  .prefixItems((s) => s.string(), (s) => s.number())
  .items((s) => s.string(), (s) => s.number())
```

- **BREAKING:** `.extend()` is now called on a new `SchemaBuilder` with the source schema passed as an argument, rather than chained off an already-built schema.

  Before:

```typescript
const schema2 = logEntrySchema.extend().build();
```

After:

```typescript
const schema2 = new SchemaBuilder().extend(logEntrySchema).build();
```

### Documentation

- Added the comprehensive [Type Inference Guide](./TYPE_INFERENCE.md).
- Added [Type System Architecture](https://github.com/official-jetio/schema-builder/blob/main/ARCHITECTURE.md) for contributors.

### Performance

- Type inference computed at compile time with zero runtime overhead.
- Optimized type distribution for complex schemas.

## [1.0.3] - 2026-01-26

### Fixed

- Bug fix for expected values in error messages.

## [1.0.0] - 2026-01-23

### Added

- Initial release.
- Schema builder with fluent API.
- JSON Schema Draft 06 through 2020-12 support.
- Runtime validation with AJV.

[3.0.0]: https://github.com/official-jetio/schema-builder/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/official-jetio/schema-builder/compare/v1.1.2...v2.0.0
[1.1.2]: https://github.com/official-jetio/schema-builder/compare/v1.1.0...v1.1.2
[1.1.0]: https://github.com/official-jetio/schema-builder/releases/tag/v1.1.0
[1.0.3]: https://github.com/official-jetio/schema-builder/releases/tag/v1.0.3
[1.0.0]: https://github.com/official-jetio/schema-builder/releases/tag/v1.0.0