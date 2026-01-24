import { SchemaDefinition, BaseType, $data } from "@jetio/validator";
import { ArraySchemaBuilder } from "./types/array-schema";
import { ConditionBuilder } from "./condition-builder";
import { StringSchemaBuilder } from "./types/string-schema";
import { ObjectSchemaBuilder } from "./types/object-schema";
import { NumberSchemaBuilder } from "./types/number-schema";
import * as fs from "fs/promises";
import { BuilderSchema } from "./types/base-schema";
import { BooleanSchema, NullSchema } from "./types/general";
import { RefBuilder } from "./ref-builder";

export class SchemaBuilder {
  protected schema: SchemaDefinition = {};
  private addType(type: BaseType): void {
    if (!this.schema.type) {
      this.schema.type = type;
    } else if (Array.isArray(this.schema.type)) {
      if (!this.schema.type.includes(type)) {
        this.schema.type.push(type);
      }
    } else {
      if (this.schema.type !== type) {
        this.schema.type = [this.schema.type, type];
      }
    }
  }
  $schema($schema: string): SchemaBuilder {
    this.schema.$schema = $schema;
    return this;
  }

  $id($id: string): SchemaBuilder {
    this.schema.$id = $id;
    return this;
  }

  $ref(builder: RefBuilder | ((ref: RefBuilder) => RefBuilder) | string): this {
    if (typeof builder === "string") {
      this.schema.$ref = builder;
    } else if (builder instanceof RefBuilder) {
      this.schema.$ref = builder.build();
    } else {
      this.schema.$ref = builder(new RefBuilder()).build();
    }
    return this;
  }

  $dynamicRef(
    builder: RefBuilder | ((ref: RefBuilder) => RefBuilder) | string,
  ): this {
    if (typeof builder === "string") {
      this.schema.$dynamicRef = builder;
    } else if (builder instanceof RefBuilder) {
      this.schema.$dynamicRef = builder.build();
    } else {
      this.schema.$dynamicRef = builder(new RefBuilder()).build();
    }
    return this;
  }

  $anchor($anchor: string): SchemaBuilder {
    this.schema.$anchor = $anchor;
    return this;
  }

  $dynamicAnchor($dynamicAnchor: string): SchemaBuilder {
    this.schema.$dynamicAnchor = $dynamicAnchor;
    return this;
  }

  $defs(
    $defs: Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  ): SchemaBuilder {
    if (!this.schema.$defs) this.schema.$defs = {};
    Object.entries($defs).forEach(([prop, schema]) => {
      (this.schema.$defs as any)[prop] =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    });
    return this;
  }
  definitions(
    defs: Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  ): SchemaBuilder {
    if (!this.schema.definitions) this.schema.definitions = {};
    Object.entries(defs).forEach(([prop, schema]) => {
      (this.schema.definitions as any)[prop] =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    });
    return this;
  }

  enum(values: string[] | $data): SchemaBuilder {
    this.schema.enum = values;
    return this;
  }

  const(value: string | $data): SchemaBuilder {
    this.schema.const = value;
    return this;
  }

  not(
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): SchemaBuilder {
    this.schema.not =
      typeof schema === "function"
        ? schema(new SchemaBuilder()).build()
        : schema instanceof SchemaBuilder
          ? schema.build()
          : schema;
    return this as any as SchemaBuilder;
  }

  anyOf(
    ...schemas: (BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder))[]
  ): SchemaBuilder {
    const schemaList = schemas.map((s) => {
      return typeof s === "function"
        ? s(new SchemaBuilder()).build()
        : s instanceof SchemaBuilder
          ? s.build()
          : s;
    });
    this.schema.anyOf = schemaList;
    return this as any as SchemaBuilder;
  }

  allOf(
    ...schemas: (BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder))[]
  ): SchemaBuilder {
    const schemaList = schemas.map((s) => {
      return typeof s === "function"
        ? s(new SchemaBuilder()).build()
        : s instanceof SchemaBuilder
          ? s.build()
          : s;
    });
    this.schema.allOf = schemaList;
    return this as any as SchemaBuilder;
  }

  oneOf(
    ...schemas: (BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder))[]
  ): SchemaBuilder {
    const schemaList = schemas.map((s) => {
      return typeof s === "function"
        ? s(new SchemaBuilder()).build()
        : s instanceof SchemaBuilder
          ? s.build()
          : s;
    });
    this.schema.oneOf = schemaList;
    return this as any as SchemaBuilder;
  }

  option(key: string, value: any): SchemaBuilder {
    this.schema[key] = value;
    return this as any as SchemaBuilder;
  }

  if(
    condition: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): ConditionBuilder<this> {
    const resolved =
      typeof condition === "function"
        ? condition(new SchemaBuilder()).build()
        : condition instanceof SchemaBuilder
          ? condition.build()
          : condition;
    return new ConditionBuilder(this, resolved);
  }

  title(title: string): SchemaBuilder {
    this.schema.title = title;
    return this;
  }

  description(desc: string): SchemaBuilder {
    this.schema.description = desc;
    return this;
  }

  examples(...examples: any[]): SchemaBuilder {
    this.schema.examples = examples;
    return this;
  }

  default(value: any): SchemaBuilder {
    this.schema.default = value;
    return this;
  }

  readOnly(): SchemaBuilder {
    this.schema.readOnly = true;
    return this;
  }

  writeOnly(): SchemaBuilder {
    this.schema.writeOnly = true;
    return this;
  }

  errorMessage(
    message: string | Record<string, string | Record<string, string>>,
  ): SchemaBuilder {
    this.schema.errorMessage = message;
    return this;
  }

  async url(url: string): Promise<SchemaBuilder> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch schema from ${url}: ${response.status} ${response.statusText}`,
        );
      }
      const jsonSchema = await response.json();
      this.schema = jsonSchema;
      return this as any as SchemaBuilder;
    } catch (error: any) {
      throw new Error(`Error loading schema from URL ${url}: ${error.message}`);
    }
  }

  extend(): SchemaBuilder {
    const res = structuredClone(this.schema) as SchemaDefinition;
    const builder = new SchemaBuilder();
    builder.schema = res;
    return builder;
  }

  async file(filePath: string): Promise<SchemaBuilder> {
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const jsonSchema = JSON.parse(fileContent);
      this.schema = jsonSchema;
      return this as any as SchemaBuilder;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error(`Schema file not found: ${filePath}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(
          `Invalid JSON in schema file ${filePath}: ${error.message}`,
        );
      }
      throw new Error(
        `Error loading schema from file ${filePath}: ${error.message}`,
      );
    }
  }

  json(jsonSchema: object | string): SchemaBuilder {
    try {
      const schema =
        typeof jsonSchema === "string" ? JSON.parse(jsonSchema) : jsonSchema;

      if (typeof schema !== "object" || schema === null) {
        throw new Error("Invalid schema: must be an object");
      }

      this.schema = schema;
      return this as any as SchemaBuilder;
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON schema string: ${error.message}`);
      }
      throw new Error(`Error processing JSON schema: ${error.message}`);
    }
  }

  build(): SchemaDefinition {
    return structuredClone(this.schema);
  }

  //#region  String Region
  string(): StringSchemaBuilder {
    this.addType("string");
    return this as any as StringSchemaBuilder;
  }

  minLength(length: number | $data): SchemaBuilder {
    this.schema.minLength = length;
    return this;
  }

  maxLength(length: number | $data): SchemaBuilder {
    this.schema.maxLength = length;
    return this;
  }

  pattern(regex: string | RegExp | $data): SchemaBuilder {
    this.schema.pattern = regex instanceof RegExp ? regex.source : regex;
    return this;
  }

  format(
    formatName: string | $data,
  ): SchemaBuilder {
    this.schema.format = formatName;
    return this;
  }

  //#endregion

  //#region Nunber Region
  number(): NumberSchemaBuilder {
    this.addType("number");
    return this as any as NumberSchemaBuilder;
  }

  integer(): NumberSchemaBuilder {
    this.addType("integer");
    return this as any as NumberSchemaBuilder;
  }
  minimum(min: number | $data): SchemaBuilder {
    this.schema.minimum = min;
    return this;
  }

  maximum(max: number | $data): SchemaBuilder {
    this.schema.maximum = max;
    return this;
  }
  exclusiveMinimum(min: number | $data): SchemaBuilder {
    this.schema.exclusiveMinimum = min;
    return this;
  }
  exclusiveMaximum(max: number | $data): SchemaBuilder {
    this.schema.exclusiveMaximum = max;
    return this;
  }

  multipleOf(value: number | $data): SchemaBuilder {
    if (value === 0) {
      throw new Error("multipleOf value cannot be zero");
    }

    this.schema.multipleOf = value;
    return this;
  }

  positive(): SchemaBuilder {
    return this.minimum(0);
  }

  negative(): SchemaBuilder {
    return this.maximum(0);
  }

  range(min: number | $data, max: number | $data): SchemaBuilder {
    return this.minimum(min).maximum(max);
  }
  //#endregion

  boolean(): BooleanSchema {
    this.addType("boolean");
    return this as any as BooleanSchema;
  }

  null(): NullSchema {
    this.addType("null");
    return this as any as NullSchema;
  }

  //#region Array Region
  array(): ArraySchemaBuilder {
    this.addType("array");
    return this as any as ArraySchemaBuilder;
  }

  minItems(min: number | $data): SchemaBuilder {
    this.schema.minItems = min;
    return this;
  }

  maxItems(max: number | $data): SchemaBuilder {
    this.schema.maxItems = max;
    return this;
  }

  uniqueItems(value: boolean | $data): SchemaBuilder {
    this.schema.uniqueItems = value;
    return this;
  }

  contains(
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): SchemaBuilder {
    this.schema.contains =
      typeof schema === "function"
        ? schema(new SchemaBuilder()).build()
        : schema instanceof SchemaBuilder
          ? schema.build()
          : schema;
    return this;
  }

  minContains<T>(min: number | $data): SchemaBuilder {
    this.schema.minContains = min;
    return this;
  }

  maxContains(max: number | $data): SchemaBuilder {
    this.schema.maxContains = max;
    return this;
  }

  prefixItems(
    itemSchema: (BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder))[],
  ): SchemaBuilder {
    this.schema.prefixItems = itemSchema.map((schema) => {
      return typeof schema === "function"
        ? schema(new SchemaBuilder()).build()
        : schema instanceof SchemaBuilder
          ? schema.build()
          : schema;
    });
    return this;
  }

  items(
    itemSchema:
      | BuilderSchema
      | ((builder: SchemaBuilder) => SchemaBuilder)
      | (BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder))[],
  ): SchemaBuilder {
    if (Array.isArray(itemSchema)) {
      this.schema.items = itemSchema.map((schema) => {
        return typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
      });
    } else {
      this.schema.items =
        typeof itemSchema === "function"
          ? itemSchema(new SchemaBuilder()).build()
          : itemSchema instanceof SchemaBuilder
            ? itemSchema.build()
            : itemSchema;
    }
    return this;
  }

  additionalItems(
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): SchemaBuilder {
    if (typeof schema === "boolean") {
      this.schema.additionalItems = schema;
    } else {
      this.schema.additionalItems =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    }
    return this;
  }

  unevaluatedItems(
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): SchemaBuilder {
    if (typeof schema === "boolean") {
      this.schema.unevaluatedItems = schema;
    } else {
      this.schema.unevaluatedItems =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    }
    return this;
  }

  //#endregion

  //#region  Object Region
  object(): ObjectSchemaBuilder {
    this.addType("object");
    return this as any as ObjectSchemaBuilder;
  }

  properties(
    properties: Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  ): SchemaBuilder {
    if (!this.schema.properties) this.schema.properties = {};
    Object.entries(properties).forEach(([prop, schema]) => {
      const resolved =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
      (this.schema.properties as any)[prop] = resolved;
    });
    return this;
  }

  required(fields: string[] | $data): SchemaBuilder {
    if (!this.schema.required) {
      this.schema.required = [];
    }
    if (Array.isArray(this.schema.required) && Array.isArray(fields)) {
      this.schema.required.push(...fields);
    } else {
      this.schema.required = fields;
    }
    return this;
  }

  patternProperties(
    patterns: Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  ): SchemaBuilder {
    if (!this.schema.patternProperties) this.schema.patternProperties = {};

    Object.entries(patterns).forEach(([pattern, schema]) => {
      (this.schema.patternProperties as any)[pattern] =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    });

    return this;
  }

  remove(
    properties: string[],
    additional: (
      | "properties"
      | "required"
      | "patternProperties"
      | "dependencies"
      | "dependentRequired"
    )[] = ["properties"],
  ): this {
    const fields = new Set(properties);
    const removeProperties = additional.includes("properties");
    const removeRequired = additional.includes("required");
    const removePattern = additional.includes("patternProperties");
    const removeDeps = additional.includes("dependencies");
    const removeDepReq = additional.includes("dependentRequired");

    for (const field of fields) {
      if (removeProperties && this.schema.properties) {
        delete this.schema.properties[field];
      }

      if (removePattern && this.schema.patternProperties) {
        delete this.schema.patternProperties[field];
      }

      if (removeDeps) {
        if (this.schema.dependencies) delete this.schema.dependencies[field];
        if (this.schema.dependentSchemas)
          delete this.schema.dependentSchemas[field];
      }

      if (removeDepReq && this.schema.dependentRequired) {
        delete this.schema.dependentRequired[field];
      }

      if (removeRequired && Array.isArray(this.schema.required)) {
        const index = this.schema.required.indexOf(field);
        if (index !== -1) {
          this.schema.required.splice(index, 1);
        }
      }
    }
    return this;
  }

  optional(): SchemaBuilder {
    delete this.schema.required;
    return this;
  }

  dependentSchemas(
    deps: Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)
    >,
  ): SchemaBuilder {
    if (!this.schema.dependentSchemas) {
      this.schema.dependentSchemas = {};
    }
    Object.entries(deps).forEach(([props, schema]) => {
      (this.schema.dependentSchemas as any)[props] =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    });
    return this;
  }

  dependencies(
    deps: Record<
      string,
      BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder) | string[]
    >,
  ): SchemaBuilder {
    if (!this.schema.dependencies) this.schema.dependencies = {};
    Object.entries(deps).forEach(([props, values]) => {
      if (Array.isArray(values)) {
        (this.schema.dependencies as any)[props] = values;
      } else {
        (this.schema.dependencies as any)[props] =
          typeof values === "function"
            ? values(new SchemaBuilder()).build()
            : values instanceof SchemaBuilder
              ? values.build()
              : values;
      }
    });
    return this;
  }

  propertyNames(
    baseSchema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): SchemaBuilder {
    const schema =
      typeof baseSchema === "function"
        ? baseSchema(new SchemaBuilder()).build()
        : baseSchema instanceof SchemaBuilder
          ? baseSchema.build()
          : baseSchema;
    this.schema.propertyNames = schema;
    return this;
  }

  additionalProperties(
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): SchemaBuilder {
    if (typeof schema === "boolean") {
      this.schema.additionalProperties = schema;
    } else {
      this.schema.additionalProperties =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    }
    return this;
  }

  unevaluatedProperties(
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): SchemaBuilder {
    if (typeof schema === "boolean") {
      this.schema.unevaluatedProperties = schema;
    } else {
      this.schema.unevaluatedProperties =
        typeof schema === "function"
          ? schema(new SchemaBuilder()).build()
          : schema instanceof SchemaBuilder
            ? schema.build()
            : schema;
    }
    return this;
  }

  minProperties(min: number | $data): SchemaBuilder {
    this.schema.minProperties = min;
    return this;
  }

  maxProperties(max: number | $data): SchemaBuilder {
    this.schema.maxProperties = max;
    return this;
  }

  dependentRequired(deps: Record<string, string[]>): SchemaBuilder {
    if (!this.schema.dependentRequired) {
      this.schema.dependentRequired = {};
    }
    Object.entries(deps).forEach(([props, fields]) => {
      (this.schema.dependentRequired as any)[props] = fields;
    });

    return this;
  }

  //#endregion
}
