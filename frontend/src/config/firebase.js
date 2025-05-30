import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

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

export default app;