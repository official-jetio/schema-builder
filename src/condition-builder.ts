import { SchemaBuilder } from "./schema-builder";
import { BaseBuilderSchema, BuilderSchema } from "./types/base-schema";
import { Simplify } from "./types/helpers";
import { GetElseIf } from "./types/jetter";

export class ConditionBuilder<
  S extends { if: any },
  P extends SchemaBuilder<any>,
  I,
> {
  private parentBuilder: P;
  private ifCondition: BaseBuilderSchema;
  private thenSchema?: BaseBuilderSchema;
  private elseIfConditions: Array<{
    if: BaseBuilderSchema;
    then: BaseBuilderSchema;
  }> = [];
  private elseSchema?: BaseBuilderSchema;

  constructor(parentBuilder: P, ifCondition: BaseBuilderSchema) {
    this.parentBuilder = parentBuilder;
    this.ifCondition = ifCondition;
  }

  then<V extends BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)>(
    schema: V,
  ): ConditionBuilder<
    Simplify<
      S extends {
        elseIf: infer I extends ReadonlyArray<any>;
      }
        ? Omit<S, "elseIf"> & {
            elseIf: GetElseIf<I, V>;
          }
        : Omit<S, "then"> & { then: V }
    >,
    P,
    I
  > {
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

    return this as any;
  }

  elseIf<V extends BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)>(
    condition: V,
  ): ConditionBuilder<
    Simplify<
      S extends {
        elseIf: infer If extends ReadonlyArray<any>;
      }
        ? Omit<S, "elseIf"> & {
            elseIf: [...If, { if: V }];
          }
        : S & {
            elseIf: [{ if: V }];
          }
    >,
    P,
    I
  > {
    const resolved =
      typeof condition === "function"
        ? condition(new SchemaBuilder()).build()
        : condition instanceof SchemaBuilder
          ? condition.build()
          : condition;

    this.elseIfConditions.push({ if: resolved, then: undefined as any });
    return this as any;
  }

  else<V extends BuilderSchema | ((builder: SchemaBuilder) => SchemaBuilder)>(
    schema: V,
  ): SchemaBuilder<
    Simplify<
      S & {
        else: V;
      }
    >
  > {
    const resolved =
      typeof schema === "function"
        ? schema(new SchemaBuilder()).build()
        : schema instanceof SchemaBuilder
          ? schema.build()
          : schema;

    this.elseSchema = resolved;
    return this.end() as any;
  }

  end(): SchemaBuilder<
    Simplify<
      S &
        ("if" extends keyof S
          ? S
          : {
              if: I;
            })
    >
  > {
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
