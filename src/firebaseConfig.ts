import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Optional: if you want analytics

// Your web app's Firebase configuration
// IMPORTANT: Use environment variables for sensitive keys in production!
// Create a .env file in your project root (c:\VS\webdev\Employee-Training-Portal\.env)
// Add your keys like: VITE_FIREBASE_API_KEY=YOUR_ACTUAL_KEY
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app); // Firestore database instance
const auth = getAuth(app); // Authentication instance
// const analytics = getAnalytics(app); // Optional

export { db, auth, app }; // Export the instances you need