// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "fon-blog.firebaseapp.com",
  projectId: "fon-blog",
  storageBucket: "fon-blog.firebasestorage.app",
  messagingSenderId: "406123378077",
  appId: "1:406123378077:web:2796b9993ccbf88874ab74",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
