import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as admin from 'firebase-admin';
import serviceAccountJSON from '../firebase/serviceAccount.json';
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
export const firebaseConfig = {
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

const serviceAccount = serviceAccountJSON as admin.ServiceAccount;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// The connected instance
export const firebaseApp = firebase.initializeApp(
  isTestingMode ? firebaseTestConfig : firebaseConfig,
);
export const firestore = firebase.firestore();
