// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsKpzOqOgxPyNpKoaKPp9zLezWEVo7wVw",
  authDomain: "employee-training-portal-6a36e.firebaseapp.com",
  projectId: "employee-training-portal-6a36e",
  storageBucket: "employee-training-portal-6a36e.firebasestorage.app",
  messagingSenderId: "453675831672",
  appId: "1:453675831672:web:f80789805baf281273b88d",
  measurementId: "G-3XWSYB79Y3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);