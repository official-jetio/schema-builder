import { $data } from "@jetio/validator";
import { BaseSchemaBuilder, BuilderSchema } from "./base-schema";
import { SchemaBuilder } from "../schema-builder";
import { AddType, Simplify } from "./helpers";
import { NullSchema, BooleanSchema } from "./general";
import { NumberSchemaBuilder } from "./number-schema";
import { ObjectSchemaBuilder } from "./object-schema";
import { StringSchemaBuilder } from "./string-schema";

export interface ArraySchemaBuilder<
  S extends object,
> extends BaseSchemaBuilder<S> {
  minItems(v: number | $data): ArraySchemaBuilder<S>;
  maxItems(v: number | $data): ArraySchemaBuilder<S>;
  uniqueItems(v: boolean | $data): ArraySchemaBuilder<S>;

  items<
    const I extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[],
  >(
    ...val: I
  ): ArraySchemaBuilder<
    Simplify<
      Omit<S, "items"> & {
        items: I extends [infer Single] ? Single : I;
      }
    >
  >;

  prefixItems<
    const I extends (BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder))[],
  >(
    ...v: I
  ): ArraySchemaBuilder<
    Simplify<
      Omit<S, "prefixItems"> & {
        prefixItems: I;
      }
    >
  >;

  contains<
    const I extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(
    val: I,
  ): ArraySchemaBuilder<S>;

  minContains(v: number | $data): ArraySchemaBuilder<S>;
  maxContains(v: number | $data): ArraySchemaBuilder<S>;

  additionalItems<
    const I extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(
    v: I,
  ): ArraySchemaBuilder<
    Simplify<Omit<S, "additionalItems"> & { additionalItems: I }>
  >;

  unevaluatedItems<
    const I extends BuilderSchema | ((b: SchemaBuilder) => SchemaBuilder),
  >(
    v: I,
  ): ArraySchemaBuilder<
    Simplify<Omit<S, "unevaluatedItems"> & { unevaluatedItems: I }>
  >;

  string(): StringSchemaBuilder<AddType<S, "string">>;
  object(): ObjectSchemaBuilder<AddType<S, "object">>;
  null(): NullSchema<AddType<S, "null">>;
  number(): NumberSchemaBuilder<AddType<S, "number">>;
  integer(): NumberSchemaBuilder<AddType<S, "integer">>;
  boolean(): BooleanSchema<AddType<S, "boolean">>;
}
