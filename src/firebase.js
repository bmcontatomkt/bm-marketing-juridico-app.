// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-qhOksXcIh9J32c0fPJS1UNNDcyRNJrs",
  authDomain: "bm-marketing-app.firebaseapp.com",
  projectId: "bm-marketing-app",
  storageBucket: "bm-marketing-app.firebasestorage.app",
  messagingSenderId: "382143972833",
  appId: "1:382143972833:web:531b46ffcb89a5cf967ea0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
