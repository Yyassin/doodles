import { describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import {
  checkImageExistsInStorage,
  deleteDocument,
  deleteImageFromStorage,
  readDocument,
  uploadDocument,
  uploadImageToStorage,
} from '../src/firebase/firebaseDB';

/**
 * Firebase tests to exercise reading and writing
 * of documents and images.
 * @authors Ibrahim Almalki
 */

describe('Firestore Document and Image Upload Tests', () => {
  it('should upload and read a document', async () => {
    const documentId = 'id-1';
    const testData = {
      title: 'Sample Document 1',
      content: 'This is some content for the document.',
    };

    // Upload a document
    await uploadDocument(documentId, testData);

    // Read the same document
    const documentData = await readDocument(documentId);

    // Perform assertions using Chai
    expect(documentData).to.deep.equal(testData);

    // Delete the document
    await deleteDocument(documentId);
  });

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
