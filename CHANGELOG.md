# Changelog

## [1.1.0] - 2026-02-05

tuple `prefixItems` and `items` was changed from `.prefixItems([])` and `.items([])` to `.prefixItems(...[])` and `.items(...[])`

Changed .extend() usage from
```typescript

const logEntrySchema = new SchemaBuilder()
  .object()
  .properties({
    key: (s) => s.string(),
    value: (s) => s.string(),
  })
  .required(["key", "value"])
  .build();

const schema2 = logEntrySchema.extend().build();

```
**to**
```typescript

const logEntrySchema = new SchemaBuilder()
  .object()
  .properties({
    key: (s) => s.string(),
    value: (s) => s.string(),
  })
  .required(["key", "value"])
  .build();

const schema2 = new SchemaBuilder()
  .extend(logEntrySchema)
  .build();

```


### Added
- **`Jet.Infer<>` type helper** - Automatic TypeScript type inference from JSON schemas
- **Full JSON Schema type support** - Complete implementation of JSON Schema draft-2020-12 type inference

#### Type Inference Features ✅

**Primitives & Literals**
- String, number, integer, boolean, null types
- Enum with automatic literal type inference (no `as const` required)
- Const for single literal values
- Multiple types via method chaining (`.string().number()`)

**Complex Types**
- Objects with required/optional properties
- Nested objects with deep property inference
- Arrays (homogeneous, tuples with `prefixItems`, rest elements)
- Pattern properties with template literal types

**Combinators**
- `oneOf` - Exclusive unions with discriminated union support
- `anyOf` - Standard TypeScript unions
- `allOf` - Intersection types with proper merging

**Conditionals** ⭐ (Unique to JetIO)
- `if/then/else` - Conditional type branching
- `elseIf` - Multiple condition chains
- Accurate type narrowing based on discriminator fields
- Full distribution over `oneOf` branches (e.g., 3 payment methods × 2 approval states = 6 type branches)

**Advanced Features**
- Boolean schemas (`true` for unknown, `false` for never)
- All keywords evaluated simultaneously (following JSON Schema spec)
- Smart schema detection (infers object/array types even without explicit `type` keyword)
- Support for `items: false`, `additionalItems: false`, `unevaluatedItems`, etc.

#### Known Limitations ⚠️

**Not Supported**
- **`$ref` resolution** - Schema references cannot be resolved at compile time
  - *Workaround*: Use `.extend()` to reuse schemas
- **Value-based conditions** - TypeScript cannot check runtime values in types
  - Example: `amount >= 1000` in `if` conditions won't create type discrimination
  - *Workaround*: Use discriminator fields with literal types (`.const()` or `.enum()`)
- **String refinements** - Pattern, format, length constraints are runtime-only
  - Example: `.pattern('^[0-9]{5}$')` infers as `string`, not "5-digit string"
- **Numeric ranges** - Min/max constraints are runtime-only
  - Example: `.minimum(0).maximum(100)` infers as `number`, not "number between 0-100"
- **Deep recursion** - Very deeply nested schemas (50+ levels) may hit TypeScript limits

#### Documentation
- Added comprehensive [Type Inference Guide](./TYPE_INFERENCE.md)
- Added [Type System Architecture](https://github.com/official-jetio/schema-builder/blob/main/ARCHITECTURE.md) for contributors

### Performance
- Type inference computed at compile time with zero runtime overhead
- Optimized type distribution for complex schemas


---

## [1.0.3] - 2026-01-26

### Fixed
- Bug fix for expected values in error messages

---

## [1.0.0] - 2026-01-23

### Added
- Initial release
- Schema builder with fluent API
- JSON Schema Draft 06 through 2020-12 support
- Runtime validation with AJV