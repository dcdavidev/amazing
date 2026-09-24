/**
 * Makes all properties deeply readonly.
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Type representing a nullable value.
 */
export type Nullable<T> = T | null;

/**
 * Type representing an optional value that may be null or undefined.
 */
export type Maybe<T> = T | null | undefined;
