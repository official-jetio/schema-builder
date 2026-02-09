import { StringSchemaBuilder } from "./string-schema";
import { AddType } from "./helpers";
import { ArraySchemaBuilder } from "./array-schema";
import { ObjectSchemaBuilder } from "./object-schema";
import { NumberSchemaBuilder } from "./number-schema";
import { BaseSchemaBuilder } from "./base-schema";

export interface BooleanSchema <
  S extends object,
> extends BaseSchemaBuilder<S>{
  string(): StringSchemaBuilder<AddType<S, "string">>;
  array(): ArraySchemaBuilder<AddType<S, "array">>;
  object(): ObjectSchemaBuilder<AddType<S, "object">>;
  null(): NullSchema<AddType<S, "null">>;
  number(): NumberSchemaBuilder<AddType<S, "number">>;
  integer(): NumberSchemaBuilder<AddType<S, "number">>;
}

export interface NullSchema <
  S extends object,
> extends BaseSchemaBuilder<S>{
  string(): StringSchemaBuilder<AddType<S, "string">>;
  array(): ArraySchemaBuilder<AddType<S, "array">>;
  object(): ObjectSchemaBuilder<AddType<S, "object">>;
  number(): NumberSchemaBuilder<AddType<S, "number">>;
  integer(): NumberSchemaBuilder<AddType<S, "number">>;
  boolean() : BooleanSchema<AddType<S, "boolean">>
}
