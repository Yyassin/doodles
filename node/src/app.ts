import express from 'express';
import { firebaseApp } from './firebase/firebase'; // Import your Firebase app instance
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  DocumentSnapshot,
} from 'firebase/firestore';

const app = express();
const port = 3005;

// Create a Firestore instance using your Firebase app
const db = getFirestore(firebaseApp);

// Function to upload a document
export async function uploadDocument(
  documentId: string,
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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
