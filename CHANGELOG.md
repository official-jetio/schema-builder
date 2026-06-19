# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-06-19

### Fixed
- **Extra type branches in `if`/`elseIf` chains without an `else`**: Schemas that used `if`/`elseIf` but no `else` were producing duplicated branches in the inferred type, because the empty `else` was still being merged in and caused the already-resolved branches to be processed a second time. Chains without an `else` now infer cleanly.
- **`elseIf` branches not being mutually exclusive**: When an `else` was present, the `elseIf` branches weren't made exclusive against one another, so a value matching more than one condition could be wrongly accepted by the inferred type. The branches are now correctly exclusive, matching `oneOf` semantics.

### Documentation
- Launched the official documentation site at <https://jet-schema-docs.vercel.app>
- Full Nextra v4 site with Pagefind search, covering the builder guide, type inference, worked examples, and the complete API reference across 43 pages.

## [1.1.0] - 2026-02-05

### Added
- **`Jet.Infer<>` type helper** — automatic TypeScript type inference from JSON schemas.
- **Full JSON Schema type support** — complete implementation of JSON Schema draft 06 - 2020-12 type inference.

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
- `oneOf` — exclusive unions with discriminated-union support.
- `anyOf` — standard TypeScript unions.
- `allOf` — intersection types with proper merging.

**Conditionals** ⭐ (unique to JetIO)
- `if/then/else` — conditional type branching.
- `elseIf` — multiple condition chains.
- Accurate type narrowing based on discriminator fields.
- Full distribution over `oneOf` branches (e.g. 3 payment methods × 2 approval states = 6 type branches).

**Advanced features**
- Boolean schemas (`true` for unknown, `false` for never).
- All keywords evaluated simultaneously (following the JSON Schema spec).
- Smart schema detection (infers object/array types even without an explicit `type` keyword).
- Support for `items: false`, `additionalItems: false`, `unevaluatedItems`, and similar.

#### Known Limitations ⚠️
- **`$ref` resolution** — schema references cannot be resolved at compile time. *Workaround:* use `.extend()` to reuse schemas.
- **Value-based conditions** — TypeScript cannot check runtime values in types (e.g. `amount >= 1000` in an `if` won't create type discrimination). *Workaround:* use discriminator fields with literal types (`.const()` or `.enum()`).
- **String refinements** — pattern, format, and length constraints are runtime-only (e.g. `.pattern('^[0-9]{5}$')` infers as `string`).
- **Numeric ranges** — min/max constraints are runtime-only (e.g. `.minimum(0).maximum(100)` infers as `number`).
- **Deep recursion** — very deeply nested schemas (50+ levels) may hit TypeScript limits.

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

[1.1.2]: https://github.com/official-jetio/schema-builder/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/official-jetio/schema-builder/releases/tag/v1.1.0
[1.0.3]: https://github.com/official-jetio/schema-builder/releases/tag/v1.0.3
[1.0.0]: https://github.com/official-jetio/schema-builder/releases/tag/v1.0.0