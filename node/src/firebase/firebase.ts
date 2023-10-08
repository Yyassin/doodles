import { initializeApp } from 'firebase/app';

const isTestingMode = process.env.TEST !== undefined;
// Emulator needs project id and env isn't defined in workflow environment (could post in github secrets).
const FIREBASE_TEST_PROJECT_ID =
  process.env.FIREBASE_TEST_PROJECT_ID || 'doodles-68ce9';

const firebaseConfig = {
  apiKey: 'AIzaSyA3Y_5c6c7uCIzgSjdVi1F4NZ11isfYbj8',
  authDomain: 'doodles-68ce9.firebaseapp.com',
  projectId: 'doodles-68ce9',
  storageBucket: 'doodles-68ce9.appspot.com',
  messagingSenderId: '928716865952',
  appId: '1:928716865952:web:3277c9dbdc0b6eca9924c5',
};
const firebaseTestConfig = {
  // Only the project id is used
  apiKey: process.env.FIREBASE_TEST_API_KEY,
  authDomain: process.env.FIREBASE_TEST_AUTH_DOMAIN,
  projectId: FIREBASE_TEST_PROJECT_ID,
  storageBucket: process.env.FIREBASE_TEST_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_TEST_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_TEST_APP_ID,
};

export const firebaseApp = initializeApp(
  isTestingMode ? firebaseTestConfig : firebaseConfig,
);
