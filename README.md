# 📐 Schema Builder Guide

The Schema Builder provides a fluent, type-safe API for constructing JSON Schemas programmatically. Build complex schemas with autocomplete, validation, and zero boilerplate.

> **Note:** This package includes [@jetio/validator](https://github.com/official-jetio/validator) as a dependency. You get both the builder AND the fastest JSON Schema validator in one install.

---

## 📦 Installation

```bash
npm install @jetio/schema-builder
# or
yarn add @jetio/schema-builder
# or
pnpm add @jetio/schema-builder
```

```typescript
import { SchemaBuilder, RefBuilder } from "@jetio/schema-builder";
import { JetValidator } from "@jetio/schema-builder"; // Re-exported from @jetio/validator
```

> **Just need the validator?** Install [@jetio/validator](https://www.npmjs.com/package/@jetio/validator) directly for a smaller bundle.

---

## 🎯 Quick Start

```typescript
import { SchemaBuilder } from "@jetio/schema-builder";

// Simple schema
const userSchema = new SchemaBuilder()
  .object()
  .properties({
    name: s => s.string().minLength(2),
    age: s => s.number().minimum(18)
  })
  .required(['name', 'age'])
  .build();

// Equivalent to:
{
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    age: { type: "number", minimum: 18 }
  },
  required: ["name", "age"]
}
```

---

## 📚 Table of Contents

- [Basic Types](#basic-types)
- [TypeScript Type Locking](#typescript-type-locking)
- [String Schemas](#string-schemas)
- [Number Schemas](#number-schemas)
- [Array Schemas](#array-schemas)
- [Object Schemas](#object-schemas)
- [Boolean Schema Values](#boolean-schema-values)
- [Composition (allOf, anyOf, oneOf)](#composition)
- [Conditionals (if/then/else)](#conditionals)
- [References ($ref, $dynamicRef)](#references)
- [Definitions ($defs)](#definitions)
- [Custom Error Messages](#custom-error-messages)
- [Advanced Features](#advanced-features)
- [Schema Reuse & Extension](#schema-reuse--extension)
- [Mixed Approaches](#mixed-approaches)

---

## Draft Support

The Schema Builder supports JSON Schema keywords from **Draft 06 through Draft 2020-12**, including:

- **Draft 06/07**: `definitions`, `dependencies`, `items` (array form), `additionalItems`
- **Draft 2019-09**: `$defs`, `dependentSchemas`, `dependentRequired`, `unevaluatedProperties`, `unevaluatedItems`
- **Draft 2020-12**: `prefixItems`, `$dynamicRef`, `$dynamicAnchor`
- **Extension**: `elseIf` (Jet-Validator extension for cleaner conditionals)

Use the appropriate keywords for your target draft version. The builder doesn't enforce draft restrictions — you can mix keywords, but ensure your validator supports them.

**The builder follows json schema rules which means a schema can either be a standard json schema or a boolean.**

## Basic Types

### Simple Type Declarations

```typescript
// String
const nameSchema = new SchemaBuilder().string().build();
// { type: "string" }

// Number
const ageSchema = new SchemaBuilder().number().build();
// { type: "number" }

// Integer
const countSchema = new SchemaBuilder().integer().build();
// { type: "integer" }

// Boolean
const activeSchema = new SchemaBuilder().boolean().build();
// { type: "boolean" }

// Null
const nullSchema = new SchemaBuilder().null().build();
// { type: "null" }
```

### Multiple Types

```typescript
// Chain type methods to create type arrays
const flexibleSchema = new SchemaBuilder().string().number().build();
// { type: ["string", "number"] }

// Nullable values
const nullableString = new SchemaBuilder().string().null().minLength(5).build();
// { type: ["string", "null"], minLength: 5 }
```

### Universal Keywords

These work with any type and are not locked to a specific type builder:

```typescript
const schema = new SchemaBuilder()
  .$schema("https://json-schema.org/draft/2020-12/schema")
  .$id("https://json-schema.org/draft/2020-12/schema")
  .title("User Email")
  .description("The user's primary email address")
  .default("user@example.com")
  .examples("alice@example.com", "bob@example.com")
  .enum(["alice@example.com", "bob@example.com", "admin@example.com"])
  .readOnly()
  .build();

// Result:
{
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://json-schema.org/draft/2020-12/schema"
  title: "User Email",
  description: "The user's primary email address",
  default: "user@example.com",
  examples: ["alice@example.com", "bob@example.com"],
  enum: ["alice@example.com", "bob@example.com", "admin@example.com"],
  readOnly: true
}
```

**Universal keywords include:**

| Keyword                          | Description                           |
| -------------------------------- | ------------------------------------- |
| `.$schema(schema)`               | Schema draft                          |
| `.$id(schemaId)`                 | Unique schema identifier              |
| `.$ref(ref)`                     | Schema reference                      |
| `.$dynamicRef(dynamicRef)`       | Dynamic schema reference              |
| `.$anchor(anchor)`               | Schema identifier                     |
| `.$dynamicAnchor(dynamicAnchor)` | Dynamic schema identifier             |
| `.definitions(definitions)`      | Schema definitions(draft 7 and below) |
| `.$defs(defs)`                   | Schema definitions                    |
| `.title(title)`                  | Human-readable title                  |
| `.description(desc)`             | Human-readable description            |
| `.default(value)`                | Default value                         |
| `.examples(...values)`           | Example values                        |
| `.enum(values)`                  | Array of values (any type)            |
| `.const(value)`                  | Single allowed value (any type)       |
| `.readOnly()`                    | Mark as read-only                     |
| `.writeOnly()`                   | Mark as write-only                    |
| `.not(schema)`                   | Negation                              |
| `.anyOf(...schemas)`             | Match at least one                    |
| `.allOf(...schemas)`             | Match all                             |
| `.oneOf(...schemas)`             | Match exactly one                     |
| `.if(condition)`                 | Conditional validation                |
| `.errorMessage(msg)`             | Custom error messages                 |
| `.option(key, value)`            | Any custom keyword                    |

These can be combined with any type:

```typescript
// Enum with numbers
new SchemaBuilder().number().enum([1, 2, 3, 5, 8, 13]).build();

// Const with boolean
new SchemaBuilder().boolean().const(true).build();

// Composition without a type
new SchemaBuilder()
  .anyOf(
    (s) => s.string(),
    (s) => s.number(),
  )
  .build();
```

## TypeScript Type Locking

When chaining type methods, the **first type called** determines which keywords TypeScript makes available:

```typescript
// String-first: string keywords available
new SchemaBuilder()
  .string() // Locks to StringSchemaBuilder
  .number() // Adds "number" to type array, but still StringSchemaBuilder
  .minLength(5) // ✅ String keyword - available
  .pattern(/^a/) // ✅ String keyword - available
  .minimum(0); // ❌ TypeScript error - number keyword not available

// Number-first: number keywords available
new SchemaBuilder()
  .number() // Locks to NumberSchemaBuilder
  .string() // Adds "string" to type array, but still NumberSchemaBuilder
  .minimum(0) // ✅ Number keyword - available
  .multipleOf(5) // ✅ Number keyword - available
  .minLength(5); // ❌ TypeScript error - string keyword not available
```

**Why this design?**

This ensures strict typing, making sure only methods of the desired type are accessible. The first type called decides the available methods, but users can still accept other types if they want a multi-type schema with one primary type's constraints.

If you need to define constraints for multiple types, use `.end()` to reset to the base `SchemaBuilder` and then call the next type:

```typescript
const schema = new SchemaBuilder()
  .string()
  .number()
  .minLength(5) // String constraint
  .end() // Reset to base SchemaBuilder
  .number() // Now NumberSchemaBuilder
  .minimum(0) // Number constraint now available
  .build();

// Result: { type: ["string", "number"], minLength: 5, minimum: 0 }
```

## String Schemas

### Length Constraints

```typescript
const usernameSchema = new SchemaBuilder()
  .string()
  .minLength(3)
  .maxLength(20)
  .build();
// { type: "string", minLength: 3, maxLength: 20 }
```

### Pattern Matching

```typescript
// Using RegExp
const slugSchema = new SchemaBuilder()
  .string()
  .pattern(/^[a-z0-9-]+$/)
  .build();

// Using string
const emailPattern = new SchemaBuilder()
  .string()
  .pattern("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
  .build();
```

### Format Validation

```typescript
const contactSchema = new SchemaBuilder()
  .object()
  .properties({
    email: (s) => s.string().format("email"),
    website: (s) => s.string().format("uri"),
    createdAt: (s) => s.string().format("date-time"),
  })
  .build();

// Supported formats: email, uri, uri-reference, uri-template,
// date, time, date-time, duration, uuid, ipv4, ipv6, hostname,
// json-pointer, relative-json-pointer, regex
```

## Number Schemas

### Numeric Constraints

```typescript
const priceSchema = new SchemaBuilder()
  .number()
  .minimum(0)
  .maximum(1000000)
  .build();
// { type: "number", minimum: 0, maximum: 1000000 }

// Exclusive bounds
const percentageSchema = new SchemaBuilder()
  .number()
  .exclusiveMinimum(0)
  .exclusiveMaximum(100)
  .build();
// { type: "number", exclusiveMinimum: 0, exclusiveMaximum: 100 }
```

### Multiple Of

```typescript
const evenNumberSchema = new SchemaBuilder().integer().multipleOf(2).build();

const priceInCents = new SchemaBuilder().number().multipleOf(0.01).build();
```

### Convenience Methods

```typescript
// Positive numbers (>= 0)
const positiveSchema = new SchemaBuilder().number().positive().build();
// { type: "number", minimum: 0 }

// Negative numbers (<= 0)
const negativeSchema = new SchemaBuilder().number().negative().build();
// { type: "number", maximum: 0 }

// Range shorthand
const scoreSchema = new SchemaBuilder().number().range(0, 100).build();
// { type: "number", minimum: 0, maximum: 100 }
```

---

### Enums & Constants

```typescript
// Enum (multiple allowed values)
const statusSchema = new SchemaBuilder()
  .string()
  .enum(["active", "inactive", "pending"])
  .build();

// Const (single allowed value)
const typeSchema = new SchemaBuilder().string().const("user").build();
```

---

## Array Schemas

### Basic Arrays

```typescript
// Array with item schema
const numbersSchema = new SchemaBuilder()
  .array()
  .items((s) => s.number())
  .build();
// { type: "array", items: { type: "number" } }

// With size constraints
const tagsSchema = new SchemaBuilder()
  .array()
  .items((s) => s.string())
  .minItems(1)
  .maxItems(10)
  .uniqueItems(true)
  .build();
```

### Tuple Validation (Prefix Items)

```typescript
// Fixed-length arrays with different types per position
const coordinateSchema = new SchemaBuilder()
  .array()
  .prefixItems([
    s => s.number(), // latitude
    s => s.number()  // longitude
  ])
  .minItems(2)
  .maxItems(2)
  .build();

// Result:
{
  type: "array",
  prefixItems: [
    { type: "number" },
    { type: "number" }
  ],
  minItems: 2,
  maxItems: 2
}
```

### Contains & Count Constraints

```typescript
// Array must contain at least one number > 100
const arrayWithLargeNumber = new SchemaBuilder()
  .array()
  .items((s) => s.number())
  .contains((s) => s.number().minimum(100))
  .minContains(1)
  .maxContains(5)
  .build();
```

### Complex Array Items

```typescript
const usersSchema = new SchemaBuilder()
  .array()
  .items((s) =>
    s
      .object()
      .properties({
        id: (s) => s.integer(),
        name: (s) => s.string().minLength(1),
        email: (s) => s.string().format("email"),
        roles: (s) => s.array().items((s) => s.string()),
      })
      .required(["id", "name", "email"]),
  )
  .minItems(1)
  .build();
```

### Unevaluated Items (Draft 2019-09+)

Control validation of array items not covered by `prefixItems`, `items`, or `contains`:

```typescript
// Disallow any unevaluated items
const strictTuple = new SchemaBuilder()
  .array()
  .prefixItems([
    s => s.string(),
    s => s.number()
  ])
  .unevaluatedItems(false)
  .build();

// Result:
{
  type: "array",
  prefixItems: [
    { type: "string" },
    { type: "number" }
  ],
  unevaluatedItems: false
}
// Valid: ["hello", 42]
// Invalid: ["hello", 42, "extra"]

// Allow unevaluated items with schema
const flexibleTuple = new SchemaBuilder()
  .array()
  .prefixItems([
    s => s.string(),
    s => s.number()
  ])
  .unevaluatedItems(s => s.boolean())
  .build();

// Valid: ["hello", 42, true, false]
// Invalid: ["hello", 42, "not a boolean"]

// Allow any unevaluated items
const openTuple = new SchemaBuilder()
  .array()
  .prefixItems([
    s => s.string(),
    s => s.number()
  ])
  .unevaluatedItems(true)
  .build();

// Valid: ["hello", 42, anything, anything, ...]
```

### Additional Items (Draft 07 and earlier)

For older drafts, use `additionalItems` with array-form `items`:

```typescript
// Disallow additional items beyond the tuple
const strictTupleLegacy = new SchemaBuilder()
  .array()
  .items([
    { type: "string" },
    { type: "number" }
  ])
  .additionalItems(false)
  .build();

// Result:
{
  type: "array",
  items: [
    { type: "string" },
    { type: "number" }
  ],
  additionalItems: false
}
// Valid: ["hello", 42]
// Invalid: ["hello", 42, "extra"]

// Allow additional items with schema
const flexibleTupleLegacy = new SchemaBuilder()
  .array()
  .items([
    s => s.string(),
    s => s.number()
  ])
  .additionalItems(s => s.boolean())
  .build();

// Valid: ["hello", 42, true, false]
// Invalid: ["hello", 42, "not a boolean"]

// Allow any additional items
const openTupleLegacy = new SchemaBuilder()
  .array()
  .items([
    s => s.string(),
    s => s.number()
  ])
  .additionalItems(true)
  .build();

// Valid: ["hello", 42, anything, ...]
```

> **Note:** In Draft 2020-12, array-form `items` was replaced by `prefixItems`, and `additionalItems` was replaced by `items` (schema form) for items beyond the tuple. Use `unevaluatedItems` for items not validated by any keyword.

---

## Object Schemas

### Properties And Required

```typescript
// Basic object
const personSchema = new SchemaBuilder()
  .object()
  .properties({
    firstName: (s) => s.string(),
    lastName: (s) => s.string(),
    age: (s) => s.integer().minimum(0),
  })
  .required(["firstName", "lastName"])
  .build();
```

### Pattern Properties

```typescript
// Properties matching a pattern
const configSchema = new SchemaBuilder()
  .object()
  .properties({
    version: (s) => s.string(),
  })
  .patternProperties({
    "^env_": (s) => s.string(), // env_* properties must be strings
    "^flag_": (s) => s.boolean(), // flag_* properties must be booleans
  })
  .build();

// Matches: { version: "1.0", env_mode: "production", flag_debug: true }
```

### Additional Properties

```typescript
// Disallow additional properties (strict)
const strictSchema = new SchemaBuilder()
  .object()
  .properties({
    name: (s) => s.string(),
  })
  .additionalProperties(false)
  .build();

// Allow additional properties with schema
const flexibleSchema = new SchemaBuilder()
  .object()
  .properties({
    knownProp: (s) => s.string(),
  })
  .additionalProperties((s) => s.number())
  .build();
// Any additional property must be a number
```

### Unevaluated Properties (Draft 2019-09+)

Control validation of properties not evaluated by `properties`, `patternProperties`, `additionalProperties`, or any subschema in `allOf`, `anyOf`, `oneOf`, `if/then/else`:

```typescript
// Disallow unevaluated properties
const strictComposition = new SchemaBuilder()
  .object()
  .allOf(
    (s) =>
      s.object().properties({
        name: (s) => s.string(),
      }),
    (s) =>
      s.object().properties({
        age: (s) => s.integer(),
      }),
  )
  .unevaluatedProperties(false)
  .build();

// Valid: { name: "Alice", age: 30 }
// Invalid: { name: "Alice", age: 30, extra: "oops" }

// Allow unevaluated properties with schema
const flexibleComposition = new SchemaBuilder()
  .object()
  .allOf((s) =>
    s.object().properties({
      id: (s) => s.integer(),
    }),
  )
  .unevaluatedProperties((s) => s.string())
  .build();

// Valid: { id: 1, name: "Alice", description: "A user" }
// Invalid: { id: 1, count: 42 } // count is number, not string

// Allow any unevaluated properties
const openComposition = new SchemaBuilder()
  .object()
  .allOf((s) =>
    s.object().properties({
      id: (s) => s.integer(),
    }),
  )
  .unevaluatedProperties(true)
  .build();

// Valid: { id: 1, anything: "goes" }
```

> **When to use which:**
>
> - `additionalProperties`: Simple objects without composition
> - `unevaluatedProperties`: Complex schemas with `allOf`/`anyOf`/`oneOf`/`if-then-else` where properties are defined across multiple subschemas

### Property Name Constraints

```typescript
// Property names must match a pattern
const schema = new SchemaBuilder()
  .object()
  .propertyNames((s) => s.string().pattern("^[a-z_]+$"))
  .build();
// All property names must be lowercase with underscores
```

### Property Count

```typescript
const schema = new SchemaBuilder()
  .object()
  .minProperties(1)
  .maxProperties(10)
  .build();
```

### Dependent Schemas

```typescript
// When 'creditCard' exists, require 'billingAddress'
const paymentSchema = new SchemaBuilder()
  .object()
  .properties({
    creditCard: (s) => s.string(),
    billingAddress: (s) => s.string(),
    shippingAddress: (s) => s.string(),
  })
  .dependentSchemas({
    creditCard: (s) => s.object().required(["billingAddress"]),
  })
  .build();
```

### Dependent Required

```typescript
// When 'country' is present, 'state' must also be present
const addressSchema = new SchemaBuilder()
  .object()
  .properties({
    street: (s) => s.string(),
    city: (s) => s.string(),
    state: (s) => s.string(),
    country: (s) => s.string(),
  })
  .dependentRequired({
    country: ["state"],
    state: ["city"],
  })
  .build();
```

### Dependencies

```typescript
// When 'creditCard' exists, require 'billingAddress'
const paymentSchema = new SchemaBuilder()
  .object()
  .properties({
    creditCard: (s) => s.string(),
    billingAddress: (s) => s.string(),
    shippingAddress: (s) => s.string(),
    street: (s) => s.string(),
    city: (s) => s.string(),
    state: (s) => s.string(),
    country: (s) => s.string(),
  })
  .dependencies({
    creditCard: (s) => s.object().required(["billingAddress"]),
    country: ["state"],
    state: ["city"],
  })
  .build();
```

### Nested Objects

```typescript
const companySchema = new SchemaBuilder()
  .object()
  .properties({
    name: (s) => s.string(),
    address: (s) =>
      s
        .object()
        .properties({
          street: (s) => s.string(),
          city: (s) => s.string(),
          country: (s) => s.string(),
        })
        .required(["street", "city", "country"]),
    employees: (s) =>
      s.array().items((s) =>
        s.object().properties({
          name: (s) => s.string(),
          role: (s) => s.string(),
        }),
      ),
  })
  .required(["name", "address"])
  .build();
```

### Removing Properties

When extending schemas, remove unwanted fields:

```typescript
const fullSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.integer(),
    name: (s) => s.string(),
    password: (s) => s.string(),
    secret: (s) => s.string(),
  })
  .required(["id", "name", "password"]);

const publicSchema = fullSchema
  .extend()
  .remove(
    ["password", "secret"], // Fields to remove
    ["properties", "required"], // Remove from both places
  )
  .build();

// Available targets: "properties", "required", "patternProperties",
//                    "dependencies", "dependentRequired"
```

### Making Fields Optional

Remove all required constraints:

```typescript
const strictSchema = new SchemaBuilder()
  .object()
  .properties({ name: (s) => s.string() })
  .required(["name"]);

const looseSchema = strictSchema
  .extend()
  .optional() // Removes required array entirely
  .build();
```

---

## Boolean Schema Values

Many keywords accept `true`, `false`, a schema object, or a builder callback. Boolean values have special meanings:

### Object Keywords

```typescript
// additionalProperties
.additionalProperties(false)          // No extra properties allowed
.additionalProperties(true)           // Any extra properties allowed (default)
.additionalProperties(s => s.string()) // Extra properties must be strings

// unevaluatedProperties
.unevaluatedProperties(false)         // No unevaluated properties allowed
.unevaluatedProperties(true)          // Any unevaluated properties allowed
.unevaluatedProperties(s => s.number()) // Unevaluated must be numbers
```

### Array Keywords

```typescript
// items
.items(false)                         // Array must be empty
.items(true)                          // Any items allowed
.items(s => s.string())               // All items must be strings

// additionalItems (Draft 7 and earlier)
.additionalItems(false)               // No additional items beyond prefixItems
.additionalItems(true)                // Any additional items allowed
.additionalItems(s => s.number())     // Additional items must be numbers

// unevaluatedItems
.unevaluatedItems(false)              // No unevaluated items allowed
.unevaluatedItems(true)               // Any unevaluated items allowed
.unevaluatedItems(s => s.string())    // Unevaluated must be strings

// contains
.contains(true)                       // Array must have at least one item
.contains(false)                      // Always fails (array can't contain anything)
.contains(s => s.number().minimum(10)) // Must contain number >= 10
```

### Composition Keywords

```typescript
// not
.not(true)                            // Always fails (not true = false)
.not(false)                           // Always passes (not false = true)
.not(s => s.string())                 // Must not be a string

// In anyOf, allOf, oneOf
.anyOf(
  true,                               // Always matches
  s => s.string(),
  { type: "number" }                  // Plain JSON also works
)
```

## **Basically in json schema, a boolean is a schema so any keyword that accepts a schema also accepts a boolean.**

## Composition

### allOf - Schema Intersection

All schemas must validate (AND logic):

```typescript
// Combine multiple schemas
const strictStringSchema = new SchemaBuilder()
  .allOf(
    (s) => s.string().minLength(5),
    (s) => s.string().maxLength(10),
    (s) => s.string().pattern("^[A-Z]"),
  )
  .build();

// Result: Must be 5-10 chars AND start with uppercase
// Valid: "Hello", "World"
// Invalid: "hi" (too short), "hello" (no uppercase start)
```

**Practical Example - Combining Base + Extension:**

```typescript
const baseUserSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.integer(),
    name: (s) => s.string(),
  })
  .required(["id", "name"]);

const adminUserSchema = new SchemaBuilder()
  .allOf(
    (s) => s.extend(baseUserSchema), // Include all base properties
    (s) =>
      s
        .object()
        .properties({
          permissions: (s) => s.array().items((s) => s.string()),
          adminLevel: (s) => s.integer().minimum(1),
        })
        .required(["permissions"]),
  )
  .build();

// Result: Admin has id, name, permissions, adminLevel
```

### anyOf - Schema Union

At least one schema must validate (OR logic):

```typescript
// Accept string OR number
const flexibleIdSchema = new SchemaBuilder()
  .anyOf(
    (s) => s.string().pattern("^[A-Z]{3}\\d{3}$"), // e.g., "ABC123"
    (s) => s.integer().minimum(1000), // e.g., 1234
  )
  .build();

// Valid: "ABC123" or 5000
// Invalid: "abc123" (lowercase), 500 (too small)
```

**Practical Example - Payment Methods:**

```typescript
const paymentMethodSchema = new SchemaBuilder()
  .object()
  .properties({
    type: (s) => s.string(),
  })
  .anyOf(
    // Credit card payment
    (s) =>
      s
        .object()
        .properties({
          type: (s) => s.const("credit_card"),
          cardNumber: (s) => s.string(),
          cvv: (s) => s.string(),
        })
        .required(["type", "cardNumber", "cvv"]),

    // Bank transfer
    (s) =>
      s
        .object()
        .properties({
          type: (s) => s.const("bank_transfer"),
          accountNumber: (s) => s.string(),
          routingNumber: (s) => s.string(),
        })
        .required(["type", "accountNumber", "routingNumber"]),

    // PayPal
    (s) =>
      s
        .object()
        .properties({
          type: (s) => s.const("paypal"),
          email: (s) => s.string().format("email"),
        })
        .required(["type", "email"]),
  )
  .build();
```

### oneOf - Exclusive Schema Union

Exactly one schema must validate (XOR logic):

```typescript
// Must be EITHER a short string OR a long string, not both
const stringLengthSchema = new SchemaBuilder()
  .oneOf(
    (s) => s.string().maxLength(10), // Short string
    (s) => s.string().minLength(50), // Long string
  )
  .build();

// Valid: "hello" (short), "this is a very long string..." (long)
// Invalid: "medium length string" (matches neither or both)
```

**Practical Example - Discriminated Union:**

```typescript
const shapeSchema = new SchemaBuilder()
  .oneOf(
    // Circle
    (s) =>
      s
        .object()
        .properties({
          type: (s) => s.const("circle"),
          radius: (s) => s.number().minimum(0),
        })
        .required(["type", "radius"]),

    // Rectangle
    (s) =>
      s
        .object()
        .properties({
          type: (s) => s.const("rectangle"),
          width: (s) => s.number().minimum(0),
          height: (s) => s.number().minimum(0),
        })
        .required(["type", "width", "height"]),

    // Triangle
    (s) =>
      s
        .object()
        .properties({
          type: (s) => s.const("triangle"),
          base: (s) => s.number().minimum(0),
          height: (s) => s.number().minimum(0),
        })
        .required(["type", "base", "height"]),
  )
  .build();

// Valid: { type: "circle", radius: 5 }
// Invalid: { type: "circle", radius: 5, width: 10 } (matches multiple)
```

### not - Schema Negation

Schema must NOT validate:

```typescript
// Not a string
const notStringSchema = new SchemaBuilder().not((s) => s.string()).build();

// Valid: 123, true, {}, []
// Invalid: "hello"
```

**Practical Example - Exclusion Pattern:**

```typescript
// Accept any string EXCEPT email addresses
const nonEmailStringSchema = new SchemaBuilder()
  .string()
  .not((s) => s.string().format("email"))
  .build();

// Valid: "hello", "test123"
// Invalid: "user@example.com"
```

### Complex Composition

```typescript
const advancedSchema = new SchemaBuilder()
  .object()
  .properties({
    value: (s) => s.string(),
  })
  .allOf(
    // Must have 'value' property
    (s) => s.object().required(["value"]),
  )
  .anyOf(
    // Either has 'type' property
    (s) =>
      s
        .object()
        .properties({
          type: (s) => s.string(),
        })
        .required(["type"]),

    // Or has 'category' property
    (s) =>
      s
        .object()
        .properties({
          category: (s) => s.string(),
        })
        .required(["category"]),
  )
  .not(
    // But NOT both at the same time
    (s) => s.object().required(["type", "category"]),
  )
  .build();

// Valid: { value: "x", type: "a" }
// Valid: { value: "x", category: "b" }
// Invalid: { value: "x", type: "a", category: "b" } (has both)
```

---

## Conditionals

### if/then/else - Basic Conditional Logic

```typescript
// If type is 'user', then require 'username'
const schema = new SchemaBuilder()
  .object()
  .properties({
    type: (s) => s.string(),
    username: (s) => s.string(),
    apiKey: (s) => s.string(),
  })
  .if((s) =>
    s.object().properties({
      type: (s) => s.const("user"),
    }),
  )
  .then((s) => s.object().required(["username"]))
  .else((s) => s.object().required(["apiKey"]))
  .build();

// If type="user": must have username
// Otherwise: must have apiKey
```

### elseIf - Multiple Conditions

The `elseIf` extension allows clean chaining without deep nesting:

```typescript
const accountSchema = new SchemaBuilder()
  .object()
  .properties({
    accountType: (s) => s.string(),
    username: (s) => s.string(),
    email: (s) => s.string(),
    companyName: (s) => s.string(),
    taxId: (s) => s.string(),
  })
  .required(["accountType"])
  .if((s) =>
    s.object().properties({
      accountType: (s) => s.const("personal"),
    }),
  )
  .then((s) => s.object().required(["username", "email"]))
  .elseIf((s) =>
    s.object().properties({
      accountType: (s) => s.const("business"),
    }),
  )
  .then((s) => s.object().required(["companyName", "taxId", "email"]))
  .elseIf((s) =>
    s.object().properties({
      accountType: (s) => s.const("enterprise"),
    }),
  )
  .then((s) => s.object().required(["companyName", "taxId"]))
  .else((s) => s.object().required(["email"]))
  .build();

// Generates {if: schema, then:schema, elseIf[{if: schema, then:schema}, {if: schema, then:schema}], else: schema}

// That structure is perfectly handled by jet-Validator during compilation.
```

**Without elseIf (standard JSON Schema):**

```typescript
// Standard approach - deeply nested
.if(...)
  .then(...)
  .else(s => s
    .if(...)
      .then(...)
      .else(s => s
        .if(...)
          .then(...)
        .else(...)
      )
  )
// 😵 Nested hell!
```

### Nested Conditionals

```typescript
const advancedRulesSchema = new SchemaBuilder()
  .object()
  .properties({
    country: (s) => s.string(),
    state: (s) => s.string(),
    zipCode: (s) => s.string(),
    postalCode: (s) => s.string(),
  })
  .if((s) =>
    s.object().properties({
      country: (s) => s.const("US"),
    }),
  )
  .then(
    (s) =>
      s
        .object()
        .required(["state", "zipCode"])
        .if((s) =>
          s.object().properties({
            state: (s) => s.const("California"),
          }),
        )
        .then((s) =>
          s.object().properties({
            zipCode: (s) => s.string().pattern("^9[0-6]\\d{3}$"),
          }),
        )
        .end(), // Only call .end if you don't need else.
  )
  .elseIf((s) =>
    s.object().properties({
      country: (s) => s.const("UK"),
    }),
  )
  .then((s) => s.object().required(["postalCode"]))
  .end()
  .build();
```

### Conditional with $data

Use runtime data for conditional logic:

```typescript
const passwordConfirmSchema = new SchemaBuilder()
  .object()
  .properties({
    password: (s) => s.string().minLength(8),
    confirmPassword: (s) => s.string(),
  })
  .if((s) =>
    s.object().properties({
      password: (s) => s.string().minLength(1), // password exists
    }),
  )
  .then((s) =>
    s.object().properties({
      confirmPassword: (s) => s.const({ $data: "1/password" }),
    }),
  )
  .build();

// confirmPassword must match password if password is provided
```

## **Check Jet-Validator documentation for keywords that support $data**

## References

### $ref - Schema References

#### Local References

```typescript
const schema = new SchemaBuilder()
  .$defs({
    address: (s) =>
      s.object().properties({
        street: (s) => s.string(),
        city: (s) => s.string(),
        zipCode: (s) => s.string(),
      }),
  })
  .object()
  .properties({
    billingAddress: (s) => s.$ref("#/$defs/address"),
    shippingAddress: (s) => s.$ref("#/$defs/address"),
  })
  .build();
```

#### External References

```typescript
// Reference external schema by URL
const userSchema = new SchemaBuilder()
  .object()
  .properties({
    profile: (s) => s.$ref("https://example.com/schemas/profile.json"),
  })
  .build();

// Reference with fragment
const schema = new SchemaBuilder()
  .object()
  .properties({
    user: (s) => s.$ref("https://example.com/schemas/common.json#/$defs/user"),
  })
  .build();
```

#### RefBuilder - Type-Safe References

The `RefBuilder` provides a fluent API for constructing JSON Pointer references:

```typescript
import { RefBuilder } from "@jetio/schema-builder";

// Basic usage
const ref1 = new RefBuilder().$defs("user").properties("address").build();
// Result: "#/$defs/user/properties/address"

// Using in schema
const schema = new SchemaBuilder()
  .object()
  .properties({
    mainUser: (s) => s.$ref((r) => r.$defs("user")),
    altUser: (s) => s.$ref((r) => r.$defs("user").properties("email")),
  })
  .build();
```

**RefBuilder API:**

```typescript
// Definitions
.$defs("schemaName")           // #/$defs/schemaName
.definitions("schemaName")     // #/definitions/schemaName

// Properties
.properties("propName")        // /properties/propName
.patternProperties("pattern")  // /patternProperties/pattern
.additionalProperties()        // /additionalProperties
.propertyNames()              // /propertyNames

// Arrays
.items()                      // /items
.items(0)                     // /items/0
.prefixItems(0)               // /prefixItems/0
.contains()                   // /contains
.additionalItems()            // /additionalItems

// Composition
.allOf(0)                     // /allOf/0
.anyOf(1)                     // /anyOf/1
.oneOf(2)                     // /oneOf/2
.not()                        // /not

// Conditionals
.if()                         // /if
.then()                       // /then
.else()                       // /else
.elseIf(0)                    // /elseIf/0

// Dependencies
.dependentSchemas("prop")     // /dependentSchemas/prop

// Anchors
.anchor("anchorName")         // #anchorName
.dynamicAnchor("name")        // #name

// Base URL
.base("https://example.com/schema") // Change base URL

// Custom segments
.segment("customPath")        // /customPath

// Utilities
.reset()                      // Clear path back to base
.chain()                      // Return self (for external composition)
.extend()                     // Clone for branching

// Building
.build()                      // Returns the complete reference string
.toString()                   // Alias for build()
```

**Complex RefBuilder Example:**

```typescript
const complexSchema = new SchemaBuilder()
  .$defs({
    person: (s) =>
      s.object().properties({
        name: (s) => s.string(),
        contacts: (s) =>
          s.array().items((s) =>
            s.object().properties({
              type: (s) => s.string(),
              value: (s) => s.string(),
            }),
          ),
      }),
  })
  .object()
  .properties({
    // Reference nested property
    primaryContact: (s) =>
      s.$ref((r) => r.$defs("person").properties("contacts").items(0)),

    // Reference with external base
    externalRef: (s) =>
      s.$ref((r) =>
        r
          .base("https://example.com/schema")
          .$defs("common")
          .properties("metadata"),
      ),
  })
  .build();
```

**RefBuilder with Anchors:**

```typescript
// Using anchors
const schema = new SchemaBuilder()
  .$id("https://example.com/schema")
  .$defs({
    user: (s) =>
      s
        .object()
        .$anchor("userSchema")
        .properties({
          name: (s) => s.string(),
        }),
  })
  .object()
  .properties({
    // Reference by anchor
    admin: (s) => s.$ref((r) => r.anchor("userSchema")),

    // Or by path
    moderator: (s) => s.$ref((r) => r.$defs("user")),
  })
  .build();
```

**RefBuilder Extension:**

```typescript
// Reuse partial refs
const baseRef = new RefBuilder()
  .base("https://api.example.com/schemas")
  .$defs("common");

// Extend for different endpoints
const userRef = baseRef.extend().properties("user").build();
// "https://api.example.com/schemas#/$defs/common/properties/user"

const productRef = baseRef.extend().properties("product").build();
// "https://api.example.com/schemas#/$defs/common/properties/product"
```

### $dynamicRef - Dynamic References

```typescript
const schema = new SchemaBuilder()
  .$dynamicAnchor("meta")
  .object()
  .properties({
    // Dynamic reference resolves at validation time
    nested: (s) => s.$dynamicRef((r) => r.anchor("meta")),
  })
  .build();
```

### Anchors

Define anchors for internal references:

```typescript
const schema = new SchemaBuilder()
  .$id("https://example.com/schema")
  .$defs({
    user: (s) =>
      s
        .object()
        .$anchor("simpleUser") // Reference as #simpleUser
        .$dynamicAnchor("recursiveUser") // Dynamic reference
        .properties({
          name: (s) => s.string(),
        }),
  })
  .object()
  .properties({
    user: (s) => s.$ref("#simpleUser"),
  })
  .build();
```

---

## Definitions

### $defs - Schema Definitions

Define reusable schema components:

```typescript
const schema = new SchemaBuilder()
  .$defs({
    // Define multiple schemas
    emailString: (s) => s.string().format("email"),

    phoneString: (s) => s.string().pattern("^\\+?[1-9]\\d{1,14}$"),

    address: (s) =>
      s
        .object()
        .properties({
          street: (s) => s.string(),
          city: (s) => s.string(),
          zipCode: (s) => s.string(),
        })
        .required(["street", "city"]),

    person: (s) =>
      s.object().properties({
        name: (s) => s.string(),
        email: (s) => s.$ref("#/$defs/emailString"),
        phone: (s) => s.$ref("#/$defs/phoneString"),
        address: (s) => s.$ref("#/$defs/address"),
      }),
  })
  .object()
  .properties({
    customer: (s) => s.$ref("#/$defs/person"),
    billing: (s) => s.$ref("#/$defs/address"),
  })
  .build();
```

### definitions (Legacy)

For JSON Schema Draft 6/7 compatibility:

```typescript
const draft7Schema = new SchemaBuilder()
  .definitions({
    user: (s) =>
      s.object().properties({
        id: (s) => s.integer(),
        name: (s) => s.string(),
      }),
  })
  .object()
  .properties({
    author: (s) => s.$ref("#/definitions/user"),
  })
  .build();
```

---

## Custom Error Messages

Add custom error messages to your schemas for better validation feedback:

### String Form (All Errors)

Override all validation errors with a single message:

```typescript
const schema = new SchemaBuilder()
  .string()
  .minLength(5)
  .maxLength(20)
  .pattern("^[a-z]+$")
  .errorMessage("Username must be 5-20 lowercase letters")
  .build();

// ANY validation failure returns: "Username must be 5-20 lowercase letters"
```

### Object Form (Per-Keyword)

Customize error messages for specific validation keywords:

```typescript
const schema = new SchemaBuilder()
  .string()
  .minLength(5)
  .maxLength(20)
  .pattern("^[a-z]+$")
  .errorMessage({
    type: "Must be text",
    minLength: "Too short - need at least 5 characters",
    maxLength: "Too long - maximum 20 characters",
    pattern: "Only lowercase letters allowed",
  })
  .build();
```

### Property-Level Error Messages

```typescript
const schema = new SchemaBuilder()
  .object()
  .properties({
    email: (s) => s.string().format("email"),
    age: (s) => s.integer().minimum(18),
  })
  .errorMessage({
    properties: {
      email: "Please enter a valid email address",
      age: "You must be at least 18 years old",
    },
  })
  .build();
```

### Per-Keyword Property Errors

```typescript
const schema = new SchemaBuilder()
  .object()
  .properties({
    email: (s) => s.string().format("email").minLength(5),
    password: (s) => s.string().minLength(8).pattern("^(?=.*[A-Z])"),
  })
  .errorMessage({
    properties: {
      email: {
        format: "Invalid email format",
        minLength: "Email too short",
      },
      password: {
        minLength: "Password must be at least 8 characters",
        pattern: "Password must contain an uppercase letter",
      },
    },
  })
  .build();
```

### Nested Schema Error Messages

```typescript
const schema = new SchemaBuilder()
  .object()
  .properties({
    user: (s) =>
      s
        .object()
        .properties({
          name: (s) => s.string().minLength(2),
          email: (s) => s.string().format("email"),
        })
        .errorMessage({
          properties: {
            name: "Name must be at least 2 characters",
            email: "Invalid email",
          },
        }),
  })
  .build();
```

### The `_jetError` Fallback

Use `_jetError` as a catch-all for keywords without explicit messages:

```typescript
const schema = new SchemaBuilder()
  .object()
  .properties({
    user: (s) =>
      s.object().properties({
        name: (s) => s.string(),
        email: (s) => s.string(),
      }),
  })
  .errorMessage({
    properties: {
      user: {
        _jetError: "User validation failed", // Fallback
        properties: {
          name: "Invalid name",
          email: "Invalid email",
        },
      },
    },
  })
  .build();
```

## **Read the jet-Validator docuemntation to properly understand how error messages work.**[Error Handling](https://github.com/official-jetio/validator/blob/main/DOCUMENTATION.md#error-handling)

## Advanced Features

### Schema Metadata

```typescript
const schema = new SchemaBuilder()
  .$id("https://example.com/schemas/user.json")
  .$schema("https://json-schema.org/draft/2020-12/schema")
  .title("User Schema")
  .description("Represents a user in the system")
  .object()
  .properties({
    id: (s) => s.integer(),
  })
  .build();
```

### Custom Keywords

Add any custom keyword:

```typescript
const schema = new SchemaBuilder()
  .object()
  .properties({
    status: (s) => s.string(),
  })
  .option("x-custom-validator", "myValidator")
  .option("x-internal", true)
  .build();

// Result includes: "x-custom-validator": "myValidator"
```

### $data References

Enable runtime data references:

```typescript
const schema = new SchemaBuilder()
  .object()
  .properties({
    minValue: (s) => s.number(),
    maxValue: (s) => s.number(),
    currentValue: (s) =>
      s
        .number()
        .minimum({ $data: "1/minValue" })
        .maximum({ $data: "1/maxValue" }),
  })
  .build();

// currentValue validated against runtime min/max values
```

### Multiple Schema IDs

```typescript
const schema = new SchemaBuilder()
  .$id("https://example.com/base")
  .$defs({
    subSchema: (s) =>
      s
        .$id("sub-schema.json") // Relative ID
        .object()
        .properties({
          value: (s) => s.string(),
        }),
  })
  .build();

// Resolves to: https://example.com/sub-schema.json
```

---

## Schema Reuse & Extension

### extend() - Clone & Modify

```typescript
// Create base schema
const baseUser = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.integer(),
    name: (s) => s.string(),
    email: (s) => s.string().format("email"),
  })
  .required(["id", "name"]);

// Extend base schema
const adminUser = baseUser
  .extend() // Clone the schema
  .properties({
    role: (s) => s.string().const("admin"),
    permissions: (s) => s.array().items((s) => s.string()),
  })
  .required(["role", "permissions"])
  .build();

// baseUser is unchanged
// adminUser has: id, name, email, role, permissions
```

### Loading External Schemas

#### From URL

```typescript
const schema = await new SchemaBuilder()
  .url("https://example.com/schemas/user.json")
  .extend()
  .properties({
    extraField: (s) => s.string(),
  })
  .build();
```

#### From File

```typescript
const schema = await new SchemaBuilder()
  .file("./schemas/base.json")
  .extend()
  .properties({
    additionalProp: (s) => s.string(),
  })
  .build();
```

#### From JSON

```typescript
const existingSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
};

const extended = new SchemaBuilder()
  .json(existingSchema)
  .extend()
  .properties({
    age: (s) => s.number(),
  })
  .required(["name", "age"])
  .build();
```

**Note:** When loading an external schema with either file, url or json, ensure its done at the beginning of the schema builder as it replaces the entire schema object of that schema builder.
Ensure its done first before building on the schema.

### Composition with extend()

```typescript
const timestampMixin = new SchemaBuilder().object().properties({
  createdAt: (s) => s.string().format("date-time"),
  updatedAt: (s) => s.string().format("date-time"),
});

const auditMixin = new SchemaBuilder().object().properties({
  createdBy: (s) => s.string(),
  modifiedBy: (s) => s.string(),
});

const fullSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.integer(),
    data: (s) => s.string(),
  })
  .allOf(
    (s) => s.extend(timestampMixin),
    (s) => s.extend(auditMixin),
  )
  .build();

// Result has: id, data, createdAt, updatedAt, createdBy, modifiedBy
```

---

## Mixed Approaches

You can freely mix JSON objects with builder syntax:

### JSON in Properties

```typescript
const schema = new SchemaBuilder()
  .object()
  .properties({
    // Plain JSON
    simpleField: { type: "string", minLength: 5 },

    // Builder syntax
    complexField: (s) =>
      s.object().properties({
        nested: (s) => s.number(),
      }),

    // Mix in same schema
    mixed: {
      type: "object",
      properties: {
        plain: { type: "string" },
      },
    },
  })
  .build();
```

### JSON in Definitions

```typescript
const schema = new SchemaBuilder()
  .$defs({
    // Plain JSON
    simpleType: { type: "string", format: "email" },

    // Builder
    complexType: (s) =>
      s.object().properties({
        value: (s) => s.number(),
      }),

    // Nested mix
    mixedType: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  })
  .build();
```

### JSON in Composition

```typescript
const schema = new SchemaBuilder()
  .anyOf(
    // Plain JSON
    { type: "string", minLength: 5 },

    // Builder
    (s) => s.number().minimum(0),

    // Boolean
    true,

    // Mixed
    {
      type: "object",
      properties: {
        special: { type: "boolean" },
      },
    },
  )
  .build();
```

### When to Use Each

**Use Builder When:**

- Building schemas programmatically
- Need autocomplete/type safety
- Complex nested structures
- Reusing schema components
- Dynamic schema generation

**Use JSON When:**

- Simple, one-off schemas
- Copying from existing JSON Schema
- Performance-critical (minimal overhead)
- Interfacing with external systems

**Mix When:**

- Migrating existing schemas
- Some parts are static, others dynamic
- Balancing readability and flexibility

---

## Complete Examples

### E-Commerce Product Schema

```typescript
const productSchema = new SchemaBuilder()
  .$id("https://example.com/schemas/product.json")
  .$defs({
    price: (s) =>
      s
        .object()
        .properties({
          amount: (s) => s.number().minimum(0),
          currency: (s) => s.string().pattern("^[A-Z]{3}$"),
        })
        .required(["amount", "currency"]),

    dimensions: (s) =>
      s
        .object()
        .properties({
          length: (s) => s.number().minimum(0),
          width: (s) => s.number().minimum(0),
          height: (s) => s.number().minimum(0),
          unit: (s) => s.string().enum(["cm", "in", "m"]),
        })
        .required(["length", "width", "height", "unit"]),
  })
  .object()
  .properties({
    id: (s) => s.string().pattern("^PROD-\\d{6}$"),
    name: (s) => s.string().minLength(3).maxLength(100),
    description: (s) => s.string().maxLength(1000),
    category: (s) =>
      s.string().enum(["electronics", "clothing", "food", "books"]),
    price: (s) => s.$ref("#/$defs/price"),
    stock: (s) => s.integer().minimum(0),
    dimensions: (s) => s.$ref("#/$defs/dimensions"),
    tags: (s) =>
      s
        .array()
        .items((s) => s.string())
        .minItems(1)
        .maxItems(10)
        .uniqueItems(true),
    availability: (s) =>
      s.string().enum(["in_stock", "out_of_stock", "preorder"]),
  })
  .required(["id", "name", "category", "price", "stock", "availability"])
  .if((s) =>
    s.object().properties({
      category: (s) => s.const("electronics"),
    }),
  )
  .then((s) =>
    s
      .object()
      .properties({
        warranty: (s) =>
          s
            .object()
            .properties({
              months: (s) => s.integer().minimum(0),
              type: (s) => s.string().enum(["limited", "full"]),
            })
            .required(["months", "type"]),
      })
      .required(["warranty"]),
  )
  .elseIf((s) =>
    s.object().properties({
      category: (s) => s.const("clothing"),
    }),
  )
  .then((s) =>
    s
      .object()
      .properties({
        sizes: (s) =>
          s
            .array()
            .items((s) => s.string().enum(["XS", "S", "M", "L", "XL", "XXL"]))
            .minItems(1),
        colors: (s) =>
          s
            .array()
            .items((s) => s.string())
            .minItems(1),
      })
      .required(["sizes", "colors"]),
  )
  .build();
```

### API Configuration Schema

```typescript
const apiConfigSchema = new SchemaBuilder()
  .$defs({
    endpoint: (s) =>
      s
        .object()
        .properties({
          url: (s) => s.string().format("uri"),
          method: (s) =>
            s.string().enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
          timeout: (s) => s.integer().minimum(100).maximum(30000),
          retries: (s) => s.integer().minimum(0).maximum(5),
        })
        .required(["url", "method"]),

    auth: (s) =>
      s
        .object()
        .properties({
          type: (s) => s.string(),
        })
        .if((s) => s.object().properties({ type: (s) => s.const("bearer") }))
        .then((s) =>
          s
            .object()
            .properties({
              token: (s) => s.string(),
            })
            .required(["token"]),
        )
        .elseIf((s) => s.object().properties({ type: (s) => s.const("basic") }))
        .then((s) =>
          s
            .object()
            .properties({
              username: (s) => s.string(),
              password: (s) => s.string(),
            })
            .required(["username", "password"]),
        )
        .elseIf((s) =>
          s.object().properties({ type: (s) => s.const("apikey") }),
        )
        .then((s) =>
          s
            .object()
            .properties({
              key: (s) => s.string(),
              header: (s) => s.string().default("X-API-Key"),
            })
            .required(["key"]),
        )
        .end()
        .required(["type"]),
  })
  .object()
  .properties({
    service: (s) => s.string().minLength(1),
    baseUrl: (s) => s.string().format("uri"),
    auth: (s) => s.$ref("#/$defs/auth"),
    endpoints: (s) =>
      s
        .object()
        .patternProperties({
          "^[a-zA-Z][a-zA-Z0-9_]*$": (s) => s.$ref("#/$defs/endpoint"),
        })
        .minProperties(1),
    logging: (s) =>
      s.object().properties({
        enabled: (s) => s.boolean().default(true),
        level: (s) => s.string().enum(["debug", "info", "warn", "error"]),
      }),
  })
  .required(["service", "baseUrl", "auth", "endpoints"])
  .build();
```

### Form Validation Schema

```typescript
const formSchema = new SchemaBuilder()
  .object()
  .properties({
    username: (s) =>
      s
        .string()
        .minLength(3)
        .maxLength(20)
        .pattern("^[a-zA-Z0-9_]+$")
        .title("Username")
        .description("Alphanumeric characters and underscores only")
        .errorMessage({
          minLength: "Username must be at least 3 characters",
          maxLength: "Username cannot exceed 20 characters",
          pattern:
            "Username can only contain letters, numbers, and underscores",
        }),

    email: (s) =>
      s
        .string()
        .format("email")
        .title("Email Address")
        .errorMessage("Please enter a valid email address"),

    password: (s) =>
      s
        .string()
        .minLength(8)
        .pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)")
        .title("Password")
        .description("Must contain uppercase, lowercase, and number")
        .errorMessage({
          minLength: "Password must be at least 8 characters",
          pattern: "Password must contain uppercase, lowercase, and a number",
        }),

    confirmPassword: (s) =>
      s
        .string()
        .const({ $data: "1/password" })
        .title("Confirm Password")
        .errorMessage("Passwords do not match"),

    age: (s) =>
      s.integer().minimum(13).maximum(120).title("Age").errorMessage({
        minimum: "You must be at least 13 years old",
        maximum: "Please enter a valid age",
      }),

    country: (s) => s.string().enum(["US", "UK", "CA", "AU"]).title("Country"),

    agreedToTerms: (s) =>
      s
        .boolean()
        .const(true)
        .title("I agree to the terms and conditions")
        .errorMessage("You must agree to the terms and conditions"),
  })
  .required([
    "username",
    "email",
    "password",
    "confirmPassword",
    "age",
    "agreedToTerms",
  ])
  .if((s) =>
    s.object().properties({
      country: (s) => s.const("US"),
    }),
  )
  .then((s) =>
    s
      .object()
      .properties({
        state: (s) =>
          s
            .string()
            .pattern("^[A-Z]{2}$")
            .title("State")
            .errorMessage("Please enter a valid 2-letter state code"),
      })
      .required(["state"]),
  )
  .build();
```

---

## Best Practices

### 1. Use Callbacks for Nested Schemas

```typescript
// ✅ Good - clean and readable
.properties({
  user: s => s.object().properties({
    name: s => s.string()
  })
})

// ❌ Avoid - harder to read
.properties({
  user: new SchemaBuilder().object().properties(...)
})
```

### 2. Extract Complex Schemas

```typescript
// ✅ Good - reusable
const addressSchema = (s: SchemaBuilder) =>
  s.object().properties({
    street: (s) => s.string(),
    city: (s) => s.string(),
  });

const schema = new SchemaBuilder()
  .object()
  .properties({
    billing: addressSchema,
    shipping: addressSchema,
  })
  .build();
```

### 3. Use $defs for Reusable Components

```typescript
// ✅ Good - DRY principle
.$defs({
  email: s => s.string().format("email")
})
.properties({
  primary: s => s.$ref("#/$defs/email"),
  secondary: s => s.$ref("#/$defs/email")
})
```

### 4. Leverage RefBuilder for Complex References

```typescript
// ✅ Good - type-safe
.$ref(r => r.$defs("user").properties("address"))

// ❌ Avoid - error-prone
.$ref("#/$defs/user/properties/address")
```

### 5. Use extend() for Schema Composition

```typescript
// ✅ Good - composable
const base = new SchemaBuilder().object().properties({...});
const extended = base.extend().properties({...}).build();
```

### 6. Add Error Messages for User-Facing Validation

```typescript
// ✅ Good - helpful error messages
.string()
.minLength(8)
.errorMessage("Password must be at least 8 characters")

// ❌ Avoid - cryptic default errors for end users
.string()
.minLength(8)
```

---

## Tips & Tricks

### Chaining Multiple Types

```typescript
// Creates type: ["string", "number", "null"]
new SchemaBuilder()
  .string()
  .number()
  .null()
  .minLength(5) // Only applied when value is string
  .build();
```

### Building Incrementally

```typescript
let schema = new SchemaBuilder().object();

if (requireAuth) {
  schema = schema.properties({
    token: (s) => s.string(),
  });
}

if (requireAdmin) {
  schema = schema.properties({
    adminKey: (s) => s.string(),
  });
}

const final = schema.build();
```

---

## Common Patterns

### Discriminated Unions

```typescript
const eventSchema = new SchemaBuilder()
  .object()
  .properties({
    type: (s) => s.string(),
  })
  .required(["type"])
  .oneOf(
    (s) =>
      s.object().properties({
        type: (s) => s.const("click"),
        x: (s) => s.number(),
        y: (s) => s.number(),
      }),
    (s) =>
      s.object().properties({
        type: (s) => s.const("scroll"),
        scrollY: (s) => s.number(),
      }),
  )
  .build();
```

### Pagination

```typescript
const paginatedSchema = (itemSchema: (s: SchemaBuilder) => SchemaBuilder) =>
  new SchemaBuilder()
    .object()
    .properties({
      items: (s) => s.array().items(itemSchema),
      total: (s) => s.integer().minimum(0),
      page: (s) => s.integer().minimum(1),
      pageSize: (s) => s.integer().minimum(1).maximum(100),
    })
    .required(["items", "total", "page", "pageSize"])
    .build();
```

### Polymorphic IDs

```typescript
const idSchema = new SchemaBuilder()
  .anyOf(
    (s) => s.string().pattern("^[0-9a-f]{24}$"), // MongoDB ObjectId
    (s) => s.string().format("uuid"), // UUID
    (s) => s.integer().minimum(1), // Integer ID
  )
  .build();
```

---

## API Reference

### SchemaBuilder Methods

#### Type Methods

| Method       | Returns               | Description           |
| ------------ | --------------------- | --------------------- |
| `.string()`  | `StringSchemaBuilder` | Set type to string    |
| `.number()`  | `NumberSchemaBuilder` | Set type to number    |
| `.integer()` | `NumberSchemaBuilder` | Set type to integer   |
| `.boolean()` | `BooleanSchema`       | Set type to boolean   |
| `.null()`    | `NullSchema`          | Set type to null      |
| `.array()`   | `ArraySchemaBuilder`  | Set type to array     |
| `.object()`  | `ObjectSchemaBuilder` | Set type to object    |
| `.end()`     | `SchemaBuilder`       | Reset to base builder |

#### Metadata Methods

| Method                 | Description            |
| ---------------------- | ---------------------- |
| `.$id(id)`             | Set $id (Draft 6+)     |
| `.id(id)`              | Set id (Draft 4)       |
| `.$schema(uri)`        | Set $schema            |
| `.title(title)`        | Set title              |
| `.description(desc)`   | Set description        |
| `.default(value)`      | Set default value      |
| `.examples(...values)` | Set examples           |
| `.readOnly()`          | Set readOnly: true     |
| `.writeOnly()`         | Set writeOnly: true    |
| `.option(key, value)`  | Set any custom keyword |

#### Value Constraint Methods

| Method          | Description              |
| --------------- | ------------------------ |
| `.enum(values)` | Set allowed values       |
| `.const(value)` | Set single allowed value |

#### Composition Methods

| Method               | Description               |
| -------------------- | ------------------------- |
| `.not(schema)`       | Negate a schema           |
| `.anyOf(...schemas)` | Match at least one schema |
| `.allOf(...schemas)` | Match all schemas         |
| `.oneOf(...schemas)` | Match exactly one schema  |

#### Conditional Methods

| Method               | Returns            | Description                   |
| -------------------- | ------------------ | ----------------------------- |
| `.if(condition)`     | `ConditionBuilder` | Start conditional             |
| `.then(schema)`      | `ConditionBuilder` | Schema if condition passes    |
| `.elseIf(condition)` | `ConditionBuilder` | Additional condition          |
| `.else(schema)`      | Parent builder     | Schema if all conditions fail |
| `.end()`             | Parent builder     | End conditional block         |

#### Reference Methods

| Method                  | Description                     |
| ----------------------- | ------------------------------- |
| `.$ref(ref)`            | Set $ref (string or RefBuilder) |
| `.$dynamicRef(ref)`     | Set $dynamicRef                 |
| `.$anchor(name)`        | Set $anchor                     |
| `.$dynamicAnchor(name)` | Set $dynamicAnchor              |
| `.$defs(defs)`          | Set $defs (Draft 2019-09+)      |
| `.definitions(defs)`    | Set definitions (Draft 04-07)   |

#### Error Message Methods

| Method               | Description                                 |
| -------------------- | ------------------------------------------- |
| `.errorMessage(msg)` | Set custom error message (string or object) |

#### Utility Methods

| Method          | Description                    |
| --------------- | ------------------------------ |
| `.build()`      | Return the final schema object |
| `.extend()`     | Clone schema for modification  |
| `.json(schema)` | Load from JSON object/string   |
| `.url(url)`     | Load from URL (async)          |
| `.file(path)`   | Load from file (async)         |

---

### StringSchemaBuilder Methods

Inherits all SchemaBuilder methods, plus:

| Method            | Description                                     |
| ----------------- | ----------------------------------------------- |
| `.minLength(n)`   | Minimum string length                           |
| `.maxLength(n)`   | Maximum string length                           |
| `.pattern(regex)` | Regex pattern (string or RegExp)                |
| `.format(name)`   | Format validation (email, uri, date-time, etc.) |

---

### NumberSchemaBuilder Methods

Inherits all SchemaBuilder methods, plus:

| Method                 | Description                     |
| ---------------------- | ------------------------------- |
| `.minimum(n)`          | Minimum value (inclusive)       |
| `.maximum(n)`          | Maximum value (inclusive)       |
| `.exclusiveMinimum(n)` | Minimum value (exclusive)       |
| `.exclusiveMaximum(n)` | Maximum value (exclusive)       |
| `.multipleOf(n)`       | Must be multiple of n           |
| `.positive()`          | Shorthand for minimum(0)        |
| `.negative()`          | Shorthand for maximum(0)        |
| `.range(min, max)`     | Shorthand for minimum + maximum |

---

### ArraySchemaBuilder Methods

Inherits all SchemaBuilder methods, plus:

| Method                      | Description                                             |
| --------------------------- | ------------------------------------------------------- |
| `.items(schema)`            | Schema for all items (or array of schemas for Draft 07) |
| `.prefixItems(schemas[])`   | Tuple validation (Draft 2020-12)                        |
| `.additionalItems(schema)`  | Schema for items beyond tuple (Draft 07)                |
| `.unevaluatedItems(schema)` | Schema for unevaluated items (Draft 2019-09+)           |
| `.contains(schema)`         | Array must contain matching item                        |
| `.minContains(n)`           | Minimum matching items                                  |
| `.maxContains(n)`           | Maximum matching items                                  |
| `.minItems(n)`              | Minimum array length                                    |
| `.maxItems(n)`              | Maximum array length                                    |
| `.uniqueItems(bool)`        | Require unique items                                    |

---

### ObjectSchemaBuilder Methods

Inherits all SchemaBuilder methods, plus:

| Method                           | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| `.properties(props)`             | Define property schemas                            |
| `.patternProperties(patterns)`   | Define pattern-matched property schemas            |
| `.additionalProperties(schema)`  | Schema for additional properties                   |
| `.unevaluatedProperties(schema)` | Schema for unevaluated properties (Draft 2019-09+) |
| `.propertyNames(schema)`         | Schema for property names                          |
| `.required(fields[])`            | Required property names                            |
| `.minProperties(n)`              | Minimum property count                             |
| `.maxProperties(n)`              | Maximum property count                             |
| `.dependentRequired(deps)`       | Conditional required fields                        |
| `.dependentSchemas(deps)`        | Conditional schemas (Draft 2019-09+)               |
| `.dependencies(deps)`            | Combined dependencies (Draft 07)                   |
| `.remove(fields[], targets[])`   | Remove properties from schema                      |
| `.optional()`                    | Remove all required constraints                    |

---

### RefBuilder Methods

| Method                        | Description                            |
| ----------------------------- | -------------------------------------- |
| `.base(url)`                  | Set base URL                           |
| `.$defs(name)`                | Add /$defs/name                        |
| `.definitions(name)`          | Add /definitions/name                  |
| `.properties(name)`           | Add /properties/name                   |
| `.patternProperties(pattern)` | Add /patternProperties/pattern         |
| `.additionalProperties()`     | Add /additionalProperties              |
| `.unevaluatedProperties()`    | Add /unevaluatedProperties             |
| `.propertyNames()`            | Add /propertyNames                     |
| `.dependentSchemas(prop)`     | Add /dependentSchemas/prop             |
| `.dependencies(prop)`         | Add /dependencies/prop                 |
| `.items(index?)`              | Add /items or /items/index             |
| `.prefixItems(index)`         | Add /prefixItems/index                 |
| `.additionalItems()`          | Add /additionalItems                   |
| `.unevaluatedItems()`         | Add /unevaluatedItems                  |
| `.contains()`                 | Add /contains                          |
| `.allOf(index)`               | Add /allOf/index                       |
| `.anyOf(index)`               | Add /anyOf/index                       |
| `.oneOf(index)`               | Add /oneOf/index                       |
| `.not()`                      | Add /not                               |
| `.if()`                       | Add /if                                |
| `.then()`                     | Add /then                              |
| `.else()`                     | Add /else                              |
| `.elseIf(index)`              | Add /elseIf/index                      |
| `.anchor(name)`               | Set anchor reference                   |
| `.dynamicAnchor(name)`        | Set dynamic anchor reference           |
| `.segment(path)`              | Add custom path segment                |
| `.reset()`                    | Clear path back to base                |
| `.extend()`                   | Clone RefBuilder                       |
| `.chain()`                    | Return self (for external composition) |
| `.build()`                    | Return the reference string            |
| `.toString()`                 | Alias for build()                      |

---

### ConditionBuilder Methods

| Method               | Returns            | Description                   |
| -------------------- | ------------------ | ----------------------------- |
| `.then(schema)`      | `ConditionBuilder` | Schema if condition passes    |
| `.elseIf(condition)` | `ConditionBuilder` | Add another condition         |
| `.else(schema)`      | Parent builder     | Schema if all conditions fail |
| `.end()`             | Parent builder     | End conditional without else  |

## Next Steps

- Explore the [Validator Documentation](https://github.com/official-jetio/validator/blob/main/DOCUMENTATION.md)
- See [Error Messages Guide](https://github.com/official-jetio/validator/blob/main/DOCUMENTATION.md#error-handling)
- Check out [Advanced Patterns](./ADVANCED.md)
- Learn about [$data References](https://github.com/official-jetio/validator/blob/main/DOCUMENTATION.md#data)
