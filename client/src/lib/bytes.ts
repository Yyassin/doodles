import { MIME_TYPES } from '@/types';
import { nanoid } from 'nanoid';
import { isSupportedImageFile } from './image';

/**
 * Defines several lower-level helper methods
 * that deal with typed arrays, namely files/blobs
 * and arraybuffers.
 * @author Yousef Yassin
 */

/**
 * Generates a random uuid-v4 compliant identifier.
 * @returns The identifier.
 */
export const generateRandId = () => crypto.randomUUID();

/**
 * Generates a SHA-1 digest from the supplied file. If not supported, falls back
 * to a 40-char base64 random id)
 * @param file The file to hash.
 * @returns The hash id.
 */
export const generateIdFromFile = async (file: File): Promise<string> => {
  try {
    const hashBuffer = await crypto.subtle.digest(
      'SHA-1',
      await blobToArrayBuffer(file),
    );
    return bytesToHexString(new Uint8Array(hashBuffer)) as string;
  } catch (error: unknown) {
    console.error(error);
    // Length 40 (4 bits per char) to align with the HEX length of SHA-1 (which is 160 bit)
    return nanoid(40);
  }
};

/**
 * Retrieves the provided blob's underlying data buffer.
 * @param blob The blob to retrieve the buffer for.
 * @returns The data buffer.
 */
export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  if ('arrayBuffer' in blob) {
    return blob.arrayBuffer();
  }
  // For Safari
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Couldn't convert blob to ArrayBuffer"));
      }
      resolve(event.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Converts the provided byte array into its
 * equivalent hex representation string.
 * @param bytes The bytes to convert.
 * @returns The hex string representation.
 */
export const bytesToHexString = (bytes: Uint8Array) => {
  return Array.from(bytes)
    .map((byte) => `0${byte.toString(16)}`.slice(-2))
    .join('');
};

/**
 * Resizes an image file while preserving its aspect ratio.
 *
 * @param file The input File object representing the image to be resized.
 * @param opts An options object specifying the desired output type and maximum width or height.
 * @returns A Promise resolving to the resized File object.
 */
export const resizeImageFile = async (
  file: File,
  opts: {
    /** undefined indicates auto */
    outputType?: (typeof MIME_TYPES)['jpg'];
    maxWidthOrHeight: number;
  },
): Promise<File> => {
  // SVG files shouldn't and can't be resized, so return the original file
  if (file.type === MIME_TYPES.svg) {
    return file;
  }

  // Import required libraries asynchronously
  const [pica, imageBlobReduce] = await Promise.all([
    import('pica').then((res) => res.default),
    import('image-blob-reduce').then((res) => res.default),
  ]);

  // Create a wrapper for pica with WebWorker support
  const reduce = imageBlobReduce({
    pica: pica({ features: ['js', 'wasm'] }),
  });

  // Customize the output blob creation if outputType is specified
  if (opts.outputType) {
    const { outputType } = opts;
    reduce._create_blob = function (env) {
      return this.pica.toBlob(env.out_canvas, outputType, 0.8).then((blob) => {
        env.out_blob = blob;
        return env;
      });
    };
  }

  // Check if the image file is supported
  if (!isSupportedImageFile(file)) {
    throw new Error('Unsupported image type.');
  }

  // Resize the image and create a new File object with the resized data
  return new File(
    [await reduce.toBlob(file, { max: opts.maxWidthOrHeight })],
    file.name,
    {
      type: opts.outputType || file.type,
    },
  );
};

/**
 * Converts a Blob or File to a data URL (a text encoding of the binary input,
 * formatted as a url that can be interpreted by the browser)
 *
 * @param file The input Blob or File object to be converted to a data URL.
 * @returns A Promise resolving to the data URL representation of the input file.
 */
export const getDataURL = async (file: Blob | File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the contents of the file
    const reader = new FileReader();
    // Resolve the Promise with the data URL when the file is successfully read
    reader.onload = () => {
      const dataURL = reader.result as string;
      resolve(dataURL);
    };
    // Reject the Promise with an error if there is any issue reading the file
    reader.onerror = (error) => reject(error);
    // Read the contents of the file as a data URL
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a data URL to a File object.
 *
 * @param dataURL The input data URL to be converted to a File object.
 * @param filename The name to be assigned to the resulting File object (optional).
 * @returns A File object representing the data from the input data URL.
 */
export const dataURLToFile = (dataURL: string, filename = '') => {
  // Find the start index of the data in the data URL
  const dataIndexStart = dataURL.indexOf(',');
  // Extract the byte string from the data URL
  const byteString = atob(dataURL.slice(dataIndexStart + 1));
  // Extract the MIME type from the data URL
  const mimeType = dataURL.slice(0, dataIndexStart).split(':')[1].split(';')[0];

  // Convert the byte string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);
  // Initialize the buffer using a byte view
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  // Create and return a new File object with the ArrayBuffer data
  return new File([ab], filename, { type: mimeType });
};
