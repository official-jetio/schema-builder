import { SchemaDefinition } from "@jetio/validator";
import { SchemaBuilder } from "../schema-builder";

export interface BooleanSchema {
  number(): BooleanSchema;
  string(): BooleanSchema;
  integer(): BooleanSchema;
  array(): BooleanSchema;
  object(): BooleanSchema;
  null(): BooleanSchema;
  end(): SchemaBuilder;
  build(): SchemaDefinition;
}

export interface NullSchema {
  number(): NullSchema;
  string(): NullSchema;
  integer(): NullSchema;
  array(): NullSchema;
  object(): NullSchema;
  boolean(): NullSchema;
  end(): SchemaBuilder;
  build(): SchemaDefinition;
}
