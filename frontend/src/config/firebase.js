import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDk4w_esJlcxFvO1zlM_WabXgiNetIAQ9o",
  authDomain: "inkcode-project-tracker.firebaseapp.com",
  databaseURL: "https://inkcode-project-tracker-default-rtdb.firebaseio.com",
  projectId: "inkcode-project-tracker",
  storageBucket: "inkcode-project-tracker.firebasestorage.app",
  messagingSenderId: "136174319290",
  appId: "1:136174319290:web:ef9d441cb53102b1797483",
  measurementId: "G-318QTR83EX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app);
export const firestore = getFirestore(app);

// Connect to Firebase Functions emulator in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below if using Firebase Functions emulator
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;