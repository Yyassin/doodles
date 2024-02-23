import crypto from 'crypto';
/**
 * Defines miscellaneous helpers used across the application.
 * @authors Yousef Yassin
 */

/**
 * Truncates a string to a specified length.
 * If the string length is less than or equal to the specified length (n), the original string is returned.
 * If the string length is greater than n, it truncates the string and returns the truncated version.
 * @param input The input string to be truncated.
 * @param n The maximum length of the truncated string. Should be greater than 0.
 * @returns The truncated string.
 * @throws Throws an error if n is less than or equal to 0.
 */
export const truncateString = (input: string, n: number): string => {
  if (n <= 0) {
    throw new Error('Invalid value for n. n should be greater than 0.');
  }
  return input.length <= n ? input : input.slice(-n);
};
/**
 * Genertates a random id value.
 * @returns A random UUID.
 */
export const generateRandId = () => crypto.randomUUID();

/**
 * Retrieves the initials for the provided name. If
 * the name is only one word, returns the first initial.
 * @param name The name to retrieve the initials for.
 * @returns The initials.
 */
export const getInitials = (name: string) => {
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  return words.map((word) => word[0].toUpperCase()).join('');
};
