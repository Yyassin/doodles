import { describe, it } from 'mocha';
import fs from 'fs';
import {
  checkImageExistsInStorage,
  deleteImageFromStorage,
  uploadImageToStorage,
} from '../src/firebase/firebaseDB';

/**
 * Firebase tests to exercise reading and writing
 * of documents and images.
 * @authors Ibrahim Almalki
 */

describe('Firestore Document and Image Upload Tests', () => {
  it('should upload an image successfully', async () => {
    // Read a sample image file for testing (adjust the path as needed)
    const imageFilePath = 'assets/cat.png';
    const imageBuffer = fs.readFileSync(imageFilePath);

    // Specify the destination path for the image
    const destinationPath =
      'gs://doodles-68ce9.appspot.com/testing/testingibro.png';

    // Upload the image to Firebase Storage
    await uploadImageToStorage(imageBuffer, destinationPath);

    // Check if the image exists before deleting it
    const imageExists = await checkImageExistsInStorage(destinationPath);

    // TODO: Verify the buffers match

    if (imageExists) {
      // Delete the image from Firebase Storage
      await deleteImageFromStorage(destinationPath);
    } else {
      console.log('Image does not exist, skipping deletion.');
    }
  });
});
