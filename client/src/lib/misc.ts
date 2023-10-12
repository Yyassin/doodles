/**
 * Defines miscellaneous helpers used across the application.
 * @authors Yousef Yassin
 */

/**
 * Typed version of object.values.
 * @param obj The object to get typed values for.
 * @returns The typed values array.
 */
export const ObjectValues = <T>(obj: Record<string, T>): T[] => {
  return Object.keys(obj).map((key) => obj[key]);
};
