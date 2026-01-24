import { $data } from "@jetio/validator";;
import { BaseSchemaBuilder } from "./base-schema";

export interface StringSchemaBuilder extends BaseSchemaBuilder<StringSchemaBuilder> {
  minLength(length: number | $data): StringSchemaBuilder;
  maxLength(length: number | $data): StringSchemaBuilder;
  pattern(regex: string | RegExp | $data): StringSchemaBuilder;
  format(formatName: string | $data): StringSchemaBuilder;
  number(): StringSchemaBuilder;
  integer(): StringSchemaBuilder;
  array(): StringSchemaBuilder;
  object(): StringSchemaBuilder;
  boolean(): StringSchemaBuilder;
  null(): StringSchemaBuilder;
}
