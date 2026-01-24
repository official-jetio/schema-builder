import { $data } from "@jetio/validator";;
import { BaseSchemaBuilder } from "./base-schema";

export interface NumberSchemaBuilder extends BaseSchemaBuilder<NumberSchemaBuilder> {
  minimum(min: number | $data): NumberSchemaBuilder;
  maximum(max: number | $data): NumberSchemaBuilder;
  exclusiveMinimum(min: number | $data): NumberSchemaBuilder;
  exclusiveMaximum(max: number | $data): NumberSchemaBuilder;
  multipleOf(value: number | $data): NumberSchemaBuilder;
  integer(): NumberSchemaBuilder;
  positive(): NumberSchemaBuilder;
  negative(): NumberSchemaBuilder;
  range(min: number | $data, max: number | $data): NumberSchemaBuilder;
  string(): NumberSchemaBuilder;
  integer(): NumberSchemaBuilder;
  array(): NumberSchemaBuilder;
  object(): NumberSchemaBuilder;
  boolean(): NumberSchemaBuilder;
  null(): NumberSchemaBuilder;
}
