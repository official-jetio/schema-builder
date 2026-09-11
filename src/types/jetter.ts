import { $data, SchemaDefinition } from "@jetio/validator";
import { Prettify, Simplify } from "./helpers";
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Jet {
  export type Infer<T extends SchemaDefinition | boolean> = T extends
    | true
    | false
    ? Jetter<T, true>
    : Jetter<T, false, true>;
}

type IsObjectSchema<T> = T extends
  | { properties: object }
  | { required: ReadonlyArray<string> }
  | { additionalProperties: boolean | object }
  | { unevaluatedProperties: boolean | object }
  ? T extends {
      properties: undefined;
      required: undefined;
      additionalProperties: undefined;
      unevaluatedProperties: undefined;
    }
    ? false
    : true
  : false;

type IsArraySchema<T> = T extends
  | { items: any }
  | { prefixItems: ReadonlyArray<any> }
  | { additionalItems: any }
  | { unevaluatedItems: any }
  ? T extends {
      items: undefined;
      prefixItems: undefined;
      additionalItems: undefined;
      unevaluatedItems: undefined;
    }
    ? false
    : true
  : false;

type ExtractObjects<T> = T extends any[] ? never : T extends object ? T : never;
type ExtractNonObjects<T> = T extends any[] ? T : T extends object ? never : T;

// type MergeUnion<Union, Fixed> = [Union] extends [never]
//   ? [Fixed] extends [never]
//     ? never
//     : Fixed
//   : [Fixed] extends [never]
//     ? Union
//     :
//         | ExtractNonObjects<Union>
//         | ExtractNonObjects<Fixed>
//         | MergeObjects<ExtractObjects<Union>, ExtractObjects<Fixed>>;



type ExtractBoolRep<T extends boolean> = [T] extends [true] ? unknown : [T] extends [false] ? never : T;
type MergeUnion<Union, Fixed, DeepMerge extends boolean = false> = [
  Union,
] extends [never]
  ? [Fixed] extends [never]
    ? never
    : [Fixed] extends [boolean]
      ? Fixed extends true
        ? unknown
        : Fixed extends false
          ? never
          : Fixed
      : Fixed
  : [Fixed] extends [never]
    ? [Union] extends [boolean]
      ? Union extends true
        ? unknown
        : Union extends false
          ? never
          : Union
      : Union
    : [Union] extends [boolean]
      ? [Fixed] extends [boolean]
        ? ExtractBoolRep<Union> | ExtractBoolRep<Fixed>
        : ExtractBoolRep<Union> | Fixed
      : [Fixed] extends [boolean]
        ? [Union] extends [boolean]
          ? ExtractBoolRep<Union> | ExtractBoolRep<Fixed>
          : ExtractBoolRep<Fixed> | Union
        : DeepMerge extends true
          ?
              | ExtractNonObjects<Union>
              | ExtractNonObjects<Fixed>
              | IntrusiveDeepMergeObjects<
                  ExtractObjects<Union>,
                  ExtractObjects<Fixed>
                >
          :
              | ExtractNonObjects<Union>
              | ExtractNonObjects<Fixed>
              | MergeObjects<ExtractObjects<Union>, ExtractObjects<Fixed>>;

type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: T[K];
};

type IntrusiveDeepMergeObjects<Base, New> = [Base] extends [never]
  ? New
  : [New] extends [never]
    ? Base
    : Base extends object
      ? New extends object
        ? Simplify<
            {
              [K in
                | keyof RemoveIndex<Base>
                | keyof RemoveIndex<New> as K extends
                | RequiredDeepKeys<Base>
                | RequiredDeepKeys<New>
                ? K
                : never]: K extends keyof New
                ? IsAny<New[K]> extends true
                  ? K extends keyof Base
                    ? Exclude<Base[K], undefined>
                    : New[K]
                  : New[K] extends undefined
                    ? K extends keyof Base
                      ? Exclude<Base[K], undefined>
                      : never
                    : Exclude<New[K], undefined>
                : K extends keyof Base
                  ? Exclude<Base[K], undefined>
                  : never;
            } & {
              [K in
                | keyof RemoveIndex<Base>
                | keyof RemoveIndex<New> as K extends
                | RequiredDeepKeys<Base>
                | RequiredDeepKeys<New>
                ? never
                : K]?: K extends keyof New
                ? IsAny<New[K]> extends true
                  ? K extends keyof Base
                    ? Exclude<Base[K], undefined>
                    : New[K]
                  : New[K] extends undefined
                    ? K extends keyof Base
                      ? Base[K]
                      : never
                    : New[K]
                : K extends keyof Base
                  ? Exclude<Base[K], undefined>
                  : never;
            } & (string extends keyof Base
                ? { [x: string]: any }
                : string extends keyof New
                  ? { [x: string]: any }
                  : {})
          >
        : Base
      : New;

type DeepMergeObjects<Base, New> = [Base] extends [never]
  ? New
  : [New] extends [never]
    ? Base
    : Base extends object
      ? New extends object
        ? Simplify<
            {
              [K in
                | keyof RemoveIndex<Base>
                | keyof RemoveIndex<New> as K extends
                | RequiredDeepKeys<Base>
                | RequiredDeepKeys<New>
                ? K
                : never]: K extends keyof New
                ? IsAny<New[K]> extends true
                  ? K extends keyof Base
                    ? Exclude<Base[K], undefined>
                    : New[K]
                  : Exclude<New[K], undefined>
                : K extends keyof Base
                  ? Exclude<Base[K], undefined>
                  : never;
            } & {
              [K in
                | keyof RemoveIndex<Base>
                | keyof RemoveIndex<New> as K extends
                | RequiredDeepKeys<Base>
                | RequiredDeepKeys<New>
                ? never
                : K]?: K extends keyof New
                ? IsAny<New[K]> extends true
                  ? K extends keyof Base
                    ? Exclude<Base[K], undefined>
                    : New[K]
                  : New[K]
                : K extends keyof Base
                  ? Exclude<Base[K], undefined>
                  : never;
            } & (string extends keyof Base
                ? { [x: string]: any }
                : string extends keyof New
                  ? { [x: string]: any }
                  : {})
          >
        : Base
      : New;
type RequiredDeepKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type IsAny<T> = 0 extends 1 & T ? true : false;

type HasConflict<A, B> = {
  [K in keyof A & keyof B]: IsAny<A[K]> extends true
    ? false
    : IsAny<B[K]> extends true
      ? false
      : A[K] & B[K] extends never
        ? true
        : false;
}[keyof A & keyof B] extends false | never
  ? false
  : true;

type MergeObjects<U, F> = U extends object
  ? F extends object
    ? HasConflict<U, F> extends true
      ? U | F
      : DeepMergeObjects<U, F>
    : U
  : U;

export type Jetter<
  T extends SchemaDefinition | boolean,
  needTrue extends boolean = false,
  fromAllOf extends boolean = false,
> = T extends false
  ? never
  : T extends true
    ? needTrue extends true
      ? unknown
      : never
    : T extends { const: infer C }
      ? C extends $data
        ? unknown
        : C
      : T extends { enum: infer EN }
        ? EN extends ReadonlyArray<infer E>
          ? E
          : unknown
        : JetImplement<
            T,
            T extends { type: infer BT } ? BT : {},
            T extends { allOf: infer AllOfArray } ? AllOfArray : {},
            T extends { anyOf: infer AnOfArray } ? AnOfArray : {},
            T extends { oneOf: infer OneOfArray } ? OneOfArray : {},
            fromAllOf
          >;

type ExclusiveOr<A extends ReadonlyArray<any>, B extends ReadonlyArray<any>> =
  | MapExclusiveOr<A, B>[number]
  | MapExclusiveOr<B, A>[number];

type MapExclusiveOr<
  A extends ReadonlyArray<any>,
  B extends ReadonlyArray<any>,
> = {
  [K in keyof A]: A[K] extends infer OT
    ? OT extends any[]
      ? OT
      : OT extends object
        ? Simplify<Strict<OT, ExclusiveOrKeys<B>>>
        : OT
    : never;
};

type ExclusiveOrKeys<T extends ReadonlyArray<SchemaDefinition | boolean>> = {
  [K in keyof T]: T[K] extends infer JT
    ? JT extends any[]
      ? never
      : JT extends object
        ? keyof JT
        : never
    : never;
}[number];

type JetImplementFInal<
  T extends SchemaDefinition | boolean,
  BaseResult,
  FinalUnion,
  FromAllOf extends boolean = false,
> = T extends {
  if: infer IF extends SchemaDefinition | boolean;
}
  ? T extends { then: infer THEN extends SchemaDefinition | boolean }
    ? T extends {
        elseIf: infer ElseIfArray extends ReadonlyArray<{
          if: SchemaDefinition | boolean;
          then?: SchemaDefinition | boolean;
        }>;
      }
      ? T extends { else: infer Else extends SchemaDefinition | boolean }
        ? ExclusiveOr<
            [
              MergeUnion<
                FinalUnion,
                MergeUnion<
                  BaseResult,
                  MergeUnion<Jetter<IF, false, true>, Jetter<THEN, false, true>, true>,
                  true
                >
              >,
            ],
            [ElseIf<ElseIfArray, Jetter<Else, false, true>, BaseResult, FinalUnion>]
          >
        : ExclusiveOr<
            [
              MergeUnion<
                FinalUnion,
                MergeUnion<
                  BaseResult,
                  MergeUnion<Jetter<IF, false, true>, Jetter<THEN, false, true>, true>,
                  true
                >
              >,
            ],
            [ElseIf<ElseIfArray, {}, BaseResult, FinalUnion>]
          >
      : T extends { else: infer Else extends SchemaDefinition | boolean }
        ? ExclusiveOr<
            [
              MergeUnion<
                FinalUnion,
                MergeUnion<
                  BaseResult,
                  MergeUnion<Jetter<IF, false, true>, Jetter<THEN, false, true>, true>,
                  true
                >
              >,
            ],
            [MergeUnion<FinalUnion, MergeUnion<BaseResult, Jetter<Else, false, true>, true>>]
          >
        : FromAllOf extends true
          ? MergeUnion<
              FinalUnion,
              MergeUnion<
                BaseResult,
                DeepOptional<MergeUnion<Jetter<IF, false, true>, Jetter<THEN, false, true>, true>>,
                true
              >
            >
          : MergeUnion<
              FinalUnion,
              MergeUnion<
                BaseResult,
                MergeUnion<Jetter<IF, false, true>, Jetter<THEN, false, true>, true>,
                true
              >
            >
    : T extends {
          elseIf: infer ElseIfArray extends ReadonlyArray<{
            if: SchemaDefinition | boolean;
            then?: SchemaDefinition | boolean;
          }>;
        }
      ? T extends { else: infer Else extends SchemaDefinition | boolean }
        ? ExclusiveOr<
            [MergeUnion<FinalUnion, MergeUnion<BaseResult, Jetter<IF, false, true>, true>>],
            [ElseIf<ElseIfArray, Jetter<Else, false, true>, BaseResult, FinalUnion>]
          >
        :
            | FinalUnion
            | ExclusiveOr<
                [
                  MergeUnion<
                    FinalUnion,
                    MergeUnion<BaseResult, Jetter<IF, false, true>, true>
                  >,
                ],
                [ElseIf<ElseIfArray, {}, BaseResult, FinalUnion>]
              >
      : T extends { else: infer Else extends SchemaDefinition | boolean }
        ? ExclusiveOr<
            [MergeUnion<FinalUnion, MergeUnion<BaseResult, Jetter<IF, false, true>, true>>],
            [MergeUnion<FinalUnion, MergeUnion<BaseResult, Jetter<Else, false, true>, true>>]
          >
        : [FinalUnion] extends [never]
          ? BaseResult
          : FinalUnion
  : [FinalUnion] extends [never]
    ? BaseResult
    : FinalUnion;

type DeepOptional<T> = T extends any
  ? T extends readonly any[]
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepOptional<T[K]> }
      : T
  : never;
// type JetImplement<T extends SchemaDefinition | boolean, BT, TALL, TANY, TONE> =
//   MergeUnion<
//     ResType<T, BT>,
//     TALL extends ReadonlyArray<infer Schemas>
//       ? UnionToIntersection<Jetter<Extract<Schemas, SchemaDefinition | boolean>>>
//       : never,
//     true
//   > extends infer BaseResult
//     ? MergeUnion<
//         TANY extends ReadonlyArray<SchemaDefinition | boolean>
//           ? Jetter<TANY[number]> extends infer A
//             ? A extends any
//               ? [BaseResult] extends [never]
//                 ? A
//                 : MergeUnion<BaseResult, A, true>
//               : never
//             : never
//           : never,
//         TONE extends ReadonlyArray<SchemaDefinition | boolean>
//           ? OneOf<TONE, BaseResult> extends infer O
//             ? O extends any
//               ? O
//               : never
//             : never
//           : never
//       > extends infer FinalUnion
//       ? JetImplementFInal<T, BaseResult, FinalUnion>
//       : JetImplementFInal<T, BaseResult, never>
//     : never;

type JetImplement<
  T extends SchemaDefinition | boolean,
  BT,
  TALL,
  TANY,
  TONE,
  FromAllOf extends boolean = false,
> =
  MergeUnion<
    ResType<T, BT>,
    TALL extends ReadonlyArray<infer Schemas>
      ? MergeUnion<
          UnionToIntersection<
            Jetter<Extract<Schemas, SchemaDefinition | boolean>, false, true>
          >,
          {},
          true
        >
      : never,
    true
  > extends infer BaseResult
    ? MergeUnion<
        TANY extends ReadonlyArray<SchemaDefinition | boolean>
          ? TANY[number] extends infer TA extends boolean | SchemaDefinition
            ? Jetter<TA> extends infer A
              ? A extends any
                ? [BaseResult] extends [never]
                  ? TA extends true
                    ? { [x: string]: any }
                    : A
                  : TA extends true
                    ? BaseResult extends object
                      ? Prettify<BaseResult & { [x: string]: any }>
                      : MergeUnion<BaseResult, never, true>
                    : MergeUnion<BaseResult, A, true>
                : never
              : never
            : never
          : never,
        TONE extends ReadonlyArray<SchemaDefinition | boolean>
          ? OneOf<TONE, BaseResult> extends infer O
            ? O extends any
              ? O
              : never
            : never
          : never
      > extends infer FinalUnion
      ? JetImplementFInal<T, BaseResult, FinalUnion, FromAllOf>
      : JetImplementFInal<T, BaseResult, never, FromAllOf>
    : never;

type ResType<T extends SchemaDefinition | boolean, BT> =
  BT extends ReadonlyArray<infer AT>
    ? JetterType<AT, T>
    : T extends { type: infer Type }
      ? JetterType<Type, T>
      : IsObjectSchema<T> extends true
        ? IsArraySchema<T> extends true
          ? JetterObject<T> | JetterArray<T>
          : JetterObject<T>
        : IsArraySchema<T> extends true
          ? JetterArray<T>
          : T extends { $ref: string }
            ? unknown
            : never;

type OneOf<
  Arr extends ReadonlyArray<SchemaDefinition | boolean>,
  BaseResult,
> = MapOneOf<Arr, BaseResult>[number];

type MapOneOf<
  T extends ReadonlyArray<SchemaDefinition | boolean>,
  BaseResult,
> = {
  [K in keyof T]: MergeUnion<BaseResult, Jetter<T[K]>> extends infer OT
    ? OT extends any[]
      ? OT
      : OT extends object
        ? T[K] extends true
          ? Prettify<{ [OK in keyof OT]: OT[OK] } & { [b: string]: any }>
          : Simplify<Strict<OT, AllKeys<T>>>
        : OT
    : never;
};

type AllKeys<T extends ReadonlyArray<SchemaDefinition | boolean>> = {
  [K in keyof T]: Jetter<T[K]> extends infer JT
    ? JT extends any[]
      ? never
      : JT extends object
        ? keyof JT
        : never
    : never;
}[number];

type Strict<T, K extends PropertyKey> = T & {
  [P in Exclude<K, keyof T>]?: never;
};

type ElseIf<
  ElseIfArray extends ReadonlyArray<{
    if: SchemaDefinition | boolean;
  }>,
  FallbackElse,
  BaseResult,
  FinalUnion,
> = (
  ElseIfArray extends ReadonlyArray<{ if: SchemaDefinition | boolean }>
    ? ElseIfArray[number] extends infer A
      ? A extends {
          if: infer IF extends SchemaDefinition | boolean;
          then: infer THEN extends SchemaDefinition | boolean;
        }
        ? MergeUnion<
            FinalUnion,
            MergeUnion<
              BaseResult,
              MergeUnion<Jetter<IF, false, true>, Jetter<THEN, false, true>, true>,
              true
            >
          >
        : never
      : never
    : never
) extends infer FinalResult
  ? [FallbackElse] extends [never]
    ? ExclusiveOr<[FinalResult], [FinalResult]>
    : ExclusiveOr<
        [ExclusiveOr<[FinalResult], [FinalResult]>],
        [MergeUnion<FinalUnion, MergeUnion<BaseResult, FallbackElse, true>>]
      >
  : never;

type JetterType<
  Type,
  Schema extends SchemaDefinition | boolean,
> = Type extends "string"
  ? string
  : Type extends "number"
    ? number
    : Type extends "integer"
      ? number
      : Type extends "boolean"
        ? boolean
        : Type extends "null"
          ? null
          : Type extends "array"
            ? JetterArray<Schema>
            : Type extends "object"
              ? JetterObject<Schema>
              : never;

type JetterArray<Schema extends SchemaDefinition | boolean> = Schema extends {
  prefixItems: infer P extends ReadonlyArray<any>;
}
  ? [
      ...{
        [Index in keyof P]: Jetter<
          Extract<P[Index], SchemaDefinition | boolean>,
          true,
          true
        >;
      },
      ...(Schema extends { items: infer I }
        ? Jetter<Extract<I, SchemaDefinition | boolean>, true, true>[]
        : Schema extends { unevaluatedItems: infer UI }
          ? Jetter<Extract<UI, SchemaDefinition | boolean>, true, true>[]
          : any[]),
    ]
  : Schema extends { items: infer I extends ReadonlyArray<any> }
    ? [
        ...{
          [Index in keyof I]: Jetter<
            Extract<I[Index], SchemaDefinition | boolean>,
            true,
            true
          >;
        },
        ...(Schema extends {
          additionalItems: infer AI;
        }
          ? Jetter<Extract<AI, SchemaDefinition | boolean>, true, true>[]
          : any[]),
      ]
    : Schema extends { items: infer I }
      ? Jetter<Extract<I, SchemaDefinition | boolean>, true, true>[]
      : Schema extends { additionalItems: infer I }
        ? Jetter<Extract<I, SchemaDefinition | boolean>, true, true>[]
        : any[];

type PatternToTemplate<P extends string> = P extends `^${infer Prefix}_`
  ? `${Prefix}_${string}`
  : P extends `^${infer Prefix}-`
    ? `${Prefix}-${string}`
    : P extends `^${infer Prefix}.`
      ? `${Prefix}.${string}`
      : P extends `^${infer Prefix}`
        ? `${Prefix}${string}`
        : P extends `_${infer Suffix}$`
          ? `${string}_${Suffix}`
          : P extends `-${infer Suffix}$`
            ? `${string}-${Suffix}`
            : P extends `.${infer Suffix}$`
              ? `${string}.${Suffix}`
              : P extends `${infer Suffix}$`
                ? `${string}${Suffix}`
                : P extends `${infer Pre}_${infer Post}`
                  ? `${string}_${string}`
                  : P extends `${infer Pre}-${infer Post}`
                    ? `${string}-${string}`
                    : P extends `${infer Pre}.${infer Post}`
                      ? `${string}.${string}`
                      : P extends ".*"
                        ? string
                        : P extends `^[a-zA-Z].*`
                          ? string
                          : P extends `.*[0-9]$`
                            ? string
                            : string;

type JetterPatternProperties<PP> =
  PP extends Record<string, any>
    ? {
        [K in keyof PP as PatternToTemplate<K & string>]: PP[K] extends
          | SchemaDefinition
          | boolean
          ? Jetter<PP[K], true, true>
          : any;
      }
    : {};

type JetterObject<Schema extends SchemaDefinition | boolean> = Schema extends {
  readonly properties: infer Props;
}
  ? Prettify<
      JetterProperties<Props, Schema> &
        (Schema extends { patternProperties: infer PP }
          ? JetterPatternProperties<PP>
          : {}) &
        (Schema extends { additionalProperties: infer P }
          ? P extends true
            ? { [x: string]: any }
            : P extends object
              ? { [x: string]: any }
              : {}
          : Schema extends { unevaluatedProperties: infer P }
            ? P extends true
              ? { [x: string]: any }
              : P extends object
                ? { [x: string]: any }
                : {}
            : {})
    >
  : Schema extends { readonly required: ReadonlyArray<any> }
    ? Prettify<
        JetterProperties<{}, Schema> &
          (Schema extends { patternProperties: infer PP }
            ? JetterPatternProperties<PP>
            : {})
      >
    : Schema extends { patternProperties: infer PP }
      ? Prettify<JetterPatternProperties<PP>>
      : Schema extends { additionalProperties: false }
        ? Record<string, never>
        : Schema extends {
              additionalProperties: infer AP extends SchemaDefinition | boolean;
            }
          ? Record<string, Jetter<AP, true, true>>
          : Schema extends { unevaluatedProperties: false }
            ? Record<string, never>
            : Schema extends {
                  unevaluatedProperties: infer AP extends
                    | SchemaDefinition
                    | boolean;
                }
              ? { [key: string]: Jetter<AP, true, true> }
              : Record<string, any>;

export type GetElseIf<Arr, V> = {
  [K in keyof Arr]: Arr[K] extends { if: any; then: any }
    ? Arr[K]
    : Arr[K] extends { if: infer IfType }
      ? { if: Arr[K]["if"]; then: V }
      : Arr[K];
};
type JetterProperties<Props, Schema extends SchemaDefinition | boolean> =
  Props extends Record<string, any>
    ? MergeRequiredOptional<Props, Schema>
    : Record<string, any>;

type MergeRequiredOptional<Props, Schema extends SchemaDefinition | boolean> = {
  [K in keyof Props as K extends RequiredKeys<Schema>
    ? K
    : never]: Props[K] extends SchemaDefinition | boolean
    ? Jetter<Props[K], true, true>
    : any;
} & {
  [K in keyof Props as K extends RequiredKeys<Schema>
    ? never
    : K]?: Props[K] extends SchemaDefinition | boolean
    ? Jetter<Props[K], true, true>
    : any;
} & {
  [K in Exclude<RequiredKeys<Schema>, keyof Props> as K extends string
    ? K
    : never]: any;
};

type RequiredKeys<Schema extends SchemaDefinition | boolean> = Schema extends {
  required: ReadonlyArray<infer Keys>;
}
  ? Keys
  : never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;