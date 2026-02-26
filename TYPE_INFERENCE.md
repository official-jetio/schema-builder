# Table of Contents

## Getting Started
- [📦 Quick Start](#-quick-start)
- [Spec-Compliant Type Inference](#spec-compliant-type-inference)
  - [oneOf](#oneof)
  - [anyOf](#anyof)
  - [if / then / elseIf / else](#if--then--elseif--else)
  - [additionalProperties / unevaluatedProperties](#additionalproperties--unevaluatedproperties)
  - [patternProperties](#patternproperties)
  - [allOf](#allof)

## Core Concepts
- [🎨 Design Philosophy](#-design-philosophy)
  - [JSON Schema Specification Compliance](#json-schema-specification-compliance)
- [Core Concepts](#-core-concepts)
  - [Before vs After](#before-vs-after)

## Supported Features
- [Supported Features](#-supported-features)

### Primitives
- [✅ Primitives](#-primitives)
  - [String](#string)
  - [Number](#number)
  - [Integer](#integer)
  - [Boolean](#boolean)
  - [Null](#null)

### Type System
- [✅ Multiple Types](#-multiple-types)

### Data Structures
- [✅ Objects](#-objects)
  - [Basic Object Properties](#basic-object-properties)
  - [Required Properties](#required-properties)
  - [Nested Objects](#nested-objects)
  - [Empty Objects](#empty-objects)
  - [Pattern Properties](#pattern-properties)
    - [Basic Pattern Properties](#basic-pattern-properties)
    - [Supported Pattern Types](#supported-pattern-types)
  - [Additional Properties](#additional-properties)
  - [Unevaluated Properties](#unevaluated-properties)
  - [Cheat Sheet](#cheat-sheet)

- [✅ Arrays](#-arrays)
  - [Homogeneous Arrays (items)](#homogeneous-arrays-items)
  - [Array of Objects](#array-of-objects)
  - [Array of Arrays (Nested)](#array-of-arrays-nested)
  - [Tuples with prefixItems](#tuples-with-prefixitems)
  - [Tuples with Rest Elements](#tuples-with-rest-elements)
  - [Tuples with items](#tuples-with-items)
  - [Array Constraints](#array-constraints)

### Constraints & Validation
- [✅ Enums & Const](#-enums--const)
  - [Enum (Union of Literals)](#enum-union-of-literals)
  - [Const (Single Literal Value)](#const-single-literal-value)

### Composition
- [✅ Unions (oneOf / anyOf)](#-unions-oneof--anyof)
  - [oneOf - Exclusive Union (Discriminated Unions)](#oneof---exclusive-union-discriminated-unions)
  - [anyOf - Union (At Least One Match)](#anyof---union-at-least-one-match)

- [✅ Intersections (allOf)](#-intersections-allof)

- [✅ Conditionals (if/then/else/elseIf)](#-conditionals-ifthenelseelseif)
  - [Basic if/then/else](#basic-ifthenelse)
  - [if/elseIf/else Chains](#ifelseifelse-chains)

### Advanced Features
- [✅ Combining Multiple Keywords](#-combining-multiple-keywords)
  - [How It Works](#how-it-works)
  - [Multiple Types with Chaining](#multiple-types-with-chaining)
  - [Layering Combinators](#layering-combinators)
  - [Properties + Pattern Properties](#properties--pattern-properties)
  - [Object + Array Types Together](#object--array-types-together)
  - [Why This Matters](#why-this-matters)

- [✅ Boolean Schemas](#-boolean-schemas)

- [✅ Schema Extension & Reusability](#-schema-extension--reusability)
  - [Basic Extension](#basic-extension)
  - [How Extension Works](#how-extension-works)
  - [Multiple Extensions](#multiple-extensions)
  - [Why Extension > $ref](#why-extension--ref)
  - [Common Patterns](#common-patterns)
  - [Understanding Merge vs Replace Behavior](#understanding-merge-vs-replace-behavior)
  - [remove and optional](#remove-and-optional)
    - [remove](#remove)
    - [optional](#optional)
  - [Practical Examples](#practical-examples)

## Examples & Best Practices
- [Advanced Examples](#-advanced-examples)
  - [E-Commerce Product Catalog](#e-commerce-product-catalog)

- [Best Practices](#-best-practices)
  - [1. No Need for `as const`](#1-no-need-for-as-const)
  - [2. Combine Runtime Validation with Type Checking](#2-combine-runtime-validation-with-type-checking)
  - [3. Leverage Multiple Keyword Evaluation](#3-leverage-multiple-keyword-evaluation)

## Community & Resources
- [Jet.Infer](#the-vision-behind-jetinfer)
- [Feedback & Contributions](#-feedback--contributions)
- [License](#-license)

# 🎯 Spec Compliant Type Inference

Get automatic Json Schema Compliant TypeScript types from your schemas with `Jet.Infer<>` - a single source of truth for both validation and types.

---

## 📦 Quick Start

```typescript
import { SchemaBuilder, Jet, JetValidator } from "@jetio/schema-builder";

const userSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number(),
    name: (s) => s.string(),
    email: (s) => s.string().format('email')
  })
  .required(['id', 'name', 'email'])
  .build();

// Automatically infer TypeScript type
type User = Jet.Infer<typeof userSchema>;
// Result: { id: number; name: string; email: string }

// Use with validator
const validator = new JetValidator();
const validate = validator.compile(userSchema);

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

if (validate(user)) {
  console.log("Valid!", user.name); // TypeScript knows user.name exists
}
```

---

## Spec-Compliant Type Inference

Most schema builders generate types that *look* like your code. `@jetio/schema-builder` generates types that *behave* like the JSON Schema spec. Your TypeScript types are a 1:1 reflection of your runtime validation. If the validator rejects it, TypeScript rejects it too.

---

### `oneOf`

In JSON Schema, `oneOf` means exactly one sub-schema can match. If the branches don't naturally have a discriminator field, `@jetio/schema-builder` iterates over the union and marks keys that exist in other branches as `never` in the current one. This ensures true discrimination where only one branch can exist at a time, even without a manual tag field.

### `oneOf` Exclusivity (Automatic Discrimination)

In JSON Schema, `oneOf` means exactly one sub-schema can match. Most libraries just give you a simple union `A | B`, which lets you mix properties from both. 

`@jetio/schema-builder` is different. It enforces **Strict Exclusivity**. It automatically finds all unique keys across the branches and marks them as `never` in the other branches. This gives you a true discriminated union without needing a "type" or "kind" tag.

```typescript
const schema = new SchemaBuilder()
  .oneOf([
    s => s.object().properties({ card: s.string() }).required(['card']),
    s => s.object().properties({ paypal: s.string() }).required(['paypal'])
  ])
  .build();

type Payment = Jet.Infer<typeof schema>;

// ✅ Valid
const p1: Payment = { card: "1234..." };

// ❌ Error: Cannot have both! 
// TypeScript knows that if 'card' exists, 'paypal' must be undefined.
const p2: Payment = { 
  card: "1234...", 
  paypal: "test@me.com" 
};
```

### `anyOf`

`anyOf` allows one, some, or all schemas to match at the same time. `@jetio/schema-builder` infers this as a distributive union where properties from multiple branches can coexist. A discriminated union can still happen if the schemas in the `anyOf` share a discriminator field.

### `if / then / elseIf / else`

`@jetio/schema-builder` narrows the type based on the merge result of the base properties, `if`, and `then`. Base is included because top-level `properties` are shared across all branches. It takes that merge result and forces an exclusive or with the result of base and `else`, ensuring only one branch can exist at a time. This behavior extends to `elseIf` as well, creating a perfect chain of conditionals.

### `additionalProperties` / `unevaluatedProperties`

Both `additionalProperties` and `unevaluatedProperties` enforce a type constraint on the object's keys. The catch is additionalProperties follow the spec's "Local Scope" rule, meaning it only see `properties` defined at *that* level, while unevalutedProperies is dynamic.

By default Jetter only checks base level properties before deciding on the implementation of unevaluatedProperties and additionalProperties, meaning all properties in immediate subschemas are ignored and that is by design to avoid recursion, so you need to let Jetter know there are properties in immediate subschemas.

If you have a `properties` keyword in any sub-schema (like in `allOf` or `oneOf`, conditionals etc.), you need to define an empty `.properties({})` at the level where `additionalProperties` or `unevaluatedProperties` is declared. This tells Jetter to ignore the schema value of `unevaluatedProperties` and `additionalProperties` at that level instead of enforcing a `Record<string, never or fixed constraint>` where everything has to follow a fixed rule it instead just adds a `[x: string]: any` to the object not to add a constraint but to tell typescript, this object can accept additional properties, without it, the object will have a fixed shape rejecting any other property.


```typescript
const schema = new SchemaBuilder()
  .object()
  .additionalProperties(false)
  .allOf(
    (s) =>
      s.object().properties({
        currency: (s) => s.enum(["USD", "EUR", "GBP"]),
      })
  )
  .build();

// ❌ Without .properties({}) at the root, additionalProperties: false
//    doesn't know about "currency" from the allOf,
//    and the type will mark them as never.

const schema = new SchemaBuilder()
  .object()
  .properties({}) // Ensures additional properies and
  //  unevaluated properties are both ignored
  .additionalProperties(false)
  .allOf(
    (s) =>
      s.object().properties({
        currency: (s) => s.enum(["USD", "EUR", "GBP"]),
        timestamp: (s) => s.string(),
      })
  )
  .build();

// ✅ Now Jetter knows to skip additionalProperties value and just add a [x: string]: any
```
**In summary** 
1) Define an empty property method at parent level if subschemas have properties
2) If properties exist whether it is an empty property object or one with defined properties, additional/unevaluatedProperties only applie if the  schema value if an object or true, the sole purpose is to add `[x: string]: any` to the object, to allow more than the defined properties, while `additional/unevaluatedProperties: false` keeps the fixed shape of the object.
3) the actual constraints of additonalProperties are only applies if no properties are defined which means the constraint applies to all property of the object. e.g `Record<string, string | number>`

The `[x: any]: any` added to an object if additional/unevaluatedProperties are either true or an object, affects exclusivity because that object is now loose, type constraints are still enforced but the properties are no longer limited to what were defined.

**Example:**
```typescript
const responseSchema = new SchemaBuilder()
  .unevaluatedProperties(false)
  .properties({})
  .oneOf(
    (s) =>
      s
        .object()
        .properties({
          success: (s) => s.const(true),
          data: (s) => s.string(),
        })
        .required(["success", "data"]),

    (s) =>
      s
        .object()
        .properties({
          success: (s) => s.const(false),
          error: (s) => s.string(),
        })
        .required(["success", "error"]),
  )
  .build();
type Response = Jet.Infer<typeof responseSchema>;
// With additional/unevalautedProperties as false not defined in the schema you get a fixed shape
/**
type Response = {
    success: true;
    data: string;
    error?: undefined;
} | {
    success: false;
    error: string;
    data?: undefined;
}

That shape ensures you can either have one not both which is the expected behaviour of oneOf
**/
//But with unevaluated/additionalProperties defined as true or given schema you get:
/**
 * 
 type Response = {
    [x: string]: any;
    success: true;
    data: string;
} | {
    [x: string]: any;
    success: false;
    error: string;
}

Now the Exclusive constraint is broken which means this:
const t: Response = { success: true, data: "false", error: '' }
which shoud have shown an error is now allowed.

So be careful with the usage of additional/unevaluatedProperties

**/

```
This applies to `unevaluatedProperties` as well.

### `patternProperties`

Regex patterns get mapped directly to TypeScript template literals. `^user_` becomes `` `user_${string}` ``. Type-safe dynamic keys that follow a naming convention, no extra work needed, only supports common and simple patterns.

### `allOf`

Instead of giving you unreadable intersections like `TypeA & TypeB & TypeC`, `@jetio/schema-builder` recursively collapses everything into a single clean object. Your IDE tooltips stay readable and complex schemas won't hit TypeScript's recursion limit.


## 🎨 Design Philosophy

### JSON Schema Specification Compliance

`@jetio/schema-builder`'s type inference system is designed from the ground up to be **as close as possible to the JSON Schema specification**. This isn't just a schema builder,it's a **JSON Schema compliant validator** with TypeScript type inference built on top the end goal is compliance, to give users the benefit of amazing Dx without sacificing compliance or keywords.

**Why this matters:**

1. **True JSON Schema Support**: Unlike other libraries that have very limited Json Schema support, `@jetio/schema-builder` implements the actual JSON Schema spec, including advanced features like:
   - `if/then/else + (custom elseIf)` conditionals
   - `allOf`, `oneOf`, `anyOf` combinators
   - `patternProperties` with template literals
   - `additionalProperties` and `unevaluatedProperties`
   - `prefixItems`, `items`, `additionalItems` and `unevaluatedItems`
   - Full draft 06 - 2020-12 compliance

2. **Everything is Evaluated**: Following the JSON Schema specification, **all keywords in a schema are evaluated simultaneously**. This means when you add multiple constraints (`types`, `const`, `properties`, `allOf`, `oneOf`, `if/then` etc..), they all apply together exactly like in JSON Schema.

3. **Type System Mirrors Runtime**: The TypeScript types you get from `Jet.Infer<>` accurately represent what the validator will accept at runtime. No surprises, no drift between types and validation.

**This decision was deliberate**: We wanted `@jetio/schema-builder` to be the most accurate TypeScript representation of JSON Schema possible. Even when it's challenging (like supporting `elseIf` type inference), we push TypeScript's type system to its limits to give you types that match the spec.

```typescript
// Other libraries: Custom DSL with limited JSON Schema support

// `@jetio/schema-builder`: Actual JSON Schema specification
const schema = new SchemaBuilder()
  .object()
  .properties({ /* ... */ })
  .allOf(/* ... */)
  .oneOf(/* ... */)
  .if(/* ... */).then(/* ... */).elseIf(/* ... */).then(/* ... */)
  .build();

// And TypeScript understands ALL of it!
type T = Jet.Infer<typeof schema>;
```

---

## 🔑 Core Concepts


Type inference allows TypeScript to **automatically derive types** from your JSON Schema definitions. Instead of manually writing both a schema and a TypeScript interface, you write the schema once and let `Jet.Infer<>` generate the matching TypeScript type.

**Benefits:**
- ✅ **Single source of truth:** Schema and types never drift out of sync
- ✅ **Automatic updates:** Change the schema, types update automatically
- ✅ **Type safety:** Catch errors at compile time AND runtime
- ✅ **JSON Schema compliant:** Your types match the actual validation spec
- ✅ **Better DX:** Write less code, let TypeScript do the work

### Before vs After

**Before (Manual Duplication):**
```typescript
// Step 1: Define schema
const userSchema = new SchemaBuilder()
  .object()
  .properties({
    name: (s) => s.string(),
    age: (s) => s.number(),
    email: (s) => s.string().format('email')
  })
  .required(['name', 'email'])
  .build();

// Step 2: Manually define matching type (error-prone!)
interface User {
  name: string;
  age?: number;
  email: string;
}

// Problem: If schema changes, you must remember to update the interface
// If you forget, schema and type are out of sync!
```

**After (Type Inference):**
```typescript
// Define schema once
const userSchema = new SchemaBuilder()
  .object()
  .properties({
    name: (s) => s.string(),
    age: (s) => s.number(),
    email: (s) => s.string().format('email')
  })
  .required(['name', 'email'])
  .build();

// Type automatically inferred - always in sync!
type User = Jet.Infer<typeof userSchema>;
// Result: { name: string; email: string; age?: number }

// If you change the schema, the type updates automatically
// Add .required(['age']) → age becomes required
// Remove email property → TypeScript error if you try to use it
```

---

## 📋 Supported Features

### ✅ Primitives

All JSON Schema primitive types are fully supported with accurate type inference.

#### String

```typescript
// Basic string
const nameSchema = new SchemaBuilder()
  .string()
  .build();

type Name = Jet.Infer<typeof nameSchema>;
// Result: string

// String with constraints (constraints validated at runtime, not in types)
const emailSchema = new SchemaBuilder()
  .string()
  .format('email')
  .minLength(5)
  .maxLength(100)
  .build();

type Email = Jet.Infer<typeof emailSchema>;
// Result: string (Constraints are run time events)

// String with pattern
const zipCodeSchema = new SchemaBuilder()
  .string()
  .pattern('^[0-9]{5}$')
  .build();

type ZipCode = Jet.Infer<typeof zipCodeSchema>;
// Result: string
```

**Note:** String format validations (`.format()`, `.pattern()`, `.minLength()`, `.maxLength()`) are enforced at **runtime** by the validator, but TypeScript still infers the type as `string` since it doesn't support refinement types like "string matching email format".

#### Number

```typescript
// Basic number
const ageSchema = new SchemaBuilder()
  .number()
  .build();

type Age = Jet.Infer<typeof ageSchema>;
// Result: number

// Number with constraints
const scoreSchema = new SchemaBuilder()
  .number()
  .minimum(0)
  .maximum(100)
  .multipleOf(5)
  .build();

type Score = Jet.Infer<typeof scoreSchema>;
// Result: number (constraints enforced at runtime only)

// Exclusive minimum/maximum
const temperatureSchema = new SchemaBuilder()
  .number()
  .exclusiveMinimum(-273.15)  // Above absolute zero
  .exclusiveMaximum(1000)
  .build();

type Temperature = Jet.Infer<typeof temperatureSchema>;
// Result: number
```

#### Integer

```typescript
// Integer (infers as number in TypeScript)
const countSchema = new SchemaBuilder()
  .integer()
  .minimum(0)
  .build();

type Count = Jet.Infer<typeof countSchema>;
// Result: number

// Note: TypeScript doesn't have a separate 'integer' type
// Runtime validation ensures the value is an integer
```

#### Boolean

```typescript
const activeSchema = new SchemaBuilder()
  .boolean()
  .build();

type Active = Jet.Infer<typeof activeSchema>;
// Result: boolean
```

#### Null

```typescript
const emptySchema = new SchemaBuilder()
  .null()
  .build();

type Empty = Jet.Infer<typeof emptySchema>;
// Result: null

// Often combined with other types using method chaining
const nullableStringSchema = new SchemaBuilder()
  .string()
  .null()
  .build();

type NullableString = Jet.Infer<typeof nullableStringSchema>;
// Result: string | null
```

---

### ✅ Multiple Types

Following JSON Schema specification, you can define multiple types by **chaining type methods**. `@jetio/schema-builder` will infer a union of all specified types.

```typescript
// String OR Number
const flexibleIdSchema = new SchemaBuilder()
  .string()
  .number()
  .build();

type FlexibleId = Jet.Infer<typeof flexibleIdSchema>;
// Result: string | number

const id1: FlexibleId = "abc123"; // ✅
const id2: FlexibleId = 42; // ✅
const id3: FlexibleId = true; 
// ❌ TypeScript Error: Type 'boolean' is not assignable

// String OR Number OR Boolean
const multiTypeSchema = new SchemaBuilder()
  .string()
  .number()
  .boolean()
  .build();

type MultiType = Jet.Infer<typeof multiTypeSchema>;
// Result: string | number | boolean

// String OR Number OR Null
const nullableValueSchema = new SchemaBuilder()
  .string()
  .number()
  .null()
  .build();

type NullableValue = Jet.Infer<typeof nullableValueSchema>;
// Result: string | number | null

// Object OR Array (valid JSON Schema)
const containerSchema = new SchemaBuilder()
  .object() // The type you start with determines which keywords are accessible, until you branch to another type
  .properties({
    name: (s) => s.string()
  })
  .array()
  .items((s) => s.number())
  .build();  

type Container = Jet.Infer<typeof containerSchema>;
// Result: { name?: string } | number[]

const obj: Container = { name: "test" }; // ✅
const arr: Container = [1, 2, 3]; // ✅
```

**With Constraints:**

Constraints are applied to their matching types:

```typescript

const constrainedSchema = new SchemaBuilder()
  .string()
  .number()
  .minLength(5)  // this will fail
  .minimum(0)    // Only applies to numbers
  .maxLength(20) // this will fail
  .maximum(100)  // Only applies to numbers
  .build();

// Correct way
const constrainedSchema = new SchemaBuilder()
  .string()
  .minLength(5)  // Only applies to strings
  .maxLength(20) // Only applies to strings
  .number()
  .minimum(0)    // Only applies to numbers
  .maximum(100)  // Only applies to numbers
  .build();
// Type script only gives you access to the method allowed for the 
// closest types when building, branch out of the constraints by 
// declaring a new type. This only affects typed keyword, while 
// keywords like const enum and anyOf and the likes are unaffected.

type Constrained = Jet.Infer<typeof constrainedSchema>;
// Result: string | number (constraints validated at runtime)

// TypeScript allows both types
const str: Constrained = "hello"; // ✅ (runtime validates minLength: 5)
const num: Constrained = 50; // ✅ (runtime validates minimum: 0, maximum: 100)
```

---

### ✅ Objects

Object schemas provide comprehensive type inference with automatic handling of required vs optional properties, nested structures, additional property and pattern properties(limited) constraints.

#### Basic Object Properties

```typescript
const userSchema = new SchemaBuilder()
  .object()
  .properties({
    username: (s) => s.string(),
    email: (s) => s.string(),
    age: (s) => s.number()
  })
  .build();

type User = Jet.Infer<typeof userSchema>;
/*
{
  username?: string;
  email?: string;
  age?: number;
}
*/

// Without .required(), all properties are optional
const user1: User = {}; // ✅ Valid
const user2: User = { username: "alice" }; // ✅ Valid
const user3: User = { username: "bob", age: 30 }; // ✅ Valid
```

#### Required Properties

Use `.required([])` to specify which properties are mandatory.

```typescript
const personSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number(),
    firstName: (s) => s.string(),
    lastName: (s) => s.string(),
    email: (s) => s.string(),
    age: (s) => s.number(),
    phone: (s) => s.string(),
    bio: (s) => s.string()
  })
  .required(['id', 'firstName', 'lastName', 'email'])
  .build();

type Person = Jet.Infer<typeof personSchema>;
/*
{
  id: number;           // Required
  firstName: string;    // Required
  lastName: string;     // Required
  email: string;        // Required
  age?: number;         // Optional
  phone?: string;       // Optional
  bio?: string;         // Optional
}
*/

// TypeScript enforces required properties at compile time
const validPerson: Person = {
  id: 1,
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com"
  // age, phone, bio are optional
};

const invalidPerson: Person = {
  id: 1,
  firstName: "Bob"
  // ❌ TypeScript Error: Property 'lastName' is missing
  // ❌ TypeScript Error: Property 'email' is missing
};

// You can still provide optional properties
const fullPerson: Person = {
  id: 2,
  firstName: "Charlie",
  lastName: "Brown",
  email: "charlie@example.com",
  age: 35,
  phone: "+1-555-0123",
  bio: "Software developer"
};
```

**Important:** Properties listed in `.required([])` must exist in `.properties()`, otherwise they're ignored and if that property is merely required but needs no validation then simply do:

```typescript

const schema = new SchemaBuilder()
  .object()
  .properties({
    name: (s) => s.string(), 
    nonExistent: true// According to Json Schema, any value is accepted when true, 
    // the same applies here. while false defines type never meaning the 
    // property must not exist, this perfectly mirrors JSON schema.
  })
  .required(['name', 'nonExistent']) // 'nonExistent' is evaluated
  .build();

```
Otherwise:

```typescript
const schema = new SchemaBuilder()
  .object()
  .properties({
    name: (s) => s.string()
  })
  .required(['name', 'nonExistent']) // 'nonExistent' is ignored
  .build();

type Schema = Jet.Infer<typeof schema>;
/*
{
  name: string; // Only 'name' is required
}
*/
```

#### Nested Objects

Objects can be nested to any depth with full type inference at every level.

```typescript
const companySchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number(),
    name: (s) => s.string(),
    address: (s) => s.object()
      .properties({
        street: (s) => s.string(),
        city: (s) => s.string(),
        state: (s) => s.string(),
        zipCode: (s) => s.string(),
        country: (s) => s.string()
      })
      .required(['street', 'city', 'country']),
    contact: (s) => s.object()
      .properties({
        email: (s) => s.string(),
        phone: (s) => s.string(),
        website: (s) => s.string()
      })
      .required(['email']),
    metadata: (s) => s.object()
      .properties({
        founded: (s) => s.number(),
        employees: (s) => s.number(),
        revenue: (s) => s.number()
      })
  })
  .required(['id', 'name', 'address'])
  .build();

type Company = Jet.Infer<typeof companySchema>;
/*
{
  id: number;
  name: string;
  address: {
    street: string;
    city: string;
    country: string;
    state?: string;
    zipCode?: string;
  };
  contact?: {
    email: string;
    phone?: string;
    website?: string;
  };
  metadata?: {
    founded?: number;
    employees?: number;
    revenue?: number;
  };
}
*/

// TypeScript enforces nested structure and requirements
const company: Company = {
  id: 1,
  name: "Acme Corp",
  address: {
    street: "123 Main St",
    city: "Springfield",
    country: "USA"
    // state and zipCode are optional
  },
  contact: {
    email: "info@acme.com"
    // phone and website are optional
  }
  // metadata is completely optional
};
```
**Note:** It seems typescript has a recurion depth limit, keep that in mind.

#### Empty Objects

```typescript
// Object with no properties defined
const emptyObjectSchema = new SchemaBuilder()
  .object()
  .build();

type EmptyObject = Jet.Infer<typeof emptyObjectSchema>;
// Result: Record<string, any>

// Allows any properties
const obj: EmptyObject = { anything: "goes", here: 123 }; // ✅
```

### Pattern Properties

Pattern properties allow you to define schemas for object properties that match a specific pattern. TypeScript infers these using template literal types for common patterns.

#### Basic Pattern Properties

```typescript
const configSchema = new SchemaBuilder()
  .object()
  .properties({
    appName: (s) => s.string()
  })
  .patternProperties({
    "^env_": (s) => s.string(),      // Properties starting with "env_"
    "^feature_": (s) => s.boolean(), // Properties starting with "feature_"
    "_id$": (s) => s.number()        // Properties ending with "_id"
  })
  .required(['appName'])
  .build();

type Config = Jet.Infer<typeof configSchema>;
/*
{
  appName: string;
  [key: `env_${string}`]: string;
  [key: `feature_${string}`]: boolean;
  [key: `${string}_id`]: number;
}
*/

const config: Config = {
  appName: "MyApp",
  env_NODE_ENV: "production",        // ✅ Matches ^env_
  env_API_URL: "https://api.com",    // ✅ Matches ^env_
  feature_darkMode: true,            // ✅ Matches ^feature_
  feature_notifications: false,      // ✅ Matches ^feature_
  user_id: 123,                      // ✅ Matches _id$
  product_id: 456                    // ✅ Matches _id$
};
```

#### Supported Pattern Types

`@jetio/schema-builder` supports template literal conversion for these common patterns:

```typescript
// Prefix with separator
"^data_"       → `data_${string}`
"^api-"        → `api-${string}`
"^config."     → `config.${string}`

// Prefix without separator
"^user"        → `user${string}`

// Suffix with separator
"_id$"         → `${string}_id`
"-name$"       → `${string}-name`
".json$"       → `${string}.json`

// Suffix without separator
"Type$"        → `${string}Type`

// Infix (contains separator)
"_"            → `${string}_${string}`
"-"            → `${string}-${string}`
"."            → `${string}.${string}`

// Wildcards and complex patterns fall back to string
".*"           → string
"^[a-zA-Z].*"  → string
".*[0-9]$"     → string
```

**Limitations:** 
**1** - Complex regex like `^[a-z]{3,5}$` or `\d+` fall back to `string` for unsupported patterns.


### Additional Properties
 Additional properties support is very limited and this is due to typescript limitation.
 Additional properties full effect only applies when the properties keyword is not defined.
 
 ``` typescript

const configSchema = new SchemaBuilder()
  .object()
  .properties({
    appName: (s) => s.string(),
  })
  .additionalProperties(false) // additional defined value is ignored.
  // When properties are defined additional properties just adds a [x: string]: any
  // this behaviour is deliberate and that is due to typescript's limitations.
  .required(["appName"])
  .build();

type Config = Jet.Infer<typeof configSchema>;

const config: Config = {
  appName: "MyApp",
};  //✅ works

const config: Config = {
  appName: "MyApp",
  name: '' //Also works due to [x: string]: any
};  // typescript applies constraints by default since expected properties are defined.

 ```

**when additionalProperties are evaluated**
The additional properties is only evaluated if and only if properties are not defined otherwise a `[x: string]: any` will be added to tell typescript more properties are allowed.

 ``` typescript

const configSchema = new SchemaBuilder()
  .object()
  .additionalProperties(false)
  .build();

type Config = Jet.Infer<typeof configSchema>; // { [x: string]: never; }
// No property will be accepted
const config: Config = {
  appName: "MyApp",
};  // ❌Fails

const configSchema = new SchemaBuilder()
  .additionalProperties(true)
  .build();

type Config = Jet.Infer<typeof configSchema>; // { [x: string]: any; }
// Any property will be accepted
const config: Config = {
  appName: "MyApp",
  john: 'who'
};  // ✅Works

// With defined schema
const configSchema = new SchemaBuilder()
  .object()
  .additionalProperties((s) => s
        .object()
        .properties({
          success: (s) => s.const(true),
          data: (s) => s.string(),
        })
        .required(["success", "data"])
        )
  .build();

type Config = Jet.Infer<typeof configSchema>; 
// {
//    [x: string]: {
//        success: true;
//        data: string;
//    };
// }

// Any property will be accepted but must match constraints.
const config: Config = {
  appName: "MyApp", //❌Fails
  john: {
    success: true,
    data: 'what data'
  } // ✅works
};

 ```
**The limitation**: Typescript doesn't allow overriding general types with defined types.

```typescript
// typescript doesn't allow.
type Config = {
  appName: string;
  [x: string]: boolean;
};
// the [x: string]: boolean; overrides everything else.
// so appName: string; is completely ignored and app name must satisfy the condition boolean.

```

That limitation is why additional properties is not evaluated together with properties.

### Unevaluated Properties

It works the exact same way as additionalProperties, the same constraints, and limitations.

Only difference is you use `.unevaluatedProperties` instead of `.additionalProperties`

### Cheat Sheet

| Schema Setting | TypeScript Inference | Exclusivity | Behavior |
| :--- | :--- | :--- | :--- |
| `.additionalProperties(false)` | `Record<string, never>` | **Maintained** | **Strict.** No extra keys allowed. Best for `oneOf`. |
| `.additionalProperties(true)` | `{ [x: string]: any }` | **Broken** | **Open.** Any extra key is allowed. |
| `.additionalProperties(s.string())` | `{ [x: string]: string }` | **Broken** | **Controlled.** Extra keys must follow the schema. |
| `.properties({}).unevaluated(false)` | `{ [x: string]: any }` | **Variable** | **Hinted.** Tells Jetter to look into sub-schemas. |

| `..unevaluated(false | true or whatever)` | `{ [x: string]: any }` | **Variable** | **Hinted.** Tells Jetter to add an index any so typescript knows additional properties are expected. |

> [!IMPORTANT]
> When `additionalProperties` or `unevaluatedProperties` is set to `true` or a schema, TypeScript adds an index signature. This effectively turns off **Excess Property Checking**, which can allow conflicting properties in a `oneOf` union to coexist without a compiler error.

---

### ✅ Arrays

Arrays support homogeneous collections, fixed-length tuples, and tuples with rest elements, all with full type inference.

#### Homogeneous Arrays (items)

**draft 2019-09 and above**

Use `.items()` to define arrays where all elements have the same type.

```typescript
// Array of strings
const tagsSchema = new SchemaBuilder()
  .array()
  .items((s) => s.string())
  .build();

type Tags = Jet.Infer<typeof tagsSchema>;
// Result: string[]

const tags: Tags = ["javascript", "typescript", "react"]; // ✅
const emptyTags: Tags = []; // ✅
const invalidTags: Tags = ["valid", 123]; 
// ❌ TypeScript Error: Type 'number' is not assignable to type 'string'

// Array of numbers with constraints
const scoresSchema = new SchemaBuilder()
  .array()
  .items((s) => s.number().minimum(0).maximum(100))
  .minItems(1)
  .maxItems(10)
  .build();

type Scores = Jet.Infer<typeof scoresSchema>;
// Result: number[]
// Note: minItems/maxItems are validated at runtime, not enforced in types

const scores: Scores = [85, 92, 78, 95]; // ✅
const tooFewScores: Scores = []; 
// ✅ TypeScript allows this, but runtime validation will fail

// Array of booleans
const flagsSchema = new SchemaBuilder()
  .array()
  .items((s) => s.boolean())
  .build();

type Flags = Jet.Infer<typeof flagsSchema>;
// Result: boolean[]

const flags: Flags = [true, false, true, true]; // ✅
```

#### Array of Objects

```typescript
const usersSchema = new SchemaBuilder()
  .array()
  .items((s) => s.object()
    .properties({
      id: (s) => s.number(),
      name: (s) => s.string(),
      email: (s) => s.string(),
      active: (s) => s.boolean()
    })
    .required(['id', 'name'])
  )
  .build();

type Users = Jet.Infer<typeof usersSchema>;
// Result: { id: number; name: string; email?: string; active?: boolean }[]

const users: Users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", active: true },
  { id: 3, name: "Charlie" }
]; // ✅

const invalidUsers: Users = [
  { id: 1, name: "Alice" },
  { id: 2 } // ❌ TypeScript Error: Property 'name' is missing
];
```

#### Array of Arrays (Nested)

```typescript
const matrixSchema = new SchemaBuilder()
  .array()
  .items((s) => s.array()
    .items((s) => s.number())
  )
  .build();

type Matrix = Jet.Infer<typeof matrixSchema>;
// Result: number[][]

const matrix: Matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]; // ✅
```

#### Tuples with prefixItems

Use `.prefixItems()` to define fixed-position elements in a tuple. Each position can have a different type.

```typescript
// Geographic coordinate [latitude, longitude]
const coordinateSchema = new SchemaBuilder()
  .array()
  .prefixItems(
    (s) => s.number().minimum(-90).maximum(90),   // latitude
    (s) => s.number().minimum(-180).maximum(180)  // longitude
  )
  .build();

type Coordinate = Jet.Infer<typeof coordinateSchema>;
// Result: [number, number]

const sanFrancisco: Coordinate = [37.7749, -122.4194]; // ✅
const invalidCoord: Coordinate = [37.7749]; 
// ❌ TypeScript Error: Source has 1 element(s) but target requires 2

// Mixed-type tuple
const recordSchema = new SchemaBuilder()
  .array()
  .prefixItems(
    (s) => s.string(),   // ID
    (s) => s.number(),   // timestamp
    (s) => s.boolean(),  // active flag
    (s) => s.null()      // placeholder
  )
  .build();

type Record = Jet.Infer<typeof recordSchema>;
// Result: [string, number, boolean, null]

const record: Record = ["user-123", 1706889600, true, null]; // ✅
const wrongOrder: Record = [1706889600, "user-123", true, null];
// ❌ TypeScript Error: Types at positions don't match

// Tuple with object elements
const userActionSchema = new SchemaBuilder()
  .array()
  .prefixItems(
    (s) => s.string(),  // action type
    (s) => s.object()
      .properties({
        userId: (s) => s.number(),
        timestamp: (s) => s.number()
      })
      .required(['userId', 'timestamp'])
  )
  .build();

type UserAction = Jet.Infer<typeof userActionSchema>;
// Result: [string, { userId: number; timestamp: number }]

const action: UserAction = [
  "login",
  { userId: 42, timestamp: Date.now() }
]; // ✅
```

#### Tuples with Rest Elements

Combine `.prefixItems()` with `.items()` to create tuples with a fixed prefix and variable-length rest elements.

```typescript
// First element is name (string), second is version (number), 
// rest are feature flags (booleans)
const featureSchema = new SchemaBuilder()
  .array()
  .prefixItems(
    (s) => s.string(),   // feature name
    (s) => s.number()    // version number
  )
  .items((s) => s.boolean())  // ...feature flags
  .build();

type Feature = Jet.Infer<typeof featureSchema>;
// Result: [string, number, ...boolean[]]

// Valid usage
const feature1: Feature = ["dark-mode", 2, true, false, true]; // ✅
const feature2: Feature = ["auto-save", 1]; // ✅ (rest is optional/empty)
const feature3: Feature = ["analytics", 3, false]; // ✅ (one flag)

// Invalid usage
const invalid1: Feature = [123, "v2"]; 
// ❌ TypeScript Error: First must be string, second must be number

const invalid2: Feature = ["feature", 1, "not-boolean"];
// ❌ TypeScript Error: Rest elements must be boolean

// More complex example with object rest elements
const logEntrySchema = new SchemaBuilder()
  .array()
  .prefixItems(
    (s) => s.string(),  // log level
    (s) => s.number()   // timestamp
  )
  .items((s) => s.object()
    .properties({
      key: (s) => s.string(),
      value: (s) => s.string()
    })
    .required(['key', 'value'])
  )
  .build();

type LogEntry = Jet.Infer<typeof logEntrySchema>;
// Result: [string, number, ...{ key: string; value: string }[]]

const log: LogEntry = [
  "error",
  Date.now(),
  { key: "module", value: "auth" },
  { key: "error", value: "invalid token" }
]; // ✅
```

#### Tuples with items
**draft07 and below**

Use `.items()` to define fixed-position elements in a tuple. Each position can have a different type.

```typescript
// Geographic coordinate [latitude, longitude]
const coordinateSchema = new SchemaBuilder()
  .array()
  .items(
    (s) => s.number().minimum(-90).maximum(90),   // latitude
    (s) => s.number().minimum(-180).maximum(180)  // longitude
  )
  .build();

type Coordinate = Jet.Infer<typeof coordinateSchema>;
// Result: [number, number]

const sanFrancisco: Coordinate = [37.7749, -122.4194]; // ✅
const invalidCoord: Coordinate = [37.7749]; 
// ❌ TypeScript Error: Source has 1 element(s) but target requires 2

// Mixed-type tuple
const recordSchema = new SchemaBuilder()
  .array()
  .items(
    (s) => s.string(),   // ID
    (s) => s.number(),   // timestamp
    (s) => s.boolean(),  // active flag
    (s) => s.null()      // placeholder
  )
  .build();

type Record = Jet.Infer<typeof recordSchema>;
// Result: [string, number, boolean, null]

const record: Record = ["user-123", 1706889600, true, null]; // ✅
const wrongOrder: Record = [1706889600, "user-123", true, null];
// ❌ TypeScript Error: Types at positions don't match

// Tuple with object elements
const userActionSchema = new SchemaBuilder()
  .array()
  .items(
    (s) => s.string(),  // action type
    (s) => s.object()
      .properties({
        userId: (s) => s.number(),
        timestamp: (s) => s.number()
      })
      .required(['userId', 'timestamp'])
  )
  .build();

type UserAction = Jet.Infer<typeof userActionSchema>;
// Result: [string, { userId: number; timestamp: number }]

const action: UserAction = [
  "login",
  { userId: 42, timestamp: Date.now() }
]; // ✅
```

#### Tuples with Rest Elements

Combine `.items()` with `.additionalItems()` to create tuples with a fixed prefix and variable-length rest elements.

```typescript
// First element is name (string), second is version (number), 
// rest are feature flags (booleans)
const featureSchema = new SchemaBuilder()
  .array()
  .items(
    (s) => s.string(),   // feature name
    (s) => s.number()    // version number
  )
  .additionalItems((s) => s.boolean())  // ...feature flags
  .build();

type Feature = Jet.Infer<typeof featureSchema>;
// Result: [string, number, ...boolean[]]

// Valid usage
const feature1: Feature = ["dark-mode", 2, true, false, true]; // ✅
const feature2: Feature = ["auto-save", 1]; // ✅ (rest is optional/empty)
const feature3: Feature = ["analytics", 3, false]; // ✅ (one flag)

// Invalid usage
const invalid1: Feature = [123, "v2"]; 
// ❌ TypeScript Error: First must be string, second must be number

const invalid2: Feature = ["feature", 1, "not-boolean"];
// ❌ TypeScript Error: Rest elements must be boolean

// More complex example with object rest elements
const logEntrySchema = new SchemaBuilder()
  .array()
  .items(
    (s) => s.string(),  // log level
    (s) => s.number()   // timestamp
  )
  .additionalItems((s) => s.object()
    .properties({
      key: (s) => s.string(),
      value: (s) => s.string()
    })
    .required(['key', 'value'])
  )
  .build();

type LogEntry = Jet.Infer<typeof logEntrySchema>;
// Result: [string, number, ...{ key: string; value: string }[]]

const log: LogEntry = [
  "error",
  Date.now(),
  { key: "module", value: "auth" },
  { key: "error", value: "invalid token" }
]; // ✅
```



#### Array Constraints

```typescript
// Constraints like minItems, maxItems, uniqueItems are validated 
// at runtime but don't affect the TypeScript type

const limitedArraySchema = new SchemaBuilder()
  .array()
  .items((s) => s.string())
  .minItems(2)
  .maxItems(5)
  .uniqueItems(true)
  .build();

type LimitedArray = Jet.Infer<typeof limitedArraySchema>;
// Result: string[] (constraints not visible in type)

// TypeScript allows this, but runtime validation will enforce constraints
const tooShort: LimitedArray = ["one"]; // ✅ TypeScript, ❌ Runtime
const justRight: LimitedArray = ["one", "two", "three"]; // ✅ Both
const tooLong: LimitedArray = ["1", "2", "3", "4", "5", "6"]; // ✅ TypeScript, ❌ Runtime
```

---

### ✅ Enums & Const

Literal types for fixed sets of values or single constant values. These are essential for creating discriminated unions and type-safe constants.

#### Enum (Union of Literals)

Enums create TypeScript union types from an array of allowed values.

```typescript
// String enum
const statusSchema = new SchemaBuilder()
  .enum(['pending', 'approved', 'rejected', 'cancelled'])
  .build();

type Status = Jet.Infer<typeof statusSchema>;
// Result: 'pending' | 'approved' | 'rejected' | 'cancelled'

// TypeScript enforces only these exact values
const status1: Status = 'approved'; // ✅
const status2: Status = 'pending'; // ✅
const status3: Status = 'in-progress'; 
// ❌ TypeScript Error: Type '"in-progress"' is not assignable to type Status

// Use in function parameters
function updateStatus(newStatus: Status) {
  console.log(`Status updated to: ${newStatus}`);
}

updateStatus('approved'); // ✅
updateStatus('invalid'); 
// ❌ TypeScript Error: Argument not assignable to parameter of type Status

// Numeric enum
const prioritySchema = new SchemaBuilder()
  .enum([1, 2, 3, 4, 5])
  .build();

type Priority = Jet.Infer<typeof prioritySchema>;
// Result: 1 | 2 | 3 | 4 | 5

const highPriority: Priority = 1; // ✅
const mediumPriority: Priority = 3; // ✅
const invalidPriority: Priority = 10; 
// ❌ TypeScript Error: Type '10' is not assignable to type Priority

// Mixed type enum (less common, but supported)
const mixedSchema = new SchemaBuilder()
  .enum(['active', 1, true, null])
  .build();

type Mixed = Jet.Infer<typeof mixedSchema>;
// Result: 'active' | 1 | true | null

const mixed1: Mixed = 'active'; // ✅
const mixed2: Mixed = 1; // ✅
const mixed3: Mixed = true; // ✅
const mixed4: Mixed = null; // ✅
const mixed5: Mixed = false; 
// ❌ TypeScript Error: Type 'false' is not assignable to type Mixed
```

**Real-world Examples:**

```typescript
// HTTP methods
const httpMethodSchema = new SchemaBuilder()
  .enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
  .build();

type HttpMethod = Jet.Infer<typeof httpMethodSchema>;

// User roles
const roleSchema = new SchemaBuilder()
  .enum(['admin', 'moderator', 'user', 'guest'])
  .build();

type UserRole = Jet.Infer<typeof roleSchema>;

// Order statuses
const orderStatusSchema = new SchemaBuilder()
  .enum(['cart', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  .build();

type OrderStatus = Jet.Infer<typeof orderStatusSchema>;

// Currency codes
const currencySchema = new SchemaBuilder()
  .enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY'])
  .build();

type Currency = Jet.Infer<typeof currencySchema>;
```

#### Const (Single Literal Value)

Const creates a type that accepts only one specific value. This is particularly useful for discriminator fields in union types.

```typescript
// String const
const apiVersionSchema = new SchemaBuilder()
  .const('v2')
  .build();

type ApiVersion = Jet.Infer<typeof apiVersionSchema>;
// Result: 'v2' (not string)

// Only this exact value is valid
const version: ApiVersion = 'v2'; // ✅
const wrongVersion: ApiVersion = 'v1'; 
// ❌ TypeScript Error: Type '"v1"' is not assignable to type '"v2"'
const alsoWrong: ApiVersion = 'v3';
// ❌ TypeScript Error: Type '"v3"' is not assignable to type '"v2"'

// Numeric const
const maxRetriesSchema = new SchemaBuilder()
  .const(3)
  .build();

type MaxRetries = Jet.Infer<typeof maxRetriesSchema>;
// Result: 3 (not number)

const retries: MaxRetries = 3; // ✅
const tooMany: MaxRetries = 5; 
// ❌ TypeScript Error: Type '5' is not assignable to type '3'

// Boolean const
const productionSchema = new SchemaBuilder()
  .const(true)
  .build();

type Production = Jet.Infer<typeof productionSchema>;
// Result: true (not boolean)

const isProd: Production = true; // ✅
const isDev: Production = false;
// ❌ TypeScript Error: Type 'false' is not assignable to type 'true'

// Null const (rare, but valid)
const nullOnlySchema = new SchemaBuilder()
  .const(null)
  .build();

type NullOnly = Jet.Infer<typeof nullOnlySchema>;
// Result: null

const value: NullOnly = null; // ✅
const notNull: NullOnly = undefined;
// ❌ TypeScript Error
```

---

### ✅ Unions (oneOf / anyOf)

Create union types that represent multiple possible schemas. These are powerful tools for modeling data that can take different shapes.

#### oneOf - Exclusive Union (Discriminated Unions)

`oneOf` creates a union where data must match **exactly one** schema.

**Basic oneOf:**

```typescript
const idSchema = new SchemaBuilder()
  .oneOf(
    (s) => s.string().format('uuid'),
    (s) => s.number().integer().minimum(1)
  )
  .build();

type Id = Jet.Infer<typeof idSchema>;
// Result: string | number
// Simple | since its a union between different types.

const id1: Id = "550e8400-e29b-41d4-a716-446655440000"; // ✅
const id2: Id = 42; // ✅
const id3: Id = true; 
// ❌ TypeScript Error: Type 'boolean' is not assignable to type Id
```

**Discriminated Union with Objects:**

The most powerful use of `oneOf` is creating discriminated unions where TypeScript can narrow the type based on a discriminator field.

There is a discriminator filed here, which is success, this tells typescript its not just a union but a discriminated one.
```typescript
const responseSchema = new SchemaBuilder()
  .oneOf(
    // Success response
    (s) => s.object()
      .properties({
        success: (s) => s.const(true),
        data: (s) => s.string(),
        timestamp: (s) => s.number()
      })
      .required(['success', 'data']),
    
    // Error response
    (s) => s.object()
      .properties({
        success: (s) => s.const(false),
        error: (s) => s.string(),
        code: (s) => s.number()
      })
      .required(['success', 'error'])
  )
  .build();

type Response = Jet.Infer<typeof responseSchema>;
/*
{
  success: true;
  data: string;
  timestamp?: number;
} | {
  success: false;
  error: string;
  code?: number;
}
*/

// TypeScript automatically narrows the type based on 'success'
const handleResponse = (response: Response) => {
  if (response.success) {
    // TypeScript knows this is the success branch
    console.log(response.data); // ✅ 'data' exists here
    if (response.timestamp) {
      console.log(new Date(response.timestamp));
    }
    // console.log(response.error); 
    // ❌ TypeScript Error: Property 'error' does not exist
  } else {
    // TypeScript knows this is the error branch
    console.log(response.error); // ✅ 'error' exists here
    if (response.code) {
      console.log(`Error code: ${response.code}`);
    }
    // console.log(response.data);
    // ❌ TypeScript Error: Property 'data' does not exist
  }
};
```

**Complex Discriminated Union:**

```typescript
const shapeSchema = new SchemaBuilder()
  .oneOf(
    // Circle
    (s) => s.object()
      .properties({
        type: (s) => s.const('circle'),
        radius: (s) => s.number().minimum(0),
        color: (s) => s.string()
      })
      .required(['type', 'radius']),
    
    // Rectangle
    (s) => s.object()
      .properties({
        type: (s) => s.const('rectangle'),
        width: (s) => s.number().minimum(0),
        height: (s) => s.number().minimum(0),
        color: (s) => s.string()
      })
      .required(['type', 'width', 'height']),
    
    // Triangle
    (s) => s.object()
      .properties({
        type: (s) => s.const('triangle'),
        base: (s) => s.number().minimum(0),
        height: (s) => s.number().minimum(0),
        color: (s) => s.string()
      })
      .required(['type', 'base', 'height']),
    
    // Point (no dimensions)
    (s) => s.object()
      .properties({
        type: (s) => s.const('point'),
        x: (s) => s.number(),
        y: (s) => s.number(),
        color: (s) => s.string()
      })
      .required(['type', 'x', 'y'])
  )
  .build();

type Shape = Jet.Infer<typeof shapeSchema>;
/*
{
  type: 'circle';
  radius: number;
  color?: string;
} | {
  type: 'rectangle';
  width: number;
  height: number;
  color?: string;
} | {
  type: 'triangle';
  base: number;
  height: number;
  color?: string;
} | {
  type: 'point';
  x: number;
  y: number;
  color?: string;
}
*/

// TypeScript discriminates on the 'type' field
const calculateArea = (shape: Shape): number => {
  switch (shape.type) {
    case 'circle':
      // TypeScript knows shape.radius exists
      return Math.PI * shape.radius ** 2;
    
    case 'rectangle':
      // TypeScript knows shape.width and shape.height exist
      return shape.width * shape.height;
    
    case 'triangle':
      // TypeScript knows shape.base and shape.height exist
      return (shape.base * shape.height) / 2;
    
    case 'point':
      // TypeScript knows shape.x and shape.y exist
      return 0;
  }
};
```

**Where it gets complex**
There is no discriminator field in this schema so typescript treats it as a normal union.

```typescript

const valueSchema = new SchemaBuilder()
  .oneOf(
    (s) =>
      s
        .object()
        .properties({
          id: (s) => s.number(),
          name: (s) => s.string(),
        })
        .required(["id", "name"]),

    (s) =>
      s
        .object()
        .properties({
          role: (s) => s.const("admin" as const),
          permissions: (s) => s.array().items((s) => s.string()),
        })
        .required(["role", "permissions"]),
  )
  .build();
// Typescript does
// type Value =
//   | {
//       id: number;
//       name: string;
//     }
//   | {
//       role: "admin";
//       permissions: string[];
//     };
// which means 
const str: Value = { id: 2, name: "", role: "admin" }; // is valid and that defeats the purpose of oneOf
```

To fix this we use an exclsuive or approach, this makes sure that any property that is in Branch B and not in Branch A is strictly undefined and vice versa.

**That results in:**
```typescript

const valueSchema = new SchemaBuilder()
  .oneOf(
    (s) =>
      s
        .object()
        .properties({
          id: (s) => s.number(),
          name: (s) => s.string(),
        })
        .required(["id", "name"]),

    (s) =>
      s
        .object()
        .properties({
          role: (s) => s.const("admin" as const),
          permissions: (s) => s.array().items((s) => s.string()),
        })
        .required(["role", "permissions"]),
  )
  .build();
type Value = Jet.Infer<typeof valueSchema>
// type Value = {
//     id: number;
//     name: string;
//     permissions?: undefined;
//     role?: undefined;
// } | {
//     role: "admin";
//     permissions: string[];
//     id?: undefined;
//     name?: undefined;
// }
// This ensures a discriminated union telling typescript only one of these types can work
const str: Value2 = { id: 2, name: "", role: "admin" }; // ❌ Invalid

```


#### anyOf - Union (At Least One Match)

`anyOf` creates a union where data must match **at least one** schema. At runtime, data can match multiple schemas, but in TypeScript it infers as a standard union.

```typescript
const flexibleIdSchema = new SchemaBuilder()
  .anyOf(
    (s) => s.string(),
    (s) => s.number()
  )
  .build();

type FlexibleId = Jet.Infer<typeof flexibleIdSchema>;
// Result: string | number

const id1: FlexibleId = "abc123"; // ✅
const id2: FlexibleId = 42; // ✅
const id3: FlexibleId = true; 
// ❌ TypeScript Error: Type 'boolean' is not assignable to type FlexibleId

// anyOf with Multiple Types
const userInputSchema = new SchemaBuilder()
  .anyOf(
    (s) => s.string().minLength(1),
    (s) => s.number().minimum(0),
    (s) => s.boolean(),
    (s) => s.null()
  )
  .build();

type UserInput = Jet.Infer<typeof userInputSchema>;
// Result: string | number | boolean | null

const input1: UserInput = "hello"; // ✅
const input2: UserInput = 42; // ✅
const input3: UserInput = true; // ✅
const input4: UserInput = null; // ✅
const input5: UserInput = undefined;
// ❌ TypeScript Error: Type 'undefined' is not assignable to type UserInput
```

**Difference between oneOf and anyOf:**

- **oneOf**: Exactly one schema must match (exclusive) - runtime validation fails if data matches 0 or 2+ schemas
- **anyOf**: At least one schema must match (can match multiple) - runtime validation succeeds if data matches 1+ schemas

```typescript
// oneOf: EXACTLY one schema must match
const strictUnion = new SchemaBuilder()
  .oneOf(
    (s) => s.object().properties({ 
      type: (s) => s.const('a'),
      val:  (s) => s.string()
    }),
    (s) => s.object().properties({ 
      type: (s) => s.const('b'),
      vas:  (s) => s.string()
    })
  )
  .build();

// Type Inference:
// { type: 'a', val: '' } ✅ matches first schema only
// { type: 'b', vas: '' } ✅ matches second schema only
// { type: 'b', val: '' } ❌ Must match only and exactly one 

// anyOf: AT LEAST one schema must match
const flexibleUnion = new SchemaBuilder()
  .anyOf(
    (s) => s.object().properties({ 
      type: (s) => s.const('a'),
      val:  (s) => s.string()
    }),
    (s) => s.object().properties({ 
      type: (s) => s.const('b'),
      vas:  (s) => s.string()
    })
  )
  .build();

// Type Inference:
// { type: 'a', val: '' } ✅ matches first schema only
// { type: 'b', vas: '' } ✅ matches second schema only
// { type: 'b', val: '' } ✅ works because of |
```
**Note:** for anyOf if there is a discrimator it'll result in a discrimated union which is also an expected behaviour while oneOf creates a discrimiated union by default.

---

### ✅ Intersections (allOf)

`allOf` creates intersection types where data must satisfy **all** schemas simultaneously. This is useful for combining multiple schemas or extending base schemas.

**Basic Intersection:**

```typescript
const basePropsSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number(),
    createdAt: (s) => s.number()
  });

const userPropsSchema = new SchemaBuilder()
  .object()
  .properties({
    name: (s) => s.string(),
    email: (s) => s.string()
  });

const userSchema = new SchemaBuilder()
  .allOf(
    (s) => s.extend(basePropsSchema),
    (s) => s.extend(userPropsSchema)
  )
  .build();

type User = Jet.Infer<typeof userSchema>;
/*
{
  id?: number;
  createdAt?: number;
  name?: string;
  email?: string;
}
*/

// All properties from both schemas are merged
const user: User = {
  id: 1,
  createdAt: Date.now(),
  name: "Alice",
  email: "alice@example.com"
}; // ✅
```

**Combining Base Schema with Extensions:**

```typescript
const timestampSchema = new SchemaBuilder()
  .object()
  .properties({
    createdAt: (s) => s.number(),
    updatedAt: (s) => s.number()
  })
  .required(['createdAt']);

const auditSchema = new SchemaBuilder()
  .object()
  .properties({
    createdBy: (s) => s.string(),
    updatedBy: (s) => s.string()
  });

const productSchema = new SchemaBuilder()
  .allOf(
    (s) => s.extend(timestampSchema),
    (s) => s.extend(auditSchema),
    (s) => s.object()
      .properties({
        productId: (s) => s.string(),
        name: (s) => s.string(),
        price: (s) => s.number()
      })
      .required(['productId', 'name', 'price'])
  )
  .build();

type Product = Jet.Infer<typeof productSchema>;
/*
{
  createdAt: number;      // Required from timestampSchema
  updatedAt?: number;
  createdBy?: string;
  updatedBy?: string;
  productId: string;      // Required from inline schema
  name: string;           // Required from inline schema
  price: number;          // Required from inline schema
}
*/

const product: Product = {
  productId: "prod-123",
  name: "Laptop",
  price: 999.99,
  createdAt: Date.now()
}; // ✅
```

---

### ✅ Conditionals (if/then/else/elseIf)

Conditional schemas allow you to define validation rules that depend on the data itself. TypeScript infers these as discriminated unions based on the condition values.

**This is a groundbreaking feature:** `@jetio/schema-builder` provides type inference for JSON Schema's conditional keywords including the `elseIf` keyword, something no other TypeScript schema library supports. This required pushing TypeScript's type system to its limits to accurately represent JSON Schema's conditional logic.

#### Basic if/then/else

```typescript
const addressSchema = new SchemaBuilder()
  .object()
  .properties({
    country: (s) => s.string(),
    state: (s) => s.string(),
    postalCode: (s) => s.string()
  })
  .required(['country'])
  .if((s) => s.object().properties({
    country: (s) => s.const('US')
  }))
  .then((s) => s.object()
    .properties({
      state: (s) => s.string(),
      zipCode: (s) => s.string().pattern('^[0-9]{5}$')
    })
    .required(['state'])
  )
  .else((s) => s.object()
    .properties({
      postalCode: (s) => s.string()
    })
    .required(['postalCode'])
  )
  .build();

type Address = Jet.Infer<typeof addressSchema>;
/*
{
  country: 'US';
  state: string;
  zipCode?: string;
  postalCode?: string;
} | {
  country: string;
  postalCode: string;
  state?: string;
  zipCode?: undefined; // EXclusive OR, uncommon properies in if/then must not be in else
}
*/

// TypeScript infers two branches based on country value
const usAddress: Address = {
  country: 'US',
  state: 'CA',
  zipCode: '94105'
}; // ✅

const ukAddress: Address = {
  country: 'UK',
  postalCode: 'SW1A 1AA'
}; // ✅
```

#### if/elseIf/else Chains

The real power comes with `elseIf` for handling multiple conditions:

```typescript
const shippingSchema = new SchemaBuilder()
  .object()
  .properties({
    country: (s) => s.string(),
    weight: (s) => s.number(),
    shippingMethod: (s) => s.string(),
    trackingNumber: (s) => s.string()
  })
  .required(['country', 'weight'])
  .if((s) => s.object().properties({
    country: (s) => s.const('US')
  }))
  .then((s) => s.object()
    .properties({
      shippingMethod: (s) => s.enum(['USPS', 'UPS', 'FedEx']),
      estimatedDays: (s) => s.enum([2, 3, 5])
    })
    .required(['shippingMethod'])
  )
  .elseIf((s) => s.object().properties({
    country: (s) => s.const('CA')
  }))
  .then((s) => s.object()
    .properties({
      shippingMethod: (s) => s.enum(['Canada Post', 'Purolator']),
      estimatedDays: (s) => s.enum([5, 7, 10])
    })
    .required(['shippingMethod'])
  )
  .elseIf((s) => s.object().properties({
    country: (s) => s.const('UK')
  }))
  .then((s) => s.object()
    .properties({
      shippingMethod: (s) => s.enum(['Royal Mail', 'DPD']),
      estimatedDays: (s) => s.enum([7, 10, 14])
    })
    .required(['shippingMethod'])
  )
  .else((s) => s.object()
    .properties({
      shippingMethod: (s) => s.string(),
      estimatedDays: (s) => s.number().minimum(14)
    })
    .required(['shippingMethod'])
  )
  .build();

type Shipping = Jet.Infer<typeof shippingSchema>;
/*
{
  country: 'US';
  weight: number;
  shippingMethod: 'USPS' | 'UPS' | 'FedEx';
  estimatedDays?: 2 | 3 | 5;
  trackingNumber?: string;
} | {
  country: 'CA';
  weight: number;
  shippingMethod: 'Canada Post' | 'Purolator';
  estimatedDays?: 5 | 7 | 10;
  trackingNumber?: string;
} | {
  country: 'UK';
  weight: number;
  shippingMethod: 'Royal Mail' | 'DPD';
  estimatedDays?: 7 | 10 | 14;
  trackingNumber?: string;
} | {
  country: string;
  weight: number;
  shippingMethod: string;
  estimatedDays?: number;
  trackingNumber?: string;
}
*/

// TypeScript narrows the type based on country
const usShipping: Shipping = {
  country: 'US',
  weight: 2.5,
  shippingMethod: 'USPS',
  estimatedDays: 3
}; // ✅

const caShipping: Shipping = {
  country: 'CA',
  weight: 1.5,
  shippingMethod: 'Canada Post'
}; // ✅
```

**Important Notes on Conditionals:**

1. **Type Narrowing:** Conditionals create discriminated unions that TypeScript can narrow based on the condition field, and if no discriminator fields exist the schema builder enforces one.
2. **Cascading Logic:** `elseIf` is evaluated in order - first matching condition wins
3. **Runtime Validation:** Conditions are checked at runtime validation; types represent all possible branches
4. **Exclusive Branches:** Each branch is exclusive - data matches exactly one path through if/elseIf/else

---


### ✅ Combining Multiple Keywords

**CRITICAL CONCEPT:** Following the JSON Schema specification, `@jetio/schema-builder` evaluates **ALL** schema keywords simultaneously. This is a fundamental design decision to ensure `@jetio/schema-builder` accurately represents JSON Schema's behavior.

Unlike other schema libraries that use custom DSLs, `@jetio/schema-builder` implements the actual JSON Schema spec where **everything in the schema is evaluated together**. When multiple keywords are present (`type`, `properties`, `oneOf`, `allOf`, `if/then/else`, `patternProperties`), they all create intersecting constraints that must be satisfied simultaneously.

#### How It Works

When multiple keywords are present in a schema, `@jetio/schema-builder` creates an **intersection type** (`&`) of all the constraints:

```typescript
const combinedSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number(),
    name: (s) => s.string()
  })
  .required(['id'])
  .allOf(
    (s) => s.object().properties({
      createdAt: (s) => s.number()
    }).required(['createdAt'])
  )
  .oneOf(
    (s) => s.object().properties({
      type: (s) => s.const('user'),
      email: (s) => s.string()
    }).required(['type', 'email']),
    (s) => s.object().properties({
      type: (s) => s.const('admin'),
      permissions: (s) => s.array().items((s) => s.string())
    }).required(['type', 'permissions'])
  )
  .build();

type Combined = Jet.Infer<typeof combinedSchema>;
/*
Result: ALL keywords are evaluated together!

{
  id: number;           // From .properties() + .required()
  createdAt: number;    // From .allOf() + .required()
  type: 'user';         // From .oneOf() (first branch)
  email: string;        // From .oneOf() (first branch)
  name?: string;        // From .properties()
} | {
  id: number;           // From .properties() + .required()
  createdAt: number;    // From .allOf() + .required()
  type: 'admin';        // From .oneOf() (second branch)
  permissions: string[]; // From .oneOf() (second branch)
  name?: string;        // From .properties()
}

Note how:
- Base properties (id, name) appear in BOTH branches
- allOf properties (createdAt) appear in BOTH branches
- oneOf creates the discriminated union
- Everything is merged together!
*/

const user: Combined = {
  id: 1,
  createdAt: Date.now(),
  type: 'user',
  email: 'user@example.com'
}; // ✅

const admin: Combined = {
  id: 2,
  createdAt: Date.now(),
  type: 'admin',
  permissions: ['read', 'write', 'delete']
}; // ✅
```

#### Multiple Types with Chaining

You can specify multiple primitive types by chaining type methods:

```typescript
const multiTypeSchema = new SchemaBuilder()
  .string()
  .number()
  .boolean()
  .build();

type MultiType = Jet.Infer<typeof multiTypeSchema>;
// Result: string | number | boolean

const value1: MultiType = "hello"; // ✅
const value2: MultiType = 42; // ✅
const value3: MultiType = true; // ✅
const value4: MultiType = null; 
// ❌ TypeScript Error: Type 'null' is not assignable

// With constraints (applied to matching types)
const constrainedMultiTypeSchema = new SchemaBuilder()
  .string()
  .number()
  .minLength(5)  // Only applies to strings
  .minimum(0)    // Only applies to numbers
  .build();

type ConstrainedMultiType = Jet.Infer<typeof constrainedMultiTypeSchema>;
// Result: string | number (constraints validated at runtime)
```

#### Layering Combinators

You can layer `allOf`, `oneOf`, `anyOf`, and conditionals together:

```typescript
const layeredSchema = new SchemaBuilder()
  .allOf(
    // Base timestamp fields for ALL records
    (s) => s.object().properties({
      createdAt: (s) => s.number(),
      updatedAt: (s) => s.number()
    }).required(['createdAt', 'updatedAt'])
  )
  .oneOf(
    // Different record types
    (s) => s.object().properties({
      recordType: (s) => s.const('invoice'),
      amount: (s) => s.number(),
      dueDate: (s) => s.number()
    }).required(['recordType', 'amount']),
    
    (s) => s.object().properties({
      recordType: (s) => s.const('receipt'),
      amount: (s) => s.number(),
      paidDate: (s) => s.number()
    }).required(['recordType', 'amount'])
  )
  .if((s) => s.object().properties({
    amount: (s) => s.number().minimum(1000)
  }))
  .then((s) => s.object().properties({
    requiresApproval: (s) => s.const(true),
    approver: (s) => s.string()
  }).required(['requiresApproval', 'approver']))
  .end()
  .build();

type Layered = Jet.Infer<typeof layeredSchema>;
/*
Result: Complex intersection with all constraints!

{
    createdAt: number;
    updatedAt: number;
    recordType: "invoice";
    amount: number;
    dueDate?: number | undefined;
    paidDate?: undefined;
    requiresApproval: true;
    approver: string;
} | {
    createdAt: number;
    updatedAt: number;
    recordType: "receipt";
    amount: number;
    paidDate?: number | undefined;
    dueDate?: undefined;
    requiresApproval: true;
    approver: string;
}

Notice how:
- allOf properties appear in ALL 2 branches
- oneOf creates the invoice/receipt split
- if/then is merged with each oneOf branch
- Result: 2 (oneOf) × 1 (if/then) = 4 final type branches

Reason is if/then is executed as exactly one branch so its 1 if/then branch x 2 oneOf branch = 2.
*/


// See the difference when else is introduced

const layeredSchema = new SchemaBuilder()
  .allOf(
    // Base timestamp fields for ALL records
    (s) => s.object().properties({
      createdAt: (s) => s.number(),
      updatedAt: (s) => s.number()
    }).required(['createdAt', 'updatedAt'])
  )
  .oneOf(
    // Different record types
    (s) => s.object().properties({
      recordType: (s) => s.const('invoice'),
      amount: (s) => s.number(),
      dueDate: (s) => s.number()
    }).required(['recordType', 'amount']),
    
    (s) => s.object().properties({
      recordType: (s) => s.const('receipt'),
      amount: (s) => s.number(),
      paidDate: (s) => s.number()
    }).required(['recordType', 'amount'])
  )
  .if((s) => s.object().properties({
    amount: (s) => s.number().minimum(1000)
  }))
  .then((s) => s.object().properties({
    requiresApproval: (s) => s.const(true),
    approver: (s) => s.string()
  }).required(['requiresApproval', 'approver']))
  .end()
  .build();

type Layered = Jet.Infer<typeof layeredSchema>;
/*
Result: Complex intersection with all constraints!

type Layered = {
    createdAt: number;
    updatedAt: number;
    recordType: "invoice";
    amount: number;
    dueDate?: number | undefined;
    paidDate?: undefined;
    requiresApproval: true;
    approver: string;
} | {
    createdAt: number;
    updatedAt: number;
    recordType: "receipt";
    amount: number;
    paidDate?: number | undefined;
    dueDate?: undefined;
    requiresApproval: true;
    approver: string;
} | {
    createdAt: number;
    updatedAt: number;
    recordType: "invoice";
    amount: number;
    paidDate?: number | undefined;
    dueDate?: undefined;
    requiresApproval: false;
    approver?: undefined;
} | {
    createdAt: number;
    updatedAt: number;
    recordType: "receipt";
    amount: number;
    paidDate?: number | undefined;
    dueDate?: undefined;
    requiresApproval: false;
    approver?: undefined;
}

Notice how:
- allOf properties appear in ALL 4 branches
- oneOf creates the invoice/receipt split
- if/then and else creates the approval split within each oneOf branch
- Result: 2 (oneOf) × 2 (if/then, else) = 4 final type branches
*/
```

#### Properties + Pattern Properties

All property-related keywords work together:

```typescript
const fullPropertiesSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number(),
    name: (s) => s.string()
  })
  .required(['id'])
  .patternProperties({
    "^meta_": (s) => s.string(),
    "^flag_": (s) => s.boolean()
  })
  .build();

type FullProperties = Jet.Infer<typeof fullPropertiesSchema>;
/*
{
  id: number;                      // From .properties() (required)
  name?: string;                   // From .properties() (optional)
  [key: `meta_${string}`]: string; // From .patternProperties()
  [key: `flag_${string}`]: boolean; // From .patternProperties()
}

All property types coexist!
*/

const data: FullProperties = {
  id: 1,
  name: "Test",
  meta_version: "1.0",      // Matches pattern
  meta_author: "Alice",     // Matches pattern
  flag_enabled: true,       // Matches pattern
  flag_beta: false          // Matches pattern
}; // ✅
```

#### Object + Array Types Together

You can even combine object and array types

```typescript
const multiObjectArraySchema = new SchemaBuilder()
  .object()
  .properties({
    name: (s) => s.string()
  })
  .array()
  .items((s) => s.number())
  .build();

type MultiObjectArray = Jet.Infer<typeof multiObjectArraySchema>;
/*
Result: Union of object and array!

{
  name?: string;
} | number[]
*/

const obj: MultiObjectArray = { name: "test" }; // ✅
const arr: MultiObjectArray = [1, 2, 3]; // ✅
```

#### Why This Matters

**JSON Schema Spec Compliance:**
```typescript
// This is how JSON Schema actually works - all keywords evaluated together
const schema = new SchemaBuilder()
  .object().properties({ id: (s) => s.number() })
  .allOf(/* shared fields */)
  .oneOf(/* variants */)
  .if(/* conditions */).then(/* extras */)
  .build();

// TypeScript automatically understands ALL interactions
type T = Jet.Infer<typeof schema>;

// Runtime validation enforces ALL constraints simultaneously
const validate = validator.compile(schema);
```

I believe this is somehing only `@jetio/schema-builder` offers.
**Full JSON Schema spec compliance with accurate type inference**

**Key Takeaway:** In `@jetio/schema-builder`, every keyword you add creates an **additive constraint** that follows the JSON Schema specification. TypeScript combines them all intelligently to give you the most precise type possible, accurately mirroring what the runtime validator will enforce.

---

### ✅ Boolean Schemas

JSON Schema supports boolean schemas as a shorthand for schemas that accept everything (`true`) or nothing (`false`).

```typescript
// true schema - accepts any valid JSON
const anySchema = new SchemaBuilder()
  .properties({
    name: true
  })
  .build();

type Any = Jet.Infer<typeof anySchema>;
// Result: unknown (accepts anything){name: 'anything'}

const anySchema = new SchemaBuilder()
  .properties({
    name: false
  })
  .build();
  type Any = Jet.Infer<typeof anySchema>;

// false schema - rejects all data {name: ''} ❌ Always fail

```

---

### ✅ Schema Extension & Reusability

`@jetio/schema-builder` provides powerful schema reuse through the `.extend()` method, eliminating the need for `$ref` in most cases.

#### Basic Extension
```typescript
// Define a base schema
const timestampSchema = new SchemaBuilder()
  .object()
  .properties({
    createdAt: (s) => s.number(),
    updatedAt: (s) => s.number()
  })
  .required(['createdAt'])
  .build();

// Extend it with additional properties
const userSchema = new SchemaBuilder()
  .extend(timestampSchema)
  .properties({
    id: (s) => s.number(),
    name: (s) => s.string(),
    email: (s) => s.string()
  })
  .required(['id', 'name', 'email'])
  .build();

type User = Jet.Infer<typeof userSchema>;
/*
{
  createdAt: number;       // From base schema
  updatedAt?: number;      // From base schema
  id: number;              // Added property
  name: string;            // Added property
  email: string;           // Added property
}
*/
```

#### How Extension Works

When you call `.extend()`, the new schema **inherits the complete state** of the existing schema, then you can build on top of it:
```typescript
const baseSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number()
  })
  .build();

const extendedSchema = new SchemaBuilder()
  .extend(baseSchema)
  .properties({
    name: (s) => s.string()
  })
  .build();

type Extended = Jet.Infer<typeof extendedSchema>;
// Result: { id?: number; name?: string }
```

**Type Merging Behavior:**

Each method call **replaces** or **merges** or **creates a union** of its corresponding schema keyword, ensuring type consistency:
```typescript
const schema1 = new SchemaBuilder()
  .string()
  .build();

const schema2 = new SchemaBuilder()
  .extend(schema1)
  .number()  // Replaces type: 'string' with type: 'string' | 'number'
  .build();

type Schema2 = Jet.Infer<typeof schema2>;
// Result: (string | number) not number 
```

This replacement behavior ensures that:
1. **Types stay consistent** - No accidental type conflicts
2. **Extension is predictable** - You can override base schema behavior
3. **Reusability is maximized** - Use schemas as templates

#### Multiple Extensions
```typescript
const idSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.string().format('uuid')
  })
  .required(['id'])
  .build();

const timestampSchema = new SchemaBuilder()
  .object()
  .properties({
    createdAt: (s) => s.number(),
    updatedAt: (s) => s.number()
  })
  .required(['createdAt'])
  .build();

const entitySchema = new SchemaBuilder()
  .extend(idSchema)
  .allOf((s) => s.extend(timestampSchema))
  .properties({
    name: (s) => s.string(),
    description: (s) => s.string()
  })
  .required(['name'])
  .build();

type Entity = Jet.Infer<typeof entitySchema>;
/*
{
  id: string;              // From idSchema
  createdAt: number;       // From timestampSchema via allOf
  name: string;            // Added property
  updatedAt?: number;      // From timestampSchema via allOf
  description?: string;    // Added property
}
*/
```

#### Why Extension > $ref

**With `$ref` (doesn't work in types):**
```typescript
.$defs({ user: s => s.object().properties({ id: s => s.number() }) })
.properties({ author: s => s.$ref('#/$defs/user') })

// Type: { author?: unknown }  ❌
```

**With `.extend()` (works perfectly):**
```typescript
const userSchema = new SchemaBuilder()
  .object()
  .properties({ id: s => s.number() })
  .build();

const schema = new SchemaBuilder()
  .object()
  .properties({ author: s => s.extend(userSchema) })
  .build();

// Type: { author?: { id?: number } }  ✅
```

**Benefits:**
- ✅ Type inference works perfectly
- ✅ No need for `$ref` resolution
- ✅ Maximum reusability
- ✅ Schemas as composable building blocks
- ✅ Clear, explicit dependencies

#### Common Patterns

**1. Trait Composition:**
```typescript
const identifiable = new SchemaBuilder()
  .object()
  .properties({ id: s => s.string() })
  .required(['id'])
  .build();

const nameable = new SchemaBuilder()
  .object()
  .properties({ name: s => s.string() })
  .required(['name'])
  .build();

const product = new SchemaBuilder()
  .extend(identifiable)
  .allOf((s) => s.extend(nameable))
  .properties({
    price: s => s.number(),
    inStock: s => s.boolean()
  })
  .required(['price', 'inStock'])
  .build();
```

**2. Base + Variants:**
```typescript
const baseUser = new SchemaBuilder()
  .object()
  .properties({
    id: s => s.number(),
    email: s => s.string()
  })
  .required(['id', 'email'])
  .build();

const adminUser = new SchemaBuilder()
  .extend(baseUser)
  .properties({
    role: s => s.const('admin'),
    permissions: s => s.array().items(s => s.string())
  })
  .required(['role', 'permissions'])
  .build();

const regularUser = new SchemaBuilder()
  .extend(baseUser)
  .properties({
    role: s => s.const('user')
  })
  .required(['role'])
  .build();
```

**3. Incremental Building:**
```typescript
let schema = new SchemaBuilder().object();

// Add base fields
schema = new SchemaBuilder()
  .extend(schema)
  .properties({
    id: s => s.number(),
    name: s => s.string()
  });

// Add more fields conditionally
if (needsTimestamps) {
  schema = new SchemaBuilder()
    .extend(schema)
    .properties({
      createdAt: s => s.number(),
      updatedAt: s => s.number()
    });
}

const final = schema.build();
```

### Understanding Merge vs Replace Behavior

When you call `.extend()` and then add more schema keywords, `@jetio/schema-builder` follows specific rules about which keywords **merge** with the base schema and which **replace** it entirely.

**Keywords that MERGE (Additive):**

These keywords combine with existing values from the base schema:

1. **`properties`** - Object properties merge
2. **`patternProperties`** - Pattern-based properties merge
3. **`required`** - Required field arrays union together

```typescript
const baseSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number(),
    createdAt: (s) => s.number()
  })
  .required(['id'])
  .build();

const extendedSchema = new SchemaBuilder()
  .extend(baseSchema)
  .properties({
    name: (s) => s.string(),
    email: (s) => s.string()
  })
  .required(['name'])
  .build();

type Extended = Jet.Infer<typeof extendedSchema>;
/*
{
  id: number;           // From base (required)
  createdAt?: number;   // From base (optional)
  name: string;         // Added (required)
  email?: string;       // Added (optional)
}

Properties merged: id, createdAt, name, email
Required merged: ['id', 'name']
*/
```

**Keywords that REPLACE (Override):**

These keywords completely replace any existing values from the base schema:

- **Combinators**: `oneOf`, `anyOf`, `allOf`, `not`
- **Conditionals** `if`, `then`, `elseIf`, `then`
- **Literals**: `const`, `enum`
- **Array structure**: `items`, `prefixItems`, `additionalItems`, `unevaluatedItems`, `contains`
- **Object constraints**: `additionalProperties`, `unevaluatedProperties`
```typescript

const arrSchema = new SchemaBuilder()
  .array()
  .items((s) => s.string());

const arr2Schema = new SchemaBuilder()
  .extend(arrSchema)
  .items((s) => s.number())  // replaced with type number
  .build();

```
**Special Case (Types)**
```typescript
const stringSchema = new SchemaBuilder()
  .string()
  .minLength(5)
  .build();

const numberSchema = new SchemaBuilder()
  .extend(stringSchema)
  .number()  // you get string | number 
  // the assumption is that adding an extra types means multple type support
  .minimum(0)
  .build();

type Result = Jet.Infer<typeof numberSchema>;
// Result: number (NOT string NOT number, BUT string | number)

// The constraints apply to the invidual types.
```

**Why This Design?**

This behavior ensures:
1. **Predictable extension** - You can build on base schemas without conflicts
2. **Type extensibility** - Can add extra type support when needed
3. **Flexibility** - Can override base behavior when needed
```typescript
const baseConfig = new SchemaBuilder()
  .object()
  .properties({
    host: (s) => s.string(),
    port: (s) => s.number()
  })
  .required(['host'])
  .additionalProperties((s) => s.boolean())  // Extra props must be boolean
  .build();

const strictConfig = new SchemaBuilder()
  .extend(baseConfig)
  .properties({
    timeout: (s) => s.number()
  })
  .additionalProperties(false)  // REPLACES: Now no extra props allowed
  .build();

type StrictConfig = Jet.Infer<typeof strictConfig>;
/*
{
  host: string;      // From base (required)
  port?: number;     // From base (optional)
  timeout?: number;  // Added (optional)
}

Note: additionalProperties was REPLACED, not merged
New schema doesn't allow extra boolean properties
*/
```

### remove and optional

#### remove
The remove method is for removing fefined properties from `properties`, `required`, `patternProperties`, `dependencies`,`dependentRequired`.
It accepts an array of property names and an array of keyowrds to remove the properties from.

``` typescript

const logEntrySchema = new SchemaBuilder()
  .object()
  .properties({
    key: (s) => s.string(),
    value: (s) => s.string(),
  })
  .required(["key", "value"])
  .remove(["key", "value"], ["properties", "required"]) //Remove property key and value from properties and required.
  .build();

```
**default is ['properties']**
The remove method was included to give more control when extending schemas.
```typescript

const logEntrySchema = new SchemaBuilder()
  .object()
  .properties({
    key: (s) => s.string(),
    value: (s) => s.string(),
  })
  .required(["key", "value"])
  .build();

type LogEntry = Jet.Infer<typeof logEntrySchema>;
/**
{
    key: string;
    value: string;
}
**/

const schema2 = new SchemaBuilder()
  .extend(logEntrySchema)
  .properties({ jon: (s) => s.string() }) // merges jon with existing properties
  .required(["jon"]) // modifies existing required and includes jon
  .build();
type LogEntry2 = Jet.Infer<typeof schema2>;
// Merges new type with existing
/**
 {
    key: string;
    value: string;
    jon: string; 
}
**/

// Using .remove()
const schema3 = new SchemaBuilder()
  .extend(logEntrySchema)
  .properties({ jon: (s) => s.string() })
  .required(["jon"])
  .remove(["key"], ["required"]) // removes key from required array as well as from type
  .build();
type LogEntry3 = Jet.Infer<typeof schema3>;
// key is now optional
/**
 {
  value: string;
  jon: string;
  key?: string | undefined;
}
**/


const schema4 = new SchemaBuilder()
  .extend(logEntrySchema)
  .properties({ jon: (s) => s.string() })
  .required(["jon"])
  .remove(["key"], ["properties"]) // removes key from properties and type
  .build();
type LogEntry4 = Jet.Infer<typeof schema4>;
// property key is removed entirely
/**
 {
    value: string;
    jon: string;
}
**/

//Can also do multiple values and keywords
const schema2 = new SchemaBuilder()
  .extend(logEntrySchema)
  .properties({ jon: (s) => s.string() })
  .required(["jon"])
  .remove(["key", "jon"], ["properties", "required", "dependencies"])
  .build();

```

#### optional
The optional method serves one purpose, delete the required array.

```typescript

const logEntrySchema = new SchemaBuilder()
  .object()
  .properties({
    key: (s) => s.string(),
    value: (s) => s.string(),
  })
  .required(["key", "value"])
  .build();

type LogEntry = Jet.Infer<typeof logEntrySchema>;
/**
{
    key: string;
    value: string;
}
**/

const schema2 = new SchemaBuilder()
  .extend(logEntrySchema)
  .properties({ jon: (s) => s.string() })
  .optional()
  .build();
type LogEntry2 = Jet.Infer<typeof schema2>;
// All properties are now optional
/**
{
  key?: string | undefined;
  value?: string | undefined;
  jon?: string | undefined;
}
**/

```

These methods ensures maximum flexibility when extending schemas, giving near perfect control on what was extended, while also updating types as well.


#### Practical Examples

**Example 1: Building User Variants**
```typescript
// Base user with common fields
const baseUser = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.string(),
    email: (s) => s.string().format('email'),
    createdAt: (s) => s.number()
  })
  .required(['id', 'email'])
  .build();

// Admin user - MERGES properties and required
const adminUser = new SchemaBuilder()
  .extend(baseUser)
  .properties({
    role: (s) => s.const('admin'),
    permissions: (s) => s.array().items((s) => s.string())
  })
  .required(['role', 'permissions'])
  .build();

type AdminUser = Jet.Infer<typeof adminUser>;
/*
{
  id: string;              // From base (required)
  email: string;           // From base (required)
  role: 'admin';           // Added (required)
  permissions: string[];   // Added (required)
  createdAt?: number;      // From base (optional)
}

Required fields: ['id', 'email', 'role', 'permissions']
*/
```

**Example 2: Overriding Validation**
```typescript
// Loose validation
const loosePassword = new SchemaBuilder()
  .string()
  .minLength(6)
  .build();

// Strict validation - REPLACES all constraints
const strictPassword = new SchemaBuilder()
  .extend(loosePassword)
  .minLength(12)  // REPLACES minLength: 6
  .pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$')  // Adds pattern
  .build();

type StrictPassword = Jet.Infer<typeof strictPassword>;
// Result: string (with minLength: 12 and pattern at runtime)
```

**Example 3: Combining Merge and Replace**
```typescript
const baseProduct = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.string(),
    name: (s) => s.string()
  })
  .required(['id'])
  .oneOf(
    (s) => s.object().properties({ type: (s) => s.const('digital') }),
    (s) => s.object().properties({ type: (s) => s.const('physical') })
  )
  .build();

const extendedProduct = new SchemaBuilder()
  .extend(baseProduct)
  .properties({
    price: (s) => s.number()  // MERGES with properties
  })
  .required(['price'])  // MERGES with required
  .oneOf(  // REPLACES oneOf entirely
    (s) => s.object().properties({ category: (s) => s.const('electronics') }),
    (s) => s.object().properties({ category: (s) => s.const('clothing') })
  )
  .build();

type ExtendedProduct = Jet.Infer<typeof extendedProduct>;
/*
{
  id: string;      // From base
  name?: string;   // From base
  price: number;   // Added
  category: 'electronics' | 'clothing';  // From NEW oneOf
}

Note: The original oneOf (digital/physical) was REPLACED
Only the new oneOf (electronics/clothing) applies
*/
```

---

## 🎨 Advanced Examples

### E-Commerce Product Catalog

```typescript
const productSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.string().format('uuid'),
    sku: (s) => s.string(),
    name: (s) => s.string().minLength(1).maxLength(200),
    description: (s) => s.string(),
    price: (s) => s.object()
      .properties({
        amount: (s) => s.number().minimum(0),
        currency: (s) => s.enum(['USD', 'EUR', 'GBP', 'JPY'])
      })
      .required(['amount', 'currency']),
    category: (s) => s.enum(['electronics', 'clothing', 'food', 'books', 'toys']),
    tags: (s) => s.array()
      .items((s) => s.string())
      .uniqueItems(true),
    inStock: (s) => s.boolean(),
    inventory: (s) => s.object()
      .properties({
        quantity: (s) => s.number().integer().minimum(0),
        warehouse: (s) => s.string(),
        lastRestocked: (s) => s.number()
      })
      .required(['quantity']),
    images: (s) => s.array()
      .items((s) => s.object()
        .properties({
          url: (s) => s.string().format('uri'),
          alt: (s) => s.string(),
          isPrimary: (s) => s.boolean()
        })
        .required(['url'])
      ),
    specifications: (s) => s.object()
      .patternProperties({
        "^spec_": (s) => s.string()
      }),
    reviews: (s) => s.array()
      .items((s) => s.object()
        .properties({
          rating: (s) => s.number().minimum(1).maximum(5),
          comment: (s) => s.string(),
          author: (s) => s.string(),
          date: (s) => s.number()
        })
        .required(['rating', 'author'])
      )
  })
  .required(['id', 'sku', 'name', 'price', 'category', 'inStock'])
  .if((s) => s.object().properties({
    category: (s) => s.const('electronics')
  }))
  .then((s) => s.object()
    .properties({
      warranty: (s) => s.object()
        .properties({
          duration: (s) => s.number(),
          type: (s) => s.enum(['manufacturer', 'extended'])
        })
        .required(['duration', 'type']),
      powerSpecs: (s) => s.object()
        .properties({
          voltage: (s) => s.string(),
          wattage: (s) => s.number()
        })
    })
    .required(['warranty'])
  )
  .elseIf((s) => s.object().properties({
    category: (s) => s.const('clothing')
  }))
  .then((s) => s.object()
    .properties({
      sizes: (s) => s.array()
        .items((s) => s.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']))
        .minItems(1),
      colors: (s) => s.array()
        .items((s) => s.string())
        .minItems(1),
      material: (s) => s.string()
    })
    .required(['sizes', 'colors'])
  )
  .end()
  .build();

type Product = Jet.Infer<typeof productSchema>;
// Full type with conditional branches for electronics vs clothing vs other categories
```

---

### Important
If const or enum is `$data` the type will always be any since runtime value is unknown.

## 💡 Best Practices

### 1. No Need for `as const`

Unlike other libraries, **`@jetio/schema-builder` automatically infers literal types** from enum and const values:

```typescript
// ✅ `@jetio/schema-builder` - Just works!
const statusSchema = new SchemaBuilder()
  .enum(['active', 'inactive', 'pending'])
  .build();

type Status = Jet.Infer<typeof statusSchema>;
// Result: 'active' | 'inactive' | 'pending' ✅

const userTypeSchema = new SchemaBuilder()
  .const('admin')
  .build();

type UserType = Jet.Infer<typeof userTypeSchema>;
// Result: 'admin' ✅

// This careful type system design is part of what makes `@jetio/schema-builder` special
```

### 2. Combine Runtime Validation with Type Checking

```typescript
const userSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number().integer().minimum(1),
    email: (s) => s.string().format('email'),
    age: (s) => s.number().integer().minimum(13).maximum(120)
  })
  .required(['id', 'email'])
  .build();

type User = Jet.Infer<typeof userSchema>;

const validator = new JetValidator();
const validate = validator.compile(userSchema);

// Type-safe AND runtime-validated
const processUser = (data: unknown) => {
  if (validate(data)) {
    // data is now validated at runtime AND typed as User
    const user = data as User;
    
    console.log(`Processing user ${user.id}`);
    console.log(`Email: ${user.email}`);
    
    if (user.age) {
      console.log(`Age: ${user.age}`);
    }
  } else {
    console.error('Invalid user data:', validate.errors);
  }
};
```

### 3. Leverage Multiple Keyword Evaluation

```typescript
// ✅ GOOD - Use all the keywords together
const schema = new SchemaBuilder()
  .object()
  .properties({ /* base props */ })
  .allOf(/* shared constraints */)
  .oneOf(/* variants */)
  .if(/* condition */).then(/* extra requirements */)
  .patternProperties({ /* dynamic props */ })
  .build();

// TypeScript understands ALL of it simultaneously!
```
## The Vision Behind Jet.Infer

The goal was to provide a solution that everyone needs which is  spec-compliant type inference. What started as a simple idea became complex really fast. 

A lot of thought went into this to provide the ultimate toolkit, the fastest schema validator, the best schema builder, and the most accurate spec-compliant type inference out there though not perfect. Trying to achieve 1:1 JSON Schema compliance in the TypeScript type system was no joke.

Rigorous testing has been done, including deep nesting and complex conditionals. If you encounter any bugs, please submit an issue so we can make the tool better for everyone. We plan to support even more keywords in the future and keep fine-tuning the experience. With Jetio tools, you have everything you need for validation.

## Feedback & Contributions

Found a type inference issue or have suggestions?

- 📝 [Open an issue](https://github.com/official-jetio/schema-builder/schema-builder/issues)
- 🔧 [Submit a PR](https://github.com/official-jetio/schema-builder/schema-builder/pulls)
- 💬 [Join discussions](https://github.com/official-jetio/schema-builder/schema-builder/discussions)
- 📚 [Read the docs]()
- 🐦 [Follow updates on Twitter](https://twitter.com/venerablesuprem)

**Contributing:**

We welcome contributions! If you've found a type inference edge case or want to add support for more JSON Schema features, please:

1. Check existing issues to avoid duplicates
2. Provide a minimal reproduction case
3. Include the expected vs actual TypeScript types
4. Test your changes with the provided test suite

---

## 📄 License

MIT © [`@jetio/schema-builder`](./LICENSE)

---

**Built with ❤️ for developers who demand JSON Schema compliance, type safety, and blazing performance.**

The Great Venerable❤️