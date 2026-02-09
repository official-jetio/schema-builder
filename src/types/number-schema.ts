import { $data } from "@jetio/validator";
import { BaseSchemaBuilder } from "./base-schema";
import { AddType } from "./helpers";
import { ArraySchemaBuilder } from "./array-schema";
import { ObjectSchemaBuilder } from "./object-schema";
import { StringSchemaBuilder } from "./string-schema";
import { NullSchema, BooleanSchema } from "./general";
export interface NumberSchemaBuilder<
  S extends object,
> extends BaseSchemaBuilder<S> {
  minimum(min: number | $data): NumberSchemaBuilder<S>;
  maximum(max: number | $data): NumberSchemaBuilder<S>;
  exclusiveMinimum(min: number | $data): NumberSchemaBuilder<S>;
  exclusiveMaximum(max: number | $data): NumberSchemaBuilder<S>;
  multipleOf(value: number | $data): NumberSchemaBuilder<S>;

  positive(): NumberSchemaBuilder<S>;
  negative(): NumberSchemaBuilder<S>;
  range(min: number | $data, max: number | $data): NumberSchemaBuilder<S>;


  string(): StringSchemaBuilder<AddType<S, "string">>;
  array(): ArraySchemaBuilder<AddType<S, "array">>;
  object(): ObjectSchemaBuilder<AddType<S, "object">>;
  null(): NullSchema<AddType<S, "null">>;
  integer(): NumberSchemaBuilder<AddType<S, "number">>;
  boolean() : BooleanSchema<AddType<S, "boolean">>
}
