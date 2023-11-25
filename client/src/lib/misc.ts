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

/**
 * Capitalizes the specified string.
 * @param s The string to capitalize.
 * @returns The capitalized string
 */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
