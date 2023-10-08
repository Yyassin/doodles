import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  DocumentSnapshot,
} from 'firebase/firestore';
import { firebaseApp } from './firebase';

// Create a Firestore instance
const db = getFirestore(firebaseApp);

// Function to upload a document
export async function uploadDocument(
  documentId: string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  data: Record<string, any>,
) {
  try {
    const docRef = doc(db, 'documents', documentId);
    await setDoc(docRef, data);
    console.log('Document uploaded successfully.');
  } catch (error) {
    console.error('Error uploading document:', error);
  }
}

// Function to read a document
export async function readDocument(documentId: string) {
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnapshot: DocumentSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const documentData = docSnapshot.data();
      console.log('Document data:', documentData);
      return documentData;
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error reading document:', error);
    return null;
  }
}
