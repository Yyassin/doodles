// Singleton Factory
export const Singleton = <T>() => {
  return class Singleton {
    static instance: T;
    protected constructor() {}

    public static get Instance() {
      return this.instance || (this.instance = new this() as T);
    }
  };
};
