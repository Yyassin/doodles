import { BinaryFileData, IMAGE_MIME_TYPES, MIME_TYPES } from '@/types';
import { ValueOf, setCursor } from './misc';
import {
  dataURLToFile,
  generateIdFromFile,
  getDataURL,
  resizeImageFile,
} from './bytes';
import { CanvasElement } from '@/stores/CanvasElementsStore';
import { ImageCache, fileCache, imageCache } from './cache';
import {
  DEFAULT_MAX_IMAGE_WIDTH_OR_HEIGHT,
  DRAGGING_THRESHOLD,
  MAX_ALLOWED_FILE_BYTES,
} from '@/constants';
import { firebaseApp } from '@/firebaseDB/firebase';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

/**
 * Defines helpers for interacting with images in state, and rendering them on the canvas.
 * @author Yousef Yassin
 */

/** Denotes Image canvas element with a defined image. */
type ImageInitCanvasElement = CanvasElement & { fileId: string };
/**
 * Checks if the specified canvas element is an initialized image element.
 * @param element The canvas element to check.
 * @returns True if the element is an initialized canvas element, false otherwise.
 */
export const isInitializedImageElement = (
  element: CanvasElement | null,
): element is ImageInitCanvasElement => {
  return !!element && element.type === 'image' && !!element.fileId;
};

/**
 * Checks if the specified file is a supported image type.
 * @param blob The file to check.
 * @returns True if the file type is a supported image type, false otherwise.
 */
export const isSupportedImageFile = (
  blob: Blob | null | undefined,
): blob is Blob & { type: ValueOf<typeof IMAGE_MIME_TYPES> } => {
  const { type } = blob || {};
  return !!type && (Object.values(IMAGE_MIME_TYPES) as string[]).includes(type);
};

/**
 * Loads the image defined by the provided dataURL as an
 * HTML image element.
 * @param dataURL The image's dataURL representation.
 * @returns The HTML image.
 */
export const loadHTMLImageElement = (dataURL: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = (error) => {
      reject(error);
    };
    image.src = dataURL;
  });
};

/**
 * Updates the ImageCache with new image data for specified file IDs.
 *
 * @param fileIds The fileIds to update/add.
 * @param files The file cache, containing the files.
 * @param imageCache The image cache to update.
 * @returns An object containing the updated ImageCache, a list of successfully updated files,
 *          and a list of files that failed during the update.
 */
export const _updateImageCache = async ({
  fileIds,
  files,
  imageCache,
}: {
  fileIds: string[];
  files: Record<string, BinaryFileData>;
  imageCache: ImageCache;
}) => {
  // Maps to track successfully updated files and files with errors
  const updatedFiles = new Map<string, true>();
  const erroredFiles = new Map<string, true>();

  await Promise.all(
    fileIds.reduce((promises, fileId) => {
      // Check if the file data exists and has not been updated already
      const fileData = files[fileId as string];
      if (fileData && !updatedFiles.has(fileId)) {
        updatedFiles.set(fileId, true);

        return promises.concat(
          (async () => {
            try {
              // Throw an error if the file is not an image
              if (fileData.mimeType === MIME_TYPES.binary) {
                throw new Error('Only images can be added to ImageCache');
              }

              // Load the HTMLImageElement from the data URL
              const imagePromise = loadHTMLImageElement(fileData.dataURL);

              // Create an object with image data and store the promise in the cache
              const data = {
                image: imagePromise,
                mimeType: fileData.mimeType,
              } as const;
              // The promise is stored immediatedly to denote a loading image.
              imageCache.cache.set(fileId, data);
              // Wait for the image to load and update the cache with the actual image
              const image = await imagePromise;
              imageCache.cache.set(fileId, { ...data, image });
            } catch (error: unknown) {
              // Capture errors and mark the file as errored
              erroredFiles.set(fileId, true);
            }
          })(),
        );
      }
      return promises;
    }, [] as Promise<unknown>[]),
  );

  return {
    imageCache,
    updatedFiles,
    erroredFiles,
  };
};

/**
 * Sets the cursor to a preview image of the specified image file.
 *
 * @param imageFile The File object representing the image for the cursor preview.
 */
export const setImagePreviewCursor = async (imageFile: File) => {
  // Limited to 128x128 px maximum, we'll use 96x96 px.
  // Source: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Basic_User_Interface/Using_URL_values_for_the_cursor_property
  const cursorImageSizePx = 96;
  const imagePreview = await resizeImageFile(imageFile, {
    maxWidthOrHeight: cursorImageSizePx,
  });

  // Convert the resized image preview to a data URL
  let previewDataURL = await getDataURL(imagePreview);

  // SVG cannot be resized via `resizeImageFile`; resize by rendering to a small canvas
  if (imageFile.type === MIME_TYPES.svg) {
    // Load the HTMLImageElement from the data URL
    const img = await loadHTMLImageElement(previewDataURL);

    // Calculate the dimensions for the resized SVG image
    let height = Math.min(img.height, cursorImageSizePx);
    let width = height * (img.width / img.height);

    // Adjust dimensions if width exceeds the maximum size, maintaining aspect ratio.
    if (width > cursorImageSizePx) {
      width = cursorImageSizePx;
      height = width * (img.height / img.width);
    }

    // Create a canvas element and resize the image on it
    const canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    const context = canvas.getContext('2d');
    if (context === null) return;
    context.drawImage(img, 0, 0, width, height);
    // Convert the canvas content to a data URL with the SVG MIME type
    previewDataURL = canvas.toDataURL(MIME_TYPES.svg) as string;
  }

  // Set the cursor of the document body to the preview image URL
  setCursor(`url(${previewDataURL}) 4 4, auto`);
};

/**
 * Initializes the dimensions of an image element within the canvas, either
 * corresponding to a placeholder or (more likely) to match the metadata dims.
 *
 * @param imageElement The image element.
 * @param forceNaturalSize Flag indicating whether to force the use of the image's natural size.
 * @param editImageInState Callback to update the image element in state.
 * @param appState State slice, containing the current zoom level and canvas height.
 */
export const initializeImageDimensions = (
  imageElement: CanvasElement,
  forceNaturalSize = false,
  editImageInState: (
    id: string,
    partialElement: Partial<CanvasElement>,
  ) => void,
  appState: { zoom: number; appHeight: number },
) => {
  const { zoom, appHeight } = appState;
  // Retrieve the image and check if it is initialized
  const image =
    isInitializedImageElement(imageElement) &&
    imageCache.cache.get(imageElement.fileId)?.image;

  // Extract coordinates of two opposite corners of the bounding box
  const { x: x1, y: y1 } = imageElement.p1;
  const { x: x2, y: y2 } = imageElement.p2;
  const [cx, cy] = [(x1 + x2) / 2, (y1 + y2) / 2];
  const [elWidth, elHeight] = [Math.abs(x2 - x1), Math.abs(y2 - y1)];

  // In cases where the image is not loaded or is still loading, we resize
  // to the placeholder's size.
  if (!image || image instanceof Promise) {
    if (
      elWidth < DRAGGING_THRESHOLD / zoom &&
      elHeight < DRAGGING_THRESHOLD / zoom
    ) {
      const placeholderSize = 100 / zoom;
      editImageInState(imageElement.id, {
        p1: { x: cx - placeholderSize / 2, y: cy - placeholderSize / 2 },
        p2: { x: cx + placeholderSize / 2, y: cy + placeholderSize / 2 },
      });
    }
    return;
  }

  // If the image is loaded, match its instrinsic size.
  if (
    forceNaturalSize ||
    // Use intrinsic size if bounding box is still too small.
    (elWidth < DRAGGING_THRESHOLD / zoom &&
      elHeight < DRAGGING_THRESHOLD / zoom)
  ) {
    // Determine the minimum and maximum height constraints for the image
    const minHeight = Math.max(appHeight - 120, 160);
    // Maximum height is 65% of canvas height, clamped to <300px, vh - 120px>
    const maxHeight = Math.min(minHeight, Math.floor(appHeight * 0.5) / zoom);

    // Calculate the adjusted height and width based on constraints and image's intrinsic size
    const height = Math.min(image.naturalHeight, maxHeight);
    const width = height * (image.naturalWidth / image.naturalHeight);

    // Calculate the new position of the image element. Add current imageElement
    // width/height to account for previous centering of the placeholder image
    const x = imageElement.p1.x + elWidth / 2 - width / 2;
    const y = imageElement.p1.y + elHeight / 2 - height / 2;

    // Update state with the bounding box.
    editImageInState(imageElement.id, {
      p1: { x, y },
      p2: { x: x + width, y: y + height },
    });
  }
};

/**
 * Commits the image file to the cache and updates the image element in state by
 * adding the generated file ID, triggering a rerender to show the image.
 * @param file The image file to be added to the cache.
 * @param imageElement The image element to be updated in state.
 * @param editImageInState The callback to update the image element in state.
 * @param showCursorImagePreview The flag indicating whether to show a cursor image preview.
 * @returns A Promise resolving to the inserted CanvasElement.
 */
export const commitImageToCache = <T extends Pick<CanvasElement, 'id'>>(
  file: BinaryFileData,
  imageElement?: T,
  editImageInState?: (
    id: string,
    partialElement: Partial<CanvasElement>,
  ) => void,
  showCursorImagePreview?: boolean,
) =>
  new Promise<T>(async (resolve, reject) => {
    try {
      // Add image file data to the file cache
      fileCache.addFile(file.id, {
        ...file,
        created: Date.now(),
        lastRetrieved: Date.now(),
      });

      // Check if the image data is already in image cache
      const cachedImageData = imageCache.cache.get(file.id);
      // Update the image cache if not
      if (!cachedImageData) {
        // const fileIds = [initImageElement]
        //   .map((element) => element.fileId ?? '')
        //   .filter((id) => id);
        const fileIds = [file.id];
        await _updateImageCache({
          imageCache,
          fileIds,
          files: fileCache.cache,
        });
      }
      if (!(imageElement !== undefined && editImageInState !== undefined))
        return;

      // If the image is still loading, wait for it to resolve
      if (cachedImageData?.image instanceof Promise) {
        await cachedImageData.image;
      }

      // Update the image element in the application state with the file ID
      // once loaded, this will trigger a rerender to show the image, provided
      // the element has been placed.d
      editImageInState(imageElement.id, { fileId: file.id });
      // Resolve the Promise with the inserted image element
      resolve(imageElement);
    } catch (error: unknown) {
      console.error(error);
      reject(new Error('Error inserting image'));
    } finally {
      if (!showCursorImagePreview) {
        setCursor('');
      }
    }
  });

/**
 * Inserts an image element into the canvas, handling resizing, caching, and cursor preview.
 *
 * @param imageElement Element representing the image to be inserted.
 * @param imageFile Tthe image file to be injected into the element.
 * @param addImageInState Callback to add the image element to the application state.
 * @param editImageInState Callback to update the image element in the application state.
 * @param showCursorImagePreview True to show a cursor image preview, false otherwise.
 * @returns A Promise resolving to the inserted CanvasElement.
 */
export const injectImageElement = async (
  imageElement: CanvasElement,
  imageFile: File,
  addImageInState: (element: CanvasElement) => void,
  editImageInState: (
    id: string,
    partialElement: Partial<CanvasElement>,
  ) => void,
  showCursorImagePreview?: boolean,
) => {
  // Add proxy element to state.
  addImageInState(imageElement);

  try {
    // Ensure the filetype is one supported for images
    if (!isSupportedImageFile(imageFile)) {
      throw new Error('Unsupported image type.');
    }
    const mimeType = imageFile.type;
    // TODO(yousef): Handle SVG to File here if needed

    // Generate image id (by default the file digest) before any
    // resizing/compression takes place to keep it more portable.
    // This will be the image's handle in the cache.
    const fileId = await generateIdFromFile(imageFile);
    if (!fileId) {
      console.warn(
        "Couldn't generate file id or the supplied `generateIdForFile` didn't resolve to one.",
      );
      throw new Error('Failed to insert image');
    }

    // Try to upload the image to firebase, in case it doesn't already exist.
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `boardImages/${fileId}.jpg`); // give the image a random id
    uploadBytes(storageRef, imageFile).catch(() => {
      alert('Error uploading');
    });

    // Check if file data already exists in the cache
    const existingFileData = fileCache.cache[fileId];
    // If an image doesn't exist in cache, create it and add it.
    if (!existingFileData?.dataURL) {
      try {
        // Resize to max size to ensure we meet file size constraints.
        imageFile = await resizeImageFile(imageFile, {
          maxWidthOrHeight: DEFAULT_MAX_IMAGE_WIDTH_OR_HEIGHT,
        });
      } catch (error: unknown) {
        console.error('Error trying to resing image file on insertion', error);
      }
      if (imageFile.size > MAX_ALLOWED_FILE_BYTES) {
        throw new Error(
          `File size is too big: MAX ${Math.trunc(
            MAX_ALLOWED_FILE_BYTES / 1024 / 1024,
          )}MB}`,
        );
      }
    }

    // Initialize and show the image as a cursor preview while placing.
    if (showCursorImagePreview) {
      const dataURL = existingFileData?.dataURL;
      // Optimization: don't resize the original full-size file for cursor preview
      // (faster to convert the resized dataURL to File)
      const resizedFile = dataURL && dataURLToFile(dataURL);
      setImagePreviewCursor(resizedFile || imageFile);
    }

    // Get the data URL for the image file
    const dataURL =
      fileCache.cache[fileId]?.dataURL || (await getDataURL(imageFile));

    // Return a promise which asynchronously loads the HTML image into cache.
    return commitImageToCache(
      {
        mimeType,
        id: fileId,
        dataURL,
        created: Date.now(),
        lastRetrieved: Date.now(),
      },
      imageElement,
      editImageInState,
      showCursorImagePreview,
    );
  } catch (error: unknown) {
    // TODO: Should handle deleting the image from state here
    console.error('Failed to insert image');
  }
};

/**
 * Given an image URL, returns a data URL for the image.
 * @param url The URL of the image.
 * @returns The data URL for the image.
 */
export const getImageDataUrl = async (url: string) => {
  return new Promise((resolve, reject) => {
    // Create an image element and load the image from the URL
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    // Set up event listeners to resolve or reject the promise
    img.onload = function () {
      // Create a canvas and draw the image on it
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (ctx === null) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw the image on the canvas and resolve the promise with the data URL
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };
    img.onerror = function (error) {
      reject(new Error('Failed to load image: ' + error));
    };
    // Set the image source to the URL, this will trigger the load event
    img.src = url;
  });
};
