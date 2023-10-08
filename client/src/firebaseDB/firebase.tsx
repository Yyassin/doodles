import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyADOKbhWs0GDVY9d8R-Pn50XsFnu2pUswI',
  authDomain: 'auth-development-36208.firebaseapp.com',
  projectId: 'auth-development-36208',
  storageBucket: 'auth-development-36208.appspot.com',
  messagingSenderId: '792863405866',
  appId: '1:792863405866:web:e7add3841669f879b15053',
};

export const firebaseApp = initializeApp(firebaseConfig);
