/**
 * Singleton Factory
 * Provides a generic factory function for creating singleton classes.
 * @author Yousef Yassin
 */

/**
 * Singleton Factor, creates a singleton class with the specified type.
 * @template T The type of the singleton class.
 * @returns The singleton class.
 */
export const Singleton = <T>() => {
  return class Singleton {
    static instance: T | undefined;
    /**
     * Protected constructor to prevent direct instantiation.
     */
    protected constructor() {}
    /**
     * Gets the singleton instance or creates a new one if it doesn't exist.
     * @returns The singleton instance.
     */
    public static get Instance() {
      return this.instance || (this.instance = new this() as T);
    }
    /**
     * Resets the singleton instance to undefined. Only used for testing.
     */
    public static destructor() {
      this.instance = undefined;
    }
  };
};
