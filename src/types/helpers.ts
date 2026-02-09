import { BaseSchemaBuilder } from "./base-schema";

export type Simplify<T> = T extends object
  ? T extends any[]
    ? T
    : { [K in keyof T]: T[K] } & {}
  : T;

export type AddType<S, T extends string> = Simplify<
  { [K in keyof S as K extends "type" ? never : K]: S[K] } & {
    type: S extends { type: infer Old } ? Old | T : T;
  }
>;

export type ResolveBuildType<T> = T extends (...args: any[]) => infer R
  ? R extends BaseSchemaBuilder<infer Inner>
    ? ResolveBuildType<Inner>
    : ResolveBuildType<R>
  : T extends ReadonlyArray<any>
    ? { [K in keyof T]: ResolveBuildType<T[K]> }
    : T extends object
      ? { [K in keyof T]: ResolveBuildType<T[K]> }
      : T;


export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

