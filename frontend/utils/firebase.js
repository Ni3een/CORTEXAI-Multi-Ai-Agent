// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
 authDomain: "cortexai-51ddd.firebaseapp.com",
  projectId: "cortexai-51ddd",
  storageBucket: "cortexai-51ddd.firebasestorage.app",
  messagingSenderId: "935232499180",
  appId: "1:935232499180:web:15147a6209c7dc0094e4c9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()