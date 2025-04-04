// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCShl2sjOegtX0UCgwinJlJdLS1VPv1us",
  authDomain: "sharemitra-89df2.firebaseapp.com",
  projectId: "sharemitra-89df2",
  storageBucket: "sharemitra-89df2.firebasestorage.app",
  messagingSenderId: "1071923013127",
  appId: "1:1071923013127:web:18a11a3f87e4f22f66eca2",
  measurementId: "G-KEKYT0VMLE"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { app, auth };
