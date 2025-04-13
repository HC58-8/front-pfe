import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database'; // Import Realtime Database functions
import { initializeApp } from 'firebase/app'; // Import Firebase app initialization
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { app as firebaseApp, auth, firestore } from '../firebaseConfig'; // Add firestore here
import { doc, updateDoc, getDoc } from 'firebase/firestore';

import App from '../App';

// Initialize Firebase Realtime Database
const db = getDatabase(firebaseApp);

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
  timeoutErrorMessage: 'Request timed out. Please check your connection.',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set up auth state listener for token management
const setupAuthInterceptor = () => {
  const auth = getAuth();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Modify the request interceptor to use the current user's token
      api.interceptors.request.use(
        async (config) => {
          try {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          } catch (error) {
            console.error('Failed to get ID token', error);
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
    }
  });
};

// Initial setup of auth interceptor
setupAuthInterceptor();

// Login method
api.login = async (email, password) => {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const auth = getAuth();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user document from Firestore
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    if (!userDoc.exists()) throw new Error('User document not found');

    const userData = userDoc.data();

    // Store updated user information
    localStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      role: userData.role || 'Utilisateur',// Use role from Firestore
      permissions: userData.permissions || [] // Add permissions to localStorage

    }));

    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// QR Code session handling using Firebase Realtime Database
api.generateQrCodeToken = async () => {
  const token = uuidv4();
  const sessionRef = ref(db, `qrSessions/${token}`);

  try {
    await set(sessionRef, { status: 'pending', createdAt: Date.now() });
    return { token };
  } catch (error) {
    console.error('Failed to create QR code session in Firebase', error);
    throw error;
  }
};

api.verifyQrCodeToken = async (scannedToken) => {
  const sessionRef = ref(db, `qrSessions/${scannedToken}`);

  try {
    const snapshot = await get(sessionRef);
    const sessionData = snapshot.val();

    if (sessionData && sessionData.status === 'pending') {
      // Mark the session as verified
      await set(sessionRef, { ...sessionData, status: 'verified', verifiedAt: Date.now() });
      return { success: true };
    } else {
      return { success: false, message: 'Invalid or expired QR code.' };
    }
  } catch (error) {
    console.error('Failed to verify QR code token in Firebase', error);
    throw error;
  }
};

// QR Code session handling (potentially for your Quarkus backend - keep for now)
api.createSession = async () => {
  try {
    const response = await api.post('/create-session');
    return response.data;
  } catch (error) {
    console.error('Failed to create session', error);
    throw error;
  }
};

api.checkSession = async (sessionId) => {
  try {
    const response = await api.get(`/check-session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to check session', error);
    throw error;
  }
};
// Add to your existing api methods
api.getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users', error);
    throw error;
  }
};

// Response interceptor remains the same
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        type: 'timeout',
        message: 'Request timeout'
      });
    }

    if (error.response) {
      // Don't automatically redirect on 401
      if (error.response.status === 401) {
        return Promise.reject({
          type: 'auth',
          message: 'Authorization required'
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;