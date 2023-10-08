import {
  uploadDocument,
  readDocument,
  uploadImageToStorage,
  deleteDocument,
  deleteImageFromStorage,
  checkImageExistsInStorage,
} from '../src/app';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs'; // Import the 'fs' module

describe('Firestore Document and Image Upload Tests', () => {
  it('should upload and read a document', async () => {
    const documentId1 = 'id-1';
    const data1 = {
      title: 'Sample Document 1',
      content: 'This is some content for the document.',
    };

    // Upload a document
    await uploadDocument(documentId1, data1);

    // Read the same document
    const documentData = await readDocument(documentId1);

    // Perform assertions using Chai
    expect(documentData).to.deep.equal(data1);

    // Delete the document
    await deleteDocument(documentId1);
  });

  it('should upload an image successfully', async () => {
    // Read a sample image file for testing (adjust the path as needed)
    const imageFilePath = 'imageSamples/cat.png';
    const imageBuffer = fs.readFileSync(imageFilePath);

    // Specify the destination path for the image
    const destinationPath =
      'gs://doodles-68ce9.appspot.com/testing/testingibro.png';

    // Upload the image to Firebase Storage
    await uploadImageToStorage(imageBuffer, destinationPath);

    // Check if the image exists before deleting it
    const imageExists = await checkImageExistsInStorage(destinationPath);

    if (imageExists) {
      // Delete the image from Firebase Storage
      await deleteImageFromStorage(destinationPath);
    } else {
      console.log('Image does not exist, skipping deletion.');
    }
  });
});
