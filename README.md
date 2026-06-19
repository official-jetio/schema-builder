# 📐 Schema Builder Guide

>Write compliant JSON Schema **fluently**. Get TypeScript types that mirrors runtime expectations and a runtime validator from the same line of code - no second install, no `as const`.

Most schema tools make you pick a lane: a builder *or* a validator *or* type inference. `@jetio/schema-builder` gives you all three from one `.build()`  and it's actual JSON Schema (Draft 06 → 2020-12), not a lookalike DSL. So you can finally write JSON Schema without it feeling like filling out a tax form.

The Schema Builder provides a fluent, type-safe API for constructing JSON Schemas programmatically. Build complex schemas with autocomplete, validation, and zero boilerplate and get automatic type inference.

> **Note:** This package includes [@jetio/validator](https://github.com/official-jetio/validator) as a dependency. You get both the builder AND a very fast JSON Schema validator in one install.

> **Important:** Jetio/schema-builder is a **JSON Schema spec-compliant** tool built on top of [@jetio/validator](https://github.com/official-jetio/validator). To utilize it to its fullest potential, it's essential to understand the main validator package. All core documentation about validation rules, error handling, $data references, and advanced features can be found in the [Validator Documentation](https://jet-validator-docs.vercel.app/).

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

## Type Inference

JetIO Schema Builder includes **Json Schema spec compliant automatic TypeScript type inference** through `Jet.Infer<>`. Write your schema once and get both runtime validation AND compile-time types!

```typescript
import { SchemaBuilder, Jet } from "@jetio/schema-builder";

const userSchema = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number(),
    name: (s) => s.string(),
    email: (s) => s.string().format('email')
  })
  .required(['id', 'name', 'email'])
  .build();

// Automatically infer TypeScript type from schema
type User = Jet.Infer<typeof userSchema>;
/*
{
  id: number;
  name: string;
  email: string;
}
*/

// Type-safe usage
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
}; // ✅
const validate = new JetValidator().compile(userSchema);
validate(user); // true
const invalidUser: User = {
  id: 1,
  name: "Bob"
  // ❌ TypeScript Error: Property 'email' is missing
};
```
One schema. A real type. A compiled validator. They can never fall out of sync.

---

## What you can't do anywhere else

### `oneOf` is *actually* exclusive

Every other library hands you `A | B` and lets you mix fields from both branches. We mark the other branch's keys as `never` automatically — a true discriminated union with **no `kind` tag required**.

```typescript
const paymentSchema = new SchemaBuilder()
  .oneOf(
    (s) => 
      s.object().properties(
        { card: (s) => s.string() }
      )
      .required(["card"]),
    (s) => 
      s.object().properties(
        { paypal: (s) => s.string() }
      )
      .required(["paypal"]),
  )
  .build();

type Payment = Jet.Infer<typeof paymentSchema>;
// {
//   readonly card: string;
//    paypal?: undefined;
// } | {
//    readonly paypal: string;
//    card?: undefined;
// }
const ok: Payment = { card: "4242…" };                     // ✅
const bad: Payment = { card: "4242…", paypal: "a@b.com" }; // ❌ can't mix branches
```

### `if` / `then` / `elseIf` / `else` inferred

Conditional types from conditional schemas. We push TypeScript to its limit to type the full chain including `elseIf`, which **no other TS schema library supports**.

```typescript
const accountSchema = new SchemaBuilder()
  .object()
  .properties({
    accountType: (s) => s.string(),
    username: (s) => s.string(),
    companyName: (s) => s.string(),
    email: (s) => s.string().format("email"),
  })
  .required(["accountType", "email"])
  .if((s) =>
    s.object().properties({
      accountType: (s) => s.const("personal"),
    }),
  )
  .then((s) => s.object().required(["username"]))
  .elseIf((s) =>
    s.object().properties({
      accountType: (s) => s.const("business"),
    }),
  )
  .then((s) => s.object().required(["companyName"]))
  .end()
  .build();

type Account = Jet.Infer<typeof accountSchema>;
// {
//    accountType: "personal";
//    username: string;
//    email: string;
//    companyName?: string | undefined;
// } | {
//    accountType: "business";
//    companyName: string;
//    email: string;
//    username?: string | undefined;
// } | {
//    accountType: string;
//    email: string;
//    username?: string | undefined;
//    companyName?: string | undefined;
// }

const validate = new JetValidator({ allErrors: true }).compile(accountSchema);

validate({ accountType: "personal", email: "a@b.com", username: "alice" }); // true
validate({ accountType: "personal", email: "a@b.com" });                    // false
```
**Your types mirror runtime expectations**

That one schema object gave you the **JSON Schema**, the **type**, and the **validation** all enforcing the exact same rules.

There are many more keywords as well, from `anyOf`, `allOf`, `prefixItems` and so on, check the [docs](https://jet-schema-docs.vercel.app) for all.

---

## Schema reuse that types itself

Build a base schema once and `.extend()` it into variants.
admin from user, strict from loose. `properties` and `required` merge; everything else overrides; and `Jet.Infer<>` tracks every change.
>Where `$ref` leaves you with `unknown`, `.extend()` keeps full inference.

```typescript
const baseUser = new SchemaBuilder()
  .object()
  .properties({
    id: (s) => s.number(),
    email: (s) => s.string().format("email"),
  })
  .required(["id", "email"])
  .build();

const adminUser = new SchemaBuilder()
  .extend(baseUser)
  .properties({
    role: (s) => s.const("admin"),
    permissions: (s) => s.array().items((s) => s.string()),
  })
  .required(["role", "permissions"])
  .build();

type AdminUser = Jet.Infer<typeof adminUser>;
// {
//   id: number;            ← from base
//   email: string;         ← from base
//   role: "admin";
//   permissions: string[];
// }
```

Trim with `.remove()`, loosen with `.optional()`, compose traits with `allOf` all without writing a single interface by hand.

## Why teams pick it

- **Validator included.** Bundled with [@jetio/validator](https://www.npmjs.com/package/@jetio/validator) compiles schema to functions, very fast.
- **Spec-compliant inference.** Types *behave* like JSON Schema, not just resemble it. If the validator rejects it, TypeScript rejects it too.
- **Full draft coverage.** `unevaluatedProperties`, `prefixItems`, `$dynamicRef`, `dependentRequired`, `patternProperties` → template-literal keys, and more (draft 06 → 2020-12).
- **No `as const`.** Literals from `.enum()` and `.const()` are inferred for you.
- **Built to work together, not bolted together.** The builder, validator, and inference weren't three projects stitched into one, they were designed as a single system from day one. No adapter layers, no glue, no impedance mismatch.
- **Mix builder and raw JSON** freely paste existing schemas, build the rest.

```typescript
import { SchemaBuilder, Jet } from "@jetio/schema-builder";

const productSchema = new SchemaBuilder()
  .object()
  .properties({
    // Builder syntax — fluent, type-inferred
    id: (s) => s.string().format("uuid"),
    name: (s) => s.string().minLength(1),

    // Raw JSON Schema — paste what you already have
    price: { type: "number", minimum: 0 },

    // Mix both inside the same property
    dimensions: (s) =>
      s.object().properties({
        width: { type: "number" },
        height: (s) => s.number(),
      }),
  })
  .required(["id", "name", "price"])
  .build();

type Product = Jet.Infer<typeof productSchema>;
// {
//   id: string;
//   name: string;
//   price: number;
//   dimensions?: { width?: number; height?: number };
// }
```
## 🚀 Try it live

**No install**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/vitejs-vite-maszqpnk?file=src%2Fmain.ts)

## Documentation

##### The full builder guide, the type-inference deep dive, and the complete API reference live here: **[docs link](https://jet-schema-docs.vercel.app)**
##### For complete type inference documentation, see **[Type Inference Guide](https://jet-schema-docs.vercel.app/type-inference)**

**Topics covered in the Type Inference guide:**
- Primitives, objects, arrays, and their type inference
- Pattern properties with template literal types
- Multiple types and union inference
- Discriminated unions with oneOf/anyOf
- Conditional type inference (if/then/else/elseIf)
- Complex compositions with allOf
- Required vs optional property splitting
- Type inference limitations and workarounds
-addtionalItems/Properties, unevaluatedProperties/Items, patternProperties.

##### @jetio/validator documentation at [docs](https://jet-validator-docs.vercel.app)

## 📄 License

MIT © [Great Venerable](https://github.com/greatvenerable)

---

## 🔗 Links

- **[npm Package](https://www.npmjs.com/package/@jetio/schema-builder)**
- **[GitHub Repository](https://github.com/official-jetio/schema-builder)**
- **[Complete Documentation](https://jet-schema-docs.vercel.app)**
- **[Issue Tracker](https://github.com/official-jetio/schema-builder/issues)**
- **[GitHub Discussions](https://github.com/official-jetio/schema-builder/discussions)**

---

**Built with ❤️ by [The Venerable Supreme](https://github.com/greatvenerable)**

---
