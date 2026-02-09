import { BaseSchemaBuilder, BuilderSchema } from "./base-schema";
import { $data } from "@jetio/validator";
import { SchemaBuilder } from "../schema-builder";
import { AddType, Simplify } from "./helpers";
import { ArraySchemaBuilder } from "./array-schema";
import { NullSchema, BooleanSchema } from "./general";
import { NumberSchemaBuilder } from "./number-schema";
import { StringSchemaBuilder } from "./string-schema";

export interface ObjectSchemaBuilder<
  S extends object,
> extends BaseSchemaBuilder<S> {
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
          ? Simplify<
              Existing & P
            >
          : P;
      }
    >
  >;

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
  >;

  minProperties(min: number | $data): SchemaBuilder<S>;

  maxProperties(max: number | $data): SchemaBuilder<S>;

  patternProperties<
    const P extends Record<
      string,
      BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder)
    >,
  >(
    p: P,
  ): SchemaBuilder<
    Simplify<
      Omit<S, "patternProperties"> & {
        patternProperties: S extends { patternProperties: infer Existing }
          ? Simplify<
              Existing & P
            >
          : P;
      }
    >
  >;

  propertyNames<
    const P extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(
    v: P,
  ): SchemaBuilder<
    S
  >;

  dependentRequired<const P extends Record<string, string[]>>(
    d: P,
  ): SchemaBuilder<
   S
  >;

  dependentSchemas<
    const P extends Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  >(
    d: P,
  ): SchemaBuilder<
     S
  >;

  dependencies<
    const P extends Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder) | string[]
    >,
  >(
    d: P,
  ): SchemaBuilder<
    S
  >;

  additionalProperties<
    const P extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(
    v: P,
  ): SchemaBuilder<
    Simplify<
      Omit<S, "additionalProperties"> & {
        additionalProperties: P;
      }
    >
  >;

  unevaluatedProperties<
    const P extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(
    v: P,
  ): SchemaBuilder<
    Simplify<
      Omit<S, "unevaluatedProperties"> & {
        unevaluatedProperties: P;
      }
    >
  >;

  remove<
    const Fields extends string[],
    Additional extends (
      | "properties"
      | "required"
      | "patternProperties"
      | "dependencies"
      | "dependentRequired"
    )[] = ["properties"],
  >(
    properties: Fields,
    additional: Additional,
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
  >;
  optional(): SchemaBuilder<Simplify<Omit<S, "required">>>;

  string(): StringSchemaBuilder<AddType<S, "string">>;
  array(): ArraySchemaBuilder<AddType<S, "array">>;
  null(): NullSchema<AddType<S, "null">>;
  number(): NumberSchemaBuilder<AddType<S, "number">>;
  integer(): NumberSchemaBuilder<AddType<S, "integer">>;
  boolean(): BooleanSchema<AddType<S, "boolean">>;
}
