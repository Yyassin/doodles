import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  // Electron APIs injected in preload.ts
  interface Window {
    ipcAPI: Record<string, (...args: unknown[]) => unknown> & {
      electron: ElectronAPI;
    };
  }
}

/**
 * Extensions to the API types for image-blob-reduce compatibility
 * with pica: https://github.com/nodeca/image-blob-reduce/issues/23#issuecomment-783271848
 */
declare module 'image-blob-reduce' {
  import { PicaResizeOptions, Pica } from 'pica';
  namespace ImageBlobReduce {
    interface ImageBlobReduce {
      toBlob(file: File, options: ImageBlobReduceOptions): Promise<Blob>;
      _create_blob(
        this: { pica: Pica },
        env: {
          out_canvas: HTMLCanvasElement;
          out_blob: Blob;
        },
      ): Promise<unknown>;
    }

    interface ImageBlobReduceStatic {
      new (options?: unknown): ImageBlobReduce;

      (options?: unknown): ImageBlobReduce;
    }

    interface ImageBlobReduceOptions extends PicaResizeOptions {
      max: number;
    }
  }
  const reduce: ImageBlobReduce.ImageBlobReduceStatic;
  export = reduce;
}
