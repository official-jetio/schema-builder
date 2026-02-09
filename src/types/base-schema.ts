import { SchemaBuilder } from "../schema-builder";
import { ConditionBuilder } from "../condition-builder";
import { $data, SchemaDefinition } from "@jetio/validator";
import { ResolveBuildType, Simplify } from "./helpers";
import { RefBuilder } from "../ref-builder";

export interface BaseSchemaBuilder<S extends object> {
  $schema<B extends string>(val: B): SchemaBuilder<S>;
  $id<B extends string>(val: B): SchemaBuilder<S>;
  $anchor<B extends string>(val: B): SchemaBuilder<S>;
  $dynamicAnchor<B extends string>(val: B): SchemaBuilder<S>;

  $ref<B extends string | RefBuilder | ((r: RefBuilder) => RefBuilder)>(
    builder: B,
  ): SchemaBuilder<S>;
  $dynamicRef<B extends string | RefBuilder | ((r: RefBuilder) => RefBuilder)>(
    builder: B,
  ): SchemaBuilder<S>;

  $defs<
    B extends Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  >(
    defs: B,
  ): SchemaBuilder<S>;

  definitions<
    B extends Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  >(
    defs: B,
  ): SchemaBuilder<S>;

  anyOf<T extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[]>(
    ...schemas: T
  ): SchemaBuilder<Simplify<Omit<S, "anyOf"> & { anyOf: T }>>;

  allOf<T extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[]>(
    ...schemas: T
  ): SchemaBuilder<Simplify<Omit<S, "allOf"> & { allOf: T }>>;

  oneOf<T extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[]>(
    ...schemas: T
  ): SchemaBuilder<Simplify<Omit<S, "oneOf"> & { oneOf: T }>>;

  not<B extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder)>(
    schema: B,
  ): SchemaBuilder<S>;

  if<B extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder)>(
    condition: B,
  ): ConditionBuilder<
    Omit<S, "if" | "then" | "elseIf" | "else"> & { if: B },
    SchemaBuilder<S>,
    B
  >;

  title<B extends string>(v: B): SchemaBuilder<S>;
  description<B extends string>(v: B): SchemaBuilder<S>;
  default<B>(v: B): SchemaBuilder<S>;
  examples(ex: any): SchemaBuilder<S>;

  readOnly(): SchemaBuilder<S>;
  writeOnly(): SchemaBuilder<S>;

  const<const B extends any | $data>(
    value: B,
  ): SchemaBuilder<Simplify<Omit<S, "const"> & { const: B }>>;
  enum<const B extends any[] | $data>(
    values: B,
  ): SchemaBuilder<Simplify<Omit<S, "enum"> & { enum: B }>>;

  url(url: string): Promise<SchemaBuilder<any>>;
  file(filePath: string): Promise<SchemaBuilder<any>>;
  json<const T extends SchemaDefinition>(
    jsonSchema: T | string,
  ): SchemaBuilder<Simplify<S & T>>;
  errorMessage(
    message: string | Record<string, string | Record<string, string>>,
  ): SchemaBuilder<S>;
  option(key: string, value: any): SchemaBuilder<S>;
  extend<const B extends BuilderSchema>(v: B): SchemaBuilder<Simplify<S & B>>;

  build(): ResolveBuildType<S>;
}

export type BuilderSchema = SchemaDefinition | SchemaBuilder<any> | boolean;
export type BaseBuilderSchema = SchemaDefinition | boolean;
