// Singleton Factory
export const Singleton = <T>() => {
  return class Singleton {
    static instance: T | undefined;
    protected constructor() {}

    public static get Instance() {
      return this.instance || (this.instance = new this() as T);
    }

    public static destructor() {
      this.instance = undefined;
    }
  };
};
