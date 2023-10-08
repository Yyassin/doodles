import { uploadDocument, readDocument } from '../src/firebase/readWrite';
import { describe, it } from 'mocha';
import { expect } from 'chai';

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
  });
});