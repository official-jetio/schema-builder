import { BaseSchemaBuilder, BuilderSchema } from "./base-schema";
import { SchemaBuilder } from "../schema-builder";
import { $data } from "@jetio/validator";;

export interface ArraySchemaBuilder extends BaseSchemaBuilder<ArraySchemaBuilder> {
  minItems(min: number | $data): ArraySchemaBuilder;
  maxItems(min: number | $data): ArraySchemaBuilder;
  uniqueItems(value: boolean | $data): ArraySchemaBuilder;
  contains(
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
  ): ArraySchemaBuilder;
  minContains<T>(min: number | $data): ArraySchemaBuilder;
  maxContains<T>(min: number | $data): ArraySchemaBuilder;
  prefixItems(
    itemSchema: (BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder))[]
  ): ArraySchemaBuilder;
  items(
    itemSchema:
      | BuilderSchema
      | ((builder: SchemaBuilder) => SchemaBuilder)
      | (BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder))[]
  ): ArraySchemaBuilder;
  additionalItems(
    allowed: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
  ): ArraySchemaBuilder;
  unevaluatedItems(
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
  ): ArraySchemaBuilder;
  number(): ArraySchemaBuilder;
  string(): ArraySchemaBuilder;
  object(): ArraySchemaBuilder;
  null(): ArraySchemaBuilder;
  integer(): ArraySchemaBuilder;
  boolean(): ArraySchemaBuilder;
}
