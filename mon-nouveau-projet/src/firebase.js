// src/firebase.js
import firebase from 'firebase/app';
import 'firebase/auth';  // Pour l'authentification
import 'firebase/firestore';  // Pour Firestore si vous l'utilisez
import 'firebase/storage';  // Pour le stockage si vous l'utilisez

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyClnKUIZ1bOw3QIfvfUcBQBrYw_gS-BJnk",
  authDomain: "gestiondestock-a9b65.firebaseapp.com",
  projectId: "gestiondestock-a9b65",
  storageBucket: "gestiondestock-a9b65.appspot.com",
  messagingSenderId: "119815255593",
  appId: "1:119815255593:web:a5bb8ecfb39bec0d704e38",
  measurementId: "G-2R4TS6B2X0"
};

// Initialisation de Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

// Accéder à certains services de Firebase
const auth = firebaseApp.auth();
const firestore = firebaseApp.firestore();
const storage = firebaseApp.storage();

export { auth, firestore, storage };
