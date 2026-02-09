import { $data } from "@jetio/validator";
import { BaseSchemaBuilder } from "./base-schema";
import { AddType } from "./helpers";
import { ArraySchemaBuilder } from "./array-schema";
import { NullSchema, BooleanSchema } from "./general";
import { NumberSchemaBuilder } from "./number-schema";
import { ObjectSchemaBuilder } from "./object-schema";

export interface StringSchemaBuilder<
  S extends object,
> extends BaseSchemaBuilder<S> {
  minLength(length: number | $data): StringSchemaBuilder<S>;
  maxLength(length: number | $data): StringSchemaBuilder<S>;
  pattern(regex: string | RegExp | $data): StringSchemaBuilder<S>;
  format(formatName: string | $data): StringSchemaBuilder<S>;

  
  array(): ArraySchemaBuilder<AddType<S, "array">>;
  object(): ObjectSchemaBuilder<AddType<S, "object">>;
  null(): NullSchema<AddType<S, "null">>;
  number(): NumberSchemaBuilder<AddType<S, "number">>;
  integer(): NumberSchemaBuilder<AddType<S, "number">>;
  boolean() : BooleanSchema<AddType<S, "boolean">>
}
