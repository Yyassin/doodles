import {
  doc,
  setDoc,
  getDoc,
  DocumentSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  getMetadata,
} from 'firebase/storage';
import { firebaseApp, firestore } from './firebaseApp';

/**
 * Defines Firebase database and storage instances
 * along with read/write helpers.
 * @authors Ibrahim Almalki
 */

// TODO: Write jsdoc

// Create a Firebase Storage instance
export const storage = getStorage(firebaseApp);

// Function to upload a document
export async function uploadDocument(
  documentId: string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  data: Record<string, any>,
) {
  try {
    const docRef = doc(firestore, 'documents', documentId);
    await setDoc(docRef, data);
    console.log('Document uploaded successfully.');
  } catch (error) {
    console.error('Error uploading document:', error);
  }
}

// Function to read a document
export async function readDocument(documentId: string) {
  try {
    const docRef = doc(firestore, 'documents', documentId);
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

// Function to upload an image to Firebase Storage
export async function uploadImageToStorage(
  fileBuffer: Buffer,
  destinationPath: string,
) {
  try {
    const storageRef = ref(storage, destinationPath);
    await uploadBytes(storageRef, fileBuffer);
    console.log('Image uploaded successfully.');
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Function to delete a document
export async function deleteDocument(documentId: string) {
  try {
    const docRef = doc(firestore, 'documents', documentId);
    await deleteDoc(docRef);
    console.log('Document deleted successfully.');
  } catch (error) {
    console.error('Error deleting document:', error);
  }
}

// Function to delete an image from Firebase Storage
export async function deleteImageFromStorage(imagePath: string) {
  try {
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
    console.log('Image deleted successfully.');
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// Function to check if an image exists in Firebase Storage
export async function checkImageExistsInStorage(
  imagePath: string,
): Promise<boolean> {
  try {
    const storageRef = ref(storage, imagePath);
    const metadata = await getMetadata(storageRef);
    return !!metadata;
  } catch (error) {
    console.error('Error checking image existence:', error);
    return false;
  }
}
