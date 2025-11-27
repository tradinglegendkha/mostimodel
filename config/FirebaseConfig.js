// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "mostimodels.firebaseapp.com",
  projectId: "mostimodels",
  storageBucket: "mostimodels.firebasestorage.app",
  messagingSenderId: "236043733346",
  appId: "1:236043733346:web:5283008eeb25b03ea7c43b",
  measurementId: "G-H5XFNCSTF0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "mim-lab");
