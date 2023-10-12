import { initializeApp } from 'firebase/app';

// Firebase configuration
const projectId = 'doodles-68ce9' as const;

const firebaseConfig = {
  apiKey: 'AIzaSyA3Y_5c6c7uCIzgSjdVi1F4NZ11isfYbj8',
  authDomain: 'doodles-68ce9.firebaseapp.com',
  projectId,
  storageBucket: 'doodles-68ce9.appspot.com',
  messagingSenderId: '928716865952',
  appId: '1:928716865952:web:3277c9dbdc0b6eca9924c5',

  //   zak firebase - just keep here to safekeeping
  //   apiKey: 'AIzaSyADOKbhWs0GDVY9d8R-Pn50XsFnu2pUswI',
  //   authDomain: 'auth-development-36208.firebaseapp.com',
  //   projectId: 'auth-development-36208',
  //   storageBucket: 'auth-development-36208.appspot.com',
  //   messagingSenderId: '792863405866',
  //   appId: '1:792863405866:web:e7add3841669f879b15053',
};

export const firebaseApp = initializeApp(firebaseConfig);
