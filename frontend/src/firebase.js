// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import the auth service

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "your own",
    authDomain: "nirmaya-health-services.firebaseapp.com",
    projectId: "nirmaya-health-services",
    storageBucket: "nirmaya-health-services.firebasestorage.app",
    messagingSenderId: "your own",
    appId: "your own",
    measurementId: "your own"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
