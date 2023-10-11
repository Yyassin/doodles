/**
 * Common type definitions used with Stores
 * @authors Yousef Yassin
 */

/** Type of any store (a record of string-key to any-value pairs) */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type GenericStore = Record<string, any>;

/**
 * Generic interface for zustand's 'set' function. Use
 * this when defining state mutators.
 * @template T The store type
 */
export type SetState<T extends GenericStore> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean | undefined,
) => void;
