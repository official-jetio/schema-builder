import { BaseSchemaBuilder, BuilderSchema } from "./base-schema";
import { SchemaBuilder } from "../schema-builder";
import { $data } from "@jetio/validator";;
export interface ObjectSchemaBuilder extends BaseSchemaBuilder<ObjectSchemaBuilder> {
  properties(
    name: string,
    baseSchema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
  ): ObjectSchemaBuilder;
  required(fields: string[] | $data): ObjectSchemaBuilder;
  patternProperties(
    patterns: Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >
  ): ObjectSchemaBuilder;
  remove(
    properties: string[],
    additional: (
      | "properties"
      | "required"
      | "patternProperties"
      | "dependencies"
      | "dependentRequired"
    )[]
  ): ObjectSchemaBuilder;
  optional(): ObjectSchemaBuilder;
  dependentSchemas(
    propertyName: string,
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
  ): ObjectSchemaBuilder;
  dependencies(
    propertyName: string,
    schema:
      | BuilderSchema
      | ((builder: SchemaBuilder) => SchemaBuilder)
      | string[]
  ): ObjectSchemaBuilder;
  propertyNames(
    baseSchema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
  ): ObjectSchemaBuilder;
  additionalProperties(
    schema:
      | boolean
      | BuilderSchema
      | ((builder: SchemaBuilder) => SchemaBuilder)
  ): ObjectSchemaBuilder;
  unevaluatedProperties(
    schema:
      | boolean
      | BuilderSchema
      | ((builder: SchemaBuilder) => SchemaBuilder)
  ): ObjectSchemaBuilder;
  minProperties(min: number | $data): ObjectSchemaBuilder;
  maxProperties(max: number | $data): ObjectSchemaBuilder;
  strict(): ObjectSchemaBuilder;
  dependentRequired(property: string, requiredFields: string[]): ObjectSchemaBuilder;
  string(): ObjectSchemaBuilder;
  number(): ObjectSchemaBuilder;
  integer(): ObjectSchemaBuilder;
  array(): ObjectSchemaBuilder;
  boolean(): ObjectSchemaBuilder;
  null(): ObjectSchemaBuilder;
}
