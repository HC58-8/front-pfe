import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database"; // Add this for Realtime DB

const firebaseConfig = {
  apiKey: "AIzaSyDK8UbYnUuWBBPjf1FLthYcQlpUCBZemZA",
  authDomain: "pfe1-7ac2c.firebaseapp.com",
  databaseURL: "https://pfe1-7ac2c-default-rtdb.firebaseio.com",
  projectId: "pfe1-7ac2c",
  storageBucket: "pfe1-7ac2c.firebasestorage.app",
  messagingSenderId: "743924403424",
  appId: "1:743924403424:web:c929fa545847b5485",
  measurementId: "G-XRP8E3ERKX",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const db = getDatabase(app); // Realtime Database
