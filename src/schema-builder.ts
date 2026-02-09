import { SchemaDefinition, BaseType, $data } from "@jetio/validator";
import { ArraySchemaBuilder } from "./types/array-schema";
import { ConditionBuilder } from "./condition-builder";
import { StringSchemaBuilder } from "./types/string-schema";
import { ObjectSchemaBuilder } from "./types/object-schema";
import { NumberSchemaBuilder } from "./types/number-schema";
import * as fs from "fs/promises";
import { BaseSchemaBuilder, BuilderSchema } from "./types/base-schema";
import { BooleanSchema, NullSchema } from "./types/general";
import { RefBuilder } from "./ref-builder";
import { AddType, ResolveBuildType, Simplify } from "./types/helpers";

export class SchemaBuilder<
  S extends object = {},
> implements BaseSchemaBuilder<S> {
  protected schema: any = {};

  constructor(initialSchema?: S) {
    if (initialSchema) this.schema = initialSchema;
  }

  private addType(type: BaseType): void {
    const s = this.schema as any;
    if (!s.type) {
      s.type = type;
    } else if (Array.isArray(s.type)) {
      if (!s.type.includes(type)) s.type.push(type);
    } else {
      if (s.type !== type) s.type = [s.type, type];
    }
  }

  //#region Base region
  $schema<B extends string>(v: B): SchemaBuilder<S> {
    (this.schema as any).$schema = v;
    return this as any;
  }
  $id<B extends string>(v: B): SchemaBuilder<S> {
    (this.schema as any).$id = v;
    return this as any;
  }
  $anchor<B extends string>(v: B): SchemaBuilder<S> {
    (this.schema as any).$anchor = v;
    return this as any;
  }
  $dynamicAnchor<B extends string>(val: B): SchemaBuilder<S> {
    (this.schema as any).$dynamicAnchor = val;
    return this as any;
  }
  title<B extends string>(v: B): SchemaBuilder<S> {
    (this.schema as any).title = v;
    return this as any;
  }
  description<B extends string>(v: B): SchemaBuilder<S> {
    (this.schema as any).description = v;
    return this as any;
  }
  default<B>(v: B): SchemaBuilder<S> {
    (this.schema as any).default = v;
    return this as any;
  }

  examples(ex: any): SchemaBuilder<S> {
    (this.schema as any).examples = ex;
    return this as any;
  }

  readOnly(): SchemaBuilder<S> {
    this.schema.readOnly = true;
    return this as any;
  }

  writeOnly(): SchemaBuilder<S> {
    this.schema.writeOnly = true;
    return this as any;
  }

  $ref<B extends string | RefBuilder | ((r: RefBuilder) => RefBuilder)>(
    builder: B,
  ): SchemaBuilder<Simplify<S & { $ref: string }>> {
    (this.schema as any).$ref =
      typeof builder === "string"
        ? builder
        : builder instanceof RefBuilder
          ? builder.build()
          : builder(new RefBuilder()).build();
    return this as any;
  }

  $dynamicRef<B extends string | RefBuilder | ((r: RefBuilder) => RefBuilder)>(
    builder: B,
  ): SchemaBuilder<S> {
    (this.schema as any).$dynamicRef =
      typeof builder === "string"
        ? builder
        : builder instanceof RefBuilder
          ? builder.build()
          : builder(new RefBuilder()).build();
    return this as any;
  }

  $defs<
    B extends Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  >(defs: B): SchemaBuilder<S> {
    if (!(this.schema as any).$defs) (this.schema as any).$defs = {};
    Object.entries(defs).forEach(([prop, schema]) => {
      (this.schema as any).$defs[prop] =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    });
    return this as any;
  }

  definitions<
    B extends Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  >(defs: B): SchemaBuilder<S> {
    if (!(this.schema as any).definitions)
      (this.schema as any).definitions = {};
    Object.entries(defs).forEach(([prop, schema]) => {
      (this.schema as any).definitions[prop] =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    });
    return this as any;
  }

  anyOf<T extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[]>(
    ...schemas: T
  ): SchemaBuilder<Simplify<Omit<S, "anyOf"> & { anyOf: T }>> {
    (this.schema as any).anyOf = schemas.map((s) =>
      typeof s === "function"
        ? s(new SchemaBuilder()).build()
        : s instanceof SchemaBuilder
          ? s.build()
          : s,
    );
    return this as any;
  }

  allOf<T extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[]>(
    ...schemas: T
  ): SchemaBuilder<Simplify<Omit<S, "allOf"> & { allOf: T }>> {
    (this.schema as any).allOf = schemas.map((s) =>
      typeof s === "function"
        ? s(new SchemaBuilder()).build()
        : s instanceof SchemaBuilder
          ? s.build()
          : s,
    );
    return this as any;
  }

  oneOf<T extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[]>(
    ...schemas: T
  ): SchemaBuilder<
    Simplify<Omit<S, "oneOf"> & { oneOf: { [K in keyof T]: T[K] } }>
  > {
    (this.schema as any).oneOf = schemas.map((s) =>
      typeof s === "function"
        ? s(new SchemaBuilder()).build()
        : s instanceof SchemaBuilder
          ? s.build()
          : s,
    );
    return this as any;
  }

  not<B extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder)>(
    schema: B,
  ): SchemaBuilder<S> {
    (this.schema as any).not =
      typeof schema === "function"
        ? schema(new SchemaBuilder()).build()
        : schema instanceof SchemaBuilder
          ? schema.build()
          : schema;
    return this as any;
  }

  if<B extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder)>(
    condition: B,
  ): ConditionBuilder<
    Omit<S, "if" | "then" | "elseIf" | "else"> & { if: B },
    SchemaBuilder<S>,
    B
  > {
    const resolved =
      typeof condition === "function"
        ? condition(new SchemaBuilder()).build()
        : condition instanceof SchemaBuilder
          ? condition.build()
          : condition;
    return new ConditionBuilder(this, resolved) as any;
  }

  enum<const B extends any[] | $data>(
    values: B,
  ): SchemaBuilder<Simplify<Omit<S, "enum"> & { enum: B }>> {
    (this.schema as any).enum = values;
    return this as any;
  }

  const<const B extends any | $data>(
    value: B,
  ): SchemaBuilder<Simplify<Omit<S, "const"> & { const: B }>> {
    (this.schema as any).const = value;
    return this as any;
  }

  boolean(): BooleanSchema<AddType<S, "boolean">> {
    this.addType("boolean");
    return this as any;
  }

  null(): NullSchema<AddType<S, "null">> {
    this.addType("null");
    return this as any;
  }
  //#endregion

  //#region String region
  string(): StringSchemaBuilder<AddType<S, "string">> {
    type b = S;
    this.addType("string");
    return this as any;
  }

  minLength(len: number | $data): SchemaBuilder<S> {
    (this.schema as any).minLength = len;
    return this as any;
  }
  maxLength(len: number | $data): SchemaBuilder<S> {
    (this.schema as any).maxLength = len;
    return this as any;
  }
  pattern(re: string | RegExp | $data): SchemaBuilder<S> {
    (this.schema as any).pattern = re instanceof RegExp ? re.source : re;
    return this as any;
  }
  format(f: string | $data): SchemaBuilder<S> {
    (this.schema as any).format = f;
    return this as any;
  }

  //#endregion

  //#region Number region

  number(): NumberSchemaBuilder<AddType<S, "number">> {
    this.addType("number");
    return this as any;
  }

  integer(): NumberSchemaBuilder<AddType<S, "integer">> {
    this.addType("integer");
    return this as any;
  }

  minimum(v: number | $data): SchemaBuilder<S> {
    (this.schema as any).minimum = v;
    return this as any;
  }
  maximum(v: number | $data): SchemaBuilder<S> {
    (this.schema as any).maximum = v;
    return this as any;
  }
  exclusiveMinimum(v: number | $data): SchemaBuilder<S> {
    (this.schema as any).exclusiveMinimum = v;
    return this as any;
  }
  exclusiveMaximum(v: number | $data): SchemaBuilder<S> {
    (this.schema as any).exclusiveMaximum = v;
    return this as any;
  }
  multipleOf(v: number | $data): SchemaBuilder<S> {
    (this.schema as any).multipleOf = v;
    return this as any;
  }

  positive(): SchemaBuilder<S> {
    return this.minimum(0);
  }

  negative(): SchemaBuilder<S> {
    return this.maximum(0);
  }

  range(min: number | $data, max: number | $data): SchemaBuilder<S> {
    return this.minimum(min).maximum(max);
  }

  //#endregion

  //#region Object region

  object(): ObjectSchemaBuilder<AddType<S, "object">> {
    this.addType("object");
    return this as any;
  }

  properties<
    const P extends Record<
      string,
      BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder)
    >,
  >(
    props: P,
  ): SchemaBuilder<
    Simplify<
      Omit<S, "properties"> & {
        properties: S extends { properties: infer Existing }
          ? Simplify<Existing & P>
          : P;
      }
    >
  > {
    if (!(this.schema as any).properties) (this.schema as any).properties = {};
    Object.entries(props).forEach(([k, v]) => {
      (this.schema as any).properties[k] =
        typeof v === "function"
          ? v(new SchemaBuilder()).build()
          : v instanceof SchemaBuilder
            ? v.build()
            : v;
    });
    return this as any;
  }

  required<const R extends string[] | $data>(
    fields: R,
  ): SchemaBuilder<
    Simplify<
      Omit<S, "required"> & {
        required: S extends {
          required: infer Existing extends readonly string[];
        }
          ? R extends string[]
            ? [...Existing, ...R]
            : Existing
          : R;
      }
    >
  > {
    (this.schema as any).required = Array.isArray(fields)
      ? [
          ...(Array.isArray((this.schema as any).required)
            ? (this.schema as any).required
            : []),
          ...fields,
        ]
      : fields;
    return this as any;
  }

  minProperties(min: number | $data): SchemaBuilder<S> {
    (this.schema as any).minProperties = min;
    return this;
  }

  maxProperties(max: number | $data): SchemaBuilder<S> {
    (this.schema as any).maxProperties = max;
    return this;
  }

  patternProperties<
    const P extends Record<
      string,
      BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder)
    >,
  >(p: P) {
    if (!(this.schema as any).patternProperties)
      (this.schema as any).patternProperties = {};
    Object.entries(p).forEach(([k, v]) => {
      (this.schema as any).patternProperties[k] =
        typeof v === "function"
          ? v(new SchemaBuilder()).build()
          : v instanceof SchemaBuilder
            ? v.build()
            : v;
    });
    return this as any as SchemaBuilder<
      Simplify<
        Omit<S, "patternProperties"> & {
          patternProperties: S extends { patternProperties: infer Existing }
            ? Simplify<Existing & P>
            : P;
        }
      >
    >;
  }

  propertyNames<
    const P extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(v: P) {
    (this.schema as any).propertyNames =
      typeof v === "function"
        ? v(new SchemaBuilder()).build()
        : v instanceof SchemaBuilder
          ? v.build()
          : v;
    return this as any as SchemaBuilder<S>;
  }

  dependentRequired<const P extends Record<string, string[]>>(d: P) {
    (this.schema as any).dependentRequired = d;
    return this as any as SchemaBuilder<S>;
  }

  dependentSchemas<
    const P extends Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  >(d: P) {
    if (!(this.schema as any).dependentSchemas)
      (this.schema as any).dependentSchemas = {};
    Object.entries(d).forEach(([k, v]) => {
      (this.schema as any).dependentSchemas[k] =
        typeof v === "function"
          ? v(new SchemaBuilder()).build()
          : v instanceof SchemaBuilder
            ? v.build()
            : v;
    });
    return this as any as SchemaBuilder<S>;
  }

  dependencies<
    const P extends Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder) | string[]
    >,
  >(d: P) {
    if (!(this.schema as any).dependencies)
      (this.schema as any).dependencies = {};
    Object.entries(d).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        (this.schema as any).dependencies[k] = v;
      } else {
        (this.schema as any).dependencies[k] =
          typeof v === "function"
            ? v(new SchemaBuilder()).build()
            : v instanceof SchemaBuilder
              ? v.build()
              : v;
      }
    });
    return this as any as SchemaBuilder<S>;
  }

  additionalProperties<
    const P extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(v: P) {
    (this.schema as any).additionalProperties =
      typeof v === "function"
        ? v(new SchemaBuilder()).build()
        : v instanceof SchemaBuilder
          ? v.build()
          : v;
    return this as any as SchemaBuilder<
      Simplify<
        Omit<S, "additionalProperties"> & {
          additionalProperties: P;
        }
      >
    >;
  }

  unevaluatedProperties<
    const P extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(v: P) {
    (this.schema as any).unevaluatedProperties =
      typeof v === "function"
        ? v(new SchemaBuilder()).build()
        : v instanceof SchemaBuilder
          ? v.build()
          : v;
    return this as any as SchemaBuilder<
      Simplify<
        Omit<S, "unevaluatedProperties"> & {
          unevaluatedProperties: P;
        }
      >
    >;
  }

  //#endregion

  //#region Array region

  array(): ArraySchemaBuilder<AddType<S, "array">> {
    this.addType("array");
    return this as any;
  }

  minItems(v: number | $data): SchemaBuilder<S> {
    (this.schema as any).minItems = v;
    return this as any;
  }
  maxItems(v: number | $data): SchemaBuilder<S> {
    (this.schema as any).maxItems = v;
    return this as any;
  }
  uniqueItems(v: boolean | $data): SchemaBuilder<S> {
    (this.schema as any).uniqueItems = v;
    return this as any;
  }

  minContains(v: number | $data): SchemaBuilder<S> {
    (this.schema as any).minContains = v;
    return this as any;
  }
  maxContains(v: number | $data): SchemaBuilder<S> {
    (this.schema as any).maxContains = v;
    return this as any;
  }

  contains<
    const I extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(val: I): SchemaBuilder<S> {
    (this.schema as any).contains =
      typeof val === "function"
        ? val(new SchemaBuilder()).build()
        : val instanceof SchemaBuilder
          ? val.build()
          : val;
    return this as any;
  }

  prefixItems<
    const I extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[],
  >(...v: I) {
    (this.schema as any).prefixItems = v.map((x) =>
      typeof x === "function"
        ? x(new SchemaBuilder()).build()
        : x instanceof SchemaBuilder
          ? x.build()
          : x,
    );
    return this as any as SchemaBuilder<
      Simplify<
        Omit<S, "prefixItems"> & {
          prefixItems: I;
        }
      >
    >;
  }

  items<
    const I extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[],
  >(
    ...val: I
  ): SchemaBuilder<
    Simplify<
      Omit<S, "items"> & {
        items: I extends [infer Single] ? Single : I;
      }
    >
  > {
    if (val.length === 1) {
      const single = val[0];
      (this.schema as any).items =
        typeof single === "function"
          ? single(new SchemaBuilder()).build()
          : single instanceof SchemaBuilder
            ? single.build()
            : single;
    } else {
      (this.schema as any).items = val.map((s) =>
        typeof s === "function"
          ? s(new SchemaBuilder()).build()
          : s instanceof SchemaBuilder
            ? s.build()
            : s,
      );
    }
    return this as any;
  }

  additionalItems<
    const I extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(v: I) {
    (this.schema as any).additionalItems =
      typeof v === "function"
        ? v(new SchemaBuilder()).build()
        : v instanceof SchemaBuilder
          ? v.build()
          : v;
    return this as any as SchemaBuilder<
      Simplify<Omit<S, "additionalItems"> & { additionalItems: I }>
    >;
  }

  unevaluatedItems<
    const I extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(v: I) {
    (this.schema as any).unevaluatedItems =
      typeof v === "function"
        ? v(new SchemaBuilder()).build()
        : v instanceof SchemaBuilder
          ? v.build()
          : v;
    return this as any as SchemaBuilder<
      Simplify<Omit<S, "unevaluatedItems"> & { unevaluatedItems: I }>
    >;
  }

  remove<
    const Fields extends readonly string[],
    Additional extends (
      | "properties"
      | "required"
      | "patternProperties"
      | "dependencies"
      | "dependentRequired"
    )[] = ["properties"],
  >(
    properties: Fields,
    additional: Additional = ["properties"] as Additional,
  ): SchemaBuilder<
    Simplify<{
      [K in keyof S]: K extends "properties"
        ? "properties" extends Additional[number]
          ? S[K] extends Record<string, any>
            ? Omit<S[K], Fields[number]>
            : S[K]
          : S[K]
        : K extends "patternProperties"
          ? "patternProperties" extends Additional[number]
            ? S[K] extends Record<string, any>
              ? Omit<S[K], Fields[number]>
              : S[K]
            : S[K]
          : K extends "required"
            ? "required" extends Additional[number]
              ? S[K] extends readonly (infer R)[]
                ? Exclude<R, Fields[number]>[]
                : S[K]
              : S[K]
            : K extends "dependencies"
              ? "dependencies" extends Additional[number]
                ? S[K] extends Record<string, any>
                  ? Omit<S[K], Fields[number]>
                  : S[K]
                : S[K]
              : K extends "dependentRequired"
                ? "dependentRequired" extends Additional[number]
                  ? S[K] extends Record<string, any>
                    ? Omit<S[K], Fields[number]>
                    : S[K]
                  : S[K]
                : S[K];
    }>
  > {
    const fields = new Set(properties);
    const removeProperties = additional.includes("properties");
    const removeRequired = additional.includes("required");
    const removePattern = additional.includes("patternProperties");
    const removeDeps = additional.includes("dependencies");
    const removeDepReq = additional.includes("dependentRequired");

    for (const field of fields) {
      if (removeProperties && this.schema.properties) {
        delete this.schema.properties[field];
      }

      if (removePattern && this.schema.patternProperties) {
        delete this.schema.patternProperties[field];
      }

      if (removeDeps) {
        if (this.schema.dependencies) delete this.schema.dependencies[field];
        if (this.schema.dependentSchemas)
          delete this.schema.dependentSchemas[field];
      }

      if (removeDepReq && this.schema.dependentRequired) {
        delete this.schema.dependentRequired[field];
      }

      if (removeRequired && Array.isArray(this.schema.required)) {
        const index = this.schema.required.indexOf(field);
        if (index !== -1) {
          this.schema.required.splice(index, 1);
        }
      }
    }

    return this as any;
  }

  optional(): SchemaBuilder<Simplify<Omit<S, "required">>> {
    delete this.schema.required;
    return this as any;
  }

  //#endregion

  //#region  Helpers region
  async url(url: string): Promise<SchemaBuilder<any>> {
    const response = await fetch(url);
    this.schema = await response.json();
    return this as any;
  }

  async file(filePath: string): Promise<SchemaBuilder<any>> {
    const fileContent = await fs.readFile(filePath, "utf-8");
    this.schema = JSON.parse(fileContent);
    return this as any;
  }

  json<const T extends SchemaDefinition>(
    jsonSchema: T | string,
  ): SchemaBuilder<Simplify<S & T>> {
    this.schema =
      typeof jsonSchema === "string" ? JSON.parse(jsonSchema) : jsonSchema;
    return this as any;
  }

  errorMessage(
    message: string | Record<string, string | Record<string, string>>,
  ): SchemaBuilder<S> {
    (this.schema as any).errorMessage = message;
    return this;
  }

  option(key: string, value: any): SchemaBuilder<S> {
    (this.schema as any)[key] = value;
    return this as any;
  }

  extend<const B extends BuilderSchema>(v: B): SchemaBuilder<Simplify<S & B>> {
    const schema = v instanceof SchemaBuilder ? v.build() : structuredClone(v);
    this.schema = { ...this.schema, ...schema };
    return this as any;
  }

  build(): ResolveBuildType<S> {
    return structuredClone(this.schema);
  }
  //#endregion
}
