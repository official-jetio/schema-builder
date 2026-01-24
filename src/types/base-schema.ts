import { SchemaBuilder } from "../schema-builder";
import { ConditionBuilder } from "../condition-builder";
import { $data, SchemaDefinition } from "@jetio/validator";;

export interface BaseSchemaBuilder<T> {
  $schema($schema: string): T;
  $id($id: string): T;
  $ref($ref: string): T;
  $dynamicRef($dynamicRef: string): T;
  $anchor($anchor: string): T;
  $dynamicAnchor($dynamicAnchor: string): T;
  $defs(
    $defs: Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >
  ): T;
  definitions(
    defs: Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >
  ): T;
  not(schema: SchemaBuilder | object): T;
  anyOf(...schemas: (SchemaBuilder | object)[]): T;
  allOf(...schemas: (SchemaBuilder | object)[]): T;
  oneOf(...schemas: (SchemaBuilder | object)[]): T;
  option(key: string, value: any): T;
  conditions(): ConditionBuilder<T>;
  title(title: string): T;
  description(desc: string): T;
  examples(...examples: any[]): T;
  default(value: any): T;
  readOnly(): T;
  writeOnly(): T;
  url(url: string): Promise<T>;
  extend(schema: SchemaBuilder | object): T;
  file(filePath: string): Promise<T>;
  json(jsonSchema: object | string): T;
  enum(values: number[] | $data): T;
  const(value: number| $data): T;
  end(): SchemaBuilder;
  build(): SchemaDefinition;
}

export type BuilderSchema = SchemaBuilder | SchemaDefinition | boolean;
export type BaseBuilderSchema = SchemaDefinition | boolean;
