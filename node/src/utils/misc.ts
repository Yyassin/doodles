export const truncateString = (input: string, n: number): string => {
  if (n <= 0) {
    throw new Error('Invalid value for n. n should be greater than 0.');
  }
  return input.length <= n ? input : input.slice(-n);
};
