import { EVENT, FILE_EXTENSION, MIME_TYPES } from '@/types';
import { fileOpen as _fileOpen } from 'browser-fs-access';
import { AbortError } from './errors';
import { debounce } from './misc';

/**
 * Helpers for interacting with machine filesystem.
 * @author Yousef Yassin
 */

/**
 * Time interval (milliseconds) for debouncing input change events.
 */
const INPUT_CHANGE_INTERVAL_MS = 500;

/**
 * Opens a file dialog to select one or multiple files.
 *
 * @param opts Options for the file open operation, including file extensions and description.
 * @returns A Promise resolving to a single file or an array of files, based on the 'multiple' option.
 */
export const fileOpen = <M extends boolean | undefined = false>(opts: {
  extensions?: FILE_EXTENSION[]; // Allowed extensions
  description: string;
  multiple?: M; // True if multiple files should be loaded
}): Promise<M extends false | undefined ? File : File[]> => {
  // Unsafe TypeScript hack for determining the return type based on the 'multiple' option
  type RetType = M extends false | undefined ? File : File[];

  // Extract MIME types and extensions from file extensions provided
  const mimeTypes = opts.extensions?.reduce((mimeTypes, type) => {
    mimeTypes.push(MIME_TYPES[type]);
    return mimeTypes;
  }, [] as string[]);
  const extensions = opts.extensions?.reduce((acc, ext) => {
    return ext === 'jpg' ? acc.concat('.jpg', '.jpeg') : acc.concat(`.${ext}`);
  }, [] as string[]);

  // Call the underlying fileOpen implementation with the specified options
  return _fileOpen({
    description: opts.description,
    extensions,
    mimeTypes,
    multiple: opts.multiple ?? false,
    legacySetup: (resolve, reject, input) => {
      // Debounce function for input change events
      const scheduleRejection = debounce(reject, INPUT_CHANGE_INTERVAL_MS);

      // Event handler to check for file selection on focus
      const focusHandler = () => {
        checkForFile();
        document.addEventListener(EVENT.KEYUP, scheduleRejection);
        document.addEventListener(EVENT.POINTER_UP, scheduleRejection);
        scheduleRejection();
      };

      // Function to check for the presence of selected files
      const checkForFile = () => {
        if (input.files?.length) {
          const ret = opts.multiple ? [...input.files] : input.files[0];
          resolve(ret as RetType);
        }
      };

      /** Set up event listeners on the document and window */
      requestAnimationFrame(() => {
        window.addEventListener(EVENT.FOCUS, focusHandler);
      });
      // Set up interval to periodically check for selected files
      const interval = window.setInterval(() => {
        checkForFile();
      }, INPUT_CHANGE_INTERVAL_MS);

      // Cleanup function to remove event listeners and clear the interval
      return (rejectPromise) => {
        clearInterval(interval);
        scheduleRejection.cancel();
        window.removeEventListener(EVENT.FOCUS, focusHandler);
        document.removeEventListener(EVENT.KEYUP, scheduleRejection);
        document.removeEventListener(EVENT.POINTER_UP, scheduleRejection);

        // Reject the promise with an AbortError if cancelled
        if (rejectPromise) {
          console.warn('[FS] Opening the file was canceled.');
          rejectPromise(new AbortError());
        }
      };
    },
  }) as Promise<RetType>;
};
