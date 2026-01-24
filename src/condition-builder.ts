import { SchemaBuilder } from "./schema-builder";
import { BaseBuilderSchema, BuilderSchema } from "./types/base-schema";

export class ConditionBuilder<T> {
  private parentBuilder: T;
  private ifCondition: BaseBuilderSchema;
  private thenSchema?: BaseBuilderSchema;
  private elseIfConditions: Array<{
    if: BaseBuilderSchema;
    then: BaseBuilderSchema;
  }> = [];
  private elseSchema?: BaseBuilderSchema;

  constructor(parentBuilder: T, ifCondition: BaseBuilderSchema) {
    this.parentBuilder = parentBuilder;
    this.ifCondition = ifCondition;
  }

  // Callback style - immediately resolves then
  then(
    schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): this {
    const resolved =
      typeof schema === "function"
        ? schema(new SchemaBuilder()).build()
        : schema instanceof SchemaBuilder
          ? schema.build()
          : schema;

    if (this.elseIfConditions.length > 0) {
      const lastElseIf =
        this.elseIfConditions[this.elseIfConditions.length - 1];
      if (!lastElseIf.then) {
        lastElseIf.then = resolved;
      }
    } else {
      this.thenSchema = resolved;
    }

    return this;
  }

  elseIf(
    condition: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder),
  ): this {
    const resolved =
      typeof condition === "function"
        ? condition(new SchemaBuilder()).build()
        : condition instanceof SchemaBuilder
          ? condition.build()
          : condition;

    this.elseIfConditions.push({ if: resolved, then: undefined as any });
    return this;
  }

  else(schema: BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)): T {
    const resolved =
      typeof schema === "function"
        ? schema(new SchemaBuilder()).build()
        : schema instanceof SchemaBuilder
          ? schema.build()
          : schema;

    this.elseSchema = resolved;
    return this.end();
  }

  end(): T {
    (this.parentBuilder as any).option("if", this.ifCondition);

    if (this.thenSchema !== undefined) {
      (this.parentBuilder as any).option("then", this.thenSchema);
    }

    if (this.elseIfConditions.length > 0) {
      (this.parentBuilder as any).option("elseIf", this.elseIfConditions);
    }

    if (this.elseSchema !== undefined) {
      (this.parentBuilder as any).option("else", this.elseSchema);
    }

    return this.parentBuilder;
  }
}
