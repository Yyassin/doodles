import { ValueOf } from '@/lib/misc';
import { BinaryFileData, IMAGE_MIME_TYPES } from '@/types';

/**
 * Defines data caches for improved content retrieval, crucially
 * for images.
 * @author Yousef Yassin
 */

/**
 * Note: These caches are instantiated internally, and
 * should never be instantiated again; they are singletons.
 *
 * They are also stateful, but separate from the React framework.
 * Mutating the caches will not trigger a rerender on its own.
 */

/**
 * Implements a file cache for abstract binary data.
 */
class FileCache {
  /** The file cache */
  #cache = {} as Record<string, BinaryFileData>;

  /**
   * Retrieves a reference to the cache.
   */
  public get cache() {
    return this.#cache;
  }

  public set cache(newCache: Record<string, BinaryFileData>) {
    this.#cache = newCache;
  }

  /**
   * Adds the provided file to the cache, corresponding
   * to the specified id.
   * @param fileId The file's id.
   * @param file The file to add.
   */
  public addFile(fileId: string, file: BinaryFileData) {
    this.#cache = {
      ...this.#cache,
      [fileId]: file,
    };
  }
}

/**
 * Implements an image cache for loaded/loadable HTML Image instances.
 */
export class ImageCache {
  /** The image cache. */
  #cache = new Map<
    string,
    {
      image: HTMLImageElement | Promise<HTMLImageElement>;
      mimeType: ValueOf<typeof IMAGE_MIME_TYPES>;
    }
  >();

  /**
   * Retrieves a reference to the cache.
   */
  public get cache() {
    return this.#cache;
  }
}

/** Instantiate singleton instances. */
export const fileCache = new FileCache();
export const imageCache = new ImageCache();
