import express from 'express';
import { firebaseApp } from './firebase/firebase';
import multer from 'multer';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
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

// Create a Firestore instance
const db = getFirestore(firebaseApp);

// Create a Firebase Storage instance
const storage = getStorage(firebaseApp);

// Multer middleware to handle file uploads
const storageMulter = multer({ storage: multer.memoryStorage() });

// Function to upload an image to Firebase Storage
export async function uploadImageToStorage(fileBuffer, destinationPath) {
  try {
    const storageRef = ref(storage, destinationPath);
    await uploadBytes(storageRef, fileBuffer);
    console.log('Image uploaded successfully.');
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Endpoint to handle image upload
app.post('/upload-image', storageMulter.single('image'), async (req, res) => {
  try {
    // Get the uploaded image data from req.file
    const imageBuffer = (req as any).file.buffer;

    // Specify the destination path in Firebase Storage where you want to store the image
    const destinationPath =
      req.body.destinationPath || 'node/imageSamples/cat.png';

    // Upload the image to Firebase Storage
    await uploadImageToStorage(imageBuffer, destinationPath);

    res.status(200).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error handling image upload:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

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
