// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-delivery-9ea9b.firebaseapp.com",
  projectId: "vingo-food-delivery-9ea9b",
  storageBucket: "vingo-food-delivery-9ea9b.firebasestorage.app",
  messagingSenderId: "386931042698",
  appId: "1:386931042698:web:19f849309dbe71fbc9c073"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}