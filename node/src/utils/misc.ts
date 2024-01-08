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
