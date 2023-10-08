import { initializeApp } from 'firebase/app';

/**
 * Defines connection to firebase firestore
 * instance.
 * @authors Abdalla Abdelhadi
 */

// TODO: Save to environment variables file.

// Whether we are invoking the application in a test
// (if so, the emulator should be used.
// Otherwise, connect to the actual db.)
const isTestingMode = process.env.TEST !== undefined;
const projectId = 'doodles-68ce9' as const;

// Actual config
const firebaseConfig = {
  apiKey: 'AIzaSyA3Y_5c6c7uCIzgSjdVi1F4NZ11isfYbj8',
  authDomain: 'doodles-68ce9.firebaseapp.com',
  projectId,
  storageBucket: 'doodles-68ce9.appspot.com',
  messagingSenderId: '928716865952',
  appId: '1:928716865952:web:3277c9dbdc0b6eca9924c5',
};

// Emulator config
const firebaseTestConfig = {
  projectId,
};

// The connected instance
export const firebaseApp = initializeApp(
  isTestingMode ? firebaseTestConfig : firebaseConfig,
);
